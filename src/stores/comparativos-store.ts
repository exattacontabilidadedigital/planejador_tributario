import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { ComparativoSalvo, ComparativoFormData } from '@/types/comparativo'
import { validarComparativo, validarComparativoDuplicado } from '@/lib/validations/comparativo-schema'

// Cliente Supabase
const supabase = createClient()

// Função helper para tratamento de erros
function handleError(error: unknown, operacao: string): string {
  if (error instanceof Error) {
    return `Erro ao ${operacao}: ${error.message}`
  }
  return `Erro desconhecido ao ${operacao}`
}

interface ComparativosState {
  comparativos: ComparativoSalvo[]
  comparativosPorEmpresa: Record<string, ComparativoSalvo[]>
  isLoading: boolean
  operacaoEmAndamento: boolean // Previne operações concorrentes
  loadingStates: {
    fetching: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }
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
      operacaoEmAndamento: false,
      loadingStates: {
        fetching: false,
        creating: false,
        updating: false,
        deleting: false,
      },
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
        // Verificar operação concorrente
        const state = get()
        if (state.operacaoEmAndamento) {
          throw new Error('Já existe uma operação em andamento. Aguarde a conclusão.')
        }

        set({ 
          operacaoEmAndamento: true,
          loadingStates: { ...state.loadingStates, creating: true },
          error: null 
        })
        
        try {
          console.log('🔄 [COMPARATIVOS] Validando dados...')
          
          // VALIDAÇÃO COM ZOD
          const dadosValidados = validarComparativo({
            ...data,
            empresaId
          })
          
          // VERIFICAR DUPLICATA (mesmo nome + empresa)
          console.log('🔍 [COMPARATIVOS] Verificando duplicata...')
          validarComparativoDuplicado(dadosValidados.nome, empresaId, get().comparativos)
          
          // VERIFICAR SE CENÁRIOS EXISTEM
          console.log('🔍 [COMPARATIVOS] Validando existência de cenários...')
          const { data: cenariosExistem, error: checkError } = await supabase
            .from('cenarios')
            .select('id')
            .in('id', dadosValidados.cenariosIds)
          
          if (checkError) {
            console.error('❌ [COMPARATIVOS] Erro ao validar cenários:', checkError.message)
            throw new Error(`Erro ao validar cenários: ${checkError.message}`)
          }
          
          const idsEncontrados = cenariosExistem?.map((c: any) => c.id) || []
          const cenariosInvalidos = dadosValidados.cenariosIds.filter(
            (id) => !idsEncontrados.includes(id)
          )
          
          if (cenariosInvalidos.length > 0) {
            throw new Error(
              `Os seguintes cenários não existem: ${cenariosInvalidos.join(', ')}. ` +
              `Verifique se foram deletados ou se os IDs estão corretos.`
            )
          }
          
          console.log('✅ [COMPARATIVOS] Validação concluída, inserindo no banco...')
          
          const { data: result, error } = await supabase
            .from('comparativos')
            .insert({
              empresa_id: empresaId,
              nome: dadosValidados.nome,
              descricao: dadosValidados.descricao || null,
              cenarios_ids: dadosValidados.cenariosIds,
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
            operacaoEmAndamento: false,
            loadingStates: { ...state.loadingStates, creating: false },
            isLoading: false,
          }))
          
          console.log('✅ [COMPARATIVOS] Comparativo criado com sucesso:', novoComparativo.id)
          return novoComparativo
          
        } catch (error) {
          console.error('❌ [COMPARATIVOS] Erro ao adicionar comparativo:', error)
          
          const errorMessage = handleError(error, 'adicionar comparativo')
          set({ 
            error: errorMessage,
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, creating: false },
            isLoading: false 
          })
          throw error
        }
      },
      
      // Atualizar comparativo existente
      updateComparativo: async (id, data) => {
        // Verificar operação concorrente
        const state = get()
        if (state.operacaoEmAndamento) {
          throw new Error('Já existe uma operação em andamento. Aguarde a conclusão.')
        }

        set({ 
          operacaoEmAndamento: true,
          loadingStates: { ...state.loadingStates, updating: true },
          error: null 
        })
        
        // Backup do estado atual para rollback
        const comparativoOriginal = get().getComparativo(id)
        if (!comparativoOriginal) {
          set({ 
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, updating: false },
            error: 'Comparativo não encontrado' 
          })
          throw new Error('Comparativo não encontrado')
        }
        
        try {
          console.log('🔧 [COMPARATIVOS] Atualizando comparativo:', id)
          
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
              operacaoEmAndamento: false,
              loadingStates: { ...state.loadingStates, updating: false },
              isLoading: false,
            }
          })
          
          console.log('✅ [COMPARATIVOS] Comparativo atualizado com sucesso')
          
        } catch (error) {
          console.error('❌ [COMPARATIVOS] Erro ao atualizar, fazendo rollback...', error)
          
          // ROLLBACK: Restaurar estado original
          set((state) => ({
            comparativos: state.comparativos.map((c) => 
              c.id === id ? comparativoOriginal : c
            ),
            comparativosPorEmpresa: {
              ...state.comparativosPorEmpresa,
              [comparativoOriginal.empresaId]: state.comparativosPorEmpresa[comparativoOriginal.empresaId]?.map((c) =>
                c.id === id ? comparativoOriginal : c
              ) || []
            },
            operacaoEmAndamento: false,
            loadingStates: { ...state.loadingStates, updating: false },
            error: handleError(error, 'atualizar comparativo'),
            isLoading: false,
          }))
          
          throw error
        }
      },
      
      // Deletar comparativo
      deleteComparativo: async (id) => {
        // Verificar operação concorrente
        const state = get()
        if (state.operacaoEmAndamento) {
          throw new Error('Já existe uma operação em andamento. Aguarde a conclusão.')
        }

        set({ 
          operacaoEmAndamento: true,
          loadingStates: { ...state.loadingStates, deleting: true },
          error: null 
        })
        
        try {
          console.log('🗑️ [COMPARATIVOS] Deletando comparativo:', id)
          
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
              operacaoEmAndamento: false,
              loadingStates: { ...state.loadingStates, deleting: false },
              isLoading: false,
            }
          })
          
          console.log('✅ [COMPARATIVOS] Comparativo deletado com sucesso')
          
        } catch (error) {
          console.error('❌ [COMPARATIVOS] Erro ao deletar comparativo:', error)
          
          const errorMessage = handleError(error, 'deletar comparativo')
          set({ 
            error: errorMessage,
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, deleting: false },
            isLoading: false 
          })
          throw new Error(errorMessage)
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
