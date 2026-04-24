CREATE TABLE IF NOT EXISTS public.sop_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text,
  firstname text,
  plan text NOT NULL CHECK (plan IN ('single', 'bundle', 'full')),
  selected_sop_ids integer[] NOT NULL DEFAULT '{}',
  payu_txnid text,
  payu_mihpayid text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sop_purchases ENABLE ROW LEVEL SECURITY;

-- All reads and writes go through the service-role edge function only.
-- No direct client access.
CREATE POLICY "No direct client access" ON public.sop_purchases
  USING (false)
  WITH CHECK (false);

-- Private storage bucket for SOP PDFs and the full-vault zip.
-- Upload structure:
--   individual/sop-1.pdf  ...  individual/sop-15.pdf
--   bundles/full-vault.zip
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sop-pdfs',
  'sop-pdfs',
  false,
  52428800,
  ARRAY['application/pdf', 'application/zip', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;
