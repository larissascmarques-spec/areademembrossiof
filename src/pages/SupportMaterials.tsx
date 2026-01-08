import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Download, Loader2, FileText, FileSpreadsheet, FileArchive, FileImage } from "lucide-react";
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

export default function SupportMaterials() {
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || "FILE";
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext || "")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (["xls", "xlsx", "csv"].includes(ext || "")) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) {
      return <FileArchive className="h-8 w-8 text-yellow-500" />;
    }
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) {
      return <FileImage className="h-8 w-8 text-purple-500" />;
    }
    return <File className="h-8 w-8 text-primary" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Materiais de Apoio</h1>
          <p className="text-muted-foreground">
            Acesse e baixe os materiais complementares dos seus cursos
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : materials?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <File className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum material disponível</h3>
              <p className="text-muted-foreground text-center">
                Os materiais de apoio serão disponibilizados aqui quando estiverem prontos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials?.map((material) => (
              <Card key={material.id} className="flex flex-col">
                <CardHeader className="flex-row gap-4 items-start space-y-0">
                  <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-muted">
                    {getFileIcon(material.file_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{material.title}</CardTitle>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{getFileExtension(material.file_name)}</span>
                      {material.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(material.file_size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {material.description && (
                    <CardDescription className="flex-1 mb-4">
                      {material.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(material.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <Button asChild>
                      <a href={material.file_url} download={material.file_name} target="_blank">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
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
