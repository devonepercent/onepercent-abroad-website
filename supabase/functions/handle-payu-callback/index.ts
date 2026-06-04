import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sha512, deliverPurchase } from "../_shared/sop-delivery.ts";

serve(async (req) => {
  const siteUrl = Deno.env.get("SITE_URL") || "https://onepercentabroad.com";
  const successUrl = `${siteUrl}/product/sop-vault/success`;
  const failureUrl = `${siteUrl}/product/sop-vault/success?status=failed`;

  try {
    const formData = await req.formData();
    const p: Record<string, string> = {};
    for (const [k, v] of formData.entries()) p[k] = v.toString();

    const { mihpayid, status, txnid, amount, productinfo, firstname, email, hash: payuHash } = p;

    const salt = Deno.env.get("PAYU_MERCHANT_SALT");
    const key  = Deno.env.get("PAYU_MERCHANT_KEY");
    if (!salt || !key) return Response.redirect(failureUrl, 302);

    // Verify response hash: sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    const expectedHashStr = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = await sha512(expectedHashStr);
    if (expectedHash !== payuHash) {
      console.error("PayU hash mismatch for txnid:", txnid);
      return Response.redirect(failureUrl, 302);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchase } = await supabase
      .from("sop_purchases")
      .select("*")
      .eq("payu_txnid", txnid)
      .single();

    if (!purchase) return Response.redirect(failureUrl, 302);

    const isSuccess = status === "success";

    await supabase.from("sop_purchases").update({
      payu_mihpayid: mihpayid,
      status: isSuccess ? "completed" : "failed",
    }).eq("payu_txnid", txnid);

    // Lifecycle log: payment outcome reported by PayU.
    await supabase.from("sop_events").insert({
      purchase_id: purchase.id,
      email: purchase.email,
      event_type: isSuccess ? "payment_success" : "payment_failed",
      detail: { mihpayid, txnid, amount, status },
    });

    if (!isSuccess) return Response.redirect(failureUrl, 302);

    // Deliver via the shared path (buyer email + admin notification).
    // Idempotent: if the reconciler already delivered this txn, it no-ops.
    await deliverPurchase(
      supabase,
      { ...purchase, payu_mihpayid: mihpayid },
      { resendKey: Deno.env.get("RESEND_API_KEY") },
    );

    return Response.redirect(successUrl, 302);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("handle-payu-callback:", msg);
    return Response.redirect(failureUrl, 302);
  }
});
