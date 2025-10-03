"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useComparativos } from "@/hooks/use-comparativos"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const CORES_CENARIOS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
]

export default function ComparativosPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { getEmpresa } = useEmpresasStore()
  const { getCenariosByEmpresa } = useCenariosStore()

  const empresa = getEmpresa(id)
  const todosCenarios = getCenariosByEmpresa(id)

  const [cenariosIds, setCenariosIds] = useState<string[]>([])

  const {
    metricas,
    variacoes,
    insights,
    dadosGraficoComparativo,
    temDados,
  } = useComparativos(cenariosIds)

  // Adicionar cenário selecionado
  const handleAddCenario = (cenarioId: string) => {
    if (!cenariosIds.includes(cenarioId) && cenariosIds.length < 4) {
      setCenariosIds([...cenariosIds, cenarioId])
    }
  }

  // Remover cenário
  const handleRemoveCenario = (cenarioId: string) => {
    setCenariosIds(cenariosIds.filter((id) => id !== cenarioId))
  }

  // Cenários disponíveis (não selecionados)
  const cenariosDisponiveis = useMemo(() => {
    return todosCenarios.filter((c: any) => !cenariosIds.includes(c.id))
  }, [todosCenarios, cenariosIds])

  if (!empresa) {
    return (
      <div className="container py-8">
        <p>Empresa não encontrada.</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/empresas/${id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Comparativos</h1>
              <p className="text-muted-foreground">{empresa.nome}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de cenários */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Cenários</CardTitle>
          <CardDescription>
            Escolha até 4 cenários para comparar (mínimo 2)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {cenariosIds.map((cenarioId) => {
              const cenario = todosCenarios.find((c: any) => c.id === cenarioId)
              if (!cenario) return null

              return (
                <Badge
                  key={cenarioId}
                  variant="secondary"
                  className="px-3 py-1.5 cursor-pointer"
                  onClick={() => handleRemoveCenario(cenarioId)}
                >
                  {cenario.nome} ✕
                </Badge>
              )
            })}
          </div>

          {cenariosIds.length < 4 && (
            <Select onValueChange={handleAddCenario}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar cenário..." />
              </SelectTrigger>
              <SelectContent>
                {cenariosDisponiveis.map((cenario: any) => (
                  <SelectItem key={cenario.id} value={cenario.id}>
                    {cenario.nome} ({cenario.periodo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Estado vazio */}
      {!temDados && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum comparativo disponível</h3>
            <p className="text-muted-foreground max-w-md">
              Selecione pelo menos 2 cenários acima para visualizar comparativos,
              gráficos e análises de diferenças.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {temDados && insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, idx) => {
            const Icon =
              insight.tipo === "success"
                ? TrendingUp
                : insight.tipo === "alert"
                ? TrendingDown
                : AlertCircle

            const bgColor =
              insight.tipo === "success"
                ? "bg-green-50 border-green-200"
                : insight.tipo === "alert"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"

            const iconColor =
              insight.tipo === "success"
                ? "text-green-600"
                : insight.tipo === "alert"
                ? "text-red-600"
                : "text-yellow-600"

            return (
              <Card key={idx} className={bgColor}>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <p className="text-sm">{insight.mensagem}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Gráficos comparativos */}
      {temDados && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico de Receita, Impostos e Lucro */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Comparativo Financeiro</CardTitle>
              <CardDescription>
                Receita, impostos e lucro líquido por cenário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dadosGraficoComparativo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nome"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                      return value.toString()
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Bar dataKey="receita" name="Receita" fill="#3b82f6" />
                  <Bar dataKey="impostos" name="Impostos" fill="#ef4444" />
                  <Bar dataKey="lucro" name="Lucro Líquido" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Margem Líquida */}
          <Card>
            <CardHeader>
              <CardTitle>Margem Líquida</CardTitle>
              <CardDescription>Percentual de lucratividade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficoComparativo} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <YAxis dataKey="nome" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Bar dataKey="margem" name="Margem Líquida %" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Cenário</CardTitle>
              <CardDescription>Resumo das principais métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricas.map((metrica, idx) => (
                  <div key={metrica.cenarioId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{metrica.nome}</p>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CORES_CENARIOS[idx] }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block">Receita:</span>
                        <span className="font-medium text-foreground">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(metrica.receita)}
                        </span>
                      </div>
                      <div>
                        <span className="block">Carga Trib.:</span>
                        <span className="font-medium text-foreground">
                          {metrica.cargaTributaria.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="block">Margem Liq.:</span>
                        <span className="font-medium text-foreground">
                          {metrica.margemLiquida.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="block">Lucro Liq.:</span>
                        <span className="font-medium text-foreground">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(metrica.lucroLiquido)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de variações */}
      {temDados && cenariosIds.length === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Variações</CardTitle>
            <CardDescription>
              Diferenças entre {metricas[0]?.nome} e {metricas[1]?.nome}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left font-medium">Métrica</th>
                    <th className="p-3 text-right font-medium">{metricas[0]?.nome}</th>
                    <th className="p-3 text-right font-medium">{metricas[1]?.nome}</th>
                    <th className="p-3 text-right font-medium">Δ Absoluta</th>
                    <th className="p-3 text-right font-medium">Δ %</th>
                  </tr>
                </thead>
                <tbody>
                  {variacoes.slice(0, 10).map((variacao, idx) => {
                    const isPercentual = variacao.metrica.includes("%")
                    const formatador = isPercentual
                      ? (v: number) => `${v.toFixed(2)}%`
                      : (v: number) =>
                          new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(v)

                    const corVariacao =
                      variacao.variacaoAbsoluta > 0
                        ? "text-green-600"
                        : variacao.variacaoAbsoluta < 0
                        ? "text-red-600"
                        : "text-muted-foreground"

                    return (
                      <tr key={idx} className="border-t">
                        <td className="p-3 font-medium">{variacao.metrica}</td>
                        <td className="p-3 text-right">{formatador(variacao.cenario1Valor)}</td>
                        <td className="p-3 text-right">{formatador(variacao.cenario2Valor)}</td>
                        <td className={`p-3 text-right font-medium ${corVariacao}`}>
                          {variacao.variacaoAbsoluta > 0 ? "+" : ""}
                          {formatador(variacao.variacaoAbsoluta)}
                        </td>
                        <td className={`p-3 text-right font-medium ${corVariacao}`}>
                          {variacao.variacaoPercentual > 0 ? "+" : ""}
                          {variacao.variacaoPercentual.toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
