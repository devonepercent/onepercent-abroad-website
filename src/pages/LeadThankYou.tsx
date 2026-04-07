import { useEffect, useState } from "react";
import { initMetaPixel, trackMetaEvent } from "@/lib/metaPixel";

const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/GzkeVrL9N1S749BhMkdXN9";

const testimonials = [
  {
    text: "I never thought that i could achieve this. I have approached many agencies, and I finally came to 1%abroad. They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
    name: "Sisa Maria Sunny",
    background: "From music teacher to world-class journalist.",
    program: "Masters in Journalism, Media and Globalization, Erasmus Mundus",
    initials: "SS",
    image: "/images/testimonials/SISA MARIA SUNNY.png",
  },
  {
    text: "Thanks to team 1%abroad for helping me throughout this journey.. Only after the profile analysis through 1%abroad did I realize that i can aim for the very best universities in the world. Team 1% has always been supportive of the choices I made instead of them putting their choices on me.",
    name: "Ananthakrishnan",
    background: "Online BCA Graduate to AI Pioneer.",
    program: "AI in Medicine, University of Bern, Switzerland",
    initials: "AK",
    image: "/images/testimonials/ANANTHAKRISHNAN.png",
  },
  {
    text: "Mentorship has helped me in shortlisting courses, to understand what is realistically possible for me to achieve. They also helped in practical ways to achieve these results and kept me clocked in with the deadlines.",
    name: "Amaresh",
    background: "60 Lakhs Awarded: The Power of Strategy.",
    program: "EMINENT, Erasmus Mundus",
    initials: "AM",
    image: "/images/testimonials/AMARESH.png",
  },
];

const LeadThankYou = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    initMetaPixel();
    trackMetaEvent("Lead");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          You're in — we'll reach out soon.
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Our team will contact you within 24 hours. While you wait, join our WhatsApp community to connect with students already on this journey.
        </p>
        <a
          href={WHATSAPP_COMMUNITY}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc5a] text-white font-semibold px-7 py-3 rounded-full transition-colors text-base shadow"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Join the Community
        </a>
      </div>

      {/* Testimonials */}
      <div className="w-full bg-primary text-white px-4 py-16 sm:px-10 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-accent font-semibold text-sm uppercase tracking-widest mb-2">Success Stories</p>
          <h2 className="text-center text-2xl md:text-3xl font-bold mb-10">Students who made it to the top 1%</h2>

          {/* Mobile slideshow */}
          <div className="md:hidden relative min-h-[280px]">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-700 ${
                  idx === activeIndex ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <div className="flex flex-col gap-4 p-6 rounded-xl border border-white/10 bg-white/5 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden shrink-0">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement as HTMLElement).innerText = t.initials; }} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-accent italic">{t.background}</p>
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed flex-1">"{t.text}"</p>
                  <p className="text-xs text-accent/80 border-t border-white/10 pt-3">{t.program}</p>
                </div>
              </div>
            ))}
            <div className="absolute -bottom-7 left-0 right-0 flex justify-center gap-2">
              {testimonials.map((_, idx) => (
                <button key={idx} onClick={() => setActiveIndex(idx)} className={`h-2 rounded-full transition-all ${idx === activeIndex ? "bg-accent w-8" : "bg-white/30 w-2"}`} />
              ))}
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="flex flex-col gap-4 p-6 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden shrink-0">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement as HTMLElement).innerText = t.initials; }} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-accent italic">{t.background}</p>
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <p className="text-xs text-accent/80 border-t border-white/10 pt-3">{t.program}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadThankYou;
