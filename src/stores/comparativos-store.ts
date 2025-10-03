import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ComparativoSalvo, ComparativoFormData } from '@/types/comparativo'

interface ComparativosState {
  comparativos: ComparativoSalvo[]
  
  // Actions
  addComparativo: (empresaId: string, data: ComparativoFormData) => ComparativoSalvo
  updateComparativo: (id: string, data: Partial<ComparativoSalvo>) => void
  deleteComparativo: (id: string) => void
  getComparativo: (id: string) => ComparativoSalvo | undefined
  getComparativosByEmpresa: (empresaId: string) => ComparativoSalvo[]
}

export const useComparativosStore = create<ComparativosState>()(
  persist(
    (set, get) => ({
      comparativos: [],
      
      addComparativo: (empresaId, data) => {
        const novoComparativo: ComparativoSalvo = {
          id: `comparativo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          empresaId,
          nome: data.nome,
          descricao: data.descricao,
          cenariosIds: data.cenariosIds,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        }
        
        set((state) => ({
          comparativos: [...state.comparativos, novoComparativo],
        }))
        
        return novoComparativo
      },
      
      updateComparativo: (id, data) => {
        set((state) => ({
          comparativos: state.comparativos.map((comp) =>
            comp.id === id
              ? {
                  ...comp,
                  ...data,
                  atualizadoEm: new Date().toISOString(),
                }
              : comp
          ),
        }))
      },
      
      deleteComparativo: (id) => {
        set((state) => ({
          comparativos: state.comparativos.filter((comp) => comp.id !== id),
        }))
      },
      
      getComparativo: (id) => {
        return get().comparativos.find((comp) => comp.id === id)
      },
      
      getComparativosByEmpresa: (empresaId) => {
        return get().comparativos.filter((comp) => comp.empresaId === empresaId)
      },
    }),
    {
      name: 'comparativos-storage',
    }
  )
)
