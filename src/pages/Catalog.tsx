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

const Catalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Load all courses
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (coursesError) {
      toast.error("Erro ao carregar cursos");
    } else {
      setCourses(coursesData || []);
    }

    // Load enrolled courses
    if (user) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      setEnrolledCourseIds(enrollments?.map(e => e.course_id) || []);
    }

    setLoading(false);
  };

  const handleCourseClick = async (courseId: string) => {
    const isEnrolled = enrolledCourseIds.includes(courseId);
    
    if (isEnrolled) {
      toast.info("Você já está matriculado neste curso!");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase.from("enrollments").insert({
      student_id: user.id,
      course_id: courseId,
    });

    if (error) {
      toast.error("Erro ao matricular no curso");
    } else {
      toast.success("Matrícula realizada com sucesso!");
      loadCourses();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Catálogo de Cursos</h1>
          <p className="text-muted-foreground">Explore e matricule-se nos cursos disponíveis</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground">Nenhum curso disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, index) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              
              return (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  moduleNumber={String(index + 1).padStart(2, '0')}
                  thumbnailUrl={course.thumbnail_url}
                  locked={!isEnrolled}
                  progress={isEnrolled ? Math.floor(Math.random() * 100) : 0}
                  courseId={course.id}
                  onClick={() => handleCourseClick(course.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Catalog;
