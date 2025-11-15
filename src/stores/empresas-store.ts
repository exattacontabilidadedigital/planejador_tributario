import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { Empresa, EmpresaFormData } from '@/types/empresa'
import { validarEmpresa, validarCNPJUnico } from '@/lib/validations/empresa-schema'

// Cliente Supabase
const supabase = createClient()

// Função helper para tratamento de erros
function handleError(error: unknown, operacao: string): string {
  if (error instanceof Error) {
    return `Erro ao ${operacao}: ${error.message}`
  }
  return `Erro desconhecido ao ${operacao}`
}

interface EmpresasState {
  empresas: Empresa[]
  empresaAtual: string | null // ID da empresa selecionada
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
  fetchEmpresas: () => Promise<void>
  addEmpresa: (data: EmpresaFormData) => Promise<Empresa>
  updateEmpresa: (id: string, data: Partial<EmpresaFormData>) => Promise<void>
  deleteEmpresa: (id: string) => Promise<void>
  setEmpresaAtual: (id: string | null) => void
  getEmpresa: (id: string) => Empresa | undefined
  clearError: () => void
}

export const useEmpresasStore = create<EmpresasState>()(
  persist(
    (set, get) => ({
      empresas: [],
      empresaAtual: null,
      isLoading: false,
      operacaoEmAndamento: false,
      loadingStates: {
        fetching: false,
        creating: false,
        updating: false,
        deleting: false,
      },
      error: null,
      
      // Buscar todas as empresas do Supabase
      fetchEmpresas: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          // Mapear dados do Supabase para o formato do store
          const empresas: Empresa[] = data.map((row) => ({
            id: row.id,
            nome: row.nome,
            cnpj: row.cnpj || '',
            razaoSocial: row.razao_social,
            regimeTributario: row.regime_tributario,
            setor: row.setor,
            uf: row.uf,
            municipio: row.municipio,
            inscricaoEstadual: row.inscricao_estadual,
            inscricaoMunicipal: row.inscricao_municipal,
            logoUrl: row.logo_url,
            criadoEm: row.created_at,
            atualizadoEm: row.updated_at,
          }))
          
          set({ 
            empresas,
            isLoading: false,
            // Se não há empresa atual e existem empresas, seleciona a primeira
            empresaAtual: get().empresaAtual || (empresas.length > 0 ? empresas[0].id : null)
          })
          
        } catch (error) {
          console.error('Erro ao buscar empresas:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao buscar empresas',
            isLoading: false 
          })
        }
      },
      
      // Adicionar nova empresa
      addEmpresa: async (data) => {
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
          console.log('🔄 [EMPRESAS] Validando dados da empresa...')
          
          // VALIDAÇÃO COM ZOD
          const dadosValidados = validarEmpresa({
            ...data,
            empresaId: '' // Não usado na criação, mas exigido pelo schema
          })
          
          // VERIFICAR CNPJ DUPLICADO
          if (dadosValidados.cnpj) {
            console.log('🔍 [EMPRESAS] Verificando CNPJ duplicado...')
            validarCNPJUnico(dadosValidados.cnpj, get().empresas)
          }
          
          console.log('✅ [EMPRESAS] Validação concluída, inserindo no banco...')
          
          const { data: result, error } = await supabase
            .from('empresas')
            .insert({
              nome: dadosValidados.nome,
              cnpj: dadosValidados.cnpj || null,
              razao_social: dadosValidados.razaoSocial,
              regime_tributario: dadosValidados.regimeTributario,
              setor: dadosValidados.setor,
              uf: dadosValidados.uf,
              municipio: dadosValidados.municipio,
              inscricao_estadual: dadosValidados.inscricaoEstadual || null,
              inscricao_municipal: dadosValidados.inscricaoMunicipal || null,
            })
            .select()
            .single()
          
          if (error) {
            console.error('❌ [EMPRESAS] Erro do Supabase:', error)
            
            // Verificar erro de RLS
            if (error.code === 'PGRST116' || error.message?.includes('RLS') || error.message?.includes('policy')) {
              throw new Error('Erro de permissão: Row Level Security pode estar bloqueando a operação.')
            }
            
            // Verificar erro de constraint (CNPJ duplicado no DB)
            if (error.code === '23505') {
              throw new Error('CNPJ já cadastrado no banco de dados.')
            }
            
            throw error
          }
          
          // Mapear resultado para o formato do store
          const novaEmpresa: Empresa = {
            id: result.id,
            nome: result.nome,
            cnpj: result.cnpj || '',
            razaoSocial: result.razao_social,
            regimeTributario: result.regime_tributario as 'lucro-real' | 'lucro-presumido' | 'simples',
            setor: result.setor,
            uf: result.uf,
            municipio: result.municipio,
            inscricaoEstadual: result.inscricao_estadual || '',
            inscricaoMunicipal: result.inscricao_municipal || '',
            logoUrl: result.logo_url,
            criadoEm: result.created_at,
            atualizadoEm: result.updated_at,
          }
          
          set((state) => ({
            empresas: [novaEmpresa, ...state.empresas],
            operacaoEmAndamento: false,
            loadingStates: { ...state.loadingStates, creating: false },
            isLoading: false,
            empresaAtual: state.empresas.length === 0 ? novaEmpresa.id : state.empresaAtual,
          }))
          
          console.log('✅ [EMPRESAS] Empresa criada com sucesso:', novaEmpresa.id)
          return novaEmpresa
          
        } catch (error) {
          console.error('❌ [EMPRESAS] Erro ao adicionar empresa:', error)
          
          const errorMessage = handleError(error, 'adicionar empresa')
          set({ 
            error: errorMessage,
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, creating: false },
            isLoading: false 
          })
          throw error
        }
      },
      
      // Atualizar empresa existente
      updateEmpresa: async (id, data) => {
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
        const empresaOriginal = get().getEmpresa(id)
        if (!empresaOriginal) {
          set({ 
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, updating: false },
            error: 'Empresa não encontrada' 
          })
          throw new Error('Empresa não encontrada')
        }
        
        try {
          console.log('🔧 [EMPRESAS] Atualizando empresa:', id)
          
          const updateData: any = {}
          
          // Mapear campos do formato do store para o banco
          if (data.nome !== undefined) updateData.nome = data.nome
          if (data.cnpj !== undefined) updateData.cnpj = data.cnpj || null
          if (data.razaoSocial !== undefined) updateData.razao_social = data.razaoSocial
          if (data.regimeTributario !== undefined) updateData.regime_tributario = data.regimeTributario
          if (data.setor !== undefined) updateData.setor = data.setor
          if (data.uf !== undefined) updateData.uf = data.uf
          if (data.municipio !== undefined) updateData.municipio = data.municipio
          if (data.inscricaoEstadual !== undefined) updateData.inscricao_estadual = data.inscricaoEstadual || null
          if (data.inscricaoMunicipal !== undefined) updateData.inscricao_municipal = data.inscricaoMunicipal || null
          
          const { data: result, error } = await supabase
            .from('empresas')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          // Atualizar no store local
          set((state) => ({
            empresas: state.empresas.map((empresa) =>
              empresa.id === id
                ? {
                    ...empresa,
                    nome: result.nome,
                    cnpj: result.cnpj || '',
                    razaoSocial: result.razao_social,
                    regimeTributario: result.regime_tributario,
                    setor: result.setor,
                    uf: result.uf,
                    municipio: result.municipio,
                    inscricaoEstadual: result.inscricao_estadual,
                    inscricaoMunicipal: result.inscricao_municipal,
                    logoUrl: result.logo_url,
                    atualizadoEm: result.updated_at,
                  }
                : empresa
            ),
            operacaoEmAndamento: false,
            loadingStates: { ...state.loadingStates, updating: false },
            isLoading: false,
          }))
          
          console.log('✅ [EMPRESAS] Empresa atualizada com sucesso')
          
        } catch (error) {
          console.error('❌ [EMPRESAS] Erro ao atualizar, fazendo rollback...', error)
          
          // ROLLBACK: Restaurar estado original
          set((state) => ({
            empresas: state.empresas.map((e) => 
              e.id === id ? empresaOriginal : e
            ),
            operacaoEmAndamento: false,
            loadingStates: { ...state.loadingStates, updating: false },
            error: handleError(error, 'atualizar empresa'),
            isLoading: false,
          }))
          
          throw error
        }
      },
      
      // Deletar empresa
      deleteEmpresa: async (id) => {
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
          const empresaAtual = get().getEmpresa(id)
          if (!empresaAtual) {
            throw new Error('Empresa não encontrada')
          }
          
          console.log('🗑️ [EMPRESAS] Verificando cenários e comparativos associados...')
          
          // VERIFICAR SE EMPRESA TEM CENÁRIOS
          const { data: cenarios, error: checkCenariosError } = await supabase
            .from('cenarios')
            .select('id, nome')
            .eq('empresa_id', id)
            .limit(5)
          
          if (checkCenariosError) {
            console.error('❌ [EMPRESAS] Erro ao verificar cenários:', checkCenariosError.message)
          }
          
          if (cenarios && cenarios.length > 0) {
            const nomes = cenarios.slice(0, 3).map((c: any) => c.nome).join(', ')
            const extras = cenarios.length > 3 ? ` e mais ${cenarios.length - 3}` : ''
            throw new Error(
              `Não é possível deletar esta empresa pois ela possui ${cenarios.length} cenário(s) associado(s): ${nomes}${extras}. ` +
              `Delete os cenários primeiro.`
            )
          }
          
          // VERIFICAR SE EMPRESA TEM COMPARATIVOS
          const { data: comparativos, error: checkComparativosError } = await supabase
            .from('comparativos')
            .select('id, nome')
            .eq('empresa_id', id)
            .limit(5)
          
          if (checkComparativosError) {
            console.error('❌ [EMPRESAS] Erro ao verificar comparativos:', checkComparativosError.message)
          }
          
          if (comparativos && comparativos.length > 0) {
            const nomes = comparativos.slice(0, 3).map((c: any) => c.nome).join(', ')
            const extras = comparativos.length > 3 ? ` e mais ${comparativos.length - 3}` : ''
            throw new Error(
              `Não é possível deletar esta empresa pois ela possui ${comparativos.length} comparativo(s) associado(s): ${nomes}${extras}. ` +
              `Delete os comparativos primeiro.`
            )
          }
          
          console.log('✅ [EMPRESAS] Empresa não possui dependências, prosseguindo com deleção...')
          
          // Backup do estado atual
          const stateBackup = {
            empresas: get().empresas,
            empresaAtual: get().empresaAtual
          }
          
          const { error } = await supabase
            .from('empresas')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          
          set((state) => ({
            empresas: state.empresas.filter((empresa) => empresa.id !== id),
            empresaAtual: state.empresaAtual === id ? null : state.empresaAtual,
            operacaoEmAndamento: false,
            loadingStates: { ...state.loadingStates, deleting: false },
            isLoading: false,
          }))
          
          console.log('✅ [EMPRESAS] Empresa deletada com sucesso')
          
        } catch (error) {
          console.error('❌ [EMPRESAS] Erro ao deletar empresa:', error)
          
          const errorMessage = handleError(error, 'deletar empresa')
          set({ 
            error: errorMessage,
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, deleting: false },
            isLoading: false 
          })
          throw new Error(errorMessage)
        }
      },
      
      // Definir empresa atual (local apenas)
      setEmpresaAtual: (id) => {
        set({ empresaAtual: id })
      },
      
      // Buscar empresa por ID (local)
      getEmpresa: (id) => {
        return get().empresas.find((empresa) => empresa.id === id)
      },
      
      // Limpar erro
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'empresas-storage',
      // Não persistir isLoading e error
      partialize: (state) => ({
        empresas: state.empresas,
        empresaAtual: state.empresaAtual,
      }),
    }
  )
)
