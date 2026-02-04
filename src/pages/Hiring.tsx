import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { trackMetaEvent } from "@/lib/metaPixel";
import { supabase } from "@/integrations/supabase/client";

type ExperienceBand =
  | "0-6"
  | "6-12"
  | "1-3"
  | "3+";

type StudyAbroadExperience =
  | "direct-counselling"
  | "backend"
  | "none";

type SalesComfort =
  | "very"
  | "somewhat"
  | "not";

type EmploymentStatus =
  | "employed"
  | "actively-looking"
  | "immediate";

type NoticePeriod =
  | "immediate"
  | "15"
  | "30"
  | "30+";

interface HiringFormValues {
  fullName: string;
  email: string;
  phone: string;
  currentCity: string;
  linkedin: string;
  experienceBand: ExperienceBand | "";
  studyAbroadExperience: StudyAbroadExperience | "";
  salesComfort: SalesComfort | "";
  employmentStatus: EmploymentStatus | "";
  noticePeriod: NoticePeriod | "";
  additionalNotes: string;
  confirmation: boolean;
  cv: FileList | null;
}

const ROLE_NAME = "Student Counsellor";

const stepFieldGroups: (keyof HiringFormValues)[][] = [
  ["fullName", "email", "phone", "currentCity", "linkedin"],
  ["experienceBand", "studyAbroadExperience", "salesComfort", "employmentStatus", "noticePeriod"],
  ["cv", "confirmation"],
];

const Hiring = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<HiringFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      currentCity: "",
      linkedin: "",
      experienceBand: "",
      studyAbroadExperience: "",
      salesComfort: "",
      employmentStatus: "",
      noticePeriod: "",
      additionalNotes: "",
      confirmation: false,
      cv: null,
    },
  });

  const handleScrollToForm = () => {
    const element = document.getElementById("student-counsellor-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    trackMetaEvent("HiringApplyHeroClick");
  };

  const goToNextStep = async () => {
    const fields = stepFieldGroups[step];
    const valid = await form.trigger(fields as any, { shouldFocus: true });
    if (!valid) return;

    if (step === 0) {
      trackMetaEvent("HiringFormStarted");
    }

    setStep((prev) => Math.min(prev + 1, stepFieldGroups.length - 1));
  };

  const goToPreviousStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // result is "data:application/pdf;base64,AAAA..."
        const base64 = result.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const onSubmit: SubmitHandler<HiringFormValues> = async (values) => {
    const cvFile = values.cv?.[0];
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

    if (!values.confirmation) {
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
      const phoneSanitized = values.phone.replace(/\s+/g, "");
      const safeName = values.fullName.replace(/[^a-z0-9]+/gi, "_");
      const fileName = `${ROLE_NAME.replace(/\s+/g, "_")}_${safeName}_${phoneSanitized}.pdf`;

      const cvBase64 = await fileToBase64(cvFile);

      const payload = {
        role: ROLE_NAME,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        currentCity: values.currentCity,
        linkedin: values.linkedin,
        experienceBand: values.experienceBand,
        studyAbroadExperience: values.studyAbroadExperience,
        salesComfort: values.salesComfort,
        employmentStatus: values.employmentStatus,
        noticePeriod: values.noticePeriod,
        additionalNotes: values.additionalNotes,
        fileName,
        cvBase64,
        cvMimeType: cvFile.type,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        // Intentionally avoid setting Content-Type so the browser uses a simple request
        // (text/plain) and skips CORS preflight. Apps Script reads JSON from postData.contents.
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
        // ignore JSON errors, Supabase insert will just use null cv_url
      }

      // Record in Supabase for internal analytics (non-blocking)
      try {
        await supabase
          .from("hiring_applications" as any)
          .insert({
            role: ROLE_NAME,
            full_name: values.fullName,
            email: values.email,
            phone: values.phone,
            current_city: values.currentCity,
            additional_notes: values.additionalNotes,
            cv_url: cvUrl,
            source: "student-counsellor",
          });
      } catch (insertError) {
        console.error("Failed to save hiring application to Supabase:", insertError);
      }

      // Fire Meta events immediately after a confirmed successful submission
      if (window.fbq) {
        window.fbq("track", "Lead", {
          content_name: "Hiring Application",
          content_category: "Recruitment",
          value: 1,
          currency: "INR",
        });
      }

      trackMetaEvent("HiringApplicationSubmitted");

      navigate("/hiring/thank-you?role=student-counsellor");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong while submitting your application.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const currentStep = step + 1;
  const totalSteps = stepFieldGroups.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Role Header */}
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">
                Hiring
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Student Counsellor
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Role details and application form for candidates who want to guide students in their global
                education journey.
              </p>
              <Button size="lg" className="rounded-full" onClick={handleScrollToForm}>
                Apply Now – Student Counsellor
              </Button>
            </div>
          </div>
        </section>

        {/* Role Description */}
        <section className="border-b bg-slate-50">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">About the Role</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What you&apos;ll do</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>Guide students through their study abroad options and application journey.</li>
                  <li>Conduct structured counselling calls and follow-ups.</li>
                  <li>Work closely with our admissions and operations teams.</li>
                  <li>Maintain accurate notes and updates on each student.</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Who should apply</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>You enjoy speaking with students and parents.</li>
                  <li>You are comfortable with goal-oriented sales and follow-ups.</li>
                  <li>You have experience in education, counselling, or study abroad (preferred but not mandatory).</li>
                  <li>You are hungry to learn and grow in a fast-moving environment.</li>
                </ul>
                <h3 className="text-lg font-semibold pt-2">Growth &amp; learning</h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll learn how top-tier admissions work, build a strong understanding of global universities,
                  and grow into senior counselling, partnerships, or leadership roles based on performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="student-counsellor-form" className="bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold">
                  Student Counsellor – Application Form
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  This form is designed to keep things simple for you and for our HR team, while helping us focus on serious, high-quality applications.
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {step === 0 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">A. Basic Details</h3>
                      <FormField
                        control={form.control}
                        name="fullName"
                        rules={{ required: "Full name is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        rules={{ required: "Phone number is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentCity"
                        rules={{ required: "Current city is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Where are you currently based?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              LinkedIn Profile <span className="text-muted-foreground">(preferred)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Paste your LinkedIn URL (if available)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">B. Screening</h3>
                      <p className="text-sm text-muted-foreground">
                        These questions help us quickly understand if the role is a good fit for you. Please answer honestly.
                      </p>

                      <FormField
                        control={form.control}
                        name="experienceBand"
                        rules={{ required: "Please select your total relevant experience" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total experience in student counselling / education sector *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                className="grid gap-2 md:grid-cols-2"
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="0-6" id="exp-0-6" />
                                  <Label htmlFor="exp-0-6" className="cursor-pointer">
                                    0–6 months
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="6-12" id="exp-6-12" />
                                  <Label htmlFor="exp-6-12" className="cursor-pointer">
                                    6–12 months
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="1-3" id="exp-1-3" />
                                  <Label htmlFor="exp-1-3" className="cursor-pointer">
                                    1–3 years
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="3+" id="exp-3-plus" />
                                  <Label htmlFor="exp-3-plus" className="cursor-pointer">
                                    3+ years
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studyAbroadExperience"
                        rules={{ required: "Please share your experience with study abroad admissions" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Have you worked with study abroad admissions before? *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                className="grid gap-2 md:grid-cols-2"
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="direct-counselling" id="study-direct" />
                                  <Label htmlFor="study-direct" className="cursor-pointer">
                                    Yes – direct counselling
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="backend" id="study-backend" />
                                  <Label htmlFor="study-backend" className="cursor-pointer">
                                    Yes – backend / documentation
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3 md:col-span-2">
                                  <RadioGroupItem value="none" id="study-none" />
                                  <Label htmlFor="study-none" className="cursor-pointer">
                                    No
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salesComfort"
                        rules={{ required: "Please share your comfort with sales & follow-ups" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comfort with sales &amp; follow-ups *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                className="grid gap-2 md:grid-cols-3"
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="very" id="sales-very" />
                                  <Label htmlFor="sales-very" className="cursor-pointer">
                                    Very comfortable
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="somewhat" id="sales-somewhat" />
                                  <Label htmlFor="sales-somewhat" className="cursor-pointer">
                                    Somewhat comfortable
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="not" id="sales-not" />
                                  <Label htmlFor="sales-not" className="cursor-pointer">
                                    Not comfortable
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employmentStatus"
                        rules={{ required: "Please select your current employment status" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current employment status *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                className="grid gap-2 md:grid-cols-3"
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="employed" id="emp-employed" />
                                  <Label htmlFor="emp-employed" className="cursor-pointer">
                                    Employed
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="actively-looking" id="emp-looking" />
                                  <Label htmlFor="emp-looking" className="cursor-pointer">
                                    Actively looking
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="immediate" id="emp-immediate" />
                                  <Label htmlFor="emp-immediate" className="cursor-pointer">
                                    Immediate joiner
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="noticePeriod"
                        rules={{ required: "Please select your notice period" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notice period *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                className="grid gap-2 md:grid-cols-4"
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="immediate" id="notice-immediate" />
                                  <Label htmlFor="notice-immediate" className="cursor-pointer">
                                    Immediate
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="15" id="notice-15" />
                                  <Label htmlFor="notice-15" className="cursor-pointer">
                                    15 days
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="30" id="notice-30" />
                                  <Label htmlFor="notice-30" className="cursor-pointer">
                                    30 days
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                  <RadioGroupItem value="30+" id="notice-30-plus" />
                                  <Label htmlFor="notice-30-plus" className="cursor-pointer">
                                    More than 30 days
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anything else we should know? (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Share any context that helps us understand your profile better."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">C. CV &amp; Final Confirmation</h3>
                      <p className="text-sm text-muted-foreground">
                        We prefer keeping your CV safe and organised in our HR workspace. Your resume will not be stored
                        permanently on this website server.
                      </p>

                      <FormField
                        control={form.control}
                        name="cv"
                        rules={{ required: "Please upload your CV in PDF format" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload CV (PDF, max 3MB) *</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => {
                                  const files = event.target.files;
                                  field.onChange(files && files.length > 0 ? files : null);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmation"
                        rules={{ required: "Please confirm the accuracy of your information" }}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-muted-foreground"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I confirm that the information provided is accurate and I am genuinely interested in this role.
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button type="button" variant="outline" disabled={step === 0 || isSubmitting} onClick={goToPreviousStep}>
                      Back
                    </Button>

                    {step < totalSteps - 1 && (
                      <Button type="button" onClick={goToNextStep}>
                        Next
                      </Button>
                    )}

                    {step === totalSteps - 1 && (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Hiring;

