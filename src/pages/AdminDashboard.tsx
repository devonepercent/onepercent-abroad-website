import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, Clock, Download, Loader2, LogOut, Mail, Menu, Search, Send, Trash2, Upload, XCircle } from "lucide-react";
import { ProjectView } from "@/components/tracker/ProjectView";

interface Registration {
  id: string;
  name: string;
  email: string;
  country_code: string;
  phone_number: string;
  webinar_name: string | null;
  created_at: string;
}

interface HiringApplication {
  id: string;
  role: string;
  full_name: string;
  email: string;
  phone: string;
  current_city: string;
  additional_notes: string | null;
  cv_url: string | null;
  source: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  degree: string;
  destinations: string[];
  start_year: string;
  course_interests: string[];
  academic_score: string;
  investment_budget: string;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  source: string;
  created_at: string;
}

interface EnquiryEduEntry {
  level?: string; institution?: string; degree?: string; major?: string;
  gpa?: string; gpaScale?: string; startYear?: string; endYear?: string; current?: boolean;
}
interface EnquiryTestEntry { id?: string; type?: string; customName?: string; score?: string }
interface EnquiryProfileForm {
  education?: EnquiryEduEntry[];
  scores?: { tests?: EnquiryTestEntry[]; [k: string]: unknown };
  work?: { years?: string; currentRole?: string; industry?: string };
  target?: { degree?: string; major?: string; intake?: string; budgetMin?: string; budgetMax?: string };
  goals?: string;
  notes?: string;
  submitted_at?: string | null;
}
interface EnquiryOnboarding {
  degree?: string; destinations?: string[]; start_year?: string; field_of_study?: string;
  cgpa?: number | string | null; budget?: string; state?: string; city?: string;
}
interface EnquiryEvaluation {
  report_markdown?: string | null;
  mentor_instructions?: string | null;
  created_at?: string | null;
}
interface StudentSnapshot {
  captured_at?: string;
  onboarding?: EnquiryOnboarding | null;
  profile_form?: EnquiryProfileForm | null;
  evaluation?: EnquiryEvaluation | null;
}

interface ProgramEnquiry {
  id: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  program_name: string;
  university_name: string | null;
  country: string | null;
  match_score: number | null;
  source: string | null;
  status: string | null;
  created_at: string;
  student_snapshot: StudentSnapshot | null;
}

interface SalesEvaluationAdmin {
  id: string;
  candidate_name: string | null;
  user_email: string | null;
  created_at: string;
}

interface SopFeedback {
  id: string;
  rating: number;
  review: string | null;
  suggestions: string | null;
  name: string | null;
  email: string | null;
  source: string | null;
  created_at: string;
}

interface ErasmusCallRequest {
  id: string;
  name: string;
  phone: string;
  source: string | null;
  created_at: string;
}

interface ErasmusPurchase {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  items: { id: string; code: string; name: string; category?: string }[] | null;
  num_items: number;
  amount: number;
  payu_txnid: string | null;
  payu_mihpayid: string | null;
  status: string;
  email_sent: boolean | null;
  created_at: string;
}

interface BillingCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  amount: number | null;
  currency: string | null;
  notes: string | null;
  created_at: string;
}

interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  bill_url: string | null;
  created_at: string;
}

interface SopPurchase {
  id: string;
  firstname: string | null;
  email: string;
  phone: string | null;
  plan: "single" | "bundle" | "full";
  selected_sop_ids: number[];
  amount: number;
  status: "pending" | "completed" | "failed";
  payu_txnid: string | null;
  payu_mihpayid: string | null;
  created_at: string;
  email_sent: boolean | null;
  email_sent_at: string | null;
  email_error: string | null;
  resend_message_id: string | null;
  source: "payu" | "manual" | null;
}

interface SopEvent {
  id: string;
  purchase_id: string | null;
  email: string | null;
  event_type: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

const SOP_VAULT_NAMES: Record<number, string> = {
  1: "Hertie School — MA Public Policy",
  2: "Johns Hopkins (SAIS) — MA Public Policy",
  3: "Erasmus Mundus Joint Master",
  4: "NMBU — MSc Agroecology",
  5: "Europubhealth+ — European Public Health",
  6: "University of Pisa — MSc AI Data Engineering",
  7: "Central European University — MA Public Policy",
  8: "University of Glasgow — MSc Data Science",
  9: "Keele — MSc Environmental & Green Technology",
  10: "University of Freiburg — MSc Global Urban Health",
  11: "University of Leeds — MSc Sustainable Cities",
  12: "University of Glasgow — MSc International Journalism",
  13: "University of Sussex — MA Development Studies",
  14: "ACES-STAR — MSc Aquaculture, Environment & Society",
  15: "University of Sheffield — MPH Public Health",
};
const ALL_SOP_VAULT_IDS = Object.keys(SOP_VAULT_NAMES).map(Number).sort((a, b) => a - b);

const SOP_EVENT_LABELS: Record<string, { label: string; tone: string; dot: string }> = {
  checkout_initiated: { label: "Checkout started", tone: "text-blue-600", dot: "bg-blue-600" },
  payment_success: { label: "Payment successful", tone: "text-green-600", dot: "bg-green-600" },
  payment_failed: { label: "Payment failed", tone: "text-destructive", dot: "bg-destructive" },
  email_sent: { label: "Email sent", tone: "text-green-600", dot: "bg-green-600" },
  email_failed: { label: "Email failed", tone: "text-destructive", dot: "bg-destructive" },
  manual_resend: { label: "Manual send triggered", tone: "text-amber-600", dot: "bg-amber-600" },
};
const SOP_EVENT_FALLBACK = { label: "", tone: "text-foreground", dot: "bg-muted-foreground" };

type UserEmailMap = Record<string, string>;

const PAGE_SIZE = 10;

const EXPENSE_CATEGORIES = [
  "Travel",
  "Food & Meals",
  "Office Supplies",
  "Software & Subscriptions",
  "Marketing",
  "Utilities",
  "Miscellaneous",
];

// Coerce the new tests[] array (and legacy fixed score fields) into a uniform
// list for display — mirrors lib/formatProfile.ts in the Agent app.
function collectEnquiryTests(scores: EnquiryProfileForm["scores"] | undefined): { label: string; score: string }[] {
  if (!scores) return [];
  const out: { label: string; score: string }[] = [];
  const tests = scores.tests;
  if (Array.isArray(tests) && tests.length) {
    for (const t of tests) {
      if (!t?.score) continue;
      const label = t.type === "Other" ? (t.customName?.trim() || "Other") : (t.type ?? "Test");
      out.push({ label, score: t.score });
    }
    return out;
  }
  const add = (label: string, score?: unknown) => { if (typeof score === "string" && score) out.push({ label, score }); };
  const s = scores as Record<string, unknown>;
  if (s.greV || s.greQ || s.greAwa) {
    out.push({ label: "GRE", score: `V=${s.greV ?? "–"}, Q=${s.greQ ?? "–"}, AWA=${s.greAwa ?? "–"}` });
  }
  add("GMAT", s.gmat); add("SAT", s.sat); add("ACT", s.act);
  add("IELTS", s.ielts); add("TOEFL", s.toefl); add("Duolingo", s.duolingo);
  return out;
}

const EnquiryDetailRow = ({ label, value }: { label: string; value?: ReactNode }) => {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground min-w-[140px] shrink-0">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
};

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1 mb-2 mt-1">
    {children}
  </h4>
);

const EnquiryDetailDialog = ({
  enquiry,
  onClose,
}: {
  enquiry: ProgramEnquiry | null;
  onClose: () => void;
}) => {
  const snap = enquiry?.student_snapshot ?? null;
  const ob = snap?.onboarding ?? null;
  const form = snap?.profile_form ?? null;
  const evaluation = snap?.evaluation ?? null;
  const tests = collectEnquiryTests(form?.scores);
  const hasDetails = !!(ob || form || evaluation);

  return (
    <Dialog open={!!enquiry} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {enquiry && (
          <>
            <DialogHeader>
              <DialogTitle>{enquiry.student_name}</DialogTitle>
              <DialogDescription>
                Enquired {new Date(enquiry.created_at).toLocaleString()} · via {enquiry.source || "agent-app"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Contact + enquiry */}
              <div className="space-y-1">
                <SectionHeading>Enquiry</SectionHeading>
                <EnquiryDetailRow label="Email" value={enquiry.student_email} />
                <EnquiryDetailRow label="Phone" value={enquiry.student_phone || "—"} />
                <EnquiryDetailRow label="Program" value={enquiry.program_name} />
                <EnquiryDetailRow label="University" value={enquiry.university_name || "—"} />
                <EnquiryDetailRow label="Country" value={enquiry.country || "—"} />
                <EnquiryDetailRow label="Match score" value={enquiry.match_score != null ? `${enquiry.match_score}/10` : "—"} />
              </div>

              {!hasDetails && (
                <p className="text-sm text-muted-foreground">
                  No detailed profile was captured for this enquiry. (Older enquiries, sent before
                  the profile snapshot feature, only carry the basic contact info above.)
                </p>
              )}

              {/* Quick profile (onboarding) */}
              {ob && (
                <div className="space-y-1">
                  <SectionHeading>Quick profile</SectionHeading>
                  <EnquiryDetailRow label="Target degree" value={ob.degree} />
                  <EnquiryDetailRow label="Destinations" value={ob.destinations?.length ? ob.destinations.join(", ") : undefined} />
                  <EnquiryDetailRow label="Intake year" value={ob.start_year} />
                  <EnquiryDetailRow label="Field of study" value={ob.field_of_study} />
                  <EnquiryDetailRow label="CGPA" value={ob.cgpa != null && ob.cgpa !== "" ? String(ob.cgpa) : undefined} />
                  <EnquiryDetailRow label="Budget" value={ob.budget} />
                  <EnquiryDetailRow label="Location" value={[ob.city, ob.state].filter(Boolean).join(", ") || undefined} />
                </div>
              )}

              {/* Education */}
              {form?.education?.length ? (
                <div className="space-y-2">
                  <SectionHeading>Education</SectionHeading>
                  {form.education.map((e, i) => (
                    <div key={i} className="text-sm border rounded-md p-2 bg-muted/30">
                      <div className="font-medium">
                        {[e.level, e.degree, e.major ? `(${e.major})` : ""].filter(Boolean).join(" ") || "—"}
                      </div>
                      <div className="text-muted-foreground">
                        {[
                          e.institution,
                          e.gpa ? `GPA ${e.gpa}/${e.gpaScale ?? "10"}` : "",
                          e.startYear ? `${e.startYear}–${e.current ? "Present" : (e.endYear ?? "?")}` : "",
                        ].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Test scores */}
              {tests.length ? (
                <div className="space-y-1">
                  <SectionHeading>Test scores</SectionHeading>
                  {tests.map((t, i) => <EnquiryDetailRow key={i} label={t.label} value={t.score} />)}
                </div>
              ) : null}

              {/* Work experience */}
              {form?.work && (form.work.years || form.work.currentRole || form.work.industry) ? (
                <div className="space-y-1">
                  <SectionHeading>Work experience</SectionHeading>
                  <EnquiryDetailRow label="Total years" value={form.work.years} />
                  <EnquiryDetailRow label="Current/recent role" value={form.work.currentRole} />
                  <EnquiryDetailRow label="Industry" value={form.work.industry} />
                </div>
              ) : null}

              {/* Target program */}
              {form?.target && (form.target.degree || form.target.major || form.target.intake || form.target.budgetMin || form.target.budgetMax) ? (
                <div className="space-y-1">
                  <SectionHeading>Target program</SectionHeading>
                  <EnquiryDetailRow label="Target degree" value={form.target.degree} />
                  <EnquiryDetailRow label="Major / field" value={form.target.major} />
                  <EnquiryDetailRow label="Intake" value={form.target.intake} />
                  <EnquiryDetailRow
                    label="Budget / yr"
                    value={form.target.budgetMin || form.target.budgetMax
                      ? `₹${form.target.budgetMin || 0} – ₹${form.target.budgetMax || "?"}`
                      : undefined}
                  />
                </div>
              ) : null}

              {/* Goals & notes */}
              {form?.goals ? (
                <div className="space-y-1">
                  <SectionHeading>Career goals</SectionHeading>
                  <p className="text-sm whitespace-pre-wrap">{form.goals}</p>
                </div>
              ) : null}
              {form?.notes ? (
                <div className="space-y-1">
                  <SectionHeading>Additional notes</SectionHeading>
                  <p className="text-sm whitespace-pre-wrap">{form.notes}</p>
                </div>
              ) : null}

              {/* AI analysis report */}
              {evaluation?.report_markdown ? (
                <div className="space-y-1">
                  <SectionHeading>
                    Overall analysis{evaluation.created_at ? ` · ${new Date(evaluation.created_at).toLocaleDateString()}` : ""}
                  </SectionHeading>
                  <div className="text-sm whitespace-pre-wrap bg-muted/30 border rounded-md p-3 max-h-80 overflow-y-auto">
                    {evaluation.report_markdown}
                  </div>
                </div>
              ) : null}
              {evaluation?.mentor_instructions ? (
                <div className="space-y-1">
                  <SectionHeading>Mentor instructions</SectionHeading>
                  <p className="text-sm whitespace-pre-wrap bg-muted/30 border rounded-md p-3">{evaluation.mentor_instructions}</p>
                </div>
              ) : null}

              {/* Per-student download */}
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(enquiry, null, 2)], { type: "application/json" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `enquiry-${enquiry.student_name.replace(/\s+/g, "-").toLowerCase()}-${enquiry.id.slice(0, 8)}.json`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />Download this student's details
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Single source of truth for the dashboard sections — rendered as horizontal
// tabs on desktop and as a hamburger drawer list on mobile.
const ADMIN_TABS: { value: string; label: string }[] = [
  { value: "leads", label: "Get started leads" },
  { value: "program-enquiries", label: "Program enquiries" },
  { value: "webinar", label: "Webinar registrations" },
  { value: "hiring", label: "Hiring submissions" },
  { value: "sales-evaluations", label: "Sales evaluation reports" },
  { value: "billing", label: "Billing cycles" },
  { value: "expenses", label: "Expenses" },
  { value: "newsletter", label: "Newsletter subscribers" },
  { value: "sop-purchases", label: "SOP purchases" },
  { value: "sop-feedback", label: "SOP feedback" },
  { value: "programs", label: "Programs" },
  { value: "erasmus-calls", label: "Erasmus call requests" },
  { value: "internal-tools", label: "Internal tools" },
  { value: "tracker", label: "Tracker" },
];

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hiring, setHiring] = useState<HiringApplication[]>([]);
  const [salesEvaluations, setSalesEvaluations] = useState<SalesEvaluationAdmin[]>([]);
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [programEnquiries, setProgramEnquiries] = useState<ProgramEnquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ProgramEnquiry | null>(null);
  const [sopFeedback, setSopFeedback] = useState<SopFeedback[]>([]);
  const [erasmusCalls, setErasmusCalls] = useState<ErasmusCallRequest[]>([]);
  const [erasmusPurchases, setErasmusPurchases] = useState<ErasmusPurchase[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [expenseEmailMap, setExpenseEmailMap] = useState<UserEmailMap>({});
  const [sopPurchases, setSopPurchases] = useState<SopPurchase[]>([]);
  const [sopEvents, setSopEvents] = useState<SopEvent[]>([]);
  const [sopFrom, setSopFrom] = useState("");
  const [sopTo, setSopTo] = useState("");
  const [sopPage, setSopPage] = useState(1);
  const [sopSearch, setSopSearch] = useState("");
  const [sopPlanFilter, setSopPlanFilter] = useState<string>("all");
  const [sopStatusFilter, setSopStatusFilter] = useState<string>("completed");
  // "Paid but email never delivered" view — the failure mode the reconciler heals.
  const [sopUnsentOnly, setSopUnsentOnly] = useState(false);
  const [expandedSopId, setExpandedSopId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  // Manual SOP sender
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderSopIds, setSenderSopIds] = useState<number[]>(ALL_SOP_VAULT_IDS);
  const [senderBusy, setSenderBusy] = useState(false);
  const [senderPickerOpen, setSenderPickerOpen] = useState(false);
  // Confirmation popup before any SOP email is sent
  const [confirmSend, setConfirmSend] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [webinarFilter, setWebinarFilter] = useState<string>("all");
  const [webinarPage, setWebinarPage] = useState(1);
  const [leadsFrom, setLeadsFrom] = useState("");
  const [leadsTo, setLeadsTo] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);
  const [hiringFrom, setHiringFrom] = useState("");
  const [hiringTo, setHiringTo] = useState("");
  const [hiringPage, setHiringPage] = useState(1);
  const [subsFrom, setSubsFrom] = useState("");
  const [subsTo, setSubsTo] = useState("");
  const [subsPage, setSubsPage] = useState(1);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [webinarSearch, setWebinarSearch] = useState("");
  const [hiringSearch, setHiringSearch] = useState("");
  const [subsSearch, setSubsSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; table: "leads" | "webinar_registrations" | "hiring_applications" | "newsletter_subscribers"; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("leads");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { checkAuthAndFetchData(); }, []);
  useEffect(() => { setWebinarPage(1); }, [fromDate, toDate, webinarSearch, webinarFilter]);
  useEffect(() => { setLeadsPage(1); }, [leadsFrom, leadsTo, leadsSearch]);
  useEffect(() => { setHiringPage(1); }, [hiringFrom, hiringTo, hiringSearch]);
  useEffect(() => { setSubsPage(1); }, [subsFrom, subsTo, subsSearch]);
  useEffect(() => { setSopPage(1); }, [sopFrom, sopTo, sopSearch, sopPlanFilter, sopStatusFilter]);

  const checkAuthAndFetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      setAdminEmail(session.user.email ?? null);
      setAdminUserId(session.user.id);

      // Verify admin role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/admin/login");
        return;
      }

      // Fetch data in parallel
      const [
        { data: webinarData, error: webinarError },
        { data: leadsData, error: leadsError },
        { data: hiringData, error: hiringError },
        { data: salesData, error: salesError },
        { data: billingData, error: billingError },
        { data: expenseData, error: expenseError },
        { data: subscriberData, error: subscriberError },
        { data: sopData, error: sopError },
        { data: sopEventsData, error: sopEventsError },
        { data: enquiryData, error: enquiryError },
        { data: feedbackData, error: feedbackError },
        { data: erasmusCallData, error: erasmusCallError },
        { data: erasmusPurchaseData, error: erasmusPurchaseError },
      ] = await Promise.all([
        supabase
          .from("webinar_registrations" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("leads" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("hiring_applications" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("sales_evaluations" as any)
          .select("id, candidate_name, created_at, user_email")
          .order("created_at", { ascending: false }),
        supabase
          .from("billing_cycles" as any)
          .select("*")
          .order("start_date", { ascending: false }),
        supabase
          .from("expenses" as any)
          .select("*")
          .order("date", { ascending: false })
          .limit(10),
        supabase
          .from("newsletter_subscribers" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("sop_purchases" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("sop_events" as any)
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("program_enquiries" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("sop_feedback" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("erasmus_call_requests" as any)
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("erasmus_purchases" as any)
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (webinarError) {
        throw webinarError;
      }

      setRegistrations((webinarData as unknown as Registration[]) || []);

      if (leadsError) {
        console.error("Error loading leads:", leadsError);
      } else {
        setLeads((leadsData as unknown as Lead[]) || []);
      }

      if (hiringError) {
        console.error("Error loading hiring applications:", hiringError);
      } else {
        setHiring((hiringData as unknown as HiringApplication[]) || []);
      }

      if (salesError) {
        console.error("Error loading sales evaluations:", salesError);
      } else {
        setSalesEvaluations((salesData as unknown as SalesEvaluationAdmin[]) || []);
      }

      if (billingError) {
        console.error("Error loading billing cycles:", billingError);
      } else {
        setBillingCycles((billingData as unknown as BillingCycle[]) || []);
      }

      if (subscriberError) {
        console.error("Error loading newsletter subscribers:", subscriberError);
      } else {
        setSubscribers((subscriberData as unknown as NewsletterSubscriber[]) || []);
      }

      if (sopError) {
        console.error("Error loading SOP purchases:", sopError);
      } else {
        setSopPurchases((sopData as unknown as SopPurchase[]) || []);
      }

      if (sopEventsError) {
        console.error("Error loading SOP events:", sopEventsError);
      } else {
        setSopEvents((sopEventsData as unknown as SopEvent[]) || []);
      }

      if (enquiryError) {
        console.error("Error loading program enquiries:", enquiryError);
      } else {
        setProgramEnquiries((enquiryData as unknown as ProgramEnquiry[]) || []);
      }

      if (feedbackError) {
        console.error("Error loading SOP feedback:", feedbackError);
      } else {
        setSopFeedback((feedbackData as unknown as SopFeedback[]) || []);
      }

      if (erasmusCallError) {
        console.error("Error loading Erasmus call requests:", erasmusCallError);
      } else {
        setErasmusCalls((erasmusCallData as unknown as ErasmusCallRequest[]) || []);
      }

      if (erasmusPurchaseError) {
        console.error("Error loading Erasmus purchases:", erasmusPurchaseError);
      } else {
        setErasmusPurchases((erasmusPurchaseData as unknown as ErasmusPurchase[]) || []);
      }

      if (expenseError) {
        console.error("Error loading expenses:", expenseError);
      } else {
        const expList = (expenseData as unknown as Expense[]) || [];
        setRecentExpenses(expList);

        // Look up submitter emails
        const uniqueIds = [...new Set(expList.map((e) => e.user_id))];
        if (uniqueIds.length > 0) {
          const { data: emailRows } = await supabase.rpc("get_user_emails" as any, {
            user_ids: uniqueIds,
          });
          if (emailRows) {
            const map: UserEmailMap = {};
            (emailRows as unknown as { user_id: string; email: string }[]).forEach(
              (r) => (map[r.user_id] = r.email)
            );
            setExpenseEmailMap(map);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const { error } = await (supabase.from(pendingDelete.table as any).delete() as any).eq("id", pendingDelete.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      if (pendingDelete.table === "leads") setLeads(prev => prev.filter(l => l.id !== pendingDelete.id));
      else if (pendingDelete.table === "webinar_registrations") setRegistrations(prev => prev.filter(r => r.id !== pendingDelete.id));
      else if (pendingDelete.table === "hiring_applications") setHiring(prev => prev.filter(h => h.id !== pendingDelete.id));
      else if (pendingDelete.table === "newsletter_subscribers") setSubscribers(prev => prev.filter(s => s.id !== pendingDelete.id));
      toast({ title: "Deleted", description: `"${pendingDelete.name}" has been permanently deleted.` });
      setPendingDelete(null);
    }
    setIsDeleting(false);
  };

  const webinarNames = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach(r => { if (r.webinar_name) set.add(r.webinar_name); });
    return Array.from(set).sort();
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);
    const q = webinarSearch.trim().toLowerCase();
    return registrations.filter((reg) => {
      const ts = new Date(reg.created_at);
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      if (webinarFilter !== "all") {
        if (webinarFilter === "__none__") {
          if (reg.webinar_name) return false;
        } else if (reg.webinar_name !== webinarFilter) return false;
      }
      if (q && !reg.name.toLowerCase().includes(q) && !reg.email.toLowerCase().includes(q) && !reg.phone_number.includes(q) && !(reg.webinar_name || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [registrations, fromDate, toDate, webinarSearch, webinarFilter]);

  const pagedWebinar = filteredRegistrations.slice((webinarPage - 1) * PAGE_SIZE, webinarPage * PAGE_SIZE);
  const webinarPageCount = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));

  const filteredLeads = useMemo(() => {
    const f = leadsFrom ? new Date(leadsFrom) : null;
    const t = leadsTo ? new Date(leadsTo) : null;
    if (t) t.setHours(23, 59, 59, 999);
    const q = leadsSearch.trim().toLowerCase();
    return leads.filter(l => {
      const ts = new Date(l.created_at);
      if (f && ts < f) return false;
      if (t && ts > t) return false;
      if (q && !l.full_name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !l.phone.includes(q)) return false;
      return true;
    });
  }, [leads, leadsFrom, leadsTo, leadsSearch]);
  const pagedLeads = filteredLeads.slice((leadsPage - 1) * PAGE_SIZE, leadsPage * PAGE_SIZE);
  const leadsPageCount = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));

  const filteredHiring = useMemo(() => {
    const f = hiringFrom ? new Date(hiringFrom) : null;
    const t = hiringTo ? new Date(hiringTo) : null;
    if (t) t.setHours(23, 59, 59, 999);
    const q = hiringSearch.trim().toLowerCase();
    return hiring.filter(h => {
      const ts = new Date(h.created_at);
      if (f && ts < f) return false;
      if (t && ts > t) return false;
      if (q && !h.full_name.toLowerCase().includes(q) && !h.email.toLowerCase().includes(q) && !h.phone.includes(q)) return false;
      return true;
    });
  }, [hiring, hiringFrom, hiringTo, hiringSearch]);
  const pagedHiring = filteredHiring.slice((hiringPage - 1) * PAGE_SIZE, hiringPage * PAGE_SIZE);
  const hiringPageCount = Math.max(1, Math.ceil(filteredHiring.length / PAGE_SIZE));

  const filteredSubs = useMemo(() => {
    const f = subsFrom ? new Date(subsFrom) : null;
    const t = subsTo ? new Date(subsTo) : null;
    if (t) t.setHours(23, 59, 59, 999);
    const q = subsSearch.trim().toLowerCase();
    return subscribers.filter(s => {
      const ts = new Date(s.created_at);
      if (f && ts < f) return false;
      if (t && ts > t) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [subscribers, subsFrom, subsTo, subsSearch]);
  const pagedSubs = filteredSubs.slice((subsPage - 1) * PAGE_SIZE, subsPage * PAGE_SIZE);
  const subsPageCount = Math.max(1, Math.ceil(filteredSubs.length / PAGE_SIZE));

  const filteredSop = useMemo(() => {
    const f = sopFrom ? new Date(sopFrom) : null;
    const t = sopTo ? new Date(sopTo) : null;
    if (t) t.setHours(23, 59, 59, 999);
    const q = sopSearch.trim().toLowerCase();
    return sopPurchases.filter(s => {
      const ts = new Date(s.created_at);
      if (f && ts < f) return false;
      if (t && ts > t) return false;
      if (sopPlanFilter !== "all" && s.plan !== sopPlanFilter) return false;
      if (sopStatusFilter !== "all" && s.status !== sopStatusFilter) return false;
      if (sopUnsentOnly && !(s.status === "completed" && !s.email_sent)) return false;
      if (q) {
        const name = (s.firstname || "").toLowerCase();
        const phone = (s.phone || "").toLowerCase();
        const email = s.email.toLowerCase();
        const txn = (s.payu_txnid || "").toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !email.includes(q) && !txn.includes(q)) return false;
      }
      return true;
    });
  }, [sopPurchases, sopFrom, sopTo, sopSearch, sopPlanFilter, sopStatusFilter, sopUnsentOnly]);
  // Paid purchases whose buyer email never went out — should self-heal within
  // 30 days via the reconciler; a non-zero count that lingers needs a look.
  const stuckDeliveries = sopPurchases.filter(s => s.status === "completed" && !s.email_sent).length;
  const pagedSop = filteredSop.slice((sopPage - 1) * PAGE_SIZE, sopPage * PAGE_SIZE);
  const sopPageCount = Math.max(1, Math.ceil(filteredSop.length / PAGE_SIZE));

  // Group lifecycle events by purchase for the per-lead timeline.
  const sopEventsByPurchase = useMemo(() => {
    const map: Record<string, SopEvent[]> = {};
    for (const ev of sopEvents) {
      if (!ev.purchase_id) continue;
      (map[ev.purchase_id] ??= []).push(ev);
    }
    return map;
  }, [sopEvents]);

  const refreshSop = async () => {
    const [{ data: sd }, { data: ed }] = await Promise.all([
      supabase.from("sop_purchases" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("sop_events" as any).select("*").order("created_at", { ascending: true }),
    ]);
    setSopPurchases((sd as unknown as SopPurchase[]) || []);
    setSopEvents((ed as unknown as SopEvent[]) || []);
  };

  const callSopSender = async (payload: {
    email: string;
    firstname?: string | null;
    selected_sop_ids?: number[];
    purchase_id?: string;
  }) => {
    const { data, error } = await supabase.functions.invoke("send-sop-email", { body: payload });
    if (error) {
      // Surface the edge function's JSON error body when present.
      let msg = error.message;
      try {
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.json === "function") {
          const body = await ctx.json();
          if (body?.error) msg = body.error;
        }
      } catch { /* ignore */ }
      throw new Error(msg);
    }
    if (!data?.success) throw new Error(data?.error || "Send failed");
    return data;
  };

  const handleResend = async (s: SopPurchase) => {
    setResendingId(s.id);
    try {
      const ids = s.plan === "full" ? ALL_SOP_VAULT_IDS : (s.selected_sop_ids || []);
      await callSopSender({
        email: s.email,
        firstname: s.firstname,
        selected_sop_ids: ids.length > 0 ? ids : ALL_SOP_VAULT_IDS,
        purchase_id: s.id,
      });
      toast({ title: "Email sent", description: `Delivery email re-sent to ${s.email}.` });
      await refreshSop();
    } catch (e) {
      toast({ title: "Send failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setResendingId(null);
    }
  };

  const handleManualSend = async () => {
    const email = senderEmail.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    if (senderSopIds.length === 0) {
      toast({ title: "No SOPs selected", description: "Pick at least one SOP to send.", variant: "destructive" });
      return;
    }
    setSenderBusy(true);
    try {
      await callSopSender({
        email,
        firstname: senderName.trim() || null,
        selected_sop_ids: senderSopIds,
      });
      toast({ title: "SOP email sent", description: `${senderSopIds.length} SOP(s) sent to ${email}.` });
      setSenderEmail("");
      setSenderName("");
      setSenderSopIds(ALL_SOP_VAULT_IDS);
      setSenderPickerOpen(false);
      await refreshSop();
    } catch (e) {
      toast({ title: "Send failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setSenderBusy(false);
    }
  };

  // Ask for confirmation before re-sending a purchase's delivery email.
  const requestResend = (s: SopPurchase) => {
    setConfirmSend({
      title: "Send SOP email?",
      description: `The SOP delivery email (with download links) will be sent to ${s.email}.`,
      onConfirm: () => handleResend(s),
    });
  };

  // Validate the manual sender form, then ask for confirmation before sending.
  const requestManualSend = () => {
    const email = senderEmail.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    if (senderSopIds.length === 0) {
      toast({ title: "No SOPs selected", description: "Pick at least one SOP to send.", variant: "destructive" });
      return;
    }
    setConfirmSend({
      title: "Send SOP email?",
      description: `${senderSopIds.length} SOP(s) will be sent to ${email}.`,
      onConfirm: () => handleManualSend(),
    });
  };

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      toast({
        title: "No Data",
        description: "No registrations to export for selected range",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Timestamp", "Webinar", "Name", "Phone Number", "Email"];
    const csvContent = [
      headers.join(","),
      ...filteredRegistrations.map((reg) =>
        [
          new Date(reg.created_at).toLocaleString(),
          `"${reg.webinar_name || ""}"`,
          `"${reg.name}"`,
          `"${reg.country_code} ${reg.phone_number}"`,
          reg.email,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webinar-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "CSV file has been downloaded",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const isTracker = activeTab === "tracker";

  return (
    <div
      className={`min-h-screen bg-background p-4 sm:p-6 transition-colors duration-700 ease-out [&_*]:transition-colors [&_*]:duration-700 [&_*]:ease-out ${
        isTracker ? "dark" : ""
      }`}
    >
      <div className="container mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {adminEmail
                ? `Welcome, ${adminEmail}. Manage webinar leads, hiring submissions, and internal tool reports.`
                : "Manage webinar leads, hiring submissions, and internal tool reports."}
            </p>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto shrink-0">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop: horizontal tab bar */}
          <TabsList className="hidden md:flex flex-wrap h-auto">
            {ADMIN_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {/* Mobile: hamburger button that opens a slide-out section drawer */}
          <div className="md:hidden">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Menu className="h-4 w-4" />
                    Sections
                  </span>
                  <span className="text-sm text-muted-foreground truncate max-w-[55%]">
                    {ADMIN_TABS.find((t) => t.value === activeTab)?.label ?? ""}
                  </span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-4 border-b text-left">
                  <SheetTitle>Sections</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-2 overflow-y-auto">
                  {ADMIN_TABS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setActiveTab(t.value); setNavOpen(false); }}
                      className={cn(
                        "text-left rounded-md px-3 py-2.5 text-sm transition-colors",
                        activeTab === t.value
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Get started leads tab */}
          <TabsContent value="leads">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Get started leads</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredLeads.length} of {leads.length} total · page {leadsPage} of {leadsPageCount}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search name, email, phone…" value={leadsSearch} onChange={e => setLeadsSearch(e.target.value)} className="h-9 pl-8 w-full sm:w-56" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={leadsFrom} onChange={e => setLeadsFrom(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={leadsTo} onChange={e => setLeadsTo(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setLeadsFrom(""); setLeadsTo(""); setLeadsSearch(""); }}>Clear</Button>
                <Button
                  onClick={() => {
                    if (filteredLeads.length === 0) return;
                    const headers = ["Timestamp","Name","Email","Phone","Degree","Destinations","Start Year","Courses","Academic Score","Investment Budget","UTM Source","UTM Campaign","UTM Medium"];
                    const rows = filteredLeads.map(l => [new Date(l.created_at).toLocaleString(),`"${l.full_name}"`,l.email,`"${l.country_code} ${l.phone}"`,l.degree,`"${(l.destinations||[]).join(", ")}"`,l.start_year,`"${(l.course_interests||[]).join(", ")}"`,`"${l.academic_score}"`,`"${l.investment_budget}"`,l.utm_source||"",l.utm_campaign||"",l.utm_medium||""].join(","));
                    const blob = new Blob([[headers.join(","),...rows].join("\n")],{type:"text/csv"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href=url; a.download=`leads-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={filteredLeads.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Degree</TableHead>
                    <TableHead>Destinations</TableHead>
                    <TableHead>Start Year</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Academic Score</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>UTM Source</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedLeads.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{l.full_name}</TableCell>
                        <TableCell>{l.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{l.country_code} {l.phone}</TableCell>
                        <TableCell>{l.degree}</TableCell>
                        <TableCell>{(l.destinations || []).join(", ")}</TableCell>
                        <TableCell>{l.start_year}</TableCell>
                        <TableCell className="max-w-[160px] truncate">{(l.course_interests || []).join(", ") || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">{l.academic_score}</TableCell>
                        <TableCell className="whitespace-nowrap">{l.investment_budget}</TableCell>
                        <TableCell>{l.utm_source || "-"}</TableCell>
                        <TableCell>
                          <button onClick={() => setPendingDelete({ id: l.id, table: "leads", name: l.full_name })} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" title="Delete lead">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <PaginationBar page={leadsPage} pageCount={leadsPageCount} onPage={setLeadsPage} />
            </div>
          </TabsContent>

          {/* Program enquiries tab (from the student app) */}
          <TabsContent value="program-enquiries">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Program enquiries</h2>
                <p className="text-sm text-muted-foreground">
                  {programEnquiries.length} total · students asking for free application &amp; visa help
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    if (programEnquiries.length === 0) return;
                    const headers = ["Timestamp","Name","Email","Phone","Program","University","Country","Match","Source"];
                    const rows = programEnquiries.map(e => [new Date(e.created_at).toLocaleString(),`"${e.student_name}"`,e.student_email,`"${e.student_phone || ""}"`,`"${e.program_name}"`,`"${e.university_name || ""}"`,e.country || "",e.match_score ?? "",e.source || ""].join(","));
                    const blob = new Blob([[headers.join(","),...rows].join("\n")],{type:"text/csv"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href=url; a.download=`program-enquiries-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={programEnquiries.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
                <Button
                  onClick={() => {
                    if (programEnquiries.length === 0) return;
                    const blob = new Blob([JSON.stringify(programEnquiries, null, 2)], { type: "application/json" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href=url; a.download=`program-enquiries-full-${new Date().toISOString().split("T")[0]}.json`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={programEnquiries.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Download all details
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programEnquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No program enquiries yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    programEnquiries.map((e) => (
                      <TableRow
                        key={e.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEnquiry(e)}
                      >
                        <TableCell className="whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{e.student_name}</TableCell>
                        <TableCell>{e.student_email}</TableCell>
                        <TableCell className="whitespace-nowrap">{e.student_phone || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={e.program_name}>{e.program_name}</TableCell>
                        <TableCell className="max-w-[180px] truncate" title={e.university_name || ""}>{e.university_name || "-"}</TableCell>
                        <TableCell>{e.country || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">{e.match_score != null ? `${e.match_score}/10` : "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(ev) => { ev.stopPropagation(); setSelectedEnquiry(e); }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <EnquiryDetailDialog
              enquiry={selectedEnquiry}
              onClose={() => setSelectedEnquiry(null)}
            />
          </TabsContent>

          {/* SOP Vault feedback tab */}
          <TabsContent value="sop-feedback">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">SOP Vault feedback</h2>
                <p className="text-sm text-muted-foreground">
                  {sopFeedback.length} total
                  {sopFeedback.length > 0 && (
                    <> · avg {(sopFeedback.reduce((s, f) => s + f.rating, 0) / sopFeedback.length).toFixed(1)} ★</>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    if (sopFeedback.length === 0) return;
                    const headers = ["Timestamp","Rating","Review","Suggestions","Name","Email"];
                    const esc = (v: string | null) => `"${(v || "").replace(/"/g, '""')}"`;
                    const rows = sopFeedback.map(f => [new Date(f.created_at).toLocaleString(),f.rating,esc(f.review),esc(f.suggestions),esc(f.name),f.email || ""].join(","));
                    const blob = new Blob([[headers.join(","),...rows].join("\n")],{type:"text/csv"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href=url; a.download=`sop-feedback-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={sopFeedback.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Suggestions</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sopFeedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No feedback yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sopFeedback.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="whitespace-nowrap">{new Date(f.created_at).toLocaleString()}</TableCell>
                        <TableCell className="whitespace-nowrap" title={`${f.rating} / 5`}>
                          <span className="text-amber-500">{"★".repeat(f.rating)}</span>
                          <span className="text-muted-foreground">{"★".repeat(5 - f.rating)}</span>
                        </TableCell>
                        <TableCell className="max-w-[260px] whitespace-pre-wrap break-words" title={f.review || ""}>{f.review || "-"}</TableCell>
                        <TableCell className="max-w-[260px] whitespace-pre-wrap break-words" title={f.suggestions || ""}>{f.suggestions || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">{f.name || "-"}</TableCell>
                        <TableCell>{f.email || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Programs tab — one section per paid programme offering */}
          <TabsContent value="programs">
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-semibold">Programs</h2>
              <p className="text-sm text-muted-foreground">Paid programme offerings and their purchases.</p>
            </div>

            {/* Erasmus */}
            <div className="border rounded-lg bg-card shadow">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 p-4 border-b">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Erasmus Mundus — Application Filing</h3>
                  <p className="text-sm text-muted-foreground">
                    {erasmusPurchases.filter((p) => p.status === "completed").length} paid ·{" "}
                    ₹{erasmusPurchases.filter((p) => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0).toLocaleString("en-IN")}{" "}
                    collected · {erasmusPurchases.filter((p) => p.status === "pending").length} pending ·{" "}
                    {erasmusPurchases.filter((p) => p.status === "failed").length} failed
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (erasmusPurchases.length === 0) return;
                    const headers = ["Timestamp", "Name", "Email", "Phone", "Programmes", "Apps", "Amount", "Status", "PayU Txn"];
                    const esc = (v: string | null) => `"${(v || "").replace(/"/g, '""')}"`;
                    const rows = erasmusPurchases.map((p) =>
                      [
                        new Date(p.created_at).toLocaleString(),
                        esc(p.name),
                        esc(p.email),
                        esc(p.phone),
                        esc((p.items ?? []).map((i) => i.code).join(" | ")),
                        p.num_items,
                        p.amount,
                        p.status,
                        esc(p.payu_txnid),
                      ].join(","),
                    );
                    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `erasmus-purchases-${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  size="sm"
                  variant="outline"
                  disabled={erasmusPurchases.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Programmes</TableHead>
                      <TableHead>Apps</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {erasmusPurchases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No purchases yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      erasmusPurchases.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</TableCell>
                          <TableCell className="whitespace-nowrap">{p.name || "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <a href={`mailto:${p.email}`} className="text-primary hover:underline">{p.email}</a>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {p.phone ? (
                              <a href={`tel:${p.phone}`} className="text-primary hover:underline">{p.phone}</a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="max-w-[260px]">
                            <span title={(p.items ?? []).map((i) => `${i.code} — ${i.name}`).join("\n")}>
                              {(p.items ?? []).map((i) => i.code).join(", ") || "-"}
                            </span>
                          </TableCell>
                          <TableCell>{p.num_items}</TableCell>
                          <TableCell className="whitespace-nowrap">₹{Number(p.amount).toLocaleString("en-IN")}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                p.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : p.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {p.status}
                            </span>
                          </TableCell>
                          <TableCell>{p.email_sent ? "✓" : "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="erasmus-calls">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Erasmus call requests</h2>
                <p className="text-sm text-muted-foreground">{erasmusCalls.length} total</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    if (erasmusCalls.length === 0) return;
                    const headers = ["Timestamp", "Name", "Phone", "Source"];
                    const esc = (v: string | null) => `"${(v || "").replace(/"/g, '""')}"`;
                    const rows = erasmusCalls.map((c) => [new Date(c.created_at).toLocaleString(), esc(c.name), esc(c.phone), c.source || ""].join(","));
                    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `erasmus-call-requests-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={erasmusCalls.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {erasmusCalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No call requests yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    erasmusCalls.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{c.name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <a href={`tel:${c.phone}`} className="text-primary hover:underline">{c.phone}</a>
                        </TableCell>
                        <TableCell>{c.source || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Webinar tab */}
          <TabsContent value="webinar">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Webinar registrations</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredRegistrations.length} of {registrations.length} total · page {webinarPage} of {webinarPageCount}.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search name, email, phone, webinar…" value={webinarSearch} onChange={e => setWebinarSearch(e.target.value)} className="h-9 pl-8 w-full sm:w-56" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Webinar</Label>
                  <Select value={webinarFilter} onValueChange={setWebinarFilter}>
                    <SelectTrigger className="h-9 w-full sm:w-56">
                      <SelectValue placeholder="All webinars" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All webinars</SelectItem>
                      {webinarNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                      <SelectItem value="__none__">(no webinar set)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-9 w-full sm:w-40"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-9 w-full sm:w-40"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setFromDate(""); setToDate(""); setWebinarSearch(""); setWebinarFilter("all"); }}>
                  Clear
                </Button>
                <Button onClick={exportToCSV} size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Webinar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedWebinar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No registrations for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedWebinar.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>{new Date(reg.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{reg.webinar_name || "—"}</TableCell>
                        <TableCell>{reg.name}</TableCell>
                        <TableCell>
                          {reg.country_code} {reg.phone_number}
                        </TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>
                          <button onClick={() => setPendingDelete({ id: reg.id, table: "webinar_registrations", name: reg.name })} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" title="Delete registration">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <PaginationBar page={webinarPage} pageCount={webinarPageCount} onPage={setWebinarPage} />
            </div>
          </TabsContent>

          {/* Hiring submissions tab */}
          <TabsContent value="hiring">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Hiring submissions</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredHiring.length} of {hiring.length} total · page {hiringPage} of {hiringPageCount}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search name, email, phone…" value={hiringSearch} onChange={e => setHiringSearch(e.target.value)} className="h-9 pl-8 w-full sm:w-56" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={hiringFrom} onChange={e => setHiringFrom(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={hiringTo} onChange={e => setHiringTo(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setHiringFrom(""); setHiringTo(""); setHiringSearch(""); }}>Clear</Button>
                <Button
                  onClick={() => {
                    if (filteredHiring.length === 0) return;
                    const headers = ["Timestamp","Role","Name","Email","Phone","City","Source"];
                    const rows = filteredHiring.map(h => [new Date(h.created_at).toLocaleString(),h.role,`"${h.full_name}"`,h.email,h.phone,h.current_city,h.source||""].join(","));
                    const blob = new Blob([[headers.join(","),...rows].join("\n")],{type:"text/csv"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href=url; a.download=`hiring-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={filteredHiring.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>CV</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedHiring.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No hiring submissions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedHiring.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                        <TableCell>{h.role}</TableCell>
                        <TableCell>{h.full_name}</TableCell>
                        <TableCell>{h.email}</TableCell>
                        <TableCell>{h.phone}</TableCell>
                        <TableCell>{h.current_city}</TableCell>
                        <TableCell>{h.source || "-"}</TableCell>
                        <TableCell>
                          {h.cv_url ? (
                            <a href={h.cv_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              View CV
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <button onClick={() => setPendingDelete({ id: h.id, table: "hiring_applications", name: h.full_name })} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" title="Delete submission">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <PaginationBar page={hiringPage} pageCount={hiringPageCount} onPage={setHiringPage} />
            </div>
          </TabsContent>

          {/* Sales evaluation reports tab */}
          <TabsContent value="sales-evaluations">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">Sales evaluation AI reports</h2>
              <p className="text-sm text-muted-foreground">
                List of AI-generated sales evaluations, including who ran each report.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Generated by (user email)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesEvaluations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No sales evaluation reports yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesEvaluations.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                        <TableCell>{row.candidate_name || "Unnamed candidate"}</TableCell>
                        <TableCell>{row.user_email || "Unknown user"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Billing cycles tab */}
          <TabsContent value="billing">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr),minmax(0,2fr)]">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Add billing cycle</h2>
                  <p className="text-sm text-muted-foreground">
                    Create a new billing cycle. All admins will see and use these entries.
                  </p>
                </div>

                <BillingForm
                  onCreated={(cycle) => setBillingCycles((prev) => [cycle, ...prev])}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Existing billing cycles</h2>
                  <p className="text-sm text-muted-foreground">
                    Sorted by start date (newest first). Editing/deleting can be added later if needed.
                  </p>
                </div>
                <div className="bg-card rounded-lg shadow border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created at</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingCycles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No billing cycles yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        billingCycles.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell>{b.name}</TableCell>
                            <TableCell>{b.start_date}</TableCell>
                            <TableCell>{b.end_date}</TableCell>
                            <TableCell>
                              {b.amount != null ? `${b.amount} ${b.currency || "INR"}` : "-"}
                            </TableCell>
                            <TableCell>{new Date(b.created_at).toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Expenses tab */}
          <TabsContent value="expenses">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr),minmax(0,2fr)]">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Add expense</h2>
                  <p className="text-sm text-muted-foreground">
                    Log an expense with an optional bill attachment.
                  </p>
                </div>

                <ExpenseForm
                  userId={adminUserId}
                  onCreated={(expense) => setRecentExpenses((prev) => [expense, ...prev].slice(0, 10))}
                />

                <Button onClick={() => navigate("/admin/expenses")} variant="outline" className="w-full">
                  View all expenses with filters & export
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Recent expenses</h2>
                  <p className="text-sm text-muted-foreground">
                    Last 10 expenses across all team members.
                  </p>
                </div>
                <div className="bg-card rounded-lg shadow border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Added by</TableHead>
                        <TableHead>Bill</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentExpenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No expenses yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentExpenses.map((exp) => (
                          <TableRow key={exp.id}>
                            <TableCell>{exp.date}</TableCell>
                            <TableCell>{exp.category}</TableCell>
                            <TableCell>₹{Number(exp.amount).toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{exp.description || "-"}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{expenseEmailMap[exp.user_id] || "-"}</TableCell>
                            <TableCell>
                              {exp.bill_url ? (
                                <a
                                  href={exp.bill_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm"
                                >
                                  View
                                </a>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Newsletter subscribers tab */}
          <TabsContent value="newsletter">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Newsletter subscribers</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredSubs.length} of {subscribers.length} total · page {subsPage} of {subsPageCount}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search name or email…" value={subsSearch} onChange={e => setSubsSearch(e.target.value)} className="h-9 pl-8 w-full sm:w-56" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={subsFrom} onChange={e => setSubsFrom(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={subsTo} onChange={e => setSubsTo(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSubsFrom(""); setSubsTo(""); setSubsSearch(""); }}>Clear</Button>
                <Button
                  onClick={() => {
                    if (filteredSubs.length === 0) return;
                    const headers = ["Timestamp","Name","Email","Source"];
                    const rows = filteredSubs.map(s => [new Date(s.created_at).toLocaleString(),`"${s.name}"`,s.email,s.source].join(","));
                    const blob = new Blob([[headers.join(","),...rows].join("\n")],{type:"text/csv"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href=url; a.download=`newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={filteredSubs.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedSubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedSubs.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell className="capitalize">{s.source}</TableCell>
                        <TableCell>
                          <button onClick={() => setPendingDelete({ id: s.id, table: "newsletter_subscribers", name: s.name })} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" title="Delete subscriber">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <PaginationBar page={subsPage} pageCount={subsPageCount} onPage={setSubsPage} />
            </div>
          </TabsContent>

          {/* SOP purchases tab */}
          <TabsContent value="sop-purchases">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">SOP Vault purchases</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredSop.length} of {sopPurchases.length} total · page {sopPage} of {sopPageCount}
                </p>
                {stuckDeliveries > 0 && (
                  <button
                    type="button"
                    onClick={() => setSopUnsentOnly(v => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      sopUnsentOnly
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                    title="Paid purchases whose buyer email has not been delivered. The reconciler retries these for 30 days; click to view them."
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {stuckDeliveries} paid · email not delivered
                    {sopUnsentOnly && <span className="opacity-80">· showing</span>}
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search name, email, phone, txn…" value={sopSearch} onChange={e => setSopSearch(e.target.value)} className="h-9 pl-8 w-full sm:w-56" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Plan</Label>
                  <Select value={sopPlanFilter} onValueChange={setSopPlanFilter}>
                    <SelectTrigger className="h-9 w-36">
                      <SelectValue placeholder="All plans" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All plans</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                      <SelectItem value="full">Full vault</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <Select value={sopStatusFilter} onValueChange={setSopStatusFilter}>
                    <SelectTrigger className="h-9 w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={sopFrom} onChange={e => setSopFrom(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={sopTo} onChange={e => setSopTo(e.target.value)} className="h-9 w-full sm:w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSopFrom(""); setSopTo(""); setSopSearch(""); setSopPlanFilter("all"); setSopStatusFilter("completed"); }}>Clear</Button>
                <Button
                  onClick={() => {
                    if (filteredSop.length === 0) return;
                    const headers = ["Timestamp","Name","Email","Phone","Plan","SOP IDs","Amount (INR)","Status","PayU Txn ID","PayU Mihpayid"];
                    const rows = filteredSop.map(s => [
                      new Date(s.created_at).toLocaleString(),
                      `"${s.firstname || ""}"`,
                      s.email,
                      `"${s.phone || ""}"`,
                      s.plan,
                      `"${(s.selected_sop_ids || []).join(", ")}"`,
                      s.amount,
                      s.status,
                      s.payu_txnid || "",
                      s.payu_mihpayid || "",
                    ].join(","));
                    const blob = new Blob([[headers.join(","),...rows].join("\n")],{type:"text/csv"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href=url; a.download=`sop-purchases-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
                  }}
                  size="sm" variant="outline" disabled={filteredSop.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />Export CSV
                </Button>
              </div>
            </div>

            {/* Manual SOP sender */}
            <div className="bg-card rounded-lg shadow border p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Send className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Manual SOP sender</h3>
                <span className="text-xs text-muted-foreground">Send the SOP delivery email (with download links) to any address.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Recipient email *</Label>
                  <Input type="email" placeholder="student@email.com" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} className="h-9 w-full sm:w-64" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">First name (optional)</Label>
                  <Input placeholder="Name for greeting" value={senderName} onChange={e => setSenderName(e.target.value)} className="h-9 w-full sm:w-44" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">SOPs to send</Label>
                  <Popover open={senderPickerOpen} onOpenChange={setSenderPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-full sm:w-56 justify-between font-normal">
                        <span className="truncate">
                          {senderSopIds.length === ALL_SOP_VAULT_IDS.length ? "All 15 (Full Vault)" : `${senderSopIds.length} selected`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="flex items-center justify-between px-3 py-2 border-b">
                        <span className="text-xs font-medium">Select SOPs</span>
                        <div className="flex gap-2">
                          <button className="text-xs text-primary hover:underline" onClick={() => setSenderSopIds(ALL_SOP_VAULT_IDS)}>All</button>
                          <button className="text-xs text-muted-foreground hover:underline" onClick={() => setSenderSopIds([])}>None</button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {ALL_SOP_VAULT_IDS.map(id => (
                          <label key={id} className="flex items-start gap-2 px-3 py-1.5 hover:bg-muted/50 cursor-pointer text-xs">
                            <Checkbox
                              checked={senderSopIds.includes(id)}
                              onCheckedChange={(c) => setSenderSopIds(prev => c ? [...prev, id].sort((a, b) => a - b) : prev.filter(x => x !== id))}
                              className="mt-0.5"
                            />
                            <span><span className="font-mono text-muted-foreground mr-1">{id}.</span>{SOP_VAULT_NAMES[id]}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button size="sm" className="h-9" onClick={requestManualSend} disabled={senderBusy}>
                  {senderBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {senderBusy ? "Sending…" : "Send SOP email"}
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>SOPs</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-center">Payment</TableHead>
                    <TableHead className="text-center">Email sent</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedSop.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No SOP purchases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedSop.map((s) => {
                      const expanded = expandedSopId === s.id;
                      const events = sopEventsByPurchase[s.id] || [];
                      const paid = s.status === "completed";
                      const emailed = !!s.email_sent;
                      return (
                        <Fragment key={s.id}>
                          <TableRow className="cursor-pointer" onClick={() => setExpandedSopId(expanded ? null : s.id)}>
                            <TableCell className="align-middle">
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {s.firstname || "—"}
                              {s.source === "manual" && <Badge variant="secondary" className="ml-2 text-[10px] py-0">manual</Badge>}
                            </TableCell>
                            <TableCell>{s.email}</TableCell>
                            <TableCell className="capitalize">{s.plan}</TableCell>
                            <TableCell className="max-w-[140px] truncate" title={(s.selected_sop_ids || []).join(", ")}>
                              {s.plan === "full" ? "All 15" : (s.selected_sop_ids || []).join(", ") || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">₹{Number(s.amount).toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              {paid ? (
                                <span className="inline-flex items-center gap-1 text-green-600" title="Payment completed"><CheckCircle2 className="h-4 w-4" /></span>
                              ) : s.status === "failed" ? (
                                <span className="inline-flex items-center gap-1 text-destructive" title="Payment failed"><XCircle className="h-4 w-4" /></span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-muted-foreground" title="Pending"><Clock className="h-4 w-4" /></span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {emailed ? (
                                <span className="inline-flex items-center gap-1 text-green-600" title={s.email_sent_at ? `Sent ${new Date(s.email_sent_at).toLocaleString()}` : "Sent"}><CheckCircle2 className="h-4 w-4" /></span>
                              ) : s.email_error ? (
                                <span className="inline-flex items-center gap-1 text-destructive" title={s.email_error}><XCircle className="h-4 w-4" /></span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-muted-foreground" title="Not sent"><XCircle className="h-4 w-4 opacity-40" /></span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={emailed ? "outline" : "default"}
                                className="h-8"
                                disabled={resendingId === s.id}
                                onClick={(e) => { e.stopPropagation(); requestResend(s); }}
                              >
                                {resendingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                                <span className="ml-1.5">{emailed ? "Resend" : "Send"}</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expanded && (
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                              <TableCell colSpan={10} className="py-4">
                                <div className="grid md:grid-cols-2 gap-6 px-2">
                                  {/* Technical details */}
                                  <div className="space-y-2 text-xs">
                                    <div className="font-semibold text-sm mb-1">Technical details</div>
                                    <DetailRow label="Purchase ID" value={s.id} mono />
                                    <DetailRow label="Phone" value={s.phone || "—"} />
                                    <DetailRow label="Source" value={s.source || "payu"} />
                                    <DetailRow label="PayU txn ID" value={s.payu_txnid || "—"} mono />
                                    <DetailRow label="PayU mihpayid" value={s.payu_mihpayid || "—"} mono />
                                    <DetailRow label="Resend msg ID" value={s.resend_message_id || "—"} mono />
                                    <DetailRow label="Email sent at" value={s.email_sent_at ? new Date(s.email_sent_at).toLocaleString() : "—"} />
                                    {s.email_error && <DetailRow label="Email error" value={s.email_error} tone="text-destructive" />}
                                    {s.plan !== "full" && (
                                      <DetailRow label="SOPs" value={(s.selected_sop_ids || []).map(id => SOP_VAULT_NAMES[id] || `SOP ${id}`).join(", ") || "—"} />
                                    )}
                                  </div>
                                  {/* Event timeline */}
                                  <div className="space-y-2">
                                    <div className="font-semibold text-sm mb-1">Event log</div>
                                    {events.length === 0 ? (
                                      <div className="text-xs text-muted-foreground">No events recorded for this lead yet.</div>
                                    ) : (
                                      <ol className="relative border-l border-border pl-4 space-y-3">
                                        {events.map(ev => {
                                          const meta = SOP_EVENT_LABELS[ev.event_type] || { ...SOP_EVENT_FALLBACK, label: ev.event_type };
                                          return (
                                            <li key={ev.id} className="relative">
                                              <span className={`absolute -left-[1.30rem] top-1 h-2 w-2 rounded-full ${meta.dot}`} />
                                              <div className={`text-xs font-medium ${meta.tone}`}>{meta.label}</div>
                                              <div className="text-[11px] text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</div>
                                              {ev.detail && Object.keys(ev.detail).length > 0 && (
                                                <pre className="mt-1 text-[10px] bg-background border rounded p-2 overflow-x-auto whitespace-pre-wrap break-all text-muted-foreground">{JSON.stringify(ev.detail, null, 1)}</pre>
                                              )}
                                            </li>
                                          );
                                        })}
                                      </ol>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <PaginationBar page={sopPage} pageCount={sopPageCount} onPage={setSopPage} />
            </div>
          </TabsContent>

          {/* Internal tools tab */}
          <TabsContent value="internal-tools">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Internal tools</h2>
                <p className="text-sm text-muted-foreground">
                  Quick access to internal tools such as the Sales Evaluation AI. Admins can use these
                  tools directly from here.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-card border rounded-lg p-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">Internal dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      View and access all internal tools available to your account.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => navigate("/internal")} className="w-full md:w-auto">
                      Open internal dashboard
                    </Button>
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">Sales Evaluation AI</h3>
                    <p className="text-sm text-muted-foreground">
                      Run AI-based sales profile evaluations using resumes, and see your history on the
                      Sales Evaluation page.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={() => navigate("/internal/sales-evaluation")}
                      className="w-full md:w-auto"
                      variant="outline"
                    >
                      Open Sales Evaluation AI
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Project tracker tab */}
          <TabsContent value="tracker">
            <ProjectView />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Permanently delete?</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">"{pendingDelete.name}"</span> will be permanently removed and cannot be recovered.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setPendingDelete(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SOP email send confirmation */}
      <AlertDialog open={!!confirmSend} onOpenChange={(open) => { if (!open) setConfirmSend(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmSend?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmSend?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = confirmSend?.onConfirm;
                setConfirmSend(null);
                action?.();
              }}
            >
              Send email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const DetailRow = ({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: string }) => (
  <div className="flex gap-2">
    <span className="text-muted-foreground w-32 shrink-0">{label}</span>
    <span className={`${mono ? "font-mono" : ""} ${tone || ""} break-all`}>{value}</span>
  </div>
);

const PaginationBar = ({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (p: number) => void }) => {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
      <span className="text-muted-foreground">Page {page} of {pageCount}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page === 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
};

interface BillingFormProps {
  onCreated: (cycle: BillingCycle) => void;
}

const BillingForm = ({ onCreated }: BillingFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Name, start date, and end date are required.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Invalid dates",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("billing_cycles" as any)
        .insert({
          name,
          start_date: startDate,
          end_date: endDate,
          amount: amount ? Number(amount) : null,
          currency: currency || null,
          notes: notes || null,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      onCreated(data as unknown as BillingCycle);

      toast({
        title: "Billing cycle added",
        description: "The new billing cycle is now available to all admins.",
      });

      setName("");
      setStartDate("");
      setEndDate("");
      setAmount("");
      setCurrency("INR");
      setNotes("");
    } catch (err: any) {
      toast({
        title: "Failed to add billing cycle",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-lg p-4 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="billing-name">Name *</Label>
        <Input
          id="billing-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cohort 2025 – Spring"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="billing-start">Start date *</Label>
          <Input
            id="billing-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-end">End date *</Label>
          <Input
            id="billing-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr),minmax(0,0.6fr)]">
        <div className="space-y-2">
          <Label htmlFor="billing-amount">Amount (optional)</Label>
          <Input
            id="billing-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-currency">Currency</Label>
          <Input
            id="billing-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="INR"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="billing-notes">Notes (optional)</Label>
        <Textarea
          id="billing-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this billing cycle, payment structure, etc."
        />
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Add billing cycle"}
      </Button>
    </form>
  );
};

interface ExpenseFormProps {
  userId: string | null;
  onCreated: (expense: Expense) => void;
}

const ExpenseForm = ({ userId, onCreated }: ExpenseFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      toast({
        title: "Missing fields",
        description: "Amount, category, and date are required.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) return;

    setIsSaving(true);
    try {
      let billUrl: string | null = null;

      if (billFile) {
        const fileExt = billFile.name.split(".").pop();
        const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("expense-bills")
          .upload(filePath, billFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("expense-bills")
          .getPublicUrl(filePath);

        billUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("expenses" as any)
        .insert({
          user_id: userId,
          amount: Number(amount),
          category,
          date,
          description: description || null,
          bill_url: billUrl,
        })
        .select("*")
        .single();

      if (error) throw error;

      onCreated(data as unknown as Expense);

      toast({ title: "Expense added", description: "Your expense has been saved." });

      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setBillFile(null);

      const fileInput = document.getElementById("dashboard-bill-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save expense.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-lg p-4 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="dashboard-expense-amount">Amount (₹) *</Label>
        <Input
          id="dashboard-expense-amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dashboard-expense-category">Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dashboard-expense-date">Date *</Label>
        <Input
          id="dashboard-expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dashboard-expense-description">Description (optional)</Label>
        <Textarea
          id="dashboard-expense-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the expense"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dashboard-bill-file">Attach bill / receipt (optional, PDF)</Label>
        <Input
          id="dashboard-bill-file"
          type="file"
          accept=".pdf"
          onChange={(e) => setBillFile(e.target.files?.[0] || null)}
        />
      </div>
      <Button type="submit" disabled={isSaving} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Add expense"}
      </Button>
    </form>
  );
};

export default AdminDashboard;
