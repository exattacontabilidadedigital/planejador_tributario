"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { DadosMensalRegime } from "@/types/comparativo-analise-completo"

interface GraficoComparacaoImpostosProps {
  dadosLucroReal?: DadosMensalRegime[]
  dadosLucroPresumido?: DadosMensalRegime[]
  dadosSimplesNacional?: DadosMensalRegime[]
}

export function GraficoComparacaoImpostos({
  dadosLucroReal = [],
  dadosLucroPresumido = [],
  dadosSimplesNacional = []
}: GraficoComparacaoImpostosProps) {

  // Agregar dados por mês para comparação
  const dadosAgregados = new Map<string, any>()

  // Processar Lucro Real
  dadosLucroReal.forEach(d => {
    const key = d.mes
    if (!dadosAgregados.has(key)) {
      dadosAgregados.set(key, { mes: key, lr: 0, lp: 0, sn: 0 })
    }
    const item = dadosAgregados.get(key)!
    item.lr += d.totalImpostos
  })

  // Processar Lucro Presumido
  dadosLucroPresumido.forEach(d => {
    const key = d.mes
    if (!dadosAgregados.has(key)) {
      dadosAgregados.set(key, { mes: key, lr: 0, lp: 0, sn: 0 })
    }
    const item = dadosAgregados.get(key)!
    item.lp += d.totalImpostos
  })

  // Processar Simples Nacional
  dadosSimplesNacional.forEach(d => {
    const key = d.mes
    if (!dadosAgregados.has(key)) {
      dadosAgregados.set(key, { mes: key, lr: 0, lp: 0, sn: 0 })
    }
    const item = dadosAgregados.get(key)!
    item.sn += d.totalImpostos
  })

  // Converter para array e ordenar por mês
  const dados = Array.from(dadosAgregados.values()).sort((a, b) => {
    return a.mes.localeCompare(b.mes)
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  const getMesNome = (mes: string) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const mesNum = parseInt(mes) - 1
    return meses[mesNum] || mes
  }

  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Impostos Mensais</CardTitle>
          <CardDescription>Comparativo dos impostos totais por regime tributário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sem dados disponíveis para exibição
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Impostos Mensais</CardTitle>
        <CardDescription>Evolução mensal dos impostos totais por regime tributário</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="mes" 
              tickFormatter={getMesNome}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={(value) => formatarMoeda(value)}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => formatarMoeda(value)}
              labelFormatter={(label) => `Mês: ${getMesNome(label)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  lr: 'Lucro Real',
                  lp: 'Lucro Presumido',
                  sn: 'Simples Nacional'
                }
                return labels[value] || value
              }}
            />
            {dadosLucroReal.length > 0 && (
              <Bar 
                dataKey="lr" 
                fill="hsl(var(--chart-1))" 
                name="lr"
                radius={[4, 4, 0, 0]}
              />
            )}
            {dadosLucroPresumido.length > 0 && (
              <Bar 
                dataKey="lp" 
                fill="hsl(var(--chart-2))" 
                name="lp"
                radius={[4, 4, 0, 0]}
              />
            )}
            {dadosSimplesNacional.length > 0 && (
              <Bar 
                dataKey="sn" 
                fill="hsl(var(--chart-3))" 
                name="sn"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
