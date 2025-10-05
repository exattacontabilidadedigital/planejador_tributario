import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { ComparativoSalvo, ComparativoFormData } from '@/types/comparativo'

// Cliente Supabase
const supabase = createClient()

interface ComparativosState {
  comparativos: ComparativoSalvo[]
  comparativosPorEmpresa: Record<string, ComparativoSalvo[]>
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchComparativos: (empresaId?: string) => Promise<void>
  addComparativo: (empresaId: string, data: ComparativoFormData) => Promise<ComparativoSalvo>
  updateComparativo: (id: string, data: Partial<ComparativoSalvo>) => Promise<void>
  deleteComparativo: (id: string) => Promise<void>
  getComparativo: (id: string) => ComparativoSalvo | undefined
  getComparativosByEmpresa: (empresaId: string) => ComparativoSalvo[]
  clearError: () => void
}

export const useComparativosStore = create<ComparativosState>()(
  persist(
    (set, get) => ({
      comparativos: [],
      comparativosPorEmpresa: {},
      isLoading: false,
      error: null,
      
      // Buscar comparativos do Supabase
      fetchComparativos: async (empresaId) => {
        set({ isLoading: true, error: null })
        
        try {
          let query = supabase
            .from('comparativos')
            .select('*')
            .order('created_at', { ascending: false })
          
          // Se empresaId especificado, filtrar por empresa
          if (empresaId) {
            query = query.eq('empresa_id', empresaId)
          }
          
          const { data, error } = await query
          
          if (error) throw error
          
          // Mapear dados do Supabase para o formato do store
          const comparativos: ComparativoSalvo[] = data.map((row) => ({
            id: row.id,
            empresaId: row.empresa_id,
            nome: row.nome,
            descricao: row.descricao,
            cenariosIds: row.cenarios_ids, // Array no banco
            criadoEm: row.created_at,
            atualizadoEm: row.updated_at,
          }))
          
          // Atualizar estado
          set((state) => {
            const newState = { 
              comparativos,
              isLoading: false,
              comparativosPorEmpresa: { ...state.comparativosPorEmpresa }
            }
            
            // Se filtrou por empresa, atualizar cache específico
            if (empresaId) {
              newState.comparativosPorEmpresa[empresaId] = comparativos
            } else {
              // Se carregou todos, agrupar por empresa
              const grupoPorEmpresa: Record<string, ComparativoSalvo[]> = {}
              comparativos.forEach((comparativo) => {
                if (!grupoPorEmpresa[comparativo.empresaId]) {
                  grupoPorEmpresa[comparativo.empresaId] = []
                }
                grupoPorEmpresa[comparativo.empresaId].push(comparativo)
              })
              newState.comparativosPorEmpresa = grupoPorEmpresa
            }
            
            return newState
          })
          
        } catch (error) {
          console.error('Erro ao buscar comparativos:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao buscar comparativos',
            isLoading: false 
          })
        }
      },
      
      // Adicionar novo comparativo
      addComparativo: async (empresaId, data) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data: result, error } = await supabase
            .from('comparativos')
            .insert({
              empresa_id: empresaId,
              nome: data.nome,
              descricao: data.descricao,
              cenarios_ids: data.cenariosIds,
            })
            .select()
            .single()
          
          if (error) throw error
          
          // Mapear resultado para o formato do store
          const novoComparativo: ComparativoSalvo = {
            id: result.id,
            empresaId: result.empresa_id,
            nome: result.nome,
            descricao: result.descricao,
            cenariosIds: result.cenarios_ids,
            criadoEm: result.created_at,
            atualizadoEm: result.updated_at,
          }
          
          set((state) => ({
            comparativos: [novoComparativo, ...state.comparativos],
            comparativosPorEmpresa: {
              ...state.comparativosPorEmpresa,
              [empresaId]: [novoComparativo, ...(state.comparativosPorEmpresa[empresaId] || [])],
            },
            isLoading: false,
          }))
          
          return novoComparativo
          
        } catch (error) {
          console.error('Erro ao adicionar comparativo:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao adicionar comparativo',
            isLoading: false 
          })
          throw error
        }
      },
      
      // Atualizar comparativo existente
      updateComparativo: async (id, data) => {
        set({ isLoading: true, error: null })
        
        try {
          const updateData: any = {}
          
          // Mapear campos do formato do store para o banco
          if (data.nome !== undefined) updateData.nome = data.nome
          if (data.descricao !== undefined) updateData.descricao = data.descricao
          if (data.cenariosIds !== undefined) updateData.cenarios_ids = data.cenariosIds
          
          const { data: result, error } = await supabase
            .from('comparativos')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          // Atualizar no store local
          set((state) => {
            const updatedComparativos = state.comparativos.map((comp) =>
              comp.id === id
                ? {
                    ...comp,
                    nome: result.nome,
                    descricao: result.descricao,
                    cenariosIds: result.cenarios_ids,
                    atualizadoEm: result.updated_at,
                  }
                : comp
            )
            
            // Atualizar cache por empresa
            const empresaId = result.empresa_id
            const comparativosPorEmpresa = { ...state.comparativosPorEmpresa }
            if (comparativosPorEmpresa[empresaId]) {
              comparativosPorEmpresa[empresaId] = comparativosPorEmpresa[empresaId].map((comp) =>
                comp.id === id
                  ? updatedComparativos.find(c => c.id === id)!
                  : comp
              )
            }
            
            return {
              ...state,
              comparativos: updatedComparativos,
              comparativosPorEmpresa,
              isLoading: false,
            }
          })
          
        } catch (error) {
          console.error('Erro ao atualizar comparativo:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao atualizar comparativo',
            isLoading: false 
          })
          throw error
        }
      },
      
      // Deletar comparativo
      deleteComparativo: async (id) => {
        set({ isLoading: true, error: null })
        
        try {
          // Buscar empresaId antes de deletar
          const comparativoAtual = get().getComparativo(id)
          const empresaId = comparativoAtual?.empresaId
          
          const { error } = await supabase
            .from('comparativos')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          
          set((state) => {
            const newComparativos = state.comparativos.filter((comp) => comp.id !== id)
            const comparativosPorEmpresa = { ...state.comparativosPorEmpresa }
            
            // Atualizar cache por empresa
            if (empresaId && comparativosPorEmpresa[empresaId]) {
              comparativosPorEmpresa[empresaId] = comparativosPorEmpresa[empresaId].filter(
                (comp) => comp.id !== id
              )
            }
            
            return {
              ...state,
              comparativos: newComparativos,
              comparativosPorEmpresa,
              isLoading: false,
            }
          })
          
        } catch (error) {
          console.error('Erro ao deletar comparativo:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao deletar comparativo',
            isLoading: false 
          })
          throw error
        }
      },
      
      // Buscar comparativo por ID (local)
      getComparativo: (id) => {
        return get().comparativos.find((comp) => comp.id === id)
      },
      
      // Buscar comparativos por empresa (local/cache)
      getComparativosByEmpresa: (empresaId) => {
        const state = get()
        return state.comparativosPorEmpresa[empresaId] || 
               state.comparativos.filter((comp) => comp.empresaId === empresaId)
      },
      
      // Limpar erro
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'comparativos-storage',
      // Não persistir isLoading, error e comparativosPorEmpresa (cache)
      partialize: (state) => ({
        comparativos: state.comparativos,
      }),
    }
  )
)
