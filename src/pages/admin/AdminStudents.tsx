import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Student {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");

    if (rolesError) {
      toast.error("Erro ao carregar alunos");
      setLoading(false);
      return;
    }

    const studentIds = userRoles?.map(r => r.user_id) || [];

    if (studentIds.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", studentIds)
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast.error("Erro ao carregar perfis");
    } else {
      setStudents(profiles || []);
    }
    
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Alunos</h1>
          <p className="text-muted-foreground">Lista de alunos cadastrados na plataforma</p>
        </div>

        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum aluno cadastrado ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.full_name || "Não informado"}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {new Date(student.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
