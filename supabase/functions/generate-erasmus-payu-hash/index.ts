// Initiates an Erasmus application checkout: validates the cart server-side,
// creates a pending erasmus_purchases row and returns signed PayU form fields.
// The amount is ALWAYS computed here (items × PRICE) — never trusted from the client.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE = 9900; // flat fee per application, INR
const MAX_ITEMS = 10;

async function sha512(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, email, phone, items } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ success: false, error: "Invalid email" }, 400);
    }
    const cleanPhone = String(phone ?? "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return json({ success: false, error: "Invalid phone number" }, 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return json({ success: false, error: "Cart is empty" }, 400);
    }

    // Dedupe by id, keep only the fields we store, cap the count.
    const seen = new Set<string>();
    const cleanItems = items
      .filter((i) => i && typeof i.id === "string" && typeof i.code === "string")
      .filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
      .slice(0, MAX_ITEMS)
      .map((i) => ({
        id: String(i.id).slice(0, 64),
        code: String(i.code).slice(0, 64),
        name: String(i.name ?? "").slice(0, 160),
        category: String(i.category ?? "").slice(0, 120),
      }));
    if (cleanItems.length === 0) {
      return json({ success: false, error: "Cart is empty" }, 400);
    }

    const key = Deno.env.get("PAYU_MERCHANT_KEY");
    const salt = Deno.env.get("PAYU_MERCHANT_SALT");
    if (!key || !salt) throw new Error("PayU credentials not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const numItems = cleanItems.length;
    const amount = numItems * PRICE; // server-side price — client value ignored
    const amountStr = amount.toFixed(2);

    const txnid = `erz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const productinfo = `Erasmus Application Filing x ${numItems}`;
    const firstname =
      (String(name ?? "").replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 40)) ||
      (email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)) ||
      "Student";

    // PayU request hash: sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
    const hashStr = `${key}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = await sha512(hashStr);

    const { error: insertError } = await supabase.from("erasmus_purchases").insert({
      name: String(name ?? "").slice(0, 120) || null,
      email,
      phone: cleanPhone,
      items: cleanItems,
      num_items: numItems,
      amount,
      payu_txnid: txnid,
      status: "pending",
      source: "payu",
    });
    if (insertError) throw insertError;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callbackUrl = `${supabaseUrl}/functions/v1/handle-erasmus-payu-callback`;

    return json({
      success: true,
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone: cleanPhone,
      surl: callbackUrl,
      furl: callbackUrl,
      hash,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("generate-erasmus-payu-hash:", msg);
    return json({ success: false, error: msg }, 500);
  }
});
