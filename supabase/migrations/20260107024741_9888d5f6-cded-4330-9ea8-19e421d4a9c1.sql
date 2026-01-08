-- Create support_materials table
CREATE TABLE public.support_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view support materials"
ON public.support_materials
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage support materials"
ON public.support_materials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_support_materials_updated_at
BEFORE UPDATE ON public.support_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('support-materials', 'support-materials', true);

-- Storage policies
CREATE POLICY "Anyone can view support materials files"
ON storage.objects FOR SELECT
USING (bucket_id = 'support-materials');

CREATE POLICY "Admins can upload support materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'support-materials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update support materials files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'support-materials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete support materials files"
ON storage.objects FOR DELETE
USING (bucket_id = 'support-materials' AND has_role(auth.uid(), 'admin'::app_role));