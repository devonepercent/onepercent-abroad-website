import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoBlue from "@/assets/logo-blue.png";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const isHome = location.pathname === "/";

  const handleHomeSectionClick = (id: string) => {
    if (isHome) {
      scrollToSection(id);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-10 lg:px-20 py-4 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoBlue} alt="OnePercent Abroad" className="h-8 sm:h-10 w-auto" />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-1 items-center justify-end gap-6">
        <nav className="flex items-center gap-6">
          <button
            onClick={() => handleHomeSectionClick("services")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => handleHomeSectionClick("how-it-works")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            How it Works
          </button>
          <button
            onClick={() => handleHomeSectionClick("testimonials")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Testimonials
          </button>
          <button
            onClick={() => handleHomeSectionClick("faq")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            FAQ
          </button>
          <Link
            to="/hiring"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Careers
          </Link>
        </nav>
        <Button className="rounded-full" asChild>
          <a href="https://wa.me/919074100157?text=hi" target="_blank" rel="noopener noreferrer">
            Book a Free Call
          </a>
        </Button>
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
              onClick={() => handleHomeSectionClick("services")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => handleHomeSectionClick("how-it-works")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              How it Works
            </button>
            <button
              onClick={() => handleHomeSectionClick("testimonials")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              Testimonials
            </button>
            <button
              onClick={() => handleHomeSectionClick("faq")}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
            <Link
              to="/hiring"
              onClick={() => setIsOpen(false)}
              className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
            >
              Careers
            </Link>
            <Button className="rounded-full w-full" asChild>
              <a href="https://wa.me/919074100157?text=hi" target="_blank" rel="noopener noreferrer">
                Book a Free Call
              </a>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
