// Called by the SOP Vault page from Razorpay Checkout's success handler.
// Verifies the payment signature, confirms the payment is captured, then marks
// the purchase completed and emails the PDFs.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmacSha256Hex, safeEqual, razorpayAuthHeader } from "../_shared/sop-delivery.ts";
import { completeRazorpayPurchase } from "../_shared/sop-razorpay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ success: false, error: "Missing payment details" }, 400);
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) return json({ success: false, error: "Razorpay credentials not configured" }, 500);

    // Checkout signature: hmac_sha256(order_id|payment_id, key_secret)
    const expected = await hmacSha256Hex(keySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (!safeEqual(expected, String(razorpay_signature))) {
      console.error("verify-razorpay-payment: signature mismatch for order", razorpay_order_id);
      return json({ success: false, error: "Payment verification failed" }, 400);
    }

    // A valid signature means the payment was authorised. Make sure it is
    // captured before delivering (auto-capture is normally on; capture here if
    // the account has it off).
    const auth = razorpayAuthHeader();
    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { Authorization: auth },
    });
    const payment = await payRes.json().catch(() => ({}));
    if (!payRes.ok) throw new Error(`Razorpay payment lookup failed (HTTP ${payRes.status})`);
    if (payment.order_id !== razorpay_order_id) {
      return json({ success: false, error: "Payment does not match order" }, 400);
    }
    if (payment.status === "authorized") {
      const capRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}/capture`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payment.amount, currency: payment.currency }),
      });
      if (!capRes.ok) throw new Error(`Razorpay capture failed (HTTP ${capRes.status})`);
    } else if (payment.status !== "captured") {
      return json({ success: false, error: `Payment is ${payment.status}` }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const result = await completeRazorpayPurchase(supabase, razorpay_order_id, razorpay_payment_id, "checkout");
    if (!result.found) return json({ success: false, error: "Order not found" }, 404);

    // Payment is confirmed even if the email hit a transient error — the
    // reconciler retries delivery, so the buyer still lands on success.
    return json({ success: true, email_sent: result.delivered });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("verify-razorpay-payment:", msg);
    return json({ success: false, error: msg }, 500);
  }
});
