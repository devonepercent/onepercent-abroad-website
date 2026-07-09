import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { inclusions, PRICE } from "@/lib/erasmusData";

// ─────────────────────────────────────────────────────────────────────────────
// 1:1 layout clone of leapscholar.com/exams/ielts/preparation-online
// (saved reference: Downloads/saveweb2zip-com-leapscholar-com).
// Placeholder imagery lives in /public/leap — swap for real assets later.
// Content slots hold Erasmus copy; edit freely, layout stays.
// ─────────────────────────────────────────────────────────────────────────────

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

// Their custom utility classes, reproduced verbatim from the reference CSS.
const REF_CSS = `
.font-poppins { font-family: Poppins, sans-serif; }
.font-inter { font-family: Inter, sans-serif; }
.text-primary { color: #065DC7; }
.bg-37 { background-image: linear-gradient(80.67deg, #61A2FE 14.27%, #065DC7 85.65%); }
.shadow-11 { box-shadow: 0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814; }
.shadow-8 { box-shadow: 0px 2px 4px -2px #1018280F, 0px 4px 8px -2px #1018281A; }
.shadow-6 { box-shadow: 0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
details summary::-webkit-details-marker { display: none; }
details[open] .faq-arrow { transform: rotate(180deg); }
html { scroll-behavior: smooth; }
#erasmus-form { scroll-margin-top: 88px; }
@media (max-width: 640px) {
  .erz-hero { padding-top: 32px !important; padding-left: 16px !important; padding-right: 16px !important; }
}
`;

// Green tick used in the hero bullet list (their check-circle, simplified).
const GreenTick = () => (
  <span className="min-w-5 min-h-5">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#1DD882" />
      <path d="M6 10.2 8.7 13 14 7.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </span>
);

// Purple tick used in the dark-section cards (their seo_tick_icon).
const PurpleTick = () => (
  <img src="/leap/seo_tick_icon.svg" width="40" height="40" alt="" className="hidden md:block" />
);

// Flanking decorative heading lines (dark + white variants).
const HeadingLines = ({ children, white = false }: { children: React.ReactNode; white?: boolean }) => (
  <div
    className={`flex justify-center gap-4 md:gap-0 items-center md:items-start font-poppins font-semibold md:text-[32px] md:leading-10 mb-3 ${
      white ? "text-white" : "text-[#040B2B]"
    }`}
  >
    <img
      alt=""
      className="max-w-[24px] min-w-[24px] md:hidden"
      src={white ? "/leap/seo_white_line.svg" : "/leap/mweb_seo_lin.svg"}
    />
    <img
      alt=""
      className="hidden md:block md:max-w-[150px] md:min-w-[24px] md:w-[150px]"
      src={white ? "/leap/seo_white_line_web.svg" : "/leap/heading_line_seo.svg"}
    />
    <h2 className="md:mx-12 text-center md:min-w-[530px] whitespace-normal md:whitespace-nowrap text-[20px] md:text-[32px] md:leading-10 leading-[26px] font-semibold font-poppins">
      {children}
    </h2>
    <img
      alt=""
      className="rotate-180 hidden md:block md:max-w-[150px] md:min-w-[24px] md:w-[150px]"
      src={white ? "/leap/seo_white_line_web.svg" : "/leap/heading_line_seo.svg"}
    />
    <img
      alt=""
      className="rotate-180 max-w-[24px] min-w-[24px] md:hidden"
      src={white ? "/leap/seo_white_line.svg" : "/leap/mweb_seo_lin.svg"}
    />
  </div>
);

const ApplicationErasmus = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <main className="flex flex-col bg-[#FBFDFF] text-[#040B2B] font-inter">
      <style dangerouslySetInnerHTML={{ __html: REF_CSS }} />

      <FloatingNav />
      <HeroSection />
      <TicksCtaSection />

      {/* Trust → value → price → ask */}
      <div className="md:max-w-[1248px] mx-auto w-full">
        <WhyChooseSection />
        <MentorsSection />
        <WinnersSection />
        <FormSection />
      </div>

      <DarkResourcesSection />
      <FaqSection />
      <FinalCtaSection />

      <Footer />
    </main>
  );
};

// ─────────────────────────────────────────────── Floating hamburger + nav overlay
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

const FloatingNav = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-4 right-4 z-[90] w-12 h-12 flex items-center justify-center rounded-full bg-[#040B2B]/35 backdrop-blur-md border border-white/25 text-white shadow-lg"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-[#040B2B]/95 backdrop-blur-lg flex flex-col">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/25 text-white"
          >
            <X size={22} />
          </button>

          <nav className="flex-1 flex flex-col items-center justify-center gap-7">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-white font-poppins font-semibold text-[22px] md:text-[26px] hover:text-[#61A2FE] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6 w-[280px] md:w-auto">
              <a
                href="#erasmus-form"
                onClick={() => setOpen(false)}
                className="bg-37 block text-center shadow-8 font-semibold font-poppins text-[16px] leading-4 text-white py-4 px-8 rounded-[56px]"
              >
                Book Free Consultation
              </a>
              <Link
                to="/application/erasmus/programs"
                onClick={() => setOpen(false)}
                className="block text-center font-semibold font-poppins text-[16px] leading-4 text-white py-4 px-8 rounded-[56px] border-2 border-white/70"
              >
                Browse Programmes
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────── First fold: original full-bleed video hero
const HeroSection = () => {
  const [muted, setMuted] = useState(true);
  return (
  <section className="md:pb-12">
    <div style={{ position: "relative", overflow: "hidden", background: "#040B2B" }}>
      {/* Full-bleed vertical background video */}
      <video
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        poster="/erasmus-hero.jpg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(1.25)",
          transform: "translate(10%, -5%) scale(1.2)",
          zIndex: 0,
        }}
      >
        <source src="/erasmus-hero.mp4" type="video/mp4" />
      </video>

      {/* Legibility overlay — keeps white copy readable over the footage */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(4,11,43,0.72) 0%, rgba(4,11,43,0.45) 42%, rgba(4,11,43,0) 100%)",
        }}
      />

      <div
        className="erz-hero"
        style={{
          position: "relative",
          zIndex: 2,
          transform: "translateY(-7%)",
          maxWidth: 820,
          margin: "0 auto",
          padding: "112px 24px 116px",
          minHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            marginBottom: 24,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Erasmus Mundus · Application Filing
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(36px, 6vw, 62px)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.5px",
            color: "#fff",
            margin: "0 auto 24px",
            maxWidth: 800,
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          Apply to <em style={{ fontStyle: "italic", color: "#61A2FE" }}>fully-funded</em> Erasmus Mundus master's programmes
        </h1>

        <p
          style={{
            fontSize: "clamp(15px,1.8vw,18px)",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.82)",
            maxWidth: 560,
            margin: "0 auto 36px",
            textShadow: "0 1px 16px rgba(0,0,0,0.3)",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          All-inclusive filing for every application — and a shot at a fully-funded scholarship worth{" "}
          <strong style={{ color: "#fff", fontWeight: 700 }}>₹40 lakh+</strong>.
        </p>
      </div>

      {/* Sound toggle — browsers require a user tap before audio can play */}
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute video" : "Mute video"}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 3,
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.35)",
          background: "rgba(4,11,43,0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>

    {/* Stats bar — compact 2×2 grid on mobile */}
    <div className="md:hidden bg-white shadow-sm mx-4 -mt-4 rounded-2xl grid grid-cols-2 gap-y-6 py-6 px-5 relative z-[3]">
      {[
        ["40+", "Programmes Covered"],
        ["₹40 Lakh+", "Scholarship Value"],
      ].map(([v, l]) => (
        <div key={l} className="flex flex-col items-center text-center">
          <span className="font-semibold font-inter text-[#040B2B] text-[18px] leading-[20px]">{v}</span>
          <span className="font-normal opacity-80 mt-2 text-[12px] text-[#6B7A99] leading-4">{l}</span>
        </div>
      ))}
    </div>

    {/* Floating stats bar (desktop) */}
    <div className="hidden md:block bg-white shadow-sm max-w-[1248px] mx-auto -mt-[62px] py-7 rounded-3xl z-[3] relative">
      <div className="max-w-6xl w-full flex justify-center items-center font-inter text-base font-semibold">
        <div className="flex">
          <div className="flex flex-col items-start px-14">
            <span className="text-lg font-semibold font-inter text-[#040B2B] text-[20px] leading-[20px]">40+</span>
            <span className="font-normal opacity-80 mt-3 text-base text-[#6B7A99] leading-4">Programmes Covered</span>
          </div>
          <div className="flex flex-col items-start px-14 border-l border-gray-300">
            <span className="text-lg font-semibold font-inter text-[#040B2B] text-[20px] leading-[20px]">₹40 Lakh+</span>
            <span className="font-normal opacity-80 mt-3 text-base text-[#6B7A99] leading-4">Scholarship Value</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

// ─────────────────────────────────────────────── Ticks + CTAs (below hero)
const TicksCtaSection = () => (
  <section className="py-8 md:py-12 px-4">
    <div className="md:max-w-[1248px] mx-auto flex flex-col items-center">
      <div className="flex flex-col md:flex-row gap-4 md:gap-12 md:items-center mb-8">
        {["End-to-End Application Filing", "SOP & LORs Drafted by Experts", `Flat ${inr(PRICE)} per Application`].map(
          (t) => (
            <div key={t} className="flex items-center">
              <GreenTick />
              <p className="font-inter font-medium text-[14px] leading-[14px] md:text-[18px] md:leading-[20px] text-[#040B2B] ml-2">
                {t}
              </p>
            </div>
          ),
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto md:min-w-[560px]">
        <a
          href="#erasmus-form"
          className="bg-37 w-full md:w-auto md:flex-1 block text-center shadow-8 font-semibold font-poppins text-[16px] leading-4 md:text-[18px] md:leading-6 text-white py-5 md:px-8 rounded-[56px]"
        >
          Book Free Consultation
        </a>
        <Link
          to="/application/erasmus/programs"
          className="w-full md:w-auto md:flex-1 block text-center font-semibold font-poppins text-[16px] leading-4 md:text-[18px] md:leading-6 text-[#065DC7] py-5 md:px-8 rounded-[56px] border-2 border-[#065DC7] bg-white"
        >
          Browse 40+ Programmes
        </Link>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────── Why choose (3 USP cards)
const uspCards = [
  {
    icon: "/leap/IELTS_PREP_SVG_IMG_SEO_1.svg",
    highlight: "Students Placed",
    rest: "in Top Universities",
    body: "Real admits into fully-funded Erasmus Mundus programmes across Europe",
  },
  {
    icon: "/leap/IELTS_PREP_SVG_IMG_SEO_2.svg",
    highlight: "₹40 Lakh+",
    rest: "Scholarships",
    body: "Full tuition, travel and a monthly living stipend covered by the EU grant",
  },
  {
    icon: "/leap/IELTS_PREP_SVG_IMG_SEO_3.svg",
    highlight: "Flat " + inr(PRICE),
    rest: "Per Application",
    body: "All-inclusive filing — agencies charge ₹25,000+ for the same work",
  },
];

const WhyChooseSection = () => (
  <section className="py-10 md:py-16 pl-4 md:pl-0 md:px-0">
    <div className="pr-4 md:pr-0">
      <HeadingLines>
        <span className="whitespace-normal">Why choose OnePercent for your</span> <br className="hidden md:block" />
        <span className="whitespace-break-spaces">Erasmus Application</span>
      </HeadingLines>
    </div>

    <div className="relative">
      <div className="flex gap-4 md:gap-8 text-[#040B2B] overflow-x-scroll scrollbar-hide scroll-smooth pb-5 pr-4 md:pr-0">
        {uspCards.map((c) => (
          <div
            key={c.rest}
            className="min-w-[288px] md:min-w-[394px] rounded-3xl shadow-11 p-6 bg-white flex flex-col"
          >
            <img src={c.icon} alt="" className="mb-5 w-12 h-12" />
            <h4 className="font-poppins text-[20px] leading-[26px] md:text-[24px] md:leading-8 font-semibold mb-2">
              <span className="text-primary">{c.highlight}</span> {c.rest}
            </h4>
            <p className="font-inter text-[16px] leading-6 font-normal">{c.body}</p>
          </div>
        ))}
      </div>
      {/* Dot indicators (mobile) */}
      <div className="flex justify-center mt-1 space-x-2 md:hidden ml-[-16px]">
        <div className="w-2 h-2 rounded-full bg-[#065DC7] transition-all" />
        <div className="w-2 h-2 rounded-full bg-[#C4D2E6] transition-all" />
        <div className="w-2 h-2 rounded-full bg-[#C4D2E6] transition-all" />
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────── Lead form (their multi-step)
const pillClass = (checked: boolean) =>
  `cursor-pointer min-w-[90px] shadow-8 md:p-2 bg-white flex justify-center items-center px-3 py-3 border text-center text-xs md:text-sm tracking-normal rounded-[12px] font-inter font-medium h-full leading-[15.6px] md:leading-[18.2px] md:py-4 ${
    checked ? "border-[#065DC7] border-2 bg-[#EBF2FF] text-[#040B2B]" : "border-[#DCE7F6] text-[#6B7A99]"
  }`;

const FormSection = () => {
  const [career, setCareer] = useState("");
  const [intake, setIntake] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const step1Done = career !== "" && intake !== "";

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/[0-9]{7,}/.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number.");
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase
      .from("erasmus_call_requests" as never)
      .insert({ name: name.trim(), phone: phone.trim(), source: "erasmus" } as never);
    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong — please try again in a moment.");
      return;
    }
    setStep(3);
  };

  return (
    <div className="py-10 md:py-16" id="erasmus-form">
      <div className="flex border border-[#B9D3F1] rounded-[16px] md:rounded-[32px] mx-4 md:mx-0 bg-[#F5F8FF] min-h-[491px]">
        {/* Left image (placeholder from reference) */}
        <img
          className="hidden md:block min-w-[499px] h-[513px] rounded-[32px] object-cover"
          src="/leap/student_seo_form.webp"
          alt="Student Form"
        />

        <div className="w-full">
          <section className="md:w-[747px] relative w-full pb-4 md:px-16 md:py-8 bg-white justify-between h-full rounded-[16px] md:rounded-[32px]">
            <div className="md:p-0 flex flex-col items-center justify-between md:min-h-[449px] m-auto bg-[linear-gradient(180deg,#EEF4FF_0%,#FFF_100%)] md:bg-none rounded-[16px] md:rounded-[32px] h-full">
              <div className="flex flex-col w-full">
                <div className="flex flex-col leading-[14px] text-[18px] whitespace-nowrap items-center gap-[6px] py-5 md:py-0 md:pb-7 px-4 md:px-0">
                  <p className="text-[18px] md:text-[20px] md:w-full text-center font-poppins font-semibold leading-[23.4px] md:leading-[32px]">
                    Start your Erasmus Journey
                  </p>
                  {step !== 3 && (
                    <p className="text-[12px] md:text-[13px] text-[#6B7A99] font-inter text-center w-full">
                      Step {step} of 2
                    </p>
                  )}
                </div>

                {step === 1 && (
                  <div className="flex flex-col w-full items-center text-center md:items-stretch md:min-w-[620px] p-4 md:p-0">
                    <div className="mb-8 w-full">
                      <p className="text-[14px] text-left md:text-[16px] leading-4 font-poppins font-semibold mb-3">
                        What do you do?
                      </p>
                      <div className="grid grid-cols-3 gap-3 auto-rows-fr items-stretch">
                        {["Student", "Working", "Recently Graduated"].map((v) => (
                          <button key={v} type="button" onClick={() => setCareer(v)} className={pillClass(career === v)}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-8 w-full">
                      <p className="text-[14px] text-left md:text-[16px] leading-4 font-poppins font-semibold mb-3">
                        When do you plan to start your Master's?
                      </p>
                      <div className="grid grid-cols-3 gap-3 auto-rows-fr items-stretch">
                        {["September 2026", "September 2027", "Not decided yet"].map((v) => (
                          <button key={v} type="button" onClick={() => setIntake(v)} className={pillClass(intake === v)}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col w-full items-center text-center md:items-stretch md:min-w-[620px] p-4 md:p-0">
                    <div className="mb-8 w-full">
                      <p className="text-[14px] text-left md:text-[16px] leading-4 font-poppins font-semibold mb-3">
                        Your name
                      </p>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        autoComplete="name"
                        className="w-full shadow-8 bg-white px-4 py-4 border border-[#DCE7F6] rounded-[12px] font-inter font-medium text-sm text-[#040B2B] outline-none focus:border-[#065DC7]"
                      />
                    </div>
                    <div className="mb-8 w-full">
                      <p className="text-[14px] text-left md:text-[16px] leading-4 font-poppins font-semibold mb-3">
                        Phone number
                      </p>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9XXXXXXXXX"
                        type="tel"
                        autoComplete="tel"
                        className="w-full shadow-8 bg-white px-4 py-4 border border-[#DCE7F6] rounded-[12px] font-inter font-medium text-sm text-[#040B2B] outline-none focus:border-[#065DC7]"
                      />
                      {error && <p className="text-red-600 text-sm mt-3 text-left">{error}</p>}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col w-full items-center text-center md:min-w-[620px] p-4 md:p-0 md:py-16">
                    <svg width="64" height="64" viewBox="0 0 20 20" fill="none" className="mb-6">
                      <circle cx="10" cy="10" r="10" fill="#1DD882" />
                      <path d="M6 10.2 8.7 13 14 7.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <p className="font-poppins font-semibold text-[20px] mb-2">We'll call you soon</p>
                    <p className="font-inter text-[#6B7A99] text-[14px] md:text-[16px] leading-6 mb-6">
                      Thanks, {name.trim().split(" ")[0]}. Our Erasmus team will reach out on your number shortly.
                    </p>
                    <Link
                      to="/application/erasmus/programs"
                      className="font-inter font-semibold text-[#065DC7] text-[14px] md:text-[16px] underline underline-offset-2"
                    >
                      Browse programmes while you wait →
                    </Link>
                  </div>
                )}
              </div>

              {step !== 3 && (
                <div className="w-full flex flex-col justify-center items-center mt-[-5px] px-4 text-white font-poppins font-semibold text-[16px] leading-[16px] md:text-[18px] md:leading-[18px]">
                  {step === 1 ? (
                    <>
                      <button
                        type="button"
                        disabled={!step1Done}
                        onClick={() => setStep(2)}
                        className={`p-4 rounded-[56px] w-full md:w-[380px] ${
                          step1Done ? "bg-37 cursor-pointer" : "bg-[#DDEAFB] cursor-not-allowed"
                        }`}
                      >
                        Next
                      </button>
                      {!step1Done && (
                        <p className="text-[12px] text-[#6B7A99] font-inter font-normal mt-3">
                          Select both options to continue
                        </p>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className={`p-4 rounded-[56px] w-full md:w-[380px] bg-37 ${submitting ? "opacity-60" : ""}`}
                    >
                      {submitting ? "Submitting…" : "Request Callback"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────── Success stories (home-screen achievers)
// Erasmus Mundus winners first, then admits into other top universities.
const successStories = [
  { img: "/images/achievers/Anjima Divakar.png", name: "Anjima Divakar", uni: "Erasmus Mundus", program: "EMMIR — Migration & Intercultural Relations" },
  { img: "/images/achievers/Fathima Lamshana.png", name: "Fathima Lamshana", uni: "Erasmus Mundus", program: "IMBRSea — Marine Biological Resources" },
  { img: "/images/achievers/Ahmed Shoeb.png", name: "Ahmed Shoeb", uni: "Johns Hopkins University", program: "MPH Scholarship, Bloomberg School of Public Health" },
  { img: "/images/achievers/Ashik Safar.png", name: "Ashik Safar", uni: "JGU Mainz, Germany", program: "Fully-Funded Nuclear Physics Internship, PRISMA+" },
  { img: "/images/achievers/Yakkoob Yussef.png", name: "Yakkoob Yussef", uni: "KU Leuven, Belgium", program: "InnoEnergy Masters+ Programme" },
  { img: "/images/achievers/Adnan.png", name: "Adnan", uni: "University of Glasgow", program: "Masters in Management" },
  { img: "/images/achievers/Aaqil Rayyan.png", name: "Aaqil Rayyan", uni: "University of Pisa, Italy", program: "Laurea Magistrale in Computer Science" },
  { img: "/images/achievers/Archana.png", name: "Archana", uni: "ACES Star Program", program: "Scholarship worth ₹15 Lakhs" },
];

const MentorsSection = () => (
  <section className="flex flex-col py-10 md:py-16">
    <div className="px-4 md:px-0">
      <HeadingLines>
        <span className="whitespace-normal">
          Our <span className="text-primary">Success Stories</span>
        </span>{" "}
        <br className="hidden md:block" />
        <span className="whitespace-break-spaces">Mentored into the World's Top Universities</span>
      </HeadingLines>
    </div>

    <div className="px-4 mb-8 md:mb-10">
      <div className="md:max-w-[822px] mx-auto">
        <p className="text-[#6B7A99] font-normal text-[14px] md:text-[16px] leading-5 md:leading-6 text-center">
          From fully-funded Erasmus Mundus scholars to admits at Johns Hopkins, KU Leuven and Glasgow — we have
          experience mentoring students into the world's top universities, with funding.
        </p>
      </div>
    </div>

    <div className="flex gap-3 md:gap-10 mb-8 md:mb-12 overflow-x-scroll scrollbar-hide pl-4 md:pl-0 pr-4 md:pr-0">
      {successStories.map((m) => (
        <div
          key={m.name}
          className="md:flex md:flex-row items-center relative min-w-[190px] md:min-w-[398.3px] pb-4 font-normal"
        >
          <div className="mx-auto md:z-[2]">
            <img
              className="w-[96px] h-[113.45px] md:w-[152.3px] md:h-[180px] mx-auto object-cover object-top rounded-xl"
              src={m.img}
              alt={m.name}
            />
          </div>
          <div className="h-[152px] mt-[-45px] md:mt-0 pb-[21px] md:py-8 md:pl-[60px] md:ml-[-40px] px-4 md:px-6 bg-white shadow-lg rounded-2xl md:z-[1] flex flex-col justify-end md:justify-center flex-grow md:min-w-0">
            <p className="mb-[10px] text-[#040B2B] font-poppins font-semibold md:text-[20px] md:leading-5 text-[14px] leading-[14px] text-center md:text-left">
              {m.name}
            </p>
            <p className="flex font-inter md:text-[15px] md:leading-4 text-[12px] leading-3 font-normal text-[#6B7A99] mb-2 items-center justify-center md:justify-start">
              <img width="16" height="16" className="mr-[3px] md:mr-[6px]" src="/leap/workspace_premium_seo.svg" alt="" />
              <span className="text-[#040B2B] font-bold">{m.uni}</span>
            </p>
            <p className="font-inter md:text-[14px] md:leading-5 text-[11px] leading-4 font-normal text-[#6B7A99] text-center md:text-left whitespace-normal">
              {m.program}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="px-4 md:px-0 md:max-w-[334px] md:mx-auto w-full">
      <a
        href="#erasmus-form"
        className="bg-37 w-full block text-center shadow-8 font-semibold font-poppins text-[16px] leading-4 md:text-[20px] md:leading-6 text-white py-5 md:px-11 rounded-[56px]"
      >
        Book Free Consultation
      </a>
    </div>
  </section>
);

// ─────────────────────────────────────────────── Everything included (flat fee)
const inclusionIcons = [
  "/leap/note_icon_LBq7a_bks.svg",
  "/leap/book_icon_1_wnYXOu1ElV.svg",
  "/leap/chat_icon_QlTt4yG6WW.svg",
  "/leap/speed_icon_xUV6R9Ivu.svg",
  "/leap/headphone_icon_g243t3cUQ4.svg",
  "/leap/group_connect_seo.svg",
];

const WinnersSection = () => (
  <section className="flex flex-col py-10 md:py-16 md:pb-[100px]">
    <div className="px-4 md:px-0">
      <HeadingLines>
        <span className="whitespace-normal">
          Everything Included in <span className="text-primary">Flat {inr(PRICE)}</span>
        </span>{" "}
        <br className="hidden md:block" />
        <span className="whitespace-break-spaces">per Application</span>
      </HeadingLines>
    </div>

    <div className="mx-4 mb-8 md:mb-10">
      <div className="md:max-w-[822px] mx-auto">
        <p className="text-[#6B7A99] font-normal text-[14px] md:text-[16px] leading-5 md:leading-6 text-center">
          One flat, all-inclusive fee per application — no hidden charges. Agencies charge ₹25,000+ for the same
          end-to-end filing.
        </p>
      </div>
    </div>

    <div className="relative">
      <div className="flex gap-6 overflow-x-scroll scrollbar-hide scroll-smooth pl-4 md:pl-0 pr-4">
        {inclusions.map((inc, i) => (
          <div
            key={inc.title}
            className="bg-gradient-to-b from-[#D6E6FF] to-[#EBF2FF] p-6 w-full md:min-w-[328px] min-w-[260px] rounded-xl flex flex-col"
          >
            <div className="w-[56px] h-[56px] bg-white rounded-xl border border-[#CFE2F8] flex items-center justify-center mb-5">
              <img alt="" src={inclusionIcons[i % inclusionIcons.length]} width="28" height="28" />
            </div>
            <p className="text-[#040B2B] font-poppins text-[18px] md:text-[20px] leading-6 font-semibold mb-2">
              {inc.title}
            </p>
            <p className="font-inter text-[#6B7A99] text-[14px] md:text-[15px] leading-5 md:leading-6">{inc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────── Dark purple resources section
const DarkResourcesSection = () => (
  <section className="bg-[#040B2B] rounded-t-3xl md:rounded-t-[64px] pb-16 py-10 md:py-16 px-4 md:pb-36 relative z-[2]">
    <HeadingLines white>
      Explore Erasmus
      <br /> <span>Application Support</span>
    </HeadingLines>

    <div className="mr-4 mb-8 md:mb-10 md:max-w-[1248px] md:mx-auto">
      <div className="md:max-w-[822px] mx-auto">
        <p className="!text-[#fff] font-normal text-[14px] md:text-[16px] leading-5 md:leading-6 text-center">
          Your Erasmus journey isn't complete without the right support. Browse the full programme catalogue, or let our
          team handle your SOPs, LORs and deadlines end-to-end.
        </p>
      </div>
    </div>

    <div className="flex flex-col md:flex-row gap-6 justify-center md:max-w-[1248px] md:mx-auto">
      {/* Card 1 — Programme catalogue */}
      <div className="flex flex-col gap-6 justify-center p-4 md:p-8 md:w-fit bg-white rounded-[20px] md:rounded-3xl w-full">
        <div className="flex flex-col md:flex-row md:gap-6">
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex gap-3 items-center h-[40px] mb-4 md:mb-5">
                <img alt="" width="40" height="40" src="/leap/frame_seo_icon_1.svg" />
                <h2 className="text-[#040B2B] font-inter font-semibold text-[16px] leading-[20px] md:text-[20px] md:leading-[26px]">
                  Programme Catalogue
                </h2>
              </div>
              <img src="/erasmus-catalogue.webp" alt="Programme catalogue illustration" className="w-full md:hidden mb-4 rounded-xl" />
              <ul className="font-inter font-normal">
                <li className="flex items-center gap-2 text-[16px] leading-6 mb-4 ml-0">
                  <PurpleTick />
                  <span className="font-inter leading-[21px] text-[14px] md:text-[16px] md:leading-6">
                    <span className="font-semibold">40+</span> Erasmus Mundus Programmes
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[16px] leading-6 mb-4 ml-0">
                  <PurpleTick />
                  <span className="font-inter leading-[21px] text-[14px] md:text-[16px] md:leading-6">
                    <span className="font-semibold">Every Field</span> — AI to Public Policy
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[16px] leading-6 mb-4 ml-0">
                  <PurpleTick />
                  <span className="font-inter leading-[21px] text-[14px] md:text-[16px] md:leading-6">
                    <span className="font-semibold">Flat {inr(PRICE)}</span> per Application
                  </span>
                </li>
              </ul>
            </div>
            <Link
              to="/application/erasmus/programs"
              className="py-[14px] w-full rounded-[56px] bg-[#040B2B] shadow-8 font-poppins font-semibold text-[16px] leading-[24px] text-white text-center inline-flex items-center justify-center"
            >
              Browse Programmes
            </Link>
          </div>
          <div>
            <img src="/erasmus-catalogue.webp" alt="Programme catalogue illustration" className="w-full md:w-[266px] md:h-[266px] hidden md:block rounded-xl object-cover" />
          </div>
        </div>
      </div>

      {/* Card 2 — SOP & LOR support */}
      <div className="flex flex-col gap-6 justify-center p-4 md:p-8 md:w-fit bg-white rounded-[20px] md:rounded-3xl w-full">
        <div className="flex flex-col md:flex-row md:gap-6">
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex gap-3 items-center h-[40px] mb-4 md:mb-5">
                <img alt="" width="40" height="40" src="/leap/frame_seo_icon_2.svg" />
                <h2 className="text-[#040B2B] font-inter font-semibold text-[16px] leading-[20px] md:text-[20px] md:leading-[26px]">
                  SOP &amp; LOR Support
                </h2>
              </div>
              <img src="/erasmus-sop-lor.webp" alt="SOP and LOR support illustration" className="w-full md:hidden mb-4 rounded-xl" />
              <ul className="font-inter font-normal">
                <li className="flex items-center gap-2 text-[16px] leading-6 mb-4 ml-0">
                  <PurpleTick />
                  <span className="font-inter leading-[21px] text-[14px] md:text-[16px] md:leading-6">
                    <span className="font-semibold">Tailored SOP</span> for Every Programme
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[16px] leading-6 mb-4 ml-0">
                  <PurpleTick />
                  <span className="font-inter leading-[21px] text-[14px] md:text-[16px] md:leading-6">
                    <span className="font-semibold">LORs</span> Drafted &amp; Managed
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[16px] leading-6 mb-4 ml-0">
                  <PurpleTick />
                  <span className="font-inter leading-[21px] text-[14px] md:text-[16px] md:leading-6">
                    <span className="font-semibold">Every Deadline</span> Tracked for You
                  </span>
                </li>
              </ul>
            </div>
            <a
              href="#erasmus-form"
              className="py-[14px] w-full rounded-[56px] bg-[#040B2B] shadow-8 font-poppins font-semibold text-[16px] leading-[24px] text-white text-center inline-flex items-center justify-center"
            >
              Talk to Us
            </a>
          </div>
          <div>
            <img src="/erasmus-sop-lor.webp" alt="SOP and LOR support illustration" className="w-full md:w-[266px] md:h-[266px] hidden md:block rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────── FAQ (their details/summary)
const faqs = [
  {
    q: "What is Erasmus Mundus?",
    a: "Erasmus Mundus Joint Masters are prestigious programmes funded by the European Union. You study in two or three European countries within one degree, and the scholarship covers full tuition, travel and a monthly living stipend — a package typically worth ₹40 lakh or more.",
  },
  {
    q: "Am I eligible to apply?",
    a: "You need a completed bachelor's degree (final-year students can usually apply too) in a field relevant to the programme. Each programme sets its own academic and English-language requirements — we map your eligibility for every programme before filing anything.",
  },
  {
    q: "How many programmes can I apply to?",
    a: "The EU allows you to hold scholarship applications to a maximum of three Erasmus Mundus programmes per intake. Choosing the right three matters — our mentors help you shortlist where your profile is strongest.",
  },
  {
    q: `What does the ${inr(PRICE)} fee include?`,
    a: "Everything for one application, end-to-end: a Statement of Purpose tailored to the programme, recommendation letters drafted and managed, the full document checklist, deadline tracking and submission, plus a dedicated mentor throughout. No hidden charges.",
  },
  {
    q: "When are the application deadlines?",
    a: "Most Erasmus Mundus programmes open applications between October and January for the following September intake. Deadlines vary by programme — once you apply with us, we track every date so nothing slips.",
  },
  {
    q: "Do I need IELTS or TOEFL?",
    a: "Most programmes require an English proficiency test like IELTS or TOEFL, though some accept a Medium of Instruction (MOI) waiver from your university. We confirm the exact requirement for each programme you choose.",
  },
];

const FaqSection = () => (
  <section
    id="FaqSection"
    className="rounded-t-3xl md:rounded-t-[64px] mt-[-20px] md:mt-[-58px] py-10 md:py-16 relative z-[3] bg-white px-4 md:px-0"
  >
    <div className="flex justify-between md:justify-center w-full md:mb-9">
      <HeadingLines>
        <span className="whitespace-normal">Frequently asked Questions</span>
      </HeadingLines>
    </div>

    <div className="flex flex-col gap-3 md:gap-5 max-w-[1248px] w-full md:mx-auto mt-[24px] md:mt-0 md:px-4">
      {faqs.map((f) => (
        <details key={f.q} className="border border-[#DCE7F6] bg-white rounded-2xl md:rounded-[20px] overflow-hidden">
          <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6">
            <h5 className="font-inter text-[14px] md:text-[20px] leading-7 font-semibold">Q. {f.q}</h5>
            <img
              src="/leap/down-arrow_SaPGQ1mcmn.svg"
              alt=""
              className="faq-arrow transition duration-300"
              height="20"
              width="20"
              loading="lazy"
            />
          </summary>
          <div className="text-[#040B2B] px-4 md:px-6 bg-white text-[14px] md:-mt-3 pb-3 md:pb-6 leading-[21px] md:text-lg md:leading-6 font-inter">
            <p>
              <strong>Ans.</strong> {f.a}
            </p>
          </div>
        </details>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────── Final CTA band (pre-footer)
const FinalCtaSection = () => (
  <section className="bg-[#040B2B] py-12 md:py-16 px-4">
    <div className="max-w-[822px] mx-auto text-center">
      <h2 className="text-white font-poppins font-semibold text-[22px] leading-[30px] md:text-[32px] md:leading-10 mb-3">
        Ready to start your <span className="text-[#61A2FE]">Erasmus journey</span>?
      </h2>
      <p className="text-white/70 font-inter text-[14px] md:text-[16px] leading-5 md:leading-6 mb-8">
        Talk to our team for free, or jump straight into picking your programmes — flat {inr(PRICE)} per application,
        everything included.
      </p>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center md:max-w-[560px] mx-auto">
        <a
          href="#erasmus-form"
          className="bg-37 w-full md:w-auto md:flex-1 block text-center shadow-8 font-semibold font-poppins text-[16px] leading-4 md:text-[18px] md:leading-6 text-white py-5 md:px-8 rounded-[56px]"
        >
          Book Free Consultation
        </a>
        <Link
          to="/application/erasmus/programs"
          className="w-full md:w-auto md:flex-1 block text-center font-semibold font-poppins text-[16px] leading-4 md:text-[18px] md:leading-6 text-[#040B2B] py-5 md:px-8 rounded-[56px] bg-white"
        >
          Browse Programmes
        </Link>
      </div>
    </div>
  </section>
);

export default ApplicationErasmus;
