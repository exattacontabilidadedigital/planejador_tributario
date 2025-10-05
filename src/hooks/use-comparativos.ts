import { useMemo } from 'react'
import { useCenariosStore } from '@/stores/cenarios-store'
import type { Cenario } from '@/types/cenario'

/**
 * Hook customizado para comparar cenários
 * Recebe uma lista de IDs de cenários e calcula comparativos
 */
export function useComparativos(cenariosIds: string[]) {
  const { getCenario } = useCenariosStore()

  // Buscar os cenários pelos IDs
  const cenarios = useMemo(() => {
    return cenariosIds.map(id => getCenario(id)).filter(Boolean) as Cenario[]
  }, [cenariosIds, getCenario])

  // Função para calcular comparativos
  const calcularComparativos = useMemo(() => {
    if (cenarios.length < 2) return null

    // Implementação de comparação entre cenários
    return cenarios.map((cenario, index) => ({
      id: cenario.id,
      nome: cenario.nome,
      index,
      totalTributos: 0, // TODO: implementar cálculo baseado nos dados do cenário
      margem: 0, // TODO: implementar cálculo baseado nos dados do cenário
      economiaAnual: 0, // calcular economia em relação ao primeiro cenário
      detalhes: {
        icms: 0,
        ipi: 0,
        pis: 0,
        cofins: 0,
        irpj: 0,
        csll: 0,
      }
    }))
  }, [cenarios])

  // Métricas para comparação
  const metricas = useMemo(() => {
    return cenarios.map(cenario => ({
      id: cenario.id,
      nome: cenario.nome,
      totalTributos: 0,
      margem: 0,
      receita: cenario.configuracao?.receitaBruta || 0,
      cargaTributaria: 0, // TODO: calcular baseado nos tributos
      margemLiquida: 0, // TODO: calcular baseado nos resultados
      lucroLiquido: 0, // TODO: calcular baseado nos resultados
      status: cenario.status,
    }))
  }, [cenarios])

  // Variações entre cenários
  const variacoes = useMemo(() => {
    if (cenarios.length < 2) return []
    
    const [cenario1, cenario2] = cenarios
    const receita1 = cenario1.configuracao?.receitaBruta || 0
    const receita2 = cenario2.configuracao?.receitaBruta || 0
    
    return [
      {
        metrica: 'Receita',
        valor1: receita1,
        valor2: receita2,
        absoluta: receita2 - receita1,
        percentual: receita1 > 0 ? ((receita2 - receita1) / receita1) * 100 : 0
      },
      // Adicionar mais métricas conforme necessário
    ]
  }, [cenarios])

  // Insights automáticos
  const insights = useMemo(() => {
    if (cenarios.length < 2) return []
    
    const insights = []
    
    // Exemplo de insight básico
    if (cenarios.length === 2) {
      const [cenario1, cenario2] = cenarios
      const receita1 = cenario1.configuracao?.receitaBruta || 0
      const receita2 = cenario2.configuracao?.receitaBruta || 0
      
      if (receita2 > receita1) {
        insights.push({
          tipo: 'info',
          titulo: 'Maior receita',
          descricao: `${cenario2.nome} tem receita ${(((receita2 - receita1) / receita1) * 100).toFixed(1)}% maior`
        })
      }
    }
    
    return insights
  }, [cenarios])

  // Dados para gráfico
  const dadosGraficoComparativo = useMemo(() => {
    return cenarios.map(cenario => ({
      nome: cenario.nome,
      receita: cenario.configuracao?.receitaBruta || 0,
      totalTributos: 0, // TODO: calcular
      margem: 0, // TODO: calcular
    }))
  }, [cenarios])

  // Tem dados suficientes para comparação
  const temDados = cenarios.length >= 2

  return {
    cenarios,
    comparativos: calcularComparativos,
    metricas,
    variacoes,
    insights,
    dadosGraficoComparativo,
    temDados,
    isLoading: false,
    error: null
  }
}
