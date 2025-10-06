import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { Cenario, CenarioFormData, TipoPeriodo, StatusCenario } from '@/types/cenario'
import type { TaxConfig } from '@/types'
import { validateCenarioData, validateCenarioCreate } from '@/lib/validations/cenario'
import { log } from '@/lib/logger'
import { sanitizeCenarioInput, rateLimit } from '@/lib/security'
import { dataTransformers } from '@/lib/data-transformers'
// REMOVIDO: import { calcularImpostos, gerarDadosMensais } from '@/lib/calcular-impostos'
// Os cálculos devem vir dos hooks React que já existem, não de funções simplificadas!

// Cliente Supabase
const supabase = createClient()

// Função utilitária para tratamento de erro
const handleError = (error: unknown, operacao: string): string => {
  log.error(`Erro na operação ${operacao}`, {
    component: 'CenariosStore',
    action: operacao
  }, error instanceof Error ? error : new Error(String(error)))
  
  if (error instanceof Error) {
    // Erros de validação customizada
    if (error.message.includes('obrigatório') || 
        error.message.includes('caracteres') || 
        error.message.includes('entre') ||
        error.message.includes('inválido')) {
      return error.message
    }
    
    // Erros do Supabase
    if (error.message.includes('duplicate key')) {
      return 'Já existe um cenário com este nome'
    }
    if (error.message.includes('foreign key')) {
      return 'Empresa não encontrada'
    }
    if (error.message.includes('not found')) {
      return 'Cenário não encontrado'
    }
    if (error.message.includes('permission')) {
      return 'Sem permissão para esta operação'
    }
    
    return error.message
  }
  
  return `Erro inesperado ao ${operacao.toLowerCase()}`
}

interface CenariosState {
  cenarios: Cenario[]
  cenariosPorEmpresa: Record<string, Cenario[]>
  isLoading: boolean
  error: string | null
  
  // Loading states granulares para melhor UX
  loadingStates: {
    fetching: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    duplicating: boolean
    approving: boolean
  }
  
  // Actions
  fetchCenarios: (empresaId?: string) => Promise<void>
  addCenario: (empresaId: string, data: CenarioFormData, config: TaxConfig) => Promise<Cenario>
  updateCenario: (id: string, data: Partial<Cenario>) => Promise<void>
  deleteCenario: (id: string) => Promise<void>
  getCenario: (id: string) => Cenario | undefined
  getCenariosByEmpresa: (empresaId: string) => Cenario[]
  duplicarCenario: (id: string, novoNome?: string) => Promise<Cenario | undefined>
  aprovarCenario: (id: string) => Promise<void>
  arquivarCenario: (id: string) => Promise<void>
  clearError: () => void
}

export const useCenariosStore = create<CenariosState>()(
  persist(
    (set, get) => {
      // Log inicial para debug
      setTimeout(() => {
        const state = get()
        console.log('🏗️ [CENÁRIOS STORE] Store inicializado com estado:', {
          cenarios: state.cenarios.length,
          cenariosDetalhes: state.cenarios.map(c => ({ id: c.id, nome: c.nome, empresaId: c.empresaId }))
        })
      }, 100)
      
      return {
        cenarios: [],
        cenariosPorEmpresa: {},
        isLoading: false,
        error: null,
        
        // Loading states granulares
        loadingStates: {
          fetching: false,
          creating: false,
        updating: false,
        deleting: false,
        duplicating: false,
        approving: false,
      },
      // Buscar cenários do Supabase
      fetchCenarios: async (empresaId) => {
        console.log('🔍 [CENÁRIOS STORE] fetchCenarios iniciado para empresa:', empresaId)
        console.log('🔍 [CENÁRIOS STORE] Estado atual antes do fetch:', {
          cenarios: get().cenarios.length,
          isLoading: get().isLoading
        })
        
        set((state) => ({ 
          isLoading: true, 
          error: null,
          loadingStates: { ...state.loadingStates, fetching: true }
        }))
        
        try {
          log.info('Buscando cenários', {
            component: 'CenariosStore',
            action: 'fetchCenarios',
            metadata: { empresaId }
          })
          
          let query = supabase
            .from('cenarios')
            .select('*')
            .order('created_at', { ascending: false })
          
          // Se empresaId especificado, filtrar por empresa
          if (empresaId) {
            query = query.eq('empresa_id', empresaId)
          }
          
          const { data, error } = await query
          
          console.log('📊 [CENÁRIOS STORE] Resposta do Supabase:', {
            sucesso: !error,
            quantidadeResultados: data?.length || 0,
            error: error?.message,
            dados: data?.map(d => ({ id: d.id, nome: d.nome, empresa_id: d.empresa_id }))
          })
          
          if (error) {
            console.error('🚨 [CENÁRIOS] Erro do Supabase:', error)
            throw error
          }
          
          log.info('Cenários carregados com sucesso', {
            component: 'CenariosStore',
            action: 'fetchCenarios',
            metadata: { count: data.length, empresaId }
          })
          
          // Mapear dados do Supabase para o formato do store
          const cenarios: Cenario[] = data.map((row) => {
            const configuracao = row.configuracao || {}
            const periodo = configuracao.periodo || {}
            
            // Determinar tipo de período baseado no nome do cenário
            const nomeMinusculo = row.nome.toLowerCase()
            const mesesNomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                               'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
            const isMonthName = mesesNomes.some(mes => nomeMinusculo.includes(mes))
            
            const tipoCalculado = periodo.tipo || (isMonthName ? 'mensal' : 'anual') as TipoPeriodo
            
            // Se é mensal e tem nome de mês, calcular data específica
            let inicioData = periodo.inicio
            let fimData = periodo.fim
            
            if (tipoCalculado === 'mensal' && isMonthName) {
              const mesIndex = mesesNomes.findIndex(mes => nomeMinusculo.includes(mes))
              if (mesIndex !== -1) {
                const ano = row.ano || 2025
                inicioData = new Date(ano, mesIndex, 1).toISOString()
                fimData = new Date(ano, mesIndex + 1, 0).toISOString() // Último dia do mês
              }
            }
            
            if (!inicioData) {
              inicioData = new Date(row.ano || 2025, 0, 1).toISOString()
            }
            if (!fimData) {
              fimData = new Date(row.ano || 2025, 11, 31).toISOString()
            }
            
            return {
              id: row.id,
              empresaId: row.empresa_id,
              nome: row.nome,
              descricao: row.descricao || '',
              periodo: {
                tipo: tipoCalculado,
                inicio: inicioData,
                fim: fimData,
                ano: row.ano || 2025,
                mes: periodo.mes || row.mes || undefined,
                trimestre: periodo.trimestre as (1 | 2 | 3 | 4) || row.trimestre as (1 | 2 | 3 | 4) || undefined,
              },
              // CORRIGIDO: usar 'configuracao' em vez de 'config'
              configuracao: configuracao,
              
              // Campos do banco de dados - ADICIONADOS NOVOS CAMPOS
              ano: row.ano,
              tipo_periodo: row.tipo_periodo as TipoPeriodo,
              data_inicio: row.data_inicio,
              data_fim: row.data_fim,
              mes: row.mes,
              trimestre: row.trimestre as (1 | 2 | 3 | 4),
              criado_por: row.criado_por,
              tags: row.tags || [],
              
              status: (row.status || 'rascunho') as StatusCenario,
              criadoEm: row.created_at,
              atualizadoEm: row.updated_at,
            }
          })
          
          log.debug('Cenários mapeados com sucesso', {
            component: 'CenariosStore',
            action: 'fetchCenarios',
            metadata: { mappedCount: cenarios.length }
          })
          
          // Atualizar estado
          set((state) => {
            console.log('📝 [CENÁRIOS STORE] Atualizando estado com cenários:', {
              cenariosRecebidos: cenarios.length,
              empresaFiltro: empresaId,
              cenarios: cenarios.map(c => ({ id: c.id, nome: c.nome, empresaId: c.empresaId }))
            })
            
            const newState = { 
              cenarios,
              isLoading: false,
              cenariosPorEmpresa: { ...state.cenariosPorEmpresa }
            }
            
            // Se filtrou por empresa, atualizar cache específico
            if (empresaId) {
              newState.cenariosPorEmpresa[empresaId] = cenarios
            } else {
              // Se carregou todos, agrupar por empresa
              const grupoPorEmpresa: Record<string, Cenario[]> = {}
              cenarios.forEach((cenario) => {
                if (!grupoPorEmpresa[cenario.empresaId]) {
                  grupoPorEmpresa[cenario.empresaId] = []
                }
                grupoPorEmpresa[cenario.empresaId].push(cenario)
              })
              newState.cenariosPorEmpresa = grupoPorEmpresa
            }
            
            return newState
          })
          
        } catch (error) {
          console.error('Erro ao buscar cenários:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao buscar cenários',
            isLoading: false 
          })
        }
      },
      
      // Adicionar novo cenário
      addCenario: async (empresaId, data, config) => {
        set({ isLoading: true, error: null })
        
        try {
          console.log('🔧 [CENÁRIOS] Adicionando cenário:', { empresaId, data, config })
          
          // VALIDAÇÃO ROBUSTA COM ZOD
          const currentYear = new Date().getFullYear()
          const ano = data.periodo?.ano || currentYear
          const status = data.status || 'rascunho'
          
          const cenarioParaValidar = {
            empresaId,
            nome: data.nome,
            descricao: data.descricao,
            periodo: data.periodo || {
              tipo: 'anual' as TipoPeriodo,
              inicio: new Date(ano, 0, 1).toISOString(),
              fim: new Date(ano, 11, 31).toISOString(),
              ano: ano
            },
            configuracao: config,
            status: status,
            tags: []
          }

          const validation = validateCenarioData(cenarioParaValidar)
          if (!validation.success) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`)
          }
          
          // 💰 ACEITAR RESULTADOS SE FORNECIDOS
          // Os resultados devem vir calculados dos hooks React (useMemoriaICMS, etc)
          // Não tentamos recalcular aqui porque as fórmulas são complexas
          console.log('💰 [CENÁRIOS] Salvando resultados fornecidos:', data.resultados ? 'SIM' : 'NÃO')
          
          // Preparar dados apenas com colunas que existem na tabela
          const insertData = {
            empresa_id: empresaId,
            nome: data.nome.trim(),
            descricao: data.descricao?.trim() || null,
            ano: ano,
            configuracao: {
              ...config,
              // Salvar informações de período na configuração
              periodo: data.periodo || {
                tipo: 'anual',
                inicio: new Date(ano, 0, 1).toISOString(),
                fim: new Date(ano, 11, 31).toISOString(),
                ano: ano
              }
            },
            // 💰 SALVAR RESULTADOS SE FORNECIDOS (calculados pela UI)
            ...(data.resultados && { resultados: data.resultados }),
            // 📅 SALVAR DADOS MENSAIS SE FORNECIDOS
            ...(data.dados_mensais && { dados_mensais: data.dados_mensais }),
            status: status,
          }
          
          console.log('📤 [CENÁRIOS] Dados para inserção:', insertData)
          
          const { data: result, error } = await supabase
            .from('cenarios')
            .insert(insertData)
            .select()
            .single()
          
          if (error) {
            console.error('🚨 [CENÁRIOS] Erro do Supabase:', error)
            throw error
          }
          
          console.log('✅ [CENÁRIOS] Cenário criado:', result)
          
          // 💼 SINCRONIZAR DESPESAS DINÂMICAS NA TABELA NORMALIZADA
          const despesasDinamicas = config.despesasDinamicas || []
          if (despesasDinamicas.length > 0) {
            console.log(`💼 [CENÁRIOS] Inserindo ${despesasDinamicas.length} despesas dinâmicas na tabela normalizada`)
            
            const despesasParaInserir = despesasDinamicas.map(d => ({
              cenario_id: result.id,
              descricao: d.descricao,
              valor: d.valor,
              tipo: d.tipo,
              credito: d.credito,
              categoria: d.categoria || null
            }))
            
            const { error: despesasError } = await supabase
              .from('despesas_dinamicas')
              .insert(despesasParaInserir)
            
            if (despesasError) {
              console.warn('⚠️ [CENÁRIOS] Erro ao inserir despesas dinâmicas:', despesasError)
              // Não lança erro para não bloquear criação do cenário
            } else {
              console.log(`✅ [CENÁRIOS] ${despesasDinamicas.length} despesas dinâmicas inseridas com sucesso`)
            }
          }
          
          // Mapear resultado para o formato do store
          const configuracao = result.configuracao || {}
          const periodo = configuracao.periodo || {
            tipo: 'anual' as TipoPeriodo,
            inicio: new Date(result.ano, 0, 1).toISOString(),
            fim: new Date(result.ano, 11, 31).toISOString(),
            ano: result.ano
          }
          
          const novoCenario: Cenario = {
            id: result.id,
            empresaId: result.empresa_id,
            nome: result.nome,
            descricao: result.descricao || '',
            periodo: {
              tipo: periodo.tipo,
              inicio: periodo.inicio,
              fim: periodo.fim,
              ano: result.ano,
              mes: periodo.mes || undefined,
              trimestre: periodo.trimestre as (1 | 2 | 3 | 4) || undefined,
            },
            configuracao: configuracao,
            status: result.status as StatusCenario,
            criadoEm: result.created_at,
            atualizadoEm: result.updated_at,
            criado_por: result.criado_por || undefined,
            tags: result.tags || [],
          }
          
          set((state) => ({
            cenarios: [novoCenario, ...state.cenarios],
            cenariosPorEmpresa: {
              ...state.cenariosPorEmpresa,
              [empresaId]: [novoCenario, ...(state.cenariosPorEmpresa[empresaId] || [])],
            },
            isLoading: false,
          }))
          
          return novoCenario
          
        } catch (error) {
          const errorMessage = handleError(error, 'adicionar cenário')
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw new Error(errorMessage)
        }
      },
      
      // Atualizar cenário existente
      updateCenario: async (id, data) => {
        set({ isLoading: true, error: null })
        
        try {
          console.log('🔧 [CENÁRIOS] Atualizando cenário:', id)
          
          // VALIDAÇÃO ROBUSTA
          if (!id) {
            throw new Error('ID do cenário é obrigatório')
          }
          
          if (data.nome !== undefined) {
            if (!data.nome?.trim()) {
              throw new Error('Nome do cenário é obrigatório')
            }
            if (data.nome.trim().length > 255) {
              throw new Error('Nome do cenário não pode ter mais de 255 caracteres')
            }
          }
          
          if (data.descricao !== undefined && data.descricao && data.descricao.length > 1000) {
            throw new Error('Descrição não pode ter mais de 1000 caracteres')
          }
          
          if (data.periodo?.ano !== undefined) {
            const currentYear = new Date().getFullYear()
            if (data.periodo.ano < 2020 || data.periodo.ano > currentYear + 10) {
              throw new Error(`Ano deve estar entre 2020 e ${currentYear + 10}`)
            }
          }
          
          if (data.status !== undefined) {
            const validStatuses = ['rascunho', 'aprovado', 'arquivado'] as const
            if (!validStatuses.includes(data.status as any)) {
              throw new Error('Status inválido')
            }
          }
          
          const updateData: any = {}
          
          // Mapear campos do formato do store para o banco
          if (data.nome !== undefined) updateData.nome = data.nome.trim()
          if (data.descricao !== undefined) updateData.descricao = data.descricao?.trim() || null
          if (data.periodo !== undefined) {
            // Somente ano existe na tabela atual
            if (data.periodo.ano) updateData.ano = data.periodo.ano
            // As demais propriedades do período vão para configuracao
          }
          
          // 💰 SE ALTEROU A CONFIGURAÇÃO OU RESULTADOS, SALVAR
          if (data.configuracao !== undefined) {
            updateData.configuracao = data.configuracao
          }
          
          // 💰 SE FORNECEU RESULTADOS RECALCULADOS, SALVAR
          // (Os resultados devem vir dos hooks React da UI)
          if (data.resultados !== undefined) {
            console.log('💰 [CENÁRIOS] Salvando resultados recalculados pela UI')
            updateData.resultados = data.resultados
          }
          
          if (data.dados_mensais !== undefined) {
            updateData.dados_mensais = data.dados_mensais
          }
          
          if (data.status !== undefined) updateData.status = data.status
          
          const { data: result, error } = await supabase
            .from('cenarios')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
          
          if (error) {
            console.error('❌ [CENÁRIOS] Erro ao atualizar:', error.message)
            throw error
          }
          
          console.log('✅ [CENÁRIOS] Cenário atualizado com sucesso')
          
          // 💼 SINCRONIZAR DESPESAS DINÂMICAS NA TABELA NORMALIZADA
          const configuracaoAtual = data.configuracao || result.configuracao || {}
          const despesasDinamicas = configuracaoAtual.despesasDinamicas || []
          
          if (despesasDinamicas.length > 0) {
            console.log(`� [DESPESAS] Sincronizando ${despesasDinamicas.length} despesas dinâmicas...`)
          }
            
            // 1. Deletar todas as despesas existentes deste cenário
            
            const { error: deleteError } = await supabase
              .from('despesas_dinamicas')
              .delete()
              .eq('cenario_id', id)
            
            if (deleteError) {
              console.error('❌ [DESPESAS] Erro ao deletar despesas antigas:', deleteError.message)
            }
            
            // 2. Inserir despesas atualizadas
            if (despesasDinamicas.length > 0) {
              const despesasParaInserir = despesasDinamicas.map((d: any) => ({
                cenario_id: id,
                descricao: d.descricao,
                valor: d.valor,
                tipo: d.tipo,
                credito: d.credito,
                categoria: d.categoria || null
              }))
              
              const { error: insertError } = await supabase
                .from('despesas_dinamicas')
                .insert(despesasParaInserir)
              
              if (insertError) {
                console.error('❌ [DESPESAS] Erro ao inserir:', insertError.message)
              } else {
                const comCredito = despesasParaInserir.filter((d: any) => d.credito === 'com-credito').length
                const semCredito = despesasParaInserir.filter((d: any) => d.credito === 'sem-credito').length
                console.log(`✅ [DESPESAS] ${despesasDinamicas.length} despesas sincronizadas (${comCredito} com crédito, ${semCredito} sem crédito)`)
              }
              console.log('═══════════════════════════════════════════════════════════\n')
            }
          
          // Atualizar no store local
          set((state) => {
            const updatedCenarios = state.cenarios.map((cenario) =>
              cenario.id === id
                ? {
                    ...cenario,
                    nome: result.nome,
                    descricao: result.descricao || '',
                    periodo: {
                      tipo: result.tipo_periodo as TipoPeriodo,
                      inicio: result.data_inicio,
                      fim: result.data_fim,
                      ano: result.ano,
                      mes: result.mes || undefined,
                      trimestre: result.trimestre as (1 | 2 | 3 | 4) || undefined,
                    },
                    configuracao: result.configuracao || {},
                    status: result.status as StatusCenario,
                    tags: result.tags || [],
                    atualizadoEm: result.updated_at,
                  }
                : cenario
            )
            
            // Atualizar cache por empresa
            const empresaId = result.empresa_id
            const cenariosPorEmpresa = { ...state.cenariosPorEmpresa }
            if (cenariosPorEmpresa[empresaId]) {
              cenariosPorEmpresa[empresaId] = cenariosPorEmpresa[empresaId].map((cenario) =>
                cenario.id === id
                  ? updatedCenarios.find(c => c.id === id)!
                  : cenario
              )
            }
            
            return {
              ...state,
              cenarios: updatedCenarios,
              cenariosPorEmpresa,
              isLoading: false,
            }
          })
          
        } catch (error) {
          const errorMessage = handleError(error, 'atualizar cenário')
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw new Error(errorMessage)
        }
      },
      
      // Deletar cenário
      deleteCenario: async (id) => {
        set({ isLoading: true, error: null })
        
        try {
          // Buscar empresaId antes de deletar
          const cenarioAtual = get().getCenario(id)
          const empresaId = cenarioAtual?.empresaId
          
          const { error } = await supabase
            .from('cenarios')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          
          set((state) => {
            const newCenarios = state.cenarios.filter((cenario) => cenario.id !== id)
            const cenariosPorEmpresa = { ...state.cenariosPorEmpresa }
            
            // Atualizar cache por empresa
            if (empresaId && cenariosPorEmpresa[empresaId]) {
              cenariosPorEmpresa[empresaId] = cenariosPorEmpresa[empresaId].filter(
                (cenario) => cenario.id !== id
              )
            }
            
            return {
              ...state,
              cenarios: newCenarios,
              cenariosPorEmpresa,
              isLoading: false,
            }
          })
          
        } catch (error) {
          const errorMessage = handleError(error, 'deletar cenário')
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw new Error(errorMessage)
        }
      },
      
      // Buscar cenário por ID (local)
      getCenario: (id) => {
        return get().cenarios.find((cenario) => cenario.id === id)
      },
      
      // Buscar cenários por empresa (local/cache)
      getCenariosByEmpresa: (empresaId) => {
        const state = get()
        return state.cenariosPorEmpresa[empresaId] || 
               state.cenarios.filter((cenario) => cenario.empresaId === empresaId)
      },
      
      // Duplicar cenário
      duplicarCenario: async (id, novoNome) => {
        const cenarioOriginal = get().getCenario(id)
        if (!cenarioOriginal) return undefined
        
        try {
          const cenarioData: CenarioFormData = {
            nome: novoNome || `${cenarioOriginal.nome} (Cópia)`,
            descricao: cenarioOriginal.descricao,
            periodo: { ...cenarioOriginal.periodo },
            status: 'rascunho',
          }
          
          return await get().addCenario(
            cenarioOriginal.empresaId,
            cenarioData,
            { ...cenarioOriginal.configuracao }
          )
        } catch (error) {
          const errorMessage = handleError(error, 'duplicar cenário')
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw new Error(errorMessage)
        }
      },
      
      // Aprovar cenário
      aprovarCenario: async (id) => {
        console.log('✅ [CENÁRIOS] Aprovando cenário:', id)
        try {
          await get().updateCenario(id, { status: 'aprovado' })
          console.log('✅ [CENÁRIOS] Cenário aprovado com sucesso:', id)
        } catch (error) {
          console.error('❌ [CENÁRIOS] Erro ao aprovar cenário:', error)
          throw error
        }
      },
      
      // Arquivar cenário
      arquivarCenario: async (id) => {
        await get().updateCenario(id, { status: 'arquivado' })
      },
      
      // Limpar erro
      clearError: () => {
        set({ error: null })
      },
    }},
    {
      name: 'cenarios-storage',
      // Não persistir isLoading, error e cenariosPorEmpresa (cache)
      partialize: (state) => ({
        cenarios: state.cenarios,
      }),
    }
  )
)
