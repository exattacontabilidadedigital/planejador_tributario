# ✅ CORREÇÃO: Cálculo IRPJ/CSLL - Despesas Operacionais

**Data:** 06/10/2025  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 Problema Identificado

**Sintoma:** Memória de cálculo IRPJ/CSLL estava usando despesas duplicadas:
- ❌ Despesas fixas da configuração (R$ 211.000,00) - **VALORES DE TESTE**
- ✅ Despesas dinâmicas (R$ 213.270,00) - **VALORES REAIS**

**Resultado:** Total de R$ 424.270,00 nas Despesas Operacionais (INCORRETO)

---

## 🔧 Correções Aplicadas

### 1️⃣ **Arquivo: `use-memoria-irpj-csll.ts`**

**ANTES (ERRADO):**
```typescript
// Somatório das despesas dinâmicas (somente tipo "despesa")
const despesasDinamicasTotal = (config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0);

// Despesas operacionais fixas + despesas dinâmicas
const despesasOperacionais =
  config.salariosPF +              // ❌ R$ 80.000 (teste)
  config.energiaEletrica +         // ❌ R$ 15.000 (teste)
  config.alugueis +                // ❌ R$ 25.000 (teste)
  config.alimentacao +             // ❌ R$ 15.000 (teste)
  config.combustivelPasseio +      // ❌ R$  3.000 (teste)
  config.outrasDespesas +          // ❌ R$ 35.000 (teste)
  config.arrendamento +            // ❌ R$ 10.000 (teste)
  config.frete +                   // ❌ R$  8.000 (teste)
  config.depreciacao +             // ❌ R$ 12.000 (teste)
  config.combustiveis +            // ❌ R$  5.000 (teste)
  config.valeTransporte +          // ❌ R$  3.000 (teste)
  despesasDinamicasTotal;          // ✅ R$ 213.270 (real)
  
// TOTAL: R$ 424.270,00 ❌ (DUPLICADO!)
```

**DEPOIS (CORRETO):**
```typescript
// Somatório das despesas dinâmicas (somente tipo "despesa")
// ✅ USAR APENAS DESPESAS DINÂMICAS (as despesas da config são valores de teste)
const despesasOperacionais = (config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0);

// TOTAL: R$ 213.270,00 ✅ (CORRETO!)
```

---

### 2️⃣ **Arquivo: `calcular-impostos.ts`**

**ANTES (ERRADO):**
```typescript
const despesasDinamicasTotal = (config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0)

const despesasOperacionais =
  config.salariosPF +
  config.energiaEletrica +
  config.alugueis +
  config.alimentacao +
  config.combustivelPasseio +
  config.outrasDespesas +
  config.arrendamento +
  config.frete +
  config.depreciacao +
  config.combustiveis +
  config.valeTransporte +
  despesasDinamicasTotal  // ❌ Somava ambas!
```

**DEPOIS (CORRETO):**
```typescript
// ✅ USAR APENAS DESPESAS DINÂMICAS (as despesas da config são valores de teste)
const despesasOperacionais = (config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0)
```

---

### 3️⃣ **Arquivo: `use-dre-calculation.ts`**

**STATUS:** ✅ **JÁ ESTAVA CORRETO!**

```typescript
// Despesas Operacionais - APENAS despesas dinâmicas tipo "despesa"
// (Despesas fixas antigas foram migradas para despesas dinâmicas)
const despesasDinamicas = (config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0);

const totalDespesasOperacionais = despesasDinamicas; // ✅ Sempre esteve correto
```

**Por isso a DRE mostrava o valor correto (R$ 213.270,00)**

---

## 📊 Comparação Antes vs Depois

### **Cálculo ANTERIOR (Errado):**

```
Receita Bruta de Vendas:           R$ 1.000.000,00
(-) Custo das Mercadorias (CMV):   (R$   500.000,00)
(-) Despesas Operacionais:         (R$   424.270,00) ❌ DUPLICADAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= Lucro Antes do IRPJ/CSLL:        R$    75.730,00 ❌ ERRADO

(+) Adições:                       R$         0,00
(-) Exclusões:                     (R$        0,00)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= LUCRO REAL:                      R$    75.730,00 ❌ BASE ERRADA
```

### **Cálculo CORRIGIDO (Atual):**

```
Receita Bruta de Vendas:           R$ 1.000.000,00
(-) Custo das Mercadorias (CMV):   (R$   500.000,00)
(-) Despesas Operacionais:         (R$   213.270,00) ✅ CORRETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= Lucro Antes do IRPJ/CSLL:        R$   286.730,00 ✅ CORRETO

(+) Adições:                       R$         0,00
(-) Exclusões:                     (R$        0,00)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= LUCRO REAL:                      R$   286.730,00 ✅ BASE CORRETA
```

### **Impacto nos Impostos:**

| Item | Antes (Errado) | Depois (Correto) | Diferença |
|------|----------------|------------------|-----------|
| **Base de Cálculo** | R$ 75.730,00 | R$ 286.730,00 | **+R$ 211.000** ⬆️ |
| **IRPJ Base (15%)** | R$ 11.359,50 | R$ 43.009,50 | +R$ 31.650 |
| **IRPJ Adic (10%)** | R$ 0,00 | R$ 4.673,00 | +R$ 4.673 |
| **CSLL (9%)** | R$ 6.815,70 | R$ 25.805,70 | +R$ 18.990 |
| **TOTAL IRPJ+CSLL** | R$ 18.175,20 | R$ 73.488,20 | **+R$ 55.313** ⬆️ |

---

## 📋 Composição dos R$ 213.270,00 (Correto)

### ✅ **Despesas COM Crédito PIS/COFINS** (11 itens)
```
1.  Outras Despesas              R$  35.000,00
2.  Arrendamento Mercantil       R$  10.000,00
3.  Frete e Armazenagem          R$   8.000,00
4.  Vale Transporte              R$   3.000,00
5.  Salários e Encargos (PF)     R$  80.000,00
6.  Energia Elétrica             R$  17.000,00
7.  Aluguéis                     R$  25.000,00
8.  Depreciação de Máquinas      R$  12.000,00
9.  Combustíveis (Empresariais)  R$   5.000,00
10. Vale Alimentação             R$  15.000,00
11. Combustível Passeio          R$   3.000,00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal COM crédito:            R$ 213.000,00
```

### ❌ **Despesas SEM Crédito PIS/COFINS** (2 itens)
```
12. Internet Loja                R$     150,00
13. Internet Oficina             R$     120,00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal SEM crédito:            R$     270,00
```

### 💰 **TOTAL GERAL**
```
R$ 213.000,00 + R$ 270,00 = R$ 213.270,00 ✅
```

---

## ✅ Arquivos Modificados

1. ✅ `src/hooks/use-memoria-irpj-csll.ts` - Linha 19-32
2. ✅ `src/lib/calcular-impostos.ts` - Linha 57-73
3. ✅ `src/hooks/use-dre-calculation.ts` - **Já estava correto**

---

## 🎯 Resultado Final

### **DRE (Sempre Correto):**
- ✅ Despesas Operacionais: R$ 213.270,00

### **Memória IRPJ/CSLL (Agora Correto):**
- ✅ Despesas Operacionais: R$ 213.270,00
- ✅ Lucro Antes IRPJ/CSLL: R$ 286.730,00 (era R$ 75.730 antes)
- ✅ Lucro Real: R$ 286.730,00
- ✅ IRPJ Total: R$ 47.682,50 (era R$ 11.359,50 antes)
- ✅ CSLL: R$ 25.805,70 (era R$ 6.815,70 antes)

---

## 🔍 Como Identificar o Problema

**Sintomas:**
1. DRE mostrando valor X
2. Memória IRPJ/CSLL mostrando valor diferente (2x)
3. Lucro Antes IRPJ/CSLL muito baixo ou negativo
4. Base de cálculo do IRPJ/CSLL incorreta

**Causa Raiz:**
- Despesas da configuração (`config.salariosPF`, `config.alugueis`, etc.) eram valores de **teste/exemplo**
- Ao migrar para despesas dinâmicas, esses valores ficaram duplicados
- Sistema somava: **despesas config + despesas dinâmicas** = duplicação

**Solução:**
- Usar **APENAS** `config.despesasDinamicas`
- Ignorar campos de despesas da configuração (são apenas templates/defaults)

---

## 📝 Lições Aprendidas

### 1. **Fonte Única de Verdade**
- Despesas dinâmicas = fonte única
- Campos da configuração = apenas valores default/template
- Nunca somar ambos

### 2. **Consistência entre Cálculos**
- DRE, Memória IRPJ/CSLL e calcular-impostos.ts devem usar mesma lógica
- Se DRE está correto, usar como referência

### 3. **Validação Cruzada**
- Comparar valores entre DRE e Memória
- Se houver discrepância = bug na fonte de dados

---

## ✅ Status Final

| Componente | Status | Valor Despesas |
|------------|--------|----------------|
| **DRE** | ✅ Sempre correto | R$ 213.270,00 |
| **Memória IRPJ/CSLL** | ✅ Corrigido | R$ 213.270,00 |
| **calcular-impostos.ts** | ✅ Corrigido | R$ 213.270,00 |
| **Sincronização Tabela** | ✅ Funcionando | 13 despesas |

---

## 🎉 Conclusão

Problema resolvido! Agora todos os cálculos de IRPJ/CSLL usam **apenas as despesas dinâmicas cadastradas**, resultando em:

- ✅ Base de cálculo correta
- ✅ Impostos calculados corretamente
- ✅ Consistência entre DRE e Memória de Cálculo
- ✅ Valores alinhados com a realidade do cenário

**Próximos passos:** Recarregar a página e verificar que a Memória de Cálculo IRPJ/CSLL agora mostra os valores corretos!
