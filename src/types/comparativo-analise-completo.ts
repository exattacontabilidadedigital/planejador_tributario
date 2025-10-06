import type { RegimeTributario } from './comparativo'

// ============================================================================
// TIPOS PARA ANÁLISE E COMPARAÇÃO AVANÇADA DE REGIMES TRIBUTÁRIOS
// ============================================================================

// ============================================
// ENUMS E TIPOS
// ============================================

export type TipoComparativo = 'simples' | 'multiplo' | 'temporal' | 'por_imposto' | 'cenarios'

export type TipoInsight = 'economia' | 'alerta' | 'tendencia' | 'breakeven' | 'outlier' | 'projecao'

export type TipoRecomendacao = 'mudanca_regime' | 'otimizacao_tributaria' | 'alerta' | 'oportunidade' | 'reducao_custo'

export type PrioridadeRecomendacao = 'alta' | 'media' | 'baixa'

export type TipoAlerta = 'limite_receita' | 'mudanca_faixa' | 'variacao_atipica' | 'prazo' | 'inconsistencia'

export type TipoCenarioLR = 'todos' | 'melhor' | 'pior' | 'medio' | 'selecionados'

// ============================================
// CONFIGURAÇÃO
// ============================================

export interface ConfigComparativo {
  empresaId: string
  nome: string
  descricao?: string
  tipo: TipoComparativo
  mesesSelecionados: string[] // ['01', '02', '03']
  ano: number
  
  // Dados de Lucro Real
  lucroReal: {
    incluir: boolean
    cenarioIds: string[]
    tipo: TipoCenarioLR
  }
  
  // Dados Manuais
  dadosManuais: {
    lucroPresumido: {
      incluir: boolean
      dadosIds?: string[]
    }
    simplesNacional: {
      incluir: boolean
      dadosIds?: string[]
    }
  }
}

// ============================================
// RESULTADO POR REGIME
// ============================================

export interface ResultadoRegime {
  regime: RegimeTributario
  cenarioId?: string // Se for Lucro Real
  cenarioNome?: string
  
  // Valores totais do período
  receitaTotal: number
  
  // Impostos por tipo
  impostos: ImpostosPorTipo
  totalImpostos: number
  
  // Resultados
  lucroLiquido: number
  cargaTributaria: number // percentual
  
  // Dados mensais
  dadosMensais: DadosMensalRegime[]
  
  // Cobertura
  mesesComDados: string[]
  mesesSemDados: string[]
  percentualCobertura: number
}

export interface ImpostosPorTipo {
  icms: number
  pis: number
  cofins: number
  irpj: number
  csll: number
  iss: number
  cpp: number
  das?: number
  outros: number
  [key: string]: number | undefined // Index signature para acesso dinâmico
}

export interface DadosMensalRegime {
  mes: string
  ano: number
  receita: number
  impostos: ImpostosPorTipo
  totalImpostos: number
  lucroLiquido: number
  cargaTributaria: number
}

// ============================================
// ANÁLISE E COMPARAÇÃO
// ============================================

export interface AnaliseComparativa {
  // Vencedor geral
  vencedor: {
    regime: RegimeTributario
    cenarioId?: string
    cenarioNome?: string
    economia: number
    economiaPercentual: number
    justificativa: string
  }
  
  // Comparação entre todos os regimes
  comparacao: {
    regimes: Record<string, ResultadoRegime>
    diferencaMaxima: number
    diferencaMinima: number
  }
  
  // Análise específica de Lucro Real (se múltiplos cenários)
  variacaoLucroReal?: {
    cenarioMelhor: ResultadoRegime
    cenarioPior: ResultadoRegime
    cenarioMedio: ResultadoRegime
    amplitude: number
    amplitudePercentual: number
    desviopadrao: number
  }
  
  // Análise por imposto
  analisePorImposto: AnalisePorImposto
  
  // Cobertura geral
  cobertura: {
    mesesSelecionados: string[]
    mesesComDados: string[]
    mesesSemDados: string[]
    percentualCobertura: number
    regimesIncompletos: string[]
  }
  
  // Insights automáticos
  insights: Insight[]
  
  // Recomendações
  recomendacoes: Recomendacao[]
  
  // Alertas
  alertas: Alerta[]
  
  // Break-even points
  breakEvenPoints?: BreakEvenPoint[]
  
  // Tendências
  tendencias?: Tendencia[]
}

export interface AnalisePorImposto {
  icms: ComparacaoImposto
  pis: ComparacaoImposto
  cofins: ComparacaoImposto
  irpj: ComparacaoImposto
  csll: ComparacaoImposto
  iss: ComparacaoImposto
  cpp: ComparacaoImposto
  das?: ComparacaoImposto
  outros: ComparacaoImposto
}

export interface ComparacaoImposto {
  tipo: string
  valores: Record<string, number> // regime -> valor
  vencedor: string
  maiorValor: number
  menorValor: number
  economia: number
  percentualSobreTotal: Record<string, number>
}

// ============================================
// INSIGHTS E RECOMENDAÇÕES
// ============================================

export interface Insight {
  id: string
  tipo: TipoInsight
  icone: string
  titulo: string
  descricao: string
  valor?: number
  percentual?: number
  destaque: boolean
  ordem: number
}

export interface Recomendacao {
  id: string
  tipo: TipoRecomendacao
  titulo: string
  descricao: string
  impactoFinanceiro: number
  impactoPercentual: number
  prioridade: PrioridadeRecomendacao
  acoes: string[]
  prazo?: string
  complexidade?: 'baixa' | 'media' | 'alta'
}

export interface Alerta {
  id: string
  tipo: TipoAlerta
  nivel: 'info' | 'warning' | 'error'
  titulo: string
  descricao: string
  valor?: number
  dataLimite?: Date
  requer_acao: boolean
}

export interface BreakEvenPoint {
  regimes: [RegimeTributario, RegimeTributario]
  receitaBreakEven: number
  mesProjetado?: string
  anoProjetado?: number
  descricao: string
}

export interface Tendencia {
  tipo: 'crescimento' | 'reducao' | 'estabilidade' | 'volatilidade'
  metrica: string // 'carga_tributaria', 'impostos', 'lucro'
  regime?: RegimeTributario
  variacao: number
  variacaoPercentual: number
  descricao: string
  projecao?: {
    proximoMes: number
    proximoTrimestre: number
    proximoAno: number
  }
}

// ============================================
// SIMULAÇÕES
// ============================================

export interface Simulacao {
  id: string
  nome: string
  descricao: string
  tipo: 'variacao_receita' | 'variacao_aliquota' | 'mix_produtos' | 'cenario_otimista' | 'cenario_pessimista'
  
  parametros: {
    variacaoReceita?: number // percentual
    variacaoAliquotas?: Record<string, number> // imposto -> nova alíquota
    variacaoMixProdutos?: Record<string, number>
    outrosAjustes?: Record<string, any>
  }
  
  resultados: {
    regimes: Record<string, ResultadoRegime>
    novoVencedor?: {
      regime: RegimeTributario
      mudou: boolean
      economia: number
    }
    diferencaEconomia: number
    impactoLucroLiquido: number
    insights: Insight[]
  }
}

// ============================================
// COMPARATIVO COMPLETO
// ============================================

export interface ComparativoCompleto {
  id: string
  empresaId: string
  nome: string
  descricao?: string
  tipo: TipoComparativo
  
  // Configuração original
  configuracao: ConfigComparativo
  
  // Resultados processados
  resultados: AnaliseComparativa
  
  // Simulações realizadas
  simulacoes?: Simulacao[]
  
  // Metadata
  criadoEm: Date
  atualizadoEm: Date
  ultimaVisualizacao?: Date
  favorito: boolean
  compartilhado: boolean
  tags?: string[]
}

// ============================================
// DISPONIBILIDADE DE DADOS
// ============================================

export interface DisponibilidadeDados {
  lucroReal: {
    disponivel: boolean
    cenarios: CenarioDisponivel[]
    mesesCobertos: string[]
    totalMeses: number
  }
  lucroPresumido: {
    disponivel: boolean
    dados: DadoMensalDisponivel[]
    mesesCobertos: string[]
    totalMeses: number
  }
  simplesNacional: {
    disponivel: boolean
    dados: DadoMensalDisponivel[]
    mesesCobertos: string[]
    totalMeses: number
  }
}

export interface CenarioDisponivel {
  id: string
  nome: string
  tipo: 'conservador' | 'moderado' | 'otimista'
  mesesCobertos: string[]
  totalMeses: number
  receitaTotal: number
  totalImpostos: number
}

export interface DadoMensalDisponivel {
  id: string
  mes: string
  ano: number
  receita: number
  totalImpostos: number
}

// ============================================
// DADOS DE ENTRADA
// ============================================

export interface DadosCenarioLucroReal {
  cenarioId: string
  mes: string
  ano: number
  receita: number
  impostos: ImpostosPorTipo
}

export interface DadosManualRegime {
  id: string
  regime: RegimeTributario
  mes: string
  ano: number
  receita: number
  impostos: ImpostosPorTipo
}

// ============================================
// HELPERS E UTILITÁRIOS
// ============================================

export interface HeatmapCobertura {
  meses: string[]
  regimes: {
    regime: string
    label: string
    cobertura: boolean[] // true se tem dados para aquele mês
  }[]
  // Mapeamento adicional para facilitar acesso
  coberturaPorMes: Record<number, Record<string, boolean>> // mes -> regime -> temDados
  coberturaPorRegime: Record<string, boolean[]> // regime -> [temDados por mês]
  mesesComDados: number[]
  mesesSemDados: number[]
  percentualCobertura: number
  regimesIncompletos: string[]
}

export interface ResumoComparativo {
  totalRegimes: number
  totalCenarios: number
  totalMeses: number
  receitaTotal: number
  impostoTotal: number
  economiaMaxima: number
  regimeVencedor: string
}
