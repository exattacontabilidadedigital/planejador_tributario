import type { TaxConfig } from "./index"

/**
 * Tipos relacionados a Cenário de Planejamento
 */

export type TipoPeriodo = 'mensal' | 'trimestral' | 'semestral' | 'anual'
export type StatusCenario = 'rascunho' | 'aprovado' | 'arquivado'

export interface PeriodoCenario {
  tipo: TipoPeriodo
  inicio: string // ISO date string
  fim: string // ISO date string
  mes?: string // "01"-"12" (para tipo mensal) - formato string para compatibilidade com schema
  ano: number
  trimestre?: 1 | 2 | 3 | 4 // para tipo trimestral
}

export interface Cenario {
  id: string
  empresaId: string
  
  // Identificação
  nome: string
  descricao?: string
  periodo: PeriodoCenario
  
  // Período de Apuração IRPJ/CSLL
  periodoPagamento?: 'mensal' | 'trimestral' | 'anual'
  
  // Dados do planejamento - CORRIGIDO: usar 'configuracao' em vez de 'config'
  configuracao: TaxConfig
  
  // Status e controle
  status: StatusCenario
  
  // Campos do banco de dados - NOVOS CAMPOS MAPEADOS
  ano?: number
  tipo_periodo?: TipoPeriodo
  data_inicio?: string
  data_fim?: string
  mes?: number
  trimestre?: 1 | 2 | 3 | 4
  criado_por?: string
  tags?: string[]
  
  // Resultados calculados (vindos dos hooks React da UI)
  resultados?: any // JSONB com impostos calculados
  dados_mensais?: any // JSONB com dados mensais
  
  // Metadados
  criadoEm: string // ISO date string (created_at)
  atualizadoEm: string // ISO date string (updated_at)
}

export interface CenarioFormData {
  nome: string
  descricao?: string
  periodo: PeriodoCenario
  periodoPagamento?: 'mensal' | 'trimestral' | 'anual'
  status: StatusCenario
  // Campos opcionais para salvar resultados já calculados pela UI
  resultados?: any // JSONB com impostos calculados
  dados_mensais?: any // JSONB com dados mensais
}
