import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { trackMetaEvent } from "@/lib/metaPixel";

const DEGREES = ["Masters", "MBA", "Bachelor's", "PhD"];
const DESTINATIONS = ["USA", "Germany", "UK", "Canada", "Australia", "France", "Ireland", "Netherlands", "Other"];
const START_YEARS = ["2026", "2027", "2028+"];
const ACADEMIC_SCORES = ["Above 7.5 / 75%+", "Below 7.5 or other system"];
const INVESTMENT_BUDGET_OPTIONS = [
  "5 to 15 Lakhs",
  "15 to 40 L",
  "40 to 70 L",
  "70+ L",
];
const POPULAR_COURSES = [
  "Computer Science", "Data Science", "Artificial Intelligence", "MBA / Business",
  "Mechanical Engineering", "Electrical Engineering", "Civil Engineering",
  "Finance", "Marketing", "Supply Chain Management", "Economics",
  "Psychology", "Public Health", "Biotechnology", "Architecture",
  "Design", "Law / LLM", "Media & Communications", "Hospitality Management",
  "Environmental Science", "Mathematics", "Physics", "Chemistry",
];
const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+60", label: "🇲🇾 +60" },
  { code: "+977", label: "🇳🇵 +977" },
  { code: "+94", label: "🇱🇰 +94" },
  { code: "+880", label: "🇧🇩 +880" },
];

type FormData = {
  degree: string;
  destinations: string[];
  startYear: string;
  courseInterests: string[];
  academicScore: string;
  investmentBudget: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
};

const LeadForm = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  const [form, setForm] = useState<FormData>({
    degree: "",
    destinations: [],
    startYear: "",
    courseInterests: [],
    academicScore: "",
    investmentBudget: "",
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+91",
  });

  const utmData = {
    utm_source: searchParams.get("utm_source") || "",
    utm_campaign: searchParams.get("utm_campaign") || "",
    utm_adset: searchParams.get("utm_adset") || "",
    utm_ad: searchParams.get("utm_ad") || "",
    utm_medium: searchParams.get("utm_medium") || "",
  };

  const trackStep = useCallback(async (stepNum: number) => {
    console.log(`Form step reached: ${stepNum}`);
  }, []);

  useEffect(() => {
    trackStep(step);
  }, [step, trackStep]);

  const filteredCourses = POPULAR_COURSES.filter(
    (c) => c.toLowerCase().includes(courseSearch.toLowerCase()) && !form.courseInterests.includes(c)
  );

  const toggleDestination = (dest: string) => {
    setForm((prev) => ({
      ...prev,
      destinations: prev.destinations.includes(dest)
        ? prev.destinations.filter((d) => d !== dest)
        : [...prev.destinations, dest],
    }));
  };

  const addCourse = (course: string) => {
    if (!form.courseInterests.includes(course)) {
      setForm((prev) => ({ ...prev, courseInterests: [...prev.courseInterests, course] }));
    }
    setCourseSearch("");
    setShowCourseDropdown(false);
  };

  const removeCourse = (course: string) => {
    setForm((prev) => ({
      ...prev,
      courseInterests: prev.courseInterests.filter((c) => c !== course),
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return form.degree !== "" && form.destinations.length > 0;
      case 2: return form.startYear !== "";
      case 3: return form.academicScore !== "" && form.investmentBudget !== "";
      case 4: return form.fullName.trim() !== "" && form.email.includes("@") && form.phone.length >= 7;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.from("leads" as any).insert({
        degree: form.degree,
        destinations: form.destinations,
        start_year: form.startYear,
        course_interests: form.courseInterests,
        academic_score: form.academicScore,
        investment_budget: form.investmentBudget,
        full_name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        country_code: form.countryCode,
        utm_source: utmData.utm_source || null,
        utm_campaign: utmData.utm_campaign || null,
        utm_adset: utmData.utm_adset || null,
        utm_ad: utmData.utm_ad || null,
        utm_medium: utmData.utm_medium || null,
        step_reached: 4,
      } as any);

      if (dbError) {
        if (dbError.message?.includes("leads_email_unique") || dbError.message?.includes("leads_phone_unique")) {
          toast({
            title: "Already registered",
            description: "This email or phone number is already registered. We'll get in touch soon!",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
        throw dbError;
      }

      try {
        await supabase.functions.invoke("leadsquared-create-lead", {
          body: {
            name: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            phoneNumber: form.phone.trim(),
            countryCode: form.countryCode,
            degree: form.degree,
            destinations: form.destinations.join(", "),
            startYear: form.startYear,
            courseInterests: form.courseInterests.join(", "),
            academicScore: form.academicScore,
            investmentBudget: form.investmentBudget,
            ...utmData,
          },
        });
      } catch (lsError) {
        console.error("LeadSquared error (non-blocking):", lsError);
      }

      trackMetaEvent("Lead");
      window.location.href = "https://chat.whatsapp.com/GzkeVrL9N1S749BhMkdXN9";
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-primary flex items-start md:items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-2xl rounded-2xl md:rounded-3xl flex flex-col shadow-2xl overflow-hidden my-4 md:my-0">

        {/* Card header */}
        <div className="px-8 md:px-12 pt-8 md:pt-10 pb-6">
          <img src="/logo-blue.png" alt="OnePercent Abroad" className="h-9 w-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Tell us about your study abroad goals — we'll match you with the right guidance.
          </p>
        </div>

        {/* Step content */}
        <div className="flex-1 px-8 md:px-12 pb-4">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    What <span className="font-bold">degree</span> are you looking for?
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {DEGREES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm((p) => ({ ...p, degree: d }))}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                        form.degree === d
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    Preferred <span className="font-bold">study destinations</span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => toggleDestination(dest)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                        form.destinations.includes(dest)
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    When do you plan to <span className="font-bold">start</span>?
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {START_YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => setForm((p) => ({ ...p, startYear: y }))}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                        form.startYear === y
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    What <span className="font-bold">courses</span> interest you?{" "}
                    <span className="text-muted-foreground font-normal text-base">(optional)</span>
                  </h2>
                </div>
                <div className="pl-5 space-y-3">
                  {form.courseInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.courseInterests.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-foreground text-white text-xs font-medium"
                        >
                          {c}
                          <button onClick={() => removeCourse(c)} className="ml-1 hover:opacity-70 text-base leading-none">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Input
                      placeholder="Type to search courses..."
                      value={courseSearch}
                      onChange={(e) => { setCourseSearch(e.target.value); setShowCourseDropdown(true); }}
                      onFocus={() => setShowCourseDropdown(true)}
                      className="rounded-full border-border text-sm"
                    />
                    {showCourseDropdown && (
                      <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-border rounded-2xl shadow-lg">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((c) => (
                            <button
                              key={c}
                              onClick={() => addCourse(c)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                            >
                              {c}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            {courseSearch.trim() ? (
                              <button onClick={() => addCourse(courseSearch.trim())} className="text-primary hover:underline">
                                Add "{courseSearch.trim()}"
                              </button>
                            ) : "All courses selected"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    Your <span className="font-bold">academic score</span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {ACADEMIC_SCORES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((p) => ({ ...p, academicScore: s }))}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                        form.academicScore === s
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    How much are you willing to <span className="font-bold">invest</span> in higher education?
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {INVESTMENT_BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setForm((p) => ({ ...p, investmentBudget: opt }))}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                        form.investmentBudget === opt
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start gap-0 mb-5">
                <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                  Almost there! Your <span className="font-bold">contact details</span>
                </h2>
              </div>

              <div className="pl-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <Input
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={form.countryCode}
                      onChange={(e) => setForm((p) => ({ ...p, countryCode: e.target.value }))}
                      className="h-10 rounded-full border border-input bg-background px-3 text-sm min-w-[100px]"
                    >
                      {COUNTRY_CODES.map((cc) => (
                        <option key={cc.code} value={cc.code}>{cc.label}</option>
                      ))}
                    </select>
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                      className="flex-1 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="px-8 md:px-12 pb-8 md:pb-10 pt-4">
          <hr className="border-border mb-4" />
          <div className="flex items-center justify-between gap-4">
            {/* Step counter + progress */}
            <div className="flex flex-col gap-1.5 min-w-[80px]">
              <span className="text-xs text-muted-foreground font-medium">
                {step} of 4
              </span>
              <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-border text-muted-foreground hover:border-foreground/30 transition-all"
                >
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    canProceed()
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || submitting}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    canProceed() && !submitting
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Submit</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeadForm;
