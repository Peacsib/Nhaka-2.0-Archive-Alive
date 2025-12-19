-- Create archives table for storing resurrection entries
CREATE TABLE public.archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_name TEXT NOT NULL,
  original_text TEXT,
  restored_text TEXT NOT NULL,
  agent_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_confidence NUMERIC(5,2) DEFAULT 0,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.archives ENABLE ROW LEVEL SECURITY;

-- For demo purposes, allow public read/write (can be restricted later with auth)
CREATE POLICY "Allow public read access to archives" 
ON public.archives 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to archives" 
ON public.archives 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to archives" 
ON public.archives 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to archives" 
ON public.archives 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_archives_updated_at
BEFORE UPDATE ON public.archives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add to realtime publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.archives;