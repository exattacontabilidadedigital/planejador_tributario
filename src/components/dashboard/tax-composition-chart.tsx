"use client"

import * as React from "react"
import { useMemo } from "react"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTaxCalculations } from "@/hooks/use-tax-calculations"
import { formatCurrency, formatPercentage } from "@/lib/utils"

// Registrar apenas componentes necessários para Doughnut
ChartJS.register(ArcElement, Tooltip, Legend)

export const TaxCompositionChart = React.memo(function TaxCompositionChart() {
  const { summary } = useTaxCalculations()

  const chartData = useMemo(() => {
    const icms = summary.icms
    const pisCofins = summary.pisCofins
    const irpjCsll = summary.irpjCsll
    const iss = summary.iss

    return {
      labels: ["ICMS", "PIS/COFINS", "IRPJ/CSLL", "ISS"],
      datasets: [
        {
          label: "Composição Tributária",
          data: [icms, pisCofins, irpjCsll, iss],
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)",   // ICMS - red
            "rgba(245, 158, 11, 0.8)",  // PIS/COFINS - amber
            "rgba(59, 130, 246, 0.8)",  // IRPJ/CSLL - blue
            "rgba(168, 85, 247, 0.8)",  // ISS - purple
          ],
          borderColor: [
            "rgba(239, 68, 68, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(168, 85, 247, 1)",
          ],
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    }
  }, [summary])

  const chartOptions: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      // Otimizações de performance
      animation: {
        duration: 300, // Animação mais rápida
      },
      interaction: {
        intersect: false,
        mode: 'point' as const,
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            padding: 20,
            font: {
              size: 13,
              weight: 500,
            },
            generateLabels: (chart) => {
              const data = chart.data
              if (data.labels && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i] as number
                  const percentage = ((value / summary.totalImpostos) * 100).toFixed(1)
                  const bgColors = data.datasets[0].backgroundColor as string[]
                  const borderColors = data.datasets[0].borderColor as string[]
                  
                  return {
                    text: `${label}: ${formatCurrency(value)} (${percentage}%)`,
                    fillStyle: bgColors[i],
                    strokeStyle: borderColors[i],
                    lineWidth: 2,
                    hidden: false,
                    index: i,
                  }
                })
              }
              return []
            },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
          callbacks: {
            label: function (context) {
              const label = context.label || ""
              const value = context.parsed || 0
              const percentage = ((value / summary.totalImpostos) * 100).toFixed(2)
              const percentReceita = ((value / summary.receitaBruta) * 100).toFixed(2)
              
              return [
                `${label}`,
                `Valor: ${formatCurrency(value)}`,
                `% do Total de Impostos: ${percentage}%`,
                `% da Receita Bruta: ${percentReceita}%`,
              ]
            },
          },
        },
      },
      cutout: "65%", // Donut (anel)
    }),
    [summary]
  )

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Composição Tributária
        </CardTitle>
        <CardDescription>
          Distribuição percentual dos impostos sobre a receita bruta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-full max-w-md">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-icms">
              {formatPercentage((summary.icms / summary.receitaBruta) * 100, 1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">ICMS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pis">
              {formatPercentage((summary.pisCofins / summary.receitaBruta) * 100, 1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">PIS/COFINS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-irpj">
              {formatPercentage((summary.irpjCsll / summary.receitaBruta) * 100, 1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">IRPJ/CSLL</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatPercentage((summary.iss / summary.receitaBruta) * 100, 1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">ISS</div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Carga Tributária Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatPercentage(summary.cargaTributaria, 2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(summary.totalImpostos)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
