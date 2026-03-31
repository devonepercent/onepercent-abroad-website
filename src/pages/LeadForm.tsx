import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

const DEGREES = ["Masters", "MBA", "Bachelor's"];
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
  const navigate = useNavigate();
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

  // Track step reached for drop-off analysis
  const trackStep = useCallback(async (stepNum: number) => {
    try {
      // We'll store partial data on final submit; this is just for analytics
      console.log(`Form step reached: ${stepNum}`);
    } catch (e) {
      // silent
    }
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
      // Insert into Supabase
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

      // Send to LeadSquared
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

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="w-full px-4 py-4 border-b border-border bg-card">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src="/logo-blue.png" alt="OnePercent Abroad" className="h-8 w-auto" />
        </div>
      </div>

      {/* Progress */}
      <div className="w-full px-4 pt-6">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">What degree are you looking for?</h2>
                <p className="text-sm text-muted-foreground">Select one</p>
              </div>
              <div className="space-y-3">
                {DEGREES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((p) => ({ ...p, degree: d }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      form.degree === d
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Preferred study destinations</h2>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {DESTINATIONS.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => toggleDestination(dest)}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                      form.destinations.includes(dest)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">When do you plan to start?</h2>
                <p className="text-sm text-muted-foreground">Select your intended start year</p>
              </div>
              <div className="space-y-3">
                {START_YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setForm((p) => ({ ...p, startYear: y }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      form.startYear === y
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">What courses interest you?</h2>
                <p className="text-sm text-muted-foreground">Search and select (optional)</p>
              </div>

              {/* Selected courses */}
              {form.courseInterests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.courseInterests.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium"
                    >
                      {c}
                      <button onClick={() => removeCourse(c)} className="ml-1 hover:opacity-70">×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Input
                  placeholder="Type to search courses..."
                  value={courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setShowCourseDropdown(true);
                  }}
                  onFocus={() => setShowCourseDropdown(true)}
                  className="w-full"
                />
                {showCourseDropdown && (courseSearch || true) && (
                  <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-card border border-border rounded-lg shadow-lg">
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
                          <button
                            onClick={() => addCourse(courseSearch.trim())}
                            className="text-primary hover:underline"
                          >
                            Add "{courseSearch.trim()}"
                          </button>
                        ) : (
                          "All courses selected"
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Your academic score</h2>
                <p className="text-sm text-muted-foreground">Select the range that applies</p>
              </div>
              <div className="space-y-3">
                {ACADEMIC_SCORES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((p) => ({ ...p, academicScore: s }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      form.academicScore === s
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">How much are you willing to invest in higher education?</h2>
                <p className="text-sm text-muted-foreground">Select one</p>
              </div>
              <div className="space-y-3">
                {INVESTMENT_BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setForm((p) => ({ ...p, investmentBudget: opt }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      form.investmentBudget === opt
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Almost there! Your details</h2>
                <p className="text-sm text-muted-foreground">We'll use this to get in touch with you</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <Input
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={form.countryCode}
                      onChange={(e) => setForm((p) => ({ ...p, countryCode: e.target.value }))}
                      className="h-10 rounded-md border border-input bg-background px-2 text-sm min-w-[90px]"
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
                      className="flex-1"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 w-full px-4 py-4 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex-1 rounded-xl"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="flex-1 rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Submit
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
