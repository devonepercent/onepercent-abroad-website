import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const services = [
  { title: "Master's Mentorship",       description: "Comprehensive guidance for securing admission into top Master's programs worldwide." },
  { title: "PhD Mentorship",            description: "Specialized support for aspiring doctoral candidates, from research proposals to faculty outreach." },
  { title: "Undergraduate Mentorship",  description: "Navigate the complex UG admissions landscape with expert guidance on college selection and applications." },
  { title: "Continuous Mentorship",     description: "Ongoing support throughout your academic career to help you excel and achieve your long-term goals." },
];

const ServiceCard = ({ s }: { s: typeof services[0] }) => (
  <div
    style={{ background:"rgba(6,93,199,0.06)",border:"1px solid rgba(97,162,254,0.12)",borderRadius:16,padding:"36px 32px",transition:"background 0.3s,transform 0.25s",cursor:"default",height:"100%" }}
    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background="rgba(6,93,199,0.1)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)"; }}
    onMouseOut={e  => { (e.currentTarget as HTMLDivElement).style.background="rgba(6,93,199,0.06)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}
  >
    <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,color:"#61A2FE",marginBottom:10 }}>{s.title}</h3>
    <p style={{ fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,margin:0 }}>{s.description}</p>
  </div>
);

const Services = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const CARD_VW = 0.72;

  const cardWidth = () => window.innerWidth * CARD_VW + 16;

  const goTo = (i: number) => {
    sliderRef.current?.scrollTo({ left: i * cardWidth(), behavior: "smooth" });
  };

  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % services.length;
        sliderRef.current?.scrollTo({ left: next * cardWidth(), behavior: "smooth" });
        return next;
      });
    }, 2800);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / cardWidth());
      setActiveIdx(idx);
    };
    const onTouch = () => {
      if (autoRef.current) clearInterval(autoRef.current);
      setTimeout(startAuto, 4000);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("touchstart", onTouch, { passive: true });
    startAuto();
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("touchstart", onTouch);
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, []);

  return (
    <section id="services" style={{ background:"#040B2B",padding:"100px 60px",borderTop:"1px solid rgba(97,162,254,0.06)",fontFamily:"'DM Sans',sans-serif",color:"#fff" }}>
      <div style={{ maxWidth:1000,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:64 }}>
<h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,46px)",fontWeight:600,marginBottom:14 }}>
            Our <em style={{ fontStyle:"italic",color:"#61A2FE" }}>Services</em>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.6)",fontSize:16,maxWidth:480,margin:"0 auto" }}>
            Tailored mentorship programs designed for every stage of your academic journey.
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid" style={{ gridTemplateColumns:"repeat(2,1fr)",gap:20,marginBottom:48 }}>
          {services.map((s, i) => <ServiceCard key={i} s={s} />)}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden" style={{ marginBottom:24,marginLeft:"-60px",marginRight:"-60px" }}>
          <div
            ref={sliderRef}
            style={{ display:"flex",overflowX:"scroll",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch" as never,gap:16,paddingLeft:24,paddingRight:24,paddingBottom:4,msOverflowStyle:"none" as never,scrollbarWidth:"none" as never }}
          >
            {services.map((s, i) => (
              <div key={i} style={{ minWidth:"72vw",maxWidth:"72vw",scrollSnapAlign:"center",flexShrink:0 }}>
                <ServiceCard s={s} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex",justifyContent:"center",gap:8,marginTop:20 }}>
            {services.map((_, i) => (
              <button key={i} onClick={() => { goTo(i); setActiveIdx(i); startAuto(); }} style={{ width:i===activeIdx?20:8,height:8,borderRadius:4,background:i===activeIdx?"#065DC7":"rgba(97,162,254,0.25)",border:"none",padding:0,cursor:"pointer",transition:"all 0.3s" }} />
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center" }}>
          <Link
            to="/get-started"
            style={{ display:"inline-block",background:"#065DC7",color:"#fff",padding:"14px 44px",borderRadius:60,fontSize:14,fontWeight:600,textDecoration:"none",transition:"transform 0.2s,box-shadow 0.3s" }}
            onMouseOver={e => { e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(6,93,199,0.4)"; }}
            onMouseOut={e  => { e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow="none"; }}
          >
            Book a Free Call
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
