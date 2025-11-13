import { useEffect, useState } from "react";

const testimonials = [
  {
    text: "It's a wonderful platform to get the right mentors, and the OnePercent Abroad team will always be there to help you out, no matter what.",
    name: "Aashik Safar",
    university: "University of Toronto",
    initials: "AS",
  },
  {
    text: "The guidance I received here has paved the way to secure admission to my dream university and course.",
    name: "Lamshana",
    university: "Columbia University",
    initials: "L",
  },
  {
    text: "OnePercent Abroad's experts guided me at every step of my PhD application process. I would highly recommend them to any PhD aspirant.",
    name: "Archana",
    university: "University of Cambridge",
    initials: "A",
  },
  {
    text: "Their systematic approach and access to top-tier mentors made the entire application process manageable and successful.",
    name: "Amaresh",
    university: "ETH Zurich",
    initials: "A",
  },
  {
    text: "I am incredibly grateful for their support. The personalized strategy they developed for me was a game-changer.",
    name: "Sisa",
    university: "Imperial College London",
    initials: "S",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  return (
    <section id="testimonials" className="w-full px-4 py-24 sm:px-10 lg:px-20 sm:py-32 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-secondary/20 via-transparent to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 z-10 relative">
        <div className="text-center max-w-2xl">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-accent">
            Social Proof
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight sm:text-5xl">
            What Our Students Say
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-300">
            Hear from the students we've helped achieve their academic dreams.
          </p>
        </div>

        {/* Mobile View - Single Card with Fade Animation */}
        <div className="md:hidden w-full max-w-sm">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ${
                idx === activeIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 absolute translate-y-4 pointer-events-none"
              }`}
            >
              <div className="flex flex-col gap-6 p-6 rounded-xl border border-white/10 bg-secondary/20 backdrop-blur-sm">
                <p className="text-gray-200 flex-grow min-h-[120px]">{testimonial.text}</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-accent">{testimonial.university}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeIndex ? "bg-accent w-8" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View - Scrolling Marquee */}
        <div className="hidden md:block w-full overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            <div className="flex shrink-0 items-stretch gap-8 px-4">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={`${idx}-1`}
                  className="flex w-[380px] flex-col gap-6 p-6 rounded-xl border border-white/10 bg-secondary/20 backdrop-blur-sm"
                >
                  <p className="text-gray-200 flex-grow">{testimonial.text}</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-accent">{testimonial.university}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex animate-marquee2 whitespace-nowrap absolute top-[200px]">
            <div className="flex shrink-0 items-stretch gap-8 px-4">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={`${idx}-2`}
                  className="flex w-[380px] flex-col gap-6 p-6 rounded-xl border border-white/10 bg-secondary/20 backdrop-blur-sm"
                >
                  <p className="text-gray-200 flex-grow">{testimonial.text}</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-accent">{testimonial.university}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
