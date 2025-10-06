"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { DadosMensalRegime } from '@/types/comparativo-analise'

interface GraficoEvolucaoRegimesProps {
  dadosLucroReal?: DadosMensalRegime[]
  dadosLucroPresumido?: DadosMensalRegime[]
  dadosSimplesNacional?: DadosMensalRegime[]
  tipoGrafico?: 'linha' | 'barra' | 'combinado'
}

export function GraficoEvolucaoRegimes({
  dadosLucroReal,
  dadosLucroPresumido,
  dadosSimplesNacional,
  tipoGrafico = 'combinado'
}: GraficoEvolucaoRegimesProps) {
  
  // Combinar dados de todos os regimes por mês
  const mesesMap = new Map<string, any>()
  
  // Processar Lucro Real
  dadosLucroReal?.forEach(dado => {
    if (!mesesMap.has(dado.mes)) {
      mesesMap.set(dado.mes, { mes: dado.mes })
    }
    const item = mesesMap.get(dado.mes)!
    item.receitaLR = dado.receita
    item.lucroLR = dado.lucro
  })
  
  // Processar Lucro Presumido
  dadosLucroPresumido?.forEach(dado => {
    if (!mesesMap.has(dado.mes)) {
      mesesMap.set(dado.mes, { mes: dado.mes })
    }
    const item = mesesMap.get(dado.mes)!
    item.receitaLP = dado.receita
    item.lucroLP = dado.lucro
  })
  
  // Processar Simples Nacional
  dadosSimplesNacional?.forEach(dado => {
    if (!mesesMap.has(dado.mes)) {
      mesesMap.set(dado.mes, { mes: dado.mes })
    }
    const item = mesesMap.get(dado.mes)!
    item.receitaSN = dado.receita
    item.lucroSN = dado.lucro
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Evolução Mensal - 2025</CardTitle>
        <CardDescription>
          Acompanhe a evolução da receita e lucro ao longo do ano
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dadosGrafico}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="mes"
                tickFormatter={formatarMes}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                  return value.toString()
                }}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  const nomes: Record<string, string> = {
                    'receitaLR': 'Receita - Lucro Real',
                    'lucroLR': 'Lucro - Lucro Real',
                    'receitaLP': 'Receita - Lucro Presumido',
                    'lucroLP': 'Lucro - Lucro Presumido',
                    'receitaSN': 'Receita - Simples Nacional',
                    'lucroSN': 'Lucro - Simples Nacional'
                  }
                  return nomes[value] || value
                }}
              />
              
              {/* Linhas de Receita (mais grossas, no topo) */}
              {dadosLucroReal && (
                <Line
                  type="monotone"
                  dataKey="receitaLR"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6' }}
                  activeDot={{ r: 7 }}
                  name="receitaLR"
                />
              )}
              {dadosLucroPresumido && (
                <Line
                  type="monotone"
                  dataKey="receitaLP"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#8b5cf6' }}
                  activeDot={{ r: 7 }}
                  name="receitaLP"
                />
              )}
              {dadosSimplesNacional && (
                <Line
                  type="monotone"
                  dataKey="receitaSN"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#06b6d4' }}
                  activeDot={{ r: 7 }}
                  name="receitaSN"
                />
              )}
              
              {/* Linhas de Lucro (mais finas, embaixo) */}
              {dadosLucroReal && (
                <Line
                  type="monotone"
                  dataKey="lucroLR"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981' }}
                  activeDot={{ r: 7 }}
                  name="lucroLR"
                />
              )}
              {dadosLucroPresumido && (
                <Line
                  type="monotone"
                  dataKey="lucroLP"
                  stroke="#84cc16"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#84cc16' }}
                  activeDot={{ r: 7 }}
                  name="lucroLP"
                />
              )}
              {dadosSimplesNacional && (
                <Line
                  type="monotone"
                  dataKey="lucroSN"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#22c55e' }}
                  activeDot={{ r: 7 }}
                  name="lucroSN"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
