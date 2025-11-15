# Relatório Comparativo - Especificação

## Funcionalidades Principais

O relatório deve apresentar:

### 1. Identificação do Regime Tributário Mais Vantajoso
- Análise comparativa entre regimes
- Indicação clara do regime com menor carga tributária

### 2. Cards de Resumo Financeiro
- **Cenário Principal**: Valores totais em Lucro Real
- **Dados Comparativos**: 
    - Valores totais do regime comparativo
    - Identificação dinâmica do regime (Simples Nacional ou Presumido)
    - Regime extraído automaticamente da coluna "regime" dos dados mensais

### 3. Gráficos Comparativos
- Visualização dos dados do cenário vs dados comparativos
- Comparação clara entre regimes tributários

### 4. Insights do Regime Mais Vantajoso
- Análise das vantagens do regime recomendado
- **Futuro**: Implementação de IA para insights dinâmicos e personalizados

## Problemas Identificados

### Regime Tributário no Card Comparativo
- **Atual**: Regime não é exibido dinamicamente
- **Necessário**: Extrair automaticamente o regime da coluna mensal correspondente (tabela dados comparativos mensal coluna regime)

### Insights Estáticos
- **Atual**: Insights fixos e genéricos
- **Futuro**: Sistema de IA para análise personalizada dos dados
- **Implementação**: Pode ser desenvolvido em fase posterior