ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS line_number text;

UPDATE public.site_settings
SET line_number = '+81 70-9155-2861'
WHERE id = 1;
