"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface GraficoCargaTributariaProps {
  lucroReal?: number
  lucroPresumido?: number
  simplesNacional?: number
}

export function GraficoCargaTributaria({
  lucroReal,
  lucroPresumido,
  simplesNacional
}: GraficoCargaTributariaProps) {
  
  const CORES = {
    'Lucro Real': '#3b82f6',
    'Lucro Presumido': '#10b981',
    'Simples Nacional': '#f59e0b'
  }

  // Preparar dados para o gráfico
  const dados = []
  if (lucroReal !== undefined) {
    dados.push({ name: 'Lucro Real', value: lucroReal })
  }
  if (lucroPresumido !== undefined) {
    dados.push({ name: 'Lucro Presumido', value: lucroPresumido })
  }
  if (simplesNacional !== undefined) {
    dados.push({ name: 'Simples Nacional', value: simplesNacional })
  }

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Carga: {formatarPercentual(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga Tributária Efetiva</CardTitle>
        <CardDescription>Percentual sobre receita total por regime</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={dados}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CORES[entry.name as keyof typeof CORES]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => `${value}: ${formatarPercentual(entry.payload.value)}`}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Lista com valores */}
        <div className="mt-4 space-y-2">
          {dados.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CORES[item.name as keyof typeof CORES] }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-mono font-semibold">
                {formatarPercentual(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
