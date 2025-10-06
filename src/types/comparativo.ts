/**
 * Tipos relacionados a Comparativos Salvos
 */

export interface ComparativoSalvo {
  id: string
  empresaId: string
  nome: string
  descricao?: string
  cenariosIds: string[] // IDs dos cenários a comparar
  criadoEm: string // ISO date string
  atualizadoEm: string // ISO date string
}

export interface ComparativoFormData {
  nome: string
  descricao?: string
  cenariosIds: string[]
}

/**
 * Tipos relacionados a Comparativos entre Regimes Tributários
 */

export type RegimeTributario = 'lucro_real' | 'lucro_presumido' | 'simples_nacional'

export interface DadosComparativoMensal {
  id: string
  empresaId: string
  mes: string // 'jan', 'fev', etc.
  ano: number
  regime: RegimeTributario
  receita: number
  icms: number
  pis: number
  cofins: number
  irpj: number
  csll: number
  iss: number
  outros?: number
  observacoes?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface ComparativoRegimes {
  mes: string
  ano: number
  lucroReal?: DadosComparativoMensal
  lucroPresumido?: DadosComparativoMensal
  simplesNacional?: DadosComparativoMensal
}

export interface ResumoComparativo {
  regime: RegimeTributario
  nomeRegime: string
  receitaTotal: number
  impostoTotal: number
  icmsTotal: number
  pisTotal: number
  cofinsTotal: number
  irpjTotal: number
  csllTotal: number
  issTotal: number
  outrosTotal: number
  cargaTributaria: number
  economia?: number // Economia em relação ao pior cenário
  posicao: 'melhor' | 'intermediario' | 'pior'
}

export interface DadosGraficoComparativo {
  mes: string
  lucroReal: number
  lucroPresumido: number
  simplesNacional: number
}

export interface FormularioDadosComparativos {
  mes: string
  ano: number
  regime: RegimeTributario
  receita: string
  icms: string
  pis: string
  cofins: string
  irpj: string
  csll: string
  iss: string
  outros: string
  observacoes: string
}

export const MESES_ANO = [
  { value: 'jan', label: 'Janeiro' },
  { value: 'fev', label: 'Fevereiro' },
  { value: 'mar', label: 'Março' },
  { value: 'abr', label: 'Abril' },
  { value: 'mai', label: 'Maio' },
  { value: 'jun', label: 'Junho' },
  { value: 'jul', label: 'Julho' },
  { value: 'ago', label: 'Agosto' },
  { value: 'set', label: 'Setembro' },
  { value: 'out', label: 'Outubro' },
  { value: 'nov', label: 'Novembro' },
  { value: 'dez', label: 'Dezembro' },
] as const

export const REGIMES_TRIBUTARIOS = [
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'simples_nacional', label: 'Simples Nacional' },
] as const
