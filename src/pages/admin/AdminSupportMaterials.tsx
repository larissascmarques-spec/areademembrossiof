import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/admin/FileUpload";
import { Plus, Pencil, Trash2, File, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SupportMaterial {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export default function AdminSupportMaterials() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<SupportMaterial | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    file_name: "",
    file_type: "",
    file_size: 0,
  });
  
  const queryClient = useQueryClient();

  const { data: materials, isLoading } = useQuery({
    queryKey: ["support-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_materials")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SupportMaterial[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("support_materials").insert({
        title: data.title,
        description: data.description || null,
        file_url: data.file_url,
        file_name: data.file_name,
        file_type: data.file_type,
        file_size: data.file_size,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-materials"] });
      toast.success("Material criado com sucesso!");
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar material: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("support_materials")
        .update({
          title: data.title,
          description: data.description || null,
          file_url: data.file_url,
          file_name: data.file_name,
          file_type: data.file_type,
          file_size: data.file_size,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-materials"] });
      toast.success("Material atualizado com sucesso!");
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar material: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("support_materials")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-materials"] });
      toast.success("Material removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover material: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      file_url: "",
      file_name: "",
      file_type: "",
      file_size: 0,
    });
    setEditingMaterial(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (material: SupportMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || "",
      file_url: material.file_url,
      file_name: material.file_name,
      file_type: material.file_type || "",
      file_size: material.file_size || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.file_url) {
      toast.error("Preencha o título e envie um arquivo");
      return;
    }

    if (editingMaterial) {
      updateMutation.mutate({ id: editingMaterial.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || "FILE";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Materiais de Apoio</h1>
            <p className="text-muted-foreground">Gerencie os materiais disponíveis para os alunos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingMaterial ? "Editar Material" : "Novo Material"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nome do material"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o conteúdo do material..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Arquivo *</Label>
                  <FileUpload
                    value={formData.file_url}
                    fileName={formData.file_name}
                    onChange={(url, name, type, size) => 
                      setFormData({ ...formData, file_url: url, file_name: name, file_type: type, file_size: size })
                    }
                    onRemove={() => 
                      setFormData({ ...formData, file_url: "", file_name: "", file_type: "", file_size: 0 })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingMaterial ? "Salvar Alterações" : "Criar Material"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : materials?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <File className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum material cadastrado</p>
              <Button variant="link" onClick={() => setIsDialogOpen(true)}>
                Adicionar primeiro material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {materials?.map((material) => (
              <Card key={material.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <File className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{material.title}</h3>
                    {material.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {material.description}
                      </p>
                    )}
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span>{getFileExtension(material.file_name)}</span>
                      <span>{formatFileSize(material.file_size)}</span>
                      <span>
                        {format(new Date(material.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(material)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja remover este material?")) {
                          deleteMutation.mutate(material.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="icon"
                      asChild
                    >
                      <a href={material.file_url} download={material.file_name} target="_blank">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
