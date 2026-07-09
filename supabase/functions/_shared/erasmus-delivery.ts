// Shared delivery path for Erasmus application purchases.
// Idempotent via the email_sent flag — the browser callback and the S2S
// webhook can both call this; the buyer is emailed exactly once.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_RECIPIENTS = [
  "sreejith@onepercentabroad.com",
  "muhasina@onepercentabroad.com",
  "irshad@onepercentabroad.com",
];

const FROM = "OnePercent Abroad <noreply@notify.onepercentabroad.com>";

export interface ErasmusItem {
  id: string;
  code: string;
  name: string;
  category?: string;
}

export interface ErasmusPurchase {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  items: ErasmusItem[] | null;
  num_items: number;
  amount: number;
  payu_txnid: string | null;
  payu_mihpayid: string | null;
  email_sent: boolean | null;
}

const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

async function sendEmail(
  resendKey: string,
  payload: { to: string | string[]; subject: string; html: string },
): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: FROM, ...payload }),
  });
  if (!res.ok) console.error("erasmus-delivery: resend error", res.status, await res.text());
  return res.ok;
}

function itemsRows(items: ErasmusItem[]): string {
  return items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e8ec;font-weight:700;">${i.code}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e8ec;color:#64748b;">${i.name}</td>
      </tr>`,
    )
    .join("");
}

function buyerEmailHtml(p: ErasmusPurchase): string {
  const first = (p.name ?? "").trim().split(" ")[0] || "there";
  const items = p.items ?? [];
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
    <div style="background:#040B2B;border-radius:12px 12px 0 0;padding:28px 32px;">
      <h1 style="color:#fff;font-size:20px;margin:0;">Payment received ✓</h1>
    </div>
    <div style="border:1px solid #e6e8ec;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
      <p style="font-size:15px;line-height:1.6;">Hi ${first},</p>
      <p style="font-size:15px;line-height:1.6;">
        Thanks for choosing OnePercent Abroad. We've received your payment of
        <strong>${inr(p.amount)}</strong> for <strong>${p.num_items}</strong>
        Erasmus Mundus application${p.num_items === 1 ? "" : "s"}:
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">${itemsRows(items)}</table>
      <p style="font-size:15px;line-height:1.6;">
        <strong>What happens next:</strong> our team will call you on
        ${p.phone ?? "your number"} within 24 hours to collect your documents and
        kick off your SOPs, LORs and filings. Every deadline is tracked from here on.
      </p>
      <p style="font-size:12px;color:#64748b;margin-top:24px;">
        Transaction ID: ${p.payu_txnid ?? "—"} · PayU ref: ${p.payu_mihpayid ?? "—"}
      </p>
    </div>
  </div>`;
}

function adminEmailHtml(p: ErasmusPurchase): string {
  const items = p.items ?? [];
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
    <h2 style="font-size:18px;">New Erasmus purchase — ${inr(p.amount)}</h2>
    <p style="font-size:14px;line-height:1.7;">
      <strong>Name:</strong> ${p.name ?? "—"}<br/>
      <strong>Email:</strong> ${p.email}<br/>
      <strong>Phone:</strong> ${p.phone ?? "—"}<br/>
      <strong>Applications:</strong> ${p.num_items}<br/>
      <strong>Txn:</strong> ${p.payu_txnid ?? "—"} · <strong>PayU:</strong> ${p.payu_mihpayid ?? "—"}
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">${itemsRows(items)}</table>
    <p style="font-size:13px;color:#64748b;">Buyer expects a call within 24 hours.</p>
  </div>`;
}

/** Buyer confirmation + admin notification. No-ops if already delivered. */
export async function deliverErasmusPurchase(
  supabase: SupabaseClient,
  purchase: ErasmusPurchase,
  opts: { resendKey?: string },
): Promise<void> {
  if (purchase.email_sent) return;
  if (!opts.resendKey) {
    console.error("erasmus-delivery: RESEND_API_KEY missing — emails skipped");
    return;
  }

  // Claim delivery first so a concurrent confirm path can't double-send.
  const { data: claimed } = await supabase
    .from("erasmus_purchases")
    .update({ email_sent: true, updated_at: new Date().toISOString() })
    .eq("id", purchase.id)
    .eq("email_sent", false)
    .select("id");
  if (!claimed || claimed.length === 0) return; // another path won the race

  const buyerOk = await sendEmail(opts.resendKey, {
    to: purchase.email,
    subject: `Payment received — ${purchase.num_items} Erasmus application${purchase.num_items === 1 ? "" : "s"}`,
    html: buyerEmailHtml(purchase),
  });

  await sendEmail(opts.resendKey, {
    to: ADMIN_RECIPIENTS,
    subject: `Erasmus purchase: ${purchase.name ?? purchase.email} — ${inr(purchase.amount)} (${purchase.num_items} apps)`,
    html: adminEmailHtml(purchase),
  });

  if (!buyerOk) {
    // Roll back the claim so the reconciling path can retry the buyer email.
    await supabase.from("erasmus_purchases").update({ email_sent: false }).eq("id", purchase.id);
  }
}
