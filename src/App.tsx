import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import Catalog from "./pages/Catalog";
import CoursePlayer from "./pages/CoursePlayer";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminModules from "./pages/admin/AdminModules";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminDashboardSettings from "./pages/admin/AdminDashboardSettings";
import AdminSupportMaterials from "./pages/admin/AdminSupportMaterials";
import SupportMaterials from "./pages/SupportMaterials";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/courses/:courseId/modules" element={<AdminModules />} />
          <Route path="/admin/modules/:moduleId/lessons" element={<AdminLessons />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/dashboard-settings" element={<AdminDashboardSettings />} />
          <Route path="/admin/support-materials" element={<AdminSupportMaterials />} />
          <Route path="/materiais" element={<SupportMaterials />} />
          <Route path="/course/:courseId" element={<CoursePlayer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
