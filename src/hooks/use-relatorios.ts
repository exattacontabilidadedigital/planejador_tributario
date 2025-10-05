"use client"

import { useMemo } from "react"
import { useCenariosStore } from "@/stores/cenarios-store"
import type { Cenario } from "@/types/cenario"
import type {
  DadosGraficoEvolucao,
  DadosGraficoComposicao,
  DadosGraficoMargem,
  DadosMetricasFinanceiras,
  DadosEvolucaoFinanceira,
  LinhaRelatorioAnual,
  TotaisRelatorio,
} from "@/types/relatorio"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export function useRelatorios(empresaId: string, ano?: number, mesesFiltrados?: string[]) {
  const { getCenariosByEmpresa } = useCenariosStore()

  // Filtrar cenários da empresa e do ano (se especificado)
  const cenarios = useMemo(() => {
    if (!empresaId) return []
    
    const todosCenarios = getCenariosByEmpresa(empresaId)
    if (!ano) return todosCenarios

    return todosCenarios.filter((c) => {
      const cenarioAno = new Date(c.periodo.inicio).getFullYear()
      return cenarioAno === ano
    })
  }, [empresaId, ano, getCenariosByEmpresa])

  // Cenários aprovados apenas (para relatórios)
  const cenariosAprovados = useMemo(() => {
    let cenariosFiltered = cenarios.filter((c) => c.status === "aprovado")
    
    // Aplicar filtro de meses se especificado
    if (mesesFiltrados && mesesFiltrados.length > 0 && mesesFiltrados.length < 12) {
      cenariosFiltered = cenariosFiltered.filter((c) => {
        if (c.periodo.tipo !== "mensal") return true
        
        const data = parseISO(c.periodo.inicio)
        const mesAbrev = format(data, "MMM", { locale: ptBR }).toLowerCase()
        return mesesFiltrados.includes(mesAbrev)
      })
    }
    
    return cenariosFiltered
  }, [cenarios, mesesFiltrados])

  // Processar dados de evolução temporal
  const dadosEvolucao = useMemo((): DadosGraficoEvolucao[] => {
    return cenariosAprovados
      .filter((c) => c.periodo.tipo === "mensal")
      .sort((a, b) => a.periodo.inicio.localeCompare(b.periodo.inicio))
      .map((cenario) => {
        const data = parseISO(cenario.periodo.inicio)
        const config = cenario.configuracao

        // Calcular totais
        const receita = config.receitaBruta || 0
        
        // ICMS simplificado (média das vendas)
        const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
        const icms = baseICMS * ((config.icmsInterno || 0) / 100)
        
        // PIS/COFINS
        const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
        const pis = basePIS * ((config.pisAliq || 0) / 100)
        const cofins = basePIS * ((config.cofinsAliq || 0) / 100)
        
        // Despesas totais
        const despesas = (config.salariosPF || 0) + (config.alimentacao || 0) + 
                        (config.combustivelPasseio || 0) + (config.outrasDespesas || 0)
        
        // Base IRPJ/CSLL
        const baseIR = receita - (config.cmvTotal || 0) - despesas + 
                       (config.adicoesLucro || 0) - (config.exclusoesLucro || 0)
        const irpj = Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
        const csll = Math.max(0, baseIR * ((config.csllAliq || 0) / 100))
        
        // ISS
        const iss = receita * ((config.issAliq || 0) / 100)
        
        const totalImpostos = icms + pis + cofins + irpj + csll + iss
        const lucro = receita - totalImpostos - despesas - (config.cmvTotal || 0)

        return {
          mes: format(data, "MMM", { locale: ptBR }),
          periodo: format(data, "yyyy-MM"),
          receita,
          impostos: totalImpostos,
          lucro,
        }
      })
  }, [cenariosAprovados])

  // Processar composição de impostos
  const dadosComposicao = useMemo((): DadosGraficoComposicao[] => {
    const totais = {
      icms: 0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      iss: 0,
    }

    cenariosAprovados.forEach((cenario) => {
      const config = cenario.configuracao
      const receita = config.receitaBruta || 0

      const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
      totais.icms += baseICMS * ((config.icmsInterno || 0) / 100)
      
      const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
      totais.pis += basePIS * ((config.pisAliq || 0) / 100)
      totais.cofins += basePIS * ((config.cofinsAliq || 0) / 100)
      
      const despesas = (config.salariosPF || 0) + (config.alimentacao || 0) + (config.outrasDespesas || 0)
      const baseIR = receita - (config.cmvTotal || 0) - despesas
      totais.irpj += Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
      totais.csll += Math.max(0, baseIR * ((config.csllAliq || 0) / 100))
      totais.iss += receita * ((config.issAliq || 0) / 100)
    })

    const total = Object.values(totais).reduce((sum, val) => sum + val, 0)

    const cores = {
      icms: "#3b82f6", // blue
      pis: "#10b981", // green
      cofins: "#8b5cf6", // purple
      irpj: "#f59e0b", // amber
      csll: "#ef4444", // red
      iss: "#ec4899", // pink
    }

    return Object.entries(totais)
      .map(([nome, valor]) => ({
        nome: nome.toUpperCase(),
        valor,
        percentual: total > 0 ? (valor / total) * 100 : 0,
        fill: cores[nome as keyof typeof cores],
      }))
      .filter((item) => item.valor > 0)
      .sort((a, b) => b.valor - a.valor)
  }, [cenariosAprovados])

  // Calcular margens
  const dadosMargem = useMemo((): DadosGraficoMargem[] => {
    let receitaTotal = 0
    let custosTotal = 0
    let impostosTotal = 0
    let despesasTotal = 0

    cenariosAprovados.forEach((cenario) => {
      const config = cenario.configuracao
      const receita = config.receitaBruta || 0
      const custos = config.cmvTotal || 0
      const despesas = (config.salariosPF || 0) + (config.alimentacao || 0) + 
                      (config.combustivelPasseio || 0) + (config.outrasDespesas || 0)

      const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
      const icms = baseICMS * ((config.icmsInterno || 0) / 100)
      const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
      const pis = basePIS * ((config.pisAliq || 0) / 100)
      const cofins = basePIS * ((config.cofinsAliq || 0) / 100)
      const baseIR = receita - custos - despesas
      const irpj = Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
      const csll = Math.max(0, baseIR * ((config.csllAliq || 0) / 100))
      const iss = receita * ((config.issAliq || 0) / 100)

      receitaTotal += receita
      custosTotal += custos
      despesasTotal += despesas
      impostosTotal += icms + pis + cofins + irpj + csll + iss
    })

    const lucroBruto = receitaTotal - custosTotal
    const lucroLiquido = receitaTotal - custosTotal - despesasTotal - impostosTotal

    const margemBruta = receitaTotal > 0 ? (lucroBruto / receitaTotal) * 100 : 0
    const margemLiquida = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0

    return [
      { categoria: "Margem Bruta", valor: margemBruta, meta: 40 },
      { categoria: "Margem Líquida", valor: margemLiquida, meta: 20 },
    ]
  }, [cenariosAprovados])

  // Calcular métricas financeiras abrangentes
  const dadosMetricasFinanceiras = useMemo((): DadosMetricasFinanceiras[] => {
    let receitaTotal = 0
    let custosTotal = 0
    let despesasTotal = 0
    let icmsTotal = 0
    let pisTotal = 0
    let cofinsTotal = 0
    let irpjTotal = 0
    let csllTotal = 0

    cenariosAprovados.forEach((cenario) => {
      const config = cenario.configuracao
      const receita = config.receitaBruta || 0
      const custos = config.cmvTotal || 0
      const despesas = (config.salariosPF || 0) + (config.alimentacao || 0) + 
                      (config.combustivelPasseio || 0) + (config.outrasDespesas || 0)

      const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
      const icms = baseICMS * ((config.icmsInterno || 0) / 100)
      const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
      const pis = basePIS * ((config.pisAliq || 0) / 100)
      const cofins = basePIS * ((config.cofinsAliq || 0) / 100)
      const baseIR = receita - custos - despesas
      const irpj = Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
      const csll = Math.max(0, baseIR * ((config.csllAliq || 0) / 100))

      receitaTotal += receita
      custosTotal += custos
      despesasTotal += despesas
      icmsTotal += icms
      pisTotal += pis
      cofinsTotal += cofins
      irpjTotal += irpj
      csllTotal += csll
    })

    const lucroLiquido = receitaTotal - custosTotal - despesasTotal - icmsTotal - pisTotal - cofinsTotal - irpjTotal - csllTotal

    return [
      { 
        categoria: "Faturamento", 
        valor: receitaTotal, 
        percentual: 100 
      },
      { 
        categoria: "Lucro Líquido", 
        valor: lucroLiquido, 
        percentual: receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0 
      },
      { 
        categoria: "ICMS", 
        valor: icmsTotal, 
        percentual: receitaTotal > 0 ? (icmsTotal / receitaTotal) * 100 : 0 
      },
      { 
        categoria: "IRPJ", 
        valor: irpjTotal, 
        percentual: receitaTotal > 0 ? (irpjTotal / receitaTotal) * 100 : 0 
      },
      { 
        categoria: "CSLL", 
        valor: csllTotal, 
        percentual: receitaTotal > 0 ? (csllTotal / receitaTotal) * 100 : 0 
      },
      { 
        categoria: "PIS", 
        valor: pisTotal, 
        percentual: receitaTotal > 0 ? (pisTotal / receitaTotal) * 100 : 0 
      },
      { 
        categoria: "COFINS", 
        valor: cofinsTotal, 
        percentual: receitaTotal > 0 ? (cofinsTotal / receitaTotal) * 100 : 0 
      },
    ]
  }, [cenariosAprovados])

  // Calcular evolução financeira mensal
  const dadosEvolucaoFinanceira = useMemo((): DadosEvolucaoFinanceira[] => {
    return cenariosAprovados
      .filter((c) => c.periodo.tipo === "mensal")
      .sort((a, b) => a.periodo.inicio.localeCompare(b.periodo.inicio))
      .map((cenario) => {
        const data = parseISO(cenario.periodo.inicio)
        const config = cenario.configuracao

        const receita = config.receitaBruta || 0
        const custos = config.cmvTotal || 0
        const despesas = (config.salariosPF || 0) + (config.alimentacao || 0) + 
                        (config.combustivelPasseio || 0) + (config.outrasDespesas || 0)

        const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
        const icms = baseICMS * ((config.icmsInterno || 0) / 100)
        const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
        const pis = basePIS * ((config.pisAliq || 0) / 100)
        const cofins = basePIS * ((config.cofinsAliq || 0) / 100)
        const baseIR = receita - custos - despesas
        const irpj = Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
        const csll = Math.max(0, baseIR * ((config.csllAliq || 0) / 100))

        const lucroLiquido = receita - custos - despesas - icms - pis - cofins - irpj - csll

        return {
          mes: format(data, "MMM", { locale: ptBR }),
          receita,
          lucroLiquido,
          icms,
          irpj,
          csll,
          pis,
          cofins,
        }
      })
  }, [cenariosAprovados])

  // Gerar linhas da tabela consolidada
  const linhasTabela = useMemo((): LinhaRelatorioAnual[] => {
    return cenariosAprovados
      .filter((c) => c.periodo.tipo === "mensal")
      .sort((a, b) => a.periodo.inicio.localeCompare(b.periodo.inicio))
      .map((cenario) => {
        const data = parseISO(cenario.periodo.inicio)
        const config = cenario.configuracao

        const receita = config.receitaBruta || 0
        const custos = config.cmvTotal || 0
        const despesas = (config.salariosPF || 0) + (config.alimentacao || 0) + 
                        (config.combustivelPasseio || 0) + (config.outrasDespesas || 0)
        const lucroBruto = receita - custos

        const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
        const icms = baseICMS * ((config.icmsInterno || 0) / 100)
        const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
        const pis = basePIS * ((config.pisAliq || 0) / 100)
        const cofins = basePIS * ((config.cofinsAliq || 0) / 100)
        const baseIR = receita - custos - despesas
        const irpj = Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
        const csll = Math.max(0, baseIR * ((config.csllAliq || 0) / 100))
        const iss = receita * ((config.issAliq || 0) / 100)

        const totalImpostos = icms + pis + cofins + irpj + csll + iss
        const lucroLiquido = receita - custos - despesas - totalImpostos

        const margemBruta = receita > 0 ? (lucroBruto / receita) * 100 : 0
        const margemLiquida = receita > 0 ? (lucroLiquido / receita) * 100 : 0
        const cargaTributaria = receita > 0 ? (totalImpostos / receita) * 100 : 0

        return {
          mes: format(data, "MMMM", { locale: ptBR }),
          periodo: format(data, "yyyy-MM"),
          receita,
          custos,
          lucroBruto,
          despesas,
          icms,
          pis,
          cofins,
          irpj,
          csll,
          iss,
          totalImpostos,
          lucroLiquido,
          margemBruta,
          margemLiquida,
          cargaTributaria,
        }
      })
  }, [cenariosAprovados])

  // Calcular totais gerais
  const totais = useMemo((): TotaisRelatorio => {
    let receitaBruta = 0
    let custos = 0
    let despesas = 0
    let icms = 0
    let pis = 0
    let cofins = 0
    let irpj = 0
    let csll = 0
    let iss = 0

    linhasTabela.forEach((linha) => {
      receitaBruta += linha.receita
      custos += linha.custos
      despesas += linha.despesas
      icms += linha.icms
      pis += linha.pis
      cofins += linha.cofins
      irpj += linha.irpj
      csll += linha.csll
      iss += linha.iss
    })

    const receitaLiquida = receitaBruta - icms - pis - cofins
    const lucroBruto = receitaBruta - custos
    const totalImpostos = icms + pis + cofins + irpj + csll + iss
    const lucroLiquido = receitaBruta - custos - despesas - totalImpostos

    const margemBruta = receitaBruta > 0 ? (lucroBruto / receitaBruta) * 100 : 0
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0
    const cargaTributariaEfetiva = receitaBruta > 0 ? (totalImpostos / receitaBruta) * 100 : 0

    return {
      receitaBruta,
      receitaLiquida,
      lucroBruto,
      lucroLiquido,
      icmsTotal: icms,
      pisTotal: pis,
      cofinsTotal: cofins,
      irpjTotal: irpj,
      csllTotal: csll,
      issTotal: iss,
      cargaTributariaEfetiva,
      margemBruta,
      margemLiquida,
    }
  }, [linhasTabela])

  // Anos disponíveis para filtro
  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>()
    cenarios.forEach((c) => {
      const ano = new Date(c.periodo.inicio).getFullYear()
      anos.add(ano)
    })
    return Array.from(anos).sort((a, b) => b - a)
  }, [cenarios])

  return {
    cenarios,
    cenariosAprovados,
    dadosEvolucao,
    dadosComposicao,
    dadosMargem,
    dadosMetricasFinanceiras,
    dadosEvolucaoFinanceira,
    linhasTabela,
    totais,
    anosDisponiveis,
    temDados: cenariosAprovados.length > 0,
  }
}
