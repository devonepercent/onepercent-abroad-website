import stanfordLogo from "@/assets/stanford.png";
import mitLogo from "@/assets/mit.png";
import erasmusLogo from "@/assets/erasmus.png";
import harvardLogo from "@/assets/harvard.png";
import nusLogo from "@/assets/nus.jpg";
import georgiaTechLogo from "@/assets/georgia-tech.png";
import oxfordLogo from "@/assets/oxford.png";

const UniversityLogos = () => {
  const logos = [
    {
      name: "Harvard University",
      url: harvardLogo,
      height: "h-8 md:h-10",
    },
    {
      name: "Stanford University",
      url: stanfordLogo,
      height: "h-7 md:h-9",
    },
    {
      name: "MIT",
      url: mitLogo,
      height: "h-8 md:h-10",
    },
    {
      name: "Oxford University",
      url: oxfordLogo,
      height: "h-8 md:h-10",
    },
    {
      name: "NUS",
      url: nusLogo,
      height: "h-8 md:h-10",
    },
    {
      name: "Georgia Tech",
      url: georgiaTechLogo,
      height: "h-8 md:h-10",
    },
    {
      name: "Erasmus+",
      url: erasmusLogo,
      height: "h-6 md:h-8",
    },
  ];

  return (
    <section className="w-full py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20">
        <h4 className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-center mb-10 text-muted-foreground">
          MENTORING STUDENTS FOR TOP UNIVERSITIES
        </h4>
        <div className="relative flex overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:w-16 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 after:content-[''] after:absolute after:right-0 after:top-0 after:w-16 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent after:z-10">
          <div className="flex animate-marquee whitespace-nowrap items-center">
            {logos.map((logo, idx) => (
              <img
                key={`${logo.name}-1-${idx}`}
                className={`${logo.height} mx-16 transition-all`}
                alt={`${logo.name} Logo`}
                src={logo.url}
              />
            ))}
          </div>
          <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap items-center">
            {logos.map((logo, idx) => (
              <img
                key={`${logo.name}-2-${idx}`}
                className={`${logo.height} mx-16 transition-all`}
                alt={`${logo.name} Logo`}
                src={logo.url}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversityLogos;
