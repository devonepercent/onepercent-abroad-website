import { useEffect, useState } from "react";

const testimonials = [
  {
    text: "I never thought that i could achieve this. I have approached many agencies, and I finally came to 1%abroad. They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
    name: "Sisa Maria Sunny",
    background: "From music teacher to world-class journalist.",
    program: "Masters in Journalism, Media and Globalization, Erasmus Mundus",
    initials: "SS",
    image: "/images/testimonials/SISA MARIA SUNNY.png",
  },
  {
    text: "Thanks to team 1%abroad for helping me throughout this journey.. Only after the profile analysis through 1%abroad did I realize that i can aim for the very best universities in the world. Team 1% has always been supportive of the choices I made instead of them putting their choices on me. I recommend 1%abroad to anybody who wants to get into top 1% of the people when it comes to studying abroad.",
    name: "Ananthakrishnan",
    background: "Online BCA Graduate to AI Pioneer.",
    program: "AI in Medicine, University of Bern, Switzerland",
    initials: "AK",
    image: "/images/testimonials/ANANTHAKRISHNAN.png",
  },
  {
    text: "Mentorship has helped me in shortlisting courses, to understand what is realistically possible for me to achieve. They also helped in practical ways to achieve these results and kept me clocked in with the deadlines.",
    name: "Amaresh",
    background: "60 Lakhs Awarded: The Power of Strategy.",
    program: "EMINENT, Erasmus Mundus",
    initials: "AM",
    image: "/images/testimonials/AMARESH.png",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="w-full px-4 py-24 sm:px-10 lg:px-20 sm:py-32 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-secondary/20 via-transparent to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto z-10 relative">

        {/* Mobile View - Slideshow */}
        <div className="md:hidden w-full max-w-sm mx-auto relative min-h-[320px]">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-700 ${
                idx === activeIndex
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <div className="flex flex-col gap-5 p-6 rounded-xl border border-white/10 bg-secondary/20 backdrop-blur-sm h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-lg font-bold overflow-hidden shrink-0">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        (e.currentTarget.parentElement as HTMLElement).innerText = testimonial.initials;
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-accent italic">{testimonial.background}</p>
                  </div>
                </div>
                <p className="text-gray-200 leading-relaxed text-sm flex-1">"{testimonial.text}"</p>
                <p className="text-xs text-accent/80 border-t border-white/10 pt-3">{testimonial.program}</p>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? "bg-accent w-8" : "bg-white/30 w-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View - 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-5 p-7 rounded-xl border border-white/10 bg-secondary/20 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-lg font-bold overflow-hidden shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      (e.currentTarget.parentElement as HTMLElement).innerText = testimonial.initials;
                    }}
                  />
                </div>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-xs text-accent italic">{testimonial.background}</p>
                </div>
              </div>
              <p className="text-gray-200 leading-relaxed flex-1">"{testimonial.text}"</p>
              <p className="text-sm text-accent/80 border-t border-white/10 pt-4">{testimonial.program}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
