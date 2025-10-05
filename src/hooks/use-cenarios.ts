import { useEffect, useMemo } from 'react'
import { useCenariosStore } from '@/stores/cenarios-store'
import type { Cenario, CenarioFormData } from '@/types/cenario'
import type { TaxConfig } from '@/types'

/**
 * Hook customizado para gerenciar cenários com Supabase
 * Carrega automaticamente os cenários da empresa
 */
export function useCenarios(empresaId: string) {
  const {
    cenarios,
    cenariosPorEmpresa,
    isLoading,
    error,
    fetchCenarios,
    addCenario,
    updateCenario,
    deleteCenario,
    getCenario,
    getCenariosByEmpresa,
    duplicarCenario,
    aprovarCenario,
    arquivarCenario,
    clearError,
  } = useCenariosStore()

  // Carregar cenários automaticamente
  useEffect(() => {
    if (empresaId) {
      // Se não tem cenários para esta empresa, buscar
      const cenariosEmpresa = cenariosPorEmpresa[empresaId]
      if (!cenariosEmpresa && !isLoading && !error) {
        fetchCenarios(empresaId)
      }
    }
  }, [empresaId, cenariosPorEmpresa, isLoading, error, fetchCenarios])

  // Cenários da empresa
  const cenariosEmpresa = getCenariosByEmpresa(empresaId)

  // Handlers com tratamento de erro
  const handleAddCenario = async (data: CenarioFormData, config: TaxConfig) => {
    try {
      return await addCenario(empresaId, data, config)
    } catch (error) {
      throw error
    }
  }

  const handleUpdateCenario = async (id: string, data: Partial<any>) => {
    try {
      await updateCenario(id, data)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteCenario = async (id: string) => {
    try {
      await deleteCenario(id)
    } catch (error) {
      throw error
    }
  }

  const handleDuplicarCenario = async (id: string, novoNome?: string) => {
    try {
      return await duplicarCenario(id, novoNome)
    } catch (error) {
      throw error
    }
  }

  const handleRefresh = () => {
    fetchCenarios(empresaId)
  }

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: cenariosEmpresa.length,
      aprovados: cenariosEmpresa.filter(c => c.status === 'aprovado').length,
      rascunhos: cenariosEmpresa.filter(c => c.status === 'rascunho').length,
      arquivados: cenariosEmpresa.filter(c => c.status === 'arquivado').length,
    }
  }, [cenariosEmpresa])

  // Cenários por ano
  const cenariosPorAno = useMemo(() => {
    const grupos: Record<number, Cenario[]> = {}
    
    cenariosEmpresa.forEach(cenario => {
      const ano = cenario.periodo.ano
      if (!grupos[ano]) {
        grupos[ano] = []
      }
      grupos[ano].push(cenario)
    })
    
    return grupos
  }, [cenariosEmpresa])

  // Anos disponíveis (ordenados)
  const anos = useMemo(() => {
    return Object.keys(cenariosPorAno)
      .map(Number)
      .sort((a, b) => b - a)
  }, [cenariosPorAno])

  // Cenários recentes (últimos 5)
  const cenariosRecentes = useMemo(() => {
    return [...cenariosEmpresa]
      .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
      .slice(0, 5)
  }, [cenariosEmpresa])

  return {
    // Estado
    cenarios: cenariosEmpresa,
    isLoading,
    error,
    hasCenarios: cenariosEmpresa.length > 0,
    
    // Estatísticas
    stats,
    cenariosPorAno,
    anos,
    cenariosRecentes,
    
    // Actions
    addCenario: handleAddCenario,
    updateCenario: handleUpdateCenario,
    deleteCenario: handleDeleteCenario,
    duplicarCenario: handleDuplicarCenario,
    aprovarCenario: async (id: string) => await aprovarCenario(id),
    arquivarCenario: async (id: string) => await arquivarCenario(id),
    getCenario,
    refresh: handleRefresh,
    clearError,
    
    // Utilitários
    getCenariosByStatus: (status: string) => 
      cenariosEmpresa.filter(c => c.status === status),
    getCenariosByPeriodo: (ano: number) => 
      cenariosEmpresa.filter(c => c.periodo.ano === ano),
  }
}

/**
 * Hook para buscar um cenário específico
 */
export function useCenario(id: string) {
  const { getCenario, fetchCenarios, isLoading, error } = useCenariosStore()
  
  const cenario = getCenario(id)
  
  // Se não encontrou o cenário e não está carregando, buscar todos
  useEffect(() => {
    if (!cenario && !isLoading && !error) {
      fetchCenarios()
    }
  }, [cenario, isLoading, error, fetchCenarios])
  
  return {
    cenario,
    isLoading,
    error,
    found: !!cenario,
  }
}
