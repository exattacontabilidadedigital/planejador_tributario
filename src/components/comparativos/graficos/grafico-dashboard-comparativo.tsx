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
  const [regimeSelecionado, setRegimeSelecionado] = useState<'lucro_real' | 'lucro_presumido' | null>(null)
  const [dadosDetalhados, setDadosDetalhados] = useState<any[] | null>(null)
  
  // Estado para tipo de visualização
  type TipoVisualizacao = 'linha' | 'barra' | 'barraEmpilhada' | 'pizza' | 'radar'
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('linha')
  
  // Função para abrir modal com detalhes
  const abrirDetalhamento = (regime: 'lucro_real' | 'lucro_presumido') => {
    setRegimeSelecionado(regime)
    setDadosDetalhados(regime === 'lucro_real' ? dadosLucroReal || [] : dadosLucroPresumido || [])
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
    // Calcular totais de impostos de cada regime
    const totalImpostosLucroReal = dadosGrafico.reduce((sum, d) => sum + (d.impostosLucroReal || 0), 0)
    const totalImpostosLucroPresumido = dadosGrafico.reduce((sum, d) => sum + (d.impostosLucroPresumido || 0), 0)
    const totalImpostosSimplesNacional = dadosGrafico.reduce((sum, d) => sum + (d.impostosSimplesNacional || 0), 0)
    
    const totalReceita = dadosGrafico.reduce((sum, d) => 
      sum + Math.max(d.receitaReal || 0, d.receitaPresumido || 0, d.receitaSimples || 0), 0)
    
    // Encontrar o regime com MENOR carga tributária (mais vantajoso)
    const regimes = [
      { nome: 'Lucro Real', total: totalImpostosLucroReal, cor: '#ef4444' },
      { nome: 'Lucro Presumido', total: totalImpostosLucroPresumido, cor: '#3b82f6' },
      { nome: 'Simples Nacional', total: totalImpostosSimplesNacional, cor: '#10b981' }
    ].filter(r => r.total > 0)
    
    // Melhor regime = MENOR total de impostos
    const melhorRegime = regimes.reduce((best, current) => 
      current.total < best.total ? current : best, regimes[0] || { nome: 'N/A', total: 0, cor: '#000' })
    
    // Pior regime = MAIOR total de impostos
    const piorRegime = regimes.reduce((worst, current) => 
      current.total > worst.total ? current : worst, regimes[0] || { nome: 'N/A', total: 0, cor: '#000' })
    
    const economia = piorRegime.total - melhorRegime.total
    const economiaPercentual = piorRegime.total > 0 ? (economia / piorRegime.total * 100) : 0
    
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
      totalReceita,
      totalImpostosLucroReal,
      totalImpostosLucroPresumido,
      totalImpostosSimplesNacional,
      melhorRegime,
      piorRegime,
      economia,
      economiaPercentual,
      melhorMes
    }
  }

  const stats = calcularEstatisticas()
  
  return (
    <>
      {/* Cards de Resumo */}
      <div className="col-span-full grid grid-cols-4 gap-4">
        {/* Card: Receita Total */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Receita total</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatarMoedaTooltip(stats.totalReceita)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Performance sólida</p>
          </CardContent>
        </Card>

        {/* Card: Lucro Real */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${stats.melhorRegime.nome === 'Lucro Real' ? 'border-green-500/50' : stats.piorRegime.nome === 'Lucro Real' ? 'border-red-500/50' : ''}`}
          onClick={() => abrirDetalhamento('lucro_real')}
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              <span>Lucro Real</span>
              {stats.melhorRegime.nome === 'Lucro Real' && (
                <span className="text-xs font-semibold text-green-600">✓ Mais Econômico</span>
              )}
              {stats.piorRegime.nome === 'Lucro Real' && (
                <span className="text-xs font-semibold text-red-600">Menos Vantajoso</span>
              )}
            </CardDescription>
            <CardTitle className={`text-2xl ${stats.melhorRegime.nome === 'Lucro Real' ? 'text-green-600' : stats.piorRegime.nome === 'Lucro Real' ? 'text-red-500' : 'text-blue-500'}`}>
              {formatarMoedaTooltip(stats.totalImpostosLucroReal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>

        {/* Card: Lucro Presumido */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${stats.melhorRegime.nome === 'Lucro Presumido' ? 'border-green-500/50' : stats.piorRegime.nome === 'Lucro Presumido' ? 'border-red-500/50' : ''}`}
          onClick={() => abrirDetalhamento('lucro_presumido')}
        >
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              <span>Lucro Presumido</span>
              {stats.melhorRegime.nome === 'Lucro Presumido' && (
                <span className="text-xs font-semibold text-green-600">✓ Mais Econômico</span>
              )}
              {stats.piorRegime.nome === 'Lucro Presumido' && (
                <span className="text-xs font-semibold text-red-600">Menos Vantajoso</span>
              )}
            </CardDescription>
            <CardTitle className={`text-2xl ${stats.melhorRegime.nome === 'Lucro Presumido' ? 'text-green-600' : stats.piorRegime.nome === 'Lucro Presumido' ? 'text-red-500' : 'text-blue-500'}`}>
              {formatarMoedaTooltip(stats.totalImpostosLucroPresumido)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>

        {/* Card: Economia */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Economia vs {stats.piorRegime.nome}</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatarMoedaTooltip(stats.economia)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.economiaPercentual.toFixed(1)}% menos impostos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card do Gráfico */}
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comparação de Impostos - {ano}</CardTitle>
              <CardDescription>
                Acompanhe o total de impostos pagos em cada regime tributário ao longo do ano (quanto menor, melhor)
              </CardDescription>
            </div>
            
            {/* Seletor de Visualização */}
            <div className="flex gap-2">
              <Button
                variant={tipoVisualizacao === 'linha' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('linha')}
                title="Gráfico de Linhas"
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'barra' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('barra')}
                title="Gráfico de Barras"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'barraEmpilhada' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('barraEmpilhada')}
                title="Barras Empilhadas"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'pizza' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('pizza')}
                title="Gráfico de Pizza"
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={tipoVisualizacao === 'radar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoVisualizacao('radar')}
                title="Gráfico de Radar"
              >
                <RadarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
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
            
            {/* Gráfico de Pizza - Detalhamento por Imposto */}
            {tipoVisualizacao === 'pizza' && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
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
              const calcularImpostosPorTipo = (dados: any[]) => {
                const totais: Record<string, number> = {
                  icms: 0, pis: 0, cofins: 0, irpj: 0, csll: 0,
                  iss: 0, cpp: 0, inss: 0, das: 0, outros: 0
                }
                
                dados?.forEach(dado => {
                  if (dado.impostos_detalhados) {
                    // Impostos detalhados (objeto)
                    Object.entries(dado.impostos_detalhados).forEach(([key, value]) => {
                      if (totais.hasOwnProperty(key) && typeof value === 'number') {
                        totais[key] += value
                      }
                    })
                  } else if (typeof dado.impostos === 'object' && dado.impostos !== null) {
                    // Impostos como objeto
                    Object.entries(dado.impostos).forEach(([key, value]) => {
                      if (totais.hasOwnProperty(key) && typeof value === 'number') {
                        totais[key] += value
                      }
                    })
                  }
                })
                
                return totais
              }
              
              // Calcular impostos para Lucro Real
              const impostosReal = calcularImpostosPorTipo(dadosLucroReal || [])
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
              const impostosPresumido = calcularImpostosPorTipo(dadosLucroPresumido || [])
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
              
              const totalReal = dadosPizzaReal.reduce((sum, d) => sum + d.value, 0)
              const totalPresumido = dadosPizzaPresumido.reduce((sum, d) => sum + d.value, 0)
              
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
                  
                  {/* Mensagem se não houver dados */}
                  {(!dadosLucroReal || dadosLucroReal.length === 0) && 
                   (!dadosLucroPresumido || dadosLucroPresumido.length === 0) && (
                    <div className="col-span-2 flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível para visualização em pizza
                    </div>
                  )}
                </>
              )
            })()}
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
            Detalhamento de Impostos - {regimeSelecionado === 'lucro_real' ? 'Lucro Real' : 'Lucro Presumido'}
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
                <h3 className="text-lg font-semibold mb-4">📅 Detalhamento Mensal</h3>
                <div className="space-y-4">
                  {dadosDetalhados.map((dado, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-semibold">
                          {dado.mes}/{dado.ano}
                        </h4>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Receita</div>
                          <div className="text-sm font-medium">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dado.receita)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  ))}
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
