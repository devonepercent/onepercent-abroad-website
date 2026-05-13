ALTER TABLE public.webinar_registrations ADD COLUMN IF NOT EXISTS webinar_name text;

UPDATE public.webinar_registrations
SET webinar_name = 'Erasmus Mundus Webinar'
WHERE webinar_name IS NULL;
