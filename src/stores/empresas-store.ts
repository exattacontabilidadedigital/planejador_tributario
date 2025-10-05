import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { Empresa, EmpresaFormData } from '@/types/empresa'

// Cliente Supabase
const supabase = createClient()

interface EmpresasState {
  empresas: Empresa[]
  empresaAtual: string | null // ID da empresa selecionada
  isLoading: boolean
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
        set({ isLoading: true, error: null })
        
        try {
          console.log('🔄 Tentando inserir empresa:', data)
          
          // Primeiro, vamos verificar se a tabela existe e está acessível
          const { data: tableCheck, error: tableError } = await supabase
            .from('empresas')
            .select('count', { count: 'exact' })
            .limit(0)
          
          console.log('🔍 Verificação da tabela:', { tableCheck, tableError })
          
          if (tableError) {
            console.error('❌ Erro ao acessar tabela empresas:', tableError)
            throw new Error(`Tabela não acessível: ${tableError.message}`)
          }
          
          // Agora tentar a inserção
          const { data: result, error } = await supabase
            .from('empresas')
            .insert({
              nome: data.nome,
              cnpj: data.cnpj || null,
              razao_social: data.razaoSocial,
              regime_tributario: data.regimeTributario,
              setor: data.setor,
              uf: data.uf,
              municipio: data.municipio,
              inscricao_estadual: data.inscricaoEstadual || null,
              inscricao_municipal: data.inscricaoMunicipal || null,
            })
            .select()
            .single()
          
          console.log('📊 Resultado da inserção:', { result, error })
          
          if (error) {
            console.error('❌ Erro detalhado do Supabase:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            })
            
            // Verificar se é erro de RLS
            if (error.code === 'PGRST116' || error.message?.includes('RLS') || error.message?.includes('policy')) {
              throw new Error('Erro de permissão: Row Level Security pode estar bloqueando a operação. Verifique as políticas no Supabase.')
            }
            
            // Verificar se é erro de constraint
            if (error.code === '23505') {
              throw new Error('CNPJ já cadastrado. Verifique se a empresa já existe.')
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
            isLoading: false,
            // Se for a primeira empresa, define como atual
            empresaAtual: state.empresas.length === 0 ? novaEmpresa.id : state.empresaAtual,
          }))
          
          return novaEmpresa
          
        } catch (error) {
          console.error('Erro ao adicionar empresa:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao adicionar empresa',
            isLoading: false 
          })
          throw error
        }
      },
      
      // Atualizar empresa existente
      updateEmpresa: async (id, data) => {
        set({ isLoading: true, error: null })
        
        try {
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
            isLoading: false,
          }))
          
        } catch (error) {
          console.error('Erro ao atualizar empresa:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao atualizar empresa',
            isLoading: false 
          })
          throw error
        }
      },
      
      // Deletar empresa
      deleteEmpresa: async (id) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await supabase
            .from('empresas')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          
          set((state) => ({
            empresas: state.empresas.filter((empresa) => empresa.id !== id),
            empresaAtual: state.empresaAtual === id ? null : state.empresaAtual,
            isLoading: false,
          }))
          
        } catch (error) {
          console.error('Erro ao deletar empresa:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao deletar empresa',
            isLoading: false 
          })
          throw error
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
