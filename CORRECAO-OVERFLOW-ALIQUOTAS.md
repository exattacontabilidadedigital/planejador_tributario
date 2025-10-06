# 🔧 Correção: Overflow Numérico nas Alíquotas

## ❌ Erro Encontrado

```
numeric field overflow
A field with precision 5, scale 4 must round to an absolute value less than 10^1.
```

### 📊 Dados que Causaram o Erro

```json
{
  "vendas_internas_aliquota": 23,     // ❌ ERRADO: percentual inteiro
  "vendas_internas_aliquota": 0.23    // ✅ CORRETO: decimal
}
```

---

## 🔍 Causa Raiz

### **Schema do Banco de Dados:**
```sql
vendas_internas_aliquota DECIMAL(5,4) DEFAULT 0
```

**DECIMAL(5,4) significa:**
- 5 dígitos totais
- 4 dígitos após a vírgula
- 1 dígito antes da vírgula
- **Valor máximo:** 9.9999 (999.99%)

### **Problema:**
O código estava enviando alíquotas como **percentual inteiro**:
- 23% → enviado como `23`
- 12% → enviado como `12`

Mas o banco esperava **decimal**:
- 23% → deve ser `0.23`
- 12% → deve ser `0.12`

---

## ✅ Solução Aplicada

### **Arquivo Modificado:**
`src/services/memorias-calculo-service.ts`

### **Mudança:**
Dividir todas as alíquotas por 100 antes de salvar:

```typescript
// ANTES (ERRADO)
vendas_internas_aliquota: memoria.vendasInternas.aliquota,  // 23

// DEPOIS (CORRETO)
vendas_internas_aliquota: memoria.vendasInternas.aliquota / 100,  // 0.23
```

### **Campos Corrigidos:**

#### **ICMS (8 campos):**
- ✅ `vendas_internas_aliquota`
- ✅ `vendas_interestaduais_aliquota`
- ✅ `difal_aliquota`
- ✅ `fcp_aliquota`
- ✅ `credito_compras_internas_aliquota`
- ✅ `credito_compras_interestaduais_aliquota`

#### **PIS/COFINS (6 campos):**
- ✅ `debito_pis_aliquota`
- ✅ `debito_cofins_aliquota`
- ✅ `credito_pis_compras_aliquota`
- ✅ `credito_cofins_compras_aliquota`
- ✅ `credito_pis_despesas_aliquota`
- ✅ `credito_cofins_despesas_aliquota`

#### **IRPJ/CSLL (3 campos):**
- ✅ `irpj_base_aliquota`
- ✅ `irpj_adicional_aliquota`
- ✅ `csll_aliquota`

---

## 🧪 Teste

### **Antes:**
```
❌ [ICMS] Erro ao inserir: numeric field overflow
```

### **Depois:**
```
✅ [ICMS] Inserido com sucesso
```

### **Validação no Banco:**
```sql
SELECT 
  vendas_internas_aliquota,
  vendas_internas_base,
  vendas_internas_valor
FROM calculos_icms
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**
| aliquota | base | valor |
|----------|------|-------|
| 0.2300 | 1000000.00 | 230000.00 |

---

## 📝 Lições Aprendidas

### **1. Sempre verifique o schema do banco**
```sql
DECIMAL(precision, scale)
```
- `precision`: total de dígitos
- `scale`: dígitos após o ponto decimal
- `DECIMAL(5,4)` = máximo 9.9999

### **2. Consistência de representação**
- **Frontend/Hooks:** Alíquotas em % (23, 12, 15)
- **Banco de Dados:** Alíquotas em decimal (0.23, 0.12, 0.15)
- **Conversão:** Sempre no serviço de persistência

### **3. Logs detalhados ajudam**
O log com `JSON.stringify(dados, null, 2)` mostrou exatamente quais valores estavam causando o overflow.

---

## 🎯 Status

✅ **Corrigido:** Conversão de alíquotas implementada  
✅ **Testado:** Logs detalhados confirmam sucesso  
✅ **Documentado:** Este arquivo explica a correção  

---

**Arquivo modificado:** `src/services/memorias-calculo-service.ts`  
**Linhas alteradas:** ~17 campos com conversão `/100`  
**Impacto:** CRÍTICO - Sistema não salvava sem esta correção
