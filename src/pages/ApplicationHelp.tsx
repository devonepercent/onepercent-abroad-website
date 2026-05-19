import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { initMetaPixel, trackMetaEvent } from "@/lib/metaPixel";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Check, Loader2 } from "lucide-react";

const STAGES = [
  "Offer accepted",
  "Paid initial deposit / received CL",
  "Preparing for visa",
  "Visa appointment scheduled",
  "Waiting for visa / approved",
];

const COUNTRIES = [
  "USA", "Germany", "UK", "Canada", "Australia", "France", "Ireland", "Netherlands", "Other",
];

const INTAKES = ["Spring 2026", "Summer 2026", "Fall 2026"];

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
  fullName: string;
  stage: string;
  university: string;
  program: string;
  country: string;
  intake: string;
  fees: string;
  needsFinancing: "" | "yes" | "no";
  countryCode: string;
  phone: string;
  email: string;
};

const ApplicationHelp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullName: "",
    stage: "",
    university: "",
    program: "",
    country: "",
    intake: "",
    fees: "",
    needsFinancing: "",
    countryCode: "+91",
    phone: "",
    email: "",
  });

  const utmData = {
    utm_source: searchParams.get("utm_source") || "",
    utm_campaign: searchParams.get("utm_campaign") || "",
    utm_adset: searchParams.get("utm_adset") || "",
    utm_ad: searchParams.get("utm_ad") || "",
    utm_medium: searchParams.get("utm_medium") || "",
  };

  const trackStep = useCallback((stepNum: number) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "form_step_reached", {
        event_category: "application_help_form",
        event_label: `Step ${stepNum}`,
        value: stepNum,
      });
    }
  }, []);

  useEffect(() => {
    trackStep(step);
  }, [step, trackStep]);

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.fullName.trim() !== "" && form.stage !== "";
      case 2:
        return (
          form.university.trim() !== "" &&
          form.program.trim() !== "" &&
          form.country !== "" &&
          form.intake.trim() !== "" &&
          form.fees.trim() !== ""
        );
      case 3:
        return (
          form.needsFinancing !== "" &&
          form.phone.length >= 7 &&
          form.email.includes("@")
        );
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase
        .from("application_help_submissions" as any)
        .insert({
          full_name: form.fullName.trim(),
          stage: form.stage,
          university: form.university.trim(),
          program: form.program.trim(),
          country: form.country,
          intake: form.intake.trim(),
          fees: form.fees.trim(),
          needs_financing: form.needsFinancing === "yes",
          phone: form.phone.trim(),
          country_code: form.countryCode,
          email: form.email.trim().toLowerCase(),
          utm_source: utmData.utm_source || null,
          utm_campaign: utmData.utm_campaign || null,
          utm_adset: utmData.utm_adset || null,
          utm_ad: utmData.utm_ad || null,
          utm_medium: utmData.utm_medium || null,
          step_reached: 3,
        } as any);

      if (dbError) throw dbError;

      try {
        const channel = supabase.channel("application-help-alerts");
        await new Promise<void>((resolve) => {
          channel.subscribe((status) => {
            if (status === "SUBSCRIBED") resolve();
          });
          setTimeout(resolve, 1500);
        });
        await channel.send({
          type: "broadcast",
          event: "new-application-help",
          payload: {},
        });
        await supabase.removeChannel(channel);
      } catch (e) {
        console.error("Application help broadcast failed (non-blocking):", e);
      }

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "form_submitted", {
          event_category: "application_help_form",
          event_label: "Submitted",
        });
      }

      initMetaPixel();
      trackMetaEvent("Lead");

      navigate("/application-help/thank-you");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Something went wrong",
        description: error?.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-primary flex items-start md:items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-2xl rounded-2xl md:rounded-3xl flex flex-col shadow-2xl overflow-hidden my-4 md:my-0">

        <div className="px-8 md:px-12 pt-8 md:pt-10 pb-6">
          <img src="/logo-blue.png" alt="OnePercent Abroad" className="h-9 w-auto mb-3" />
          <h1 className="text-xl md:text-2xl font-display font-semibold text-foreground leading-tight mb-2">
            Already got your university admit? Need help with what comes next?
          </h1>
          <p className="text-sm text-muted-foreground">
            We're offering free support to a select few — visa, finance, post-admit guidance. Applied on your own and need help? Reach out below.
          </p>
        </div>

        <div className="flex-1 px-8 md:px-12 pb-4">

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    Your <span className="font-bold">name</span>
                  </h2>
                </div>
                <div className="pl-5">
                  <Input
                    placeholder="Full name"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    What <span className="font-bold">stage</span> are you in right now?
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((p) => ({ ...p, stage: s }))}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                        form.stage === s
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start gap-0 mb-1">
                <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                  Your <span className="font-bold">offer details</span>
                </h2>
              </div>

              <div className="pl-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">University</label>
                  <Input
                    placeholder="e.g. Technical University of Munich"
                    value={form.university}
                    onChange={(e) => setForm((p) => ({ ...p, university: e.target.value }))}
                    className="rounded-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Program</label>
                  <Input
                    placeholder="e.g. MSc Computer Science"
                    value={form.program}
                    onChange={(e) => setForm((p) => ({ ...p, program: e.target.value }))}
                    className="rounded-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Country</label>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((p) => ({ ...p, country: c }))}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                          form.country === c
                            ? "bg-foreground text-white border-foreground"
                            : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Intake</label>
                  <div className="flex flex-wrap gap-2">
                    {INTAKES.map((i) => (
                      <button
                        key={i}
                        onClick={() => setForm((p) => ({ ...p, intake: i }))}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                          form.intake === i
                            ? "bg-foreground text-white border-foreground"
                            : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Fees</label>
                  <Input
                    placeholder="e.g. ₹40L total / $50K"
                    value={form.fees}
                    onChange={(e) => setForm((p) => ({ ...p, fees: e.target.value }))}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    Looking for <span className="font-bold">financing</span> options?
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {[
                    { v: "yes", l: "Yes" },
                    { v: "no", l: "No" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setForm((p) => ({ ...p, needsFinancing: opt.v as "yes" | "no" }))}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all border ${
                        form.needsFinancing === opt.v
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-start gap-0 mb-5">
                  <div className="w-1 self-stretch bg-primary rounded-full mr-4 shrink-0" />
                  <h2 className="text-lg md:text-xl font-display font-semibold text-foreground leading-snug">
                    Your <span className="font-bold">contact details</span>
                  </h2>
                </div>

                <div className="pl-5 space-y-4">
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
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 md:px-12 pb-8 md:pb-10 pt-4">
          <hr className="border-border mb-4" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-[80px]">
              <span className="text-xs text-muted-foreground font-medium">
                {step} of 3
              </span>
              <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-border text-muted-foreground hover:border-foreground/30 transition-all"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
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

export default ApplicationHelp;
