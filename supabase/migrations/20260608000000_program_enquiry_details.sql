-- Richer detail for program enquiries coming from the student app (Agent onepercent).
-- When a student taps "Enquire for free application & visa", the agent app now
-- bundles a snapshot of their onboarding answers, detailed profile form and the
-- latest AI evaluation report alongside the basic contact + program info.
-- We store that snapshot here so the admin dashboard can show the full picture
-- (profile form, overall analysis) without ever querying the agent app's
-- separate Supabase project.
--
-- Shape of student_snapshot (all keys optional — depends what the student filled):
-- {
--   "captured_at": "2026-06-08T...Z",
--   "onboarding":  { degree, destinations[], start_year, field_of_study, cgpa, budget, state, city },
--   "profile_form": { education[], scores{}, work{}, target{}, goals, notes, submitted_at },
--   "evaluation":   { report_markdown, mentor_instructions, created_at }
-- }
ALTER TABLE public.program_enquiries
  ADD COLUMN IF NOT EXISTS student_snapshot jsonb;
