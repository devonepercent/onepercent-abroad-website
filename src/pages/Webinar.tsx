import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackMetaEvent } from "@/lib/metaPixel";
import logoWhite from "@/assets/logo-white.png";
import Footer from "@/components/Footer";

const WEBINAR_NAME = "7 Reasons Brilliant Students Get Rejected Webinar (11 September 2026)";
const JOIN_URL = "https://meet.google.com/bba-tewz-jpq";

// 7:00-8:00 PM IST on 11 Sep 2026 = 13:30-14:30 UTC.
const STARTS_AT = Date.UTC(2026, 8, 11, 13, 30, 0);

const CALENDAR_URL = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: "TEMPLATE",
  text: "The 7 Reasons Brilliant Students Get Rejected | 1% Abroad",
  dates: "20260911T133000Z/20260911T143000Z",
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

const REASONS = [
  {
    title: "Choosing the wrong university fit",
    body: "Picking by ranking rather than fit, and how an admissions reader spots an application that never really looked at the course.",
  },
  {
    title: "Writing a generic SOP",
    body: "The statement that could have been sent anywhere, and what a reader is actually looking for in the opening paragraph.",
  },
  {
    title: "Having a weak academic narrative",
    body: "Grades and subject choices that never add up to a story, and how to build one out of what you already have.",
  },
  {
    title: "Showing no clear evidence of subject interest",
    body: "Claiming a subject you love versus proving it. Which kinds of evidence carry weight, and which get ignored.",
  },
  {
    title: "Getting poor or ineffective recommendations",
    body: "Who to ask, when to ask them, and why the most senior name often writes the weakest letter.",
  },
  {
    title: "Applying too broadly without a strategy",
    body: "Why a long, unfocused list quietly lowers your odds everywhere instead of spreading your risk.",
  },
  {
    title: "Assuming marks alone are enough",
    body: "The highest scorer in the room still gets rejected. We go through what the rest of the decision rests on.",
  },
];

const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes. The session is free to attend and there is nothing to buy on the call. Register and the joining link is emailed to you straight away.",
  },
  {
    q: "Will there be a recording?",
    a: "The session is built around a live Q&A, so attending live is where the value is. Register anyway and we will email you if a recording is made available.",
  },
  {
    q: "I have not picked a course or university yet. Should I still join?",
    a: "Especially then. Several of the seven mistakes are made long before anything is submitted, and those are the ones that are hardest to undo later.",
  },
  {
    q: "I have already sent my applications. Is it too late?",
    a: "Not for the next round. Plenty of students on the call are reapplying, and understanding why the last attempt fell short is exactly the point of the hour.",
  },
  {
    q: "How do I join on the day?",
    a: "Your confirmation email carries the Google Meet link. We also send a reminder an hour before, and another the moment we go live.",
  },
  {
    q: "Can I ask my own questions?",
    a: "Yes. The session closes with a live Q&A, and you can put questions in the chat at any point.",
  },
];

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; live: boolean };

const readTimeLeft = (): TimeLeft => {
  const diff = STARTS_AT - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, live: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    live: false,
  };
};

const Webinar = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(readTimeLeft);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Free Webinar: Why Brilliant Students Get Rejected | 1% Abroad";
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(readTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // The sticky bar would cover the form it points at, so it hides whenever the
  // form is already on screen.
  useEffect(() => {
    const node = formRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [registered]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  const inputClass =
    "w-full rounded-xl border border-[#242424] bg-[#141414] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/25 focus:border-[#E8B44A] focus:ring-2 focus:ring-[#E8B44A]/20";

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-display text-white antialiased">
      {/* ---------- MINIMAL BAR ----------
          Deliberately no site nav: this page has one job. */}
      <header className="sticky top-0 z-40 border-b border-[#1A1A1A] bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" aria-label="1% Abroad home">
            <img src={logoWhite} alt="1% Abroad" className="h-7 w-auto sm:h-8" />
          </Link>
          <button
            onClick={scrollToForm}
            className="rounded-lg bg-[#E8B44A] px-4 py-2 text-[13px] font-bold text-black transition hover:bg-[#F0C264] sm:px-5 sm:text-sm"
          >
            Register free
          </button>
        </div>
      </header>

      <main>
        {/* ---------- HERO ---------- */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full opacity-[0.18] blur-[130px]"
            style={{ background: "radial-gradient(circle, #E8B44A 0%, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-40 h-[460px] w-[460px] rounded-full opacity-[0.16] blur-[130px]"
            style={{ background: "radial-gradient(circle, #61A2FE 0%, transparent 70%)" }}
          />

          <div className="relative mx-auto grid max-w-6xl gap-11 px-5 pt-11 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-16">
            {/* --- Left: the pitch --- */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E8B44A]/25 bg-[#E8B44A]/[0.08] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8B44A]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8B44A] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8B44A]" />
                </span>
                {timeLeft.live ? "Live now" : "Free live webinar · Today"}
              </span>

              <h1 className="mt-6 text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.85rem] lg:text-[3.1rem]">
                The 7 reasons brilliant students{" "}
                <em className="font-serif text-[1.1em] font-semibold italic text-[#E8B44A]">
                  get rejected
                </em>{" "}
                by top universities
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/55 sm:text-[17px]">
                Strong students with strong marks are turned down every year, and almost never for
                the reason they assume. One hour on the seven mistakes behind it, live, with a
                Q&amp;A at the end.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Chip label="Friday, 11 September" />
                <Chip label="7:00 PM IST" />
                <Chip label="Online" />
                <Chip label="Free" accent />
              </div>

              <div className="mt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/30">
                  {timeLeft.live ? "The session has started" : "Starts in"}
                </p>
                {timeLeft.live ? (
                  <p className="mt-2.5 text-lg font-semibold text-[#E8B44A]">
                    Register now and the joining link reaches you instantly.
                  </p>
                ) : (
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    <TimeBox value={timeLeft.days} unit="days" />
                    <TimeBox value={timeLeft.hours} unit="hrs" />
                    <TimeBox value={timeLeft.minutes} unit="min" />
                    <TimeBox value={timeLeft.seconds} unit="sec" />
                  </div>
                )}
              </div>
            </div>

            {/* --- Right: the form, above the fold --- */}
            <div ref={formRef} className="lg:pt-1">
              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0B0B0B] p-6 shadow-[0_28px_80px_-24px_rgba(0,0,0,1)] sm:p-7">
                {registered ? (
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8B44A]/12">
                      <TickIcon />
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-bold">You&apos;re registered</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/55">
                      Thanks, {name.trim().split(/\s+/)[0]}. Your seat for{" "}
                      <span className="font-semibold text-white">11 September, 7:00 PM IST</span> is
                      confirmed.
                    </p>

                    <a
                      href={CALENDAR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8B44A] px-6 py-4 text-base font-bold text-black transition hover:bg-[#F0C264] active:scale-[0.99]"
                    >
                      <CalendarPlusIcon />
                      Add to Google Calendar
                    </a>

                    <div className="mt-4 rounded-xl border border-[#1F1F1F] bg-[#101010] px-5 py-4 text-left">
                      <p className="font-display text-sm font-semibold text-white">
                        What happens next
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-white/50">
                        A confirmation email is on its way to{" "}
                        <span className="font-semibold text-white/80">
                          {email.trim().toLowerCase()}
                        </span>{" "}
                        with the joining link. We&apos;ll also send a reminder an hour before we go
                        live. If you don&apos;t see it, check spam or promotions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-[1.4rem] font-bold leading-snug sm:text-2xl">
                      Save your seat
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-white/45">
                      Free to attend. The joining link is emailed to you the moment you register.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
                      <div>
                        <label
                          htmlFor="webinar-name"
                          className="mb-1.5 block text-[13px] font-medium text-white/65"
                        >
                          Full name
                        </label>
                        <input
                          id="webinar-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          autoComplete="name"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="webinar-email"
                          className="mb-1.5 block text-[13px] font-medium text-white/65"
                        >
                          Email
                        </label>
                        <input
                          id="webinar-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="webinar-phone"
                          className="mb-1.5 block text-[13px] font-medium text-white/65"
                        >
                          WhatsApp number
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            aria-label="Country code"
                            className="w-[92px] shrink-0 rounded-xl border border-[#242424] bg-[#141414] px-2 py-3.5 text-[14px] text-white outline-none transition focus:border-[#E8B44A] focus:ring-2 focus:ring-[#E8B44A]/20"
                          >
                            {COUNTRY_CODES.map((cc) => (
                              <option key={cc.code} value={cc.code} className="bg-[#141414]">
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
                            autoComplete="tel"
                            className={`${inputClass} min-w-0 flex-1`}
                          />
                        </div>
                      </div>

                      {error && (
                        <p
                          role="alert"
                          className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-center text-[13px] font-medium text-red-300"
                        >
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-[#E8B44A] px-6 py-4 text-[16px] font-bold text-black shadow-[0_12px_34px_-10px_rgba(232,180,74,0.55)] transition hover:bg-[#F0C264] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? "Registering…" : "Register free"}
                      </button>

                      <p className="pt-0.5 text-center text-[12px] leading-relaxed text-white/30">
                        No cost, no pitch. We&apos;ll send the link and a reminder, nothing else.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Graduates as the floor the hero stands on — masked so it dissolves
              into the black rather than ending on a hard crop. */}
          <div aria-hidden className="pointer-events-none relative mx-auto -mt-2 max-w-6xl px-5">
            <div
              className="absolute bottom-0 left-1/2 h-[75%] w-[min(1000px,100%)] -translate-x-1/2 rounded-[50%] opacity-[0.28] blur-[90px]"
              style={{ background: "radial-gradient(ellipse at center, #61A2FE 0%, transparent 70%)" }}
            />
            <img
              src="/graduates.webp"
              alt=""
              loading="lazy"
              className="relative mx-auto block h-[195px] w-auto max-w-full object-contain sm:h-[270px] lg:h-[370px]"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, #000 72%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, #000 72%, transparent 100%)",
              }}
            />
          </div>
        </section>

        {/* ---------- ABOUT ---------- */}
        <section className="border-t border-[#141414]">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:py-20">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8B44A]">
              About the webinar
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-[-0.01em] sm:text-[2.3rem]">
              Good marks. Strong profile.
              <br className="hidden sm:block" /> Rejected anyway.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
              Join this free live session by{" "}
              <span className="font-semibold text-white">1% Abroad</span> for a dedicated hour on why
              top universities turn down students who, on paper, look like they should have got in —
              and what to do differently while there is still time to change it.
            </p>
            <p className="mx-auto mt-5 max-w-2xl font-serif text-[1.35rem] italic text-white/75 sm:text-[1.6rem]">
              Set a reminder. Join live. Come prepared with your questions.
            </p>
          </div>
        </section>

        {/* ---------- THE SEVEN REASONS ---------- */}
        <section className="border-t border-[#141414] bg-[#050505]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#61A2FE]">
              What we&apos;ll cover
            </p>
            <h2 className="mt-3 max-w-2xl text-[1.7rem] font-bold leading-tight tracking-[-0.01em] sm:text-[2.3rem]">
              Seven mistakes that decide the outcome
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {REASONS.map((item, i) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-[#1A1A1A] bg-[#0B0B0B] p-6 transition hover:border-[#E8B44A]/30"
                >
                  <span className="font-serif text-[2rem] font-semibold leading-none text-[#E8B44A]/30 transition group-hover:text-[#E8B44A]/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-[1.05rem] font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/45">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#E8B44A]/20 bg-[#E8B44A]/[0.05] p-6">
              <h3 className="font-display text-[1.05rem] font-bold text-[#E8B44A]">
                Then, a live Q&amp;A
              </h3>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/50">
                Bring the part of your own application you are least sure about. Come prepared and
                you&apos;ll leave knowing exactly what to fix first.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- HOST ---------- */}
        <section className="border-t border-[#141414]">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0B0B0B] p-7 sm:p-9">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8B44A]">
                Hosted by
              </p>
              <h2 className="mt-3 text-[1.55rem] font-bold leading-tight tracking-[-0.01em] sm:text-[1.9rem]">
                Gayathri Praveenkumar
              </h2>
              <p className="mt-1.5 text-[14px] font-semibold text-white/45">
                Senior Mentor, 1% Abroad
              </p>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/55">
                Gayathri mentors students through applications to top universities at 1% Abroad. She
                takes the session herself and answers your questions live at the end.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="border-t border-[#141414]">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-20">
            <h2 className="text-center text-[1.7rem] font-bold leading-tight tracking-[-0.01em] sm:text-[2.3rem]">
              Before you register
            </h2>

            <div className="mt-10 divide-y divide-[#181818] border-y border-[#181818]">
              {FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={faq.q}>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-5 py-5 text-left transition hover:text-[#E8B44A]"
                    >
                      <span className="text-[15px] font-semibold sm:text-base">{faq.q}</span>
                      <span
                        className={`shrink-0 text-[#E8B44A] transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                        aria-hidden
                      >
                        <PlusIcon />
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pr-6 text-[14px] leading-relaxed text-white/50">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- CLOSING CTA ----------
            Fades from black into the footer's #050505 so the seam doesn't read
            as a band. */}
        <section
          className="relative overflow-hidden border-t border-[#141414]"
          style={{ background: "linear-gradient(to bottom, #000000 55%, #050505 100%)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[min(700px,100%)] -translate-x-1/2 rounded-full opacity-[0.13] blur-[130px]"
            style={{ background: "radial-gradient(circle, #E8B44A 0%, transparent 70%)" }}
          />
          <div className="relative mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
            <h2 className="text-[1.85rem] font-bold leading-tight tracking-[-0.01em] sm:text-[2.5rem]">
              Set a reminder. Join live.
              <br />
              <span className="text-[#E8B44A]">Come with questions.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-white/50">
              Friday, 11 September at 7:00 PM IST. It costs nothing but an hour, and it may be the
              hour that changes what you apply for.
            </p>
            <button
              onClick={scrollToForm}
              className="mt-8 rounded-xl bg-[#E8B44A] px-9 py-4 text-[16px] font-bold text-black shadow-[0_14px_40px_-10px_rgba(232,180,74,0.5)] transition hover:bg-[#F0C264] active:scale-[0.99]"
            >
              Register free
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* ---------- MOBILE STICKY CTA ---------- */}
      {!registered && (
        <div
          className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#1F1F1F] bg-black/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 lg:hidden ${
            showStickyBar ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-white">
                {timeLeft.live ? "Live now" : "Today, 7:00 PM IST"}
              </p>
              <p className="truncate text-[11px] text-white/40">Free · Why students get rejected</p>
            </div>
            <button
              onClick={scrollToForm}
              className="shrink-0 rounded-lg bg-[#E8B44A] px-5 py-3 text-[14px] font-bold text-black transition active:scale-[0.98]"
            >
              Register free
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Chip = ({ label, accent = false }: { label: string; accent?: boolean }) => (
  <span
    className={`rounded-lg border px-3.5 py-2 text-[13px] font-semibold ${
      accent
        ? "border-[#E8B44A]/30 bg-[#E8B44A]/[0.08] text-[#E8B44A]"
        : "border-[#1F1F1F] bg-[#0D0D0D] text-white/65"
    }`}
  >
    {label}
  </span>
);

const TimeBox = ({ value, unit }: { value: number; unit: string }) => (
  <div className="min-w-[60px] rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] px-3 py-2.5 text-center">
    <div className="font-serif text-[1.7rem] font-semibold leading-none tabular-nums text-white">
      {String(value).padStart(2, "0")}
    </div>
    <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
      {unit}
    </div>
  </div>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
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
  <svg className="text-[#E8B44A]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default Webinar;
