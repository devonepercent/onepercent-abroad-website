import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";
import { supabase } from "@/integrations/supabase/client";
import { trackMetaEvent } from "@/lib/metaPixel";

const WEBINAR_NAME = "Erasmus Mundus Webinar (18 September 2026)";
const JOIN_URL = "https://meet.google.com/bba-tewz-jpq";

const COUNTRY_CODES = [
  "+91",
  "+1",
  "+44",
  "+61",
  "+49",
  "+33",
  "+971",
  "+65",
  "+60",
  "+977",
  "+94",
  "+880",
];

const ErasmusWebinarJoin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Join the Erasmus Mundus Webinar | 1% Abroad";
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.replace(/[^0-9]/g, "");

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (trimmedPhone.length < 7 || trimmedPhone.length > 15) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }

    setError("");
    setSubmitting(true);

    const { error: insertError } = await supabase.from("webinar_registrations").insert({
      name: trimmedName,
      email: trimmedEmail,
      country_code: countryCode,
      phone_number: trimmedPhone,
      webinar_name: WEBINAR_NAME,
    });

    if (insertError) {
      console.error("Erasmus webinar join error:", insertError);
      setError("We couldn't save your details. Please try again.");
      setSubmitting(false);
      return;
    }

    trackMetaEvent("CompleteRegistration", { content_name: WEBINAR_NAME });
    window.location.assign(JOIN_URL);
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-base text-white outline-none transition placeholder:text-white/30 focus:border-[#E8B44A] focus:ring-2 focus:ring-[#E8B44A]/20";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-12 font-display text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#61A2FE]/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-[#E8B44A]/20 blur-[120px]"
      />

      <section className="relative w-full max-w-md">
        <Link to="/" aria-label="1% Abroad home" className="mx-auto block w-fit">
          <img src={logoWhite} alt="1% Abroad" className="h-8 w-auto" />
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0B0B0B]/95 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.7)] sm:p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E8B44A]">
              Erasmus Mundus Webinar
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Join the webinar</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/55">
              Enter your details and we&apos;ll take you straight to the live session.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="erasmus-join-name" className="mb-1.5 block text-sm text-white/70">
                Full name
              </label>
              <input
                id="erasmus-join-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="erasmus-join-email" className="mb-1.5 block text-sm text-white/70">
                Email
              </label>
              <input
                id="erasmus-join-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="erasmus-join-phone" className="mb-1.5 block text-sm text-white/70">
                WhatsApp number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  aria-label="Country code"
                  className="w-24 shrink-0 rounded-xl border border-white/10 bg-[#141414] px-3 py-3.5 text-base text-white outline-none transition focus:border-[#E8B44A] focus:ring-2 focus:ring-[#E8B44A]/20"
                >
                  {COUNTRY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  id="erasmus-join-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                  autoComplete="tel"
                  className={`${inputClass} min-w-0 flex-1`}
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#E8B44A] px-6 py-4 text-base font-bold text-black shadow-[0_12px_34px_-10px_rgba(232,180,74,0.55)] transition hover:bg-[#F0C264] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Joining…" : "Join webinar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ErasmusWebinarJoin;
