"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DadosMetricasFinanceiras } from "@/types/relatorio"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface GraficoMetricasFinanceirasProps {
  dados: DadosMetricasFinanceiras[]
  titulo?: string
  descricao?: string
}

const formatMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

const formatPercentual = (valor: number) => {
  return `${valor.toFixed(1)}%`
}

export const GraficoMetricasFinanceiras = React.memo(function GraficoMetricasFinanceiras({ 
  dados, 
  titulo, 
  descricao 
}: GraficoMetricasFinanceirasProps) {
  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo || "Métricas Financeiras"}</CardTitle>
          {descricao && <CardDescription>{descricao}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sem dados para exibir. Crie cenários aprovados para visualizar as métricas financeiras.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Cores para cada categoria
  const coresCategoria: Record<string, string> = {
    'Faturamento': '#10b981', // Verde
    'Lucro Líquido': '#3b82f6', // Azul
    'ICMS': '#f59e0b', // Âmbar
    'IRPJ': '#ef4444', // Vermelho
    'CSLL': '#8b5cf6', // Roxo
    'PIS': '#06b6d4', // Ciano
    'COFINS': '#84cc16', // Verde Lima
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo || "Métricas Financeiras"}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={dados}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="categoria"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              tickFormatter={formatMoeda}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                const dados = name === "valor" ? [formatMoeda(value), "Valor"] : [value, name]
                return dados
              }}
              labelFormatter={(label) => `${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={() => "Valor em R$"}
            />
            <Bar 
              dataKey="valor" 
              radius={[4, 4, 0, 0]}
            >
              {dados.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={coresCategoria[entry.categoria] || "#94a3b8"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Cards com resumo das métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {dados.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 p-3 rounded-lg border bg-card"
              style={{ borderColor: coresCategoria[item.categoria] || "#94a3b8" }}
            >
              <span className="text-sm text-muted-foreground">{item.categoria}</span>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold">
                  {formatMoeda(item.valor)}
                </span>
                {item.percentual !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {formatPercentual(item.percentual)} do faturamento
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})