"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import type { ResumoComparativo, DadosGraficoComparativo } from "@/types/comparativo"
import { MESES_ANO } from "@/types/comparativo"
import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react"

interface VisualizacaoComparativaProps {
  empresaId: string
  ano: number
}

export function VisualizacaoComparativa({ empresaId, ano }: VisualizacaoComparativaProps) {
  const { obterResumoComparativo, obterDadosPorEmpresa, obterMesesDisponiveis } = useRegimesTributariosStore()

  const resumoComparativo = useMemo(() => {
    return obterResumoComparativo(empresaId, ano)
  }, [empresaId, ano, obterResumoComparativo])

  const mesesDisponiveis = useMemo(() => {
    return obterMesesDisponiveis(empresaId, ano)
  }, [empresaId, ano, obterMesesDisponiveis])

  const dadosGrafico = useMemo(() => {
    const dadosEmpresa = obterDadosPorEmpresa(empresaId).filter(d => d.ano === ano)
    
    const dadosPorMes: Record<string, any> = {}
    
    dadosEmpresa.forEach(dado => {
      if (!dadosPorMes[dado.mes]) {
        dadosPorMes[dado.mes] = {
          mes: MESES_ANO.find(m => m.value === dado.mes)?.label || dado.mes,
          lucroReal: 0,
          lucroPresumido: 0,
          simplesNacional: 0,
        }
      }
      
      const totalImpostos = dado.icms + dado.pis + dado.cofins + dado.irpj + dado.csll + dado.iss + (dado.outros || 0)
      
      switch (dado.regime) {
        case 'lucro_real':
          dadosPorMes[dado.mes].lucroReal = totalImpostos
          break
        case 'lucro_presumido':
          dadosPorMes[dado.mes].lucroPresumido = totalImpostos
          break
        case 'simples_nacional':
          dadosPorMes[dado.mes].simplesNacional = totalImpostos
          break
      }
    })

    return Object.values(dadosPorMes)
  }, [empresaId, ano, obterDadosPorEmpresa])

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`
  }

  const getIconePosicao = (posicao: ResumoComparativo['posicao']) => {
    switch (posicao) {
      case 'melhor':
        return <Award className="h-4 w-4 text-green-500" />
      case 'intermediario':
        return <Minus className="h-4 w-4 text-yellow-500" />
      case 'pior':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getCorBadge = (posicao: ResumoComparativo['posicao']) => {
    switch (posicao) {
      case 'melhor':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediario':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pior':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (resumoComparativo.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Regimes Tributários</CardTitle>
          <CardDescription>
            Adicione dados de Lucro Presumido e Simples Nacional para visualizar a comparação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Nenhum dado disponível para o ano {ano}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        {resumoComparativo.map((resumo) => (
          <Card key={resumo.regime} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {resumo.nomeRegime}
                </CardTitle>
                {getIconePosicao(resumo.posicao)}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getCorBadge(resumo.posicao)}>
                  {resumo.posicao === 'melhor' && 'Mais Vantajoso'}
                  {resumo.posicao === 'intermediario' && 'Intermediário'}
                  {resumo.posicao === 'pior' && 'Menos Vantajoso'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">{formatarMoeda(resumo.impostoTotal)}</p>
                  <p className="text-xs text-muted-foreground">Total de Impostos</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Receita:</span>
                  <span>{formatarMoeda(resumo.receitaTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Carga Tributária:</span>
                  <span className="font-medium">{formatarPercentual(resumo.cargaTributaria)}</span>
                </div>
                {resumo.economia && resumo.economia > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Economia:</span>
                    <span className="font-medium">{formatarMoeda(resumo.economia)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Comparação Mensal */}
      {dadosGrafico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Impostos por Regime</CardTitle>
            <CardDescription>
              Comparação mensal do total de impostos entre os regimes tributários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(value)
                    }
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatarMoeda(value), '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="lucroReal" 
                    name="Lucro Real" 
                    fill="#ef4444" 
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="lucroPresumido" 
                    name="Lucro Presumido" 
                    fill="#3b82f6" 
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="simplesNacional" 
                    name="Simples Nacional" 
                    fill="#10b981" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Regime</CardTitle>
          <CardDescription>
            Comparação detalhada dos impostos e contribuições por regime tributário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regime</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                  <TableHead className="text-right">ICMS</TableHead>
                  <TableHead className="text-right">PIS</TableHead>
                  <TableHead className="text-right">COFINS</TableHead>
                  <TableHead className="text-right">IRPJ</TableHead>
                  <TableHead className="text-right">CSLL</TableHead>
                  <TableHead className="text-right">ISS</TableHead>
                  <TableHead className="text-right">Outros</TableHead>
                  <TableHead className="text-right">Total Impostos</TableHead>
                  <TableHead className="text-right">Carga Trib.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumoComparativo.map((resumo) => (
                  <TableRow key={resumo.regime}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getIconePosicao(resumo.posicao)}
                        {resumo.nomeRegime}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.receitaTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.icmsTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.pisTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.cofinsTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.irpjTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.csllTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.issTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(resumo.outrosTotal)}</TableCell>
                    <TableCell className="text-right font-bold">{formatarMoeda(resumo.impostoTotal)}</TableCell>
                    <TableCell className="text-right font-medium">{formatarPercentual(resumo.cargaTributaria)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Meses com Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mesesDisponiveis.map((mes) => {
                const mesInfo = MESES_ANO.find(m => m.value === mes)
                return (
                  <Badge key={mes} variant="secondary">
                    {mesInfo?.label || mes}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {resumoComparativo.length > 1 && (
                <>
                  <p>
                    <span className="font-medium">Regime mais vantajoso:</span>{' '}
                    {resumoComparativo.find(r => r.posicao === 'melhor')?.nomeRegime || 'N/A'}
                  </p>
                  {resumoComparativo.find(r => r.economia)?.economia && (
                    <p>
                      <span className="font-medium">Economia potencial:</span>{' '}
                      <span className="text-green-600">
                        {formatarMoeda(resumoComparativo.find(r => r.economia)?.economia || 0)}
                      </span>
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}