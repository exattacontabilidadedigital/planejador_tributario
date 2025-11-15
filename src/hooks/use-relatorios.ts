"use client"

import { useMemo } from "react"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import type { Cenario } from "@/types/cenario"
import type { DadosComparativoMensal } from "@/types/comparativo"
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
  const { obterDadosPorEmpresa } = useRegimesTributariosStore()

  // Obter dados comparativos mensais da empresa
  const dadosComparativos = useMemo(() => {
    if (!empresaId) return []
    const dados = obterDadosPorEmpresa(empresaId)
    
    console.log('📊 [useRelatorios] Dados comparativos obtidos:', {
      total: dados.length,
      dados: dados
    })
    
    // Filtrar por ano se especificado
    if (ano) {
      return dados.filter(d => d.ano === ano)
    }
    return dados
  }, [empresaId, ano, obterDadosPorEmpresa])

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

  // Processar dados de evolução temporal (COMBINA cenários + dados comparativos)
  const dadosEvolucao = useMemo((): DadosGraficoEvolucao[] => {
    const dadosPorPeriodo = new Map<string, DadosGraficoEvolucao>()
    
    // 1. Adicionar dados dos cenários aprovados
    cenariosAprovados
      .filter((c) => c.periodo.tipo === "mensal")
      .forEach((cenario) => {
        const data = parseISO(cenario.periodo.inicio)
        const periodo = format(data, "yyyy-MM")
        const mesAbrev = format(data, "MMM", { locale: ptBR })
        const config = cenario.configuracao

        const receita = config.receitaBruta || 0
        const baseICMS = receita * (1 - (config.percentualST || 0) / 100)
        const icms = baseICMS * ((config.icmsInterno || 0) / 100)
        const basePIS = receita * (1 - (config.percentualMonofasico || 0) / 100)
        const pis = basePIS * ((config.pisAliq || 0) / 100)
        const cofins = basePIS * ((config.cofinsAliq || 0) / 100)
        const despesas = (config.salariosPF || 0) + (config.alimentacao || 0) + 
                        (config.combustivelPasseio || 0) + (config.outrasDespesas || 0)
        const baseIR = receita - (config.cmvTotal || 0) - despesas + 
                       (config.adicoesLucro || 0) - (config.exclusoesLucro || 0)
        const irpj = Math.max(0, baseIR * ((config.irpjBase || 0) / 100))
        const csll = Math.max(0, baseIR * ((config.csllAliq || 0) / 100))
        const iss = receita * ((config.issAliq || 0) / 100)
        
        const totalImpostos = icms + pis + cofins + irpj + csll + iss
        const lucro = receita - totalImpostos - despesas - (config.cmvTotal || 0)

        dadosPorPeriodo.set(periodo, {
          mes: mesAbrev,
          periodo,
          receita,
          impostos: totalImpostos,
          lucro,
        })
      })
    
    // 2. Adicionar/sobrepor dados comparativos (dados reais têm prioridade)
    dadosComparativos.forEach((dado) => {
      // Mapear mês de "jan" para número "01"
      const mesNumero = {
        'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
        'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
      }[dado.mes] || '01'
      
      const periodo = `${dado.ano}-${mesNumero}`
      const totalImpostos = (dado.icms || 0) + (dado.pis || 0) + (dado.cofins || 0) + 
                           (dado.irpj || 0) + (dado.csll || 0) + (dado.iss || 0) + (dado.outros || 0)
      const lucro = (dado.receita || 0) - totalImpostos
      
      // Dados comparativos sobrescrevem dados de cenários
      dadosPorPeriodo.set(periodo, {
        mes: dado.mes,
        periodo,
        receita: dado.receita || 0,
        impostos: totalImpostos,
        lucro,
      })
    })
    
    // 3. Converter mapa para array e ordenar
    return Array.from(dadosPorPeriodo.values())
      .sort((a, b) => a.periodo.localeCompare(b.periodo))
  }, [cenariosAprovados, dadosComparativos])

  // Processar composição de impostos (COMBINA cenários + dados comparativos)
  const dadosComposicao = useMemo((): DadosGraficoComposicao[] => {
    const totais = {
      icms: 0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      iss: 0,
    }

    // 1. Somar impostos dos cenários aprovados
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
    
    // 2. Somar impostos dos dados comparativos
    dadosComparativos.forEach((dado) => {
      totais.icms += dado.icms || 0
      totais.pis += dado.pis || 0
      totais.cofins += dado.cofins || 0
      totais.irpj += dado.irpj || 0
      totais.csll += dado.csll || 0
      totais.iss += dado.iss || 0
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
  }, [cenariosAprovados, dadosComparativos])

  // Calcular margens (COMBINA cenários + dados comparativos)
  const dadosMargem = useMemo((): DadosGraficoMargem[] => {
    let receitaTotal = 0
    let custosTotal = 0
    let impostosTotal = 0
    let despesasTotal = 0

    // 1. Somar valores dos cenários aprovados
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
    
    // 2. Somar valores dos dados comparativos
    dadosComparativos.forEach((dado) => {
      const totalImpostosDado = (dado.icms || 0) + (dado.pis || 0) + (dado.cofins || 0) + 
                                (dado.irpj || 0) + (dado.csll || 0) + (dado.iss || 0) + (dado.outros || 0)
      receitaTotal += dado.receita || 0
      impostosTotal += totalImpostosDado
      // Nota: dados comparativos não têm custos/despesas detalhados
    })

    const lucroBruto = receitaTotal - custosTotal
    const lucroLiquido = receitaTotal - custosTotal - despesasTotal - impostosTotal

    const margemBruta = receitaTotal > 0 ? (lucroBruto / receitaTotal) * 100 : 0
    const margemLiquida = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0

    return [
      { categoria: "Margem Bruta", valor: margemBruta, meta: 40 },
      { categoria: "Margem Líquida", valor: margemLiquida, meta: 20 },
    ]
  }, [cenariosAprovados, dadosComparativos])

  // Calcular métricas financeiras abrangentes (COMBINA cenários + dados comparativos)
  const dadosMetricasFinanceiras = useMemo((): DadosMetricasFinanceiras[] => {
    let receitaTotal = 0
    let custosTotal = 0
    let despesasTotal = 0
    let icmsTotal = 0
    let pisTotal = 0
    let cofinsTotal = 0
    let irpjTotal = 0
    let csllTotal = 0

    // 1. Somar métricas dos cenários aprovados
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
    
    // 2. Somar métricas dos dados comparativos
    dadosComparativos.forEach((dado) => {
      receitaTotal += dado.receita || 0
      icmsTotal += dado.icms || 0
      pisTotal += dado.pis || 0
      cofinsTotal += dado.cofins || 0
      irpjTotal += dado.irpj || 0
      csllTotal += dado.csll || 0
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
  }, [cenariosAprovados, dadosComparativos])

  // Calcular evolução financeira mensal (COMBINA cenários + dados comparativos)
  const dadosEvolucaoFinanceira = useMemo((): DadosEvolucaoFinanceira[] => {
    const dadosPorPeriodo = new Map<string, DadosEvolucaoFinanceira>()
    
    // 1. Adicionar dados dos cenários aprovados
    cenariosAprovados
      .filter((c) => c.periodo.tipo === "mensal")
      .forEach((cenario) => {
        const data = parseISO(cenario.periodo.inicio)
        const periodo = format(data, "yyyy-MM")
        const mesAbrev = format(data, "MMM", { locale: ptBR })
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

        dadosPorPeriodo.set(periodo, {
          mes: mesAbrev,
          receita,
          lucroLiquido,
          icms,
          irpj,
          csll,
          pis,
          cofins,
        })
      })
    
    // 2. Adicionar/sobrepor dados comparativos (dados reais têm prioridade)
    dadosComparativos.forEach((dado) => {
      const mesNumero = {
        'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
        'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
      }[dado.mes] || '01'
      
      const periodo = `${dado.ano}-${mesNumero}`
      const totalImpostos = (dado.icms || 0) + (dado.pis || 0) + (dado.cofins || 0) + 
                           (dado.irpj || 0) + (dado.csll || 0) + (dado.iss || 0) + (dado.outros || 0)
      const lucroLiquido = (dado.receita || 0) - totalImpostos
      
      dadosPorPeriodo.set(periodo, {
        mes: dado.mes,
        receita: dado.receita || 0,
        lucroLiquido,
        icms: dado.icms || 0,
        irpj: dado.irpj || 0,
        csll: dado.csll || 0,
        pis: dado.pis || 0,
        cofins: dado.cofins || 0,
      })
    })
    
    // 3. Converter mapa para array e ordenar
    return Array.from(dadosPorPeriodo.values())
      .sort((a, b) => {
        // Ordenar por mês
        const mesesOrdem = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
        return mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes)
      })
  }, [cenariosAprovados, dadosComparativos])

  // Gerar linhas da tabela consolidada (COMBINA cenários + dados comparativos)
  const linhasTabela = useMemo((): LinhaRelatorioAnual[] => {
    const linhasPorPeriodo = new Map<string, LinhaRelatorioAnual>()
    
    // 1. Adicionar linhas dos cenários aprovados
    cenariosAprovados
      .filter((c) => c.periodo.tipo === "mensal")
      .forEach((cenario) => {
        const data = parseISO(cenario.periodo.inicio)
        const periodo = format(data, "yyyy-MM")
        const mesNome = format(data, "MMMM", { locale: ptBR })
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

        linhasPorPeriodo.set(periodo, {
          mes: mesNome,
          periodo,
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
        })
      })
    
    // 2. Adicionar/sobrepor linhas dos dados comparativos (dados reais têm prioridade)
    dadosComparativos.forEach((dado) => {
      const mesNumero = {
        'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
        'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
      }[dado.mes] || '01'
      
      const mesNome = {
        'jan': 'janeiro', 'fev': 'fevereiro', 'mar': 'março', 'abr': 'abril',
        'mai': 'maio', 'jun': 'junho', 'jul': 'julho', 'ago': 'agosto',
        'set': 'setembro', 'out': 'outubro', 'nov': 'novembro', 'dez': 'dezembro'
      }[dado.mes] || 'janeiro'
      
      const periodo = `${dado.ano}-${mesNumero}`
      const receita = dado.receita || 0
      const icms = dado.icms || 0
      const pis = dado.pis || 0
      const cofins = dado.cofins || 0
      const irpj = dado.irpj || 0
      const csll = dado.csll || 0
      const iss = dado.iss || 0
      const outros = dado.outros || 0
      
      const totalImpostos = icms + pis + cofins + irpj + csll + iss + outros
      
      // Dados comparativos não têm custos/despesas detalhados
      const custos = 0
      const despesas = 0
      const lucroBruto = receita - custos
      const lucroLiquido = receita - totalImpostos
      
      const margemBruta = receita > 0 ? (lucroBruto / receita) * 100 : 0
      const margemLiquida = receita > 0 ? (lucroLiquido / receita) * 100 : 0
      const cargaTributaria = receita > 0 ? (totalImpostos / receita) * 100 : 0
      
      linhasPorPeriodo.set(periodo, {
        mes: mesNome,
        periodo,
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
      })
    })
    
    // 3. Converter mapa para array e ordenar por período
    return Array.from(linhasPorPeriodo.values())
      .sort((a, b) => a.periodo.localeCompare(b.periodo))
  }, [cenariosAprovados, dadosComparativos])

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

  // Anos disponíveis para filtro (inclui anos de cenários E dados comparativos)
  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>()
    
    // Anos dos cenários
    cenarios.forEach((c) => {
      const ano = new Date(c.periodo.inicio).getFullYear()
      anos.add(ano)
    })
    
    // Anos dos dados comparativos
    dadosComparativos.forEach((d) => {
      anos.add(d.ano)
    })
    
    return Array.from(anos).sort((a, b) => b - a)
  }, [cenarios, dadosComparativos])

  return {
    cenarios,
    cenariosAprovados,
    dadosComparativos, // Incluir dados comparativos no retorno
    dadosEvolucao,
    dadosComposicao,
    dadosMargem,
    dadosMetricasFinanceiras,
    dadosEvolucaoFinanceira,
    linhasTabela,
    totais,
    anosDisponiveis,
    temDados: cenariosAprovados.length > 0 || dadosComparativos.length > 0, // Tem dados se houver cenários OU comparativos
  }
}
