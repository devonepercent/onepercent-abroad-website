import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface SourceLink {
  label: string;
  url: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  body: string;
  source_links: SourceLink[];
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) { setNotFound(true); setIsLoading(false); return; }

      const { data, error } = await supabase
        .from("blogs" as any)
        .select("id, title, slug, body, source_links, created_at")
        .eq("slug", slug)
        .eq("published", true)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setBlog(data as unknown as Blog);
      }
      setIsLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Link to="/blog" className="text-primary hover:underline">
            ← Back to blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>

          <p className="text-sm text-muted-foreground mb-3">
            {new Date(blog.created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </p>

          <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">{blog.title}</h1>

          <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {blog.body}
          </div>

          {Array.isArray(blog.source_links) && blog.source_links.length > 0 && (
            <div className="mt-10 pt-6 border-t">
              <h2 className="text-lg font-semibold mb-3">Sources</h2>
              <ul className="space-y-2">
                {blog.source_links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      {link.label?.trim() || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
