import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6 shadow-glow">
          <GraduationCap className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Plataforma de Cursos Online
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Aprenda no seu ritmo, desenvolva novas habilidades e alcance seus objetivos profissionais
        </p>

        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg">
            Começar Agora
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
            Fazer Login
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Cursos Variados</h3>
            <p className="text-muted-foreground">
              Acesse uma ampla variedade de cursos em diferentes áreas do conhecimento
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Aprenda com Especialistas</h3>
            <p className="text-muted-foreground">
              Conteúdo desenvolvido por profissionais experientes do mercado
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Certificados</h3>
            <p className="text-muted-foreground">
              Receba certificados ao concluir os cursos e destaque-se no mercado
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary rounded-2xl p-12 text-center shadow-glow">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de alunos que já estão transformando suas carreiras
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
            Criar Conta Grátis
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
