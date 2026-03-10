import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Blog {
  id: string;
  title: string;
  slug: string;
  body: string;
  created_at: string;
}

const Blog = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs" as any)
        .select("id, title, slug, body, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBlogs(data as unknown as Blog[]);
      }
      setIsLoading(false);
    };
    fetchBlogs();
  }, []);

  const getExcerpt = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Updates & Blog</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              Latest news, insights, and updates from OnePercent Abroad.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link key={blog.id} to={`/blog/${blog.slug}`}
                  className="group bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {getExcerpt(blog.body)}
                    </p>
                    <span className="inline-block mt-4 text-sm font-medium text-primary">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
