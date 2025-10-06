"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface GraficoCargaTributariaProps {
  lucroReal?: number
  lucroPresumido?: number
  simplesNacional?: number
}

export function GraficoCargaTributaria({
  lucroReal = 0,
  lucroPresumido = 0,
  simplesNacional = 0
}: GraficoCargaTributariaProps) {

  const dados = [
    { nome: 'Lucro Real', valor: lucroReal, cor: 'hsl(var(--chart-1))' },
    { nome: 'Lucro Presumido', valor: lucroPresumido, cor: 'hsl(var(--chart-2))' },
    { nome: 'Simples Nacional', valor: simplesNacional, cor: 'hsl(var(--chart-3))' }
  ].filter(d => d.valor > 0)

  const total = dados.reduce((acc, d) => acc + d.valor, 0)

  const formatarPercentual = (valor: number) => {
    if (total === 0) return '0%'
    return `${((valor / total) * 100).toFixed(1)}%`
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  if (dados.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carga Tributária por Regime</CardTitle>
          <CardDescription>Distribuição percentual da carga tributária</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sem dados disponíveis para exibição
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCustomLabel = (entry: any) => {
    return `${formatarPercentual(entry.valor)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga Tributária por Regime</CardTitle>
        <CardDescription>Distribuição percentual dos impostos totais por regime</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={dados}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="valor"
              paddingAngle={5}
            >
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${formatarMoeda(value)} (${formatarPercentual(value)})`,
                name
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => {
                const item = dados.find(d => d.nome === value)
                return `${value}: ${formatarMoeda(item?.valor || 0)}`
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Resumo textual */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total Geral:</span>
            <span className="font-bold">{formatarMoeda(total)}</span>
          </div>
          <div className="border-t pt-2 space-y-1">
            {dados.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.cor.replace('hsl(var(--chart-', 'hsl(').replace('))', ')') }}
                  />
                  <span>{item.nome}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatarPercentual(item.valor)} • {formatarMoeda(item.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
