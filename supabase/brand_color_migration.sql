-- Migration to add brand_primary to site_settings
-- This is idempotent; checks for existence before inserting.

INSERT INTO public.site_settings (key, value)
VALUES ('brand_primary', '"#7FC243"'::jsonb)
ON CONFLICT (key) DO NOTHING;
