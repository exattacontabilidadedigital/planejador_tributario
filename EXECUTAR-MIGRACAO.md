# 🔗 Executar Migração de Compartilhamento

## ⚡ Passo a Passo Rápido

### 1️⃣ Copiar SQL
O SQL já foi copiado para sua área de transferência automaticamente!

### 2️⃣ Executar no Supabase

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto:** `planejador_tributario`
3. **Clique em:** SQL Editor (menu lateral esquerdo)
4. **Clique em:** New Query
5. **Cole:** Ctrl+V (ou Cmd+V no Mac)
6. **Execute:** Clique no botão "RUN" ▶️

### 3️⃣ Verificar

Após executar, você verá mensagens de sucesso no SQL Editor.

### 4️⃣ Testar

1. Recarregue a aplicação (F5)
2. Abra um relatório comparativo
3. Clique em "Compartilhar Relatório"
4. Link público será gerado! 🎉

---

## 📦 O que será criado?

- ✅ Coluna `token_compartilhamento` (VARCHAR 64)
- ✅ Coluna `token_expira_em` (TIMESTAMP)
- ✅ Coluna `visualizacoes_publicas` (INTEGER)
- ✅ Função `gerar_token_compartilhamento()`
- ✅ Função `ativar_compartilhamento_publico()`
- ✅ Função `desativar_compartilhamento_publico()`
- ✅ Função `buscar_comparativo_publico()`
- ✅ Política RLS para acesso público

---

## ❓ Problemas?

Se encontrar erros:

1. Verifique se você tem permissões de admin no Supabase
2. Certifique-se de estar no projeto correto
3. O SQL usa `IF NOT EXISTS`, então é seguro executar múltiplas vezes

---

## 📄 Arquivo SQL

Localização: `supabase/migrations/add_compartilhamento_publico.sql`

Se precisar copiar novamente:
```powershell
Get-Content supabase\migrations\add_compartilhamento_publico.sql | Set-Clipboard
```

---

**Tempo estimado:** 2 minutos ⏱️
1