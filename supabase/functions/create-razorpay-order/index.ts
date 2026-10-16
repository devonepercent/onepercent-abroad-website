// Creates a Razorpay order for an SOP Vault purchase and records it as a
// pending sop_purchases row. The browser then opens Razorpay Checkout with the
// returned order_id; confirmation arrives via verify-razorpay-payment (the
// checkout handler) and razorpay-webhook (server to server).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { razorpayAuthHeader } from "../_shared/sop-delivery.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The price is fixed server-side so the browser cannot choose what it pays.
// Keep in sync with PRICE in src/pages/SopVault.tsx.
const PLAN_PRICES: Record<string, number> = { full: 199 };

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
    const { email, phone, plan = "full" } = await req.json();

    const cleanEmail = String(email ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Please enter a valid email address");
    const cleanPhone = String(phone ?? "").replace(/\D/g, "");
    if (cleanPhone.length < 10) throw new Error("Please enter a valid 10-digit phone number");

    const amount = PLAN_PRICES[plan];
    if (!amount) throw new Error("Unknown plan");

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    if (!keyId) throw new Error("Razorpay credentials not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const firstname =
      (cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)) || "Student";
    const productinfo = "Full Vault — All 15 SOPs";
    const receipt = `sop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: razorpayAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount * 100, // paise
        currency: "INR",
        receipt,
        notes: { product: "sop-vault", plan, email: cleanEmail },
      }),
    });
    const order = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok || !order?.id) {
      console.error("create-razorpay-order: Razorpay error", orderRes.status, JSON.stringify(order));
      throw new Error(order?.error?.description || "Could not start the payment. Please try again.");
    }

    const { data: inserted, error: insertError } = await supabase
      .from("sop_purchases")
      .insert({
        email: cleanEmail,
        phone: cleanPhone,
        firstname,
        plan,
        selected_sop_ids: [],
        razorpay_order_id: order.id,
        amount,
        status: "pending",
        source: "razorpay",
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    // Lifecycle log: buyer clicked Pay and a checkout was initiated.
    await supabase.from("sop_events").insert({
      purchase_id: inserted?.id ?? null,
      email: cleanEmail,
      event_type: "checkout_initiated",
      detail: { plan, amount, order_id: order.id, receipt, productinfo, gateway: "razorpay" },
    });

    return json({
      success: true,
      key: keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      email: cleanEmail,
      phone: cleanPhone,
      name: firstname,
      description: productinfo,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error
      ? error.message
      : (error !== null && typeof error === "object" && "message" in error)
        ? String((error as Record<string, unknown>).message)
        : JSON.stringify(error);
    console.error("create-razorpay-order:", msg);
    return json({ success: false, error: msg }, 500);
  }
});
