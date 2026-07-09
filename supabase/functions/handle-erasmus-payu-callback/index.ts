// Browser surl/furl callback for Erasmus PayU payments. Verifies the reverse
// hash, records the outcome and delivers buyer + admin emails, then redirects
// the buyer to the branded success / failure page.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deliverErasmusPurchase } from "../_shared/erasmus-delivery.ts";

async function sha512(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  const siteUrl = Deno.env.get("SITE_URL") || "https://onepercentabroad.com";
  const successUrl = `${siteUrl}/application/erasmus/checkout/success`;
  const failureUrl = `${siteUrl}/application/erasmus/checkout/failure`;

  try {
    const formData = await req.formData();
    const p: Record<string, string> = {};
    for (const [k, v] of formData.entries()) p[k] = v.toString();

    const { mihpayid, status, txnid, amount, productinfo, firstname, email, hash: payuHash } = p;

    const salt = Deno.env.get("PAYU_MERCHANT_SALT");
    const key = Deno.env.get("PAYU_MERCHANT_KEY");
    if (!salt || !key) return Response.redirect(failureUrl, 302);

    // Reverse hash: sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    const expectedHashStr = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = await sha512(expectedHashStr);
    if (expectedHash !== payuHash) {
      console.error("handle-erasmus-payu-callback: hash mismatch for txnid:", txnid);
      return Response.redirect(failureUrl, 302);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: purchase } = await supabase
      .from("erasmus_purchases")
      .select("*")
      .eq("payu_txnid", txnid)
      .single();

    if (!purchase) return Response.redirect(failureUrl, 302);

    const isSuccess = status === "success";

    await supabase
      .from("erasmus_purchases")
      .update({
        payu_mihpayid: mihpayid,
        status: isSuccess ? "completed" : "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("payu_txnid", txnid);

    if (!isSuccess) return Response.redirect(failureUrl, 302);

    await deliverErasmusPurchase(
      supabase,
      { ...purchase, payu_mihpayid: mihpayid },
      { resendKey: Deno.env.get("RESEND_API_KEY") },
    );

    return Response.redirect(successUrl, 302);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("handle-erasmus-payu-callback:", msg);
    return Response.redirect(failureUrl, 302);
  }
});
