import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Target, FolderOpen } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Verificar se email possui compra ativa na Hotmart
      const { data: purchase, error: purchaseError } = await supabase
        .from('member_purchases')
        .select('*')
        .eq('email', loginEmail)
        .eq('purchase_status', 'approved')
        .maybeSingle();

      if (purchaseError) {
        console.error('Error checking purchase:', purchaseError);
      }

      if (!purchase) {
        toast.error("Email não encontrado. Use o mesmo email da compra na Hotmart.");
        setIsLoading(false);
        return;
      }

      // 2. Tentar fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // Se não existir conta, informar para usar "Esqueci minha senha"
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Conta não encontrada. Use 'Esqueci minha senha' para criar sua senha.");
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Verificar se email possui compra ativa na Hotmart
      const { data: purchase, error: purchaseError } = await supabase
        .from('member_purchases')
        .select('*')
        .eq('email', signupEmail)
        .eq('purchase_status', 'approved')
        .maybeSingle();

      if (purchaseError) {
        console.error('Error checking purchase:', purchaseError);
      }

      if (!purchase) {
        toast.error("Email não encontrado. Use o mesmo email da compra na Hotmart.");
        setIsLoading(false);
        return;
      }

      // 2. Criar conta
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: signupFullName,
          },
        },
      });

      if (error) throw error;

      toast.success("Conta criada com sucesso! Você já pode fazer login.");
      setSignupEmail("");
      setSignupPassword("");
      setSignupFullName("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Lado Esquerdo - Informações */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Plataforma de Organização Inteligente
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Organize finanças, rotina e decisões do dia a dia com sistemas simples e práticos
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sistemas Práticos</h3>
                  <p className="text-muted-foreground">
                    Acesse sistemas digitais de organização financeira, rotina e planejamento pessoal
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Métodos Simples e Aplicáveis</h3>
                  <p className="text-muted-foreground">
                    Conteúdo direto ao ponto, feito para a vida real e fácil de colocar em prática
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Tudo em um Só Lugar</h3>
                  <p className="text-muted-foreground">
                    Tenha seus sistemas, planners e materiais organizados em uma única plataforma
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <h3 className="font-semibold text-lg mb-2">Um jeito simples e inteligente de organizar sua vida</h3>
              <p className="text-muted-foreground mb-4">
                Junte-se a pessoas que já estão criando mais clareza, controle e consistência no dia a dia
              </p>
            </div>
          </div>

          {/* Lado Direito - Formulário de Login */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Acessar Agora</CardTitle>
                <CardDescription>Entre ou crie sua conta para continuar</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Fazer Login</TabsTrigger>
                    <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Acessar Agora"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Nome Completo</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome"
                          value={signupFullName}
                          onChange={(e) => setSignupFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Senha</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Criando conta..." : "Acessar Agora"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Use o mesmo email utilizado para realizar a compra na Hotmart
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
