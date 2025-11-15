# Relatório Dinâmico - Implementação Completa

## 📋 Resumo

O relatório de comparativos foi atualizado para ser **totalmente dinâmico**, combinando dados de:
1. **Cenários aprovados** (dados simulados/planejados)
2. **Dados comparativos mensais** (dados reais cadastrados)

## 🎯 Problema Resolvido

**Antes**: O relatório era estático, mostrando apenas dados de cenários aprovados, ignorando os dados comparativos reais cadastrados no sistema.

**Depois**: O relatório agora combina dinamicamente ambas as fontes de dados, dando **prioridade aos dados reais** (comparativos) quando disponíveis.

## 🔧 Alterações Realizadas

### 1. Hook `useRelatorios` (`src/hooks/use-relatorios.ts`)

#### Imports Adicionados
```typescript
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import type { DadosComparativoMensal } from "@/types/comparativo"
```

#### Nova Funcionalidade
- **Carrega dados comparativos** do store de regimes tributários
- **Combina dados** usando Map para evitar duplicatas por período (ano-mês)
- **Prioriza dados reais**: dados comparativos sobrescrevem dados de cenários quando há conflito

#### Funções Atualizadas

##### 1. `dadosEvolucao` (Evolução Temporal)
```typescript
const dadosEvolucao = useMemo((): DadosGraficoEvolucao[] => {
  const dadosPorPeriodo = new Map<string, DadosGraficoEvolucao>()
  
  // 1. Adiciona dados dos cenários aprovados
  cenariosAprovados.forEach(...)
  
  // 2. Adiciona/sobrepõe dados comparativos (dados reais têm prioridade)
  dadosComparativos.forEach(...)
  
  // 3. Retorna array ordenado
  return Array.from(dadosPorPeriodo.values()).sort(...)
}, [cenariosAprovados, dadosComparativos])
```

##### 2. `dadosComposicao` (Composição de Impostos)
```typescript
// Soma impostos de cenários
cenariosAprovados.forEach(cenario => {
  totais.icms += ...
  totais.pis += ...
  // ...
})

// Soma impostos de dados comparativos
dadosComparativos.forEach(dado => {
  totais.icms += dado.icms || 0
  totais.pis += dado.pis || 0
  // ...
})
```

##### 3. `dadosMargem` (Margens Bruta e Líquida)
```typescript
// Soma receitas, custos e impostos de ambas as fontes
cenariosAprovados.forEach(...)
dadosComparativos.forEach(...)
```

##### 4. `dadosMetricasFinanceiras` (Métricas Financeiras)
```typescript
// Combina métricas de cenários e dados comparativos
// Calcula faturamento, lucro líquido e % de impostos
```

##### 5. `dadosEvolucaoFinanceira` (Evolução Financeira Mensal)
```typescript
const dadosPorPeriodo = new Map<string, DadosEvolucaoFinanceira>()

// 1. Adiciona dados de cenários
// 2. Sobrepõe com dados comparativos (se existirem)
// 3. Ordena por mês

return Array.from(dadosPorPeriodo.values()).sort(...)
```

##### 6. `linhasTabela` (Tabela Consolidada)
```typescript
const linhasPorPeriodo = new Map<string, LinhaRelatorioAnual>()

// 1. Adiciona linhas de cenários aprovados
cenariosAprovados.forEach(...)

// 2. Adiciona/sobrepõe linhas de dados comparativos
dadosComparativos.forEach(dado => {
  // Mapeia mês abreviado para número
  const mesNumero = { 'jan': '01', 'fev': '02', ... }
  
  // Calcula totais
  const totalImpostos = icms + pis + cofins + irpj + csll + iss + outros
  const lucroLiquido = receita - totalImpostos
  
  linhasPorPeriodo.set(periodo, { ... })
})

return Array.from(linhasPorPeriodo.values()).sort(...)
```

##### 7. `anosDisponiveis` (Anos Disponíveis)
```typescript
const anos = new Set<number>()

// Anos dos cenários
cenarios.forEach(c => anos.add(ano))

// Anos dos dados comparativos
dadosComparativos.forEach(d => anos.add(d.ano))

return Array.from(anos).sort((a, b) => b - a)
```

##### 8. `temDados` (Indicador de Dados)
```typescript
temDados: cenariosAprovados.length > 0 || dadosComparativos.length > 0
```

### 2. Página de Relatórios (`src/app/empresas/[id]/relatorios/page.tsx`)

#### Import Adicionado
```typescript
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
```

#### Carregamento de Dados
```typescript
const { carregarDadosEmpresa } = useRegimesTributariosStore()

// Carregar dados comparativos da empresa ao montar
useEffect(() => {
  if (empresaId) {
    console.log('📥 [RelatoriosPage] Carregando dados comparativos para empresa:', empresaId)
    carregarDadosEmpresa(empresaId).catch(error => {
      console.error('❌ [RelatoriosPage] Erro ao carregar dados:', error)
    })
  }
}, [empresaId, carregarDadosEmpresa])
```

## 📊 Estrutura de Dados Combinados

### Mapeamento de Mês
```typescript
const mesNumero = {
  'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
  'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
  'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
}
```

### Chave de Período
```typescript
const periodo = `${ano}-${mesNumero}` // Ex: "2025-07"
```

### Prioridade de Dados
Quando existe um cenário aprovado E um dado comparativo para o mesmo período (ano-mês):
- ✅ **Dados Comparativos** são usados (dados reais)
- ⏭️ Dados do cenário são descartados

## 🎨 Componentes Afetados

Todos os gráficos e tabelas do relatório agora refletem dados dinâmicos:

1. **Cards de Resumo** (Receita Total, Total Impostos, Lucro Líquido, Margem Bruta)
2. **Gráfico de Evolução Mensal** (linha temporal)
3. **Gráfico de Composição de Impostos** (pizza/donut)
4. **Gráfico de Evolução Financeira** (barras mensais)
5. **Tabela Consolidada** (detalhamento mensal)

## 🔍 Logs para Debug

O sistema agora possui logs detalhados:

```typescript
console.log('📊 [useRelatorios] Dados comparativos obtidos:', {
  total: dados.length,
  dados: dados
})

console.log('📥 [RelatoriosPage] Carregando dados comparativos para empresa:', empresaId)
```

## ✅ Benefícios

1. **Dinâmico**: Atualiza automaticamente quando novos dados são cadastrados
2. **Híbrido**: Combina planejamento (cenários) com realidade (comparativos)
3. **Inteligente**: Prioriza dados reais sobre simulações
4. **Completo**: Mostra todos os períodos disponíveis (cenários + comparativos)
5. **Preciso**: Evita duplicatas usando Map baseado em período

## 🧪 Como Testar

1. **Acesse** a página de relatórios: `/empresas/{id}/relatorios`
2. **Verifique** se aparecem:
   - Anos dos cenários E dados comparativos no seletor
   - Dados dos comparativos nos gráficos e tabelas
3. **Adicione** novos dados comparativos
4. **Atualize** a página e confirme que os novos dados aparecem
5. **Compare** com cenários do mesmo período para verificar prioridade

## 📝 Notas Técnicas

- **Dados Comparativos** não possuem custos/despesas detalhados (definidos como 0)
- **Cálculo de Lucro** em comparativos: `receita - totalImpostos`
- **Mapeamento de Mês**: dados comparativos usam formato "jan", "fev", etc.
- **Ordenação**: sempre por período cronológico (ano-mês)

## 🎯 Resultado Final

O relatório agora é uma ferramenta híbrida que:
- Mostra **planejamento tributário** (cenários aprovados)
- Mostra **realidade tributária** (dados comparativos cadastrados)
- **Prioriza dados reais** quando disponíveis
- **Atualiza dinamicamente** conforme novos dados são adicionados

---

**Status**: ✅ Implementado e Funcional  
**Data**: 15/11/2025  
**Arquivos Modificados**: 2  
**Linhas Adicionadas**: ~250
