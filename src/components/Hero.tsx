import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="w-full bg-background">
      <div className="container mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl flex-col items-start justify-center px-4 sm:px-10 lg:px-20 py-20 text-left">
        <div className="max-w-4xl animate-fade-in">
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Unlock Your Path to the World's Top 1% Universities
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Secure admission to the world's most elite universities through our proven, step-by-step mentorship system at OnePercent Abroad.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button size="lg" className="rounded-full h-12 px-8 text-base">
              Join the 1% Mentorship
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
