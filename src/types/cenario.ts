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
  mes?: number // 1-12 (para tipo mensal)
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
  
  // Dados do planejamento
  config: TaxConfig
  
  // Status e controle
  status: StatusCenario
  
  // Metadados
  criadoEm: string // ISO date string
  atualizadoEm: string // ISO date string
  criadoPor?: string
  tags?: string[]
}

export interface CenarioFormData {
  nome: string
  descricao?: string
  periodo: PeriodoCenario
  status: StatusCenario
}
