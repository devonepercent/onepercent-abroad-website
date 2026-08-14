import { useState } from "react";
import { Calendar, Clock, Monitor, Ticket, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackMetaEvent } from "@/lib/metaPixel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WEBINAR_NAME = "Commonwealth Scholarship Webinar (14 August 2026)";
const JOIN_URL = "https://meet.google.com/bba-tewz-jpq";

// 7:00-8:00 PM IST on 14 Aug 2026, expressed in UTC for Google Calendar.
const CALENDAR_URL = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: "TEMPLATE",
  text: "Commonwealth Scholarship Webinar | 1% Abroad",
  dates: "20260814T133000Z/20260814T143000Z",
  details: `Join here: ${JOIN_URL}`,
  location: JOIN_URL,
}).toString()}`;

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

const AGENDA = [
  "What you should know about the Commonwealth Scholarship",
  "Who is eligible",
  "How the application works",
  "What can make your profile stronger",
  "Live Q&A",
];

const Webinar = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const scrollToForm = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

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

    // No redirect to fall back on here, so a failed insert has to surface —
    // otherwise we'd promise a confirmation email that never gets sent.
    const { error: insertError } = await supabase.from("webinar_registrations").insert({
      name: trimmedName,
      email: trimmedEmail,
      country_code: countryCode,
      phone_number: trimmedPhone,
      webinar_name: WEBINAR_NAME,
    });

    if (insertError) {
      console.error("Webinar registration error:", insertError);
      setError("Something went wrong while registering. Please try again.");
      setSubmitting(false);
      return;
    }

    trackMetaEvent("CompleteRegistration", { content_name: WEBINAR_NAME });

    setSubmitting(false);
    setRegistered(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-display text-slate-900">
      <Header />

      <main className="flex-1">
        {/* ---------- HERO ---------- */}
        <section className="bg-gradient-to-b from-blue-50 to-white">
          <div className="mx-auto max-w-3xl px-4 pb-14 pt-12 text-center sm:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              Free Live Webinar
            </span>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl">
              Commonwealth Scholarship
            </h1>

            <p className="mt-3 font-display text-lg font-semibold text-blue-700 sm:text-xl">
              Fully funded study in the UK
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-slate-600 sm:text-lg">
              Your chance to study in the UK with a fully funded Commonwealth Scholarship is worth
              understanding properly. We go live today at 7 PM IST.
            </p>

            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <DetailCard icon={Calendar} label="Date" value="14 August 2026" />
              <DetailCard icon={Clock} label="Time" value="7:00 PM IST" />
              <DetailCard icon={Monitor} label="Mode" value="Online" />
              <DetailCard icon={Ticket} label="Registration" value="Free" />
            </div>

            <button
              onClick={scrollToForm}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-8 py-4 text-lg font-bold text-white ring-4 ring-blue-200 transition hover:bg-blue-800 active:scale-[0.99]"
            >
              Register Now, It&apos;s Free
            </button>
          </div>
        </section>

        {/* ---------- ABOUT ---------- */}
        <section className="mx-auto mt-14 max-w-3xl px-4">
          <h2 className="text-center font-display text-2xl font-bold">About the Webinar</h2>
          <div className="mt-5 space-y-4 text-center text-slate-600">
            <p className="text-lg font-medium text-slate-800">
              Commonwealth Scholarship aspirants, this one is for you.
            </p>
            <p>
              Join this free live webinar by{" "}
              <span className="font-semibold text-slate-800">1% Abroad</span> for a dedicated
              session on the{" "}
              <span className="font-semibold text-slate-800">Commonwealth Scholarship</span>, from
              who is eligible and how the application actually works to what can make your profile
              stronger.
            </p>
            <p className="font-medium text-slate-800">
              Set a reminder. Join live. Come prepared with your questions.
            </p>
          </div>
        </section>

        {/* ---------- AGENDA ---------- */}
        <section className="mx-auto mt-14 max-w-3xl px-4">
          <h2 className="text-center font-display text-2xl font-bold">What You&apos;ll Learn</h2>
          <ul className="mx-auto mt-6 max-w-xl space-y-3">
            {AGENDA.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <CheckIcon />
                <span className="text-slate-800">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- REGISTRATION FORM ---------- */}
        <section id="register" className="mx-auto mt-14 mb-16 max-w-3xl scroll-mt-24 px-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-white sm:px-10">
            {registered ? (
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                  <TickIcon />
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                  You&apos;re registered
                </h2>
                <p className="mt-3 text-blue-100">
                  Thanks, {name.trim().split(/\s+/)[0]}. Your seat for the Commonwealth Scholarship
                  webinar on{" "}
                  <span className="font-semibold text-white">14 August 2026 at 7:00 PM IST</span> is
                  confirmed.
                </p>
                <a
                  href={CALENDAR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-blue-800 shadow-lg transition hover:bg-blue-50 active:scale-[0.99]"
                >
                  <CalendarPlusIcon />
                  Add to Google Calendar
                </a>

                <div className="mt-4 rounded-xl bg-white/10 px-5 py-4 text-left text-sm text-blue-100">
                  <p className="font-semibold text-white">What happens next</p>
                  <p className="mt-2">
                    A confirmation email is on its way to{" "}
                    <span className="font-semibold text-white">{email.trim().toLowerCase()}</span>{" "}
                    with the joining link. We&apos;ll also send you a reminder an hour before the
                    session starts.
                  </p>
                  <p className="mt-2">
                    If you don&apos;t see it, check your spam or promotions folder.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
                  Reserve Your Spot
                </h2>
                <p className="mt-2 text-center text-blue-100">
                  Seats are limited. Register now to attend for free and get your questions answered
                  live by our mentor.
                </p>

                <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md space-y-4">
                  <div>
                    <label
                      htmlFor="webinar-name"
                      className="mb-1.5 block text-sm font-medium text-blue-100"
                    >
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
                    <label
                      htmlFor="webinar-email"
                      className="mb-1.5 block text-sm font-medium text-blue-100"
                    >
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
                    <label
                      htmlFor="webinar-phone"
                      className="mb-1.5 block text-sm font-medium text-blue-100"
                    >
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
                    {submitting ? "Registering…" : "Register for Free"}
                  </button>

                  <p className="text-center text-xs text-blue-200">
                    We&apos;ll email you the joining link right after you register, plus a reminder
                    before the session starts.
                  </p>
                </form>
              </>
            )}
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

const CheckIcon = () => (
  <svg className="mt-0.5 shrink-0 text-blue-700" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CalendarPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4M16 2v4M3 10h18" />
    <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
    <path d="M16 19h6M19 16v6" />
  </svg>
);

const TickIcon = () => (
  <svg className="text-white" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default Webinar;
