import { useState, useEffect, useMemo } from 'react'
import { useCenariosStore } from '@/stores/cenarios-store'
import { useCenariosErrorHandler } from '@/components/cenarios-error-boundary'

interface ResumoGeral {
  totalReceita: number
  totalImpostos: number
  percentualTributario: number
  lucroLiquido: number
  economiaSimples: number
}

interface RelatorioComparacao {
  id: string
  nome: string
  regime: string
  receita: number
  impostos: number
  percentual: number
  lucroLiquido: number
  economia: number
  mesReferencia?: number
  trimestreReferencia?: number
}

export function useRelatoriosSimples(empresaId?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleError } = useCenariosErrorHandler()
  
  const cenarios = useCenariosStore(state => state.cenarios)
  const fetchCenarios = useCenariosStore(state => state.fetchCenarios)

  console.log('🔍 [useRelatoriosSimples] Hook executado para empresa:', empresaId, {
    cenariosTotal: cenarios.length,
    cenarios: cenarios.map(c => ({ id: c.id, nome: c.nome, empresaId: c.empresaId }))
  })

  // Filtrar cenários apenas da empresa atual
  const cenariosDaEmpresa = useMemo(() => {
    if (!empresaId) {
      console.log('⚠️ [useRelatoriosSimples] EmpresaId não fornecido')
      return []
    }
    
    const filtered = cenarios.filter(c => c.empresaId === empresaId)
    console.log('🔍 [useRelatoriosSimples] Cenários filtrados para empresa', empresaId, ':', {
      quantidade: filtered.length,
      cenarios: filtered.map(c => ({ 
        id: c.id, 
        nome: c.nome, 
        mes: c.mes,
        periodo: c.periodo,
        configuracao: !!c.configuracao 
      }))
    })
    
    return filtered
  }, [cenarios, empresaId])

  // Função para calcular resumo geral com memoização
  const resumoGeral = useMemo((): ResumoGeral => {
    console.log('🧮 [useRelatoriosSimples] Calculando resumo geral para empresa:', empresaId)
    
    try {
      if (!cenariosDaEmpresa.length) {
        console.log('⚠️ [useRelatoriosSimples] Nenhum cenário encontrado para esta empresa - retornando valores zerados')
        return {
          totalReceita: 0,
          totalImpostos: 0,
          percentualTributario: 0,
          lucroLiquido: 0,
          economiaSimples: 0
        }
      }

      console.log('📊 [useRelatoriosSimples] Processando', cenariosDaEmpresa.length, 'cenários da empresa...')

      const totais = cenariosDaEmpresa.reduce((acc, cenario) => {
        // Busca a configuração do cenário - corrigido para 'configuracao'
        const configuracao = cenario.configuracao

        if (!configuracao || typeof configuracao !== 'object') {
          console.warn(`Cenário ${cenario.id} sem configuração válida`)
          return acc
        }

        // Calcular impostos baseado na estrutura existente
        const receita = configuracao.receitaBruta || 0
        
        // Cálculo simplificado dos impostos (você pode expandir conforme a necessidade)
        const icms = receita * ((configuracao.icmsInterno || 0) / 100)
        const pis = receita * ((configuracao.pisAliq || 0) / 100)
        const cofins = receita * ((configuracao.cofinsAliq || 0) / 100)
        const impostos = icms + pis + cofins
        
        const lucro = receita - impostos - (configuracao.cmvTotal || 0)

        return {
          totalReceita: acc.totalReceita + receita,
          totalImpostos: acc.totalImpostos + impostos,
          lucroLiquido: acc.lucroLiquido + lucro,
          economiaSimples: acc.economiaSimples + 0 // Para ser calculado futuramente
        }
      }, {
        totalReceita: 0,
        totalImpostos: 0,
        lucroLiquido: 0,
        economiaSimples: 0
      })

      return {
        ...totais,
        percentualTributario: totais.totalReceita > 0 
          ? (totais.totalImpostos / totais.totalReceita) * 100 
          : 0
      }
    } catch (err) {
      console.error('Erro ao calcular resumo geral:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return {
        totalReceita: 0,
        totalImpostos: 0,
        percentualTributario: 0,
        lucroLiquido: 0,
        economiaSimples: 0
      }
    }
  }, [cenariosDaEmpresa])

  // Função para gerar relatório de comparação com memoização
  const relatorioComparacao = useMemo((): RelatorioComparacao[] => {
    try {
      const resultados = cenariosDaEmpresa
        .map(cenario => {
          console.log('🔍 [useRelatoriosSimples] Processando cenário:', {
            id: cenario.id,
            nome: cenario.nome,
            mes: cenario.mes,
            trimestre: cenario.trimestre,
            periodo: cenario.periodo,
            configuracao: !!cenario.configuracao,
            receitaBruta: cenario.configuracao?.receitaBruta,
            cmvTotal: cenario.configuracao?.cmvTotal
          })
          
          const configuracao = cenario.configuracao
          
          if (!configuracao || typeof configuracao !== 'object') {
            console.warn(`Cenário ${cenario.id} sem configuração válida`)
            return null
          }

          const receita = configuracao.receitaBruta || 0
          
          // Tentar extrair mês de diferentes fontes
          let mesReferencia = cenario.mes
          if (!mesReferencia && cenario.periodo?.mes) {
            mesReferencia = cenario.periodo.mes
          }
          if (!mesReferencia && cenario.periodo?.inicio) {
            // Extrair mês da data de início
            const dataInicio = new Date(cenario.periodo.inicio)
            mesReferencia = dataInicio.getMonth() + 1
          }
          
          console.log('📅 [useRelatoriosSimples] Mês determinado:', {
            cenarioId: cenario.id,
            cenarioMes: cenario.mes,
            periodoMes: cenario.periodo?.mes,
            mesCalculado: mesReferencia
          })
          
          // Cálculo simplificado dos impostos
          const icms = receita * ((configuracao.icmsInterno || 0) / 100)
          const pis = receita * ((configuracao.pisAliq || 0) / 100)
          const cofins = receita * ((configuracao.cofinsAliq || 0) / 100)
          const impostos = icms + pis + cofins
          
          const lucro = receita - impostos - (configuracao.cmvTotal || 0)
          
          console.log('💰 [useRelatoriosSimples] Cálculos para', cenario.nome, ':', {
            receita,
            icms,
            pis,
            cofins,
            impostos,
            cmv: configuracao.cmvTotal || 0,
            lucro,
            mesReferencia
          })
          
          return {
            id: cenario.id,
            nome: cenario.nome,
            regime: 'Lucro Real', // Temporário - pode ser expandido
            receita,
            impostos,
            percentual: receita > 0 ? (impostos / receita) * 100 : 0,
            lucroLiquido: lucro,
            economia: 0, // Calculado futuramente
            mesReferencia: mesReferencia,
            trimestreReferencia: cenario.trimestre
          } as RelatorioComparacao
        })
        .filter((item): item is RelatorioComparacao => item !== null)
        
      console.log('📊 [useRelatoriosSimples] Relatório de comparação gerado:', {
        totalResultados: resultados.length,
        comMesReferencia: resultados.filter(r => r.mesReferencia).length,
        detalhes: resultados.map(r => ({
          nome: r.nome,
          mesReferencia: r.mesReferencia,
          receita: r.receita
        }))
      })
        
      return resultados.sort((a, b) => a.impostos - b.impostos) // Ordena por menor imposto
    } catch (err) {
      console.error('Erro ao gerar relatório de comparação:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    }
  }, [cenariosDaEmpresa])

  // Função para atualizar dados com tratamento de erro
  const atualizarDados = async () => {
    console.log('🔄 [useRelatoriosSimples] Atualizando dados para empresa:', empresaId)
    
    try {
      setLoading(true)
      setError(null)
      
      // Buscar cenários específicos da empresa
      await fetchCenarios(empresaId)
      
      console.log('✅ [useRelatoriosSimples] Dados atualizados com sucesso para empresa:', empresaId)
      
    } catch (err) {
      const errorInfo = handleError(err instanceof Error ? err : new Error('Erro desconhecido'))
      setError(errorInfo.message)
      console.error('❌ [useRelatoriosSimples] Erro ao atualizar dados dos relatórios:', err)
    } finally {
      setLoading(false)
    }
  }

  // Carrega dados iniciais
  useEffect(() => {
    if (cenarios.length === 0) {
      atualizarDados()
    }
  }, [])

  // Função para obter melhor cenário
  const melhorCenario = useMemo(() => {
    if (relatorioComparacao.length === 0) return null
    return relatorioComparacao[0] // Primeiro da lista (menor imposto)
  }, [relatorioComparacao])

  // Função para obter estatísticas por regime
  const estatisticasPorRegime = useMemo(() => {
    const stats = relatorioComparacao.reduce((acc, cenario) => {
      const regime = cenario.regime
      if (!acc[regime]) {
        acc[regime] = {
          count: 0,
          totalReceita: 0,
          totalImpostos: 0,
          mediaPercentual: 0
        }
      }
      
      acc[regime].count++
      acc[regime].totalReceita += cenario.receita
      acc[regime].totalImpostos += cenario.impostos
      
      return acc
    }, {} as Record<string, any>)

    // Calcula médias
    Object.keys(stats).forEach(regime => {
      const stat = stats[regime]
      stat.mediaPercentual = stat.totalReceita > 0 
        ? (stat.totalImpostos / stat.totalReceita) * 100 
        : 0
    })

    return stats
  }, [relatorioComparacao])

  return {
    loading,
    error,
    resumoGeral,
    relatorioComparacao,
    melhorCenario,
    estatisticasPorRegime,
    totalCenarios: cenarios.length,
    atualizarDados,
    // Função para limpar erro
    limparErro: () => setError(null)
  }
}