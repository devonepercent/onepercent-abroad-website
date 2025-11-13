import Header from "@/components/Header";
import Hero from "@/components/Hero";
import UniversityLogos from "@/components/UniversityLogos";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import Services from "@/components/Services";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <UniversityLogos />
        <Testimonials />
        <HowItWorks />
        <Services />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
