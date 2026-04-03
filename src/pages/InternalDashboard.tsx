import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "user" | "sales";

const InternalDashboard = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      setUserEmail(session.user.email ?? null);

      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id);

      if (error || !data || data.length === 0) {
        navigate("/admin/login");
        return;
      }

      const rows = data as unknown as { role: Role }[];
      const userRoles = rows.map((r) => r.role);
      setRoles(userRoles);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const hasSalesAccess = roles.includes("sales") || roles.includes("admin");

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
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Internal Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl">
              Tools and reports for the internal team. This area is not indexed and is only accessible to
              authorised team members.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hasSalesAccess && (
              <article className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Sales Evaluation AI</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a candidate&apos;s resume and generate a structured evaluation report for the sales
                    team. View your past evaluations in one place.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full md:w-auto">
                    <Link to="/internal/sales-evaluation">Open tool</Link>
                  </Button>
                </div>
              </article>
            )}

            {hasSalesAccess && (
              <article className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Expenses</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Log your expenses with optional bill attachments. Track your spending history in one place.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full md:w-auto">
                    <Link to="/internal/expenses">Add expenses</Link>
                  </Button>
                </div>
              </article>
            )}

            {hasSalesAccess && (
              <article className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">OfferDesk</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate personalised offer cards and closer coupons for prospects. Track all issued offers in one place.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full md:w-auto">
                    <Link to="/internal/offer-desk">Open tool</Link>
                  </Button>
                </div>
              </article>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InternalDashboard;

