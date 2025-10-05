"use client"

import { useMemo } from "react"
import { useCenariosStore } from "@/stores/cenarios-store"
import type { Cenario } from "@/types/cenario"
import type { VariacaoCenario } from "@/types/relatorio"

export function useComparativos(cenariosIds: string[]) {
  const { getCenario } = useCenariosStore()

  // Buscar cenários selecionados
  const cenariosSelecionados = useMemo(() => {
    return cenariosIds
      .map((id) => getCenario(id))
      .filter((c): c is Cenario => c !== undefined)
  }, [cenariosIds, getCenario])

  // Calcular métricas de cada cenário
  const metricas = useMemo(() => {
    return cenariosSelecionados.map((cenario) => {
      const config = cenario.configuracao
      const receita = config.receitaBruta || 0

      // Impostos
      const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
      const icms = baseICMS * ((config.icmsInterno || 0) / 100)

      const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
      const pis = basePIS * ((config.pisAliq || 0) / 100)
      const cofins = basePIS * ((config.cofinsAliq || 0) / 100)

      const despesas =
        (config.salariosPF || 0) +
        (config.alimentacao || 0) +
        (config.combustivelPasseio || 0) +
        (config.outrasDespesas || 0)

      const baseIR = receita - (config.cmvTotal || 0) - despesas
      const irpj = Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
      const csll = Math.max(0, baseIR * ((config.csllAliq || 0) / 100))
      const iss = receita * ((config.issAliq || 0) / 100)

      const totalImpostos = icms + pis + cofins + irpj + csll + iss
      const custos = config.cmvTotal || 0
      const lucroBruto = receita - custos
      const lucroLiquido = receita - custos - despesas - totalImpostos

      const margemBruta = receita > 0 ? (lucroBruto / receita) * 100 : 0
      const margemLiquida = receita > 0 ? (lucroLiquido / receita) * 100 : 0
      const cargaTributaria = receita > 0 ? (totalImpostos / receita) * 100 : 0

      return {
        cenarioId: cenario.id,
        nome: cenario.nome,
        receita,
        icms,
        pis,
        cofins,
        irpj,
        csll,
        iss,
        totalImpostos,
        custos,
        despesas,
        lucroBruto,
        lucroLiquido,
        margemBruta,
        margemLiquida,
        cargaTributaria,
      }
    })
  }, [cenariosSelecionados])

  // Calcular variações entre primeiro e outros cenários
  const variacoes = useMemo((): VariacaoCenario[] => {
    if (metricas.length < 2) return []

    const base = metricas[0]
    const comparacoes: VariacaoCenario[] = []

    const campos = [
      { key: "receita", label: "Receita Bruta" },
      { key: "totalImpostos", label: "Total de Impostos" },
      { key: "lucroLiquido", label: "Lucro Líquido" },
      { key: "margemLiquida", label: "Margem Líquida (%)" },
      { key: "cargaTributaria", label: "Carga Tributária (%)" },
      { key: "icms", label: "ICMS" },
      { key: "pis", label: "PIS" },
      { key: "cofins", label: "COFINS" },
      { key: "irpj", label: "IRPJ" },
      { key: "csll", label: "CSLL" },
    ]

    for (let i = 1; i < metricas.length; i++) {
      const comparado = metricas[i]

      campos.forEach((campo) => {
        const baseValor = base[campo.key as keyof typeof base] as number
        const comparadoValor = comparado[campo.key as keyof typeof comparado] as number
        const variacaoAbsoluta = comparadoValor - baseValor
        const variacaoPercentual =
          baseValor !== 0 ? (variacaoAbsoluta / baseValor) * 100 : 0

        comparacoes.push({
          metrica: campo.label,
          cenario1Valor: baseValor,
          cenario2Valor: comparadoValor,
          variacaoAbsoluta,
          variacaoPercentual,
        })
      })
    }

    return comparacoes
  }, [metricas])

  // Gerar insights automáticos
  const insights = useMemo(() => {
    if (metricas.length < 2) return []

    const base = metricas[0]
    const resultados: Array<{ tipo: string; mensagem: string }> = []

    for (let i = 1; i < metricas.length; i++) {
      const comparado = metricas[i]

      // Comparar receita (sempre mostra se há diferença)
      const difReceita = ((comparado.receita - base.receita) / base.receita) * 100
      if (Math.abs(difReceita) > 0.1) {
        resultados.push({
          tipo: difReceita > 0 ? "success" : "alert",
          mensagem: `${comparado.nome} tem receita ${
            difReceita > 0 ? "maior" : "menor"
          } em ${Math.abs(difReceita).toFixed(1)}% comparado a ${base.nome}`,
        })
      } else if (comparado.receita === base.receita) {
        resultados.push({
          tipo: "warning",
          mensagem: `${comparado.nome} tem a mesma receita que ${base.nome}`,
        })
      }

      // Comparar carga tributária
      const difCarga = comparado.cargaTributaria - base.cargaTributaria
      if (Math.abs(difCarga) > 0.5) {
        resultados.push({
          tipo: difCarga < 0 ? "success" : "alert",
          mensagem: `${comparado.nome} tem carga tributária ${
            difCarga < 0 ? "menor" : "maior"
          } (${difCarga > 0 ? "+" : ""}${difCarga.toFixed(1)}pp) que ${base.nome}`,
        })
      }

      // Comparar margem líquida
      const difMargem = comparado.margemLiquida - base.margemLiquida
      if (Math.abs(difMargem) > 0.5) {
        resultados.push({
          tipo: difMargem > 0 ? "success" : "alert",
          mensagem: `${comparado.nome} tem margem líquida ${
            difMargem > 0 ? "melhor" : "pior"
          } (${difMargem > 0 ? "+" : ""}${difMargem.toFixed(1)}pp) que ${base.nome}`,
        })
      }
    }

    // Se não houver insights, adicionar um informativo
    if (resultados.length === 0) {
      resultados.push({
        tipo: "warning",
        mensagem: `Os cenários selecionados têm configurações muito similares. Configure valores diferentes para ver comparações.`,
      })
    }

    return resultados.slice(0, 5) // Máximo 5 insights
  }, [metricas])

  // Dados para gráfico comparativo (BarChart)
  const dadosGraficoComparativo = useMemo(() => {
    return metricas.map((m) => ({
      nome: m.nome,
      receita: m.receita,
      impostos: m.totalImpostos,
      lucro: m.lucroLiquido,
      margem: m.margemLiquida,
    }))
  }, [metricas])

  return {
    cenariosSelecionados,
    metricas,
    variacoes,
    insights,
    dadosGraficoComparativo,
    temDados: metricas.length >= 2,
  }
}
