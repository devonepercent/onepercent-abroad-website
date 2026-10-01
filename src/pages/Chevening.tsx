import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownToLine, ArrowRight, Check, FileText, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import "./Chevening.css";

const PDF_URL = "/chevening-scholarship-guide.pdf";

export default function Chevening() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    document.title = "Chevening Scholarship Guide | OnePercent Abroad";
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      // Download the file first, so a missing PDF never captures a lead without delivery.
      const response = await fetch(PDF_URL, { cache: "no-store" });
      if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("pdf")) {
        throw new Error("The guide is not available yet. Please try again soon.");
      }
      const pdf = await response.blob();
      if (!pdf.size) throw new Error("The guide is not available yet. Please try again soon.");

      // The checked-in generated Supabase types predate this migration.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: saveError } = await supabase.from("chevening_leads" as any).insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });
      if (saveError) throw saveError;

      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Chevening-Scholarship-Guide.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setDownloaded(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="chevening-page">
      <header className="chevening-header">
        <img src="/logo-white.png" alt="OnePercent Abroad" className="chevening-logo" />
      </header>

      <section className="chevening-hero" aria-labelledby="chevening-title">
        <div className="chevening-copy">
          <span className="chevening-eyebrow"><span /> FREE SCHOLARSHIP GUIDE</span>
          <h1 id="chevening-title">Your Chevening<br /><em>journey starts here.</em></h1>
          <p className="chevening-description">A clear, practical guide to help you take the next step toward the Chevening Scholarship.</p>

          <div className="chevening-cta-row">
            <button className="chevening-cta" type="button" onClick={() => { setError(""); setOpen(true); }}>
              <ArrowDownToLine size={20} strokeWidth={2} /> Download the free guide <ArrowRight size={18} />
            </button>
            <span className="chevening-pdf-note"><FileText size={16} /> PDF guide</span>
          </div>
          <p className="chevening-small-note">One quick step to get your copy.</p>
        </div>

        <div className="chevening-art" aria-hidden="true">
          <div className="chevening-halo" />
          <div className="chevening-outline chevening-outline-one" />
          <div className="chevening-outline chevening-outline-two" />
          <img src="/chevening-graduate.png" alt="" className="chevening-graduate" />
          <div className="chevening-art-label"><span>01 / YOUR NEXT CHAPTER</span><span>BEGINS NOW</span></div>
        </div>
      </section>

      <div className="chevening-footer-line"><span>THE GUIDE IS READY WHEN YOU ARE.</span><span>ONEPERCENT ABROAD</span></div>

      {open && (
        <div className="chevening-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setOpen(false); }}>
          <div className="chevening-dialog" role="dialog" aria-modal="true" aria-labelledby="chevening-form-title">
            <button className="chevening-close" type="button" aria-label="Close" onClick={() => setOpen(false)} disabled={busy}><X size={20} /></button>
            {downloaded ? (
              <div className="chevening-success" role="status">
                <div className="chevening-success-icon"><Check size={25} /></div>
                <h2>Your guide is on its way.</h2>
                <p>The PDF download has started. Check your browser’s downloads if you don’t see it yet.</p>
                <button type="button" onClick={() => setOpen(false)}>Done</button>
              </div>
            ) : (
              <>
                <span className="chevening-dialog-kicker">ALMOST THERE</span>
                <h2 id="chevening-form-title">Your guide is just<br /><em>one step away.</em></h2>
                <form onSubmit={submit} className="chevening-form">
                  <label htmlFor="chevening-name">Full name</label>
                  <input id="chevening-name" name="name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={120} required placeholder="Your name" autoFocus />
                  <label htmlFor="chevening-email">Email address</label>
                  <input id="chevening-email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} required placeholder="you@example.com" />
                  <label htmlFor="chevening-phone">Phone number</label>
                  <input id="chevening-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} minLength={7} maxLength={30} required placeholder="Your phone number" />
                  {error && <p className="chevening-error" role="alert">{error}</p>}
                  <button className="chevening-submit" type="submit" disabled={busy}>{busy ? <><Loader2 size={18} className="animate-spin" /> Preparing your PDF…</> : <><ArrowDownToLine size={18} /> Get my free guide <ArrowRight size={17} /></>}</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
