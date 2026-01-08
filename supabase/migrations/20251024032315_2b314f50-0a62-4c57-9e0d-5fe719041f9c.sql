-- Create dashboard_settings table for admin to customize student dashboard
CREATE TABLE public.dashboard_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image_url text,
  hero_title text NOT NULL DEFAULT 'Bem-vindo à sua jornada de aprendizado',
  hero_paragraph1 text NOT NULL DEFAULT 'Desenvolva suas habilidades com cursos exclusivos e conteúdos práticos que vão transformar sua carreira profissional.',
  hero_paragraph2 text NOT NULL DEFAULT 'Nossa plataforma oferece uma experiência de aprendizado imersiva, com vídeo-aulas de alta qualidade e material didático completo.',
  hero_paragraph3 text NOT NULL DEFAULT 'Aprenda no seu ritmo, acompanhe seu progresso e conquiste seus objetivos com o apoio de especialistas da área.',
  hero_cta text NOT NULL DEFAULT 'Comece agora e transforme seu futuro!',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read dashboard settings
CREATE POLICY "Anyone can view dashboard settings"
  ON public.dashboard_settings
  FOR SELECT
  USING (true);

-- Only admins can manage dashboard settings
CREATE POLICY "Admins can manage dashboard settings"
  ON public.dashboard_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.dashboard_settings (id, hero_title, hero_paragraph1, hero_paragraph2, hero_paragraph3, hero_cta)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Bem-vindo à sua jornada de aprendizado',
  'Desenvolva suas habilidades com cursos exclusivos e conteúdos práticos que vão transformar sua carreira profissional.',
  'Nossa plataforma oferece uma experiência de aprendizado imersiva, com vídeo-aulas de alta qualidade e material didático completo.',
  'Aprenda no seu ritmo, acompanhe seu progresso e conquiste seus objetivos com o apoio de especialistas da área.',
  'Comece agora e transforme seu futuro!'
);

-- Trigger for updated_at
CREATE TRIGGER update_dashboard_settings_updated_at
  BEFORE UPDATE ON public.dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();