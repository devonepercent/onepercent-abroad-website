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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, ArrowLeft, Upload } from "lucide-react";

const CATEGORIES = [
  "Travel",
  "Food & Meals",
  "Office Supplies",
  "Software & Subscriptions",
  "Marketing",
  "Utilities",
  "Miscellaneous",
];

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

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Verify admin
      const { data: roles, error: roleErr } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleErr || !roles) {
        navigate("/admin/login");
        return;
      }

      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("expenses" as any)
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error loading expenses:", error);
      } else {
        setExpenses((data as unknown as Expense[]) || []);
      }
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  const filtered = useMemo(() => {
    return expenses.filter((exp) => {
      if (fromDate && exp.date < fromDate) return false;
      if (toDate && exp.date > toDate) return false;
      if (categoryFilter !== "all" && exp.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, fromDate, toDate, categoryFilter]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, e) => sum + Number(e.amount), 0),
    [filtered]
  );

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast({ title: "No data", description: "No expenses to export.", variant: "destructive" });
      return;
    }
    const headers = ["Date", "Category", "Amount (INR)", "Description", "Bill URL"];
    const csv = [
      headers.join(","),
      ...filtered.map((e) =>
        [
          e.date,
          `"${e.category}"`,
          e.amount,
          `"${(e.description || "").replace(/"/g, '""')}"`,
          e.bill_url || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "CSV downloaded." });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
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

      setExpenses((prev) => [data as unknown as Expense, ...prev]);
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setBillFile(null);

      const fileInput = document.getElementById("admin-bill-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      toast({ title: "Expense added", description: "Your expense has been saved." });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to admin
          </Button>
          <h1 className="text-3xl font-bold">All Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View, filter, and export all team expenses.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total (filtered)</p>
            <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Expense count</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Top category</p>
            <p className="text-2xl font-bold">
              {categoryTotals.length > 0 ? categoryTotals[0][0] : "-"}
            </p>
          </div>
        </div>

        {/* Category breakdown */}
        {categoryTotals.length > 0 && (
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Category breakdown</h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {categoryTotals.map(([cat, total]) => (
                <div key={cat} className="flex justify-between text-sm border-b pb-1">
                  <span>{cat}</span>
                  <span className="font-medium">₹{total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add expense form */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Add expense</h3>
          <form onSubmit={handleAddExpense} className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 items-end">
            <div className="space-y-1">
              <Label htmlFor="admin-expense-amount" className="text-xs">Amount (₹) *</Label>
              <Input
                id="admin-expense-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-expense-category" className="text-xs">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-expense-date" className="text-xs">Date *</Label>
              <Input
                id="admin-expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-expense-description" className="text-xs">Description</Label>
              <Input
                id="admin-expense-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-bill-file" className="text-xs">Bill (PDF)</Label>
              <Input
                id="admin-bill-file"
                type="file"
                accept=".pdf"
                onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                className="h-9"
              />
            </div>
            <Button type="submit" disabled={isSaving} className="h-9">
              <Upload className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Add"}
            </Button>
          </form>
        </div>

        {/* Filters */}
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
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setCategoryFilter("all");
            }}
          >
            Clear filters
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg shadow border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Bill</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.date}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell>₹{Number(exp.amount).toLocaleString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{exp.description || "-"}</TableCell>
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
  );
};

export default AdminExpenses;
