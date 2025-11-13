import { useEffect, useState } from "react";

const steps = [
  {
    icon: "person_search",
    number: 1,
    title: "Profile Evaluation",
    description:
      "We conduct a thorough analysis of your academic background, extracurriculars, and goals to identify strengths and areas for improvement.",
  },
  {
    icon: "groups",
    number: 2,
    title: "Strategize with Mentors",
    description:
      "Work one-on-one with experienced mentors to craft a unique application strategy, select the right programs, and build a compelling narrative.",
  },
  {
    icon: "edit_document",
    number: 3,
    title: "Application Process",
    description:
      "Receive expert guidance on every aspect of your application, from essay writing and interview prep to securing strong recommendation letters.",
  },
  {
    icon: "school",
    number: 4,
    title: "Post-Selection Process",
    description:
      "We assist with scholarship applications, visa processes, and pre-departure preparations to ensure a smooth transition to university life.",
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
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
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  return (
    <section id="how-it-works" className="w-full px-4 py-24 sm:px-10 lg:px-20 sm:py-32 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-secondary/20 via-transparent to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto flex flex-col items-start gap-12 z-10 relative">
        <div className="max-w-2xl">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-accent">
            Our Process
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight sm:text-5xl">
            How We Work – Our Mentorship Process
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-300">
            Our structured, step-by-step process is designed to maximize your chances of getting into your dream university.
          </p>
        </div>

        {/* Mobile View - One at a time with animation */}
        <div className="md:hidden w-full">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ${
                idx === activeStep
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 absolute translate-x-8 pointer-events-none"
              }`}
            >
              <div className="flex flex-col items-start gap-4 p-6 rounded-xl bg-secondary/20 border border-white/10">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary/50 text-accent">
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-xl font-bold mt-2">
                  {step.number}. {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeStep ? "bg-accent w-8" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View - Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-start gap-4 group hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary/50 text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">{step.icon}</span>
              </div>
              <h3 className="text-xl font-bold mt-2">
                {step.number}. {step.title}
              </h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
