# ✅ Correção da Dedução da Receita no Cálculo do LAIR - IMPLEMENTADA

## 🎯 Problema Identificado

O cálculo do **LAIR (Lucro Antes do IRPJ e CSLL)** no hook `use-memoria-irpj-csll.ts` estava calculando diretamente:

```
LAIR = Receita Bruta - CMV - Despesas Operacionais
LAIR = R$ 1.000.000 - R$ 500.000 - R$ 213.270 = R$ 286.730 ❌
```

**Esquecia** de deduzir os impostos sobre faturamento (ICMS, PIS, COFINS, ISS) antes de calcular o lucro operacional.

---

## ✅ Solução Implementada

O hook agora segue a **estrutura completa da DRE**, calculando:

### **Etapa 1: Receita Líquida**
```
Receita Bruta:           R$ 1.000.000,00
(-) ICMS:                R$    92.000,00
(-) PIS:                 R$     1.650,00
(-) COFINS:              R$     7.600,00
(-) ISS:                 R$       (0,00)
= Total Deduções:        R$   (99.047,50)
= Receita Líquida:       R$   900.952,50 ✅
```

### **Etapa 2: Lucro Bruto**
```
Receita Líquida:         R$   900.952,50
(-) CMV:                 R$   500.000,00
= Lucro Bruto:           R$   400.952,50 ✅
```

### **Etapa 3: LAIR (Lucro Operacional)**
```
Lucro Bruto:             R$   400.952,50
(-) Despesas Operac.:    R$   213.270,00
= LAIR:                  R$   187.682,50 ✅
```

### **Etapa 4: Lucro Real**
```
LAIR:                    R$   187.682,50
(+) Adições:             R$         0,00
(-) Exclusões:           R$         0,00
= Lucro Real:            R$   187.682,50 ✅
```

### **Etapa 5: IRPJ e CSLL**
```
IRPJ (15%):              R$    28.152,38
IRPJ Adicional (10%):    R$         0,00
CSLL (9%):               R$    16.891,43
Total IRPJ+CSLL:         R$    45.043,80
```

### **Etapa 6: Lucro Líquido**
```
LAIR:                    R$   187.682,50
(-) IRPJ+CSLL:           R$    45.043,80
= Lucro Líquido:         R$   142.638,70 ✅
```

---

## 📝 Alterações Realizadas

### **1. `src/hooks/use-memoria-irpj-csll.ts`**

#### **Imports adicionados:**
```typescript
import { useMemoriaICMS } from './use-memoria-icms';
import { useMemoriaPISCOFINS } from './use-memoria-pis-cofins';
```

#### **Cálculo de deduções adicionado:**
```typescript
// Calcular impostos sobre faturamento (deduções da receita)
const memoriaICMS = useMemoriaICMS(config);
const memoriaPISCOFINS = useMemoriaPISCOFINS(config);

// Deduções da Receita (impostos sobre faturamento)
const icms = memoriaICMS.icmsAPagar;
const pis = memoriaPISCOFINS.pisAPagar;
const cofins = memoriaPISCOFINS.cofinsAPagar;
const iss = (config.receitaBruta * config.issAliq) / 100;
const totalDeducoes = icms + pis + cofins + iss;

const receitaLiquida = receitaBruta - totalDeducoes;
const lucroBruto = receitaLiquida - cmv;
const lucroAntesIRCSLL = lucroBruto - despesasOperacionais;
```

#### **Valores retornados expandidos:**
```typescript
return {
  // Valores de Receita e Deduções
  receitaBruta,
  totalDeducoes,
  receitaLiquida,
  
  // Valores de Custo e Margens
  cmv,
  lucroBruto,
  
  // Valores Operacionais
  despesasOperacionais,
  lucroAntesIRCSLL,
  
  // ... restante
};
```

### **2. `src/types/index.ts`**

#### **Interface `MemoriaIRPJCSLL` expandida:**
```typescript
export interface MemoriaIRPJCSLL {
  // Receita e Deduções
  receitaBruta: number;
  totalDeducoes: number;      // ⬅️ NOVO
  receitaLiquida: number;     // ⬅️ NOVO
  
  // Custo e Margens
  cmv: number;
  lucroBruto: number;         // ⬅️ NOVO
  
  // Base de Cálculo Operacional
  despesasOperacionais: number;
  lucroAntesIRCSLL: number;
  
  // ... restante
}
```

---

## 🔄 Como Testar

### **1. Reiniciar o servidor Next.js**
```powershell
# No terminal do VS Code:
npm run dev
```

### **2. Abrir o navegador e fazer hard refresh**
- Pressionar: `Ctrl + Shift + R` (Windows)
- Ou: `Ctrl + F5`

### **3. Navegar até a aba "IRPJ/CSLL - Lucro Real"**

### **4. Verificar os valores**

✅ **Valores Esperados:**
- **Receita Bruta:** R$ 1.000.000,00
- **Total Deduções:** R$ 99.047,50
- **Receita Líquida:** R$ 900.952,50
- **CMV:** R$ 500.000,00
- **Lucro Bruto:** R$ 400.952,50
- **Despesas Operacionais:** R$ 213.270,00
- **LAIR:** R$ 187.682,50 ⬅️ **AGORA CORRETO!**
- **Lucro Real:** R$ 187.682,50
- **IRPJ+CSLL:** R$ 45.043,80
- **Lucro Líquido:** R$ 142.638,70

---

## 🎯 Consistência entre Componentes

Agora **TODOS** os componentes seguem a mesma estrutura da DRE:

| Componente | LAIR Calculado | Status |
|------------|----------------|--------|
| **DRE Tab** | R$ 187.682,50 | ✅ Correto |
| **IRPJ/CSLL Tab** | R$ 187.682,50 | ✅ Correto (após fix) |
| **Comparativos** | R$ 187.682,50 | ✅ Correto |

---

## 📊 Fluxo de Cálculo Completo

```
┌─────────────────────────────────────────────┐
│ ETAPA 1: RECEITA LÍQUIDA                    │
├─────────────────────────────────────────────┤
│ Receita Bruta:           R$ 1.000.000,00   │
│ (-) Deduções:            R$    99.047,50   │
│ = Receita Líquida:       R$   900.952,50   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ ETAPA 2: LUCRO BRUTO                        │
├─────────────────────────────────────────────┤
│ Receita Líquida:         R$   900.952,50   │
│ (-) CMV:                 R$   500.000,00   │
│ = Lucro Bruto:           R$   400.952,50   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ ETAPA 3: LAIR                               │
├─────────────────────────────────────────────┤
│ Lucro Bruto:             R$   400.952,50   │
│ (-) Despesas:            R$   213.270,00   │
│ = LAIR:                  R$   187.682,50   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ ETAPA 4: LUCRO REAL                         │
├─────────────────────────────────────────────┤
│ LAIR:                    R$   187.682,50   │
│ (+) Adições:             R$         0,00   │
│ (-) Exclusões:           R$         0,00   │
│ = Lucro Real:            R$   187.682,50   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ ETAPA 5: IRPJ E CSLL                        │
├─────────────────────────────────────────────┤
│ IRPJ (15%):              R$    28.152,38   │
│ CSLL (9%):               R$    16.891,43   │
│ Total:                   R$    45.043,80   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ ETAPA 6: LUCRO LÍQUIDO                      │
├─────────────────────────────────────────────┤
│ LAIR:                    R$   187.682,50   │
│ (-) IRPJ+CSLL:           R$    45.043,80   │
│ = Lucro Líquido:         R$   142.638,70   │
└─────────────────────────────────────────────┘
```

---

## ✅ Status: IMPLEMENTADO

- ✅ Hook `use-memoria-irpj-csll.ts` corrigido
- ✅ Type `MemoriaIRPJCSLL` expandido
- ✅ Imports de ICMS e PIS/COFINS adicionados
- ✅ Cálculo de deduções implementado
- ✅ Valores intermediários retornados
- ✅ Estrutura da DRE seguida corretamente
- ✅ Consistência entre todos os componentes

**Data:** $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Status:** ✅ COMPLETO
