# Integração: Despesas Dinâmicas → DRE e IRPJ/CSLL

## 📋 Resumo da Implementação

As **despesas cadastradas** nas abas "Despesas COM Crédito PIS/COFINS" e "Despesas SEM Crédito PIS/COFINS" agora são **automaticamente integradas** nos cálculos da DRE e IRPJ/CSLL.

---

## 🔄 Fluxo de Integração

```
┌─────────────────────────────────────┐
│  Configurações → PIS/COFINS         │
│  ────────────────────────────────   │
│  • Despesas COM Crédito             │
│  • Despesas SEM Crédito             │
│  • CSV Import/Export                │
└──────────────┬──────────────────────┘
               │
               │ Filtra tipo = "despesa"
               │ (exclui tipo = "custo")
               ↓
┌─────────────────────────────────────┐
│  DRE - Despesas Operacionais        │
│  ────────────────────────────────   │
│  • Salários, Energia, etc. (fixas)  │
│  • + Despesas PIS/COFINS (dinâmicas)│
│  = Total Despesas Operacionais      │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  IRPJ/CSLL - Base de Cálculo        │
│  ────────────────────────────────   │
│  Receita - CMV - Despesas Oper.     │
│  = Lucro Antes IR/CSLL              │
└─────────────────────────────────────┘
```

---

## 🛠️ Arquivos Modificados

### 1. **`src/hooks/use-dre-calculation.ts`** ✅

**Mudança:** Adicionou somatório das despesas dinâmicas

```typescript
// Despesas Dinâmicas (somente tipo "despesa")
const despesasDinamicas = (config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0);

const totalDespesasOperacionais = 
  salariosPF + energia + ... + despesasDinamicas;
```

**Resultado:** DRE agora inclui despesas cadastradas no total operacional

---

### 2. **`src/hooks/use-memoria-irpj-csll.ts`** ✅

**Mudança:** Mesma lógica de somatório

```typescript
const despesasDinamicasTotal = (config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0);

const despesasOperacionais = 
  config.salariosPF + ... + despesasDinamicasTotal;

const lucroAntesIRCSLL = receitaBruta - cmv - despesasOperacionais;
```

**Resultado:** IRPJ/CSLL calculado sobre lucro real (com despesas dinâmicas)

---

### 3. **`src/types/index.ts`** ✅

**Mudança:** Adicionou campo `despesasDinamicas` ao tipo `DREData`

```typescript
export interface DREData {
  despesasOperacionais: {
    salariosPF: number;
    // ... outros campos ...
    despesasDinamicas: number; // ← NOVO
    total: number;
  };
}
```

---

### 4. **`src/components/dre/dre-table.tsx`** ✅

**Mudança:** Exibe linha "Despesas PIS/COFINS (Cadastradas)" na DRE

```tsx
{dre.despesasOperacionais.despesasDinamicas > 0 && (
  <TableRow>
    <TableCell className="pl-8">
      (-) Despesas PIS/COFINS (Cadastradas)
    </TableCell>
    <TableCell className="text-right text-red-600">
      ({formatCurrency(dre.despesasOperacionais.despesasDinamicas)})
    </TableCell>
    <TableCell className="text-right">
      {formatPercentage(...)}
    </TableCell>
  </TableRow>
)}
```

**Resultado:** DRE mostra valor total das despesas cadastradas (se > 0)

---

## 📊 Exemplo Prático

### Cenário:

**Configurações → PIS/COFINS:**
- Despesa 1: "Frete Outbound" = R$ 5.000 (tipo: despesa, com crédito)
- Despesa 2: "Marketing Digital" = R$ 3.000 (tipo: despesa, sem crédito)
- Despesa 3: "Matéria-Prima" = R$ 10.000 (tipo: **custo**, com crédito)

### Resultado na DRE:

```
Despesas Operacionais
────────────────────────────────────
(-) Salários e Encargos PF      R$ 50.000
(-) Energia Elétrica            R$ 10.000
(-) Aluguéis                    R$ 15.000
...
(-) Outras Despesas             R$ 5.000
(-) Despesas PIS/COFINS (Cadastradas)  R$ 8.000 ← Frete + Marketing
────────────────────────────────────
Total Despesas Operacionais     R$ 88.000
```

**Por quê R$ 8.000?**
- ✅ Frete (R$ 5.000) → tipo = "despesa"
- ✅ Marketing (R$ 3.000) → tipo = "despesa"
- ❌ Matéria-Prima (R$ 10.000) → tipo = "**custo**" (vai para CMV, não para despesas)

---

## 🔍 Lógica de Filtro

```typescript
// Apenas despesas do tipo "despesa" vão para DRE
(config.despesasDinamicas || [])
  .filter(d => d.tipo === 'despesa')
  .reduce((total, despesa) => total + despesa.valor, 0)
```

### Tipos de Despesas:

| Tipo      | Vai para DRE? | Vai para CMV? | Exemplo              |
|-----------|---------------|---------------|----------------------|
| `despesa` | ✅ Sim        | ❌ Não        | Frete, Marketing     |
| `custo`   | ❌ Não        | ✅ Sim        | Matéria-Prima, Insumos |

---

## ✅ Benefícios

1. **Centralização**: Cadastre despesas uma vez, aparecem em 3 lugares:
   - Memória PIS/COFINS (créditos)
   - DRE (despesas operacionais)
   - IRPJ/CSLL (base de cálculo)

2. **Consistência**: Não há risco de valores divergentes entre abas

3. **Transparência**: DRE mostra linha específica "Despesas PIS/COFINS (Cadastradas)"

4. **Flexibilidade**: CSV import/export mantém integração

---

## 🎯 Próximos Passos Possíveis

- [ ] Adicionar detalhamento das despesas dinâmicas (modal ou expansível)
- [ ] Filtrar por categoria na DRE (COM crédito vs SEM crédito)
- [ ] Exportar PDF da DRE incluindo despesas dinâmicas detalhadas

---

## 📝 Notas Técnicas

### Comportamento Esperado:

- Se `despesasDinamicas` é `undefined` ou `[]`: valor = 0
- Se há despesas tipo "custo": ignoradas na DRE (vão para CMV)
- Se `despesasDinamicas > 0`: linha aparece na DRE
- Se `despesasDinamicas === 0`: linha **não aparece** (condicional `&&`)

### Performance:

- `.filter()` e `.reduce()` executam em `useMemo()` hooks
- Re-cálculo apenas quando `config` muda
- Sem impacto perceptível na performance

---

**Data de Implementação:** 03/10/2025  
**Versão:** 3.3.0  
**Status:** ✅ Completo e Testado
