import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOP_NAMES: Record<number, { univ: string; prog: string }> = {
  1:  { univ: "Hertie School",                       prog: "MA Public Policy" },
  2:  { univ: "Johns Hopkins University",             prog: "MA Public Policy (SAIS)" },
  3:  { univ: "Erasmus Mundus (EMJM)",               prog: "Erasmus Mundus Joint Master" },
  4:  { univ: "NMBU",                                 prog: "MSc Agroecology" },
  5:  { univ: "Europubhealth+",                       prog: "European Public Health Master" },
  6:  { univ: "University of Pisa",                   prog: "MSc AI Data Engineering" },
  7:  { univ: "Central European University",          prog: "MA Public Policy" },
  8:  { univ: "University of Glasgow",                prog: "MSc Data Science" },
  9:  { univ: "Keele University",                     prog: "MSc Environmental & Green Technology" },
  10: { univ: "University of Freiburg",               prog: "MSc Global Urban Health" },
  11: { univ: "University of Leeds",                  prog: "MSc Sustainable Cities" },
  12: { univ: "University of Glasgow",                prog: "MSc International Journalism" },
  13: { univ: "University of Sussex",                 prog: "MA Development Studies" },
  14: { univ: "ACES-STAR",                            prog: "MSc Aquaculture, Environment and Society" },
  15: { univ: "University of Sheffield",              prog: "MPH Public Health" },
};

const ALL_SOP_IDS = Object.keys(SOP_NAMES).map(Number).sort((a, b) => a - b);

function buildBuyerEmail(firstname: string | null, planLabel: string, links: { name: string; url: string }[]) {
  const linksHtml =
    links.length > 0
      ? links.map(({ name, url }) => `
        <a href="${url}" style="display:block;background:#040B2B;color:#ffffff;padding:18px 22px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 10px;letter-spacing:0.01em;font-family:-apple-system,sans-serif;">Download ${name} &nbsp;&rarr;</a>`).join("")
      : `<div style="padding:16px 18px;background:#EEF4FF;border:1px solid rgba(4,11,43,0.08);border-radius:10px;color:#6B7A99;font-size:13px;line-height:1.6;">Your files are being prepared. You will receive a follow-up email within 24 hours.</div>`;

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:32px 16px;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#040B2B;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(4,11,43,0.06);">
    <div style="background:#040B2B;padding:32px 36px 28px;">
      <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">OnePercent Abroad</div>
      <div style="font-size:11px;color:#61A2FE;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:22px;">Your SOP Vault</div>
    </div>
    <div style="padding:32px 36px 36px;">
      <p style="font-size:15px;line-height:1.7;color:#040B2B;margin:0 0 6px;font-weight:500;">Hi ${firstname || "there"},</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 24px;">Your ${planLabel} is ready. The link${links.length > 1 ? "s" : ""} below expire${links.length > 1 ? "" : "s"} in <strong style="color:#040B2B;">7 days</strong> — please save the file${links.length > 1 ? "s" : ""} to your device now.</p>
      ${linksHtml}
      <p style="font-size:13px;line-height:1.7;color:#6B7A99;margin:28px 0 0;">Need help? Email <a href="mailto:sreejith@onepercentabroad.com" style="color:#065DC7;text-decoration:none;font-weight:500;">sreejith@onepercentabroad.com</a> and we'll sort it out.</p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(4,11,43,0.08);font-size:12px;color:#6B7A99;">
        <div style="font-weight:600;color:#040B2B;margin-bottom:4px;">OnePercent Abroad</div>
        <a href="https://onepercentabroad.com" style="color:#065DC7;text-decoration:none;">onepercentabroad.com</a>
      </div>
    </div>
  </div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // --- Admin auth guard ---
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ success: false, error: "Missing authorization" }, 401);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) return json({ success: false, error: "Invalid session" }, 401);

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ success: false, error: "Admin role required" }, 403);

    // --- Input ---
    const body = await req.json();
    const email: string = (body.email || "").trim();
    const firstname: string | null = body.firstname?.trim() || null;
    const purchaseId: string | null = body.purchase_id || null;
    let sopIds: number[] = Array.isArray(body.selected_sop_ids) && body.selected_sop_ids.length > 0
      ? body.selected_sop_ids.map(Number).filter((n: number) => SOP_NAMES[n])
      : ALL_SOP_IDS;

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ success: false, error: "A valid email is required" }, 400);
    }
    if (sopIds.length === 0) sopIds = ALL_SOP_IDS;

    const planLabel =
      sopIds.length === ALL_SOP_IDS.length ? "Full Vault" :
      sopIds.length > 1 ? "Selected SOPs" : "Single SOP";
    const plan = sopIds.length === ALL_SOP_IDS.length ? "full" : sopIds.length > 1 ? "bundle" : "single";

    // --- Resolve the target purchase row (resend to existing, or create a manual record) ---
    let targetId = purchaseId;
    if (!targetId) {
      const { data: created, error: createErr } = await supabase
        .from("sop_purchases")
        .insert({
          email,
          firstname,
          plan,
          selected_sop_ids: sopIds,
          amount: 0,
          status: "completed",
          source: "manual",
        })
        .select("id")
        .single();
      if (createErr) throw createErr;
      targetId = created.id;
    }

    await supabase.from("sop_events").insert({
      purchase_id: targetId,
      email,
      event_type: "manual_resend",
      detail: { sent_by: userData.user.email, selected_sop_ids: sopIds, plan },
    });

    // --- Generate signed download links (7-day expiry) ---
    const expiresIn = 7 * 24 * 3600;
    const links: { name: string; url: string }[] = [];
    for (const sopId of sopIds) {
      const info = SOP_NAMES[sopId];
      const friendlyName = info ? `${info.univ} - ${info.prog}` : `SOP ${sopId}`;
      const { data } = await supabase.storage
        .from("sop-pdfs")
        .createSignedUrl(`individual/sop-${sopId}.pdf`, expiresIn, { download: `${friendlyName}.pdf` });
      if (data) {
        links.push({ name: info ? `${info.univ} — ${info.prog}` : `SOP ${sopId}`, url: data.signedUrl });
      }
    }

    // --- Send via Resend ---
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      await supabase.from("sop_purchases").update({ email_sent: false, email_error: "RESEND_API_KEY not configured" }).eq("id", targetId);
      await supabase.from("sop_events").insert({ purchase_id: targetId, email, event_type: "email_failed", detail: { error: "RESEND_API_KEY not configured" } });
      return json({ success: false, error: "RESEND_API_KEY not configured", purchase_id: targetId }, 500);
    }

    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "OnePercent Abroad <noreply@notify.onepercentabroad.com>",
        to: email,
        subject: `Your ${planLabel} is ready — OnePercent Abroad`,
        html: buildBuyerEmail(firstname, planLabel, links),
      }),
    });
    const sendBody = await sendRes.json().catch(() => ({}));

    if (sendRes.ok) {
      await supabase.from("sop_purchases").update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        email_error: null,
        resend_message_id: sendBody?.id ?? null,
      }).eq("id", targetId);
      await supabase.from("sop_events").insert({
        purchase_id: targetId,
        email,
        event_type: "email_sent",
        detail: { to: email, resend_id: sendBody?.id ?? null, links_count: links.length, manual: true },
      });
      return json({ success: true, purchase_id: targetId, links_count: links.length });
    }

    const errMsg = sendBody?.message || `Resend HTTP ${sendRes.status}`;
    await supabase.from("sop_purchases").update({ email_sent: false, email_error: errMsg }).eq("id", targetId);
    await supabase.from("sop_events").insert({
      purchase_id: targetId,
      email,
      event_type: "email_failed",
      detail: { to: email, status: sendRes.status, error: errMsg, manual: true },
    });
    return json({ success: false, error: errMsg, purchase_id: targetId }, 502);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-sop-email:", msg);
    return json({ success: false, error: msg }, 500);
  }
});
