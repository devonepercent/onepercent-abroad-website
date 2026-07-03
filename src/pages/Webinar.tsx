import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WEBINAR_NAME = "Building a Competitive Profile in 2026 (3 July 2026)";
const MEET_URL = "https://meet.google.com/bba-tewz-jpq";
const CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Webinar+on+Building+a+competitive+profile+in+2026&dates=20260703T140000Z%2F20260703T150000Z&details=%F0%9F%8E%AF+Building+a+Competitive+Profile+in+2026%0A%0AIf+you%27re+planning+to+study+abroad+and+want+to+understand+what+universities+are+actually+looking+for%2C+this+session+is+for+you.&location=https%3A%2F%2Fmeet.google.com%2Fbba-tewz-jpq";
const BANNER_SRC = "/webianr%20banner.png";

const AGENDA = [
  "Build a standout profile that gets noticed",
  "What top universities actually look for in 2026",
  "How to position your story for competitive programs",
  "Avoid the common mistakes most applicants make",
];

const Webinar = () => {
  const [name, setName] = useState("");

  // Fire-and-forget: capture the name if provided, never block the CTA.
  const recordRegistration = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    supabase
      .from("webinar_registrations")
      .insert({
        name: trimmed,
        email: "",
        country_code: "",
        phone_number: "",
        webinar_name: WEBINAR_NAME,
      })
      .then(({ error }) => {
        if (error) console.error("Webinar registration error:", error);
      });
  };

  const openCalendar = () => {
    recordRegistration();
    window.open(CALENDAR_URL, "_blank", "noopener,noreferrer");
  };

  const openMeet = () => {
    recordRegistration();
    window.open(MEET_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-display text-slate-900">
      <Header />

      <main className="flex-1">
        {/* ---------- HERO ---------- */}
        <section className="mx-auto max-w-5xl px-4 pt-8 sm:pt-12">
          <img
            src={BANNER_SRC}
            alt="Live Webinar. Building a Competitive Profile in 2026 with Favaz MP, Chief Mentor at 1%Abroad"
            className="w-full rounded-2xl shadow-xl ring-1 ring-black/5"
          />

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              Live Webinar
            </span>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Building a Competitive Profile in 2026
            </h1>

            <p className="mt-3 text-base font-medium text-slate-600 sm:text-lg">
              Friday, 3 July 2026 · 7:30 PM IST · 60 minutes
            </p>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Join us live to learn what universities are actually looking for, and how to
              stand out.
            </p>

            {/* Optional name capture — does not block the CTA */}
            <div className="mx-auto mt-6 max-w-sm">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* CTAs */}
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={openCalendar}
                className="inline-flex origin-center items-center justify-center gap-2 rounded-xl bg-blue-700 px-8 py-4 text-lg font-bold text-white ring-4 ring-blue-200 transition animate-[wiggle_3.5s_ease-in-out_infinite,glow-pulse_2s_ease-in-out_infinite] hover:bg-blue-800 hover:animate-none active:scale-[0.99]"
              >
                <BellIcon />
                Remind Me
              </button>
              <button
                onClick={openMeet}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-700 px-6 py-3 text-base font-semibold text-blue-700 transition hover:bg-blue-50 active:scale-[0.99]"
              >
                Join the Webinar
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Adds it to your Google Calendar so you get a notification. The join link is also
              above.
            </p>
          </div>
        </section>

        {/* ---------- EVENT DETAILS ---------- */}
        <section className="mx-auto mt-14 max-w-3xl px-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <DetailCard label="Date & Time" value="Fri, 3 July 2026" sub="7:30 PM IST (GMT+5:30)" />
            <DetailCard label="Duration" value="60 minutes" sub="Live + Q&A" />
            <DetailCard label="Where" value="Google Meet" sub="Link above" />
          </div>

          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white">
              FM
            </div>
            <div>
              <p className="text-base font-semibold">Favaz MP</p>
              <p className="text-sm text-slate-500">Chief Mentor · 1%Abroad</p>
              <p className="mt-1 text-sm text-slate-600">
                Guiding students into the world&apos;s top universities.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-slate-600">
            If you&apos;re planning to study abroad and want to understand what universities are
            actually looking for, this session is for you. Walk away knowing exactly how to build
            a profile that competes at the top.
          </p>
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

        {/* ---------- FINAL CTA ---------- */}
        <section className="mx-auto mt-14 mb-16 max-w-3xl px-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-center text-white">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Save your spot, it&apos;s free</h2>
            <p className="mt-2 text-blue-100">Friday, 3 July 2026 · 7:30 PM IST</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={openCalendar}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-blue-800 shadow-lg transition hover:bg-blue-50 active:scale-[0.99]"
              >
                <BellIcon />
                Remind Me
              </button>
              <button
                onClick={openMeet}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/70 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.99]"
              >
                Join the Webinar
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const DetailCard = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    <p className="text-sm text-slate-500">{sub}</p>
  </div>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = () => (
  <svg className="mt-0.5 shrink-0 text-blue-700" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default Webinar;
