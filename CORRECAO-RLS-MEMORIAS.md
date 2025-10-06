# 🔐 Correção: Políticas RLS Faltando nas Tabelas de Memórias

## ❌ Problema Identificado

O erro `❌ [ICMS] Erro ao inserir: {}` estava ocorrendo porque as tabelas de memórias de cálculo não tinham **políticas RLS (Row Level Security)** configuradas.

### Causa Raiz
```sql
-- As tabelas existem mas não têm políticas de acesso:
calculos_icms
calculos_pis_cofins
calculos_irpj_csll
```

Quando uma tabela tem RLS habilitado mas sem políticas, **TODAS as operações são bloqueadas** por padrão, mesmo para usuários autenticados.

---

## ✅ Solução

### 1️⃣ **Aplicar SQL no Supabase**

Acesse: **Supabase Dashboard → SQL Editor**

Execute o arquivo: `supabase/add-rls-policies-memorias.sql`

Ou copie e cole este SQL:

```sql
-- ===============================================
-- POLÍTICAS RLS PARA MEMÓRIAS DE CÁLCULO
-- ===============================================

-- CALCULOS_ICMS
ALTER TABLE calculos_icms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar calculos_icms"
  ON calculos_icms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir calculos_icms"
  ON calculos_icms FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar calculos_icms"
  ON calculos_icms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar calculos_icms"
  ON calculos_icms FOR DELETE TO authenticated USING (true);

-- CALCULOS_PIS_COFINS
ALTER TABLE calculos_pis_cofins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar calculos_pis_cofins"
  ON calculos_pis_cofins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir calculos_pis_cofins"
  ON calculos_pis_cofins FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar calculos_pis_cofins"
  ON calculos_pis_cofins FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar calculos_pis_cofins"
  ON calculos_pis_cofins FOR DELETE TO authenticated USING (true);

-- CALCULOS_IRPJ_CSLL
ALTER TABLE calculos_irpj_csll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar calculos_irpj_csll"
  ON calculos_irpj_csll FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir calculos_irpj_csll"
  ON calculos_irpj_csll FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar calculos_irpj_csll"
  ON calculos_irpj_csll FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar calculos_irpj_csll"
  ON calculos_irpj_csll FOR DELETE TO authenticated USING (true);
```

### 2️⃣ **Verificar se Funcionou**

Execute esta query para confirmar:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('calculos_icms', 'calculos_pis_cofins', 'calculos_irpj_csll')
ORDER BY tablename, policyname;
```

**Resultado esperado:** 12 políticas (4 por tabela: SELECT, INSERT, UPDATE, DELETE)

---

## 🧪 Teste Após Aplicar

1. **Recarregue a página** do cenário
2. **Edite a receita bruta** (ex: R$ 100.000 → R$ 150.000)
3. **Clique em "Salvar e Aprovar"**
4. **Verifique o console:**

Antes (com erro):
```
❌ [ICMS] Erro ao inserir: {}
```

Depois (com sucesso):
```
💾 [ICMS] Salvando para cenário: abc-123
📊 [ICMS] Memória recebida: { totalDebitos: 12500, ... }
📝 [ICMS] Dados preparados: 43 campos
🔍 [ICMS] Verificando se registro existe...
➕ [ICMS] Registro não existe, inserindo...
✅ [ICMS] Inserido com sucesso
✅ [PIS/COFINS] Inserido com sucesso
✅ [IRPJ/CSLL] Inserido com sucesso
✅ [MEMÓRIAS] Todas salvas com sucesso!
```

---

## 📊 Validação no Banco

Após salvar um cenário, verifique se os dados foram inseridos:

```sql
SELECT 
  c.nome AS cenario,
  ci.icms_a_pagar,
  cpc.pis_a_pagar,
  cpc.cofins_a_pagar,
  cic.total_irpj,
  cic.csll_valor
FROM cenarios c
LEFT JOIN calculos_icms ci ON ci.cenario_id = c.id
LEFT JOIN calculos_pis_cofins cpc ON cpc.cenario_id = c.id
LEFT JOIN calculos_irpj_csll cic ON cic.cenario_id = c.id
WHERE c.status = 'aprovado'
ORDER BY c.created_at DESC
LIMIT 5;
```

**Resultado esperado:** Valores preenchidos (não NULL)

---

## 🔍 Por Que Isso Aconteceu?

### Problema de Migração Incompleta

O arquivo `supabase/schema-completo.sql` criou as tabelas mas **não criou as políticas RLS**.

Quando RLS está habilitado sem políticas:
- ✅ `CREATE TABLE` funciona
- ✅ Conexão Supabase funciona
- ❌ `INSERT` é bloqueado silenciosamente
- ❌ `SELECT` retorna vazio
- ❌ Erro retornado: `{}`

### Solução Permanente

Adicione as políticas ao arquivo de schema principal:

```bash
# Adicionar ao final de supabase/schema-completo.sql
cat supabase/add-rls-policies-memorias.sql >> supabase/schema-completo.sql
```

Isso garante que futuros deploys/migrações já tenham as políticas.

---

## 📋 Checklist de Correção

- [ ] Aplicar SQL de políticas RLS no Supabase Dashboard
- [ ] Verificar criação com query `SELECT FROM pg_policies`
- [ ] Testar salvamento de cenário
- [ ] Confirmar logs de sucesso no console
- [ ] Validar dados no banco com query SQL
- [ ] Adicionar políticas ao schema-completo.sql (opcional)

---

## 🎯 Resultado Final

✅ **JSON `resultados`** atualizado corretamente  
✅ **Tabelas de memórias** populadas  
✅ **Logs detalhados** no console  
✅ **Sistema funcionando** completamente

---

**Arquivo criado:** `supabase/add-rls-policies-memorias.sql`  
**Documentação:** Este arquivo (CORRECAO-RLS-MEMORIAS.md)
