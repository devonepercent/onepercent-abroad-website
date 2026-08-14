// One-off invite blast: asks newsletter subscribers to register for the
// current webinar.
//
// Invoked server-side with the service-role key (same as the webinar emails),
// normally as a single manual pg_net call:
//   { }                    -> send for real
//   { "dry_run": true }    -> report who would be mailed, send nothing
//
// Every send stamps newsletter_subscribers.webinar_invite_sent_at, so a retry
// or a double invocation never mails the same person twice.
//
// Anyone who has already registered for WEBINAR_NAME is skipped — telling
// someone to register for a thing they registered for reads as a mistake.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBINAR_NAME = "Commonwealth Scholarship Webinar (14 August 2026)";
const WEBINAR_TITLE = "Commonwealth Scholarship";
const WEBINAR_WHEN = "Tonight, Friday 14 August, 7:00 PM IST";
const REGISTER_URL = "https://onepercentabroad.com/webinar";

const FROM = "OnePercent Abroad <noreply@notify.onepercentabroad.com>";
const RESEND_BATCH_SIZE = 100;

const AGENDA = [
  "What the Commonwealth Scholarship actually covers",
  "Who is eligible, and the quiet disqualifiers most applicants miss",
  "How the application works, and where applications fall apart",
  "What can make your profile stronger this cycle",
  "Live Q&A",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Subscriber {
  id: string;
  name: string | null;
  email: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const firstName = (name: string | null) => (name || "").trim().split(/\s+/)[0] || "there";

function inviteEmail(name: string | null): { subject: string; html: string } {
  const agendaHtml = AGENDA.map(
    (item) =>
      `<tr><td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#6B7A99;">&bull;&nbsp;&nbsp;${item}</td></tr>`,
  ).join("");

  const inner = `
      <p style="font-size:15px;line-height:1.7;color:#040B2B;margin:0 0 6px;font-weight:500;">Hi ${escapeHtml(firstName(name))},</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 22px;">We're going live tonight with a free session on the <strong style="color:#040B2B;">${WEBINAR_TITLE}</strong> — a fully funded route to a UK master's that most people rule themselves out of before they understand how it works.</p>
      <div style="padding:18px 20px;background:#EEF4FF;border:1px solid rgba(4,11,43,0.08);border-radius:10px;margin:0 0 22px;">
        <div style="font-size:13px;color:#6B7A99;line-height:1.9;">
          <div><strong style="color:#040B2B;">When:</strong> ${WEBINAR_WHEN}</div>
          <div><strong style="color:#040B2B;">Where:</strong> Online, on Google Meet</div>
          <div><strong style="color:#040B2B;">Cost:</strong> Free</div>
        </div>
      </div>
      <a href="${REGISTER_URL}" style="display:block;background:#040B2B;color:#ffffff;padding:18px 22px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 24px;letter-spacing:0.01em;font-family:-apple-system,sans-serif;">Register free &nbsp;&rarr;</a>
      <p style="font-size:14px;font-weight:600;color:#040B2B;margin:0 0 10px;">What we'll cover</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">${agendaHtml}</table>
      <p style="font-size:13px;line-height:1.7;color:#6B7A99;margin:0 0 6px;">Register and the joining link is emailed to you straight away, along with a reminder an hour before we start.</p>
      <p style="font-size:13px;line-height:1.7;color:#6B7A99;margin:0;">If the button doesn't open, use this link:<br /><a href="${REGISTER_URL}" style="color:#065DC7;word-break:break-all;">${REGISTER_URL}</a></p>`;

  return {
    subject: `Tonight, 7 PM IST: the ${WEBINAR_TITLE}, explained properly`,
    html: `<!DOCTYPE html>
<html><body style="margin:0;padding:32px 16px;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#040B2B;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(4,11,43,0.06);">
    <div style="background:#040B2B;padding:32px 36px 28px;">
      <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">OnePercent Abroad</div>
      <div style="font-size:11px;color:#61A2FE;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:22px;">Live tonight</div>
    </div>
    <div style="padding:32px 36px 36px;">
      ${inner}
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(4,11,43,0.08);font-size:12px;color:#6B7A99;">
        <div style="font-weight:600;color:#040B2B;margin-bottom:4px;">OnePercent Abroad</div>
        <a href="https://onepercentabroad.com" style="color:#065DC7;text-decoration:none;">onepercentabroad.com</a>
      </div>
    </div>
  </div>
</body></html>`,
  };
}

async function sendBatch(
  resendKey: string,
  messages: { to: string; subject: string; html: string }[],
): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify(messages.map((m) => ({ from: FROM, ...m }))),
  });
  if (!res.ok) {
    console.error("send-newsletter-invite: resend error", res.status, await res.text());
    return false;
  }
  return true;
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
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader.replace(/^Bearer\s+/i, "").trim() !== serviceKey) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    if (!resendKey && !dryRun) {
      console.error("send-newsletter-invite: RESEND_API_KEY missing — nothing sent");
      return json({ success: false, error: "RESEND_API_KEY not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: subs, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, name, email")
      .is("webinar_invite_sent_at", null);
    if (error) throw error;

    // Already-registered subscribers are dropped: asking them to register again
    // would look like we lost their signup.
    const { data: regs, error: regError } = await supabase
      .from("webinar_registrations")
      .select("email")
      .eq("webinar_name", WEBINAR_NAME);
    if (regError) throw regError;

    const registered = new Set(
      (regs || []).map((r: { email: string }) => r.email.trim().toLowerCase()),
    );

    // One mail per address; duplicate rows still get stamped together so they
    // don't come back on a later run.
    const byEmail = new Map<string, Subscriber[]>();
    for (const row of (subs || []) as Subscriber[]) {
      const key = (row.email || "").trim().toLowerCase();
      if (!key || registered.has(key)) continue;
      const bucket = byEmail.get(key);
      if (bucket) bucket.push(row);
      else byEmail.set(key, [row]);
    }

    const recipients = [...byEmail.entries()].map(([email, group]) => ({ email, group }));

    if (dryRun) {
      return json({
        success: true,
        dry_run: true,
        would_send: recipients.length,
        skipped_already_registered: (subs || []).length - recipients.length,
        sample: recipients.slice(0, 5).map((r) => r.email),
      });
    }

    if (recipients.length === 0) return json({ success: true, sent: 0, note: "nothing to send" });

    const sentIds: string[] = [];
    let failed = 0;

    for (let i = 0; i < recipients.length; i += RESEND_BATCH_SIZE) {
      const chunk = recipients.slice(i, i + RESEND_BATCH_SIZE);
      const messages = chunk.map(({ email, group }) => {
        const { subject, html } = inviteEmail(group[0].name);
        return { to: email, subject, html };
      });

      const ok = await sendBatch(resendKey!, messages);
      if (ok) chunk.forEach(({ group }) => group.forEach((r) => sentIds.push(r.id)));
      else failed += chunk.length;
    }

    if (sentIds.length > 0) {
      const { error: stampError } = await supabase
        .from("newsletter_subscribers")
        .update({ webinar_invite_sent_at: new Date().toISOString() })
        .in("id", sentIds);
      // Worth shouting about: unstamped rows would be mailed again on a re-run.
      if (stampError) console.error("send-newsletter-invite: stamp failed", stampError);
    }

    console.log(`send-newsletter-invite: sent=${sentIds.length} failed=${failed}`);
    return json({ success: failed === 0, sent: sentIds.length, failed });
  } catch (err) {
    console.error("send-newsletter-invite error:", err);
    return json({ success: false, error: String(err) }, 500);
  }
});
