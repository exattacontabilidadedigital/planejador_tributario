# 🚀 Guia Completo - Supabase Setup

## ✅ Status Atual

- ✅ Projeto Supabase criado
- ✅ Credenciais configuradas no `.env.local`
- ✅ Clientes Supabase configurados
- ✅ Página de teste criada
- ✅ **Schema SQL COMPLETO criado** 
- ⏳ **PRÓXIMO**: Executar novo schema completo

---

## �️ **IMPORTANTE: Schema Expandido**

O schema anterior era muito básico. Agora temos um **schema completo** que contempla:

### 📋 **10 Tabelas Principais:**

1. **`empresas`** - Dados completos das empresas
2. **`cenarios`** - Cenários com períodos e configurações
3. **`comparativos`** - Comparação entre cenários
4. **`despesas_dinamicas`** - Despesas por cenário
5. **`calculos_icms`** - Memória de cálculo ICMS
6. **`calculos_pis_cofins`** - Memória de cálculo PIS/COFINS  
7. **`calculos_irpj_csll`** - Memória de cálculo IRPJ/CSLL
8. **`calculos_dre`** - Demonstração do Resultado (DRE)
9. **`relatorios_consolidados`** - Cache de relatórios
10. **`configuracoes_sistema`** - Configurações globais

### 🔧 **Recursos Avançados:**
- ✅ Índices otimizados para performance
- ✅ Triggers automáticos para updated_at
- ✅ Funções SQL para cálculos complexos
- ✅ Views para consultas otimizadas
- ✅ Validações e constraints
- ✅ Função de duplicação completa de cenários
- ✅ Suporte a JSONB para flexibilidade

---

## 📋 Executar Schema Completo

### 1. **SUBSTITUIR o schema anterior:**

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. **SQL Editor** → **New query**
4. Copie **TODO** o conteúdo de `supabase/schema-completo.sql`
5. Cole no editor
6. Execute com **Run** (F5)

### 2. **Validar criação das 10 tabelas:**

```sql
-- Verificar todas as tabelas criadas
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Deve retornar 10 tabelas:**
- calculos_dre
- calculos_icms  
- calculos_irpj_csll
- calculos_pis_cofins
- cenarios
- comparativos
- configuracoes_sistema
- despesas_dinamicas
- empresas
- relatorios_consolidados

### 3. **Testar funções criadas:**

```sql
-- Testar função de validação CNPJ
SELECT is_valid_cnpj('12.345.678/0001-90') as cnpj_valido;

-- Ver configurações inseridas
SELECT * FROM configuracoes_sistema;

-- Ver views criadas
SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public';
```

---

## 🎯 **Após Validação Completa**

Quando todas as 10 tabelas estiverem criadas:

1. ✅ **Schema completo validado**
2. 🚀 **Migrar stores** (empresas → cenarios → comparativos)
3. 📄 **Script de migração** localStorage → Supabase
4. 🧪 **Testes de integridade**

---

## 🆘 Troubleshooting Schema

### "Relation already exists"
```sql
-- Limpar tabelas se necessário (CUIDADO!)
DROP TABLE IF EXISTS calculos_dre CASCADE;
DROP TABLE IF EXISTS calculos_icms CASCADE;
-- ... continuar para todas as tabelas
```

### "Permission denied"
- Confirme que você é owner do projeto Supabase
- Verifique se a chave tem permissões de escrita

---

## 📝 Credenciais (Referência)

```env
URL: https://qxrtplvkvulwhengeune.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Password: R@142536*abc123
```

---

## 🎉 Pronto!

**O schema agora é COMPLETO e contempla toda a estrutura do sistema!**

Me confirme quando as 10 tabelas estiverem criadas para continuar! 🚀
