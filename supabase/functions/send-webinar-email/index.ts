// Webinar emails: registration confirmation + pre-session reminders.
//
// Called two ways, both server-side with the service-role key:
//   1. AFTER INSERT trigger on webinar_registrations (pg_net)
//        { mode: "confirmation", registration_id: "<uuid>" }
//   2. pg_cron jobs before the session starts
//        { mode: "reminder", kind: "hour" | "start" }
//
// Every send is stamped on the row, so re-runs (cron retry, trigger replay)
// never double-mail the same person.
//
// ── Per-webinar config ────────────────────────────────────────────────────
// WEBINAR_NAME must match the string the /webinar page writes to
// webinar_registrations.webinar_name, or the reminders find nobody.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBINAR_NAME = "Study in Australia Webinar (28 August 2026)";
const WEBINAR_TITLE = "Study in Australia";
const WEBINAR_WHEN = "Friday, 28 August 2026 at 7:00 PM IST";
// Overridable without a redeploy: supabase secrets set WEBINAR_JOIN_URL=...
const JOIN_URL = Deno.env.get("WEBINAR_JOIN_URL") || "https://meet.google.com/bba-tewz-jpq";
// UTC instants for the calendar link (7:00-8:00 PM IST = 13:30-14:30 UTC).
const CAL_START = "20260828T133000Z";
const CAL_END = "20260828T143000Z";

const FROM = "OnePercent Abroad <noreply@notify.onepercentabroad.com>";
const RESEND_BATCH_SIZE = 100;

const AGENDA = [
  "Your study options in Australia",
  "How the student visa works",
  "What it actually costs",
  "Post-study work and what comes after",
  "Live Q&A",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Kind = "confirmation" | "hour" | "start";

const SENT_COLUMN: Record<Kind, string> = {
  confirmation: "confirmation_sent_at",
  hour: "reminder_1h_sent_at",
  start: "reminder_start_sent_at",
};

interface Registration {
  id: string;
  name: string;
  email: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const firstName = (name: string) => (name || "").trim().split(/\s+/)[0] || "there";

const calendarUrl = () => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${WEBINAR_TITLE} Webinar | 1% Abroad`,
    dates: `${CAL_START}/${CAL_END}`,
    details: `Join here: ${JOIN_URL}`,
    location: JOIN_URL,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

function shell(inner: string, eyebrow: string): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:32px 16px;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#040B2B;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(4,11,43,0.06);">
    <div style="background:#040B2B;padding:32px 36px 28px;">
      <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">OnePercent Abroad</div>
      <div style="font-size:11px;color:#61A2FE;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:22px;">${eyebrow}</div>
    </div>
    <div style="padding:32px 36px 36px;">
      ${inner}
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(4,11,43,0.08);font-size:12px;color:#6B7A99;">
        <div style="font-weight:600;color:#040B2B;margin-bottom:4px;">OnePercent Abroad</div>
        <a href="https://onepercentabroad.com" style="color:#065DC7;text-decoration:none;">onepercentabroad.com</a>
      </div>
    </div>
  </div>
</body></html>`;
}

const joinButton = (label: string) =>
  `<a href="${JOIN_URL}" style="display:block;background:#040B2B;color:#ffffff;padding:18px 22px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 10px;letter-spacing:0.01em;font-family:-apple-system,sans-serif;">${label} &nbsp;&rarr;</a>`;

function confirmationEmail(name: string): { subject: string; html: string } {
  const agendaHtml = AGENDA.map(
    (item) =>
      `<tr><td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#6B7A99;">&bull;&nbsp;&nbsp;${item}</td></tr>`,
  ).join("");

  const inner = `
      <p style="font-size:15px;line-height:1.7;color:#040B2B;margin:0 0 6px;font-weight:500;">Hi ${escapeHtml(firstName(name))},</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 22px;">Your seat for the <strong style="color:#040B2B;">${WEBINAR_TITLE}</strong> webinar is confirmed. Here are the details.</p>
      <div style="padding:18px 20px;background:#EEF4FF;border:1px solid rgba(4,11,43,0.08);border-radius:10px;margin:0 0 22px;">
        <div style="font-size:13px;color:#6B7A99;line-height:1.9;">
          <div><strong style="color:#040B2B;">When:</strong> ${WEBINAR_WHEN}</div>
          <div><strong style="color:#040B2B;">Where:</strong> Google Meet (link below)</div>
        </div>
      </div>
      ${joinButton("Join the webinar")}
      <a href="${calendarUrl()}" style="display:block;background:#ffffff;color:#065DC7;border:1px solid rgba(4,11,43,0.12);padding:14px 22px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 24px;font-family:-apple-system,sans-serif;">Add to Google Calendar</a>
      <p style="font-size:14px;font-weight:600;color:#040B2B;margin:0 0 10px;">What we'll cover</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">${agendaHtml}</table>
      <p style="font-size:13px;line-height:1.7;color:#6B7A99;margin:0;">We'll send you a reminder an hour before we go live. Save this email so you can find the joining link quickly.</p>`;

  return {
    subject: `You're registered: ${WEBINAR_TITLE} webinar, 28 Aug, 7 PM IST`,
    html: shell(inner, "Registration confirmed"),
  };
}

function hourReminderEmail(name: string): { subject: string; html: string } {
  const inner = `
      <p style="font-size:15px;line-height:1.7;color:#040B2B;margin:0 0 6px;font-weight:500;">Hi ${escapeHtml(firstName(name))},</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 22px;">A quick reminder that the <strong style="color:#040B2B;">${WEBINAR_TITLE}</strong> webinar starts in about an hour, at <strong style="color:#040B2B;">7:00 PM IST</strong> today.</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 22px;">Bring your questions about courses, the student visa and post-study work rights. There's a live Q&amp;A at the end.</p>
      ${joinButton("Join at 7:00 PM IST")}
      <p style="font-size:13px;line-height:1.7;color:#6B7A99;margin:18px 0 0;">See you there.</p>`;

  return {
    subject: `Starting in 1 hour: ${WEBINAR_TITLE} webinar`,
    html: shell(inner, "Starts in 1 hour"),
  };
}

function startReminderEmail(name: string): { subject: string; html: string } {
  const inner = `
      <p style="font-size:15px;line-height:1.7;color:#040B2B;margin:0 0 6px;font-weight:500;">Hi ${escapeHtml(firstName(name))},</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 22px;">We're going live now. Join the <strong style="color:#040B2B;">${WEBINAR_TITLE}</strong> webinar.</p>
      ${joinButton("Join the webinar now")}
      <p style="font-size:13px;line-height:1.7;color:#6B7A99;margin:18px 0 0;">If the link doesn't open, copy this into your browser:<br /><span style="color:#065DC7;word-break:break-all;">${JOIN_URL}</span></p>`;

  return {
    subject: `We're live: ${WEBINAR_TITLE} webinar is starting now`,
    html: shell(inner, "Starting now"),
  };
}

function buildEmail(kind: Kind, name: string) {
  if (kind === "confirmation") return confirmationEmail(name);
  if (kind === "hour") return hourReminderEmail(name);
  return startReminderEmail(name);
}

// Resend's batch endpoint takes up to 100 messages per call, which keeps us
// well inside the rate limit even with a few hundred registrants.
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
    console.error("send-webinar-email: resend error", res.status, await res.text());
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

    // Internal only: the DB trigger and cron jobs both send the service-role key.
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader.replace(/^Bearer\s+/i, "").trim() !== serviceKey) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    if (!resendKey) {
      console.error("send-webinar-email: RESEND_API_KEY missing — nothing sent");
      return json({ success: false, error: "RESEND_API_KEY not configured" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "reminder" ? "reminder" : "confirmation";
    const kind: Kind =
      mode === "confirmation" ? "confirmation" : body.kind === "start" ? "start" : "hour";
    const sentColumn = SENT_COLUMN[kind];

    const supabase = createClient(supabaseUrl, serviceKey);

    // --- Pick recipients -------------------------------------------------
    let query = supabase
      .from("webinar_registrations")
      .select("id, name, email")
      .eq("webinar_name", WEBINAR_NAME)
      .is(sentColumn, null);

    if (mode === "confirmation") {
      const registrationId = body.registration_id;
      if (!registrationId) return json({ success: false, error: "registration_id required" }, 400);
      query = query.eq("id", registrationId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []) as Registration[];
    if (rows.length === 0) return json({ success: true, sent: 0, note: "nothing to send" });

    // One mail per address; duplicate registrations still get stamped so they
    // don't come back on the next run.
    const byEmail = new Map<string, Registration[]>();
    for (const row of rows) {
      const key = row.email.trim().toLowerCase();
      const bucket = byEmail.get(key);
      if (bucket) bucket.push(row);
      else byEmail.set(key, [row]);
    }

    const recipients = [...byEmail.entries()].map(([email, group]) => ({ email, group }));
    const sentIds: string[] = [];
    let failed = 0;

    for (let i = 0; i < recipients.length; i += RESEND_BATCH_SIZE) {
      const chunk = recipients.slice(i, i + RESEND_BATCH_SIZE);
      const messages = chunk.map(({ email, group }) => {
        const { subject, html } = buildEmail(kind, group[0].name);
        return { to: email, subject, html };
      });

      const ok = await sendBatch(resendKey, messages);
      if (ok) chunk.forEach(({ group }) => group.forEach((r) => sentIds.push(r.id)));
      else failed += chunk.length;
    }

    if (sentIds.length > 0) {
      const { error: stampError } = await supabase
        .from("webinar_registrations")
        .update({ [sentColumn]: new Date().toISOString() })
        .in("id", sentIds);
      // Worth shouting about: unstamped rows will be mailed again on the next run.
      if (stampError) console.error("send-webinar-email: stamp failed", stampError);
    }

    console.log(`send-webinar-email: kind=${kind} sent=${sentIds.length} failed=${failed}`);
    return json({ success: failed === 0, kind, sent: sentIds.length, failed });
  } catch (err) {
    console.error("send-webinar-email error:", err);
    return json({ success: false, error: String(err) }, 500);
  }
});
