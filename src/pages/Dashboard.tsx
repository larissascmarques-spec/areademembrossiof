import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Course {
  id: string;
  title: string;
  thumbnail_url: string | null;
  description?: string | null;
  created_at?: string;
}

interface DashboardSettings {
  hero_image_url: string | null;
  hero_title: string;
  hero_paragraph1: string;
  hero_paragraph2: string;
  hero_paragraph3: string;
  hero_cta: string;
}

const Dashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<DashboardSettings>({
    hero_image_url: null,
    hero_title: 'Bem-vindo à sua jornada de aprendizado',
    hero_paragraph1: 'Desenvolva suas habilidades com cursos exclusivos e conteúdos práticos que vão transformar sua carreira profissional.',
    hero_paragraph2: 'Nossa plataforma oferece uma experiência de aprendizado imersiva, com vídeo-aulas de alta qualidade e material didático completo.',
    hero_paragraph3: 'Aprenda no seu ritmo, acompanhe seu progresso e conquiste seus objetivos com o apoio de especialistas da área.',
    hero_cta: 'Comece agora e transforme seu futuro!',
  });

  useEffect(() => {
    loadSettings();
    loadCourses();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('dashboard_settings')
        .select('*')
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadCourses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", user.id);

    const courseIds = enrollments?.map(e => e.course_id) || [];

    if (courseIds.length > 0) {
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds);
      
      setEnrolledCourses(coursesData || []);
    }

    // Get all courses
    const { data: allCoursesData } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    
    setAllCourses(allCoursesData || []);
    setLoading(false);
  };

  const filterCourses = (courses: Course[]) => {
    if (!searchQuery) return courses;
    
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const continueCourses = filterCourses(enrolledCourses);
  const newCourses = filterCourses(allCourses.slice(0, 8));
  const allFilteredCourses = filterCourses(allCourses);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-12">
        {/* Hero Banner */}
        <section className="px-8 lg:px-12 py-12 lg:py-16">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Text Column - 60% */}
            <div className="lg:col-span-3 space-y-6">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                {settings.hero_title}
              </h1>
              
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>{settings.hero_paragraph1}</p>
                <p>{settings.hero_paragraph2}</p>
                <p>{settings.hero_paragraph3}</p>
              </div>
              
              <p className="text-xl font-semibold text-primary pt-4">
                {settings.hero_cta}
              </p>
            </div>

            {/* Image Column - 40% */}
            <div className="lg:col-span-2">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img 
                  src={settings.hero_image_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop"}
                  alt="Instrutor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="px-8 lg:px-12 pb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar cursos e aulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-card border-muted"
            />
          </div>
        </section>

        {/* Course Sections with Carousels */}
        <div className="space-y-12">
          {/* Continue Watching Section */}
          {continueCourses.length > 0 && (
            <section className="px-8 lg:px-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Continuar assistindo</h2>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {continueCourses.map((course, index) => (
                    <CarouselItem key={course.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <div className="aspect-[2/3]">
                        <CourseCard
                          title={course.title}
                          moduleNumber={String(index + 1).padStart(2, '0')}
                          thumbnailUrl={course.thumbnail_url}
                          progress={Math.floor(Math.random() * 100)}
                          courseId={course.id}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </section>
          )}

          {/* New Courses Section */}
          {newCourses.length > 0 && (
            <section className="px-8 lg:px-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Novos cursos</h2>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {newCourses.map((course, index) => {
                    const isEnrolled = enrolledCourses.some(ec => ec.id === course.id);
                    return (
                      <CarouselItem key={course.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <div className="aspect-[2/3]">
                          <CourseCard
                            title={course.title}
                            moduleNumber={String(index + 1).padStart(2, '0')}
                            thumbnailUrl={course.thumbnail_url}
                            locked={!isEnrolled}
                            progress={isEnrolled ? Math.floor(Math.random() * 100) : 0}
                            courseId={course.id}
                          />
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </section>
          )}

          {/* All Courses Section */}
          {allFilteredCourses.length > 0 && (
            <section className="px-8 lg:px-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Todos os cursos</h2>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {allFilteredCourses.map((course, index) => {
                    const isEnrolled = enrolledCourses.some(ec => ec.id === course.id);
                    return (
                      <CarouselItem key={course.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <div className="aspect-[2/3]">
                          <CourseCard
                            title={course.title}
                            moduleNumber={String(index + 1).padStart(2, '0')}
                            thumbnailUrl={course.thumbnail_url}
                            locked={!isEnrolled}
                            progress={isEnrolled ? Math.floor(Math.random() * 100) : 0}
                            courseId={course.id}
                          />
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
