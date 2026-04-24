import { Link } from "react-router-dom";

const services = [
  { title: "Master's Mentorship",       description: "Comprehensive guidance for securing admission into top Master's programs worldwide." },
  { title: "PhD Mentorship",            description: "Specialized support for aspiring doctoral candidates, from research proposals to faculty outreach." },
  { title: "Undergraduate Mentorship",  description: "Navigate the complex UG admissions landscape with expert guidance on college selection and applications." },
  { title: "Continuous Mentorship",     description: "Ongoing support throughout your academic career to help you excel and achieve your long-term goals." },
];

const Services = () => (
  <section id="services" style={{ background:"#0d1630",padding:"100px 60px",borderTop:"1px solid rgba(77,135,255,0.06)",fontFamily:"'DM Sans',sans-serif",color:"#fff" }}>
    <div style={{ maxWidth:1000,margin:"0 auto" }}>
      {/* Heading */}
      <div style={{ textAlign:"center",marginBottom:64 }}>
        <div style={{ fontSize:11,fontWeight:500,letterSpacing:4,textTransform:"uppercase",color:"#d4a843",marginBottom:14 }}>What We Offer</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,46px)",fontWeight:600,marginBottom:14 }}>
          Our <em style={{ fontStyle:"italic",color:"#4d87ff" }}>Services</em>
        </h2>
        <p style={{ color:"rgba(255,255,255,0.6)",fontSize:16,maxWidth:480,margin:"0 auto" }}>
          Tailored mentorship programs designed for every stage of your academic journey.
        </p>
      </div>

      {/* Grid */}
      <div className="hidden md:grid" style={{ gridTemplateColumns:"repeat(2,1fr)",gap:20,marginBottom:48 }}>
        {services.map((s, i) => (
          <ServiceCard key={i} s={s} />
        ))}
      </div>

      {/* Mobile stack */}
      <div className="md:hidden" style={{ display:"flex",flexDirection:"column",gap:16,marginBottom:40 }}>
        {services.map((s, i) => <ServiceCard key={i} s={s} />)}
      </div>

      <div style={{ textAlign:"center" }}>
        <Link
          to="/get-started"
          style={{ display:"inline-block",background:"#1a5cff",color:"#fff",padding:"14px 44px",borderRadius:60,fontSize:14,fontWeight:600,textDecoration:"none",transition:"transform 0.2s,box-shadow 0.3s" }}
          onMouseOver={e => { e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(26,92,255,0.4)"; }}
          onMouseOut={e  => { e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow="none"; }}
        >
          Book a Free Call
        </Link>
      </div>
    </div>
  </section>
);

const ServiceCard = ({ s }: { s: typeof services[0] }) => (
  <div
    style={{ background:"rgba(26,92,255,0.06)",border:"1px solid rgba(77,135,255,0.12)",borderRadius:16,padding:"36px 32px",transition:"background 0.3s,transform 0.25s",cursor:"default" }}
    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background="rgba(26,92,255,0.1)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)"; }}
    onMouseOut={e  => { (e.currentTarget as HTMLDivElement).style.background="rgba(26,92,255,0.06)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}
  >
    <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,color:"#4d87ff",marginBottom:10 }}>{s.title}</h3>
    <p style={{ fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,margin:0 }}>{s.description}</p>
  </div>
);

export default Services;
