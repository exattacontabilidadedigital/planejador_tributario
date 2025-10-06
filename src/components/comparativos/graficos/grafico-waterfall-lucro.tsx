"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { ResultadoRegime } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface GraficoWaterfallLucroProps {
  resultado: ResultadoRegime
  regimeSelecionado?: string
}

export function GraficoWaterfallLucro({ resultado, regimeSelecionado }: GraficoWaterfallLucroProps) {
  
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

  // Preparar dados para o gráfico waterfall (cascata)
  const construirDadosWaterfall = () => {
    const dados: Array<{
      nome: string
      valor: number
      valorAcumulado: number
      tipo: 'inicio' | 'deducao' | 'final'
      cor: string
    }> = []

    let acumulado = resultado.receitaTotal

    // 1. Receita Total (início)
    dados.push({
      nome: 'Receita Total',
      valor: resultado.receitaTotal,
      valorAcumulado: acumulado,
      tipo: 'inicio',
      cor: '#22c55e' // green-500
    })

    // 2. Deduções de impostos (cada imposto é uma barra negativa)
    if (resultado.impostos) {
      const impostosOrdenados = Object.entries(resultado.impostos)
        .sort(([, a], [, b]) => (b || 0) - (a || 0)) // Ordem decrescente

      impostosOrdenados.forEach(([imposto, valor]) => {
        const valorAnterior = acumulado
        acumulado -= (valor || 0)

        dados.push({
          nome: imposto,
          valor: -(valor || 0),
          valorAcumulado: acumulado,
          tipo: 'deducao',
          cor: '#ef4444' // red-500
        })
      })
    }

    // 3. Lucro Líquido (final)
    dados.push({
      nome: 'Lucro Líquido',
      valor: resultado.lucroLiquido,
      valorAcumulado: resultado.lucroLiquido,
      tipo: 'final',
      cor: '#3b82f6' // blue-500
    })

    return dados
  }

  const dadosWaterfall = construirDadosWaterfall()

  // Preparar dados para o Recharts (formato especial para waterfall)
  const dadosGrafico = dadosWaterfall.map((item, index) => {
    if (item.tipo === 'inicio') {
      return {
        ...item,
        base: 0,
        altura: item.valor
      }
    } else if (item.tipo === 'final') {
      return {
        ...item,
        base: 0,
        altura: item.valor
      }
    } else {
      // Deduções: empilhar de cima para baixo
      const anterior = dadosWaterfall[index - 1]
      return {
        ...item,
        base: item.valorAcumulado,
        altura: Math.abs(item.valor)
      }
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cascata de Deduções - {formatarRegime(resultado.regime)}</CardTitle>
        <CardDescription>
          Visualização do fluxo: Receita → Impostos → Lucro Líquido
          {regimeSelecionado && ` • ${regimeSelecionado}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart 
            data={dadosGrafico}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="nome" 
              angle={-45}
              textAnchor="end"
              height={100}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatarMoeda}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'altura') {
                  const item = dadosGrafico.find(d => d.altura === value)
                  return [formatarMoeda(Math.abs(item?.valor || value)), 'Valor']
                }
                return [formatarMoeda(value), name]
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
            
            {/* Barra de base (invisível, para empilhamento) */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" />
            
            {/* Barra de altura (visível, colorida por tipo) */}
            <Bar dataKey="altura" stackId="waterfall" name="Valor">
              {dadosGrafico.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.cor}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Tabela Detalhada */}
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Detalhamento da Cascata</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Etapa</th>
                  <th className="text-right py-2 px-3 font-semibold">Valor</th>
                  <th className="text-right py-2 px-3 font-semibold">Acumulado</th>
                  <th className="text-right py-2 px-3 font-semibold">% da Receita</th>
                </tr>
              </thead>
              <tbody>
                {dadosWaterfall.map((item, index) => {
                  const percentualReceita = resultado.receitaTotal > 0
                    ? (Math.abs(item.valor) / resultado.receitaTotal) * 100
                    : 0

                  return (
                    <tr 
                      key={index} 
                      className={`border-b hover:bg-muted/50 ${
                        item.tipo === 'inicio' ? 'font-semibold bg-green-50 dark:bg-green-950' :
                        item.tipo === 'final' ? 'font-semibold bg-blue-50 dark:bg-blue-950' :
                        ''
                      }`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: item.cor }}
                          />
                          {item.nome}
                        </div>
                      </td>
                      <td className={`text-right py-2 px-3 font-semibold ${
                        item.tipo === 'deducao' ? 'text-red-600' :
                        item.tipo === 'inicio' ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {item.tipo === 'deducao' ? '-' : ''}
                        {formatarMoeda(Math.abs(item.valor))}
                      </td>
                      <td className="text-right py-2 px-3">
                        {formatarMoeda(item.valorAcumulado)}
                      </td>
                      <td className="text-right py-2 px-3">
                        {percentualReceita.toFixed(2)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-3 px-3">Total de Impostos</td>
                  <td className="text-right py-3 px-3 text-red-600">
                    -{formatarMoeda(resultado.totalImpostos)}
                  </td>
                  <td className="text-right py-3 px-3"></td>
                  <td className="text-right py-3 px-3">
                    {resultado.cargaTributaria.toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Resumo Visual */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-700 dark:text-green-300 mb-1">Receita Total</div>
            <div className="text-2xl font-bold text-green-600">
              {formatarMoeda(resultado.receitaTotal)}
            </div>
            <div className="text-xs text-green-600 mt-1">100%</div>
          </div>

          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <div className="text-xs text-red-700 dark:text-red-300 mb-1">Total Impostos</div>
            <div className="text-2xl font-bold text-red-600">
              {formatarMoeda(resultado.totalImpostos)}
            </div>
            <div className="text-xs text-red-600 mt-1">
              {resultado.cargaTributaria.toFixed(2)}%
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">Lucro Líquido</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatarMoeda(resultado.lucroLiquido)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {((resultado.lucroLiquido / resultado.receitaTotal) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
