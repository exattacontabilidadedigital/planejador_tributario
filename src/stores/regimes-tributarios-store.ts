import { create } from "zustand"
import { persist } from "zustand/middleware"
import { comparativosService } from "@/services/comparativos-supabase"
import { 
  validarDadoComparativo, 
  verificarDuplicataDadoComparativo,
  validarValoresRealistas 
} from "@/lib/validations/dados-comparativos-schema"
import type { 
  DadosComparativoMensal, 
  ComparativoRegimes, 
  ResumoComparativo,
  RegimeTributario 
} from "@/types/comparativo"

// Função helper para tratamento de erros
function handleError(error: unknown, operacao: string): string {
  if (error instanceof Error) {
    return `Erro ao ${operacao}: ${error.message}`
  }
  return `Erro desconhecido ao ${operacao}`
}

interface RegimesTributariosStore {
  // Estado
  dadosComparativos: DadosComparativoMensal[]
  loading: boolean
  operacaoEmAndamento: boolean // Previne operações concorrentes
  loadingStates: {
    fetching: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }
  error: string | null
  
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
  importarDados: (dados: DadosComparativoMensal[]) => void
  clearError: () => void
}

export const useRegimesTributariosStore = create<RegimesTributariosStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      dadosComparativos: [],
      loading: false,
      operacaoEmAndamento: false,
      loadingStates: {
        fetching: false,
        creating: false,
        updating: false,
        deleting: false,
      },
      error: null,

      // Ações
      adicionarDadoComparativo: async (dados) => {
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
          console.log('🏪 [STORE] Iniciando adicionarDadoComparativo com dados:', dados)
          
          // VALIDAÇÃO COM ZOD
          const dadosValidados = validarDadoComparativo(dados)
          
          // VERIFICAR DUPLICATA
          console.log('🔍 [STORE] Verificando duplicata...')
          verificarDuplicataDadoComparativo(
            dadosValidados.empresaId,
            dadosValidados.mes,
            dadosValidados.ano,
            dadosValidados.regime,
            get().dadosComparativos
          )
          
          // VALIDAR VALORES REALISTAS
          const totalImpostos = 
            dadosValidados.icms + 
            dadosValidados.pis + 
            dadosValidados.cofins + 
            dadosValidados.irpj + 
            dadosValidados.csll + 
            dadosValidados.iss + 
            (dadosValidados.outros || 0)
          
          validarValoresRealistas(dadosValidados.receita, totalImpostos)
          
          console.log('✅ [STORE] Validação concluída, salvando no banco...')
          
          // Salvar no Supabase
          const novoDado = await comparativosService.adicionarDados(dadosValidados)
          console.log('✅ [STORE] Dados adicionados com sucesso:', novoDado)
          
          if (novoDado) {
            // Atualizar estado local
            set((state) => ({
              dadosComparativos: [...state.dadosComparativos, novoDado],
              operacaoEmAndamento: false,
              loadingStates: { ...state.loadingStates, creating: false },
              loading: false
            }))
          } else {
            throw new Error('Dados não foram salvos corretamente')
          }
        } catch (error) {
          console.error('❌ [STORE] Erro ao adicionar dados comparativos:', error)
          
          const errorMessage = handleError(error, 'adicionar dados comparativos')
          set({ 
            error: errorMessage,
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, creating: false },
            loading: false 
          })
          throw error
        }
      },

      atualizarDadoComparativo: async (id, dadosAtualizados) => {
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
        const dadoOriginal = get().dadosComparativos.find(d => d.id === id)
        if (!dadoOriginal) {
          set({ 
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, updating: false },
            error: 'Dado comparativo não encontrado' 
          })
          throw new Error('Dado comparativo não encontrado')
        }
        
        try {
          console.log('🔧 [STORE] Atualizando dado comparativo:', id)
          
          // Atualizar no Supabase
          const dadoAtualizado = await comparativosService.atualizarDados(id, dadosAtualizados)
          
          if (dadoAtualizado) {
            // Atualizar estado local
            set((state) => ({
              dadosComparativos: state.dadosComparativos.map((dado) =>
                dado.id === id ? dadoAtualizado : dado
              ),
              operacaoEmAndamento: false,
              loadingStates: { ...state.loadingStates, updating: false },
              loading: false
            }))
            console.log('✅ [STORE] Dado comparativo atualizado com sucesso')
          } else {
            throw new Error('Dados não foram atualizados corretamente')
          }
        } catch (error) {
          console.error('❌ [STORE] Erro ao atualizar, fazendo rollback...', error)
          
          // ROLLBACK: Restaurar estado original
          set((state) => ({
            dadosComparativos: state.dadosComparativos.map((d) => 
              d.id === id ? dadoOriginal : d
            ),
            operacaoEmAndamento: false,
            loadingStates: { ...state.loadingStates, updating: false },
            error: handleError(error, 'atualizar dado comparativo'),
            loading: false
          }))
          
          throw error
        }
      },

      removerDadoComparativo: async (id) => {
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
          console.log('🗑️ [STORE] Removendo dado comparativo:', id)
          
          // Backup do estado atual
          const stateBackup = get().dadosComparativos
          
          // Remover do Supabase
          const sucesso = await comparativosService.removerDados(id)
          
          if (sucesso) {
            // Atualizar estado local
            set((state) => ({
              dadosComparativos: state.dadosComparativos.filter((dado) => dado.id !== id),
              operacaoEmAndamento: false,
              loadingStates: { ...state.loadingStates, deleting: false },
              loading: false
            }))
            console.log('✅ [STORE] Dado comparativo removido com sucesso')
          } else {
            throw new Error('Dados não foram removidos corretamente')
          }
        } catch (error) {
          console.error('❌ [STORE] Erro ao remover dados comparativos:', error)
          
          const errorMessage = handleError(error, 'remover dado comparativo')
          set({ 
            error: errorMessage,
            operacaoEmAndamento: false,
            loadingStates: { ...get().loadingStates, deleting: false },
            loading: false 
          })
          throw error
        }
      },

      carregarDadosEmpresa: async (empresaId) => {
        set({ 
          loading: true,
          loadingStates: { ...get().loadingStates, fetching: true },
          error: null 
        })
        
        try {
          console.log('📥 [STORE] Carregando dados da empresa:', empresaId)
          
          // Buscar dados do Supabase
          const dados = await comparativosService.obterDadosPorEmpresa(empresaId)
          
          console.log('📥 [STORE] Dados recebidos do Supabase:', {
            total: dados.length,
            dados: dados
          })
          
          // Atualizar estado local com os dados da empresa
          set((state) => ({
            dadosComparativos: [
              ...state.dadosComparativos.filter(dado => dado.empresaId !== empresaId),
              ...dados
            ],
            loadingStates: { ...state.loadingStates, fetching: false },
            loading: false
          }))
          
          console.log(`✅ [STORE] ${dados.length} registro(s) carregado(s) e adicionados ao estado`)
          console.log('📊 [STORE] Estado atual da store:', {
            totalDadosComparativos: get().dadosComparativos.length,
            dadosDaEmpresa: get().dadosComparativos.filter(d => d.empresaId === empresaId).length
          })
        } catch (error) {
          console.error('❌ [STORE] Erro ao carregar dados da empresa:', error)
          
          const errorMessage = handleError(error, 'carregar dados da empresa')
          set({ 
            error: errorMessage,
            loadingStates: { ...get().loadingStates, fetching: false },
            loading: false 
          })
          throw error
        }
      },

      // Seletores
      obterDadosPorEmpresa: (empresaId) => {
        const state = get()
        console.log('🔍 [STORE] obterDadosPorEmpresa chamado:', {
          empresaId,
          totalDadosNaStore: state.dadosComparativos.length,
          primeirosDados: state.dadosComparativos.slice(0, 3)
        })
        
        try {
          const dadosFiltrados = state.dadosComparativos
            .filter((dado) => {
              // Validar integridade dos dados
              if (!dado || typeof dado !== 'object') {
                console.log('❌ [STORE] Dado inválido (não é objeto):', dado)
                return false
              }
              if (!dado.empresaId || dado.empresaId !== empresaId) {
                console.log('❌ [STORE] EmpresaId não corresponde:', { 
                  dadoEmpresaId: dado.empresaId, 
                  empresaIdBuscado: empresaId 
                })
                return false
              }
              if (!dado.id || !dado.mes || !dado.ano || !dado.regime) {
                console.log('❌ [STORE] Campos obrigatórios faltando:', {
                  id: dado.id,
                  mes: dado.mes,
                  ano: dado.ano,
                  regime: dado.regime
                })
                return false
              }
              
              // Validar se a data é válida
              try {
                const date = dado.criadoEm instanceof Date ? dado.criadoEm : new Date(dado.criadoEm)
                if (isNaN(date.getTime())) {
                  console.log('❌ [STORE] Data inválida:', dado.criadoEm)
                  return false
                }
              } catch (err) {
                console.log('❌ [STORE] Erro ao validar data:', err)
                return false
              }
              
              console.log('✅ [STORE] Dado válido:', {
                id: dado.id,
                mes: dado.mes,
                ano: dado.ano,
                regime: dado.regime
              })
              return true
            })
          
          console.log('✅ [STORE] Total de dados filtrados:', dadosFiltrados.length)
          return dadosFiltrados
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
        set({ dadosComparativos: [], error: null })
      },

      importarDados: (dados) => {
        console.log(`📊 [STORE] Importando ${dados.length} registro(s)`)
        set({ dadosComparativos: dados, error: null })
      },
      
      clearError: () => {
        set({ error: null })
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