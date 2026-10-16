-- SOP Vault moves from PayU to Razorpay.
-- PayU columns stay so historical purchases keep their references.

ALTER TABLE public.sop_purchases
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  -- Set while one confirmation path is sending the delivery email, so the
  -- checkout handler and the webhook never both email the same buyer.
  ADD COLUMN IF NOT EXISTS delivery_claimed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS sop_purchases_razorpay_order_id_key
  ON public.sop_purchases (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

ALTER TABLE public.sop_purchases DROP CONSTRAINT IF EXISTS sop_purchases_source_check;
ALTER TABLE public.sop_purchases
  ADD CONSTRAINT sop_purchases_source_check
  CHECK (source IN ('payu', 'razorpay', 'manual'));
