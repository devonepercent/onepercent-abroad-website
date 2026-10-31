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
    <section className="op-shell section" id="faq">
      <div className="section-head">
        <div className="op-eyebrow">Questions</div>
        <h2>Frequently asked.</h2>
      </div>
      {faqs.map((faq, i) => (
        <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{faq.q}</span>
            <span aria-hidden>+</span>
          </button>
          <div className="faq-answer" style={{ maxHeight: open === i ? 400 : 0 }}>
            <p>{faq.a}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FAQ;
