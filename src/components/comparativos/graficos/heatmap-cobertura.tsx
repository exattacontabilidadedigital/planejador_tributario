"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Circle } from "lucide-react"
import type { HeatmapCobertura as HeatmapCoberturaType } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface HeatmapCoberturaProps {
  dados: HeatmapCoberturaType
  mesesSelecionados: number[]
}

export function HeatmapCobertura({ dados, mesesSelecionados }: HeatmapCoberturaProps) {
  
  const obterNomeMes = (mes: number): string => {
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    return meses[mes - 1] || `M${mes}`
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
      'lucro_real': 'bg-blue-500',
      'lucro_presumido': 'bg-green-500',
      'simples_nacional': 'bg-orange-500'
    }
    return cores[regime] || 'bg-gray-500'
  }

  const calcularCoberturaPorRegime = (regime: string) => {
    const totalMeses = mesesSelecionados.length
    const mesesComDados = mesesSelecionados.filter(mes => 
      dados.coberturaPorMes[mes]?.[regime] === true
    ).length
    
    return totalMeses > 0 ? (mesesComDados / totalMeses) * 100 : 0
  }

  const calcularCoberturaPorMes = (mes: number) => {
    const regimes = Object.keys(dados.coberturaPorRegime)
    const totalRegimes = regimes.length
    const regimesComDados = regimes.filter(regime => 
      dados.coberturaPorMes[mes]?.[regime] === true
    ).length
    
    return totalRegimes > 0 ? (regimesComDados / totalRegimes) * 100 : 0
  }

  const regimes = Object.keys(dados.coberturaPorRegime)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Cobertura de Dados</CardTitle>
        <CardDescription>
          Visualização da disponibilidade de dados por mês e regime
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header com meses */}
            <div className="flex mb-2">
              <div className="w-40 flex-shrink-0" /> {/* Espaço para labels dos regimes */}
              <div className="flex gap-1">
                {mesesSelecionados.map(mes => (
                  <div 
                    key={mes}
                    className="w-12 text-center text-xs font-medium text-muted-foreground"
                  >
                    {obterNomeMes(mes)}
                  </div>
                ))}
              </div>
              <div className="w-20 ml-4 text-center text-xs font-medium text-muted-foreground">
                Cobertura
              </div>
            </div>

            {/* Linhas de regimes */}
            {regimes.map(regime => {
              const cobertura = calcularCoberturaPorRegime(regime)
              
              return (
                <div key={regime} className="flex items-center mb-2">
                  {/* Label do regime */}
                  <div className="w-40 flex-shrink-0 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${obterCorRegime(regime as RegimeTributario)}`} />
                    <span className="text-sm font-medium">{formatarRegime(regime)}</span>
                  </div>

                  {/* Células do heatmap */}
                  <div className="flex gap-1">
                    {mesesSelecionados.map(mes => {
                      const temDados = dados.coberturaPorMes[mes]?.[regime] === true
                      
                      return (
                        <div
                          key={mes}
                          className={`w-12 h-12 rounded flex items-center justify-center transition-colors ${
                            temDados
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                          }`}
                          title={`${formatarRegime(regime)} - ${obterNomeMes(mes)}: ${temDados ? 'Com dados' : 'Sem dados'}`}
                        >
                          {temDados ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Percentual de cobertura do regime */}
                  <div className="w-20 ml-4 text-center">
                    <div className="text-sm font-semibold">
                      {cobertura.toFixed(0)}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          cobertura === 100 ? 'bg-green-500' :
                          cobertura >= 75 ? 'bg-blue-500' :
                          cobertura >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${cobertura}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Footer com cobertura por mês */}
            <div className="flex items-center mt-4 pt-4 border-t">
              <div className="w-40 flex-shrink-0 text-sm font-medium text-muted-foreground">
                Cobertura por Mês
              </div>
              <div className="flex gap-1">
                {mesesSelecionados.map(mes => {
                  const cobertura = calcularCoberturaPorMes(mes)
                  
                  return (
                    <div key={mes} className="w-12 text-center">
                      <div className="text-xs font-semibold mb-1">
                        {cobertura.toFixed(0)}%
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            cobertura === 100 ? 'bg-green-500' :
                            cobertura >= 75 ? 'bg-blue-500' :
                            cobertura >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${cobertura}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-6 text-sm pt-4 border-t">
          <div className="font-medium text-muted-foreground">Legenda:</div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span>Com dados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Circle className="h-4 w-4 text-gray-400" />
            </div>
            <span>Sem dados</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {dados.percentualCobertura.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Cobertura Geral
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {dados.mesesComDados.length}/{mesesSelecionados.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Meses com Dados
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {regimes.length - dados.regimesIncompletos.length}/{regimes.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Regimes Completos
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
