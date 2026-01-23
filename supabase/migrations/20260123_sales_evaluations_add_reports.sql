alter table public.sales_evaluations
  add column if not exists student_report text,
  add column if not exists sales_report text;

