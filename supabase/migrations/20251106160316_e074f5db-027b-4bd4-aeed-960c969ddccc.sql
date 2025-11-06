-- Add macronutrient columns to scans table
ALTER TABLE public.scans
ADD COLUMN carbs numeric,
ADD COLUMN protein numeric,
ADD COLUMN fat numeric;