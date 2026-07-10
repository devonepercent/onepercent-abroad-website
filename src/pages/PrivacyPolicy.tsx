import { useEffect } from "react";
import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";

const css = `
:root{--navy:#040B2B;--navy-mid:#021488;--blue:#065DC7;--blue-light:#61A2FE;--cream:#F5F8FF;--white:#ffffff;--muted:#6B7A99;--border:rgba(6,93,199,0.15)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.pp-root{font-family:'Outfit',sans-serif;background:var(--cream);color:var(--navy);min-height:100vh;display:flex;flex-direction:column}
.pp-root a{color:var(--blue);text-decoration:none}
.pp-root a:hover{text-decoration:underline}

.pp-hero{background:linear-gradient(148deg,#040B2B 0%,#021488 55%,#030B58 100%);padding:40px 7% 56px;text-align:center;position:relative;overflow:hidden}
.pp-hero::before{content:'';position:absolute;top:-80px;right:-80px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(97,162,254,0.12) 0%,transparent 65%);pointer-events:none}
.pp-hero-inner{position:relative;z-index:2;max-width:680px;margin:0 auto}
.pp-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(97,162,254,0.15);color:var(--blue-light);font-size:0.7rem;font-weight:700;padding:6px 14px;border-radius:50px;margin-bottom:18px;letter-spacing:0.08em;text-transform:uppercase;border:1px solid rgba(97,162,254,0.25)}
.pp-hero h1{font-size:clamp(1.7rem,3.6vw,2.4rem);color:#fff;margin-bottom:12px;letter-spacing:-0.02em;font-weight:600}
.pp-hero p{font-size:0.92rem;color:rgba(255,255,255,0.6);line-height:1.7}

.pp-card-wrap{flex:1;padding:0 5% 64px;margin-top:-28px;position:relative;z-index:3}
.pp-card{background:var(--white);max-width:760px;margin:0 auto;border-radius:20px;padding:44px 48px 40px;box-shadow:0 24px 72px rgba(4,11,43,0.16);border:1px solid rgba(4,11,43,0.06)}

.pp-card h2{font-size:1.18rem;font-weight:700;color:var(--navy);margin:34px 0 12px;letter-spacing:-0.01em}
.pp-card h2:first-of-type{margin-top:0}
.pp-card h3{font-size:1rem;font-weight:600;color:var(--navy);margin:20px 0 8px}
.pp-card p{font-size:0.94rem;color:#3a4763;line-height:1.75;margin-bottom:14px}
.pp-card ul{margin:0 0 14px 0;padding-left:22px}
.pp-card li{font-size:0.94rem;color:#3a4763;line-height:1.7;margin-bottom:8px}
.pp-card strong{color:var(--navy);font-weight:600}
.pp-updated{font-size:0.82rem;color:var(--muted);margin-bottom:28px;padding-bottom:22px;border-bottom:1px solid var(--border)}

.pp-foot{text-align:center;padding:24px 5%;font-size:0.75rem;color:var(--muted)}
.pp-foot a{color:var(--muted)}

@media(max-width:600px){
  .pp-hero{padding:32px 6% 52px}
  .pp-card{padding:30px 22px 26px;border-radius:16px}
}
`;

const PrivacyPolicy = () => {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#040B2B";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  return (
    <div className="pp-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="pp-hero">
        <Link to="/" style={{ display: "inline-block", marginBottom: 24, position: "relative", zIndex: 2 }}>
          <img src={logoWhite} alt="OnePercent Abroad" style={{ height: 34, width: "auto" }} />
        </Link>
        <div className="pp-hero-inner">
          <div className="pp-eyebrow">Privacy Policy</div>
          <h1>How we collect &amp; use your data</h1>
          <p>
            This policy explains what information OnePercent Abroad collects when you visit our website or interact
            with our ads on Meta platforms (Facebook &amp; Instagram), and how that information is used.
          </p>
        </div>
      </section>

      <div className="pp-card-wrap">
        <div className="pp-card">
          <p className="pp-updated">Last updated: 30 June 2026</p>

          <h2>1. Who we are</h2>
          <p>
            This website is operated by <strong>Aspira Onepercent Pvt Ltd</strong> (&ldquo;OnePercent Abroad&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). We help students with university admissions and
            study-abroad applications. For any privacy questions, contact us at{" "}
            <a href="mailto:muhasina@onepercentabroad.com">muhasina@onepercentabroad.com</a>.
          </p>

          <h2>2. Information we collect</h2>
          <p>We collect information in the following ways:</p>
          <ul>
            <li>
              <strong>Information you give us</strong>: your name, email address, phone number, country, and details
              you submit through our forms (for example when you request a consultation, register for a webinar, or
              apply to a program).
            </li>
            <li>
              <strong>Information collected automatically</strong>: your device type, browser, IP address, pages
              viewed, referring links, and actions taken on our site. This is gathered using cookies and similar
              technologies, including the Meta Pixel described below.
            </li>
          </ul>

          <h2>3. Meta Pixel &amp; advertising on Facebook and Instagram</h2>
          <p>
            We run advertising campaigns on Meta platforms (Facebook and Instagram) and use the{" "}
            <strong>Meta Pixel</strong>, a small piece of tracking code, on our website. The Meta Pixel
            helps us understand how visitors who arrive from our ads behave on our site so we can measure and improve
            those campaigns.
          </p>
          <h3>What the Meta Pixel does</h3>
          <ul>
            <li>
              <strong>Measures conversions</strong>: it records actions such as viewing a page, submitting a lead
              form, or registering for a webinar, so we can see which ads are effective.
            </li>
            <li>
              <strong>Builds audiences</strong>: it allows us to show our ads to people who have visited our site
              (retargeting) and to reach new people with similar interests (lookalike audiences).
            </li>
            <li>
              <strong>Shares limited event data with Meta</strong>: when a tracked action happens, certain data
              (such as your hashed identifiers, the action taken, page URL, and device/browser information) is sent to
              Meta Platforms, Inc. so that conversions can be attributed to our campaigns.
            </li>
          </ul>
          <p>
            Meta processes this information as a data controller in accordance with its own policies. You can read how
            Meta uses data in the{" "}
            <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
              Meta Privacy Policy
            </a>{" "}
            and manage your ad preferences in your Facebook or Instagram account settings.
          </p>

          <h2>4. How we use your information</h2>
          <ul>
            <li>To respond to your enquiries and provide our admissions and study-abroad services.</li>
            <li>To send you information about programs, webinars, and offers you have requested.</li>
            <li>To measure, optimise, and target our advertising on Meta and other platforms.</li>
            <li>To improve our website, content, and overall user experience.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2>5. Cookies &amp; tracking technologies</h2>
          <p>
            Our site uses cookies and similar technologies, including the Meta Pixel, for analytics and advertising.
            You can control or disable cookies through your browser settings. You can also opt out of interest-based
            advertising through your{" "}
            <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer">
              Meta ad settings
            </a>{" "}
            and through industry tools such as the{" "}
            <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">
              Digital Advertising Alliance opt-out
            </a>
            .
          </p>

          <h2>6. Sharing your information</h2>
          <p>We do not sell your personal information. We may share it with:</p>
          <ul>
            <li>
              <strong>Advertising and analytics partners</strong> such as Meta Platforms, Inc., to deliver and measure
              our campaigns.
            </li>
            <li>
              <strong>Service providers</strong> who help us operate our website, communications, and CRM (for example
              email, messaging, and form-processing tools), under appropriate confidentiality obligations.
            </li>
            <li>
              <strong>Authorities</strong> where required by law or to protect our legal rights.
            </li>
          </ul>

          <h2>7. Data retention</h2>
          <p>
            We keep your personal information only for as long as needed to provide our services and for the purposes
            described in this policy, unless a longer retention period is required by law.
          </p>

          <h2>8. Your rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your personal data, to
            object to or restrict its processing, and to withdraw consent. To exercise any of these rights, email us at{" "}
            <a href="mailto:muhasina@onepercentabroad.com">muhasina@onepercentabroad.com</a>.
          </p>

          <h2>9. Children&rsquo;s privacy</h2>
          <p>
            Our services are intended for users aged 16 and above. We do not knowingly collect personal information
            from children below this age.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised
            &ldquo;last updated&rdquo; date.
          </p>

          <h2>11. Contact us</h2>
          <p>
            <strong>Aspira Onepercent Pvt Ltd</strong> (OnePercent Abroad)
            <br />
            Email: <a href="mailto:muhasina@onepercentabroad.com">muhasina@onepercentabroad.com</a>
            <br />
            Website: <a href="https://onepercentabroad.com" target="_blank" rel="noopener noreferrer">onepercentabroad.com</a>
          </p>
        </div>
      </div>

      <footer className="pp-foot">© 2026 OnePercent Abroad · Aspira Onepercent Pvt Ltd</footer>
    </div>
  );
};

export default PrivacyPolicy;
