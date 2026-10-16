// Shared "a Razorpay payment for this order is captured" handling, used by the
// checkout handler (verify-razorpay-payment), the webhook (razorpay-webhook)
// and the reconciler. Marks the purchase completed, logs the event and
// delivers the PDFs through the idempotent deliverPurchase().

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deliverPurchase, razorpayAuthHeader } from "./sop-delivery.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export async function completeRazorpayPurchase(
  supabase: SupabaseClient,
  orderId: string,
  paymentId: string,
  via: "checkout" | "webhook" | "reconciler",
): Promise<{ found: boolean; delivered: boolean; error?: string }> {
  const { data: purchase } = await supabase
    .from("sop_purchases")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (!purchase) return { found: false, delivered: false };

  if (purchase.status !== "completed") {
    await supabase.from("sop_purchases").update({
      status: "completed",
      razorpay_payment_id: paymentId,
    }).eq("id", purchase.id);
    await supabase.from("sop_events").insert({
      purchase_id: purchase.id,
      email: purchase.email,
      event_type: "payment_success",
      detail: { order_id: orderId, payment_id: paymentId, gateway: "razorpay", via, reconciled: via === "reconciler" },
    });
  }

  const result = await deliverPurchase(
    supabase,
    { ...purchase, status: "completed", razorpay_payment_id: paymentId },
    { resendKey: Deno.env.get("RESEND_API_KEY"), reconciled: via === "reconciler" },
  );
  return { found: true, delivered: result.delivered, error: result.error };
}

export async function markRazorpayPurchaseFailed(
  supabase: SupabaseClient,
  orderId: string,
  detail: Record<string, unknown>,
): Promise<void> {
  const { data: purchase } = await supabase
    .from("sop_purchases")
    .select("id, email, status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  // A failed attempt never overrides a completed order: Razorpay lets the
  // buyer retry inside the same checkout, so a failure can precede a success.
  if (!purchase || purchase.status !== "pending") return;
  await supabase.from("sop_events").insert({
    purchase_id: purchase.id,
    email: purchase.email,
    event_type: "payment_failed",
    detail: { order_id: orderId, gateway: "razorpay", ...detail },
  });
}

/** Ask Razorpay for a captured payment on this order, if any. */
export async function findCapturedPayment(orderId: string): Promise<string | null> {
  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
    headers: { Authorization: razorpayAuthHeader() },
  });
  if (!res.ok) throw new Error(`Razorpay HTTP ${res.status} for ${orderId}`);
  const data = await res.json();
  const captured = (data?.items ?? []).find((p: { status?: string }) => p.status === "captured");
  return captured?.id ?? null;
}
