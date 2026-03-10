-- Create blogs table
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  body text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Public can read published blogs
CREATE POLICY "Anyone can read published blogs"
ON public.blogs FOR SELECT TO anon, authenticated
USING (published = true);

-- Authors can read own posts (including unpublished)
CREATE POLICY "Authors can read own posts"
ON public.blogs FOR SELECT TO authenticated
USING (auth.uid() = author_id);

-- Admins can read all posts
CREATE POLICY "Admins can read all posts"
ON public.blogs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Blog managers/admins can insert
CREATE POLICY "Blog managers can insert posts"
ON public.blogs FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND (has_role(auth.uid(), 'blog_manager') OR has_role(auth.uid(), 'admin'))
);

-- Blog managers/admins can update own posts
CREATE POLICY "Blog managers can update own posts"
ON public.blogs FOR UPDATE TO authenticated
USING (
  auth.uid() = author_id
  AND (has_role(auth.uid(), 'blog_manager') OR has_role(auth.uid(), 'admin'))
)
WITH CHECK (
  auth.uid() = author_id
  AND (has_role(auth.uid(), 'blog_manager') OR has_role(auth.uid(), 'admin'))
);

-- Blog managers/admins can delete own posts
CREATE POLICY "Blog managers can delete own posts"
ON public.blogs FOR DELETE TO authenticated
USING (
  auth.uid() = author_id
  AND (has_role(auth.uid(), 'blog_manager') OR has_role(auth.uid(), 'admin'))
);