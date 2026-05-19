import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

async function sha512(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  const siteUrl = Deno.env.get("SITE_URL") || "https://onepercentabroad.com";
  const successUrl = `${siteUrl}/product/sop-vault/success`;
  const failureUrl = `${siteUrl}/product/sop-vault/success?status=failed`;

  try {
    const formData = await req.formData();
    const p: Record<string, string> = {};
    for (const [k, v] of formData.entries()) p[k] = v.toString();

    const { mihpayid, status, txnid, amount, productinfo, firstname, email, hash: payuHash } = p;

    const salt = Deno.env.get("PAYU_MERCHANT_SALT");
    const key  = Deno.env.get("PAYU_MERCHANT_KEY");
    if (!salt || !key) return Response.redirect(failureUrl, 302);

    // Verify response hash: sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    const expectedHashStr = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const expectedHash = await sha512(expectedHashStr);
    if (expectedHash !== payuHash) {
      console.error("PayU hash mismatch for txnid:", txnid);
      return Response.redirect(failureUrl, 302);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchase } = await supabase
      .from("sop_purchases")
      .select("*")
      .eq("payu_txnid", txnid)
      .single();

    if (!purchase) return Response.redirect(failureUrl, 302);

    const isSuccess = status === "success";

    await supabase.from("sop_purchases").update({
      payu_mihpayid: mihpayid,
      status: isSuccess ? "completed" : "failed",
    }).eq("payu_txnid", txnid);

    if (!isSuccess) return Response.redirect(failureUrl, 302);

    // Generate signed download URLs (72-hour expiry)
    const expiresIn = 72 * 3600;
    const links: { name: string; url: string }[] = [];

    if (purchase.plan === "full") {
      const { data } = await supabase.storage
        .from("sop-pdfs")
        .createSignedUrl("bundles/full-vault.zip", expiresIn);
      if (data) links.push({ name: "Full Vault — All 15 SOPs", url: data.signedUrl });
    } else {
      for (const sopId of purchase.selected_sop_ids as number[]) {
        const { data } = await supabase.storage
          .from("sop-pdfs")
          .createSignedUrl(`individual/sop-${sopId}.pdf`, expiresIn);
        if (data) {
          const info = SOP_NAMES[sopId];
          links.push({
            name: info ? `${info.univ} — ${info.prog}` : `SOP ${sopId}`,
            url: data.signedUrl,
          });
        }
      }
    }

    // Send email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const planLabel =
        purchase.plan === "full"   ? "Full Vault"      :
        purchase.plan === "bundle" ? "Starter Bundle"  : "Single SOP";

      const linksHtml =
        links.length > 0
          ? links.map(({ name, url }) => `
            <a href="${url}" style="display:block;background:#040B2B;color:#ffffff;padding:18px 22px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 10px;letter-spacing:0.01em;font-family:-apple-system,sans-serif;">Download ${name} &nbsp;&rarr;</a>`).join("")
          : `<div style="padding:16px 18px;background:#EEF4FF;border:1px solid rgba(4,11,43,0.08);border-radius:10px;color:#6B7A99;font-size:13px;line-height:1.6;">Your files are being prepared. You will receive a follow-up email within 24 hours.</div>`;

      const emailHtml = `<!DOCTYPE html>
<html><body style="margin:0;padding:32px 16px;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#040B2B;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(4,11,43,0.06);">
    <div style="background:#040B2B;padding:32px 36px 28px;">
      <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">OnePercent Abroad</div>
      <div style="font-size:11px;color:#61A2FE;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:22px;">Payment Confirmed</div>
    </div>
    <div style="padding:32px 36px 36px;">
      <p style="font-size:15px;line-height:1.7;color:#040B2B;margin:0 0 6px;font-weight:500;">Hi ${firstname || "there"},</p>
      <p style="font-size:14px;line-height:1.75;color:#6B7A99;margin:0 0 24px;">Your ${planLabel} is ready. The link below expires in <strong style="color:#040B2B;">72 hours</strong> — please save the file to your device now.</p>
      ${linksHtml}
      <p style="font-size:13px;line-height:1.7;color:#6B7A99;margin:28px 0 0;">If anything looks off, simply reply to this email and we will fix it.</p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(4,11,43,0.08);font-size:12px;color:#6B7A99;">
        <div style="font-weight:600;color:#040B2B;margin-bottom:4px;">OnePercent Abroad</div>
        <a href="https://onepercentabroad.com" style="color:#065DC7;text-decoration:none;">onepercentabroad.com</a>
      </div>
    </div>
  </div>
</body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "OnePercent Abroad <noreply@notify.onepercentabroad.com>",
          to: purchase.email,
          subject: `Your ${planLabel} is ready — OnePercent Abroad`,
          html: emailHtml,
        }),
      });

      // Admin notification (success only, no download links)
      const sopsList =
        purchase.plan === "full"
          ? "All 15 (Full Vault)"
          : (purchase.selected_sop_ids as number[])
              .map((id) => {
                const info = SOP_NAMES[id];
                return info ? `${info.univ} — ${info.prog}` : `SOP ${id}`;
              })
              .join("<br>");

      const istTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const adminHtml = `<!DOCTYPE html>
<html><body style="margin:0;padding:32px 16px;background:#EEF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#040B2B;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(4,11,43,0.06);">
    <div style="background:#040B2B;padding:24px 32px;">
      <div style="font-size:11px;color:#61A2FE;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px;">New Purchase</div>
      <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">SOP Vault — Sale Notification</div>
    </div>
    <div style="padding:30px 32px;">
      <div style="font-size:30px;font-weight:700;color:#040B2B;margin-bottom:4px;letter-spacing:-0.02em;">₹${amount}</div>
      <div style="font-size:13px;color:#6B7A99;margin-bottom:24px;">${planLabel}</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:8px 0;color:#6B7A99;width:40%;vertical-align:top;">Buyer name</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${firstname || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Buyer email</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${purchase.email}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Plan</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${planLabel}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">SOPs purchased</td><td style="padding:8px 0;color:#040B2B;font-weight:600;line-height:1.6;">${sopsList}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Amount</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">₹${amount}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">PayU txn ID</td><td style="padding:8px 0;color:#040B2B;font-family:monospace;font-size:12px;">${txnid}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">PayU mihpayid</td><td style="padding:8px 0;color:#040B2B;font-family:monospace;font-size:12px;">${mihpayid}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7A99;vertical-align:top;">Time (IST)</td><td style="padding:8px 0;color:#040B2B;font-weight:600;">${istTime}</td></tr>
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(4,11,43,0.08);font-size:11px;color:#6B7A99;">
        Sent by OnePercent Abroad · noreply@notify.onepercentabroad.com
      </div>
    </div>
  </div>
</body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "OnePercent Abroad <noreply@notify.onepercentabroad.com>",
          to: [
            "sreejith@onepercentabroad.com",
            "muhasina@onepercentabroad.com",
            "irshad@onepercentabroad.com",
          ],
          subject: `New SOP Vault purchase — ₹${amount} · ${planLabel}`,
          html: adminHtml,
        }),
      });
    }

    return Response.redirect(successUrl, 302);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("handle-payu-callback:", msg);
    return Response.redirect(failureUrl, 302);
  }
});
