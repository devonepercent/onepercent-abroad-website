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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, LogOut } from "lucide-react";

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

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [hiring, setHiring] = useState<HiringApplication[]>([]);
  const [salesEvaluations, setSalesEvaluations] = useState<SalesEvaluationAdmin[]>([]);
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

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
        { data: hiringData, error: hiringError },
        { data: salesData, error: salesError },
        { data: billingData, error: billingError },
      ] = await Promise.all([
        supabase
          .from("webinar_registrations" as any)
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
      ]);

      if (webinarError) {
        throw webinarError;
      }

      setRegistrations((webinarData as unknown as Registration[]) || []);

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

        <Tabs defaultValue="webinar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="webinar">Webinar registrations</TabsTrigger>
            <TabsTrigger value="hiring">Hiring submissions</TabsTrigger>
            <TabsTrigger value="sales-evaluations">Sales evaluation reports</TabsTrigger>
            <TabsTrigger value="billing">Billing cycles</TabsTrigger>
            <TabsTrigger value="internal-tools">Internal tools</TabsTrigger>
          </TabsList>

          {/* Webinar tab */}
          <TabsContent value="webinar">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Webinar registrations</h2>
                <p className="text-sm text-muted-foreground">
                  Filter by date range and export registrations as CSV.
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
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No registrations for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((reg) => (
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
            </div>
          </TabsContent>

          {/* Hiring submissions tab */}
          <TabsContent value="hiring">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">Hiring submissions</h2>
              <p className="text-sm text-muted-foreground">
                View recent hiring leads from all roles captured via the website.
              </p>
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
                  {hiring.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No hiring submissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    hiring.map((h) => (
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
                            <a
                              href={h.cv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View CV
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

export default AdminDashboard;
