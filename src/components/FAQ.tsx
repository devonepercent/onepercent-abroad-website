import { useState } from "react";

const faqs = [
  { q: "What makes OnePercent Abroad different from other consultancies?", a: "OnePercent Abroad focuses on a mentorship-based approach rather than just consulting. We connect you with mentors who have graduated from the world's top 1% universities, providing personalized, experience-based guidance throughout your application journey." },
  { q: "Who are the mentors?", a: "Our mentors are experienced professionals who have successfully helped hundreds of students with their elite university applications. They bring deep expertise in navigating the rigorous application processes for top institutions worldwide." },
  { q: "How does the mentorship process work?", a: "Our process begins with a detailed profile evaluation, followed by one-on-one strategy sessions with your mentor. We provide comprehensive support on everything from university selection and essay writing to interview preparation and post-admission logistics." },
  { q: "What is your success rate?", a: "While admission to top universities is highly competitive, our students have a significantly higher success rate than the average applicant pool due to our personalized strategies and expert guidance. We are proud of the many students we've helped gain admission to their dream universities." },
  { q: "How can I get started?", a: "The best way to start is by booking a free call with our team. This initial consultation allows us to understand your goals, assess your profile, and determine how we can best support you in your journey to a top university." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ background:"#0a1628",padding:"100px 60px",borderTop:"1px solid rgba(97,162,254,0.06)",fontFamily:"'DM Sans',sans-serif",color:"#fff" }}>
      <div style={{ maxWidth:800,margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,46px)",fontWeight:600,textAlign:"center",marginBottom:56 }}>
          Frequently Asked <em style={{ fontStyle:"italic",color:"#61A2FE" }}>Questions</em>
        </h2>

        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background:"rgba(97,162,254,0.04)",border:"1px solid rgba(97,162,254,0.1)",borderRadius:14,overflow:"hidden" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width:"100%",textAlign:"left",background:"none",border:"none",color:"#fff",padding:"22px 28px",fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4 }}
              >
                <span>{faq.q}</span>
                <span style={{ flexShrink:0,fontSize:22,color:"#61A2FE",transition:"transform 0.3s",transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              <div style={{ maxHeight: open === i ? 400 : 0, overflow:"hidden", transition:"max-height 0.4s ease" }}>
                <div style={{ padding:"0 28px 22px",fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.8 }}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
