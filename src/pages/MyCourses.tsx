import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
}

const MyCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Get enrolled course IDs
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", user.id);

    if (enrollError) {
      toast.error("Erro ao carregar cursos");
      setLoading(false);
      return;
    }

    const courseIds = enrollments?.map(e => e.course_id) || [];

    if (courseIds.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    // Get courses details
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .in("id", courseIds);

    if (coursesError) {
      toast.error("Erro ao carregar cursos");
    } else {
      setCourses(coursesData || []);
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meus Cursos</h1>
          <p className="text-muted-foreground">Cursos em que você está matriculado</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground mb-4">
              Você ainda não está matriculado em nenhum curso
            </p>
            <p className="text-sm text-muted-foreground">
              Explore o catálogo para encontrar cursos interessantes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                title={course.title}
                moduleNumber={String(index + 1).padStart(2, '0')}
                thumbnailUrl={course.thumbnail_url}
                progress={Math.floor(Math.random() * 100)} // Mock progress
                courseId={course.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
