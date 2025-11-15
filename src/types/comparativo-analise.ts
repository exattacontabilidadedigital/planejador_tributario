import type { RegimeTributario } from './comparativo'

// ============================================================================
// TIPOS PARA ANÁLISE E COMPARAÇÃO DE REGIMES TRIBUTÁRIOS
// ============================================================================

/**
 * Configuração para criar um novo comparativo
 */
export interface ConfigComparativo {
  empresaId: string
  nome: string
  descricao?: string
  periodoInicio: string // 'jan', 'fev', etc.
  periodoFim: string
  ano: number
  regimesIncluidos: RegimeTributario[]
  fonteDados: FonteDadosConfig
}

/**
 * Configuração de fontes de dados para cada regime
 */
export interface FonteDadosConfig {
  lucroReal?: FonteDadosLucroReal
  lucroPresumido?: FonteDadosManuais
  simplesNacional?: FonteDadosManuais
}

export interface FonteDadosLucroReal {
  tipo: 'cenarios' | 'manual'
  cenarioIds?: string[] // IDs dos cenários aprovados
}

export interface FonteDadosManuais {
  tipo: 'manual'
  usarDadosExistentes: boolean
}

/**
 * Comparativo salvo no banco
 */
export interface Comparativo {
  id: string
  empresaId: string
  nome: string
  descricao?: string
  periodoInicio: string
  periodoFim: string
  ano: number
  regimesIncluidos: RegimeTributario[]
  fonteDados: FonteDadosConfig
  resultados: ResultadosComparativo
  criadoEm: Date
  atualizadoEm: Date
}

/**
 * Resultados da análise comparativa
 */
export interface ResultadosComparativo {
  lucroReal?: ResultadoRegime
  lucroPresumido?: ResultadoRegime
  simplesNacional?: ResultadoRegime
  
  // Análise geral
  analise: AnaliseComparativa
}

export interface AnaliseComparativa {
  regimeMaisVantajoso: RegimeTributario
  economiaAnual: number // Em R$
  economiaPercentual: number // %
  diferencaMaiorMenor: number // Diferença entre maior e menor carga
  insights: string[]
  recomendacoes: string[]
}

/**
 * Resultado detalhado de um regime tributário
 */
export interface ResultadoRegime {
  regime: RegimeTributario
  receitaTotal: number
  totalImpostos: number
  lucroLiquido: number
  cargaTributaria: number // % sobre receita
  
  // Detalhamento por tipo de imposto
  impostosPorTipo: ImpostosPorTipo
  
  // Dados mensais
  dadosMensais: DadosMensalRegime[]
  
  // Metadados
  mesesComDados: number
  mesesEstimados: number
  dataCalculado: Date
}

export interface ImpostosPorTipo {
  icms: number
  pis: number
  cofins: number
  irpj: number
  csll: number
  iss: number
  outros: number
  das?: number // Apenas Simples Nacional
}

export interface DadosMensalRegime {
  mes: string
  ano: number
  regime?: string // Regime tributário: lucro_real, lucro_presumido, simples_nacional
  receita: number
  impostos: ImpostosPorTipo // Detalhamento por tipo
  totalImpostos?: number // Total de impostos somados
  lucro: number // Lucro líquido (receita - totalImpostos)
  lucroLiquido?: number // Alias para compatibilidade
  cargaTributaria?: number // % sobre receita
  estimado: boolean // Se foi estimado por falta de dados
}

/**
 * Dados do Supabase (formato do banco)
 */
export interface ComparativoSupabase {
  id: string
  empresa_id: string
  nome: string
  descricao: string | null
  tipo: string
  configuracao: any // JSONB
  resultados: any // JSONB
  simulacoes: any[] // JSONB array
  favorito: boolean
  compartilhado: boolean
  tags?: string[]
  ultima_visualizacao?: string
  created_at: string
  updated_at: string
}

/**
 * Estado de carregamento
 */
export interface EstadoComparativo {
  etapa: 'configuracao' | 'fontes' | 'processando' | 'concluido'
  progresso: number // 0-100
  mensagem?: string
}

/**
 * Validação de disponibilidade de dados
 */
export interface DisponibilidadeDados {
  lucroReal: {
    disponivel: boolean
    cenarios: number
    meses: number
  }
  lucroPresumido: {
    disponivel: boolean
    meses: number
  }
  simplesNacional: {
    disponivel: boolean
    meses: number
  }
}

/**
 * Opções de exportação
 */
export interface OpcoesExportacao {
  formato: 'pdf' | 'excel' | 'csv'
  incluirGraficos: boolean
  incluirDetalhamento: boolean
  incluirInsights: boolean
}
