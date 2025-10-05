"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DadosEvolucaoFinanceira } from "@/types/relatorio"
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

interface GraficoEvolucaoFinanceiraProps {
  dados: DadosEvolucaoFinanceira[]
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

const formatMoedaCompacta = (valor: number) => {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(0)}K`
  }
  return formatMoeda(valor)
}

export const GraficoEvolucaoFinanceira = React.memo(function GraficoEvolucaoFinanceira({ 
  dados, 
  titulo, 
  descricao 
}: GraficoEvolucaoFinanceiraProps) {
  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo || "Evolução Financeira Mensal"}</CardTitle>
          {descricao && <CardDescription>{descricao}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sem dados para exibir. Crie cenários aprovados para visualizar a evolução financeira.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo || "Evolução Financeira Mensal"}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={dados}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="mes"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              tickFormatter={formatMoedaCompacta}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  receita: "Receita",
                  lucroLiquido: "Lucro Líquido",
                  icms: "ICMS",
                  irpj: "IRPJ",
                  csll: "CSLL",
                  pis: "PIS",
                  cofins: "COFINS",
                }
                return [formatMoeda(value), labels[name] || name]
              }}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  receita: "Receita",
                  lucroLiquido: "Lucro Líquido",
                  icms: "ICMS",
                  irpj: "IRPJ",
                  csll: "CSLL",
                  pis: "PIS",
                  cofins: "COFINS",
                }
                return labels[value] || value
              }}
            />
            
            {/* Linha de Receita - Verde escuro, mais espessa */}
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="#059669" 
              strokeWidth={3}
              dot={{ fill: "#059669", r: 4 }}
            />
            
            {/* Linha de Lucro Líquido - Azul, espessa */}
            <Line 
              type="monotone" 
              dataKey="lucroLiquido" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: "#2563eb", r: 4 }}
            />
            
            {/* Linhas de Impostos - Cores diferenciadas */}
            <Line 
              type="monotone" 
              dataKey="icms" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="irpj" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="csll" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="pis" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={{ fill: "#06b6d4", r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="cofins" 
              stroke="#84cc16" 
              strokeWidth={2}
              dot={{ fill: "#84cc16", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})