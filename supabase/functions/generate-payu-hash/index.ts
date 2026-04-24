import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha512(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, plan, selected_sop_ids, amount } = await req.json();

    const key = Deno.env.get("PAYU_MERCHANT_KEY");
    const salt = Deno.env.get("PAYU_MERCHANT_SALT");
    if (!key || !salt) throw new Error("PayU credentials not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const txnid = `sop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const amountStr = Number(amount).toFixed(2);
    const productinfo =
      plan === "full"   ? "Full Vault — All 15 SOPs" :
      plan === "bundle" ? "Starter Bundle — 5 SOPs"  :
                          "Single SOP — 1% Admit Vault";
    const firstname =
      (email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)) || "Student";

    // PayU hash: sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
    const hashStr = `${key}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = await sha512(hashStr);

    const { error: insertError } = await supabase.from("sop_purchases").insert({
      email,
      phone,
      firstname,
      plan,
      selected_sop_ids: selected_sop_ids ?? [],
      payu_txnid: txnid,
      amount: Number(amount),
      status: "pending",
    });
    if (insertError) throw insertError;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callbackUrl = `${supabaseUrl}/functions/v1/handle-payu-callback`;

    return new Response(
      JSON.stringify({
        success: true,
        key,
        txnid,
        amount: amountStr,
        productinfo,
        firstname,
        email,
        phone,
        surl: callbackUrl,
        furl: callbackUrl,
        hash,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("generate-payu-hash:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
