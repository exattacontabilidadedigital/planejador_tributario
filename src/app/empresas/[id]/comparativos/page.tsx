"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, AlertCircle, Save, FolderOpen, Trash2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useComparativosStore } from "@/stores/comparativos-store"
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

  const { toast } = useToast()
  const { getEmpresa } = useEmpresasStore()
  const { getCenariosByEmpresa } = useCenariosStore()
  const { addComparativo, getComparativosByEmpresa, deleteComparativo } = useComparativosStore()

  const empresa = getEmpresa(id)
  const todosCenarios = getCenariosByEmpresa(id) || []
  const comparativosSalvos = getComparativosByEmpresa(id)

  const [cenariosIds, setCenariosIds] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nomeComparativo, setNomeComparativo] = useState("")
  const [descricaoComparativo, setDescricaoComparativo] = useState("")

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

  // Salvar comparativo
  const handleSalvarComparativo = () => {
    if (!nomeComparativo.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe um nome para o comparativo.",
        variant: "destructive",
      })
      return
    }

    if (cenariosIds.length < 2) {
      toast({
        title: "Cenários insuficientes",
        description: "Selecione pelo menos 2 cenários para salvar.",
        variant: "destructive",
      })
      return
    }

    addComparativo(id, {
      nome: nomeComparativo,
      descricao: descricaoComparativo,
      cenariosIds,
    })

    toast({
      title: "Comparativo salvo!",
      description: `${nomeComparativo} foi salvo com sucesso.`,
    })

    setDialogOpen(false)
    setNomeComparativo("")
    setDescricaoComparativo("")
  }

  // Carregar comparativo salvo
  const handleCarregarComparativo = (comparativoId: string) => {
    const comparativo = comparativosSalvos.find((c) => c.id === comparativoId)
    if (comparativo) {
      setCenariosIds(comparativo.cenariosIds)
      toast({
        title: "Comparativo carregado!",
        description: `${comparativo.nome} foi carregado.`,
      })
    }
  }

  // Excluir comparativo salvo
  const handleExcluirComparativo = (comparativoId: string) => {
    const comparativo = comparativosSalvos.find((c) => c.id === comparativoId)
    deleteComparativo(comparativoId)
    toast({
      title: "Comparativo excluído",
      description: `${comparativo?.nome} foi removido.`,
    })
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
        
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={cenariosIds.length < 2}>
                <Save className="h-4 w-4" />
                Salvar Comparativo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Comparativo</DialogTitle>
                <DialogDescription>
                  Salve esta seleção de cenários para comparação rápida no futuro
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Comparativo *</Label>
                  <Input
                    id="nome"
                    value={nomeComparativo}
                    onChange={(e) => setNomeComparativo(e.target.value)}
                    placeholder="Ex: Comparação Q1 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Textarea
                    id="descricao"
                    value={descricaoComparativo}
                    onChange={(e) => setDescricaoComparativo(e.target.value)}
                    placeholder="Descreva o objetivo desta comparação..."
                    rows={3}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {cenariosIds.length} {cenariosIds.length === 1 ? 'cenário selecionado' : 'cenários selecionados'}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvarComparativo}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            {cenariosIds.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum cenário selecionado
              </p>
            )}
          </div>

          {cenariosIds.length < 4 && (
            <Select onValueChange={handleAddCenario}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar cenário..." />
              </SelectTrigger>
              <SelectContent>
                {cenariosDisponiveis.map((cenario: any) => (
                  <SelectItem key={cenario.id} value={cenario.id}>
                    {cenario.nome} ({cenario.periodo.tipo} - {cenario.periodo.ano})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Comparativos Salvos */}
      {comparativosSalvos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Comparativos Salvos
            </CardTitle>
            <CardDescription>
              Carregue comparações salvas anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparativosSalvos.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{comp.nome}</p>
                    {comp.descricao && (
                      <p className="text-sm text-muted-foreground">{comp.descricao}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {comp.cenariosIds.length} cenários • Criado em {format(new Date(comp.criadoEm), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCarregarComparativo(comp.id)}
                    >
                      Carregar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExcluirComparativo(comp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                : insight.tipo === "alert"
                ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"

            const iconColor =
              insight.tipo === "success"
                ? "text-green-600 dark:text-green-400"
                : insight.tipo === "alert"
                ? "text-red-600 dark:text-red-400"
                : "text-yellow-600 dark:text-yellow-400"

            const textColor =
              insight.tipo === "success"
                ? "text-green-900 dark:text-green-100"
                : insight.tipo === "alert"
                ? "text-red-900 dark:text-red-100"
                : "text-yellow-900 dark:text-yellow-100"

            return (
              <Card key={idx} className={bgColor}>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <p className={`text-sm font-medium ${textColor}`}>{insight.mensagem}</p>
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
