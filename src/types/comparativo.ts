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
