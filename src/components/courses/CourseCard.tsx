import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  title: string;
  moduleNumber: string;
  thumbnailUrl?: string | null;
  progress?: number;
  locked?: boolean;
  onClick?: () => void;
  courseId?: string;
}

export const CourseCard = ({
  title,
  moduleNumber,
  thumbnailUrl,
  progress = 0,
  locked = false,
  onClick,
  courseId
}: CourseCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (courseId) {
      window.location.href = `/course/${courseId}`;
    }
  };

  return (
    <Card
      className="relative overflow-hidden cursor-pointer group transition-all hover:scale-105 border-0 h-full"
      onClick={handleClick}
    >
      {/* Background Image with Overlay - Vertical aspect ratio */}
      <div className="aspect-[2/3] relative">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-card" />
        )}
        
        {/* Dark Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${locked ? 'bg-black/60' : ''}`} />
        
        {/* Module Tag */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
            MÓDULO {moduleNumber}
          </span>
        </div>

        {/* Lock Icon for Locked Content */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-foreground font-bold text-base uppercase tracking-wide line-clamp-3">
            {title}
          </h3>
        </div>

        {/* Progress Bar */}
        {progress > 0 && !locked && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progress} className="h-1.5 rounded-none bg-muted/50" />
          </div>
        )}
      </div>
    </Card>
  );
};
