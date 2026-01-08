import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

interface DashboardSettings {
  id: string;
  hero_image_url: string | null;
  hero_title: string;
  hero_paragraph1: string;
  hero_paragraph2: string;
  hero_paragraph3: string;
  hero_cta: string;
}

const AdminDashboardSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<DashboardSettings>({
    id: '00000000-0000-0000-0000-000000000001',
    hero_image_url: null,
    hero_title: '',
    hero_paragraph1: '',
    hero_paragraph2: '',
    hero_paragraph3: '',
    hero_cta: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('dashboard_settings')
        .update({
          hero_image_url: settings.hero_image_url,
          hero_title: settings.hero_title,
          hero_paragraph1: settings.hero_paragraph1,
          hero_paragraph2: settings.hero_paragraph2,
          hero_paragraph3: settings.hero_paragraph3,
          hero_cta: settings.hero_cta,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Dashboard</h1>
          <p className="text-muted-foreground">
            Personalize o hero banner da página inicial dos estudantes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Imagem do Instrutor</Label>
              <ImageUpload
                value={settings.hero_image_url}
                onChange={(url) => setSettings({ ...settings, hero_image_url: url })}
                courseId="hero-banner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título Principal</Label>
              <Input
                id="title"
                value={settings.hero_title}
                onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                placeholder="Bem-vindo à sua jornada de aprendizado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paragraph1">Primeiro Parágrafo</Label>
              <Textarea
                id="paragraph1"
                value={settings.hero_paragraph1}
                onChange={(e) => setSettings({ ...settings, hero_paragraph1: e.target.value })}
                placeholder="Desenvolva suas habilidades..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paragraph2">Segundo Parágrafo</Label>
              <Textarea
                id="paragraph2"
                value={settings.hero_paragraph2}
                onChange={(e) => setSettings({ ...settings, hero_paragraph2: e.target.value })}
                placeholder="Nossa plataforma oferece..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paragraph3">Terceiro Parágrafo</Label>
              <Textarea
                id="paragraph3"
                value={settings.hero_paragraph3}
                onChange={(e) => setSettings({ ...settings, hero_paragraph3: e.target.value })}
                placeholder="Aprenda no seu ritmo..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Frase de Destaque (CTA)</Label>
              <Input
                id="cta"
                value={settings.hero_cta}
                onChange={(e) => setSettings({ ...settings, hero_cta: e.target.value })}
                placeholder="Comece agora e transforme seu futuro!"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardSettings;
