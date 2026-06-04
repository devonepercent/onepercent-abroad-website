// Shared SOP Vault delivery logic.
//
// Both the live PayU browser callback (handle-payu-callback) and the
// scheduled reconciler (reconcile-payu-payments) deliver the exact same way:
// generate signed download links, email the buyer + admins, and record the
// outcome. Keeping this in one place means a paid student is delivered the
// same PDFs whether they returned to the browser or not.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SupabaseClient = ReturnType<typeof createClient>;

export const SOP_NAMES: Record<number, { univ: string; prog: string }> = {
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

export const ALL_SOP_IDS = Object.keys(SOP_NAMES).map(Number).sort((a, b) => a - b);

const ADMIN_RECIPIENTS = [
  "sreejith@onepercentabroad.com",
  "muhasina@onepercentabroad.com",
  "irshad@onepercentabroad.com",
];

const FROM = "OnePercent Abroad <noreply@notify.onepercentabroad.com>";

export async function sha512(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface SopPurchase {
  id: string;
  email: string;
  firstname: string | null;
  plan: "single" | "bundle" | "full";
  selected_sop_ids: number[] | null;
  payu_txnid: string | null;
  payu_mihpayid: string | null;
  amount: number;
  email_sent: boolean | null;
}

function planLabel(plan: string): string {
  return plan === "full" ? "Full Vault" : plan === "bundle" ? "Starter Bundle" : "Single SOP";
}

function sopIdsFor(purchase: SopPurchase): number[] {
  return purchase.plan === "full"
    ? [...ALL_SOP_IDS]
    : ((purchase.selected_sop_ids as number[]) ?? []);
}

async function generateLinks(
  supabase: SupabaseClient,
  sopIds: number[],
): Promise<{ name: string; url: string }[]> {
  const expiresIn = 7 * 24 * 3600; // 7 days
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
  return links;
}

function buildBuyerEmail(firstname: string | null, label: string, links: { name: string; url: string }[]): string {
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
      <div style="font-size:11px;color:#61A2FE;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:22px;">Payment Confirmed</div>
    </div>
    <div style="padding:32px 36px 36px;">
      <p style="font-size:15px;line-height:1.7;color:#040B2B;margin:0 0 6px;font-weight:500;">Hi ${firstname || "there"},</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 24px;">Your ${label} is ready. The link${links.length > 1 ? "s" : ""} below expire${links.length > 1 ? "" : "s"} in <strong style="color:#040B2B;">7 days</strong> — please save the file${links.length > 1 ? "s" : ""} to your device now.</p>
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

function buildAdminEmail(purchase: SopPurchase, label: string, reconciled: boolean): string {
  const sopsList =
    purchase.plan === "full"
      ? "All 15 (Full Vault)"
      : ((purchase.selected_sop_ids as number[]) ?? [])
          .map((id) => {
            const info = SOP_NAMES[id];
            return info ? `${info.univ} — ${info.prog}` : `SOP ${id}`;
          })
          .join("<br>");

  const istTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const reconciledBadge = reconciled
    ? `<div style="margin-top:14px;padding:10px 14px;background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;font-size:12px;color:#9A3412;line-height:1.5;">Recovered by auto-reconciliation — the buyer did not return to the browser after paying, so this sale was confirmed directly with PayU and the PDFs were delivered automatically.</div>`
    : "";

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:32px 16px;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#040B2B;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(4,11,43,0.06);">
    <div style="background:#040B2B;padding:24px 32px;">
      <div style="font-size:11px;color:#61A2FE;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px;">New Purchase</div>
      <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">SOP Vault — Sale Notification</div>
    </div>
    <div style="padding:30px 32px;">
      <div style="font-size:30px;font-weight:700;color:#040B2B;margin-bottom:4px;letter-spacing:-0.02em;">₹${purchase.amount}</div>
      <div style="font-size:13px;color:#6B7A99;margin-bottom:24px;">${label}</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:8px 0;color:#6B7A99;width:40%;vertical-align:top;">Buyer name</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${purchase.firstname || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Buyer email</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${purchase.email}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Plan</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${label}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">SOPs purchased</td><td style="padding:8px 0;color:#040B2B;font-weight:600;line-height:1.6;">${sopsList}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Amount</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">₹${purchase.amount}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">PayU txn ID</td><td style="padding:8px 0;color:#040B2B;font-family:monospace;font-size:12px;">${purchase.payu_txnid ?? "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">PayU mihpayid</td><td style="padding:8px 0;color:#040B2B;font-family:monospace;font-size:12px;">${purchase.payu_mihpayid ?? "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Time (IST)</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${istTime}</td></tr>
      </table>
      ${reconciledBadge}
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(4,11,43,0.08);font-size:11px;color:#6B7A99;">
        Sent by OnePercent Abroad · noreply@notify.onepercentabroad.com
      </div>
    </div>
  </div>
</body></html>`;
}

async function sendResend(resendKey: string, payload: Record<string, unknown>): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, ...payload }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, id: body?.id ?? null, error: null };
    return { ok: false, id: null, error: body?.message || `Resend HTTP ${res.status}` };
  } catch (err: unknown) {
    return { ok: false, id: null, error: err instanceof Error ? err.message : "Unknown send error" };
  }
}

/**
 * Deliver a completed SOP purchase: generate links, email the buyer, notify
 * admins, and record the outcome on the purchase row + event log.
 *
 * Idempotent — if the purchase has already been emailed (email_sent), it does
 * nothing. This is what makes it safe to call from both the live browser
 * callback and the reconciler without ever double-sending.
 *
 * @returns whether the buyer email was sent on this call.
 */
export async function deliverPurchase(
  supabase: SupabaseClient,
  purchase: SopPurchase,
  opts: { resendKey: string | undefined; reconciled?: boolean },
): Promise<{ delivered: boolean; skipped?: boolean; error?: string }> {
  const { resendKey, reconciled = false } = opts;

  if (purchase.email_sent) return { delivered: false, skipped: true };

  if (!resendKey) {
    await supabase.from("sop_purchases")
      .update({ email_sent: false, email_error: "RESEND_API_KEY not configured" })
      .eq("id", purchase.id);
    await supabase.from("sop_events").insert({
      purchase_id: purchase.id,
      email: purchase.email,
      event_type: "email_failed",
      detail: { error: "RESEND_API_KEY not configured", reconciled },
    });
    return { delivered: false, error: "RESEND_API_KEY not configured" };
  }

  const label = planLabel(purchase.plan);
  const links = await generateLinks(supabase, sopIdsFor(purchase));

  // Buyer delivery email — the one students are missing.
  const buyer = await sendResend(resendKey, {
    to: purchase.email,
    subject: `Your ${label} is ready — OnePercent Abroad`,
    html: buildBuyerEmail(purchase.firstname, label, links),
  });

  if (buyer.ok) {
    await supabase.from("sop_purchases").update({
      email_sent: true,
      email_sent_at: new Date().toISOString(),
      email_error: null,
      resend_message_id: buyer.id,
    }).eq("id", purchase.id);
    await supabase.from("sop_events").insert({
      purchase_id: purchase.id,
      email: purchase.email,
      event_type: "email_sent",
      detail: { to: purchase.email, resend_id: buyer.id, links_count: links.length, reconciled },
    });
  } else {
    await supabase.from("sop_purchases").update({
      email_sent: false,
      email_error: buyer.error,
    }).eq("id", purchase.id);
    await supabase.from("sop_events").insert({
      purchase_id: purchase.id,
      email: purchase.email,
      event_type: "email_failed",
      detail: { to: purchase.email, error: buyer.error, reconciled },
    });
  }

  // Admin sale notification (best-effort; never blocks buyer delivery status).
  await sendResend(resendKey, {
    to: ADMIN_RECIPIENTS,
    subject: `New SOP Vault purchase — ₹${purchase.amount} · ${label}${reconciled ? " (recovered)" : ""}`,
    html: buildAdminEmail(purchase, label, reconciled),
  });

  return buyer.ok ? { delivered: true } : { delivered: false, error: buyer.error ?? undefined };
}
