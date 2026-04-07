import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { trackMetaEvent, initHiringPixel } from "@/lib/metaPixel";

const ROLE_NAME = "Student Counsellor";

const HiringOverview = () => {
  const navigate = useNavigate();

  useEffect(() => { initHiringPixel(); }, []);

  const goToStudentCounsellor = () => {
    trackMetaEvent("HiringApplyCardClick");
    navigate("/hiring/student-counsellor");
  };

  const goToSalesRole = () => {
    trackMetaEvent("SalesHiringOverviewCardClick");
    navigate("/hiring/sales-executive");
  };

  const goToStudentMentor = () => {
    trackMetaEvent("HiringApplyCardClick");
    navigate("/hiring/student-mentor");
  };

  const handleHeroClick = () => {
    trackMetaEvent("HiringApplyHeroClick");
    navigate("/hiring/student-counsellor");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero / Intro */}
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Join Our Team
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                We are looking for passionate professionals to guide students in their global education journey.
              </p>
              <Button size="lg" className="rounded-full" onClick={handleHeroClick}>
                View & Apply – Student Counsellor
              </Button>
            </div>
          </div>
        </section>

        {/* Open Roles */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Open Roles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <article className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{ROLE_NAME}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Location: Office / Hybrid / Remote
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Experience: 1–3 years (flexible for exceptional profiles)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Help motivated students plan and execute their study abroad journey.
                  </p>
                </div>
                <div className="mt-6">
                  <Button className="w-full md:w-auto" onClick={goToStudentCounsellor}>
                    View role & Apply
                  </Button>
                </div>
              </article>

              <article className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Student Mentor</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Location: Office / Hybrid / Remote
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Experience: 1–3 years (flexible for exceptional profiles)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Help motivated students plan and execute their study abroad journey.
                  </p>
                </div>
                <div className="mt-6">
                  <Button className="w-full md:w-auto" onClick={goToStudentMentor}>
                    View role & Apply
                  </Button>
                </div>
              </article>

              <article className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">High-Ticket Sales Executive</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Location: Calicut, Kerala
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Help students and parents understand our premium mentorship and make confident decisions.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ideal for confident communicators with experience in high-value or consultative sales.
                  </p>
                </div>
                <div className="mt-6">
                  <Button className="w-full md:w-auto" onClick={goToSalesRole}>
                    View role & Apply
                  </Button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HiringOverview;

