// Reconcile PayU payments that never came back through the browser callback.
//
// The browser `surl`/`furl` redirect is best-effort: on mobile UPI, students
// pay inside their UPI app and frequently never return to the browser tab, so
// handle-payu-callback never fires and the purchase is stuck at `pending`
// even though PayU captured the money — and no PDF email is ever sent.
//
// This function (run on a schedule via pg_cron) asks PayU directly, for each
// stuck pending purchase, whether the payment actually succeeded, then marks
// it and delivers the PDFs. Delivery is idempotent, so a payment confirmed by
// both the live callback and this reconciler is only ever emailed once.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sha512, deliverPurchase } from "../_shared/sop-delivery.ts";

// PayU "verify_payment" status values, normalised.
const SUCCESS_STATES = new Set(["success", "captured"]);
const FAILURE_STATES = new Set(["failure", "failed", "usercancelled", "cancelled", "bounced", "dropped"]);

const VERIFY_URL = "https://info.payu.in/merchant/postservice?form=2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

interface PayuTxnDetail {
  status?: string;
  mihpayid?: string;
  amt?: string;
}

async function verifyTxn(
  key: string,
  salt: string,
  txnid: string,
): Promise<PayuTxnDetail | null> {
  const command = "verify_payment";
  const hash = await sha512(`${key}|${command}|${txnid}|${salt}`);
  const form = new URLSearchParams({ key, command, var1: txnid, hash });

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) {
    console.error(`PayU verify HTTP ${res.status} for ${txnid}`);
    return null;
  }
  const data = await res.json().catch(() => null);
  const detail = data?.transaction_details?.[txnid];
  return detail ?? null;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Only the scheduled job (which holds the service-role key) may run this.
    const auth = req.headers.get("Authorization") || "";
    if (auth !== `Bearer ${serviceKey}`) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const key  = Deno.env.get("PAYU_MERCHANT_KEY");
    const salt = Deno.env.get("PAYU_MERCHANT_SALT");
    if (!key || !salt) return json({ success: false, error: "PayU credentials not configured" }, 500);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Undelivered PayU purchases fall into two cases that need *different*
    // time windows, so they are fetched as two separate queries.
    //
    // All windows share a 2-minute lower lip so the live browser callback has
    // had its chance to deliver first (and so we never race a callback that is
    // mid-flight right now).
    const now = Date.now();
    const olderThan      = new Date(now - 2 * 60 * 1000).toISOString();
    const payuVerifyFrom = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
    const emailRetryFrom = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Case 1 — payment outcome still unknown. Resolving it needs a live PayU
    // lookup, so it is bounded to PayU's ~14-day verify_payment retention;
    // older than that, PayU no longer has the txn and we can never confirm it.
    const { data: pendingRows, error: pendingErr } = await supabase
      .from("sop_purchases")
      .select("*")
      .eq("status", "pending")
      .eq("source", "payu")
      .eq("email_sent", false)
      .not("payu_txnid", "is", null)
      .lt("created_at", olderThan)
      .gt("created_at", payuVerifyFrom)
      .order("created_at", { ascending: true })
      .limit(50);
    if (pendingErr) throw pendingErr;

    // Case 2 — payment already confirmed but the buyer email never sent (the
    // live send failed transiently, or the row predates inline delivery). No
    // PayU call is needed, so this is NOT capped to the 14-day verify window —
    // only a 30-day sanity bound so a permanently-undeliverable address (hard
    // bounce) is not retried forever every 2 minutes.
    const { data: unsentRows, error: unsentErr } = await supabase
      .from("sop_purchases")
      .select("*")
      .eq("status", "completed")
      .eq("source", "payu")
      .eq("email_sent", false)
      .lt("created_at", olderThan)
      .gt("created_at", emailRetryFrom)
      .order("created_at", { ascending: true })
      .limit(50);
    if (unsentErr) throw unsentErr;

    const summary = { checked: 0, delivered: 0, failed: 0, stillPending: 0, errors: 0 };

    // Deliver-only rows first (cheap, no PayU), then the verify path.
    for (const purchase of [...(unsentRows ?? []), ...(pendingRows ?? [])]) {
      summary.checked++;

      // Payment already confirmed, only the email failed — deliver straight
      // away without re-querying PayU. deliverPurchase is idempotent.
      if (purchase.status === "completed") {
        const result = await deliverPurchase(
          supabase,
          purchase,
          { resendKey, reconciled: true },
        );
        if (result.delivered) summary.delivered++;
        continue;
      }

      const txnid = purchase.payu_txnid as string;

      let detail: PayuTxnDetail | null;
      try {
        detail = await verifyTxn(key, salt, txnid);
      } catch (e) {
        summary.errors++;
        console.error(`verify failed for ${txnid}:`, e instanceof Error ? e.message : e);
        continue;
      }

      const state = (detail?.status || "").toLowerCase();

      if (SUCCESS_STATES.has(state)) {
        const mihpayid = detail?.mihpayid ?? null;
        await supabase.from("sop_purchases")
          .update({ status: "completed", payu_mihpayid: mihpayid })
          .eq("id", purchase.id);
        await supabase.from("sop_events").insert({
          purchase_id: purchase.id,
          email: purchase.email,
          event_type: "payment_success",
          detail: { txnid, mihpayid, amt: detail?.amt, status: state, reconciled: true },
        });

        const result = await deliverPurchase(
          supabase,
          { ...purchase, status: "completed", payu_mihpayid: mihpayid },
          { resendKey, reconciled: true },
        );
        if (result.delivered) summary.delivered++;
      } else if (FAILURE_STATES.has(state)) {
        await supabase.from("sop_purchases").update({ status: "failed" }).eq("id", purchase.id);
        await supabase.from("sop_events").insert({
          purchase_id: purchase.id,
          email: purchase.email,
          event_type: "payment_failed",
          detail: { txnid, status: state, reconciled: true },
        });
        summary.failed++;
      } else {
        // Still pending / unknown at PayU — leave it for a later run.
        summary.stillPending++;
      }
    }

    return json({ success: true, ...summary });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("reconcile-payu-payments:", msg);
    return json({ success: false, error: msg }, 500);
  }
});
