import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { trackMetaEvent } from "@/lib/metaPixel";
import { supabase } from "@/integrations/supabase/client";

const ROLE_NAME = "High-Ticket Sales Executive";

const SalesHiring = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleScrollToForm = () => {
    const element = document.getElementById("sales-hiring-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    trackMetaEvent("SalesHiringHeroClick");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !currentCity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!cvFile) {
      toast({
        title: "CV required",
        description: "Please upload your CV in PDF format.",
        variant: "destructive",
      });
      return;
    }

    if (cvFile.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload your CV as a PDF file.",
        variant: "destructive",
      });
      return;
    }

    const maxSizeMb = 3;
    if (cvFile.size > maxSizeMb * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please upload a PDF smaller than ${maxSizeMb}MB.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirmation) {
      toast({
        title: "Confirmation required",
        description: "Please confirm that your information is accurate.",
        variant: "destructive",
      });
      return;
    }

    const endpoint = import.meta.env.VITE_HIRING_FORM_ENDPOINT as string | undefined;
    if (!endpoint) {
      toast({
        title: "Configuration missing",
        description: "Hiring form endpoint is not configured. Please contact the site administrator.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const phoneSanitized = phone.replace(/\s+/g, "");
      const safeName = fullName.replace(/[^a-z0-9]+/gi, "_");
      const fileName = `${ROLE_NAME.replace(/\s+/g, "_")}_${safeName}_${phoneSanitized}.pdf`;

      const cvBase64 = await fileToBase64(cvFile);

      const payload = {
        role: ROLE_NAME,
        fullName,
        email,
        phone,
        currentCity,
        linkedin: "",
        experienceBand: "",
        studyAbroadExperience: "",
        salesComfort: "",
        employmentStatus: "",
        noticePeriod: "",
        additionalNotes: experienceSummary,
        fileName,
        cvBase64,
        cvMimeType: cvFile.type,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application. Please try again.");
      }

      // Try to read cvUrl from Apps Script response (if available)
      let cvUrl: string | null = null;
      try {
        const body = await response.json();
        if (body && typeof body.cvUrl === "string") {
          cvUrl = body.cvUrl;
        }
      } catch {
        // ignore JSON errors
      }

      // Record in Supabase for internal analytics (non-blocking)
      try {
        await supabase
          .from("hiring_applications" as any)
          .insert({
            role: ROLE_NAME,
            full_name: fullName,
            email,
            phone,
            current_city: currentCity,
            additional_notes: experienceSummary,
            cv_url: cvUrl,
            source: "high-ticket-sales-executive",
          });
      } catch (insertError) {
        console.error("Failed to save sales hiring application to Supabase:", insertError);
      }

      trackMetaEvent("SalesHiringApplicationSubmitted");

      navigate("/hiring/thank-you?role=high-ticket-sales-executive");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong while submitting your application.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-50 border-b">
          <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
            <div className="max-w-3xl space-y-6">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-slate-300">
                We are hiring
              </p>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                High-Ticket Sales Executive
              </h1>
              <p className="text-sm md:text-lg text-slate-200 max-w-2xl">
                Join OnePercent Abroad&apos;s core sales team and help motivated students access
                premium mentorship for global universities and funding opportunities.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-amber-400 text-slate-900 hover:bg-amber-300"
                  onClick={handleScrollToForm}
                >
                  Apply Now – {ROLE_NAME}
                </Button>
              </div>
              <p className="text-xs md:text-sm text-slate-300">
                Location: <span className="font-semibold">Calicut, Kerala</span>
              </p>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="max-w-3xl space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-2">Requirements</h2>
                <p className="text-sm text-muted-foreground">
                  This role is designed for confident, driven professionals who can handle premium,
                  high-touch sales conversations with students and parents.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                <ul className="space-y-3 text-sm md:text-base text-muted-foreground list-disc list-inside">
                  <li>
                    <span className="font-medium text-foreground">Fluent in English</span> — strong spoken
                    and written communication.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Confident on calls</span> — comfortable
                    speaking with students and parents on high-value calls.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Proven in closing premium deals
                    </span>{" "}
                    — experience in consultative or high-ticket sales is a strong plus.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Bachelor&apos;s / Master&apos;s degree required
                    </span>{" "}
                    — background in business, education, or related fields is preferred but not mandatory.
                  </li>
                </ul>

                <p className="text-sm text-muted-foreground pt-2">
                  If you are hungry to learn, comfortable with performance-driven environments, and want
                  to work closely with ambitious students, this role is a strong fit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="sales-hiring-form" className="bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold">Apply for {ROLE_NAME}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Fill in your details and upload your latest CV. Our team will review your profile and
                  reach out to shortlisted candidates.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Current City *</Label>
                    <Input
                      id="city"
                      value={currentCity}
                      onChange={(e) => setCurrentCity(e.target.value)}
                      placeholder="Where are you currently based?"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceSummary">
                    Briefly describe your sales experience (optional)
                  </Label>
                  <Textarea
                    id="experienceSummary"
                    rows={4}
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    placeholder="Share your experience with high-ticket or consultative sales, industries you've worked in, and any key achievements."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cv">Upload CV (PDF, max 3MB) *</Label>
                  <Input
                    id="cv"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="confirmation"
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-muted-foreground"
                    checked={confirmation}
                    onChange={(e) => setConfirmation(e.target.checked)}
                  />
                  <Label htmlFor="confirmation" className="text-sm font-normal leading-snug">
                    I confirm that the information provided is accurate and I am genuinely interested in
                    the High-Ticket Sales Executive role.
                  </Label>
                </div>

                <Button type="submit" size="lg" className="rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SalesHiring;

