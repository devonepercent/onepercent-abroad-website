import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const testimonials = [
  {
    text: "I never thought that I could achieve this. I have approached many agencies, and I finally came to 1%abroad. They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
    name: "Sisa Maria Sunny",
    program: "Masters in Journalism, Media and Globalization · Erasmus Mundus",
    initials: "SS",
    image: "/images/testimonials/SISA MARIA SUNNY.png",
  },
  {
    text: "Only after the profile analysis through 1%abroad did I realise that I can aim for the very best universities in the world. Team 1% has always been supportive of the choices I made instead of putting their choices on me.",
    name: "Ananthakrishnan",
    program: "AI in Medicine · University of Bern, Switzerland",
    initials: "AK",
    image: "/images/testimonials/ANANTHAKRISHNAN.png",
  },
  {
    text: "Mentorship helped me in shortlisting courses, to understand what is realistically possible for me to achieve. They also helped in practical ways and kept me clocked in with the deadlines.",
    name: "Amaresh",
    program: "EMINENT · Erasmus Mundus (60 Lakhs Awarded)",
    initials: "AM",
    image: "/images/testimonials/AMARESH.png",
  },
];

const n = testimonials.length;

const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
  <div style={{ background:"#142444",border:"1px solid rgba(97,162,254,0.09)",borderRadius:16,padding:"36px 32px",display:"flex",flexDirection:"column",height:"100%",boxSizing:"border-box" }}>
    <div style={{ color:"#d4a843",fontSize:13,letterSpacing:3,marginBottom:22 }}>★★★★★</div>
    <p style={{ fontSize:15,lineHeight:1.8,color:"rgba(255,255,255,0.6)",marginBottom:32,flex:1 }}>"{t.text}"</p>
    <div style={{ display:"flex",alignItems:"center",gap:14 }}>
      <div style={{ width:46,height:46,borderRadius:"50%",background:"rgba(97,162,254,0.1)",border:"1px solid rgba(97,162,254,0.18)",overflow:"hidden",flexShrink:0 }}>
        <img src={t.image} alt={t.name} style={{ width:"100%",height:"100%",objectFit:"cover",objectPosition:"top" }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement as HTMLElement).textContent = t.initials; }}
        />
      </div>
      <div>
        <div style={{ fontWeight:600,fontSize:14,marginBottom:3 }}>{t.name}</div>
        <div style={{ fontSize:12,color:"rgba(255,255,255,0.3)" }}>{t.program}</div>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % n), 3000);
    return () => clearInterval(id);
  }, []);

  const getCardStyle = (i: number): React.CSSProperties => {
    const diff = (i - active + n) % n;
    if (diff === 0) return {
      transform: "translateX(0) scale(1)",
      opacity: 1,
      filter: "none",
      zIndex: 3,
      pointerEvents: "auto",
    };
    if (diff === 1) return {
      transform: "translateX(340px) scale(0.82)",
      opacity: 0.45,
      filter: "blur(3px)",
      zIndex: 1,
      pointerEvents: "none",
    };
    return {
      transform: "translateX(-340px) scale(0.82)",
      opacity: 0.45,
      filter: "blur(3px)",
      zIndex: 1,
      pointerEvents: "none",
    };
  };

  return (
    <section id="testimonials" style={{ background:"#0a1628",padding:isMobile?"72px 20px 60px":"120px 60px 100px",borderTop:"1px solid rgba(97,162,254,0.06)",fontFamily:"'DM Sans',sans-serif",color:"#fff" }}>
      <div style={{ maxWidth:1160,margin:"0 auto" }}>
        {/* Heading */}
        <div style={{ textAlign:"center",marginBottom:isMobile?40:72 }}>
          <div style={{ fontSize:11,fontWeight:500,letterSpacing:4,textTransform:"uppercase",color:"#d4a843",marginBottom:16 }}>Student Stories</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,50px)",fontWeight:600,lineHeight:1.15,marginBottom:16 }}>
            Lives changed, <em style={{ fontStyle:"italic",color:"#61A2FE" }}>dreams realised</em>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.6)",fontSize:isMobile?14:16,maxWidth:480,margin:"0 auto" }}>
            From aspiration to acceptance — hear directly from students who made the climb.
          </p>
        </div>

        {isMobile ? (
          /* Mobile: full-width single card with fade transition */
          <div style={{ position:"relative" }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                position: i === active ? "relative" : "absolute",
                top: 0, left: 0, width: "100%",
                opacity: i === active ? 1 : 0,
                transition: "opacity 0.7s ease",
                pointerEvents: i === active ? "auto" : "none",
              }}>
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: 3D carousel */
          <div style={{ position:"relative",height:320,overflow:"hidden" }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: 520,
                marginLeft: -260,
                transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease, filter 0.7s ease",
                transformOrigin: "center center",
                ...getCardStyle(i),
              }}>
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;
