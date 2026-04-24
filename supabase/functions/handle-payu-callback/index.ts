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
            <div style="margin:12px 0;padding:16px 18px;background:#f8f7f4;border-radius:12px;border-left:3px solid #E8541A;">
              <div style="font-size:13px;font-weight:600;color:#0D1B2A;margin-bottom:8px;font-family:-apple-system,sans-serif;">${name}</div>
              <a href="${url}" style="display:inline-block;background:#0D1B2A;color:white;padding:10px 22px;border-radius:50px;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.04em;font-family:-apple-system,sans-serif;">Download PDF →</a>
              <div style="font-size:11px;color:#7a8694;margin-top:6px;font-family:-apple-system,sans-serif;">⏱ Link expires in 72 hours</div>
            </div>`).join("")
          : `<div style="padding:16px;background:#fff3cd;border-radius:12px;color:#856404;font-size:13px;">Your files are being prepared. You will receive a follow-up email within 24 hours.</div>`;

      const emailHtml = `<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#f0ede8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:#0D1B2A;padding:32px 36px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="font-size:26px;font-weight:700;color:white;letter-spacing:-0.02em;">1% <em style="color:#E8541A;font-style:italic;">Admit</em> Vault</div>
      <div style="color:rgba(255,255,255,0.45);font-size:11px;margin-top:6px;letter-spacing:0.1em;text-transform:uppercase;">Your SOPs Are Ready</div>
    </div>
    <div style="background:#FAFAF7;padding:36px;border-radius:0 0 16px 16px;">
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#16a34a;font-size:12px;font-weight:700;padding:5px 14px;border-radius:50px;margin-bottom:16px;letter-spacing:0.04em;">✓ PAYMENT CONFIRMED</div>
      <h2 style="font-size:22px;font-weight:600;color:#0D1B2A;margin:0 0 10px;">Here are your download links</h2>
      <p style="color:#7a8694;font-size:14px;line-height:1.7;margin:0 0 24px;">
        You purchased the <strong style="color:#0D1B2A;">${planLabel}</strong>. Your secure download links are below — they expire in <strong>72 hours</strong>, so save them now.
      </p>
      ${linksHtml}
      <div style="margin-top:24px;background:#FDF0E6;border:1px solid #F5C9A0;border-radius:12px;padding:16px 20px;">
        <div style="font-size:13px;font-weight:700;color:#0D1B2A;margin-bottom:6px;">⚖️ Usage Reminder</div>
        <div style="font-size:12px;color:#7a8694;line-height:1.65;">Personal study only. No sharing, redistribution, or AI uploading. Every document is watermarked and tracked under IP law.</div>
      </div>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e6ebf0;text-align:center;font-size:12px;color:#7a8694;">
        © 2025 1% Admit Vault · <a href="https://onepercentabroad.com" style="color:#E8541A;text-decoration:none;">onepercentabroad.com</a>
      </div>
    </div>
  </div>
</body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "noreply@onepercentabroad.com",
          to: purchase.email,
          subject: `Your ${planLabel} is ready — 1% Admit Vault`,
          html: emailHtml,
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
