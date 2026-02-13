import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Upload } from "lucide-react";

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
  amount: number;
  category: string;
  date: string;
  description: string | null;
  bill_url: string | null;
  created_at: string;
}

const AddExpense = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
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

      // Check role
      const { data: roles } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id);

      const userRoles = (roles as unknown as { role: string }[]) || [];
      const hasAccess = userRoles.some(
        (r) => r.role === "admin" || r.role === "sales"
      );
      if (!hasAccess) {
        navigate("/admin/login");
        return;
      }

      setUserId(session.user.id);

      // Fetch user's expenses
      const { data, error } = await supabase
        .from("expenses" as any)
        .select("*")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });

      if (!error && data) {
        setExpenses(data as unknown as Expense[]);
      }
      setIsLoading(false);
    };
    init();
  }, [navigate]);

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

      // Upload bill PDF if provided
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

      // Reset file input
      const fileInput = document.getElementById("bill-file") as HTMLInputElement;
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => navigate("/internal")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Expenses</h1>
            <p className="text-muted-foreground max-w-2xl">
              Add your expenses and optionally attach a bill (PDF). Your expenses are visible to you and admins.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,1.5fr)]">
            {/* Add expense form */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-lg p-6 shadow-sm h-fit">
              <h2 className="text-xl font-semibold mb-2">Add expense</h2>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (₹) *</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date *</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description (optional)</Label>
                <Textarea
                  id="expense-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the expense"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-file">Attach bill / receipt (optional, PDF)</Label>
                <Input
                  id="bill-file"
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

            {/* User's expense history */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your expenses</h2>
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
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No expenses yet. Add your first expense above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell>{exp.date}</TableCell>
                          <TableCell>{exp.category}</TableCell>
                          <TableCell>₹{Number(exp.amount).toLocaleString()}</TableCell>
                          <TableCell>{exp.description || "-"}</TableCell>
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
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AddExpense;
