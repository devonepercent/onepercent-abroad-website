import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "user" | "sales";

interface SalesEvaluationRecord {
  id: string;
  candidate_name: string | null;
  report: string;
  student_report?: string | null;
  sales_report?: string | null;
  created_at: string;
}

type ActiveReportView = "student" | "sales";

const SalesEvaluation = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [currentEvaluation, setCurrentEvaluation] = useState<SalesEvaluationRecord | null>(null);
  const [activeView, setActiveView] = useState<ActiveReportView>("student");
  const [history, setHistory] = useState<SalesEvaluationRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure this page isn't indexed by search engines
    const metaName = "robots";
    let meta = document.querySelector(`meta[name="${metaName}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = metaName;
      document.head.appendChild(meta);
    }
    const previousContent = meta.content;
    meta.content = "noindex,nofollow";

    return () => {
      meta.content = previousContent;
    };
  }, []);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      setUserEmail(session.user.email ?? null);

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id);

      if (rolesError || !rolesData || rolesData.length === 0) {
        navigate("/admin/login");
        return;
      }

      const userRoles = rolesData.map((r: { role: Role }) => r.role);
      const hasAccess = userRoles.includes("sales") || userRoles.includes("admin");

      if (!hasAccess) {
        navigate("/admin/login");
        return;
      }

      setRoles(userRoles);

      const { data: historyData, error: historyError } = await supabase
        .from("sales_evaluations" as any)
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (historyError) {
        console.error("Error loading sales evaluations history:", historyError);
      } else {
        setHistory(historyData || []);
      }

      setIsLoading(false);
    };

    checkAuthAndLoad();
  }, [navigate]);

  const extractTextFromFile = (file: File): Promise<string> => {
    // For now we keep this simple and expect team members to paste CV text if extraction is poor.
    // This helper just reads the file as text for plain-text resumes.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve((reader.result as string) || "");
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const handleEvaluate = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/admin/login");
      return;
    }

    try {
      setIsSubmitting(true);
      setCurrentEvaluation(null);

      let finalCvText = cvText.trim();

      if (!finalCvText && file) {
        finalCvText = (await extractTextFromFile(file)).trim();
      }

      if (!finalCvText) {
        toast({
          title: "Missing CV",
          description: "Please upload a resume or paste the CV text before evaluating.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("sales-evaluation-ai", {
        body: {
          userId: session.user.id,
          userEmail: session.user.email,
          candidateName: candidateName || null,
          cvText: finalCvText,
        },
      });

      if (error || !data?.success) {
        console.error("sales-evaluation-ai error:", error || data?.error);
        throw new Error(data?.error || "Failed to generate evaluation");
      }

      const evaluation = data.evaluation as SalesEvaluationRecord;
      setCurrentEvaluation(evaluation);
      setHistory((prev) => [evaluation, ...prev]);

      toast({
        title: "Evaluation generated",
        description: "The AI sales evaluation report has been created.",
      });
    } catch (err: any) {
      toast({
        title: "Evaluation failed",
        description: err.message || "Something went wrong while generating the report.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const getActiveReportText = () => {
    if (!currentEvaluation) return null;

    if (activeView === "student") {
      return currentEvaluation.student_report || currentEvaluation.report;
    }

    return (
      currentEvaluation.sales_report ||
      "Internal sales perspective report is not available for this evaluation."
    );
  };

  const handleDownloadPdf = () => {
    const reportText = getActiveReportText();
    if (!currentEvaluation || !reportText) {
      toast({
        title: "No report available",
        description: "Generate an evaluation before downloading as PDF.",
        variant: "destructive",
      });
      return;
    }

    const titlePrefix =
      activeView === "student" ? "Student Profile Assessment" : "Sales Screening Report";

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;

    const safeReport = reportText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    win.document.write(`
      <html>
        <head>
          <title>${titlePrefix} - ${currentEvaluation.candidate_name || "Unnamed candidate"}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              padding: 32px;
              white-space: pre-wrap;
              line-height: 1.5;
            }
            h1, h2 {
              margin: 0 0 12px 0;
            }
            h1 {
              font-size: 22px;
            }
            h2 {
              font-size: 16px;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <h1>${titlePrefix}</h1>
          <h2>Candidate: ${currentEvaluation.candidate_name || "Unnamed candidate"}</h2>
          <div>${safeReport}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        {userEmail && (
          <div className="bg-slate-900 text-slate-50 text-xs md:text-sm">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
              <span>Logged in as {userEmail}</span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 px-3 text-xs bg-white text-slate-900 hover:bg-slate-100"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </div>
        )}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Sales Evaluation AI</h1>
            <p className="text-muted-foreground max-w-2xl">
              Upload a candidate&apos;s resume or paste their CV text to generate a structured AI evaluation
              report. Your evaluations are saved and visible only to you.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14 grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate name (optional)</Label>
              <Input
                id="candidate-name"
                placeholder="Enter candidate name if known"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload resume (PDF or text file)</Label>
              <Input
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                For the best results today, use plain-text resumes or also paste the CV text below.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-text">Or paste CV text directly</Label>
              <Textarea
                id="cv-text"
                rows={10}
                placeholder="Paste the candidate's full CV or LinkedIn profile text here..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
              />
            </div>

            <Button size="lg" onClick={handleEvaluate} disabled={isSubmitting}>
              {isSubmitting ? "Evaluating..." : "Evaluate"}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm min-h-[200px]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                <h2 className="text-lg font-semibold">Latest evaluation</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-full border bg-muted p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={activeView === "student" ? "default" : "ghost"}
                      className="rounded-full px-3"
                      onClick={() => setActiveView("student")}
                    >
                      Student report
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={activeView === "sales" ? "default" : "ghost"}
                      className="rounded-full px-3"
                      onClick={() => setActiveView("sales")}
                    >
                      Sales report
                    </Button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={!currentEvaluation}
                  >
                    Download as PDF
                  </Button>
                </div>
              </div>

              {getActiveReportText() ? (
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground max-h-[400px] overflow-auto">
                  {getActiveReportText()}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Run an evaluation to see the AI-generated report here.
                </p>
              )}
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Your past evaluations</h2>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No evaluations yet. When you generate reports, they will appear here.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-auto">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full text-left border rounded-lg p-3 text-sm hover:bg-muted/60 transition-colors"
                      onClick={() => {
                        setCurrentEvaluation(item);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {item.candidate_name || "Unnamed candidate"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {item.student_report || item.report}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SalesEvaluation;

