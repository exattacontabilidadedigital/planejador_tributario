"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DadosGraficoMargem } from "@/types/relatorio"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface GraficoMargemProps {
  dados: DadosGraficoMargem[]
  titulo?: string
  descricao?: string
}

export function GraficoMargem({ dados, titulo, descricao }: GraficoMargemProps) {
  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo || "Margens de Lucratividade"}</CardTitle>
          {descricao && <CardDescription>{descricao}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sem dados para exibir. Crie cenários aprovados para visualizar as margens.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo || "Margens de Lucratividade"}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={dados}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              label={{ value: "Percentual (%)", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="category"
              dataKey="categoria"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                const nomes: Record<string, string> = {
                  valor: "Valor Atual",
                  meta: "Meta",
                }
                return [`${value.toFixed(2)}%`, nomes[name] || name]
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                const nomes: Record<string, string> = {
                  valor: "Margem Atual",
                  meta: "Meta",
                }
                return nomes[value] || value
              }}
            />
            <Bar dataKey="valor" fill="#10b981" radius={[0, 8, 8, 0]} />
            <Bar dataKey="meta" fill="#94a3b8" radius={[0, 8, 8, 0]} />
            <ReferenceLine x={0} stroke="hsl(var(--border))" />
          </BarChart>
        </ResponsiveContainer>

        {/* Indicadores abaixo do gráfico */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {dados.map((item, index) => {
            const atingiuMeta = item.meta ? item.valor >= item.meta : true
            return (
              <div
                key={index}
                className="flex flex-col gap-1 p-3 rounded-lg border bg-card"
              >
                <span className="text-sm text-muted-foreground">{item.categoria}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {item.valor.toFixed(2)}%
                  </span>
                  {item.meta && (
                    <span
                      className={`text-xs ${
                        atingiuMeta ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {atingiuMeta ? "✓" : "⚠"} Meta: {item.meta}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
