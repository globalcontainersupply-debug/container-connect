ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_secondary text;

UPDATE public.site_settings
SET phone = '+81 709 155 2861',
    whatsapp_secondary = '+1 (579) 300-2540'
WHERE id = 1;
