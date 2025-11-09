-- Add columns for health risks and healthier alternatives to scans table
ALTER TABLE public.scans 
ADD COLUMN health_risks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN alternatives JSONB DEFAULT '[]'::jsonb;