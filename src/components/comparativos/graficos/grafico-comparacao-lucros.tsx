"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import type { DadosMensalRegime } from '@/types/comparativo-analise'

interface GraficoComparacaoLucrosProps {
  dadosLucroReal?: DadosMensalRegime[]
  dadosLucroPresumido?: DadosMensalRegime[]
  dadosSimplesNacional?: DadosMensalRegime[]
}

export function GraficoComparacaoLucros({
  dadosLucroReal,
  dadosLucroPresumido,
  dadosSimplesNacional
}: GraficoComparacaoLucrosProps) {
  
  // Combinar dados de todos os regimes por mês
  const mesesMap = new Map<string, any>()
  
  // Processar Lucro Real
  dadosLucroReal?.forEach(dado => {
    if (!mesesMap.has(dado.mes)) {
      mesesMap.set(dado.mes, { mes: dado.mes })
    }
    const item = mesesMap.get(dado.mes)!
    item.lucroReal = dado.lucro
  })
  
  // Processar Lucro Presumido
  dadosLucroPresumido?.forEach(dado => {
    if (!mesesMap.has(dado.mes)) {
      mesesMap.set(dado.mes, { mes: dado.mes })
    }
    const item = mesesMap.get(dado.mes)!
    item.lucroPresumido = dado.lucro
  })
  
  // Processar Simples Nacional
  dadosSimplesNacional?.forEach(dado => {
    if (!mesesMap.has(dado.mes)) {
      mesesMap.set(dado.mes, { mes: dado.mes })
    }
    const item = mesesMap.get(dado.mes)!
    item.simplesNacional = dado.lucro
  })
  
  // Converter para array ordenado
  const mesesOrdenados = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const dadosGrafico = mesesOrdenados
    .map(mes => mesesMap.get(mes))
    .filter(item => item !== undefined)
  
  if (dadosGrafico.length === 0) {
    return null
  }
  
  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
            <span className="font-mono font-semibold">{formatarMoeda(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  
  const cores = {
    lucroReal: '#ef4444', // vermelho
    lucroPresumido: '#3b82f6', // azul
    simplesNacional: '#10b981' // verde
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Evolução do Lucro Líquido por Regime</CardTitle>
        <CardDescription>
          Comparação do lucro líquido mensal após impostos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dadosGrafico}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="mes"
                tickFormatter={formatarMes}
                className="text-xs"
              />
              <YAxis
                tickFormatter={formatarMoeda}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const nomes: Record<string, string> = {
                    'lucroReal': 'Lucro Real',
                    'lucroPresumido': 'Lucro Presumido',
                    'simplesNacional': 'Simples Nacional'
                  }
                  return nomes[value] || value
                }}
              />
              {dadosLucroReal && (
                <Line
                  type="monotone"
                  dataKey="lucroReal"
                  stroke={cores.lucroReal}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  name="lucroReal"
                />
              )}
              {dadosLucroPresumido && (
                <Line
                  type="monotone"
                  dataKey="lucroPresumido"
                  stroke={cores.lucroPresumido}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  name="lucroPresumido"
                />
              )}
              {dadosSimplesNacional && (
                <Line
                  type="monotone"
                  dataKey="simplesNacional"
                  stroke={cores.simplesNacional}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  name="simplesNacional"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
