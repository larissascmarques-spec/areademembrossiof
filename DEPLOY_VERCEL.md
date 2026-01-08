# 🚀 Deploy no Vercel - Passo a Passo

## Opção 1: Deploy via Interface Web (Mais Fácil - Recomendado)

### Passo 1: Preparar o Projeto

1. Certifique-se de que o projeto está funcionando localmente:
```bash
npm install
npm run build
```

### Passo 2: Criar Conta no Vercel

1. Acesse: https://vercel.com/
2. Clique em **Sign Up**
3. Faça login com GitHub, GitLab, Bitbucket ou email

### Passo 3: Fazer Upload do Projeto

**Opção A: Via GitHub (Recomendado)**

1. Crie um repositório no GitHub:
   - Acesse: https://github.com/new
   - Crie um novo repositório
   - Faça upload dos arquivos do projeto

2. No Vercel:
   - Clique em **Add New Project**
   - Conecte seu repositório GitHub
   - Selecione o repositório do projeto
   - Clique em **Import**

**Opção B: Via CLI do Vercel (Sem GitHub)**

1. Instale a CLI do Vercel:
```bash
npm install -g vercel
```

2. No diretório do projeto, execute:
```bash
vercel login
vercel
```

3. Siga as instruções:
   - Set up and deploy? **Y**
   - Which scope? (selecione sua conta)
   - Link to existing project? **N**
   - What's your project's name? (deixe o padrão ou escolha um nome)
   - In which directory is your code located? **./** (pressione Enter)
   - Want to override the settings? **N**

### Passo 4: Configurar Variáveis de Ambiente

1. No dashboard do Vercel, vá em **Settings** > **Environment Variables**
2. Adicione as variáveis:
   - `VITE_SUPABASE_URL` = URL do seu projeto Supabase
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Chave pública do Supabase

3. Clique em **Save**

### Passo 5: Fazer Deploy

1. Vá em **Deployments**
2. Clique em **Redeploy** (se necessário)
3. Aguarde o build completar

### Passo 6: Configurar Domínio Personalizado

1. No projeto no Vercel, vá em **Settings** > **Domains**
2. Digite seu domínio (ex: `seusite.com.br`)
3. Clique em **Add**
4. O Vercel mostrará os registros DNS necessários

5. Configure na Hostinger:
   - Acesse o painel da Hostinger
   - Vá em **DNS** ou **Gerenciar DNS**
   - Adicione os registros que o Vercel forneceu:
     - Tipo: **CNAME** ou **A**
     - Nome: `@` ou `www`
     - Valor: O que o Vercel indicar

6. Aguarde a propagação DNS (pode levar até 24h, geralmente 1-2h)

---

## Opção 2: Deploy via CLI (Linha de Comando)

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Fazer Login

```bash
vercel login
```

### Passo 3: Deploy

```bash
# No diretório do projeto
vercel

# Para produção
vercel --prod
```

### Passo 4: Configurar Variáveis de Ambiente

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
```

---

## 📋 Checklist de Deploy

- [ ] Projeto builda sem erros (`npm run build`)
- [ ] Conta criada no Vercel
- [ ] Projeto conectado ao Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Domínio configurado
- [ ] DNS apontado corretamente
- [ ] Site acessível no domínio

---

## 🔧 Configurações Importantes

### Arquivo vercel.json

O arquivo `vercel.json` já está configurado com:
- Build command: `npm run build`
- Output directory: `dist`
- Rewrites para SPA (Single Page Application)

### Variáveis de Ambiente Necessárias

Certifique-se de configurar no Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 🐛 Troubleshooting

### Erro no Build

1. Verifique os logs no Vercel
2. Teste localmente: `npm run build`
3. Verifique se todas as dependências estão no `package.json`

### Domínio não funciona

1. Verifique se os registros DNS estão corretos
2. Aguarde a propagação DNS (pode levar até 24h)
3. Use ferramentas como https://dnschecker.org/ para verificar

### Variáveis de ambiente não funcionam

1. Certifique-se de que começam com `VITE_`
2. Faça um novo deploy após adicionar variáveis
3. Verifique se estão configuradas para Production

---

## 📞 Suporte

- Documentação Vercel: https://vercel.com/docs
- Comunidade: https://github.com/vercel/vercel/discussions
