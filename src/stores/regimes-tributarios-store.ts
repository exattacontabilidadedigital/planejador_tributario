import { create } from "zustand"
import { persist } from "zustand/middleware"
import { comparativosService } from "@/services/comparativos-supabase"
import type { 
  DadosComparativoMensal, 
  ComparativoRegimes, 
  ResumoComparativo,
  RegimeTributario 
} from "@/types/comparativo"

interface RegimesTributariosStore {
  // Estado
  dadosComparativos: DadosComparativoMensal[]
  loading: boolean
  
  // Ações
  adicionarDadoComparativo: (dados: Omit<DadosComparativoMensal, 'id' | 'criadoEm' | 'atualizadoEm'>) => Promise<void>
  atualizarDadoComparativo: (id: string, dados: Partial<DadosComparativoMensal>) => Promise<void>
  removerDadoComparativo: (id: string) => Promise<void>
  carregarDadosEmpresa: (empresaId: string) => Promise<void>
  
  // Seletores
  obterDadosPorEmpresa: (empresaId: string) => DadosComparativoMensal[]
  obterDadosPorMesAno: (empresaId: string, mes: string, ano: number) => ComparativoRegimes
  obterResumoComparativo: (empresaId: string, ano: number) => ResumoComparativo[]
  obterMesesDisponiveis: (empresaId: string, ano: number) => string[]
  
  // Utilitários
  limparDados: () => void
  limparDadosCorrempidos: () => void
  importarDados: (dados: DadosComparativoMensal[]) => void
}

export const useRegimesTributariosStore = create<RegimesTributariosStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      dadosComparativos: [],
      loading: false,

      // Ações
      adicionarDadoComparativo: async (dados) => {
        console.log('🏪 [STORE] Iniciando adicionarDadoComparativo com dados:', dados)
        set({ loading: true })
        try {
          // Salvar no Supabase
          const novoDado = await comparativosService.adicionarDados(dados)
          console.log('🏪 [STORE] Dados adicionados com sucesso:', novoDado)
          
          if (novoDado) {
            // Atualizar estado local
            set((state) => ({
              dadosComparativos: [...state.dadosComparativos, novoDado],
              loading: false
            }))
          }
        } catch (error) {
          console.error('🏪 [STORE] Erro ao adicionar dados comparativos:', error)
          set({ loading: false })
          throw error
        }
      },

      atualizarDadoComparativo: async (id, dadosAtualizados) => {
        console.log('🏪 [STORE] Iniciando atualizarDadoComparativo')
        console.log('🏪 [STORE] ID recebido:', id)
        console.log('🏪 [STORE] Dados recebidos:', dadosAtualizados)
        
        set({ loading: true })
        try {
          // Atualizar no Supabase
          console.log('🏪 [STORE] Chamando comparativosService.atualizarDados...')
          const dadoAtualizado = await comparativosService.atualizarDados(id, dadosAtualizados)
          
          console.log('🏪 [STORE] Resposta do serviço:', dadoAtualizado)
          
          if (dadoAtualizado) {
            // Atualizar estado local
            console.log('🏪 [STORE] Atualizando estado local...')
            set((state) => ({
              dadosComparativos: state.dadosComparativos.map((dado) =>
                dado.id === id ? dadoAtualizado : dado
              ),
              loading: false
            }))
            console.log('✅ [STORE] Atualização concluída com sucesso!')
          } else {
            console.warn('⚠️  [STORE] dadoAtualizado é null/undefined')
            set({ loading: false })
          }
        } catch (error) {
          console.error('❌ [STORE] Erro ao atualizar dados comparativos:', error)
          set({ loading: false })
          throw error
        }
      },

      removerDadoComparativo: async (id) => {
        set({ loading: true })
        try {
          // Remover do Supabase
          const sucesso = await comparativosService.removerDados(id)
          
          if (sucesso) {
            // Atualizar estado local
            set((state) => ({
              dadosComparativos: state.dadosComparativos.filter((dado) => dado.id !== id),
              loading: false
            }))
          }
        } catch (error) {
          console.error('Erro ao remover dados comparativos:', error)
          set({ loading: false })
          throw error
        }
      },

      carregarDadosEmpresa: async (empresaId) => {
        set({ loading: true })
        try {
          // Buscar dados do Supabase
          const dados = await comparativosService.obterDadosPorEmpresa(empresaId)
          
          // Atualizar estado local com os dados da empresa
          set((state) => ({
            dadosComparativos: [
              ...state.dadosComparativos.filter(dado => dado.empresaId !== empresaId),
              ...dados
            ],
            loading: false
          }))
        } catch (error) {
          console.error('Erro ao carregar dados da empresa:', error)
          set({ loading: false })
          throw error
        }
      },

      // Seletores
      obterDadosPorEmpresa: (empresaId) => {
        const state = get()
        try {
          return state.dadosComparativos
            .filter((dado) => {
              // Validar integridade dos dados
              if (!dado || typeof dado !== 'object') return false
              if (!dado.empresaId || dado.empresaId !== empresaId) return false
              if (!dado.id || !dado.mes || !dado.ano || !dado.regime) return false
              
              // Validar se a data é válida
              try {
                const date = dado.criadoEm instanceof Date ? dado.criadoEm : new Date(dado.criadoEm)
                if (isNaN(date.getTime())) return false
              } catch {
                return false
              }
              
              return true
            })
        } catch (error) {
          console.error('Erro ao obter dados por empresa:', error)
          return []
        }
      },

      obterDadosPorMesAno: (empresaId, mes, ano) => {
        const state = get()
        const dadosMesAno = state.dadosComparativos.filter(
          (dado) => dado.empresaId === empresaId && dado.mes === mes && dado.ano === ano
        )

        const resultado: ComparativoRegimes = { mes, ano }

        dadosMesAno.forEach((dado) => {
          switch (dado.regime) {
            case 'lucro_real':
              resultado.lucroReal = dado
              break
            case 'lucro_presumido':
              resultado.lucroPresumido = dado
              break
            case 'simples_nacional':
              resultado.simplesNacional = dado
              break
          }
        })

        return resultado
      },

      obterResumoComparativo: (empresaId, ano) => {
        const state = get()
        const dadosAno = state.dadosComparativos.filter(
          (dado) => dado.empresaId === empresaId && dado.ano === ano
        )

        // Agrupar por regime
        const resumoPorRegime: Record<RegimeTributario, ResumoComparativo> = {
          lucro_real: {
            regime: 'lucro_real',
            nomeRegime: 'Lucro Real',
            receitaTotal: 0,
            impostoTotal: 0,
            icmsTotal: 0,
            pisTotal: 0,
            cofinsTotal: 0,
            irpjTotal: 0,
            csllTotal: 0,
            issTotal: 0,
            outrosTotal: 0,
            cargaTributaria: 0,
            posicao: 'intermediario'
          },
          lucro_presumido: {
            regime: 'lucro_presumido',
            nomeRegime: 'Lucro Presumido',
            receitaTotal: 0,
            impostoTotal: 0,
            icmsTotal: 0,
            pisTotal: 0,
            cofinsTotal: 0,
            irpjTotal: 0,
            csllTotal: 0,
            issTotal: 0,
            outrosTotal: 0,
            cargaTributaria: 0,
            posicao: 'intermediario'
          },
          simples_nacional: {
            regime: 'simples_nacional',
            nomeRegime: 'Simples Nacional',
            receitaTotal: 0,
            impostoTotal: 0,
            icmsTotal: 0,
            pisTotal: 0,
            cofinsTotal: 0,
            irpjTotal: 0,
            csllTotal: 0,
            issTotal: 0,
            outrosTotal: 0,
            cargaTributaria: 0,
            posicao: 'intermediario'
          }
        }

        // Somar valores por regime
        dadosAno.forEach((dado) => {
          const resumo = resumoPorRegime[dado.regime]
          resumo.receitaTotal += dado.receita
          resumo.icmsTotal += dado.icms
          resumo.pisTotal += dado.pis
          resumo.cofinsTotal += dado.cofins
          resumo.irpjTotal += dado.irpj
          resumo.csllTotal += dado.csll
          resumo.issTotal += dado.iss
          resumo.outrosTotal += dado.outros || 0
          resumo.impostoTotal += dado.icms + dado.pis + dado.cofins + dado.irpj + dado.csll + dado.iss + (dado.outros || 0)
        })

        // Calcular carga tributária
        Object.values(resumoPorRegime).forEach((resumo) => {
          if (resumo.receitaTotal > 0) {
            resumo.cargaTributaria = (resumo.impostoTotal / resumo.receitaTotal) * 100
          }
        })

        // Determinar posições e economias
        const resumos = Object.values(resumoPorRegime).filter(r => r.receitaTotal > 0)
        resumos.sort((a, b) => a.impostoTotal - b.impostoTotal)

        if (resumos.length > 0) {
          resumos[0].posicao = 'melhor'
          if (resumos.length > 1) {
            resumos[resumos.length - 1].posicao = 'pior'
            const piorTotal = resumos[resumos.length - 1].impostoTotal
            
            resumos.forEach((resumo, index) => {
              if (index > 0 && index < resumos.length - 1) {
                resumo.posicao = 'intermediario'
              }
              if (resumo.posicao !== 'pior') {
                resumo.economia = piorTotal - resumo.impostoTotal
              }
            })
          }
        }

        return resumos
      },

      obterMesesDisponiveis: (empresaId, ano) => {
        const state = get()
        const meses = new Set<string>()
        
        state.dadosComparativos
          .filter((dado) => dado.empresaId === empresaId && dado.ano === ano)
          .forEach((dado) => meses.add(dado.mes))
        
        return Array.from(meses).sort()
      },

      // Utilitários
      limparDados: () => {
        set({ dadosComparativos: [] })
      },

      limparDadosCorrempidos: () => {
        const state = get()
        const dadosValidos = state.dadosComparativos.filter((dado) => {
          try {
            // Verificar integridade básica
            if (!dado || typeof dado !== 'object') return false
            if (!dado.id || !dado.empresaId || !dado.mes || !dado.ano || !dado.regime) return false
            
            // Verificar se a data é válida
            const date = dado.criadoEm instanceof Date ? dado.criadoEm : new Date(dado.criadoEm)
            if (isNaN(date.getTime())) return false
            
            return true
          } catch {
            return false
          }
        })
        
        if (dadosValidos.length !== state.dadosComparativos.length) {
          console.log(`Removidos ${state.dadosComparativos.length - dadosValidos.length} dados corrompidos`)
          set({ dadosComparativos: dadosValidos })
        }
      },

      importarDados: (dados) => {
        set({ dadosComparativos: dados })
      },
    }),
    {
      name: "regimes-tributarios-storage",
      version: 1,
      // Configuração para lidar corretamente com datas na serialização
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          
          try {
            const data = JSON.parse(str)
            // Converter strings de data de volta para objetos Date
            if (data.state?.dadosComparativos) {
              data.state.dadosComparativos = data.state.dadosComparativos
                .map((item: any) => {
                  try {
                    // Validar se o item tem as propriedades necessárias
                    if (!item || typeof item !== 'object' || !item.id) {
                      return null
                    }
                    
                    return {
                      ...item,
                      criadoEm: item.criadoEm ? new Date(item.criadoEm) : new Date(),
                      atualizadoEm: item.atualizadoEm ? new Date(item.atualizadoEm) : new Date(),
                    }
                  } catch (error) {
                    console.error('Erro ao processar item:', error, item)
                    return null
                  }
                })
                .filter(Boolean) // Remove itens nulos
            }
            return data
          } catch (error) {
            console.error('Erro ao deserializar dados da store:', error)
            // Em caso de erro, limpar o localStorage e retornar estado inicial
            localStorage.removeItem(name)
            return { state: { dadosComparativos: [], loading: false }, version: 1 }
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            console.error('Erro ao serializar dados da store:', error)
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)