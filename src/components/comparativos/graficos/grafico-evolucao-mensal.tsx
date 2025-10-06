"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ResultadoRegime } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface GraficoEvolucaoMensalProps {
  resultados: Record<string, ResultadoRegime>
  mesesSelecionados: number[]
}

export function GraficoEvolucaoMensal({ resultados, mesesSelecionados }: GraficoEvolucaoMensalProps) {
  
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  const obterNomeMes = (mes: number): string => {
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    return meses[mes - 1] || `Mês ${mes}`
  }

  const formatarRegime = (regime: RegimeTributario | string): string => {
    const nomes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime] || regime
  }

  const obterCorRegime = (regime: RegimeTributario | string): string => {
    const cores: Record<string, string> = {
      'lucro_real': '#3b82f6', // blue-500
      'lucro_presumido': '#22c55e', // green-500
      'simples_nacional': '#f97316' // orange-500
    }
    return cores[regime] || '#6b7280'
  }

  // Preparar dados para o gráfico
  const dadosGrafico = mesesSelecionados.map(mes => {
    const dadosMes: Record<string, number | string> = {
      mes: obterNomeMes(mes),
      mesNumero: mes
    }

    Object.entries(resultados).forEach(([key, resultado]) => {
      const dadoMensal = resultado.dadosMensais?.find((m: any) => parseInt(m.mes) === mes)
      if (dadoMensal) {
        const nomeRegime = formatarRegime(resultado.regime)
        dadosMes[nomeRegime] = dadoMensal.totalImpostos
      }
    })

    return dadosMes
  })

  // Extrair nomes únicos de regimes
  const regimesUnicos = Array.from(
    new Set(Object.values(resultados).map(r => formatarRegime(r.regime)))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal de Impostos</CardTitle>
        <CardDescription>
          Comparação da carga tributária ao longo dos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="mes" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatarMoeda}
            />
            <Tooltip 
              formatter={(value: number) => formatarMoeda(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            {regimesUnicos.map(regime => {
              const regimeOriginal = Object.values(resultados)
                .find(r => formatarRegime(r.regime) === regime)?.regime || ''
              
              return (
                <Line
                  key={regime}
                  type="monotone"
                  dataKey={regime}
                  stroke={obterCorRegime(regimeOriginal)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={regime}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>

        {/* Estatísticas resumidas */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          {Object.entries(resultados).map(([key, resultado]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: obterCorRegime(resultado.regime) }}
                />
                <span className="font-medium">{formatarRegime(resultado.regime)}</span>
              </div>
              <div className="text-muted-foreground">
                Média: {formatarMoeda(resultado.totalImpostos / (resultado.dadosMensais?.length || 1))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
