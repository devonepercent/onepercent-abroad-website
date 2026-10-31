import NewsletterForm from "./NewsletterForm";

const NewsletterSection = () => (
  <section className="op-shell section">
    <div className="newsletter">
      <div>
        <div className="op-eyebrow">Newsletter</div>
        <h2>Stay ahead of the curve.</h2>
        <p>
          Get updates on scholarships, top university programs, mentorship opportunities,
          and expert insights on studying abroad, straight to your inbox.
        </p>
        <NewsletterForm source="section" />
        <small>No spam. Unsubscribe anytime.</small>
      </div>
    </div>
  </section>
);

export default NewsletterSection;
