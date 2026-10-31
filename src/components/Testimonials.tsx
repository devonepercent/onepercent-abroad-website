import { useEffect, useState } from "react";
import Arrow from "@/components/site/Arrow";

const testimonials = [
  {
    text: "I never thought that I could achieve this. I have approached many agencies, and I finally came to 1%abroad. They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
    name: "Sisa Maria Sunny",
    tags: ["Erasmus Mundus", "Master’s", "Profile confidence"],
    program: "Masters in Journalism, Media and Globalization · Erasmus Mundus",
    initials: "SS",
    image: "/images/testimonials/SISA MARIA SUNNY.png",
  },
  {
    text: "Only after the profile analysis through 1%abroad did I realise that I can aim for the very best universities in the world. Team 1% has always been supportive of the choices I made instead of putting their choices on me.",
    name: "Ananthakrishnan",
    tags: ["Profile analysis", "University of Bern", "AI in Medicine"],
    program: "AI in Medicine · University of Bern, Switzerland",
    initials: "AK",
    image: "/images/testimonials/ANANTHAKRISHNAN.png",
  },
  {
    text: "Mentorship helped me in shortlisting courses, to understand what is realistically possible for me to achieve. They also helped in practical ways and kept me clocked in with the deadlines.",
    name: "Amaresh",
    tags: ["EMINENT", "Erasmus Mundus", "60 lakhs awarded"],
    program: "EMINENT · Erasmus Mundus (60 Lakhs Awarded)",
    initials: "AM",
    image: "/images/testimonials/AMARESH.png",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const n = testimonials.length;

  useEffect(() => {
    const id = setTimeout(() => { setActive(a => (a + 1) % n); setRun(r => r + 1); }, 6000);
    return () => clearTimeout(id);
  }, [n, run]);

  const go = (i: number) => { setActive((i + n) % n); setRun(r => r + 1); };

  return (
    <section className="op-shell section" id="testimonials">
      <div className="section-head">
        <div className="op-eyebrow">Student journeys</div>
        <h2>What changed between “maybe” and the final outcome.</h2>
      </div>
      <div className="story-stage">
        {testimonials.map((t, i) => (
          <article key={t.name} className={`story-slide ${i === active ? "active" : ""}`} aria-hidden={i !== active}>
            <div className="story-id">
              <div className="story-avatar">
                <img src={t.image} alt={t.name}
                  onError={e => { const el = e.currentTarget; el.parentElement!.textContent = t.initials; }} />
              </div>
              <div>
                <h3>{t.name}</h3>
                <small>{t.program}</small>
              </div>
            </div>
            <div className="story-body">
              <p className="quote">“{t.text}”</p>
              <div className="story-outcome">
                {t.tags.map(tag => <span key={tag} className="story-pill">{tag}</span>)}
              </div>
            </div>
          </article>
        ))}
        <div className="story-nav">
          <button className="circle-btn" aria-label="Previous story" onClick={() => go(active - 1)}><Arrow dir="left" /></button>
          <div className="story-progress"><span key={run} className="run" /></div>
          <button className="circle-btn" aria-label="Next story" onClick={() => go(active + 1)}><Arrow /></button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
