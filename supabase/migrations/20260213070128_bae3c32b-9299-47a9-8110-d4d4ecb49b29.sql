
-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  bill_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own expenses (only if they have admin or sales role)
CREATE POLICY "Users can insert their own expenses"
ON public.expenses
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'sales'::app_role)
  )
);

-- Policy: Users can view their own expenses
CREATE POLICY "Users can view their own expenses"
ON public.expenses
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all expenses
CREATE POLICY "Admins can view all expenses"
ON public.expenses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for bills
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-bills', 'expense-bills', false);

-- Policy: Users can upload their own bills
CREATE POLICY "Users can upload their own bills"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'expense-bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can download their own bills
CREATE POLICY "Users can download their own bills"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expense-bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admins can view all bills
CREATE POLICY "Admins can view all bills"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expense-bills' AND
  has_role(auth.uid(), 'admin'::app_role)
);
