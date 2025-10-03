import { useState, useEffect, useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Scenario, ScenarioMetadata, ScenarioFilter, TaxConfig } from '@/types'
import { useTaxCalculations } from '@/hooks/use-tax-calculations'
import { toast } from '@/hooks/use-toast'

// ========================================
// STORE DE CENÁRIOS
// ========================================

interface ScenarioStore {
  scenarios: Scenario[]
  addScenario: (scenario: Scenario) => void
  updateScenario: (id: string, scenario: Partial<Scenario>) => void
  deleteScenario: (id: string) => void
  toggleFavorite: (id: string) => void
  clearAll: () => void
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set) => ({
      scenarios: [],

      addScenario: (scenario) =>
        set((state) => ({
          scenarios: [scenario, ...state.scenarios],
        })),

      updateScenario: (id, updates) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.metadata.id === id
              ? {
                  ...s,
                  ...updates,
                  metadata: {
                    ...s.metadata,
                    ...updates.metadata,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : s
          ),
        })),

      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.metadata.id !== id),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.metadata.id === id
              ? {
                  ...s,
                  metadata: {
                    ...s.metadata,
                    favorite: !s.metadata.favorite,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : s
          ),
        })),

      clearAll: () => set({ scenarios: [] }),
    }),
    {
      name: 'tax-planner-scenarios',
      version: 1,
    }
  )
)

// ========================================
// HOOK PRINCIPAL
// ========================================

export function useScenarios() {
  const {
    scenarios,
    addScenario,
    updateScenario,
    deleteScenario,
    toggleFavorite,
    clearAll,
  } = useScenarioStore()

  const [filter, setFilter] = useState<ScenarioFilter>({
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  })

  // Gerar ID único
  const generateId = useCallback(() => {
    return `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Criar cenário a partir da configuração atual
  const createScenario = useCallback(
    (
      config: TaxConfig,
      metadata: Omit<ScenarioMetadata, 'id' | 'createdAt' | 'updatedAt'>,
      calculations?: Scenario['calculations']
    ) => {
      const now = new Date().toISOString()
      const scenario: Scenario = {
        metadata: {
          ...metadata,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        },
        config,
        calculations,
      }

      addScenario(scenario)
      
      toast({
        title: '✅ Cenário salvo!',
        description: `"${metadata.name}" foi salvo com sucesso.`,
        variant: 'success',
      })

      return scenario
    },
    [addScenario, generateId]
  )

  // Duplicar cenário
  const duplicateScenario = useCallback(
    (id: string) => {
      const original = scenarios.find((s) => s.metadata.id === id)
      if (!original) return

      const now = new Date().toISOString()
      const duplicate: Scenario = {
        metadata: {
          ...original.metadata,
          id: generateId(),
          name: `${original.metadata.name} (Cópia)`,
          createdAt: now,
          updatedAt: now,
          favorite: false,
        },
        config: { ...original.config },
        calculations: original.calculations ? { ...original.calculations } : undefined,
      }

      addScenario(duplicate)
      
      toast({
        title: '✅ Cenário duplicado!',
        description: `"${duplicate.metadata.name}" foi criado.`,
        variant: 'success',
      })

      return duplicate
    },
    [scenarios, addScenario, generateId]
  )

  // Buscar cenário por ID
  const getScenario = useCallback(
    (id: string) => {
      return scenarios.find((s) => s.metadata.id === id)
    },
    [scenarios]
  )

  // Deletar com confirmação
  const deleteScenarioWithConfirmation = useCallback(
    (id: string) => {
      const scenario = getScenario(id)
      if (!scenario) return

      deleteScenario(id)
      
      toast({
        title: '🗑️ Cenário deletado',
        description: `"${scenario.metadata.name}" foi removido.`,
      })
    },
    [deleteScenario, getScenario]
  )

  // Atualizar cenário
  const updateScenarioData = useCallback(
    (id: string, updates: Partial<Scenario>) => {
      updateScenario(id, updates)
      
      toast({
        title: '✅ Cenário atualizado!',
        description: 'As alterações foram salvas.',
        variant: 'success',
      })
    },
    [updateScenario]
  )

  // Exportar cenário como JSON
  const exportScenario = useCallback(
    (id: string) => {
      const scenario = getScenario(id)
      if (!scenario) return

      const json = JSON.stringify(scenario, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cenario-${scenario.metadata.name.toLowerCase().replace(/\s+/g, '-')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: '📥 Cenário exportado!',
        description: 'Arquivo JSON baixado com sucesso.',
        variant: 'success',
      })
    },
    [getScenario]
  )

  // Exportar todos os cenários
  const exportAllScenarios = useCallback(() => {
    const json = JSON.stringify(scenarios, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cenarios-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: '📥 Todos os cenários exportados!',
      description: `${scenarios.length} cenário(s) exportado(s).`,
      variant: 'success',
    })
  }, [scenarios])

  // Importar cenário de JSON
  const importScenario = useCallback(
    (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString)
        
        // Verifica se é um cenário único ou array
        const scenariosToImport = Array.isArray(parsed) ? parsed : [parsed]

        let imported = 0
        scenariosToImport.forEach((scenario: Scenario) => {
          // Gera novo ID e atualiza datas
          const now = new Date().toISOString()
          const newScenario: Scenario = {
            ...scenario,
            metadata: {
              ...scenario.metadata,
              id: generateId(),
              name: `${scenario.metadata.name} (Importado)`,
              createdAt: now,
              updatedAt: now,
            },
          }
          addScenario(newScenario)
          imported++
        })

        toast({
          title: '✅ Importação concluída!',
          description: `${imported} cenário(s) importado(s) com sucesso.`,
          variant: 'success',
        })

        return imported
      } catch (error) {
        toast({
          title: '❌ Erro na importação',
          description: 'Arquivo JSON inválido ou corrompido.',
          variant: 'destructive',
        })
        return 0
      }
    },
    [addScenario, generateId]
  )

  // Filtrar e ordenar cenários
  const filteredScenarios = useMemo(() => {
    let result = [...scenarios]

    // Filtro de busca
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      result = result.filter(
        (s) =>
          s.metadata.name.toLowerCase().includes(term) ||
          s.metadata.description?.toLowerCase().includes(term) ||
          s.metadata.tags?.some((tag) => tag.toLowerCase().includes(term))
      )
    }

    // Filtro de tags
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter((s) =>
        filter.tags!.some((tag) => s.metadata.tags?.includes(tag))
      )
    }

    // Filtro de data
    if (filter.dateRange) {
      const { start, end } = filter.dateRange
      result = result.filter((s) => {
        const date = new Date(s.metadata.createdAt)
        return date >= new Date(start) && date <= new Date(end)
      })
    }

    // Ordenação
    const sortBy = filter.sortBy || 'updatedAt'
    const sortOrder = filter.sortOrder || 'desc'

    result.sort((a, b) => {
      let compareA: string | number
      let compareB: string | number

      if (sortBy === 'name') {
        compareA = a.metadata.name.toLowerCase()
        compareB = b.metadata.name.toLowerCase()
      } else {
        compareA = new Date(a.metadata[sortBy]).getTime()
        compareB = new Date(b.metadata[sortBy]).getTime()
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1
      } else {
        return compareA < compareB ? 1 : -1
      }
    })

    // Favoritos primeiro
    result.sort((a, b) => {
      if (a.metadata.favorite && !b.metadata.favorite) return -1
      if (!a.metadata.favorite && b.metadata.favorite) return 1
      return 0
    })

    return result
  }, [scenarios, filter])

  // Estatísticas
  const statistics = useMemo(() => {
    return {
      total: scenarios.length,
      favorites: scenarios.filter((s) => s.metadata.favorite).length,
      tags: Array.from(
        new Set(scenarios.flatMap((s) => s.metadata.tags || []))
      ),
    }
  }, [scenarios])

  return {
    // State
    scenarios: filteredScenarios,
    allScenarios: scenarios,
    filter,
    statistics,

    // Actions
    createScenario,
    updateScenario: updateScenarioData,
    deleteScenario: deleteScenarioWithConfirmation,
    duplicateScenario,
    toggleFavorite,
    getScenario,
    setFilter,
    clearAll,

    // Import/Export
    exportScenario,
    exportAllScenarios,
    importScenario,
  }
}
