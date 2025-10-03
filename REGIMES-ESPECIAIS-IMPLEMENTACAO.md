# 🎯 Implementação de Regimes Especiais de Tributação

## 📋 Resumo

Implementação de campos para configurar percentuais de vendas com **Substituição Tributária (ICMS)** e **Regime Monofásico (PIS/COFINS)**, que são produtos não tributados na venda.

---

## 🏗️ Arquitetura da Implementação

### 1. **Tipos e Interfaces** (`src/types/index.ts`)

Adicionados dois novos campos na interface `TaxConfig`:

```typescript
// Regimes Especiais de Tributação
percentualST: number; // Percentual de vendas com Substituição Tributária (não tributa ICMS)
percentualMonofasico: number; // Percentual de vendas com PIS/COFINS Monofásico (não tributa PIS/COFINS)
```

### 2. **Hooks de Cálculo**

#### 📊 ICMS - `use-memoria-icms.ts`

**Lógica Implementada:**

```typescript
// Calcula percentual tributável (inverso da ST)
const percentualTributavel = 100 - (config.percentualST || 0);
const fatorST = percentualTributavel / 100;

// Aplica fator ST nas vendas para deduzir vendas com ST
const vendasInternas = {
  base: vendasInternasBase * fatorST,
  aliquota: config.icmsInterno,
  valor: (vendasInternasBase * fatorST * config.icmsInterno) / 100,
};
```

**Exemplo:**
- Receita Bruta: R$ 1.000.000
- Vendas Internas: 70% = R$ 700.000
- Percentual ST: 30%
- **Base Tributável ICMS**: R$ 700.000 × 0,70 = **R$ 490.000**
  - (30% das vendas internas têm ST e não são tributadas)

#### 📊 PIS/COFINS - `use-memoria-pis-cofins.ts`

**Lógica Implementada:**

```typescript
// Calcula percentual tributável (inverso do monofásico)
const percentualTributavel = 100 - (config.percentualMonofasico || 0);
const fatorMonofasico = percentualTributavel / 100;

// Aplica fator monofásico na receita
const debitoPIS = {
  base: config.receitaBruta * fatorMonofasico,
  aliquota: config.pisAliq,
  valor: (config.receitaBruta * fatorMonofasico * config.pisAliq) / 100,
};
```

**Exemplo:**
- Receita Bruta: R$ 1.000.000
- Percentual Monofásico: 20%
- **Base Tributável PIS/COFINS**: R$ 1.000.000 × 0,80 = **R$ 800.000**
  - (20% das vendas são monofásicas e não são tributadas)

### 3. **Interface de Usuário**

#### 📋 ICMS - `config-panel.tsx`

Adicionado no card de **Alíquotas de ICMS**:

```tsx
<div className="pt-2 border-t">
  <PercentageInput
    label="% Vendas com Substituição Tributária"
    value={config.percentualST || 0}
    onChange={(value) => updateConfig({ percentualST: value })}
    max={100}
    helpText="Percentual de vendas com ST que não são tributadas pelo ICMS"
  />
</div>
```

#### 📋 PIS/COFINS - `config-panel.tsx`

Adicionado no card de **Alíquotas PIS/COFINS**:

```tsx
<div className="pt-4 border-t mt-4">
  <PercentageInput
    label="% Vendas com Regime Monofásico"
    value={config.percentualMonofasico || 0}
    onChange={(value) => updateConfig({ percentualMonofasico: value })}
    max={100}
    helpText="Percentual de vendas monofásicas que não são tributadas pelo PIS/COFINS"
  />
</div>
```

### 4. **Componente PercentageInput**

Adicionado suporte a texto de ajuda:

```typescript
interface PercentageInputProps {
  // ... props existentes
  helpText?: string; // Novo campo
}

// Renderização do helpText
{helpText && (
  <p className="text-xs text-muted-foreground mt-1">
    {helpText}
  </p>
)}
```

### 5. **Estado Inicial** (`use-tax-store.ts`)

Valores padrão adicionados:

```typescript
const DEFAULT_CONFIG: TaxConfig = {
  // ... config existente
  
  // Regimes Especiais de Tributação
  percentualST: 0,
  percentualMonofasico: 0,
};
```

---

## 📚 Conceitos Tributários

### 🔄 Substituição Tributária (ICMS)

**O que é:**
- Regime onde o ICMS é recolhido antecipadamente por um contribuinte substituto
- Produtos com ST já tiveram o imposto pago na origem
- Na revenda, **não há incidência de ICMS** pelo revendedor

**Exemplos de produtos com ST:**
- Bebidas alcoólicas
- Cigarros
- Combustíveis
- Medicamentos
- Cosméticos e perfumaria
- Peças automotivas

**Impacto no Cálculo:**
- Deduz o percentual de vendas com ST da base de cálculo do ICMS
- Não gera débito de ICMS na saída

### 🔄 Regime Monofásico (PIS/COFINS)

**O que é:**
- Tributação concentrada em uma única etapa da cadeia produtiva
- Geralmente aplicado na indústria ou importador
- Revendedores **não pagam PIS/COFINS** sobre essas vendas

**Exemplos de produtos monofásicos:**
- Combustíveis e lubrificantes
- Medicamentos
- Produtos de perfumaria
- Bebidas frias
- Autopeças
- Pneus

**Impacto no Cálculo:**
- Deduz o percentual de vendas monofásicas da base de cálculo do PIS/COFINS
- Não gera débito de PIS/COFINS na saída

---

## 🎯 Casos de Uso

### Exemplo 1: Farmácia (ST + Monofásico)

```typescript
// Configuração
receitaBruta: 500000
percentualST: 80 // 80% dos medicamentos têm ST
percentualMonofasico: 75 // 75% dos produtos são monofásicos

// Resultado ICMS
// Base tributável: 500.000 × (70% vendas internas) × (1 - 0,80) = 70.000
// ICMS a pagar: 70.000 × 18% = 12.600

// Resultado PIS/COFINS
// Base tributável: 500.000 × (1 - 0,75) = 125.000
// PIS/COFINS a pagar: 125.000 × 9,25% = 11.562,50
```

### Exemplo 2: Posto de Combustíveis (100% ST e Monofásico)

```typescript
// Configuração
receitaBruta: 1000000
percentualST: 100 // 100% combustível tem ST
percentualMonofasico: 100 // 100% combustível é monofásico

// Resultado ICMS
// Base tributável: 0 (tudo tem ST)
// ICMS a pagar: 0

// Resultado PIS/COFINS
// Base tributável: 0 (tudo é monofásico)
// PIS/COFINS a pagar: 0
```

### Exemplo 3: Varejo Misto (Parcial ST e Monofásico)

```typescript
// Configuração
receitaBruta: 800000
percentualST: 40 // 40% dos produtos têm ST
percentualMonofasico: 35 // 35% dos produtos são monofásicos

// Resultado ICMS (70% vendas internas)
// Base tributável: 800.000 × 0,70 × (1 - 0,40) = 336.000
// ICMS a pagar: 336.000 × 18% = 60.480

// Resultado PIS/COFINS
// Base tributável: 800.000 × (1 - 0,35) = 520.000
// PIS/COFINS a pagar: 520.000 × 9,25% = 48.100
```

---

## ✅ Validações e Regras

### Validações Automáticas

1. **Percentual entre 0 e 100:**
   - Ambos os campos aceitam apenas valores entre 0% e 100%

2. **Valores padrão:**
   - Se não configurado, assume 0% (nenhuma venda especial)

3. **Compatibilidade:**
   - ST aplica-se apenas às vendas (débitos ICMS)
   - Monofásico aplica-se à receita bruta total
   - Não afeta créditos

### Regras de Negócio

1. **ST não afeta créditos de ICMS:**
   - Compras com crédito permanecem inalteradas
   - Créditos adicionais permanecem inalterados

2. **Monofásico não afeta créditos PIS/COFINS:**
   - Despesas com crédito permanecem inalteradas
   - Apenas débitos (receita) são afetados

3. **Independência entre regimes:**
   - ST (ICMS) e Monofásico (PIS/COFINS) são independentes
   - Pode ter produtos com ST mas sem monofásico, e vice-versa

---

## 🚀 Melhorias Futuras

### 1. **Detalhamento por Produto** (Avançado)
- Configurar ST e monofásico por linha de produto
- Planilha de produtos com classificações individuais

### 2. **Relatório de Impacto**
- Comparativo: com vs sem regimes especiais
- Economia tributária gerada

### 3. **Alertas Inteligentes**
- Sugerir configuração de ST para segmentos específicos
- Alertar sobre produtos comumente monofásicos

### 4. **Integração com Cenários**
- Comparar cenários com diferentes percentuais de ST/monofásico
- Simular impacto de mudança no mix de produtos

---

## 📊 Testes Sugeridos

### Teste 1: ST Parcial
1. Configurar percentualST = 30%
2. Verificar se débitos ICMS reduziram 30%
3. Verificar se créditos permanecem inalterados

### Teste 2: Monofásico Total
1. Configurar percentualMonofasico = 100%
2. Verificar PIS/COFINS a pagar = 0
3. Verificar se créditos permanecem (não são utilizados)

### Teste 3: Combinação
1. Configurar percentualST = 50%
2. Configurar percentualMonofasico = 40%
3. Verificar ambos os tributos afetados independentemente

---

## 📝 Changelog

### Versão 3.1.0 - 03/10/2025

**Adicionado:**
- ✅ Campo `percentualST` em TaxConfig
- ✅ Campo `percentualMonofasico` em TaxConfig
- ✅ Lógica de cálculo ST no hook `use-memoria-icms`
- ✅ Lógica de cálculo monofásico no hook `use-memoria-pis-cofins`
- ✅ Campo UI "% Vendas com Substituição Tributária" no painel ICMS
- ✅ Campo UI "% Vendas com Regime Monofásico" no painel PIS/COFINS
- ✅ Suporte a `helpText` no componente `PercentageInput`
- ✅ Valores padrão (0%) no estado inicial

**Impacto:**
- Cálculos mais precisos para empresas com produtos ST/monofásicos
- Interface mais completa e profissional
- Melhor compliance tributário

---

## 🎓 Referências Legais

### Substituição Tributária (ICMS)
- **Lei Complementar 87/1996** (Lei Kandir)
- **Convênio ICMS 92/2015** - Lista de produtos com ST
- **Protocolo ICMS 41/2008** - ST de medicamentos

### Regime Monofásico (PIS/COFINS)
- **Lei 10.147/2000** - Produtos farmacêuticos
- **Lei 10.485/2002** - Veículos e autopeças
- **Lei 10.560/2002** - Produtos de perfumaria

---

**Desenvolvido com ❤️ para otimização tributária inteligente**
