import { useEffect, useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, LogOut, Upload } from "lucide-react";

interface Registration {
  id: string;
  name: string;
  email: string;
  country_code: string;
  phone_number: string;
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

interface SalesEvaluationAdmin {
  id: string;
  candidate_name: string | null;
  user_email: string | null;
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

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hiring, setHiring] = useState<HiringApplication[]>([]);
  const [salesEvaluations, setSalesEvaluations] = useState<SalesEvaluationAdmin[]>([]);
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [expenseEmailMap, setExpenseEmailMap] = useState<UserEmailMap>({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { checkAuthAndFetchData(); }, []);
  useEffect(() => { setWebinarPage(1); }, [fromDate, toDate]);
  useEffect(() => { setLeadsPage(1); }, [leadsFrom, leadsTo]);
  useEffect(() => { setHiringPage(1); }, [hiringFrom, hiringTo]);
  useEffect(() => { setSubsPage(1); }, [subsFrom, subsTo]);

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

  const filteredRegistrations = useMemo(() => {
    if (!fromDate && !toDate) return registrations;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return registrations.filter((reg) => {
      const ts = new Date(reg.created_at);
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      return true;
    });
  }, [registrations, fromDate, toDate]);

  const pagedWebinar = filteredRegistrations.slice((webinarPage - 1) * PAGE_SIZE, webinarPage * PAGE_SIZE);
  const webinarPageCount = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));

  const filteredLeads = useMemo(() => {
    const f = leadsFrom ? new Date(leadsFrom) : null;
    const t = leadsTo ? new Date(leadsTo) : null;
    if (t) t.setHours(23, 59, 59, 999);
    if (!f && !t) return leads;
    return leads.filter(l => {
      const ts = new Date(l.created_at);
      if (f && ts < f) return false;
      if (t && ts > t) return false;
      return true;
    });
  }, [leads, leadsFrom, leadsTo]);
  const pagedLeads = filteredLeads.slice((leadsPage - 1) * PAGE_SIZE, leadsPage * PAGE_SIZE);
  const leadsPageCount = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));

  const filteredHiring = useMemo(() => {
    const f = hiringFrom ? new Date(hiringFrom) : null;
    const t = hiringTo ? new Date(hiringTo) : null;
    if (t) t.setHours(23, 59, 59, 999);
    if (!f && !t) return hiring;
    return hiring.filter(h => {
      const ts = new Date(h.created_at);
      if (f && ts < f) return false;
      if (t && ts > t) return false;
      return true;
    });
  }, [hiring, hiringFrom, hiringTo]);
  const pagedHiring = filteredHiring.slice((hiringPage - 1) * PAGE_SIZE, hiringPage * PAGE_SIZE);
  const hiringPageCount = Math.max(1, Math.ceil(filteredHiring.length / PAGE_SIZE));

  const filteredSubs = useMemo(() => {
    const f = subsFrom ? new Date(subsFrom) : null;
    const t = subsTo ? new Date(subsTo) : null;
    if (t) t.setHours(23, 59, 59, 999);
    if (!f && !t) return subscribers;
    return subscribers.filter(s => {
      const ts = new Date(s.created_at);
      if (f && ts < f) return false;
      if (t && ts > t) return false;
      return true;
    });
  }, [subscribers, subsFrom, subsTo]);
  const pagedSubs = filteredSubs.slice((subsPage - 1) * PAGE_SIZE, subsPage * PAGE_SIZE);
  const subsPageCount = Math.max(1, Math.ceil(filteredSubs.length / PAGE_SIZE));

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      toast({
        title: "No Data",
        description: "No registrations to export for selected range",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Timestamp", "Name", "Phone Number", "Email"];
    const csvContent = [
      headers.join(","),
      ...filteredRegistrations.map((reg) =>
        [
          new Date(reg.created_at).toLocaleString(),
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {adminEmail
                ? `Welcome, ${adminEmail} — manage webinar leads, hiring submissions, and internal tool reports.`
                : "Manage webinar leads, hiring submissions, and internal tool reports."}
            </p>
          </div>
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leads">Get started leads</TabsTrigger>
            <TabsTrigger value="webinar">Webinar registrations</TabsTrigger>
            <TabsTrigger value="hiring">Hiring submissions</TabsTrigger>
            <TabsTrigger value="sales-evaluations">Sales evaluation reports</TabsTrigger>
            <TabsTrigger value="billing">Billing cycles</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter subscribers</TabsTrigger>
            <TabsTrigger value="internal-tools">Internal tools</TabsTrigger>
          </TabsList>

          {/* Get started leads tab */}
          <TabsContent value="leads">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Get started leads</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredLeads.length} of {leads.length} total · page {leadsPage} of {leadsPageCount}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={leadsFrom} onChange={e => setLeadsFrom(e.target.value)} className="h-9 w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={leadsTo} onChange={e => setLeadsTo(e.target.value)} className="h-9 w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setLeadsFrom(""); setLeadsTo(""); }}>Clear dates</Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <PaginationBar page={leadsPage} pageCount={leadsPageCount} onPage={setLeadsPage} />
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
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-9 w-40"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-9 w-40"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setFromDate(""); setToDate(""); }}>
                  Clear dates
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
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedWebinar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No registrations for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedWebinar.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>{new Date(reg.created_at).toLocaleString()}</TableCell>
                        <TableCell>{reg.name}</TableCell>
                        <TableCell>
                          {reg.country_code} {reg.phone_number}
                        </TableCell>
                        <TableCell>{reg.email}</TableCell>
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
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={hiringFrom} onChange={e => setHiringFrom(e.target.value)} className="h-9 w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={hiringTo} onChange={e => setHiringTo(e.target.value)} className="h-9 w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setHiringFrom(""); setHiringTo(""); }}>Clear dates</Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedHiring.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={subsFrom} onChange={e => setSubsFrom(e.target.value)} className="h-9 w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={subsTo} onChange={e => setSubsTo(e.target.value)} className="h-9 w-40" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSubsFrom(""); setSubsTo(""); }}>Clear dates</Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedSubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <PaginationBar page={subsPage} pageCount={subsPageCount} onPage={setSubsPage} />
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
        </Tabs>
      </div>
    </div>
  );
};

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
