// Razorpay server-to-server webhook for the SOP Vault.
//
// The checkout handler (verify-razorpay-payment) only runs if the buyer's
// browser survives the payment — on mobile UPI students often pay in their UPI
// app and never come back. Razorpay calls this endpoint itself the moment a
// payment is captured, so delivery does not depend on the browser.
//
// Subscribe in the Razorpay dashboard to: payment.captured, order.paid,
// payment.failed. Delivery is idempotent, so a payment confirmed by both this
// webhook and the checkout handler is emailed exactly once.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmacSha256Hex, safeEqual } from "../_shared/sop-delivery.ts";
import { completeRazorpayPurchase, markRazorpayPurchaseFailed } from "../_shared/sop-razorpay.ts";

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain" } });

serve(async (req) => {
  try {
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!secret) {
      console.error("razorpay-webhook: RAZORPAY_WEBHOOK_SECRET not configured");
      return text("Server not configured", 500);
    }

    // The signature covers the raw body, so read it before parsing.
    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const expected = await hmacSha256Hex(secret, raw);
    if (!safeEqual(expected, signature)) {
      console.error("razorpay-webhook: signature mismatch");
      return text("Invalid signature", 400);
    }

    const event = JSON.parse(raw);
    const payment = event?.payload?.payment?.entity;
    const orderId: string | undefined = payment?.order_id ?? event?.payload?.order?.entity?.id;
    if (!orderId) return text("OK (no order)", 200);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (event.event === "payment.captured" || event.event === "order.paid") {
      if (!payment?.id) return text("OK (no payment)", 200);
      const result = await completeRazorpayPurchase(supabase, orderId, payment.id, "webhook");
      // Unknown orders (other products on the same Razorpay account) are
      // acked with 200 so Razorpay does not retry them forever.
      if (!result.found) console.warn("razorpay-webhook: no purchase for order", orderId);
      return text("OK", 200);
    }

    if (event.event === "payment.failed") {
      await markRazorpayPurchaseFailed(supabase, orderId, {
        payment_id: payment?.id,
        reason: payment?.error_description ?? payment?.error_reason ?? null,
        via: "webhook",
      });
      return text("OK", 200);
    }

    return text("OK (ignored)", 200);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("razorpay-webhook:", msg);
    // 500 lets Razorpay retry on a transient failure on our side.
    return text("Internal error", 500);
  }
});
