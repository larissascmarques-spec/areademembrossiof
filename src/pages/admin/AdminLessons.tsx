import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import YouTubeInput from "@/components/admin/YouTubeInput";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
  duration: number | null;
  module_id: string;
}

interface Module {
  id: string;
  title: string;
  course_id: string;
}

const AdminLessons = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    video_url: null as string | null,
    order_index: 0,
    duration: null as number | null,
  });

  useEffect(() => {
    loadModule();
    loadLessons();
  }, [moduleId]);

  const loadModule = async () => {
    const { data, error } = await supabase
      .from("modules")
      .select("id, title, course_id")
      .eq("id", moduleId)
      .maybeSingle();

    if (error || !data) {
      toast.error("Erro ao carregar módulo");
      navigate("/admin/courses");
    } else {
      setModule(data);
    }
  };

  const loadLessons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar aulas");
    } else {
      setLessons(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        content: lesson.content || "",
        video_url: lesson.video_url,
        order_index: lesson.order_index,
        duration: lesson.duration,
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: "",
        content: "",
        video_url: null,
        order_index: lessons.length,
        duration: null,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingLesson) {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: formData.title,
          content: formData.content,
          video_url: formData.video_url,
          order_index: formData.order_index,
          duration: formData.duration,
        })
        .eq("id", editingLesson.id);

      if (error) {
        toast.error("Erro ao atualizar aula");
      } else {
        toast.success("Aula atualizada com sucesso!");
        loadLessons();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("lessons").insert({
        title: formData.title,
        content: formData.content,
        video_url: formData.video_url,
        order_index: formData.order_index,
        duration: formData.duration,
        module_id: moduleId,
      });

      if (error) {
        toast.error("Erro ao criar aula");
      } else {
        toast.success("Aula criada com sucesso!");
        loadLessons();
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;

    const { error } = await supabase.from("lessons").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir aula");
    } else {
      toast.success("Aula excluída com sucesso!");
      loadLessons();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/courses/${module?.course_id}/modules`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Módulos
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Aulas</h1>
              <p className="text-muted-foreground">
                {module ? `Módulo: ${module.title}` : "Carregando..."}
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Aula
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma aula cadastrada ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">
                        Aula {lesson.order_index + 1}: {lesson.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 mt-2">
                        {lesson.content || "Sem descrição"}
                      </CardDescription>
                      {lesson.video_url && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📹 Vídeo ID: {lesson.video_url}
                        </p>
                      )}
                      {lesson.duration && (
                        <p className="text-xs text-muted-foreground">
                          ⏱️ Duração: {lesson.duration} min
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(lesson)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Editar Aula" : "Nova Aula"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da aula
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nome da aula"
              />
            </div>
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Descrição da aula"
                rows={4}
              />
            </div>
            <div>
              <YouTubeInput
                value={formData.video_url}
                onChange={(videoId) =>
                  setFormData({ ...formData, video_url: videoId })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) =>
                    setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : null })
                  }
                  min="0"
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminLessons;
