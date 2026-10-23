// Shared SOP Vault delivery logic.
//
// Every confirmation path — the Razorpay checkout handler
// (verify-razorpay-payment), the Razorpay webhook, the scheduled reconciler,
// and the legacy PayU callback/webhook — delivers the exact same way:
// generate signed download links, email the buyer + admins, and record the
// outcome. Keeping this in one place means a paid student is delivered the
// same PDFs whether they returned to the browser or not.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SupabaseClient = ReturnType<typeof createClient>;

export const SOP_NAMES: Record<number, { univ: string; prog: string }> = {
  1:  { univ: "Europubhealth+",                       prog: "Erasmus Mundus Master in Public Health" },
  2:  { univ: "University of Glasgow",                prog: "MSc Media, Communications & International Journalism" },
  3:  { univ: "Central European University",          prog: "MA Public Policy" },
  4:  { univ: "Hertie School",                        prog: "Master of Public Policy" },
  5:  { univ: "Johns Hopkins University",             prog: "Master of Public Health" },
  6:  { univ: "MERGED (Erasmus Mundus)",              prog: "Environment & Development" },
  7:  { univ: "University of Sheffield",              prog: "MPH Public Health" },
  8:  { univ: "University of Glasgow",                prog: "MSc Data Science" },
  9:  { univ: "University of Leeds",                  prog: "MSc Sustainable Cities" },
  10: { univ: "University of Pisa",                   prog: "Master in Artificial Intelligence" },
  11: { univ: "Keele University",                     prog: "MSc Environmental Sustainability & Green Technology" },
  12: { univ: "University of Freiburg",               prog: "MSc Global Urban Health" },
  13: { univ: "ACES-STAR (Erasmus Mundus)",           prog: "Aquaculture, Environment & Society" },
  14: { univ: "University of Sussex",                 prog: "MA Development Studies" },
  15: { univ: "Isara",                                prog: "Terra Isara Scholarship Letter (MSc Agroecology)" },
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

// ── Razorpay ──────────────────────────────────────────────────────────────

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison for signature checks. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function razorpayAuthHeader(): string {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) throw new Error("Razorpay credentials not configured");
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

interface SopPurchase {
  id: string;
  email: string;
  firstname: string | null;
  plan: "single" | "bundle" | "full";
  selected_sop_ids: number[] | null;
  payu_txnid: string | null;
  payu_mihpayid: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
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

  const refRow = (k: string, v: string | null | undefined) =>
    `<tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">${k}</td><td style="padding:8px 0;color:#040B2B;font-family:monospace;font-size:12px;">${v ?? "—"}</td></tr>`;
  const paymentRefRows = purchase.razorpay_order_id
    ? refRow("Razorpay order ID", purchase.razorpay_order_id) + refRow("Razorpay payment ID", purchase.razorpay_payment_id)
    : refRow("PayU txn ID", purchase.payu_txnid) + refRow("PayU mihpayid", purchase.payu_mihpayid);

  const reconciledBadge = reconciled
    ? `<div style="margin-top:14px;padding:10px 14px;background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;font-size:12px;color:#9A3412;line-height:1.5;">Recovered by auto-reconciliation — the buyer did not return to the browser after paying, so this sale was confirmed directly with the payment gateway and the PDFs were delivered automatically.</div>`
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
        ${paymentRefRows}
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Resend allows 2 requests/second per account. The buyer + admin emails go
// out back to back, and the checkout handler and webhook can confirm the same
// payment at the same moment, so a 429 here is expected — wait and retry
// instead of recording the buyer email as failed.
async function sendResend(resendKey: string, payload: Record<string, unknown>): Promise<{ ok: boolean; id: string | null; error: string | null }> {
  let lastError = "Unknown send error";
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, ...payload }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return { ok: true, id: body?.id ?? null, error: null };
      lastError = body?.message || `Resend HTTP ${res.status}`;
      if (res.status !== 429 && res.status < 500) break;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : "Unknown send error";
    }
    await sleep(700 * (attempt + 1));
  }
  return { ok: false, id: null, error: lastError };
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

  // Atomically claim delivery. A claim older than 2 minutes is treated as
  // abandoned (the sender crashed) and can be taken over.
  const staleBefore = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: claimed } = await supabase
    .from("sop_purchases")
    .update({ delivery_claimed_at: new Date().toISOString() })
    .eq("id", purchase.id)
    .eq("email_sent", false)
    .or(`delivery_claimed_at.is.null,delivery_claimed_at.lt.${staleBefore}`)
    .select("id");
  if (!claimed || claimed.length === 0) return { delivered: false, skipped: true };

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
      delivery_claimed_at: null,
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
