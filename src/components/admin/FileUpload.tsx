import { useState, useCallback } from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  value: string;
  fileName: string;
  onChange: (url: string, fileName: string, fileType: string, fileSize: number) => void;
  onRemove: () => void;
}

export function FileUpload({ value, fileName, onChange, onRemove }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('support-materials')
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('support-materials')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      onChange(publicUrl, file.name, file.type || fileExt || 'unknown', file.size);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao enviar arquivo: " + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const getFileIcon = (type: string) => {
    return <File className="h-8 w-8 text-primary" />;
  };

  if (value && fileName) {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
        {getFileIcon(fileName)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">Arquivo enviado</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${isUploading ? 'pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileInput}
        disabled={isUploading}
      />
      
      {isUploading ? (
        <div className="space-y-4">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">Enviando... {uploadProgress}%</p>
        </div>
      ) : (
        <>
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste e solte seu arquivo aqui
          </p>
          <p className="text-xs text-muted-foreground">
            ou clique para selecionar
          </p>
        </>
      )}
    </div>
  );
}
