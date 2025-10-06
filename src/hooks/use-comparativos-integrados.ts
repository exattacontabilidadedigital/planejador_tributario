import { useMemo } from "react"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import type { DadosComparativoMensal } from "@/types/comparativo"
import type { Cenario } from "@/types/cenario"

interface UseComparativosIntegradosProps {
  empresaId: string
  ano: number
}

export function useComparativosIntegrados({ empresaId, ano }: UseComparativosIntegradosProps) {
  const { getCenariosByEmpresa } = useCenariosStore()
  const { 
    obterDadosPorEmpresa, 
    obterResumoComparativo, 
    obterMesesDisponiveis 
  } = useRegimesTributariosStore()

  // Obter cenários aprovados da empresa para o ano
  const cenariosLucroReal = useMemo(() => {
    return getCenariosByEmpresa(empresaId).filter((cenario: Cenario) => {
      // Assumindo que cenário tem uma propriedade 'dados' ou similar
      return cenario.status === 'aprovado'
    })
  }, [empresaId, ano, getCenariosByEmpresa])

  // Por enquanto, vamos usar dados simulados para Lucro Real
  const dadosLucroReal = useMemo(() => {
    const dados: DadosComparativoMensal[] = []
    // Implementação simplificada por enquanto
    return dados
  }, [cenariosLucroReal, empresaId, ano])

  // Dados dos outros regimes (inseridos manualmente)
  const dadosOutrosRegimes = useMemo(() => {
    return obterDadosPorEmpresa(empresaId).filter(
      dado => dado.ano === ano && dado.regime !== 'lucro_real'
    )
  }, [empresaId, ano, obterDadosPorEmpresa])

  // Todos os dados consolidados
  const todosOsDados = useMemo(() => {
    return [...dadosLucroReal, ...dadosOutrosRegimes]
  }, [dadosLucroReal, dadosOutrosRegimes])

  // Resumo comparativo incluindo lucro real
  const resumoComparativoCompleto = useMemo(() => {
    return obterResumoComparativo(empresaId, ano)
  }, [obterResumoComparativo, empresaId, ano])

  // Dados para gráficos mensais consolidados
  const dadosGraficoConsolidado = useMemo(() => {
    const dadosPorMes: Record<string, any> = {}
    
    todosOsDados.forEach(dado => {
      if (!dadosPorMes[dado.mes]) {
        dadosPorMes[dado.mes] = {
          mes: dado.mes,
          lucroReal: 0,
          lucroPresumido: 0,
          simplesNacional: 0,
        }
      }
      
      const totalImpostos = dado.icms + dado.pis + dado.cofins + dado.irpj + dado.csll + dado.iss + (dado.outros || 0)
      
      switch (dado.regime) {
        case 'lucro_real':
          dadosPorMes[dado.mes].lucroReal = totalImpostos
          break
        case 'lucro_presumido':
          dadosPorMes[dado.mes].lucroPresumido = totalImpostos
          break
        case 'simples_nacional':
          dadosPorMes[dado.mes].simplesNacional = totalImpostos
          break
      }
    })

    return Object.values(dadosPorMes)
  }, [todosOsDados])

  // Meses disponíveis (incluindo lucro real)
  const mesesComDados = useMemo(() => {
    const meses = new Set<string>()
    todosOsDados.forEach(dado => meses.add(dado.mes))
    return Array.from(meses).sort()
  }, [todosOsDados])

  return {
    dadosLucroReal,
    dadosOutrosRegimes,
    todosOsDados,
    resumoComparativoCompleto,
    dadosGraficoConsolidado,
    mesesComDados,
    temDadosLucroReal: dadosLucroReal.length > 0,
    temDadosOutrosRegimes: dadosOutrosRegimes.length > 0,
    temComparacao: resumoComparativoCompleto.length > 1,
  }
}