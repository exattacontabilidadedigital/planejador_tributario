"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ResultadoRegime } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface GraficoRadarImpostosProps {
  resultados: Record<string, ResultadoRegime>
}

export function GraficoRadarImpostos({ resultados }: GraficoRadarImpostosProps) {
  
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
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

  // Extrair todos os tipos de impostos únicos
  const tiposImpostos = Array.from(
    new Set(
      Object.values(resultados).flatMap(r => 
        r.impostos ? Object.keys(r.impostos) : []
      )
    )
  )

  // Preparar dados para o radar chart
  const dadosRadar = tiposImpostos.map(imposto => {
    const dados: Record<string, string | number> = {
      imposto
    }

    Object.entries(resultados).forEach(([key, resultado]) => {
      const nomeRegime = formatarRegime(resultado.regime)
      dados[nomeRegime] = resultado.impostos?.[imposto] || 0
    })

    return dados
  })

  // Calcular valores máximos para normalização
  const valoresMaximos: Record<string, number> = {}
  tiposImpostos.forEach(imposto => {
    const valores = Object.values(resultados)
      .map(r => r.impostos?.[imposto] || 0)
      .filter(v => v > 0)
    
    valoresMaximos[imposto] = valores.length > 0 ? Math.max(...valores) : 0
  })

  // Extrair nomes únicos de regimes
  const regimesUnicos = Array.from(
    new Set(Object.values(resultados).map(r => formatarRegime(r.regime)))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Radar de Impostos por Regime</CardTitle>
        <CardDescription>
          Comparação visual multidimensional da carga tributária
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart data={dadosRadar}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis 
              dataKey="imposto" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 'auto']}
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
                <Radar
                  key={regime}
                  name={regime}
                  dataKey={regime}
                  stroke={obterCorRegime(regimeOriginal)}
                  fill={obterCorRegime(regimeOriginal)}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              )
            })}
          </RadarChart>
        </ResponsiveContainer>

        {/* Análise de Destaque */}
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold">Análise por Imposto</h4>
          <div className="grid gap-3">
            {tiposImpostos.map(imposto => {
              const valores = Object.entries(resultados).map(([key, resultado]) => ({
                regime: formatarRegime(resultado.regime),
                valor: resultado.impostos?.[imposto] || 0
              }))
              .filter(v => v.valor > 0)
              .sort((a, b) => a.valor - b.valor)

              if (valores.length === 0) return null

              const menor = valores[0]
              const maior = valores[valores.length - 1]
              const diferenca = maior.valor - menor.valor
              const diferencaPercentual = menor.valor > 0 
                ? ((diferenca / menor.valor) * 100).toFixed(1)
                : 0

              return (
                <div key={imposto} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                  <div className="font-medium">{imposto}</div>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Menor: </span>
                      <span className="font-semibold text-green-600">
                        {menor.regime} ({formatarMoeda(menor.valor)})
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Maior: </span>
                      <span className="font-semibold text-red-600">
                        {maior.regime} ({formatarMoeda(maior.valor)})
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Diferença: </span>
                      <span className="font-semibold">
                        {formatarMoeda(diferenca)} ({diferencaPercentual}%)
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 flex flex-wrap gap-4">
          {regimesUnicos.map(regime => {
            const regimeOriginal = Object.values(resultados)
              .find(r => formatarRegime(r.regime) === regime)?.regime || ''
            
            return (
              <div key={regime} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: obterCorRegime(regimeOriginal) }}
                />
                <span>{regime}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
