import { create } from 'zustand'
import { comparativosAnaliseService } from '@/services/comparativos-analise-service'
import type {
  Comparativo,
  ConfigComparativo,
  DisponibilidadeDados,
  EstadoComparativo
} from '@/types/comparativo-analise'

interface ComparativosAnaliseState {
  // Estado
  comparativos: Comparativo[]
  comparativoAtual: Comparativo | null
  disponibilidade: DisponibilidadeDados | null
  estado: EstadoComparativo
  loading: boolean
  erro: string | null

  // Actions
  criarComparativo: (config: ConfigComparativo) => Promise<Comparativo | null>
  obterComparativo: (id: string) => Promise<Comparativo | null>
  listarComparativos: (empresaId: string) => Promise<void>
  atualizarComparativo: (id: string, dados: { nome?: string; descricao?: string }) => Promise<Comparativo | null>
  recarregarDadosComparativo: (id: string) => Promise<Comparativo | null>
  excluirComparativo: (id: string) => Promise<void>
  verificarDisponibilidade: (empresaId: string, ano: number) => Promise<void>
  setEstado: (estado: Partial<EstadoComparativo>) => void
  limparErro: () => void
}

export const useComparativosAnaliseStore = create<ComparativosAnaliseState>((set, get) => ({
  // Estado inicial
  comparativos: [],
  comparativoAtual: null,
  disponibilidade: null,
  estado: {
    etapa: 'configuracao',
    progresso: 0
  },
  loading: false,
  erro: null,

  // Actions
  criarComparativo: async (config: ConfigComparativo) => {
    set({ loading: true, erro: null, estado: { etapa: 'processando', progresso: 50 } })
    
    try {
      const comparativo = await comparativosAnaliseService.criarComparativo(config)
      
      set(state => ({
        comparativos: [comparativo, ...state.comparativos],
        comparativoAtual: comparativo,
        loading: false,
        estado: { etapa: 'concluido', progresso: 100 }
      }))
      
      return comparativo
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao criar comparativo'
      set({ loading: false, erro: mensagem, estado: { etapa: 'configuracao', progresso: 0 } })
      return null
    }
  },

  obterComparativo: async (id: string) => {
    set({ loading: true, erro: null })
    
    try {
      const comparativo = await comparativosAnaliseService.obterComparativo(id)
      set({ comparativoAtual: comparativo, loading: false })
      return comparativo
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao obter comparativo'
      set({ loading: false, erro: mensagem })
      return null
    }
  },

  listarComparativos: async (empresaId: string) => {
    set({ loading: true, erro: null })
    
    try {
      const comparativos = await comparativosAnaliseService.listarComparativos(empresaId)
      set({ comparativos, loading: false })
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao listar comparativos'
      set({ loading: false, erro: mensagem })
    }
  },

  excluirComparativo: async (id: string) => {
    set({ loading: true, erro: null })
    
    try {
      await comparativosAnaliseService.excluirComparativo(id)
      
      set(state => ({
        comparativos: state.comparativos.filter(c => c.id !== id),
        comparativoAtual: state.comparativoAtual?.id === id ? null : state.comparativoAtual,
        loading: false
      }))
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao excluir comparativo'
      set({ loading: false, erro: mensagem })
    }
  },

  atualizarComparativo: async (id: string, dados: { nome?: string; descricao?: string }) => {
    set({ loading: true, erro: null })
    
    try {
      const comparativoAtualizado = await comparativosAnaliseService.atualizarComparativo(id, dados)
      
      set(state => ({
        comparativos: state.comparativos.map(c => c.id === id ? comparativoAtualizado : c),
        comparativoAtual: state.comparativoAtual?.id === id ? comparativoAtualizado : state.comparativoAtual,
        loading: false
      }))
      
      return comparativoAtualizado
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao atualizar comparativo'
      set({ loading: false, erro: mensagem })
      return null
    }
  },

  recarregarDadosComparativo: async (id: string) => {
    set({ loading: true, erro: null, estado: { etapa: 'processando', progresso: 50 } })
    
    try {
      // Importar o service completo dinamicamente para evitar circular dependency
      const { ComparativosAnaliseServiceCompleto } = await import('@/services/comparativos-analise-service-completo')
      
      // Atualizar dados no banco
      await ComparativosAnaliseServiceCompleto.atualizarComparativo(id)
      
      // Buscar o comparativo atualizado usando o método existente
      const comparativoAtualizado = await comparativosAnaliseService.obterComparativo(id)
      
      if (!comparativoAtualizado) {
        throw new Error('Não foi possível buscar o comparativo atualizado')
      }
      
      set(state => ({
        comparativos: state.comparativos.map(c => c.id === id ? comparativoAtualizado : c),
        comparativoAtual: state.comparativoAtual?.id === id ? comparativoAtualizado : state.comparativoAtual,
        loading: false,
        estado: { etapa: 'concluido', progresso: 100 }
      }))
      
      return comparativoAtualizado
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao recarregar dados do comparativo'
      set({ loading: false, erro: mensagem, estado: { etapa: 'configuracao', progresso: 0 } })
      return null
    }
  },

  verificarDisponibilidade: async (empresaId: string, ano: number) => {
    set({ loading: true, erro: null })
    
    try {
      const disponibilidade = await comparativosAnaliseService.verificarDisponibilidade(empresaId, ano)
      set({ disponibilidade, loading: false })
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao verificar disponibilidade'
      set({ loading: false, erro: mensagem })
    }
  },

  setEstado: (estadoParcial: Partial<EstadoComparativo>) => {
    set(state => ({
      estado: { ...state.estado, ...estadoParcial }
    }))
  },

  limparErro: () => set({ erro: null })
}))
