// PayU server-to-server (S2S) webhook.
//
// Unlike the browser `surl`/`furl` redirect (handle-payu-callback), which only
// fires if the buyer returns to the browser tab after paying, this endpoint is
// called by PayU's own servers the moment a payment is finalised — regardless
// of whether the buyer ever lands on the success page. It is the push-based
// guarantee behind "payment confirmed at PayU => delivery email sent".
//
// PayU sends the payment webhook as the SAME form-encoded payload, with the
// SAME reverse hash, as the surl/furl response — so verification here is
// identical to handle-payu-callback (a formula already proven against 15+ live
// payments). The only differences are: we never redirect (PayU just needs a
// 2xx), and we tag events `via: "webhook"` for traceability.
//
// Delivery goes through the shared, idempotent deliverPurchase(): if the live
// browser callback or the reconciler already delivered this txn, this no-ops,
// so the buyer is emailed exactly once no matter how many paths confirm it.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sha512, deliverPurchase } from "../_shared/sop-delivery.ts";
import { deliverErasmusPurchase } from "../_shared/erasmus-delivery.ts";

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain" } });

serve(async (req) => {
  try {
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const formData = await req.formData();
    const p: Record<string, string> = {};
    for (const [k, v] of formData.entries()) p[k] = v.toString();

    const { mihpayid, status, txnid, amount, productinfo, firstname, email, hash: payuHash } = p;

    if (!txnid) return text("Missing txnid", 400);

    const salt = Deno.env.get("PAYU_MERCHANT_SALT");
    const key  = Deno.env.get("PAYU_MERCHANT_KEY");
    if (!salt || !key) {
      console.error("payu-webhook: PayU credentials not configured");
      return text("Server not configured", 500);
    }

    // Reverse hash: sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    // (11 empty udf slots) — identical to the proven surl/furl verification.
    const expectedHashStr = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = await sha512(expectedHashStr);
    if (expectedHash !== payuHash) {
      console.error("payu-webhook: hash mismatch for txnid:", txnid);
      // Not a genuine PayU payload — reject (and stop PayU retrying a bad sig).
      return text("Invalid hash", 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: purchase } = await supabase
      .from("sop_purchases")
      .select("*")
      .eq("payu_txnid", txnid)
      .single();

    // Not an SOP txn — this webhook receives every merchant transaction, so
    // check the Erasmus purchases before giving up.
    if (!purchase) {
      const { data: erasmus } = await supabase
        .from("erasmus_purchases")
        .select("*")
        .eq("payu_txnid", txnid)
        .single();

      // Ack unknown txns with a 200 so PayU does not retry forever; we simply
      // have no purchase row to deliver against.
      if (!erasmus) {
        console.warn("payu-webhook: no purchase for txnid:", txnid);
        return text("OK (no matching purchase)", 200);
      }

      const erasmusSuccess = status === "success";
      await supabase
        .from("erasmus_purchases")
        .update({
          payu_mihpayid: mihpayid,
          status: erasmusSuccess ? "completed" : "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("payu_txnid", txnid);

      if (!erasmusSuccess) return text("OK", 200);

      await deliverErasmusPurchase(
        supabase,
        { ...erasmus, payu_mihpayid: mihpayid },
        { resendKey: Deno.env.get("RESEND_API_KEY") },
      );
      return text("OK", 200);
    }

    const isSuccess = status === "success";

    await supabase.from("sop_purchases").update({
      payu_mihpayid: mihpayid,
      status: isSuccess ? "completed" : "failed",
    }).eq("payu_txnid", txnid);

    await supabase.from("sop_events").insert({
      purchase_id: purchase.id,
      email: purchase.email,
      event_type: isSuccess ? "payment_success" : "payment_failed",
      detail: { mihpayid, txnid, amount, status, via: "webhook" },
    });

    if (!isSuccess) return text("OK", 200);

    // Deliver via the shared, idempotent path (buyer email + admin notice).
    await deliverPurchase(
      supabase,
      { ...purchase, payu_mihpayid: mihpayid },
      { resendKey: Deno.env.get("RESEND_API_KEY") },
    );

    return text("OK", 200);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("payu-webhook:", msg);
    // 500 lets PayU retry on a transient failure on our side.
    return text("Internal error", 500);
  }
});
