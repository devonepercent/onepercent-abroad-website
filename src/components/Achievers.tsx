const achievers = [
  { name: "Anjima Divakar",    program: "EMMIR, Erasmus Mundus",                                                              image: "/images/achievers/Anjima Divakar.png",    initials: "AD" },
  { name: "Ahmed Shoeb",       program: "MPH Scholarship, Johns Hopkins Bloomberg School of Public Health, USA",               image: "/images/achievers/Ahmed Shoeb.png",       initials: "AS" },
  { name: "Ashik Safar",       program: "Nuclear Physics Fully Funded Internship, PRISMA+, Johannes Gutenberg University Mainz",image: "/images/achievers/Ashik Safar.png",      initials: "AS" },
  { name: "Aaqil Rayyan",      program: "Laurea Magistrale in Computer Science, University of Pisa, Italy",                    image: "/images/achievers/Aaqil Rayyan.png",      initials: "AR" },
  { name: "Adnan",             program: "Masters in Management, University of Glasgow",                                        image: "/images/achievers/Adnan.png",             initials: "AD" },
  { name: "Fathima Lamshana",  program: "IMBRSea — International Masters in Marine Biological Resources, Erasmus Mundus",     image: "/images/achievers/Fathima Lamshana.png",  initials: "FL" },
  { name: "Yakkoob Yussef",    program: "InnoEnergy Masters+ Programme, KU Leuven, Belgium",                                  image: "/images/achievers/Yakkoob Yussef.png",    initials: "YY" },
  { name: "Archana",           program: "ACES Star Program, Scholarship worth 15 Lakhs",                                      image: "/images/achievers/Archana.png",           initials: "AC" },
];

const CARD_W = 300;
const CARD_GAP = 16;

const AchieverCard = ({ a }: { a: typeof achievers[0] }) => (
  <div style={{ width: CARD_W, flexShrink: 0, display:"flex",alignItems:"stretch",borderRadius:14,overflow:"hidden",background:"rgba(97,162,254,0.04)",border:"1px solid rgba(97,162,254,0.1)",minHeight:130 }}>
    <div style={{ position:"relative",width:"40%",flexShrink:0 }}>
      <img src={a.image} alt={a.name} style={{ position:"absolute",top:0,left:0,right:0,bottom:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"top" }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(10,22,40,0.25)" }} />
    </div>
    <div style={{ display:"flex",flexDirection:"column",justifyContent:"center",padding:"18px 16px",flex:1 }}>
      <div style={{ fontWeight:700,fontSize:15,color:"#fff",lineHeight:1.3,fontFamily:"'Playfair Display',serif" }}>{a.name}</div>
      <div style={{ fontSize:11,color:"#d4a843",marginTop:6,lineHeight:1.5 }}>{a.program}</div>
    </div>
  </div>
);

const Achievers = () => (
  <section id="achievers" style={{ background:"#0a1628",padding:"100px 0",fontFamily:"'DM Sans',sans-serif",color:"#fff",overflow:"hidden" }}>
    <div style={{ maxWidth:1160,margin:"0 auto",paddingBottom:56,paddingLeft:60,paddingRight:60 }}>
      <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,46px)",fontWeight:600,textAlign:"center",margin:0 }}>
        Our <em style={{ fontStyle:"italic",color:"#61A2FE" }}>Achievers</em>
      </h2>
    </div>

    <div style={{ position:"relative" }}>

      <style dangerouslySetInnerHTML={{ __html:`@keyframes achiever-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}` }} />

      <div style={{ display:"flex",gap:CARD_GAP,animation:`achiever-marquee ${(CARD_W + CARD_GAP) * achievers.length / 28}s linear infinite`,willChange:"transform" }}>
        {[...achievers, ...achievers].map((a, i) => (
          <AchieverCard key={i} a={a} />
        ))}
      </div>
    </div>
  </section>
);

export default Achievers;
