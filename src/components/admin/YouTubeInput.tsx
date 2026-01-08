import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Youtube } from "lucide-react";

interface YouTubeInputProps {
  value: string | null;
  onChange: (videoId: string | null) => void;
}

const YouTubeInput = ({ value, onChange }: YouTubeInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (value) {
      setUrl(`https://www.youtube.com/watch?v=${value}`);
    }
  }, [value]);

  const extractYouTubeId = (urlString: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = urlString.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setError("");

    if (!newUrl.trim()) {
      onChange(null);
      return;
    }

    const videoId = extractYouTubeId(newUrl);
    if (videoId) {
      onChange(videoId);
    } else {
      setError("Por favor, insira um link válido do YouTube");
      onChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="youtube-url">Link do vídeo no YouTube</Label>
        <Input
          id="youtube-url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {value && !error && (
        <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-muted border border-border">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${value}`}
            title="YouTube video preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
            <Youtube className="h-3 w-3" />
            Preview
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeInput;
