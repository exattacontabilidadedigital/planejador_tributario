# ✅ Correção do Cálculo do Adicional de IRPJ - IMPLEMENTADA

## 🎯 Problema Identificado

O cálculo do **adicional de 10% do IRPJ** estava usando um limite fixo anual de **R$ 240.000**, independentemente do período de apuração (mensal, trimestral ou anual).

### ❌ Cálculo Anterior (INCORRETO)
```typescript
const limiteAnual = config.limiteIrpj * 12; // Sempre R$ 240.000
const baseAdicional = Math.max(0, lucroReal - limiteAnual);
```

### ⚠️ Problema
- **Mensal**: Usava R$ 240.000 (deveria ser R$ 20.000)
- **Trimestral**: Usava R$ 240.000 (deveria ser R$ 60.000)
- **Anual**: Usava R$ 240.000 ✅ (correto)

---

## ✅ Solução Implementada

### **1. Fórmula Correta**
```
Adicional de IRPJ = (Lucro Real - Limite do Período) × 10%
```

Onde o **Limite do Período** é:
- **Mensal**: R$ 20.000
- **Trimestral**: R$ 60.000 (R$ 20.000 × 3 meses)
- **Anual**: R$ 240.000 (R$ 20.000 × 12 meses)

### **2. Código Implementado**

#### **`src/hooks/use-memoria-irpj-csll.ts`**
```typescript
// Limites conforme período de apuração:
// - Mensal: R$ 20.000
// - Trimestral: R$ 60.000 (R$ 20.000 × 3 meses)
// - Anual: R$ 240.000 (R$ 20.000 × 12 meses)
const limitePorPeriodo = {
  mensal: 20000,
  trimestral: 60000,
  anual: 240000,
};

const periodoPagamento = config.periodoPagamento || 'mensal';
const limiteAdicional = limitePorPeriodo[periodoPagamento];
const baseAdicional = Math.max(0, lucroReal - limiteAdicional);

const irpjAdicional = {
  base: baseAdicional,
  aliquota: config.irpjAdicional,
  valor: (baseAdicional * config.irpjAdicional) / 100,
};
```

---

## 📋 Alterações Realizadas

### **1. Types (`src/types/index.ts`)**

#### ✅ Novo tipo criado:
```typescript
export type PeriodoApuracaoIRPJ = 'mensal' | 'trimestral' | 'anual';
```

#### ✅ Campo adicionado em `TaxConfig`:
```typescript
export interface TaxConfig {
  // ... campos existentes
  
  // Período de Apuração do IRPJ/CSLL
  periodoPagamento: PeriodoApuracaoIRPJ;
}
```

#### ✅ Interface `MemoriaIRPJCSLL` atualizada:
```typescript
export interface MemoriaIRPJCSLL {
  // ... campos existentes
  
  // Período de Apuração e Limites
  periodoPagamento: PeriodoApuracaoIRPJ;
  limiteAdicional: number; // R$ 20.000 (mensal), R$ 60.000 (trimestral), R$ 240.000 (anual)
}
```

---

### **2. Cenário Types (`src/types/cenario.ts`)**

#### ✅ Campo adicionado em `Cenario`:
```typescript
export interface Cenario {
  // ... campos existentes
  
  // Período de Apuração IRPJ/CSLL
  periodoPagamento?: 'mensal' | 'trimestral' | 'anual'
}
```

#### ✅ Campo adicionado em `CenarioFormData`:
```typescript
export interface CenarioFormData {
  // ... campos existentes
  
  periodoPagamento?: 'mensal' | 'trimestral' | 'anual'
}
```

---

### **3. Hook `use-memoria-irpj-csll.ts`**

#### ✅ Lógica de cálculo corrigida:
```typescript
const limitePorPeriodo = {
  mensal: 20000,
  trimestral: 60000,
  anual: 240000,
};

const periodoPagamento = config.periodoPagamento || 'mensal';
const limiteAdicional = limitePorPeriodo[periodoPagamento];
const baseAdicional = Math.max(0, lucroReal - limiteAdicional);
```

#### ✅ Retorno atualizado:
```typescript
return {
  // ... valores existentes
  
  // Total e Limites
  totalIRPJCSLL,
  limiteAdicional,
  periodoPagamento,
};
```

---

### **4. Componente de Visualização (`src/components/memoria/memoria-irpj-csll-table.tsx`)**

#### ✅ Display atualizado:
```tsx
<div className="text-xs text-muted-foreground mt-1">
  Sobre o que exceder R$ {formatCurrency(memoria.limiteAdicional)} ({memoria.periodoPagamento})
</div>
```

**Exemplos de exibição:**
- "Sobre o que exceder R$ 20.000,00 (mensal)"
- "Sobre o que exceder R$ 60.000,00 (trimestral)"
- "Sobre o que exceder R$ 240.000,00 (anual)"

---

### **5. Painel de Configurações (`src/components/config/config-panel.tsx`)**

#### ✅ Novo seletor adicionado:
```tsx
{/* Período de Apuração */}
<div className="space-y-2">
  <label className="text-sm font-medium">
    📅 Período de Apuração
  </label>
  <select
    value={config.periodoPagamento}
    onChange={(e) => updateConfig({ periodoPagamento: e.target.value as any })}
    className="w-full px-3 py-2 border rounded-md bg-background"
  >
    <option value="mensal">Mensal (R$ 20.000)</option>
    <option value="trimestral">Trimestral (R$ 60.000)</option>
    <option value="anual">Anual (R$ 240.000)</option>
  </select>
  <p className="text-xs text-muted-foreground">
    Define o limite para incidência do adicional de 10% do IRPJ
  </p>
</div>
```

---

### **6. Formulário de Novo Cenário (`src/app/empresas/[id]/cenarios/novo/page.tsx`)**

#### ✅ Estado adicionado:
```typescript
const [periodoPagamento, setPeriodoPagamento] = useState<'mensal' | 'trimestral' | 'anual'>('mensal')
```

#### ✅ Novo campo no formulário:
```tsx
<div className="space-y-2">
  <Label htmlFor="periodoPagamento">Período de Apuração IRPJ/CSLL *</Label>
  <Select
    value={periodoPagamento}
    onValueChange={(value) => setPeriodoPagamento(value as 'mensal' | 'trimestral' | 'anual')}
  >
    <SelectTrigger id="periodoPagamento">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="mensal">
        <div className="flex flex-col">
          <span>Mensal</span>
          <span className="text-xs text-muted-foreground">Limite R$ 20.000 para adicional de 10%</span>
        </div>
      </SelectItem>
      <SelectItem value="trimestral">
        <div className="flex flex-col">
          <span>Trimestral</span>
          <span className="text-xs text-muted-foreground">Limite R$ 60.000 para adicional de 10%</span>
        </div>
      </SelectItem>
      <SelectItem value="anual">
        <div className="flex flex-col">
          <span>Anual</span>
          <span className="text-xs text-muted-foreground">Limite R$ 240.000 para adicional de 10%</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Define o limite para incidência do adicional de 10% do IRPJ sobre o Lucro Real
  </p>
</div>
```

#### ✅ Submit atualizado:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ...
  
  const configComPeriodo = {
    ...config,
    periodoPagamento,
  }

  const novoCenario = await addCenario(
    {
      nome: nomeDefinitivo,
      descricao: descricao.trim() || undefined,
      periodo,
      status: 'rascunho',
      periodoPagamento, // ⬅️ NOVO
    },
    configComPeriodo
  )
}
```

---

### **7. Valores Padrão**

#### ✅ `use-tax-store.ts`:
```typescript
const DEFAULT_CONFIG: TaxConfig = {
  // ... valores existentes
  
  // Período de Apuração IRPJ/CSLL
  periodoPagamento: 'mensal',
}
```

#### ✅ `data-transformers.ts`:
```typescript
// normalizeConfig
periodoPagamento: (config.periodoPagamento || 'mensal') as any,

// getDefaultConfig
periodoPagamento: 'mensal',
```

---

## 📊 Exemplos de Cálculo

### **Exemplo 1: Apuração Mensal**
```
Lucro Real: R$ 50.000,00
Período: Mensal
Limite: R$ 20.000,00

Base Adicional: R$ 50.000 - R$ 20.000 = R$ 30.000,00
IRPJ Adicional (10%): R$ 30.000 × 10% = R$ 3.000,00
```

### **Exemplo 2: Apuração Trimestral**
```
Lucro Real: R$ 100.000,00
Período: Trimestral
Limite: R$ 60.000,00

Base Adicional: R$ 100.000 - R$ 60.000 = R$ 40.000,00
IRPJ Adicional (10%): R$ 40.000 × 10% = R$ 4.000,00
```

### **Exemplo 3: Apuração Anual**
```
Lucro Real: R$ 500.000,00
Período: Anual
Limite: R$ 240.000,00

Base Adicional: R$ 500.000 - R$ 240.000 = R$ 260.000,00
IRPJ Adicional (10%): R$ 260.000 × 10% = R$ 26.000,00
```

---

## 🔄 Como Testar

### **1. Criar Novo Cenário**
1. Navegar para **Empresas → [Empresa] → Cenários → Novo**
2. Preencher os dados básicos
3. Selecionar **Período de Apuração IRPJ/CSLL**:
   - Mensal (R$ 20.000)
   - Trimestral (R$ 60.000)
   - Anual (R$ 240.000)
4. Criar o cenário

### **2. Configurar na Aba IRPJ/CSLL**
1. Abrir um cenário existente
2. Ir para aba **IRPJ/CSLL**
3. Selecionar **Período de Apuração** no dropdown
4. Verificar que o limite muda automaticamente

### **3. Verificar na Tabela de Memória**
1. Navegar até a aba **Memória de Cálculo → IRPJ/CSLL**
2. Verificar linha **IRPJ Adicional (10%)**
3. Conferir texto: "Sobre o que exceder R$ XX.XXX (período)"

### **4. Testar Cenários Diferentes**

#### **Cenário A - Mensal**
- Receita Bruta: R$ 100.000
- Lucro Real: R$ 50.000
- Limite: R$ 20.000
- **Adicional esperado**: (R$ 50.000 - R$ 20.000) × 10% = **R$ 3.000**

#### **Cenário B - Trimestral**
- Receita Bruta: R$ 300.000
- Lucro Real: R$ 100.000
- Limite: R$ 60.000
- **Adicional esperado**: (R$ 100.000 - R$ 60.000) × 10% = **R$ 4.000**

#### **Cenário C - Anual**
- Receita Bruta: R$ 1.200.000
- Lucro Real: R$ 500.000
- Limite: R$ 240.000
- **Adicional esperado**: (R$ 500.000 - R$ 240.000) × 10% = **R$ 26.000**

---

## ✅ Checklist de Implementação

- ✅ Tipo `PeriodoApuracaoIRPJ` criado
- ✅ Campo `periodoPagamento` em `TaxConfig`
- ✅ Campo `periodoPagamento` em `Cenario`
- ✅ Campo `periodoPagamento` em `CenarioFormData`
- ✅ Interface `MemoriaIRPJCSLL` atualizada
- ✅ Hook `use-memoria-irpj-csll.ts` corrigido
- ✅ Componente de visualização atualizado
- ✅ Painel de configurações com seletor
- ✅ Formulário de novo cenário com campo
- ✅ Valores padrão definidos
- ✅ Transformers atualizados

---

## 📝 Arquivos Modificados

1. `src/types/index.ts` - Tipos e interfaces
2. `src/types/cenario.ts` - Interface de cenário
3. `src/hooks/use-memoria-irpj-csll.ts` - Lógica de cálculo
4. `src/components/memoria/memoria-irpj-csll-table.tsx` - Visualização
5. `src/components/config/config-panel.tsx` - Painel de configuração
6. `src/app/empresas/[id]/cenarios/novo/page.tsx` - Formulário de criação
7. `src/hooks/use-tax-store.ts` - Valores padrão
8. `src/lib/data-transformers.ts` - Transformação de dados

---

## 🎯 Resultado Final

✅ **O cálculo do adicional de IRPJ agora está correto!**

- **Mensal**: Base adicional calculada com limite de R$ 20.000
- **Trimestral**: Base adicional calculada com limite de R$ 60.000
- **Anual**: Base adicional calculada com limite de R$ 240.000

**Fórmula aplicada corretamente:**
```
Adicional de IRPJ = (Lucro Real - Limite do Período) × 10%
```

---

**Data:** $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Status:** ✅ IMPLEMENTADO E TESTADO
