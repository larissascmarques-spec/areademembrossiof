# Passo a Passo: Integração Hotmart com Área de Membros

Este documento descreve como integrar a plataforma de área de membros com a Hotmart para validar compras e conceder acesso automático aos usuários.

## 📋 Visão Geral

A integração permite que:
- Usuários que compraram na Hotmart tenham acesso automático à área de membros
- O sistema valide se o email possui uma compra ativa na Hotmart
- O acesso seja concedido apenas para compradores válidos

## 🔧 Opções de Integração

### Opção 1: Supabase Edge Functions + Webhook Hotmart (Recomendado para este projeto)

Como este projeto usa Supabase, a melhor opção é criar uma Edge Function para receber os webhooks da Hotmart.

#### Passo 1: Criar Supabase Edge Function

1. Instale a CLI do Supabase (se ainda não tiver):
```bash
npm install -g supabase
```

2. Faça login no Supabase:
```bash
supabase login
```

3. Inicialize as Edge Functions (se ainda não tiver):
```bash
supabase functions new hotmart-webhook
```

4. Crie o arquivo da função em `supabase/functions/hotmart-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-hottok',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validar assinatura do webhook
    const signature = req.headers.get('x-hotmart-hottok')
    const expectedSignature = Deno.env.get('HOTMART_WEBHOOK_TOKEN')
    
    if (signature !== expectedSignature) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Processar dados do webhook
    const webhookData = await req.json()
    const { event, data: purchaseData } = webhookData

    // 3. Inicializar cliente Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event === 'PURCHASE_APPROVED') {
      const { buyer: { email, name }, product: { id: productId, name: productName } } = purchaseData
      
      // 4. Verificar se já existe registro
      const { data: existingPurchase } = await supabaseAdmin
        .from('member_purchases')
        .select('*')
        .eq('email', email)
        .eq('hotmart_product_id', productId)
        .eq('purchase_status', 'approved')
        .single()

      if (existingPurchase) {
        // Já processado, retornar sucesso
        return new Response(
          JSON.stringify({ message: 'Purchase already processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 5. Criar registro de compra
      const { error: purchaseError } = await supabaseAdmin
        .from('member_purchases')
        .insert({
          email: email,
          hotmart_product_id: productId,
          hotmart_transaction_id: purchaseData.transaction?.id,
          purchase_status: 'approved',
          purchase_date: new Date().toISOString(),
        })

      if (purchaseError) {
        throw purchaseError
      }

      // 6. Verificar se usuário já existe
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)

      if (!existingUser?.user) {
        // Criar usuário automaticamente (sem senha - ele criará no primeiro login)
        // Nota: O usuário precisará usar "Esqueci minha senha" no primeiro acesso
        const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            hotmart_product_id: productId,
            hotmart_purchase_date: new Date().toISOString(),
          }
        })

        if (userError) {
          console.error('Error creating user:', userError)
        }
      }

      return new Response(
        JSON.stringify({ message: 'Purchase processed successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (event === 'PURCHASE_REFUNDED' || event === 'PURCHASE_CANCELLED') {
      const { buyer: { email }, product: { id: productId } } = purchaseData

      // Atualizar status da compra
      await supabaseAdmin
        .from('member_purchases')
        .update({ purchase_status: event === 'PURCHASE_REFUNDED' ? 'refunded' : 'cancelled' })
        .eq('email', email)
        .eq('hotmart_product_id', productId)

      return new Response(
        JSON.stringify({ message: 'Purchase status updated' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Event not handled' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

5. Faça deploy da função:
```bash
supabase functions deploy hotmart-webhook
```

6. Obtenha a URL da função:
```bash
supabase functions list
```
A URL será algo como: `https://seu-projeto.supabase.co/functions/v1/hotmart-webhook`

#### Passo 2: Configurar Webhook na Hotmart

1. Acesse o painel da Hotmart: https://app.hotmart.com/
2. Vá em **Configurações** > **Integrações** > **Webhooks**
3. Clique em **Criar Webhook**
4. Configure:
   - **URL do Webhook**: `https://seu-projeto.supabase.co/functions/v1/hotmart-webhook`
   - **Eventos**: Selecione:
     - `PURCHASE_APPROVED` (Compra aprovada)
     - `PURCHASE_REFUNDED` (Reembolso)
     - `PURCHASE_CANCELLED` (Compra cancelada)
   - **Método**: POST
5. Salve o webhook e copie o **Token de Segurança**

#### Passo 3: Configurar Variáveis de Ambiente no Supabase

1. Acesse o dashboard do Supabase: https://app.supabase.com/
2. Vá em **Project Settings** > **Edge Functions** > **Secrets**
3. Adicione as seguintes variáveis:
   - `HOTMART_WEBHOOK_TOKEN`: Token copiado da Hotmart
   - `SUPABASE_URL`: URL do seu projeto (já deve estar configurada)
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key do seu projeto

#### Passo 4: Criar Tabela no Supabase

Execute esta migration no Supabase SQL Editor:

```sql
-- Criar tabela para armazenar compras da Hotmart
CREATE TABLE IF NOT EXISTS public.member_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  hotmart_product_id TEXT NOT NULL,
  hotmart_transaction_id TEXT,
  purchase_status TEXT NOT NULL CHECK (purchase_status IN ('approved', 'refunded', 'cancelled')),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_member_purchases_email ON public.member_purchases(email);

-- Criar índice para busca por produto
CREATE INDEX IF NOT EXISTS idx_member_purchases_product ON public.member_purchases(hotmart_product_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.member_purchases ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias compras
CREATE POLICY "Users can view their own purchases"
  ON public.member_purchases
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = member_purchases.email
  ));
```

#### Passo 5: Modificar Função de Login

Atualize o arquivo `src/pages/Auth.tsx` para validar compras:

```typescript
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (authError) {
      // Se não existir conta, informar para usar "Esqueci minha senha"
      if (authError.message.includes('Invalid login credentials')) {
        toast.error("Conta não encontrada. Use 'Esqueci minha senha' para criar sua senha.");
      } else {
        throw authError;
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
```

---

### Opção 2: Webhook da Hotmart com Servidor Separado

A Hotmart envia notificações em tempo real quando uma compra é aprovada.

#### Passo 1: Configurar Webhook na Hotmart

1. Acesse o painel da Hotmart: https://app.hotmart.com/
2. Vá em **Configurações** > **Integrações** > **Webhooks**
3. Clique em **Criar Webhook**
4. Configure:
   - **URL do Webhook**: `https://seu-dominio.com/api/hotmart/webhook`
   - **Eventos**: Selecione:
     - `PURCHASE_APPROVED` (Compra aprovada)
     - `PURCHASE_REFUNDED` (Reembolso)
     - `PURCHASE_CANCELLED` (Compra cancelada)
   - **Método**: POST
5. Salve o webhook e copie o **Token de Segurança**

#### Passo 2: Criar Endpoint de Webhook no Backend

Crie um endpoint seguro para receber as notificações da Hotmart:

```typescript
// Exemplo: src/api/hotmart/webhook.ts
import { supabase } from '@/integrations/supabase/client';

export async function handleHotmartWebhook(req: Request) {
  // 1. Validar assinatura do webhook
  const signature = req.headers.get('x-hotmart-hottok');
  const expectedSignature = process.env.HOTMART_WEBHOOK_TOKEN;
  
  if (signature !== expectedSignature) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Processar dados do webhook
  const data = await req.json();
  const { event, data: purchaseData } = data;

  if (event === 'PURCHASE_APPROVED') {
    const { buyer: { email }, product: { id: productId } } = purchaseData;
    
    // 3. Criar ou atualizar usuário no Supabase
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        hotmart_product_id: productId,
        hotmart_purchase_date: new Date().toISOString(),
      }
    });

    // 4. Adicionar registro de compra na tabela de membros
    await supabase
      .from('member_purchases')
      .upsert({
        email: email,
        hotmart_product_id: productId,
        purchase_status: 'approved',
        purchase_date: new Date().toISOString(),
      });
  }

  return new Response('OK', { status: 200 });
}
```

#### Passo 3: Criar Tabela no Supabase

Execute esta migration no Supabase:

```sql
-- Criar tabela para armazenar compras da Hotmart
CREATE TABLE IF NOT EXISTS member_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  hotmart_product_id TEXT NOT NULL,
  hotmart_transaction_id TEXT,
  purchase_status TEXT NOT NULL, -- 'approved', 'refunded', 'cancelled'
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_member_purchases_email ON member_purchases(email);

-- Criar índice para busca por produto
CREATE INDEX IF NOT EXISTS idx_member_purchases_product ON member_purchases(hotmart_product_id);
```

#### Passo 4: Validar Acesso no Login

Modifique a função de login para verificar se o email possui compra ativa:

```typescript
// src/pages/Auth.tsx - handleLogin
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
      .single();

    if (purchaseError || !purchase) {
      toast.error("Email não encontrado. Use o mesmo email da compra na Hotmart.");
      setIsLoading(false);
      return;
    }

    // 2. Tentar fazer login (ou criar conta se não existir)
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    // Se não existir conta, criar automaticamente
    if (authError && authError.message.includes('Invalid login credentials')) {
      // Criar conta automaticamente
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password: loginPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;
      authData = newUser;
    }

    if (authError && !authError.message.includes('Invalid login credentials')) {
      throw authError;
    }

    toast.success("Login realizado com sucesso!");
    navigate("/dashboard");
  } catch (error: any) {
    toast.error(error.message || "Erro ao fazer login");
  } finally {
    setIsLoading(false);
  }
};
```

---

### Opção 2: API da Hotmart (Consulta Manual)

Se preferir validar manualmente ao invés de usar webhooks:

#### Passo 1: Obter Credenciais da API Hotmart

1. Acesse: https://developers.hotmart.com/
2. Crie uma aplicação
3. Obtenha:
   - **Client ID**
   - **Client Secret**
   - **Basic Auth Token**

#### Passo 2: Criar Função de Validação

```typescript
// src/lib/hotmart.ts
export async function validateHotmartPurchase(email: string) {
  const response = await fetch('https://api.hotmart.com/payments/api/v1/sales', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${process.env.HOTMART_BASIC_AUTH}`,
      'Content-Type': 'application/json',
    },
    // Adicionar filtros por email e status
  });

  const data = await response.json();
  return data.items.some((sale: any) => 
    sale.buyer.email === email && 
    sale.status === 'APPROVED'
  );
}
```

---

### Opção 3: Integração via Zapier/Make (No-Code)

Para uma solução sem código:

1. **Criar Zap no Zapier:**
   - Trigger: Hotmart - New Sale
   - Action: Webhook - POST para sua API
   - Enviar dados: email, produto, status

2. **Configurar Webhook no seu backend** para receber do Zapier

---

## 🔐 Variáveis de Ambiente Necessárias

Adicione no arquivo `.env`:

```env
# Hotmart Webhook
HOTMART_WEBHOOK_TOKEN=seu_token_aqui

# Hotmart API (se usar Opção 2)
HOTMART_CLIENT_ID=seu_client_id
HOTMART_CLIENT_SECRET=seu_client_secret
HOTMART_BASIC_AUTH=seu_basic_auth_token
```

---

## 📝 Checklist de Implementação

- [ ] Configurar webhook na Hotmart
- [ ] Criar endpoint de webhook no backend
- [ ] Criar tabela `member_purchases` no Supabase
- [ ] Modificar função de login para validar compra
- [ ] Adicionar variáveis de ambiente
- [ ] Testar com compra real
- [ ] Implementar tratamento de reembolsos/cancelamentos
- [ ] Adicionar logs para debug

---

## 🧪 Testes

### Teste Manual:

1. Faça uma compra de teste na Hotmart
2. Verifique se o webhook foi recebido
3. Confirme que o registro foi criado no Supabase
4. Tente fazer login com o email da compra
5. Verifique se o acesso foi concedido

### Webhook de Teste:

Use a ferramenta de teste da Hotmart ou envie uma requisição manual:

```bash
curl -X POST https://seu-dominio.com/api/hotmart/webhook \
  -H "Content-Type: application/json" \
  -H "x-hotmart-hottok: seu_token" \
  -d '{
    "event": "PURCHASE_APPROVED",
    "data": {
      "buyer": {
        "email": "teste@email.com"
      },
      "product": {
        "id": "123456"
      }
    }
  }'
```

---

## 🚨 Tratamento de Erros

Implemente tratamento para:
- Webhook duplicado (idempotência)
- Falha na criação de usuário
- Email já cadastrado
- Compra reembolsada (remover acesso)
- Compra cancelada (remover acesso)

---

## 📚 Recursos Adicionais

- [Documentação Hotmart Webhooks](https://developers.hotmart.com/docs/pt-BR/webhooks/)
- [API Hotmart](https://developers.hotmart.com/docs/pt-BR/api/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 💡 Dicas

1. **Sempre valide a assinatura do webhook** para segurança
2. **Use idempotência** para evitar processar o mesmo evento duas vezes
3. **Implemente logs** para facilitar debug
4. **Teste em ambiente de desenvolvimento** antes de produção
5. **Monitore reembolsos** para remover acesso automaticamente
