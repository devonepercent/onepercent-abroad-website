import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const services = [
  {
    title: "Master's Mentorship",
    description: "Comprehensive guidance for securing admission into top Master's programs worldwide.",
  },
  {
    title: "PhD Mentorship",
    description: "Specialized support for aspiring doctoral candidates, from research proposals to faculty outreach.",
  },
  {
    title: "Undergraduate (UG) Mentorship",
    description: "Navigate the complex UG admissions landscape with expert guidance on college selection and applications.",
  },
  {
    title: "Continuous Mentorship",
    description: "Ongoing support throughout your academic career to help you excel and achieve your long-term goals.",
  },
];

const Services = () => {
  const [activeService, setActiveService] = useState(0);
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
        setActiveService((prev) => (prev + 1) % services.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  return (
    <section id="services" className="w-full px-4 py-24 sm:px-10 lg:px-20 sm:py-32 bg-primary text-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        <div className="text-center max-w-2xl">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-accent">
            What We Offer
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight sm:text-5xl">
            Our Services
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-300">
            Tailored mentorship programs designed for every stage of your academic journey.
          </p>
        </div>

        {/* Mobile View - One at a time */}
        <div className="md:hidden w-full max-w-sm">
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ${
                idx === activeService
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 absolute translate-y-4 pointer-events-none"
              }`}
            >
              <div className="p-8 rounded-xl bg-secondary/30 border border-white/10 shadow-lg min-h-[180px]">
                <h3 className="text-2xl font-bold text-accent">{service.title}</h3>
                <p className="text-gray-300 mt-2">{service.description}</p>
              </div>
            </div>
          ))}
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {services.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveService(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeService ? "bg-accent w-8" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View - Grid */}
        <div className="hidden md:grid grid-cols-2 gap-6 w-full mt-4">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="p-8 rounded-xl bg-secondary/30 border border-white/10 shadow-lg hover:bg-secondary/40 hover:scale-105 transition-all cursor-pointer"
            >
              <h3 className="text-2xl font-bold text-accent">{service.title}</h3>
              <p className="text-gray-300 mt-2">{service.description}</p>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="mt-8 rounded-full h-12 px-8 bg-accent text-primary hover:bg-accent/90"
        >
          Book a Free Call
        </Button>
      </div>
    </section>
  );
};

export default Services;
