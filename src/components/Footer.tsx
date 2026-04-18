import logoWhite from "@/assets/logo-white.png";

const Footer = () => (
  <footer style={{ background:"#050e1a",borderTop:"1px solid rgba(97,162,254,0.07)",padding:"64px 60px 36px",fontFamily:"'DM Sans',sans-serif",color:"#fff" }}>
    <div style={{ maxWidth:1160,margin:"0 auto" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:48,marginBottom:56,flexWrap:"wrap" }}>
        {/* Brand */}
        <div>
          <img src={logoWhite} alt="OnePercent Abroad" style={{ height:36,width:"auto",marginBottom:14 }} />
          <p style={{ fontSize:13,color:"rgba(255,255,255,0.3)",maxWidth:260,lineHeight:1.75,margin:0 }}>
            Your trusted partner in university admissions.
          </p>
        </div>

        {/* Links */}
        <div style={{ display:"flex",gap:64,flexWrap:"wrap" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
            <h4 style={{ fontSize:10,fontWeight:600,letterSpacing:3,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",margin:0,marginBottom:7 }}>Services</h4>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>Master's</a>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>PhD</a>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>Undergraduate</a>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
            <h4 style={{ fontSize:10,fontWeight:600,letterSpacing:3,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",margin:0,marginBottom:7 }}>Company</h4>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>About Us</a>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>How it Works</a>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>Testimonials</a>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
            <h4 style={{ fontSize:10,fontWeight:600,letterSpacing:3,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",margin:0,marginBottom:7 }}>Legal</h4>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>Privacy Policy</a>
            <a href="#" style={{ fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="#fff"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>Terms of Service</a>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
            <h4 style={{ fontSize:10,fontWeight:600,letterSpacing:3,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",margin:0,marginBottom:7 }}>Follow Us</h4>
            <div style={{ display:"flex",gap:16,marginTop:4 }}>
              <SocialLink href="https://www.instagram.com/onepercentabroad" label="Instagram">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </SocialLink>
              <SocialLink href="https://www.facebook.com/onepercentabroad" label="Facebook">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </SocialLink>
              <SocialLink href="https://www.linkedin.com/company/onepercentabroad/" label="LinkedIn">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect height="12" width="4" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </SocialLink>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop:"1px solid rgba(97,162,254,0.06)",paddingTop:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
        <div>
          <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",margin:0 }}>© 2026 OnePercent Abroad. All rights reserved.</p>
          <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",margin:"4px 0 0" }}>Aspira Onepercent Pvt Ltd</p>
        </div>
        <div style={{ display:"flex",gap:24 }}>
          <a href="#" style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>Privacy Policy</a>
          <a href="#" style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textDecoration:"none" }} onMouseOver={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

const SocialLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    style={{ color:"rgba(255,255,255,0.6)",transition:"color 0.2s" }}
    onMouseOver={e => (e.currentTarget.style.color="#fff")}
    onMouseOut={e  => (e.currentTarget.style.color="rgba(255,255,255,0.6)")}
  >{children}</a>
);

export default Footer;
