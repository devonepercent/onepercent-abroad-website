import stanfordLogo    from "@/assets/stanford.png";
import mitLogo        from "@/assets/mit.png";
import erasmusLogo    from "@/assets/erasmus.png";
import harvardLogo    from "@/assets/harvard.png";
import nusLogo        from "@/assets/nus.jpg";
import georgiaTechLogo from "@/assets/georgia-tech.png";
import oxfordLogo     from "@/assets/oxford.png";

const logos = [
  { name: "Harvard",      url: harvardLogo },
  { name: "Stanford",     url: stanfordLogo },
  { name: "MIT",          url: mitLogo },
  { name: "Oxford",       url: oxfordLogo },
  { name: "NUS",          url: nusLogo },
  { name: "Georgia Tech", url: georgiaTechLogo },
  { name: "Erasmus+",     url: erasmusLogo },
];

const UniversityLogos = () => (
  <section style={{ background:"#142444",padding:"72px 0",borderTop:"1px solid rgba(97,162,254,0.06)",overflow:"hidden",fontFamily:"'DM Sans',sans-serif" }}>

    <div style={{ position:"relative",display:"flex",overflow:"hidden" }}>
      {/* Fade edges */}
      <div style={{ position:"absolute",top:0,left:0,width:80,height:"100%",background:"linear-gradient(90deg,#142444,transparent)",zIndex:2,pointerEvents:"none" }} />
      <div style={{ position:"absolute",top:0,right:0,width:80,height:"100%",background:"linear-gradient(-90deg,#142444,transparent)",zIndex:2,pointerEvents:"none" }} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee1 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes marquee2 { 0%{transform:translateX(50%)} 100%{transform:translateX(0%)} }
      ` }} />

      <div style={{ display:"flex",alignItems:"center",animation:"marquee1 28s linear infinite",whiteSpace:"nowrap" }}>
        {[...logos, ...logos].map((logo, i) => (
          <img key={i} src={logo.url} alt={logo.name} style={{ height:36,width:"auto",margin:"0 56px",opacity:0.75,filter:"brightness(0) invert(1)",transition:"opacity 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.opacity = "1")}
            onMouseOut={e  => (e.currentTarget.style.opacity = "0.75")}
          />
        ))}
      </div>
      <div style={{ display:"flex",alignItems:"center",animation:"marquee2 28s linear infinite",whiteSpace:"nowrap",position:"absolute",top:0 }}>
        {[...logos, ...logos].map((logo, i) => (
          <img key={i} src={logo.url} alt={logo.name} style={{ height:36,width:"auto",margin:"0 56px",opacity:0.75,filter:"brightness(0) invert(1)",transition:"opacity 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.opacity = "1")}
            onMouseOut={e  => (e.currentTarget.style.opacity = "0.75")}
          />
        ))}
      </div>
    </div>
  </section>
);

export default UniversityLogos;
