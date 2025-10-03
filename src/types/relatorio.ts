import type { Cenario } from "./cenario"

/**
 * Tipos relacionados a Relatórios e Análises
 */

export interface PeriodoRelatorio {
  inicio: string // ISO date string
  fim: string // ISO date string
}

export interface TotaisRelatorio {
  receitaBruta: number
  receitaLiquida: number
  lucroBruto: number
  lucroLiquido: number
  
  // Impostos por tipo
  icmsTotal: number
  pisTotal: number
  cofinsTotal: number
  irpjTotal: number
  csllTotal: number
  issTotal: number
  
  // Métricas
  cargaTributariaEfetiva: number // %
  margemBruta: number // %
  margemLiquida: number // %
}

export interface SerieTemporal {
  periodo: string // "Jan/2025", "Q1 2025", etc
  periodoISO: string // ISO date para ordenação
  receita: number
  impostos: number
  lucro: number
  margem: number
  cargaTributaria: number
}

export interface RelatorioConsolidado {
  empresaId: string
  periodo: PeriodoRelatorio
  cenarios: Cenario[]
  
  // Métricas agregadas
  totais: TotaisRelatorio
  
  // Séries temporais para gráficos
  series: SerieTemporal[]
}

export interface ComposicaoImpostos {
  icms: number
  pis: number
  cofins: number
  irpj: number
  csll: number
  iss: number
}

export interface VariacaoCenario {
  metrica: string
  cenario1Valor: number
  cenario2Valor: number
  variacaoAbsoluta: number
  variacaoPercentual: number
}

// Dados para gráficos
export interface DadosGraficoEvolucao {
  mes: string // "Jan", "Fev", etc
  periodo: string // "2025-01"
  receita: number
  impostos: number
  lucro: number
}

export interface DadosGraficoComposicao {
  nome: string // "ICMS", "PIS/COFINS", etc
  valor: number
  percentual: number
  fill: string // cor hex
}

export interface DadosGraficoMargem {
  categoria: string // "Margem Bruta", "Margem Líquida"
  valor: number
  meta?: number
}

// Linha da tabela consolidada
export interface LinhaRelatorioAnual {
  mes: string
  periodo: string // "2025-01"
  receita: number
  custos: number
  lucroBruto: number
  despesas: number
  icms: number
  pis: number
  cofins: number
  irpj: number
  csll: number
  iss: number
  totalImpostos: number
  lucroLiquido: number
  margemBruta: number
  margemLiquida: number
  cargaTributaria: number
}
