-- Allow admins to read sop_purchases from the client (admin dashboard).
-- Writes still flow through the service-role edge functions only.
CREATE POLICY "Admins can view all sop purchases" ON public.sop_purchases
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
