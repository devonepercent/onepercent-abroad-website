import { useEffect, useState } from "react";

const achievers = [
  {
    name: "Anjima Divakar",
    program: "EMMIR, Erasmus Mundus",
    image: "/images/achievers/Anjima Divakar.png",
    initials: "AD",
  },
  {
    name: "Ahmed Shoeb",
    program: "MPH Scholarship, Johns Hopkins Bloomberg School of Public Health, USA",
    image: "/images/achievers/Ahmed Shoeb.png",
    initials: "AS",
  },
  {
    name: "Ashik Safar",
    program: "Nuclear Physics Fully Funded Internship, PRISMA+, Johannes Gutenberg University Mainz",
    image: "/images/achievers/Ashik Safar.png",
    initials: "AS",
  },
  {
    name: "Aaqil Rayyan",
    program: "Laurea Magistrale in Computer Science, University of Pisa, Italy",
    image: "/images/achievers/Aaqil Rayyan.png",
    initials: "AR",
  },
  {
    name: "Adnan",
    program: "Masters in Management, University of Glasgow",
    image: "/images/achievers/Adnan.png",
    initials: "AD",
  },
  {
    name: "Fathima Lamshana",
    program: "IMBRSea — International Masters in Marine Biological Resources, Erasmus Mundus",
    image: "/images/achievers/Fathima Lamshana.png",
    initials: "FL",
  },
  {
    name: "Yakkoob Yussef",
    program: "InnoEnergy Masters+ Programme, KU Leuven, Belgium",
    image: "/images/achievers/Yakkoob Yussef.png",
    initials: "YY",
  },
  {
    name: "Archana",
    program: "ACES Star Program, Scholarship worth 15 Lakhs",
    image: "/images/achievers/Archana.png",
    initials: "AC",
  },
];

const AchieverCard = ({ achiever }: { achiever: typeof achievers[0] }) => (
  <div className="flex items-stretch rounded-xl overflow-hidden bg-secondary/20 border border-white/10">
    {/* Image with blue tint */}
    <div className="relative w-2/5 shrink-0 min-h-[130px]">
      <img
        src={achiever.image}
        alt={achiever.name}
        className="absolute inset-0 w-full h-full object-cover object-top"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      {/* Subtle blue tint overlay */}
      <div className="absolute inset-0 bg-primary/20" />
    </div>

    {/* Text */}
    <div className="flex flex-col justify-center px-5 py-5 flex-1">
      <p className="font-bold text-white text-lg font-display leading-tight">
        {achiever.name}
      </p>
      <p className="text-accent text-sm font-display mt-1 leading-snug">
        {achiever.program}
      </p>
    </div>
  </div>
);

const Achievers = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % achievers.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="achievers" className="w-full px-4 pt-0 pb-24 sm:px-10 lg:px-20 sm:pb-32 bg-primary text-white">
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-14 font-display">
          Our Achievers
        </h2>

        {/* Mobile - Slideshow */}
        <div className="md:hidden w-full relative" style={{ minHeight: "130px" }}>
          {achievers.map((achiever, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ${
                idx === activeIndex
                  ? "opacity-100 translate-y-0 pointer-events-auto relative"
                  : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
              }`}
            >
              <AchieverCard achiever={achiever} />
            </div>
          ))}

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {achievers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? "bg-accent w-6" : "bg-white/30 w-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop - 3-column grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {achievers.map((achiever, idx) => (
            <AchieverCard key={idx} achiever={achiever} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Achievers;
