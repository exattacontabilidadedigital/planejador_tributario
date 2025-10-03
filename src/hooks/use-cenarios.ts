import { useMemo } from 'react'
import { useCenariosStore } from '@/stores/cenarios-store'
import type { Cenario } from '@/types/cenario'

export function useCenarios(empresaId: string) {
  const { 
    getCenariosByEmpresa, 
    addCenario, 
    updateCenario, 
    deleteCenario,
    duplicarCenario,
    aprovarCenario,
    arquivarCenario,
  } = useCenariosStore()

  const cenarios = getCenariosByEmpresa(empresaId)

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: cenarios.length,
      aprovados: cenarios.filter(c => c.status === 'aprovado').length,
      rascunhos: cenarios.filter(c => c.status === 'rascunho').length,
      arquivados: cenarios.filter(c => c.status === 'arquivado').length,
    }
  }, [cenarios])

  // Cenários por ano
  const cenariosPorAno = useMemo(() => {
    const grupos: Record<number, Cenario[]> = {}
    
    cenarios.forEach(cenario => {
      const ano = cenario.periodo.ano
      if (!grupos[ano]) {
        grupos[ano] = []
      }
      grupos[ano].push(cenario)
    })
    
    return grupos
  }, [cenarios])

  // Anos disponíveis (ordenados)
  const anos = useMemo(() => {
    return Object.keys(cenariosPorAno)
      .map(Number)
      .sort((a, b) => b - a)
  }, [cenariosPorAno])

  // Cenários recentes (últimos 5)
  const cenariosRecentes = useMemo(() => {
    return [...cenarios]
      .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
      .slice(0, 5)
  }, [cenarios])

  return {
    cenarios,
    stats,
    cenariosPorAno,
    anos,
    cenariosRecentes,
    addCenario,
    updateCenario,
    deleteCenario,
    duplicarCenario,
    aprovarCenario,
    arquivarCenario,
  }
}
