# 🚀 Guia para Subir o Projeto no GitHub

## ✅ Status Atual

- ✅ Repositório Git inicializado
- ✅ `.gitignore` criado (node_modules excluído)
- ✅ 2 commits criados
- ✅ README.md completo adicionado

## 📝 Próximos Passos

### 1. **Criar Repositório no GitHub**

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `tax-planner-react` (ou outro nome)
   - **Description**: Sistema de Planejamento Tributário com DRE
   - **Public** ou **Private**: Escolha conforme preferir
   - ❌ **NÃO marque** "Initialize with README" (já temos um)
   - ❌ **NÃO adicione** .gitignore (já temos um)
   - ❌ **NÃO adicione** license (por enquanto)
3. Clique em **"Create repository"**

### 2. **Conectar Repositório Local ao GitHub**

Após criar o repositório, o GitHub mostrará comandos. Use estes:

```bash
# Adicionar o remote (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/tax-planner-react.git

# Renomear branch para main (opcional, GitHub usa 'main' agora)
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

### 3. **Comandos Completos no PowerShell**

Execute estes comandos em sequência:

```powershell
# 1. Adicionar remote (SUBSTITUA SEU_USUARIO!)
git remote add origin https://github.com/SEU_USUARIO/tax-planner-react.git

# 2. Verificar remote adicionado
git remote -v

# 3. Renomear branch master para main
git branch -M main

# 4. Fazer push inicial
git push -u origin main
```

### 4. **Exemplo Completo**

Se seu usuário do GitHub for `joaosilva`:

```bash
git remote add origin https://github.com/joaosilva/tax-planner-react.git
git branch -M main
git push -u origin main
```

## 🔐 Autenticação

Quando fizer o push, o GitHub pedirá autenticação:

### **Opção 1: Personal Access Token (Recomendado)**

1. Vá em: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: "Tax Planner Deploy"
4. Marque o escopo: `repo` (acesso completo ao repositório)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá uma vez!)
7. Ao fazer push, use:
   - Username: seu username do GitHub
   - Password: **cole o token aqui**

### **Opção 2: GitHub CLI**

```bash
# Instalar GitHub CLI
winget install GitHub.cli

# Fazer login
gh auth login

# Push normalmente
git push -u origin main
```

## 📦 Commits Criados

Você tem 2 commits prontos para enviar:

1. **`5208e96`**: feat: Planejador Tributário DRE - Sistema completo
   - 74 arquivos
   - ~20.000 linhas de código

2. **`1d64e83`**: docs: Adiciona README.md completo
   - 243 linhas de documentação

## 🎯 Próximos Passos Após o Push

Depois de enviar ao GitHub:

### 1. **Adicionar Licença**

Crie arquivo `LICENSE` na raiz:

```bash
# No GitHub, vá em Add file → Create new file
# Nome: LICENSE
# Escolha template: MIT License
```

### 2. **Configurar GitHub Pages (Opcional)**

Se quiser hospedar online:

1. GitHub → Settings → Pages
2. Source: GitHub Actions
3. Selecione: Next.js

### 3. **Adicionar Badges ao README**

```markdown
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
```

### 4. **Proteger a Branch Main**

GitHub → Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require pull request before merging

## 🔄 Comandos Git Futuros

Após fazer mudanças:

```bash
# Ver status
git status

# Adicionar mudanças
git add .

# Fazer commit
git commit -m "feat: Adiciona nova funcionalidade"

# Enviar para GitHub
git push
```

## ❌ Problemas Comuns

### **Erro: remote origin already exists**

```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/tax-planner-react.git
```

### **Erro: Authentication failed**

Use Personal Access Token (PAT) em vez da senha.

### **Erro: Large files**

Verifique se `.gitignore` está correto e `node_modules` não está sendo enviado.

## ✅ Checklist Final

Antes de fazer push:

- [ ] Repositório criado no GitHub
- [ ] Remote adicionado (`git remote -v`)
- [ ] README.md revisado
- [ ] .gitignore correto
- [ ] Token de acesso criado (se necessário)

## 🎉 Pronto!

Após o push bem-sucedido, seu projeto estará disponível em:
```
https://github.com/SEU_USUARIO/tax-planner-react
```

---

**Dúvidas?**
- Documentação Git: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com
