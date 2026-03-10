import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Eye, Plus, ArrowLeft } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const BlogManager = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (meta) meta.content = "noindex,nofollow";
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      setUserEmail(session.user.email ?? null);
      setUserId(session.user.id);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const roleList = (roles || []).map((r: any) => r.role);
      if (!roleList.includes("blog_manager") && !roleList.includes("admin")) {
        navigate("/admin/login");
        return;
      }

      setIsLoading(false);
      fetchBlogs();
    };
    checkAuth();
  }, [navigate]);

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from("blogs" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBlogs(data as unknown as Blog[]);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingBlog) {
      setSlug(generateSlug(value));
    }
  };

  const openEditor = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setTitle(blog.title);
      setSlug(blog.slug);
      setBody(blog.body);
      setPublished(blog.published);
    } else {
      setEditingBlog(null);
      setTitle("");
      setSlug("");
      setBody("");
      setPublished(false);
    }
    setView("editor");
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !body.trim()) {
      toast({ title: "Missing fields", description: "Title, slug, and body are required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingBlog) {
        const { error } = await supabase
          .from("blogs" as any)
          .update({ title, slug, body, published, updated_at: new Date().toISOString() } as any)
          .eq("id", editingBlog.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Blog post updated successfully." });
      } else {
        const { error } = await supabase
          .from("blogs" as any)
          .insert({ title, slug, body, published, author_id: userId } as any);
        if (error) throw error;
        toast({ title: "Created", description: "Blog post created successfully." });
      }
      setView("list");
      fetchBlogs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("blogs" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Blog post deleted." });
      fetchBlogs();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
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
        {userEmail && (
          <div className="bg-slate-900 text-slate-50 text-xs md:text-sm">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
              <span>Logged in as {userEmail}</span>
              <Button type="button" size="sm" variant="secondary"
                className="h-7 px-3 text-xs bg-white text-slate-900 hover:bg-slate-100"
                onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </div>
        )}

        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Blog Manager</h1>
            <p className="text-muted-foreground max-w-2xl">
              Create, edit, and manage blog posts for the website.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          {view === "list" ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">All Posts ({blogs.length})</h2>
                <Button onClick={() => openEditor()}>
                  <Plus className="w-4 h-4 mr-2" /> New Post
                </Button>
              </div>

              {blogs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No blog posts yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <article key={blog.id}
                      className="bg-card border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{blog.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${blog.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {blog.published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          /{blog.slug} · {new Date(blog.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {blog.published && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openEditor(blog)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(blog.id)}
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-3xl mx-auto">
              <Button variant="ghost" className="mb-6" onClick={() => setView("list")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to posts
              </Button>

              <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-semibold">
                  {editingBlog ? "Edit Post" : "Create New Post"}
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-friendly-slug" />
                  <p className="text-xs text-muted-foreground">URL: /blog/{slug || "..."}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Body</Label>
                  <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your blog post content here..."
                    className="min-h-[300px]" />
                </div>

                <div className="flex items-center gap-3">
                  <Switch id="published" checked={published} onCheckedChange={setPublished} />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : editingBlog ? "Update Post" : "Create Post"}
                  </Button>
                  <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogManager;
