import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ArrowLeft, List } from "lucide-react";
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

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  course_id: string;
}

interface Course {
  id: string;
  title: string;
}

const AdminModules = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_index: 0,
  });

  useEffect(() => {
    loadCourse();
    loadModules();
  }, [courseId]);

  const loadCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", courseId)
      .maybeSingle();

    if (error || !data) {
      toast.error("Erro ao carregar curso");
      navigate("/admin/courses");
    } else {
      setCourse(data);
    }
  };

  const loadModules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar módulos");
    } else {
      setModules(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        title: module.title,
        description: module.description || "",
        order_index: module.order_index,
      });
    } else {
      setEditingModule(null);
      setFormData({
        title: "",
        description: "",
        order_index: modules.length,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingModule) {
      const { error } = await supabase
        .from("modules")
        .update({
          title: formData.title,
          description: formData.description,
          order_index: formData.order_index,
        })
        .eq("id", editingModule.id);

      if (error) {
        toast.error("Erro ao atualizar módulo");
      } else {
        toast.success("Módulo atualizado com sucesso!");
        loadModules();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("modules").insert({
        title: formData.title,
        description: formData.description,
        order_index: formData.order_index,
        course_id: courseId,
      });

      if (error) {
        toast.error("Erro ao criar módulo");
      } else {
        toast.success("Módulo criado com sucesso!");
        loadModules();
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo?")) return;

    const { error } = await supabase.from("modules").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir módulo");
    } else {
      toast.success("Módulo excluído com sucesso!");
      loadModules();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/courses")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Cursos
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Módulos</h1>
              <p className="text-muted-foreground">
                {course ? `Curso: ${course.title}` : "Carregando..."}
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Módulo
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : modules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum módulo cadastrado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">
                        Módulo {module.order_index + 1}: {module.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 mt-2">
                        {module.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/modules/${module.id}/lessons`)}
                      >
                        <List className="h-4 w-4 mr-2" />
                        Aulas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(module)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(module.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Editar Módulo" : "Novo Módulo"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do módulo
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
                placeholder="Nome do módulo"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do módulo"
                rows={4}
              />
            </div>
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

export default AdminModules;
