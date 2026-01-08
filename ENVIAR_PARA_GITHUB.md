# 📤 Como Enviar Projeto para o GitHub

## Opção 1: Upload Manual (Mais Fácil - Sem Instalar Git)

### Passo 1: Criar Repositório no GitHub

1. Acesse: https://github.com/
2. Faça login (ou crie uma conta se não tiver)
3. Clique no botão **+** (canto superior direito) > **New repository**
4. Preencha:
   - **Repository name**: `course-forge-site` (ou outro nome)
   - **Description**: (opcional) Plataforma de Organização Inteligente
   - **Visibility**: Escolha **Public** ou **Private**
   - **NÃO marque** "Add a README file"
   - **NÃO marque** "Add .gitignore"
   - **NÃO marque** "Choose a license"
5. Clique em **Create repository**

### Passo 2: Fazer Upload dos Arquivos

1. No GitHub, você verá uma página com instruções
2. Role até a seção **"...or upload files"**
3. Clique em **uploading an existing file**
4. Arraste e solte TODOS os arquivos do projeto (exceto `node_modules` e `.git`)
5. Digite uma mensagem de commit: `Initial commit`
6. Clique em **Commit changes**

**⚠️ IMPORTANTE:** Não envie:
- Pasta `node_modules` (muito grande)
- Arquivo `.env` (se houver, contém informações sensíveis)
- Pasta `.git` (se existir)

---

## Opção 2: Usar Git (Mais Profissional)

### Passo 1: Instalar Git

1. Baixe o Git: https://git-scm.com/download/win
2. Instale com as opções padrão
3. Reinicie o terminal/PowerShell

### Passo 2: Configurar Git (Primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Passo 3: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Crie um novo repositório (mesmo processo da Opção 1)
3. **NÃO** marque nenhuma opção (README, .gitignore, license)

### Passo 4: Enviar Projeto

Abra o PowerShell no diretório do projeto e execute:

```bash
# 1. Inicializar repositório Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer primeiro commit
git commit -m "Initial commit"

# 4. Adicionar repositório remoto (substitua SEU_USUARIO e NOME_REPO)
git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git

# 5. Renomear branch para main (se necessário)
git branch -M main

# 6. Enviar para o GitHub
git push -u origin main
```

Você será solicitado a fazer login no GitHub.

---

## 📋 Checklist Antes de Enviar

- [ ] Remover pasta `node_modules` (não enviar)
- [ ] Verificar se há arquivo `.env` (não enviar se tiver dados sensíveis)
- [ ] Verificar se `.gitignore` está configurado corretamente
- [ ] Testar build localmente (`npm run build`)

---

## 🔒 Arquivos que NÃO devem ser enviados

Certifique-se de que o `.gitignore` inclui:
- `node_modules/`
- `.env`
- `dist/`
- `*.log`

---

## ✅ Após Enviar para o GitHub

1. O repositório estará disponível em: `https://github.com/SEU_USUARIO/NOME_REPO`
2. Agora você pode conectar no Vercel:
   - Vá em https://vercel.com
   - Clique em **Add New Project**
   - Conecte seu repositório GitHub
   - Selecione o repositório que acabou de criar
