# 🔧 Correção: Link de Compartilhamento "Acesso Negado"

## 📋 Diagnóstico

**Problema identificado:** A função RPC `buscar_comparativo_publico` no banco de dados tem incompatibilidade de tipos de retorno.

**Erro:** `structure of query does not match function result type`

**Causa:** A função foi criada com tipos `VARCHAR` mas o código espera `TEXT`.

## ✅ Verificação Realizada

```bash
✅ Colunas de compartilhamento existem
✅ RLS policy permite acesso anônimo
✅ 2 comparativos compartilhados encontrados
❌ Função buscar_comparativo_publico tem erro de tipo
```

## 🛠️ Solução

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. **Acesse o SQL Editor:**
   - URL: https://supabase.com/dashboard/project/_/sql
   - Ou navegue: Dashboard → Project → SQL Editor

2. **Execute o SQL de correção:**
   - Arquivo: `supabase/migrations/fix-buscar-comparativo-publico.sql`
   - Copie todo o conteúdo e cole no editor
   - Clique em **"Run"**

3. **Verifique o sucesso:**
   - Deve mostrar "Success. No rows returned"
   - A função será recriada com os tipos corretos

### Opção 2: Via Supabase CLI (se instalado)

```bash
# Aplicar todas as migrações pendentes
supabase db push

# Ou aplicar apenas a correção específica
supabase db execute -f supabase/migrations/fix-buscar-comparativo-publico.sql
```

### Opção 3: Fallback Automático (JÁ IMPLEMENTADO)

Se a função RPC não funcionar, o código automaticamente usa um método alternativo (SELECT direto).

**Vantagem:** Funciona sem precisar corrigir a função  
**Desvantagem:** Não incrementa o contador de visualizações de forma atômica

## 🔍 Detalhes Técnicos

### O que foi corrigido:

**ANTES:**
```sql
CREATE FUNCTION buscar_comparativo_publico(p_token VARCHAR)
RETURNS TABLE (
    id UUID,
    nome VARCHAR,  -- ❌ VARCHAR
    descricao TEXT,
    tipo VARCHAR,  -- ❌ VARCHAR
    ...
    empresa_nome VARCHAR  -- ❌ VARCHAR
)
```

**DEPOIS:**
```sql
CREATE FUNCTION buscar_comparativo_publico(p_token TEXT)
RETURNS TABLE (
    id UUID,
    nome TEXT,  -- ✅ TEXT
    descricao TEXT,
    tipo TEXT,  -- ✅ TEXT
    ...
    empresa_nome TEXT  -- ✅ TEXT
)
```

### Mudanças adicionais:

1. **Nome da empresa corrigido:**
   ```sql
   -- Tenta nome_fantasia, depois razao_social, depois nome
   COALESCE(e.nome_fantasia, e.razao_social, e.nome)::TEXT as empresa_nome
   ```

2. **Cast explícito para TEXT:**
   ```sql
   c.nome::TEXT,
   c.descricao::TEXT,
   c.tipo::TEXT
   ```

## 🧪 Como Testar Após Correção

Execute novamente o script de verificação:

```bash
node verificar-compartilhamento.js
```

**Resultado esperado:**
```
✅ Função buscar_comparativo_publico existe e responde
   Resultado (deve ser vazio): []
```

## 📱 Testando o Link de Compartilhamento

1. **Ative o compartilhamento** (já feito):
   - Vá para o comparativo
   - Clique em "Compartilhar Relatório"
   - Clique em "Ativar Compartilhamento Público"

2. **Copie o link gerado**

3. **Abra em uma aba anônima** (Ctrl+Shift+N no Chrome)

4. **Resultado esperado:**
   - ✅ Página carrega normalmente
   - ✅ Mostra dados do comparativo
   - ✅ Badge "Relatório Compartilhado" visível
   - ✅ Sem necessidade de login

## 🔐 Segurança

O sistema de compartilhamento implementa:

- ✅ **Tokens únicos de 32 caracteres**
- ✅ **Expiração após 30 dias** (configurável)
- ✅ **RLS policy** permite apenas comparativos marcados como `compartilhado=true`
- ✅ **Validação de expiração** no banco de dados
- ✅ **Contador de visualizações** para analytics
- ✅ **Acesso somente leitura** (não permite edição)

## 📊 Monitoramento

Para ver estatísticas de compartilhamento:

```sql
SELECT 
  nome,
  compartilhado,
  token_expira_em,
  visualizacoes_publicas,
  created_at
FROM comparativos_analise
WHERE compartilhado = true
ORDER BY visualizacoes_publicas DESC;
```

## 🎯 Próximos Passos

Após aplicar a correção, o link de compartilhamento funcionará corretamente:

1. ✅ Execute o SQL de correção no Supabase Dashboard
2. ✅ Teste o link de compartilhamento em uma aba anônima
3. ✅ Verifique se a página carrega sem "Acesso Negado"
4. ✅ Confirme que os dados são exibidos corretamente

## ❓ Se Ainda Não Funcionar

Verifique:

1. **RPC function existe?**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'buscar_comparativo_publico';
   ```

2. **RLS está habilitado?**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'comparativos_analise';
   ```

3. **Policy existe?**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'comparativos_analise';
   ```

4. **Token está salvo?**
   ```sql
   SELECT id, nome, compartilhado, token_compartilhamento IS NOT NULL as tem_token
   FROM comparativos_analise
   WHERE compartilhado = true;
   ```

---

**Arquivos relacionados:**
- `supabase/migrations/fix-buscar-comparativo-publico.sql` - SQL de correção
- `verificar-compartilhamento.js` - Script de diagnóstico
- `aplicar-correcao-funcao.js` - Script helper
- `src/services/compartilhamento-service.ts` - Serviço com fallback automático
