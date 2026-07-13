import { useState } from "react";
import { Calendar, Clock, Monitor, Video, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackMetaEvent } from "@/lib/metaPixel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WEBINAR_NAME = "Germany Master's Webinar 2026 (13 July 2026) - Attended";
const GOOGLE_MEET_URL = "https://meet.google.com/bba-tewz-jpq";

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+60", label: "🇲🇾 +60" },
  { code: "+977", label: "🇳🇵 +977" },
  { code: "+94", label: "🇱🇰 +94" },
  { code: "+880", label: "🇧🇩 +880" },
];

const Webinar = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");
    setSubmitting(true);

    // Best effort: never strand the user if the insert fails — they still join the webinar.
    const { error: insertError } = await supabase.from("webinar_registrations").insert({
      name: trimmedName,
      email: trimmedEmail,
      country_code: countryCode,
      phone_number: trimmedPhone,
      webinar_name: WEBINAR_NAME,
    });
    if (insertError) console.error("Webinar attendee error:", insertError);

    trackMetaEvent("CompleteRegistration", { content_name: WEBINAR_NAME });

    window.location.href = GOOGLE_MEET_URL;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-display text-slate-900">
      <Header />

      <main className="flex-1">
        {/* ---------- HERO ---------- */}
        <section className="bg-gradient-to-b from-blue-50 to-white">
          <div className="mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              Live Now
            </span>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl">
              Germany Master&apos;s Webinar 2026
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-slate-600 sm:text-lg">
              The webinar is starting. Enter your details below and join us live on Google Meet.
            </p>

            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <DetailCard icon={Calendar} label="Date" value="13 July 2026" />
              <DetailCard icon={Clock} label="Time" value="7:30 PM IST" />
              <DetailCard icon={Monitor} label="Mode" value="Google Meet" />
              <DetailCard icon={Video} label="Access" value="Free" />
            </div>
          </div>
        </section>

        {/* ---------- JOIN FORM ---------- */}
        <section id="join" className="mx-auto mt-6 mb-16 max-w-3xl scroll-mt-24 px-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-white sm:px-10">
            <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
              Join the Webinar
            </h2>
            <p className="mt-2 text-center text-blue-100">
              Fill in your details and you&apos;ll be taken straight to the live Google Meet
              session.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md space-y-4">
              <div>
                <label htmlFor="webinar-name" className="mb-1.5 block text-sm font-medium text-blue-100">
                  Full Name
                </label>
                <input
                  id="webinar-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/30 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/40"
                />
              </div>

              <div>
                <label htmlFor="webinar-email" className="mb-1.5 block text-sm font-medium text-blue-100">
                  Email
                </label>
                <input
                  id="webinar-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/30 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/40"
                />
              </div>

              <div>
                <label htmlFor="webinar-phone" className="mb-1.5 block text-sm font-medium text-blue-100">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="min-w-[100px] rounded-xl border border-white/30 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/40"
                  >
                    {COUNTRY_CODES.map((cc) => (
                      <option key={cc.code} value={cc.code}>
                        {cc.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="webinar-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-white/30 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/40"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/20 px-4 py-2.5 text-center text-sm font-medium text-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-white px-7 py-4 text-lg font-bold text-blue-800 shadow-lg transition hover:bg-blue-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Joining…" : "Join Webinar on Google Meet"}
              </button>

              <p className="text-center text-xs text-blue-200">
                You&apos;ll be redirected to the live Google Meet session right after you submit.
              </p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
    <Icon className="mx-auto h-6 w-6 text-blue-700" strokeWidth={2} />
    <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm font-bold text-slate-900 sm:text-base">{value}</p>
  </div>
);

export default Webinar;
