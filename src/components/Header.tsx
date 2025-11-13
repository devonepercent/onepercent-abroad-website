import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-10 lg:px-20 py-4 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3 text-primary">
        <svg
          className="w-7 h-7"
          fill="currentColor"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" />
        </svg>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">OnePercent Abroad</h2>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-1 items-center justify-end gap-6">
        <nav className="flex items-center gap-6">
          <button
            onClick={() => scrollToSection("services")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Testimonials
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            FAQ
          </button>
        </nav>
        <Button className="rounded-full">Book a Free Call</Button>
      </div>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined">menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <nav className="flex flex-col gap-6 mt-8">
            <button
              onClick={() => scrollToSection("services")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
            <Button className="rounded-full w-full">Book a Free Call</Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
