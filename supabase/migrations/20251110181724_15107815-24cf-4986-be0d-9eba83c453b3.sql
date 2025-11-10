-- Add macronutrient columns to scans table for food image analysis
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS carbs NUMERIC,
ADD COLUMN IF NOT EXISTS protein NUMERIC,
ADD COLUMN IF NOT EXISTS fat NUMERIC,
ADD COLUMN IF NOT EXISTS calories NUMERIC;