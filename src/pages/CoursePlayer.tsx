import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
  duration: number | null;
}

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourseData(courseId);
    }
  }, [courseId]);

  const loadCourseData = async (courseId: string) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Check if user is enrolled
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("course_id", courseId)
        .single();

      setEnrolled(!!enrollment);

      // Get course details
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      setCourse(courseData);

      // Get modules
      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      setModules(modulesData || []);

      // Get lessons for all modules
      if (modulesData && modulesData.length > 0) {
        const lessonsMap: Record<string, Lesson[]> = {};

        for (const module of modulesData) {
          const { data: lessonsData } = await supabase
            .from("lessons")
            .select("*")
            .eq("module_id", module.id)
            .order("order_index");

          lessonsMap[module.id] = lessonsData || [];
        }

        setLessonsByModule(lessonsMap);

        // Set lessons for the first module and select first lesson
        const firstModule = modulesData[0];
        const firstModuleLessons = lessonsMap[firstModule.id] || [];
        setLessons(firstModuleLessons);

        if (firstModuleLessons.length > 0) {
          setCurrentLesson(firstModuleLessons[0]);
        }
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = async (module: Module) => {
    setLoading(true);

    // Use cached lessons if available, otherwise fetch
    let moduleLessons = lessonsByModule[module.id];
    if (!moduleLessons) {
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", module.id)
        .order("order_index");

      moduleLessons = lessonsData || [];
      setLessonsByModule(prev => ({ ...prev, [module.id]: moduleLessons }));
    }

    setLessons(moduleLessons);
    setCurrentLesson(moduleLessons.length > 0 ? moduleLessons[0] : null);
    setLoading(false);
  };

  const handleLessonChange = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleEnroll = async () => {
    if (!courseId) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          student_id: user.id,
          course_id: courseId
        });

      if (error) {
        console.error("Error enrolling:", error);
      } else {
        setEnrolled(true);
      }
    } catch (error) {
      console.error("Error enrolling:", error);
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

  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Curso não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Course Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
          </div>
          
          {!enrolled && (
            <Button onClick={handleEnroll} className="gap-2">
              <Play className="h-4 w-4" />
              Matricular-se
            </Button>
          )}
        </div>

        {!enrolled ? (
          <div className="text-center py-12 bg-card rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Matricule-se para acessar este curso</h2>
            <p className="text-muted-foreground mb-6">
              Clique no botão "Matricular-se" acima para começar a aprender
            </p>
            <Button onClick={handleEnroll} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Matricular-se Agora
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Modules and Lessons */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Módulos</h3>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div key={module.id} className="space-y-2">
                      <div className="font-medium text-sm text-muted-foreground">
                        Módulo {module.order_index + 1}
                      </div>
                      <div 
                        className="p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleModuleChange(module)}
                      >
                        <div className="font-medium">{module.title}</div>
                        {module.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {module.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Lessons for this module */}
                      {lessonsByModule[module.id] && lessonsByModule[module.id].length > 0 && (
                        <div className="ml-4 space-y-1">
                          {lessonsByModule[module.id].map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                currentLesson?.id === lesson.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => handleLessonChange(lesson)}
                            >
                              <div className="flex items-center gap-2">
                                <Play className="h-3 w-3" />
                                <span className="text-sm">{lesson.title}</span>
                                {lesson.duration && (
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - Video Player */}
            <div className="lg:col-span-3">
              {currentLesson ? (
                <div className="space-y-6">
                  {/* Video Player */}
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    {currentLesson.video_url ? (
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${currentLesson.video_url}`}
                        title={currentLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Play className="h-16 w-16 mx-auto mb-4" />
                        <p>Conteúdo de vídeo não disponível</p>
                        <p className="text-sm mt-2">
                          {currentLesson.content || "Esta lição não possui conteúdo de vídeo."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Lesson Content */}
                  <div className="bg-card rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
                    {currentLesson.content && (
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{currentLesson.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg">
                  <p className="text-muted-foreground">
                    Nenhuma lição disponível neste módulo
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoursePlayer;