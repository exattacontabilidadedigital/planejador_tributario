"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import type { DadosMensalRegime } from '@/types/comparativo-analise'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, LineChart as LineChartIcon, BarChart3, PieChart as PieChartIcon, Radar as RadarIcon, TrendingUp } from 'lucide-react'

interface GraficoDashboardComparativoProps {
  dadosLucroReal?: DadosMensalRegime[]
  dadosLucroPresumido?: DadosMensalRegime[]
  dadosSimplesNacional?: DadosMensalRegime[]
  ano: number
}

export function GraficoDashboardComparativo({
  dadosLucroReal,
  dadosLucroPresumido,
  dadosSimplesNacional,
  ano
}: GraficoDashboardComparativoProps) {
  
  // Estado para controlar modal de detalhamento
  const [modalAberto, setModalAberto] = useState(false)
  const [regimeSelecionado, setRegimeSelecionado] = useState<'lucro_real' | 'lucro_presumido' | 'simples_nacional' | null>(null)
  const [dadosDetalhados, setDadosDetalhados] = useState<any[] | null>(null)
  const [mesesExpandidos, setMesesExpandidos] = useState<Set<number>>(new Set())
  
  // Estado para tipo de visualização
  type TipoVisualizacao = 'linha' | 'barra' | 'barraEmpilhada' | 'pizza' | 'radar'
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('linha')
  
  // Estado para controlar modo do gráfico de pizza (total por regime ou detalhamento)
  const [modoPizza, setModoPizza] = useState<'regimes' | 'detalhamento'>('regimes')
  
  // Função para alternar expansão de um mês
  const toggleMesExpandido = (index: number) => {
    setMesesExpandidos(prev => {
      const novo = new Set(prev)
      if (novo.has(index)) {
        novo.delete(index)
      } else {
        novo.add(index)
      }
      return novo
    })
  }
  
  // Função para expandir/contrair todos
  const expandirTodos = () => {
    if (dadosDetalhados) {
      setMesesExpandidos(new Set(dadosDetalhados.map((_, i) => i)))
    }
  }
  
  const contrairTodos = () => {
    setMesesExpandidos(new Set())
  }
  
  // Função para abrir modal com detalhes
  const abrirDetalhamento = (regime: 'lucro_real' | 'lucro_presumido' | 'simples_nacional') => {
    console.log('🔍 [DETALHAMENTO] Abrindo modal para:', regime)
    console.log('🔍 [DETALHAMENTO] Dados disponíveis:', {
      lucroReal: dadosLucroReal?.length || 0,
      lucroPresumido: dadosLucroPresumido?.length || 0,
      simplesNacional: dadosSimplesNacional?.length || 0
    })
    
    setRegimeSelecionado(regime)
    
    let dados: any[] = []
    if (regime === 'lucro_real') {
      dados = dadosLucroReal || []
    } else if (regime === 'lucro_presumido') {
      dados = dadosLucroPresumido || []
    } else if (regime === 'simples_nacional') {
      dados = dadosSimplesNacional || []
    }
    
    console.log('🔍 [DETALHAMENTO] Dados selecionados:', {
      regime,
      quantidade: dados.length,
      primeiroItem: dados[0]
    })
    
    // Ordenar dados por mês antes de exibir
    const dadosOrdenados = [...dados].sort((a, b) => {
      const mesA = typeof a.mes === 'string' ? parseInt(a.mes) : a.mes
      const mesB = typeof b.mes === 'string' ? parseInt(b.mes) : b.mes
      return mesA - mesB
    })
    
    console.log('🔍 [DETALHAMENTO] Dados ordenados:', dadosOrdenados.map(d => ({ 
      mes: d.mes, 
      ano: d.ano, 
      receita: d.receita,
      totalImpostos: d.totalImpostos 
    })))
    
    setDadosDetalhados(dadosOrdenados)
    setModalAberto(true)
  }
  
  // Função para converter número de mês para nome
  const converterMesParaNome = (mes: string | number): string => {
    const mesesNomes: Record<string, string> = {
      '1': 'jan', '01': 'jan',
      '2': 'fev', '02': 'fev',
      '3': 'mar', '03': 'mar',
      '4': 'abr', '04': 'abr',
      '5': 'mai', '05': 'mai',
      '6': 'jun', '06': 'jun',
      '7': 'jul', '07': 'jul',
      '8': 'ago', '08': 'ago',
      '9': 'set', '09': 'set',
      '10': 'out',
      '11': 'nov',
      '12': 'dez'
    }
    const mesStr = String(mes)
    return mesesNomes[mesStr] || mesStr
  }
  
  // Combinar dados de todos os regimes por mês
  const mesesMap = new Map<string, any>()
  
  // Função auxiliar para calcular total de impostos
  const calcularTotalImpostos = (dado: any): number => {
    console.log('💰 [CALC IMPOSTOS] Calculando total para:', dado)
    
    // Se já tiver totalImpostos, usar direto
    if (typeof dado.totalImpostos === 'number') {
      console.log('💰 [CALC IMPOSTOS] Usando totalImpostos direto:', dado.totalImpostos)
      return dado.totalImpostos
    }
    
    // Senão, tentar somar do objeto impostos
    const impostos = (dado as any).impostos || {}
    console.log('💰 [CALC IMPOSTOS] Objeto impostos:', impostos)
    
    if (typeof impostos === 'object') {
      const valores = Object.entries(impostos).map(([key, valor]) => {
        const num = typeof valor === 'number' ? valor : 0
        console.log(`💰 [CALC IMPOSTOS]   ${key}: ${num}`)
        return num
      })
      
      const total = valores.reduce((sum, valor) => sum + valor, 0)
      console.log('💰 [CALC IMPOSTOS] Total calculado:', total)
      return total
    }
    
    console.log('💰 [CALC IMPOSTOS] Retornando 0 (sem dados)')
    return 0
  }
  
  // Processar todos os regimes
  dadosLucroReal?.forEach(dado => {
    const mesNome = converterMesParaNome(dado.mes)
    if (!mesesMap.has(mesNome)) {
      mesesMap.set(mesNome, { mes: mesNome })
    }
    const item = mesesMap.get(mesNome)!
    const impostos = calcularTotalImpostos(dado)
    item.impostosLucroReal = impostos
    item.receitaReal = dado.receita || 0
    
    console.log(`📊 [LUCRO REAL] Mês ${mesNome}:`, {
      dadoOriginal: dado,
      impostosCalculados: impostos,
      receita: item.receitaReal
    })
  })
  
  dadosLucroPresumido?.forEach(dado => {
    const mesNome = converterMesParaNome(dado.mes)
    if (!mesesMap.has(mesNome)) {
      mesesMap.set(mesNome, { mes: mesNome })
    }
    const item = mesesMap.get(mesNome)!
    item.impostosLucroPresumido = calcularTotalImpostos(dado)
    item.receitaPresumido = dado.receita || 0
  })
  
  dadosSimplesNacional?.forEach(dado => {
    const mesNome = converterMesParaNome(dado.mes)
    if (!mesesMap.has(mesNome)) {
      mesesMap.set(mesNome, { mes: mesNome })
    }
    const item = mesesMap.get(mesNome)!
    item.impostosSimplesNacional = calcularTotalImpostos(dado)
    item.receitaSimples = dado.receita || 0
  })
  
  // Converter para array ordenado
  const mesesOrdenados = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const dadosGrafico = mesesOrdenados
    .map(mes => {
      const item = mesesMap.get(mes)
      console.log(`🔍 [MAP DEBUG] Mês ${mes}:`, item)
      return item
    })
    .filter(item => item !== undefined && item !== null)
  
  console.log('📈 [GRÁFICO DASHBOARD] Preparando renderização:', {
    temDadosLR: !!dadosLucroReal && dadosLucroReal.length > 0,
    temDadosLP: !!dadosLucroPresumido && dadosLucroPresumido.length > 0,
    temDadosSN: !!dadosSimplesNacional && dadosSimplesNacional.length > 0,
    quantidadeLR: dadosLucroReal?.length || 0,
    quantidadeLP: dadosLucroPresumido?.length || 0,
    quantidadeSN: dadosSimplesNacional?.length || 0,
    dadosGraficoLength: dadosGrafico.length,
    primeiroMes: dadosGrafico[0],
    mesesMap: Array.from(mesesMap.keys()),
    primeiroDadoLP: dadosLucroPresumido?.[0],
    ano
  })
  
  if (dadosGrafico.length === 0) {
    console.log('⚠️ [GRÁFICO DASHBOARD] Nenhum dado para exibir - retornando null')
    console.log('🔍 [DEBUG] Dados recebidos:', {
      dadosLucroPresumido,
      mesesNoMap: Array.from(mesesMap.entries())
    })
    return null
  }
  
  const formatarMoeda = (valor: number): string => {
    if (valor >= 1000000) return `${(valor / 1000000).toFixed(1)}M`
    if (valor >= 1000) return `${(valor / 1000).toFixed(0)}K`
    return valor.toString()
  }
  
  const formatarMoedaTooltip = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  
  const formatarMes = (mes: string): string => {
    const meses: Record<string, string> = {
      'jan': 'Jan', 'fev': 'Fev', 'mar': 'Mar', 'abr': 'Abr',
      'mai': 'Mai', 'jun': 'Jun', 'jul': 'Jul', 'ago': 'Ago',
      'set': 'Set', 'out': 'Out', 'nov': 'Nov', 'dez': 'Dez'
    }
    return meses[mes] || mes
  }
  
  // Componente de tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null
    
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold mb-2">{formatarMes(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-semibold">{formatarMoedaTooltip(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  // Calcular estatísticas para insights
  const calcularEstatisticas = () => {
    // ✅ Calcular totais DIRETAMENTE dos dados originais, não do dadosGrafico
    // Isso garante que capturamos TODOS os dados, mesmo se houver problemas no mapeamento
    const totalImpostosLucroReal = Math.max(0, 
      (dadosLucroReal || []).reduce((sum, d) => sum + calcularTotalImpostos(d), 0)
    )
    const totalImpostosLucroPresumido = Math.max(0,
      (dadosLucroPresumido || []).reduce((sum, d) => sum + calcularTotalImpostos(d), 0)
    )
    const totalImpostosSimplesNacional = Math.max(0,
      (dadosSimplesNacional || []).reduce((sum, d) => sum + calcularTotalImpostos(d), 0)
    )
    
    console.log('📊 [STATS] Totais calculados DIRETAMENTE dos dados originais:', {
      lucroReal: {
        total: totalImpostosLucroReal,
        quantidadeRegistros: dadosLucroReal?.length || 0,
        detalhamento: dadosLucroReal?.map(d => ({
          mes: d.mes,
          totalImpostos: calcularTotalImpostos(d)
        }))
      },
      lucroPresumido: {
        total: totalImpostosLucroPresumido,
        quantidadeRegistros: dadosLucroPresumido?.length || 0
      },
      simplesNacional: {
        total: totalImpostosSimplesNacional,
        quantidadeRegistros: dadosSimplesNacional?.length || 0
      }
    })
    
    const totalReceita = dadosGrafico.reduce((sum, d) => 
      sum + Math.max(d.receitaReal || 0, d.receitaPresumido || 0, d.receitaSimples || 0), 0)
    
    // Criar lista de regimes que realmente têm dados (dinâmico)
    const regimesComDados = []
    
    if (dadosLucroReal && dadosLucroReal.length > 0 && totalImpostosLucroReal > 0) {
      regimesComDados.push({ 
        nome: 'Lucro Real', 
        total: totalImpostosLucroReal, 
        cor: '#ef4444',
        tipo: 'lucro_real' as const
      })
    }
    
    if (dadosLucroPresumido && dadosLucroPresumido.length > 0 && totalImpostosLucroPresumido > 0) {
      regimesComDados.push({ 
        nome: 'Lucro Presumido', 
        total: totalImpostosLucroPresumido, 
        cor: '#3b82f6',
        tipo: 'lucro_presumido' as const
      })
    }
    
    if (dadosSimplesNacional && dadosSimplesNacional.length > 0 && totalImpostosSimplesNacional > 0) {
      regimesComDados.push({ 
        nome: 'Simples Nacional', 
        total: totalImpostosSimplesNacional, 
        cor: '#10b981',
        tipo: 'simples_nacional' as const
      })
    }
    
    console.log('📊 [STATS] Regimes com dados:', regimesComDados)
    
    // Calcular receita total: usar a receita do regime com MAIOR receita total
    const receitaTotalLucroReal = (dadosLucroReal || []).reduce((sum, d) => sum + (d.receita || 0), 0)
    const receitaTotalLucroPresumido = (dadosLucroPresumido || []).reduce((sum, d) => sum + (d.receita || 0), 0)
    const receitaTotalSimplesNacional = (dadosSimplesNacional || []).reduce((sum, d) => sum + (d.receita || 0), 0)
    const receitaTotal = Math.max(receitaTotalLucroReal, receitaTotalLucroPresumido, receitaTotalSimplesNacional)
    
    console.log('💰 [RECEITA] Cálculo da receita total:', {
      lucroReal: receitaTotalLucroReal,
      lucroPresumido: receitaTotalLucroPresumido,
      simplesNacional: receitaTotalSimplesNacional,
      receitaTotal
    })
    
    // Melhor regime = MENOR total de impostos (mais econômico)
    const melhorRegime = regimesComDados.reduce((best, current) => 
      current.total < best.total ? current : best, regimesComDados[0] || { nome: 'N/A', total: 0, cor: '#000', tipo: 'lucro_real' as const })
    
    // Pior regime = MAIOR total de impostos (menos vantajoso)
    const piorRegime = regimesComDados.reduce((worst, current) => 
      current.total > worst.total ? current : worst, regimesComDados[0] || { nome: 'N/A', total: 0, cor: '#000', tipo: 'lucro_real' as const })
    
    // Economia = quanto você economiza escolhendo o melhor ao invés do pior
    const economia = Math.abs(piorRegime.total - melhorRegime.total)
    // Percentual = economia em relação ao pior regime
    const economiaPercentual = piorRegime.total > 0 ? (economia / piorRegime.total * 100) : 0
    
    console.log('📊 [STATS] Resultado:', {
      melhorRegime: { nome: melhorRegime.nome, total: melhorRegime.total },
      piorRegime: { nome: piorRegime.nome, total: piorRegime.total },
      economia,
      economiaPercentual
    })
    
    // Encontrar mês com menor imposto
    const melhorMes = dadosGrafico.reduce((best, curr) => {
      const impostosAtual = Math.min(
        curr.impostosLucroReal !== undefined ? curr.impostosLucroReal : Infinity,
        curr.impostosLucroPresumido !== undefined ? curr.impostosLucroPresumido : Infinity,
        curr.impostosSimplesNacional !== undefined ? curr.impostosSimplesNacional : Infinity
      )
      const impostosBest = Math.min(
        best.impostosLucroReal !== undefined ? best.impostosLucroReal : Infinity,
        best.impostosLucroPresumido !== undefined ? best.impostosLucroPresumido : Infinity,
        best.impostosSimplesNacional !== undefined ? best.impostosSimplesNacional : Infinity
      )
      return impostosAtual < impostosBest ? curr : best
    }, dadosGrafico[0] || {})
    
    return {
      receitaTotal,
      totalImpostosLucroReal,
      totalImpostosLucroPresumido,
      totalImpostosSimplesNacional,
      regimesComDados, // ✨ NOVO: lista dinâmica dos regimes
      melhorRegime,
      piorRegime,
      economia,
      economiaPercentual,
      melhorMes
    }
  }

  // Função para obter nome dinâmico do regime baseado nos dados reais da coluna "regime"
  const obterNomeRegimeDinamico = () => {
    console.log('🔍 [REGIME DINÂMICO] Detectando regime dos dados comparativos...')
    console.log('🔍 [REGIME DINÂMICO] PROPS RECEBIDAS:', {
      dadosLucroPresumido_total: dadosLucroPresumido?.length || 0,
      dadosLucroPresumido_primeiro: dadosLucroPresumido?.[0],
      dadosLucroPresumido_todos: dadosLucroPresumido,
      dadosSimplesNacional_total: dadosSimplesNacional?.length || 0,
      dadosSimplesNacional_primeiro: dadosSimplesNacional?.[0],
      dadosSimplesNacional_todos: dadosSimplesNacional
    })
    
    // 1. Verificar qual prop tem dados
    const temPresumido = dadosLucroPresumido && dadosLucroPresumido.length > 0
    const temSimples = dadosSimplesNacional && dadosSimplesNacional.length > 0
    
    // 2. Tentar extrair o regime DIRETAMENTE da coluna "regime" dos dados
    let regimeDetectado: string | undefined
    let fonte: string = ''
    
    // IMPORTANTE: Verificar o campo regime em AMBAS as props, pois os dados podem estar na prop "errada"
    if (temPresumido) {
      const primeiroRegistro = dadosLucroPresumido[0] as any
      regimeDetectado = primeiroRegistro?.regime
      fonte = 'dadosLucroPresumido'
      
      console.log('🔍 [REGIME DINÂMICO] Verificando dadosLucroPresumido:', {
        regime: regimeDetectado,
        totalRegistros: dadosLucroPresumido.length,
        primeiroMes: primeiroRegistro?.mes,
        primeiroAno: primeiroRegistro?.ano,
        todasPropriedades: Object.keys(primeiroRegistro || {})
      })
    }
    
    if (temSimples && !regimeDetectado) {
      const primeiroRegistro = dadosSimplesNacional[0] as any
      regimeDetectado = primeiroRegistro?.regime
      fonte = 'dadosSimplesNacional'
      
      console.log('🔍 [REGIME DINÂMICO] Verificando dadosSimplesNacional:', {
        regime: regimeDetectado,
        totalRegistros: dadosSimplesNacional.length,
        primeiroMes: primeiroRegistro?.mes,
        primeiroAno: primeiroRegistro?.ano,
        todasPropriedades: Object.keys(primeiroRegistro || {})
      })
    }
    
    // 3. Mapear valor da coluna regime para nome amigável
    const mapearRegime = (regime: string | undefined): string => {
      if (!regime) {
        console.warn('⚠️ [REGIME DINÂMICO] Campo regime não encontrado nos dados!')
        console.warn('⚠️ [REGIME DINÂMICO] Tentando inferir pelo contexto...')
        
        // FALLBACK: Se não tem regime, verificar qual prop tem dados
        // Se só tem dadosSimplesNacional com dados, é Simples Nacional
        // Se só tem dadosLucroPresumido com dados, tentar inferir pelos impostos
        if (temSimples && !temPresumido) {
          console.log('✅ [REGIME DINÂMICO] Inferido: Simples Nacional (única prop com dados)')
          return 'Simples Nacional'
        }
        
        if (temPresumido && !temSimples) {
          // Verificar se tem DAS (característico do Simples Nacional)
          const primeiroRegistro = dadosLucroPresumido[0] as any
          const impostos = primeiroRegistro?.impostos || {}
          
          if (impostos.das && impostos.das > 0) {
            console.log('✅ [REGIME DINÂMICO] Inferido: Simples Nacional (tem DAS nos impostos)')
            return 'Simples Nacional'
          }
          
          // Se não tem DAS mas tem IRPJ/CSLL separados, é Lucro Presumido ou Real
          if ((impostos.irpj && impostos.irpj > 0) || (impostos.csll && impostos.csll > 0)) {
            console.log('✅ [REGIME DINÂMICO] Inferido: Lucro Presumido (tem IRPJ/CSLL separados)')
            return 'Lucro Presumido'
          }
          
          console.log('⚠️ [REGIME DINÂMICO] Não conseguiu inferir, usando fallback genérico')
          return 'Regime Comparativo'
        }
        
        return 'Regime Comparativo'
      }
      
      const mapa: Record<string, string> = {
        'lucro_presumido': 'Lucro Presumido',
        'lucroPresumido': 'Lucro Presumido',
        'presumido': 'Lucro Presumido',
        'simples_nacional': 'Simples Nacional',
        'simplesNacional': 'Simples Nacional',
        'simples': 'Simples Nacional',
        'lucro_real': 'Lucro Real',
        'lucroReal': 'Lucro Real'
      }
      
      const nomeFormatado = mapa[regime] || regime
      console.log('✅ [REGIME DINÂMICO] Mapeamento completo:', { 
        de: regime, 
        para: nomeFormatado,
        fonte,
        propCorreta: regime === 'lucro_presumido' ? 'dadosLucroPresumido' : 'dadosSimplesNacional',
        propUsada: fonte,
        matchCorreto: (regime === 'lucro_presumido' && fonte === 'dadosLucroPresumido') || 
                      (regime === 'simples_nacional' && fonte === 'dadosSimplesNacional')
      })
      return nomeFormatado
    }
    
    const nomeFormatado = mapearRegime(regimeDetectado)
    
    return nomeFormatado
  }

  const nomeRegimeDinamico = obterNomeRegimeDinamico()

  const stats = calcularEstatisticas()
  
  return (
    <>
      {/* Cards de Resumo */}
      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card: Cenário Principal (Lucro Real) */}
        <Card 
          className="border-primary/50 cursor-pointer transition-all hover:shadow-lg"
          onClick={() => abrirDetalhamento('lucro_real')}
        >
          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
            <CardDescription className="flex items-center justify-between">
              <span className="font-semibold text-xs md:text-sm">Cenário Principal</span>
              <span className="text-xs bg-primary/10 text-primary px-1 md:px-2 py-1 rounded">Lucro Real</span>
            </CardDescription>
            <CardTitle className="text-lg md:text-2xl text-blue-600">
              {formatarMoedaTooltip(stats.totalImpostosLucroReal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs text-muted-foreground">Clique para ver detalhes</p>
          </CardContent>
        </Card>

        {/* Card: Dados Comparativos (Regime Dinâmico) */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg border-2 ${stats.melhorRegime.nome === nomeRegimeDinamico ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : stats.piorRegime.nome === nomeRegimeDinamico ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20' : 'border-muted'}`}
          onClick={() => {
            // Determinar qual regime abrir baseado no nome dinâmico
            const regimeParaAbrir = nomeRegimeDinamico === 'Lucro Presumido' 
              ? 'lucro_presumido' 
              : 'simples_nacional'
            abrirDetalhamento(regimeParaAbrir)
          }}
        >
          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
            <CardDescription className="flex items-center justify-between">
              <span className="font-semibold text-xs md:text-sm">Dados Comparativos</span>
              <span className="text-xs bg-secondary px-1 md:px-2 py-1 rounded font-medium">{nomeRegimeDinamico}</span>
            </CardDescription>
            <CardTitle className={`text-lg md:text-2xl flex items-center gap-2 ${stats.melhorRegime.nome === nomeRegimeDinamico ? 'text-green-600' : stats.piorRegime.nome === nomeRegimeDinamico ? 'text-red-500' : 'text-blue-500'}`}>
              {nomeRegimeDinamico === 'Lucro Presumido' ? formatarMoedaTooltip(stats.totalImpostosLucroPresumido) : formatarMoedaTooltip(stats.totalImpostosSimplesNacional)}
              {stats.melhorRegime.nome === nomeRegimeDinamico && stats.piorRegime.nome !== nomeRegimeDinamico && (
                <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900 px-1 md:px-2 py-1 rounded">✓ Mais Econômico</span>
              )}
              {stats.piorRegime.nome === nomeRegimeDinamico && stats.melhorRegime.nome !== nomeRegimeDinamico && (
                <span className="text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900 px-1 md:px-2 py-1 rounded">Menos Vantajoso</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs text-muted-foreground">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>

        {/* Card: Diferença e Insights */}
        <Card className="border-2 border-muted">
          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Diferença entre Regimes</span>
            </CardDescription>
            <CardTitle className={`text-lg md:text-2xl ${
              stats.economia > 0 
                ? stats.melhorRegime.nome === 'Lucro Real' 
                  ? 'text-blue-600' 
                  : 'text-green-600'
                : 'text-red-500'
            }`}>
              {formatarMoedaTooltip(stats.economia)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs text-muted-foreground">
              {stats.economia > 0 
                ? `${stats.melhorRegime.nome} economiza ${stats.economiaPercentual.toFixed(1)}%`
                : 'Regimes equivalentes'
              }
            </p>
          </CardContent>
        </Card>
        
        {/* Card: Receita Total (movido para 4ª posição) */}
        <Card>
          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Receita Total</CardDescription>
            <CardTitle className="text-lg md:text-2xl text-muted-foreground">
              {formatarMoedaTooltip(stats.receitaTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <p className="text-xs text-muted-foreground">Base de cálculo</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Card de Insights Inteligentes */}
      {stats.economia > 0 && (
        <Card className="col-span-full bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Insight do Regime Mais Vantajoso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                <strong className="text-primary">{stats.melhorRegime.nome}</strong> é o regime mais econômico para esta empresa. 
                Comparado ao <strong>{stats.piorRegime.nome}</strong>, você economiza <strong className="text-green-600">{formatarMoedaTooltip(stats.economia)}</strong> em impostos, 
                o que representa uma redução de <strong className="text-green-600">{stats.economiaPercentual.toFixed(1)}%</strong> na carga tributária.
              </p>
              
              {stats.receitaTotal > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Carga Tributária - {stats.melhorRegime.nome}</p>
                    <p className="text-lg font-semibold text-green-600">
                      {((stats.melhorRegime.total / stats.receitaTotal) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carga Tributária - {stats.piorRegime.nome}</p>
                    <p className="text-lg font-semibold text-red-600">
                      {((stats.piorRegime.total / stats.receitaTotal) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Redução de Carga</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {(((stats.piorRegime.total - stats.melhorRegime.total) / stats.receitaTotal) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card do Gráfico */}
      <Card className="col-span-full relative z-10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comparação de Impostos - {ano}</CardTitle>
              <CardDescription>
                Acompanhe o total de impostos pagos em cada regime tributário ao longo do ano (quanto menor, melhor)
              </CardDescription>
            </div>
            
            {/* Seletor de Visualização */}
            <div className="flex flex-wrap gap-1 md:gap-2 justify-center sm:justify-end">
              <Button
                variant={tipoVisualizacao === 'linha' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('linha')}
                title="Gráfico de Linhas"
                className="h-7 w-7 p-0 md:h-8 md:w-8 md:p-2"
              >
                <LineChartIcon className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'barra' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('barra')}
                title="Gráfico de Barras"
                className="h-7 w-7 p-0 md:h-8 md:w-8 md:p-2"
              >
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'barraEmpilhada' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('barraEmpilhada')}
                title="Barras Empilhadas"
                className="h-7 w-7 p-0 md:h-8 md:w-8 md:p-2"
              >
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'pizza' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('pizza')}
                title="Gráfico de Pizza"
                className="h-7 w-7 p-0 md:h-8 md:w-8 md:p-2"
              >
                <PieChartIcon className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'radar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('radar')}
                title="Gráfico de Radar"
                className="h-7 w-7 p-0 md:h-8 md:w-8 md:p-2"
              >
                <RadarIcon className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <div className={`w-full ${tipoVisualizacao === 'pizza' && modoPizza === 'regimes' ? 'h-auto' : 'h-[400px]'}`}>
          {tipoVisualizacao === 'linha' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dadosGrafico}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="mes"
                tickFormatter={formatarMes}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatarMoeda}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const nomes: Record<string, string> = {
                    'impostosLucroReal': 'Lucro Real',
                    'impostosLucroPresumido': 'Lucro Presumido',
                    'impostosSimplesNacional': 'Simples Nacional'
                  }
                  return nomes[value] || value
                }}
              />
              
              {/* Linha de referência no zero */}
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              
              {/* Uma linha por regime - comparação de impostos totais */}
              {dadosLucroReal && dadosLucroReal.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="impostosLucroReal"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                  name="impostosLucroReal"
                />
              )}
              
              {dadosLucroPresumido && dadosLucroPresumido.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="impostosLucroPresumido"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                  name="impostosLucroPresumido"
                />
              )}
              
              {dadosSimplesNacional && dadosSimplesNacional.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="impostosSimplesNacional"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                  name="impostosSimplesNacional"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          )}
            
            {/* Gráfico de Barras Agrupadas */}
            {tipoVisualizacao === 'barra' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="mes"
                tickFormatter={formatarMes}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatarMoeda}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const nomes: Record<string, string> = {
                    'impostosLucroReal': 'Lucro Real',
                    'impostosLucroPresumido': 'Lucro Presumido',
                    'impostosSimplesNacional': 'Simples Nacional'
                  }
                  return nomes[value] || value
                }}
              />
              
              {dadosLucroReal && dadosLucroReal.length > 0 && (
                <Bar dataKey="impostosLucroReal" fill="#ef4444" name="impostosLucroReal" radius={[8, 8, 0, 0]} />
              )}
              {dadosLucroPresumido && dadosLucroPresumido.length > 0 && (
                <Bar dataKey="impostosLucroPresumido" fill="#3b82f6" name="impostosLucroPresumido" radius={[8, 8, 0, 0]} />
              )}
              {dadosSimplesNacional && dadosSimplesNacional.length > 0 && (
                <Bar dataKey="impostosSimplesNacional" fill="#10b981" name="impostosSimplesNacional" radius={[8, 8, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
          )}
            
            {/* Gráfico de Barras Empilhadas */}
            {tipoVisualizacao === 'barraEmpilhada' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="mes"
                tickFormatter={formatarMes}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatarMoeda}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const nomes: Record<string, string> = {
                    'impostosLucroReal': 'Lucro Real',
                    'impostosLucroPresumido': 'Lucro Presumido',
                    'impostosSimplesNacional': 'Simples Nacional'
                  }
                  return nomes[value] || value
                }}
              />
              
              {dadosLucroReal && dadosLucroReal.length > 0 && (
                <Bar dataKey="impostosLucroReal" stackId="a" fill="#ef4444" name="impostosLucroReal" />
              )}
              {dadosLucroPresumido && dadosLucroPresumido.length > 0 && (
                <Bar dataKey="impostosLucroPresumido" stackId="a" fill="#3b82f6" name="impostosLucroPresumido" />
              )}
              {dadosSimplesNacional && dadosSimplesNacional.length > 0 && (
                <Bar dataKey="impostosSimplesNacional" stackId="a" fill="#10b981" name="impostosSimplesNacional" />
              )}
            </BarChart>
          </ResponsiveContainer>
          )}
            
            {/* Gráfico de Pizza - Comparação entre Regimes ou Detalhamento por Imposto */}
            {tipoVisualizacao === 'pizza' && (
          <div className="w-full h-full">
            {/* Controles de modo de visualização da pizza */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4 px-2">
              <Button
                variant={modoPizza === 'regimes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setModoPizza('regimes')}
                className="text-xs md:text-sm px-2 md:px-3 h-8 whitespace-normal text-center"
              >
                <span className="hidden sm:inline">Comparação entre Regimes</span>
                <span className="sm:hidden">Comparação Regimes</span>
              </Button>
              <Button
                variant={modoPizza === 'detalhamento' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setModoPizza('detalhamento')}
                className="text-xs md:text-sm px-2 md:px-3 h-8 whitespace-normal text-center"
              >
                <span className="hidden sm:inline">Detalhamento por Tipo de Imposto</span>
                <span className="sm:hidden">Por Tipo de Imposto</span>
              </Button>
            </div>
            
            {modoPizza === 'regimes' ? (
              // MODO 1: Pizza comparando total de impostos por regime
              <div className="flex flex-col items-center">
                {(() => {
                  // Calcular totais de cada regime
                  const totalReal = (dadosLucroReal || []).reduce((sum, dado) => sum + calcularTotalImpostos(dado), 0)
                  const totalPresumido = (dadosLucroPresumido || []).reduce((sum, dado) => sum + calcularTotalImpostos(dado), 0)
                  const totalSimples = (dadosSimplesNacional || []).reduce((sum, dado) => sum + calcularTotalImpostos(dado), 0)
                  
                  console.log('📊 [PIZZA REGIMES] Totais calculados:', { totalReal, totalPresumido, totalSimples })
                  
                  // Criar dados para pizza de comparação entre regimes
                  const dadosPizzaRegimes = [
                    { name: 'Lucro Real', value: totalReal, color: '#ef4444' },
                    { name: 'Lucro Presumido', value: totalPresumido, color: '#3b82f6' },
                    { name: 'Simples Nacional', value: totalSimples, color: '#10b981' }
                  ].filter(item => item.value > 0)
                  
                  const totalGeral = dadosPizzaRegimes.reduce((sum, d) => sum + d.value, 0)
                  
                  // Encontrar o menor valor (melhor regime)
                  const menorValor = Math.min(...dadosPizzaRegimes.map(d => d.value))
                  
                  return (
                    <>
                      <h3 className="text-xl font-bold mb-2 text-center">
                        Total de Impostos por Regime Tributário - {ano}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Quanto menor, melhor • Total geral: {formatarMoedaTooltip(totalGeral)}
                      </p>
                      
                      {dadosPizzaRegimes.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                              <Pie
                                data={dadosPizzaRegimes}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value, percent }: any) => {
                                  const isMenor = value === menorValor
                                  return `${name}: ${formatarMoedaTooltip(value)} (${(percent * 100).toFixed(1)}%)${isMenor ? ' ✓' : ''}`
                                }}
                                outerRadius={120}
                                innerRadius={60}
                                dataKey="value"
                              >
                                {dadosPizzaRegimes.map((entry, index) => {
                                  const isMenor = entry.value === menorValor
                                  return (
                                    <Cell 
                                      key={`cell-regime-${index}`} 
                                      fill={entry.color}
                                      stroke={isMenor ? '#fff' : 'none'}
                                      strokeWidth={isMenor ? 3 : 0}
                                      opacity={isMenor ? 1 : 0.8}
                                    />
                                  )
                                })}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number, name: string) => [
                                  formatarMoedaTooltip(value),
                                  name
                                ]}
                              />
                              <Legend 
                                formatter={(value: string, entry: any) => {
                                  const isMenor = entry.payload.value === menorValor
                                  return `${value}${isMenor ? ' (Melhor Opção ✓)' : ''}`
                                }}
                                wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          {/* Ranking de regimes */}
                          <div className="mt-6 space-y-2 relative z-10">
                            <h4 className="text-sm font-semibold text-center mb-3">Ranking de Economia:</h4>
                            {dadosPizzaRegimes
                              .sort((a, b) => a.value - b.value)
                              .map((regime, index) => {
                                const economia = totalGeral > 0 
                                  ? ((totalGeral - regime.value) / totalGeral * 100)
                                  : 0
                                const isMelhor = index === 0
                                
                                return (
                                  <div 
                                    key={regime.name}
                                    className={`flex items-center justify-between p-3 rounded-lg border relative ${
                                      isMelhor ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-800' : 'bg-muted/50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold" style={{ color: regime.color }}>
                                        {index + 1}º
                                      </span>
                                      <div>
                                        <div className="font-medium">{regime.name}</div>
                                        {isMelhor && <div className="text-xs text-green-600 dark:text-green-400">✓ Melhor opção</div>}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold">{formatarMoedaTooltip(regime.value)}</div>
                                      {index > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          +{formatarMoedaTooltip(regime.value - menorValor)} vs. melhor
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center text-muted-foreground h-64">
                          Nenhum dado disponível para comparação
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : (
              // MODO 2: Pizzas com detalhamento por tipo de imposto
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {(() => {
                  // Cores para cada tipo de imposto
                  const CORES_IMPOSTOS = {
                    icms: '#3b82f6',    // Azul
                    pis: '#8b5cf6',     // Roxo
                    cofins: '#ec4899',  // Rosa
                    irpj: '#f97316',    // Laranja
                    csll: '#eab308',    // Amarelo
                    iss: '#14b8a6',     // Turquesa
                    cpp: '#6366f1',     // Índigo
                    inss: '#06b6d4',    // Cyan
                    das: '#10b981',     // Verde
                    outros: '#6b7280'   // Cinza
                  }
              
              // Função para calcular totais de impostos por tipo para um regime
              const calcularImpostosPorTipo = (dados: any[], regimeNome: string = '') => {
                const totais: Record<string, number> = {
                  icms: 0, pis: 0, cofins: 0, irpj: 0, csll: 0,
                  iss: 0, cpp: 0, inss: 0, das: 0, outros: 0
                }
                
                console.log(`📊 [CALCULAR IMPOSTOS] ${regimeNome}:`, {
                  quantidadeDados: dados?.length || 0,
                  primeiroItem: dados?.[0]
                })
                
                dados?.forEach((dado, index) => {
                  console.log(`📊 [CALCULAR IMPOSTOS] ${regimeNome} - Mês ${index + 1}:`, {
                    impostos: dado.impostos,
                    impostos_detalhados: dado.impostos_detalhados,
                    totalImpostos: dado.totalImpostos
                  })
                  
                  if (dado.impostos_detalhados) {
                    // Impostos detalhados (objeto)
                    Object.entries(dado.impostos_detalhados).forEach(([key, value]) => {
                      if (totais.hasOwnProperty(key) && typeof value === 'number') {
                        console.log(`  ✓ impostos_detalhados.${key}: ${value}`)
                        totais[key] += value
                      }
                    })
                  } else if (typeof dado.impostos === 'object' && dado.impostos !== null) {
                    // Impostos como objeto
                    Object.entries(dado.impostos).forEach(([key, value]) => {
                      if (totais.hasOwnProperty(key) && typeof value === 'number') {
                        console.log(`  ✓ impostos.${key}: ${value}`)
                        totais[key] += value
                      }
                    })
                  }
                })
                
                console.log(`📊 [CALCULAR IMPOSTOS] ${regimeNome} - Totais:`, totais)
                
                return totais
              }
              
              // Calcular impostos para Lucro Real
              const impostosReal = calcularImpostosPorTipo(dadosLucroReal || [], 'Lucro Real')
              const dadosPizzaReal = Object.entries(impostosReal)
                .filter(([_, value]) => value > 0)
                .map(([name, value]) => ({
                  name: name.toUpperCase(),
                  value,
                  fullName: {
                    icms: 'ICMS',
                    pis: 'PIS',
                    cofins: 'COFINS',
                    irpj: 'IRPJ',
                    csll: 'CSLL',
                    iss: 'ISS',
                    cpp: 'CPP',
                    inss: 'INSS',
                    das: 'DAS',
                    outros: 'Outros'
                  }[name] || name.toUpperCase()
                }))
              
              // Calcular impostos para Lucro Presumido
              const impostosPresumido = calcularImpostosPorTipo(dadosLucroPresumido || [], 'Lucro Presumido')
              const dadosPizzaPresumido = Object.entries(impostosPresumido)
                .filter(([_, value]) => value > 0)
                .map(([name, value]) => ({
                  name: name.toUpperCase(),
                  value,
                  fullName: {
                    icms: 'ICMS',
                    pis: 'PIS',
                    cofins: 'COFINS',
                    irpj: 'IRPJ',
                    csll: 'CSLL',
                    iss: 'ISS',
                    cpp: 'CPP',
                    inss: 'INSS',
                    das: 'DAS',
                    outros: 'Outros'
                  }[name] || name.toUpperCase()
                }))
              
              // Calcular impostos para Simples Nacional
              const impostosSimples = calcularImpostosPorTipo(dadosSimplesNacional || [], 'Simples Nacional')
              const dadosPizzaSimples = Object.entries(impostosSimples)
                .filter(([_, value]) => value > 0)
                .map(([name, value]) => ({
                  name: name.toUpperCase(),
                  value,
                  fullName: {
                    icms: 'ICMS',
                    pis: 'PIS',
                    cofins: 'COFINS',
                    irpj: 'IRPJ',
                    csll: 'CSLL',
                    iss: 'ISS',
                    cpp: 'CPP',
                    inss: 'INSS',
                    das: 'DAS',
                    outros: 'Outros'
                  }[name] || name.toUpperCase()
                }))
              
              console.log('📊 [PIZZA DETALHAMENTO] Dados calculados:', {
                impostosReal,
                impostosPresumido,
                impostosSimples,
                dadosPizzaSimples
              })
              
              const totalReal = dadosPizzaReal.reduce((sum, d) => sum + d.value, 0)
              const totalPresumido = dadosPizzaPresumido.reduce((sum, d) => sum + d.value, 0)
              const totalSimples = dadosPizzaSimples.reduce((sum, d) => sum + d.value, 0)
              
              return (
                <>
                  {/* Pizza Lucro Real */}
                  {dadosLucroReal && dadosLucroReal.length > 0 && dadosPizzaReal.length > 0 && (
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        Lucro Real - Composição de Impostos
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Total: {formatarMoedaTooltip(totalReal)}
                      </p>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dadosPizzaReal}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => 
                              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                            }
                            outerRadius={100}
                            innerRadius={50}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dadosPizzaReal.map((entry, index) => (
                              <Cell 
                                key={`cell-real-${index}`} 
                                fill={CORES_IMPOSTOS[entry.name.toLowerCase() as keyof typeof CORES_IMPOSTOS] || '#6b7280'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string, props: any) => [
                              formatarMoedaTooltip(value),
                              props.payload.fullName
                            ]}
                          />
                          <Legend 
                            formatter={(value: string, entry: any) => entry.payload.fullName}
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  {/* Pizza Lucro Presumido */}
                  {dadosLucroPresumido && dadosLucroPresumido.length > 0 && dadosPizzaPresumido.length > 0 && (
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        Lucro Presumido - Composição de Impostos
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Total: {formatarMoedaTooltip(totalPresumido)}
                      </p>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dadosPizzaPresumido}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => 
                              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                            }
                            outerRadius={100}
                            innerRadius={50}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dadosPizzaPresumido.map((entry, index) => (
                              <Cell 
                                key={`cell-presumido-${index}`} 
                                fill={CORES_IMPOSTOS[entry.name.toLowerCase() as keyof typeof CORES_IMPOSTOS] || '#6b7280'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string, props: any) => [
                              formatarMoedaTooltip(value),
                              props.payload.fullName
                            ]}
                          />
                          <Legend 
                            formatter={(value: string, entry: any) => entry.payload.fullName}
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  {/* Pizza Simples Nacional */}
                  {dadosSimplesNacional && dadosSimplesNacional.length > 0 && dadosPizzaSimples.length > 0 && (
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        Simples Nacional - Composição de Impostos
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Total: {formatarMoedaTooltip(totalSimples)}
                      </p>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dadosPizzaSimples}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => 
                              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                            }
                            outerRadius={100}
                            innerRadius={50}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dadosPizzaSimples.map((entry, index) => (
                              <Cell 
                                key={`cell-simples-${index}`} 
                                fill={CORES_IMPOSTOS[entry.name.toLowerCase() as keyof typeof CORES_IMPOSTOS] || '#6b7280'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string, props: any) => [
                              formatarMoedaTooltip(value),
                              props.payload.fullName
                            ]}
                          />
                          <Legend 
                            formatter={(value: string, entry: any) => entry.payload.fullName}
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                    {/* Mensagem se não houver dados */}
                    {(!dadosLucroReal || dadosLucroReal.length === 0) && 
                     (!dadosLucroPresumido || dadosLucroPresumido.length === 0) &&
                     (!dadosSimplesNacional || dadosSimplesNacional.length === 0) && (
                      <div className="col-span-2 flex items-center justify-center text-muted-foreground">
                        Nenhum dado disponível para visualização em pizza
                      </div>
                    )}
                  </>
                )
              })()}
              </div>
            )}
          </div>
          )}
            
            {/* Gráfico de Radar */}
            {tipoVisualizacao === 'radar' && (
          <ResponsiveContainer width="100%" height="100%">
            {(() => {
              const dadosRadar = mesesOrdenados
                .map(mes => {
                  const item = mesesMap.get(mes)
                  if (!item) return null
                  return {
                    mes: formatarMes(mes),
                    'Lucro Real': item.impostosLucroReal || 0,
                    'Lucro Presumido': item.impostosLucroPresumido || 0,
                    'Simples Nacional': item.impostosSimplesNacional || 0
                  }
                })
                .filter(item => item !== null)
              
              return (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dadosRadar}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="mes" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  {dadosLucroReal && dadosLucroReal.length > 0 && (
                    <Radar name="Lucro Real" dataKey="Lucro Real" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  )}
                  {dadosLucroPresumido && dadosLucroPresumido.length > 0 && (
                    <Radar name="Lucro Presumido" dataKey="Lucro Presumido" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  )}
                  {dadosSimplesNacional && dadosSimplesNacional.length > 0 && (
                    <Radar name="Simples Nacional" dataKey="Simples Nacional" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  )}
                  <Legend />
                  <Tooltip formatter={(value: number) => formatarMoedaTooltip(value)} />
                </RadarChart>
              )
            })()}
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
    
    {/* Modal de Detalhamento de Impostos */}
    <Dialog open={modalAberto} onOpenChange={setModalAberto}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Detalhamento de Impostos - {
              regimeSelecionado === 'lucro_real' 
                ? 'Lucro Real' 
                : regimeSelecionado === 'lucro_presumido'
                ? 'Lucro Presumido'
                : 'Simples Nacional'
            }
          </DialogTitle>
          <DialogDescription>
            Valores detalhados por imposto em cada mês do período analisado
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {dadosDetalhados && dadosDetalhados.length > 0 ? (
            <>
              {/* Resumo Total */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Resumo Geral</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const totais = dadosDetalhados.reduce((acc, d) => ({
                      icms: acc.icms + (d.impostos.icms || 0),
                      pis: acc.pis + (d.impostos.pis || 0),
                      cofins: acc.cofins + (d.impostos.cofins || 0),
                      irpj: acc.irpj + (d.impostos.irpj || 0),
                      csll: acc.csll + (d.impostos.csll || 0),
                      iss: acc.iss + (d.impostos.iss || 0),
                      cpp: acc.cpp + (d.impostos.cpp || 0),
                      total: acc.total + d.totalImpostos
                    }), { icms: 0, pis: 0, cofins: 0, irpj: 0, csll: 0, iss: 0, cpp: 0, total: 0 })
                    
                    return (
                      <>
                        <div className="bg-muted/50 p-3 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">ICMS</div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.icms)}
                          </div>
                        </div>
                        <div className="bg-muted/50 p-3 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">PIS</div>
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.pis)}
                          </div>
                        </div>
                        <div className="bg-muted/50 p-3 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">COFINS</div>
                          <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.cofins)}
                          </div>
                        </div>
                        <div className="bg-muted/50 p-3 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">IRPJ</div>
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.irpj)}
                          </div>
                        </div>
                        <div className="bg-muted/50 p-3 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">CSLL</div>
                          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.csll)}
                          </div>
                        </div>
                        {totais.iss > 0 && (
                          <div className="bg-muted/50 p-3 rounded border">
                            <div className="text-xs text-muted-foreground mb-1">ISS</div>
                            <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.iss)}
                            </div>
                          </div>
                        )}
                        {totais.cpp > 0 && (
                          <div className="bg-muted/50 p-3 rounded border">
                            <div className="text-xs text-muted-foreground mb-1">CPP</div>
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.cpp)}
                            </div>
                          </div>
                        )}
                        <div className="bg-green-500/10 dark:bg-green-500/20 p-3 rounded border-2 border-green-500/50 col-span-2">
                          <div className="text-xs text-muted-foreground mb-1">💰 TOTAL</div>
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totais.total)}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
              
              {/* Detalhamento Mensal */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">📅 Detalhamento Mensal</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={expandirTodos}
                      className="text-xs"
                    >
                      Expandir Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={contrairTodos}
                      className="text-xs"
                    >
                      Contrair Todos
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {dadosDetalhados.map((dado, index) => {
                    const expandido = mesesExpandidos.has(index)
                    
                    return (
                      <div key={index} className="border rounded-lg bg-card overflow-hidden">
                        {/* Cabeçalho do mês - sempre visível e clicável */}
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleMesExpandido(index)}
                        >
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              {expandido ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m18 15-6-6-6 6"/>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m6 9 6 6 6-6"/>
                                </svg>
                              )}
                            </Button>
                            <h4 className="text-md font-semibold">
                              {dado.mes}/{dado.ano}
                            </h4>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Receita</div>
                              <div className="text-sm font-medium">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.receita)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Total Impostos</div>
                              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.totalImpostos)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Conteúdo expansível */}
                        {expandido && (
                          <div className="p-4 pt-0 border-t">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {dado.impostos.icms > 0 && (
                          <div className="bg-blue-500/10 dark:bg-blue-500/20 p-2 rounded border border-blue-500/30">
                            <div className="text-xs text-muted-foreground">ICMS</div>
                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.impostos.icms)}
                            </div>
                          </div>
                        )}
                        {dado.impostos.pis > 0 && (
                          <div className="bg-purple-500/10 dark:bg-purple-500/20 p-2 rounded border border-purple-500/30">
                            <div className="text-xs text-muted-foreground">PIS</div>
                            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.impostos.pis)}
                            </div>
                          </div>
                        )}
                        {dado.impostos.cofins > 0 && (
                          <div className="bg-pink-500/10 dark:bg-pink-500/20 p-2 rounded border border-pink-500/30">
                            <div className="text-xs text-muted-foreground">COFINS</div>
                            <div className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.impostos.cofins)}
                            </div>
                          </div>
                        )}
                        {dado.impostos.irpj > 0 && (
                          <div className="bg-orange-500/10 dark:bg-orange-500/20 p-2 rounded border border-orange-500/30">
                            <div className="text-xs text-muted-foreground">IRPJ</div>
                            <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.impostos.irpj)}
                            </div>
                          </div>
                        )}
                        {dado.impostos.csll > 0 && (
                          <div className="bg-yellow-500/10 dark:bg-yellow-500/20 p-2 rounded border border-yellow-500/30">
                            <div className="text-xs text-muted-foreground">CSLL</div>
                            <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.impostos.csll)}
                            </div>
                          </div>
                        )}
                        {dado.impostos.iss > 0 && (
                          <div className="bg-teal-500/10 dark:bg-teal-500/20 p-2 rounded border border-teal-500/30">
                            <div className="text-xs text-muted-foreground">ISS</div>
                            <div className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.impostos.iss)}
                            </div>
                          </div>
                        )}
                        {dado.impostos.cpp > 0 && (
                          <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-2 rounded border border-indigo-500/30">
                            <div className="text-xs text-muted-foreground">CPP</div>
                            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.impostos.cpp)}
                            </div>
                          </div>
                        )}
                        <div className="bg-green-500/10 dark:bg-green-500/20 p-2 rounded border-2 border-green-500/50">
                          <div className="text-xs text-muted-foreground font-medium">💰 Total</div>
                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.totalImpostos)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Carga Tributária:</span>
                          <span className="font-semibold">
                            {dado.cargaTributaria.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado disponível para este regime
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
