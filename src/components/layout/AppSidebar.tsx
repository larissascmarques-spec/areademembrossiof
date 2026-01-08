import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
  Library,
  Home,
  UserCircle,
  Settings,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || "Usuário");
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles && roles.some(r => r.role === "admin")) {
        setIsAdmin(true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
      : "hover:bg-accent hover:text-accent-foreground";

  const studentItems = [
    { title: "Início", url: "/dashboard", icon: Home },
    { title: "Minha Conta", url: "/my-courses", icon: UserCircle },
    { title: "Todos os Módulos", url: "/catalog", icon: Library },
    { title: "Materiais de Apoio", url: "/materiais", icon: FileText },
  ];

  const adminItems = [
    { title: "Dashboard Admin", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Gerenciar Cursos", url: "/admin/courses", icon: GraduationCap },
    { title: "Alunos", url: "/admin/students", icon: Users },
    { title: "Materiais de Apoio", url: "/admin/support-materials", icon: FileText },
    { title: "Configurar Dashboard", url: "/admin/dashboard-settings", icon: Settings },
  ];

  const adminStudentItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Meus Cursos", url: "/my-courses", icon: UserCircle },
    { title: "Catálogo", url: "/catalog", icon: Library },
    { title: "Materiais", url: "/materiais", icon: FileText },
  ];

  const items = isAdmin ? [...adminItems, ...adminStudentItems] : studentItems;

  const calculateProgress = () => {
    // Mock progress calculation - replace with real data
    return 65;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              A
            </div>
            <div className="text-center w-full">
              <h2 className="font-bold text-base text-foreground">Automa Cursos</h2>
              <div className="mt-3 w-full">
                <div className="w-full bg-muted rounded-full h-2 mb-1">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all" 
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Seu progresso</p>
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              A
            </div>
          </div>
        )}
      </div>

      <SidebarContent className="px-3 py-4">
        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="relative">
                        <NavLink to={item.url} className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                            isActive
                              ? "text-foreground font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r"
                              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                          }`
                        }>
                          <item.icon className="h-5 w-5" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Visão do Aluno
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminStudentItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="relative">
                        <NavLink to={item.url} className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                            isActive
                              ? "text-foreground font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r"
                              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                          }`
                        }>
                          <item.icon className="h-5 w-5" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="relative">
                      <NavLink to={item.url} className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                          isActive
                            ? "text-foreground font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r"
                            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                        }`
                      }>
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed && (
            <>
              <div className="mb-4 space-y-2">
                <a href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Suporte para Alunos
                </a>
                <a href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </a>
                <a href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Políticas de Privacidade
                </a>
              </div>
              <Separator className="mb-3 bg-sidebar-border" />
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? "Administrador" : "Aluno"}</p>
              </div>
            </>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
