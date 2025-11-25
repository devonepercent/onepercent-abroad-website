import stanfordLogo from "@/assets/stanford.png";
import mitLogo from "@/assets/mit.png";
import erasmusLogo from "@/assets/erasmus.png";
import harvardLogo from "@/assets/harvard.png";
import nusLogo from "@/assets/nus.jpg";
import georgiaTechLogo from "@/assets/georgia-tech.png";
import oxfordLogo from "@/assets/oxford.png";

const UniversityLogos = () => {
  const logos = [
    { name: "Harvard University", url: harvardLogo },
    { name: "Stanford University", url: stanfordLogo },
    { name: "MIT", url: mitLogo },
    { name: "Oxford University", url: oxfordLogo },
    { name: "NUS", url: nusLogo },
    { name: "Georgia Tech", url: georgiaTechLogo },
    { name: "Erasmus+", url: erasmusLogo },
  ];

  return (
    <section className="w-full py-24 sm:py-32 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20">
        <h4 className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-center mb-16 text-muted-foreground">
          MENTORING STUDENTS FOR TOP UNIVERSITIES
        </h4>
        <div className="relative flex before:content-[''] before:absolute before:left-0 before:top-0 before:w-32 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 after:content-[''] after:absolute after:right-0 after:top-0 after:w-32 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent after:z-10">
          <div className="flex animate-marquee">
            {logos.map((logo, idx) => (
              <div key={`${logo.name}-1-${idx}`} className="flex items-center justify-center mx-16 sm:mx-20 lg:mx-32">
                <img
                  className="h-20 sm:h-28 md:h-32 lg:h-40 w-auto object-contain"
                  alt={`${logo.name} Logo`}
                  src={logo.url}
                />
              </div>
            ))}
          </div>
          <div className="absolute top-0 flex animate-marquee2">
            {logos.map((logo, idx) => (
              <div key={`${logo.name}-2-${idx}`} className="flex items-center justify-center mx-16 sm:mx-20 lg:mx-32">
                <img
                  className="h-20 sm:h-28 md:h-32 lg:h-40 w-auto object-contain"
                  alt={`${logo.name} Logo`}
                  src={logo.url}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversityLogos;
