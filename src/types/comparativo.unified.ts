/**
 * TIPOS UNIFICADOS PARA COMPARATIVOS
 * 
 * Este arquivo consolida todas as definições de tipos relacionadas a comparativos,
 * substituindo os arquivos duplicados:
 * - comparativo.ts
 * - comparativo-analise.ts  
 * - comparativo-analise-completo.ts
 */

// ============================================
// TIPOS BASE
// ============================================

export type RegimeTributario = 'lucro_real' | 'lucro_presumido' | 'simples_nacional'

export type MesAno = 'jan' | 'fev' | 'mar' | 'abr' | 'mai' | 'jun' | 
                     'jul' | 'ago' | 'set' | 'out' | 'nov' | 'dez'

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

// ============================================
// DADOS COMPARATIVOS MENSAIS
// ============================================

export interface DadosComparativoMensal {
  id: string
  empresaId: string
  mes: MesAno
  ano: number
  regime: RegimeTributario
  receita: number
  icms: number
  pis: number
  cofins: number
  irpj: number
  csll: number
  iss: number
  outros: number
  observacoes?: string
  criadoEm: Date | string
  atualizadoEm: Date | string
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

// ============================================
// COMPARATIVO (ANÁLISE COMPLETA)
// ============================================

export interface ConfigComparativo {
  empresaId: string
  nome: string
  descricao?: string
  ano: number
  meses: MesAno[]
  cenarios: string[] // IDs dos cenários a comparar
}

export interface ResultadoRegime {
  regime: RegimeTributario
  totalImpostos: number
  cargaTributaria: number
  economia?: number
  breakdown: {
    icms: number
    pis: number
    cofins: number
    irpj: number
    csll: number
    iss: number
    outros: number
  }
}

export interface ComparativoMensal {
  mes: MesAno
  ano: number
  receita: number
  regimes: Record<RegimeTributario, ResultadoRegime>
  melhorRegime: RegimeTributario
  economia: number
}

export interface Comparativo {
  id: string
  empresaId: string
  nome: string
  descricao?: string
  ano: number
  meses: MesAno[]
  cenarios: string[]
  resultados: ComparativoMensal[]
  totais: {
    receita: number
    impostosPorRegime: Record<RegimeTributario, number>
    economiaTotal: number
    melhorRegime: RegimeTributario
  }
  insights: Insight[]
  recomendacoes: Recomendacao[]
  criadoEm: Date | string
  atualizadoEm: Date | string
}

// ============================================
// INSIGHTS E RECOMENDAÇÕES
// ============================================

export type TipoInsight = 
  | 'economia_potencial'
  | 'regime_otimo'
  | 'variacao_carga'
  | 'oportunidade_credito'
  | 'alerta_carga_alta'

export interface Insight {
  tipo: TipoInsight
  severidade: 'info' | 'warning' | 'success' | 'error'
  titulo: string
  descricao: string
  valor?: number
  periodo?: string
  metadata?: Record<string, any>
}

export type TipoRecomendacao =
  | 'mudanca_regime'
  | 'otimizacao_creditos'
  | 'planejamento_despesas'
  | 'analise_lucro_presumido'
  | 'analise_simples_nacional'

export interface Recomendacao {
  tipo: TipoRecomendacao
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  titulo: string
  descricao: string
  impactoEstimado?: number
  acoes: string[]
  metadata?: Record<string, any>
}

// ============================================
// DISPONIBILIDADE DE DADOS
// ============================================

export interface DisponibilidadeMensal {
  mes: MesAno
  ano: number
  regimesDisponiveis: RegimeTributario[]
  completo: boolean
}

export interface DisponibilidadeDados {
  empresaId: string
  ano: number
  meses: DisponibilidadeMensal[]
  totalMesesCompletos: number
  regimesMaisFrequentes: RegimeTributario[]
}

// ============================================
// ESTADO DO COMPARATIVO
// ============================================

export type EtapaComparativo = 
  | 'configuracao'
  | 'validacao'
  | 'processando'
  | 'gerando_insights'
  | 'concluido'
  | 'erro'

export interface EstadoComparativo {
  etapa: EtapaComparativo
  progresso: number
  mensagem?: string
}

// ============================================
// FILTROS E ORDENAÇÃO
// ============================================

export interface FiltrosComparativos {
  empresaId?: string
  ano?: number
  regimes?: RegimeTributario[]
  dataInicio?: Date
  dataFim?: Date
  busca?: string
}

export type OrdenacaoComparativos = 
  | 'nome_asc'
  | 'nome_desc'
  | 'data_asc'
  | 'data_desc'
  | 'economia_asc'
  | 'economia_desc'

// ============================================
// EXPORTAÇÃO E RELATÓRIOS
// ============================================

export interface ConfigExportacao {
  formato: 'pdf' | 'excel' | 'csv'
  incluirGraficos: boolean
  incluirInsights: boolean
  incluirRecomendacoes: boolean
  incluirDetalhamento: boolean
}

export interface DadosRelatorio {
  comparativo: Comparativo
  empresa: {
    id: string
    nome: string
    cnpj?: string
  }
  geradoEm: Date
  geradoPor?: string
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface ErroValidacao {
  campo: string
  mensagem: string
  tipo: 'required' | 'invalid' | 'out_of_range'
}

export interface RespostaAPI<T> {
  sucesso: boolean
  dados?: T
  erro?: string
  errosValidacao?: ErroValidacao[]
}

// ============================================
// TYPE GUARDS
// ============================================

export function isRegimeTributario(value: string): value is RegimeTributario {
  return ['lucro_real', 'lucro_presumido', 'simples_nacional'].includes(value)
}

export function isMesAno(value: string): value is MesAno {
  return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].includes(value)
}

// ============================================
// HELPERS
// ============================================

export function formatarRegime(regime: RegimeTributario): string {
  return REGIMES_TRIBUTARIOS.find(r => r.value === regime)?.label || regime
}

export function formatarMes(mes: MesAno): string {
  return MESES_ANO.find(m => m.value === mes)?.label || mes
}

export function calcularCargaTributaria(impostos: number, receita: number): number {
  if (receita === 0) return 0
  return (impostos / receita) * 100
}

export function calcularEconomia(
  impostosRegimeAtual: number,
  impostosRegimeAlternativo: number
): number {
  return Math.max(0, impostosRegimeAtual - impostosRegimeAlternativo)
}
