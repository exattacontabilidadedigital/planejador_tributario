import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cenario, CenarioFormData } from '@/types/cenario'
import type { TaxConfig } from '@/types'

interface CenariosState {
  cenarios: Cenario[]
  
  // Actions
  addCenario: (empresaId: string, data: CenarioFormData, config: TaxConfig) => Cenario
  updateCenario: (id: string, data: Partial<Cenario>) => void
  deleteCenario: (id: string) => void
  getCenario: (id: string) => Cenario | undefined
  getCenariosByEmpresa: (empresaId: string) => Cenario[]
  duplicarCenario: (id: string, novoNome?: string) => Cenario | undefined
  aprovarCenario: (id: string) => void
  arquivarCenario: (id: string) => void
}

export const useCenariosStore = create<CenariosState>()(
  persist(
    (set, get) => ({
      cenarios: [],
      
      addCenario: (empresaId, data, config) => {
        const novoCenario: Cenario = {
          id: `cenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          empresaId,
          nome: data.nome,
          descricao: data.descricao,
          periodo: data.periodo,
          config,
          status: data.status || 'rascunho',
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          tags: [],
        }
        
        set((state) => ({
          cenarios: [...state.cenarios, novoCenario],
        }))
        
        return novoCenario
      },
      
      updateCenario: (id, data) => {
        set((state) => ({
          cenarios: state.cenarios.map((cenario) =>
            cenario.id === id
              ? {
                  ...cenario,
                  ...data,
                  atualizadoEm: new Date().toISOString(),
                }
              : cenario
          ),
        }))
      },
      
      deleteCenario: (id) => {
        set((state) => ({
          cenarios: state.cenarios.filter((cenario) => cenario.id !== id),
        }))
      },
      
      getCenario: (id) => {
        return get().cenarios.find((cenario) => cenario.id === id)
      },
      
      getCenariosByEmpresa: (empresaId) => {
        return get().cenarios.filter((cenario) => cenario.empresaId === empresaId)
      },
      
      duplicarCenario: (id, novoNome) => {
        const cenarioOriginal = get().getCenario(id)
        if (!cenarioOriginal) return undefined
        
        const cenarioDuplicado: Cenario = {
          ...cenarioOriginal,
          id: `cenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nome: novoNome || `${cenarioOriginal.nome} (Cópia)`,
          status: 'rascunho',
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        }
        
        set((state) => ({
          cenarios: [...state.cenarios, cenarioDuplicado],
        }))
        
        return cenarioDuplicado
      },
      
      aprovarCenario: (id) => {
        get().updateCenario(id, { status: 'aprovado' })
      },
      
      arquivarCenario: (id) => {
        get().updateCenario(id, { status: 'arquivado' })
      },
    }),
    {
      name: 'cenarios-storage',
    }
  )
)
