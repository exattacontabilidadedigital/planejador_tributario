"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DadosGraficoEvolucao } from "@/types/relatorio"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface GraficoEvolucaoProps {
  dados: DadosGraficoEvolucao[]
  titulo?: string
  descricao?: string
}

export const GraficoEvolucao = React.memo(function GraficoEvolucao({ dados, titulo, descricao }: GraficoEvolucaoProps) {
  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo || "Evolução Temporal"}</CardTitle>
          {descricao && <CardDescription>{descricao}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sem dados para exibir. Crie cenários aprovados para visualizar a evolução.
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo || "Evolução Temporal"}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="mes"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}k`
                }
                return value.toString()
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => {
                const nomes: Record<string, string> = {
                  receita: "Receita",
                  impostos: "Impostos",
                  lucro: "Lucro",
                }
                return [formatarValor(value), nomes[name] || name]
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                const nomes: Record<string, string> = {
                  receita: "Receita Bruta",
                  impostos: "Total Impostos",
                  lucro: "Lucro Líquido",
                }
                return nomes[value] || value
              }}
            />
            <Line
              type="monotone"
              dataKey="receita"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="impostos"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
