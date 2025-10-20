-- Create scans table to store user scan history
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  barcode TEXT NOT NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  health_score DECIMAL(3,1) NOT NULL CHECK (health_score >= 0 AND health_score <= 10),
  recommendation TEXT NOT NULL CHECK (recommendation IN ('EAT', 'BUY', 'AVOID')),
  nutrition_score DECIMAL(3,1),
  ingredient_quality DECIMAL(3,1),
  additives_score DECIMAL(3,1),
  product_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scans"
ON public.scans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans"
ON public.scans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
ON public.scans
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);
