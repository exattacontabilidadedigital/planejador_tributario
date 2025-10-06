"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DadosMensalRegime } from "@/types/comparativo-analise"

interface GraficoComparacaoImpostosProps {
  dadosLucroReal?: DadosMensalRegime[]
  dadosLucroPresumido?: DadosMensalRegime[]
  dadosSimplesNacional?: DadosMensalRegime[]
}

export function GraficoComparacaoImpostos({
  dadosLucroReal,
  dadosLucroPresumido,
  dadosSimplesNacional
}: GraficoComparacaoImpostosProps) {
  
  // Preparar dados para o gráfico
  const prepararDados = () => {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const dadosGrafico: any[] = []

    // Coletar todos os meses únicos
    const mesesUnicos = new Set<string>()
    dadosLucroReal?.forEach(d => mesesUnicos.add(d.mes))
    dadosLucroPresumido?.forEach(d => mesesUnicos.add(d.mes))
    dadosSimplesNacional?.forEach(d => mesesUnicos.add(d.mes))

    // Ordenar meses
    const mesesOrdenados = Array.from(mesesUnicos).sort((a, b) => 
      meses.indexOf(a) - meses.indexOf(b)
    )

    // Montar dados do gráfico
    mesesOrdenados.forEach(mes => {
      const mesLabel = mes.charAt(0).toUpperCase() + mes.slice(1)
      const dadoMes: any = { mes: mesLabel }

      const dadoReal = dadosLucroReal?.find(d => d.mes === mes)
      const dadoPresumido = dadosLucroPresumido?.find(d => d.mes === mes)
      const dadoSimples = dadosSimplesNacional?.find(d => d.mes === mes)

      if (dadoReal) dadoMes['Lucro Real'] = dadoReal.impostos
      if (dadoPresumido) dadoMes['Lucro Presumido'] = dadoPresumido.impostos
      if (dadoSimples) dadoMes['Simples Nacional'] = dadoSimples.impostos

      dadosGrafico.push(dadoMes)
    })

    return dadosGrafico
  }

  const dados = prepararDados()

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Impostos Mensais</CardTitle>
        <CardDescription>Valores de impostos por mês e regime</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={formatarMoeda} />
            <Tooltip 
              formatter={(value: number) => formatarMoeda(value)}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Legend />
            {dadosLucroReal && <Bar dataKey="Lucro Real" fill="#3b82f6" />}
            {dadosLucroPresumido && <Bar dataKey="Lucro Presumido" fill="#10b981" />}
            {dadosSimplesNacional && <Bar dataKey="Simples Nacional" fill="#f59e0b" />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
