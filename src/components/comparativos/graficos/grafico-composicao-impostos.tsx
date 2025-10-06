"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { ResultadoRegime } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface GraficoComposicaoImpostosProps {
  resultados: Record<string, ResultadoRegime>
}

export function GraficoComposicaoImpostos({ resultados }: GraficoComposicaoImpostosProps) {
  
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

  const obterCorImposto = (imposto: string): string => {
    const cores: Record<string, string> = {
      'IRPJ': '#ef4444', // red-500
      'CSLL': '#f97316', // orange-500
      'PIS': '#eab308', // yellow-500
      'COFINS': '#84cc16', // lime-500
      'ICMS': '#22c55e', // green-500
      'ISS': '#14b8a6', // teal-500
      'IPI': '#06b6d4', // cyan-500
      'CPP': '#0ea5e9', // blue-500
      'DAS': '#6366f1', // indigo-500
      'Simples': '#8b5cf6', // violet-500
    }
    return cores[imposto] || '#6b7280'
  }

  // Preparar dados para o gráfico de barras empilhadas horizontais
  const dadosGrafico = Object.entries(resultados).map(([key, resultado]) => {
    const dados: Record<string, string | number> = {
      regime: formatarRegime(resultado.regime)
    }

    // Adicionar cada tipo de imposto
    if (resultado.impostos) {
      Object.entries(resultado.impostos).forEach(([imposto, valor]) => {
        if (valor !== undefined) {
          dados[imposto] = valor
        }
      })
    }

    dados.total = resultado.totalImpostos

    return dados
  })

  // Extrair todos os tipos de impostos únicos
  const tiposImpostos = Array.from(
    new Set(
      Object.values(resultados).flatMap(r => 
        r.impostos ? Object.keys(r.impostos) : []
      )
    )
  )

  // Calcular percentual de cada imposto no total
  const calcularDistribuicao = () => {
    return Object.entries(resultados).map(([key, resultado]) => {
      const distribuicao: Record<string, number> = {}
      
      if (resultado.impostos && resultado.totalImpostos > 0) {
        Object.entries(resultado.impostos).forEach(([imposto, valor]) => {
          if (valor !== undefined) {
            distribuicao[imposto] = (valor / resultado.totalImpostos) * 100
          }
        })
      }

      return {
        regime: formatarRegime(resultado.regime),
        ...distribuicao
      }
    })
  }

  const dadosDistribuicao = calcularDistribuicao()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composição de Impostos por Regime</CardTitle>
        <CardDescription>
          Breakdown detalhado dos impostos em valores absolutos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Gráfico de Barras Empilhadas Horizontais */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={dadosGrafico}
            layout="vertical"
            margin={{ left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatarMoeda}
            />
            <YAxis 
              type="category"
              dataKey="regime" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
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
            
            {tiposImpostos.map(imposto => (
              <Bar
                key={imposto}
                dataKey={imposto}
                stackId="impostos"
                fill={obterCorImposto(imposto)}
                name={imposto}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Tabela de Distribuição Percentual */}
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Distribuição Percentual</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Regime</th>
                  {tiposImpostos.map(imposto => (
                    <th key={imposto} className="text-right py-2 px-3 font-semibold">
                      {imposto}
                    </th>
                  ))}
                  <th className="text-right py-2 px-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {dadosGrafico.map((dado, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{dado.regime}</td>
                    {tiposImpostos.map(imposto => {
                      const percentual = (dadosDistribuicao[idx] as any)?.[imposto] || 0
                      return (
                        <td key={imposto} className="text-right py-2 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {formatarMoeda(Number(dado[imposto] || 0))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {percentual.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      )
                    })}
                    <td className="text-right py-2 px-3 font-bold">
                      {formatarMoeda(Number(dado.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda de Cores */}
        <div className="mt-6 flex flex-wrap gap-3">
          {tiposImpostos.map(imposto => (
            <div key={imposto} className="flex items-center gap-2 text-sm">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: obterCorImposto(imposto) }}
              />
              <span>{imposto}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
