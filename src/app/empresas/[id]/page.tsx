"use client"

import { use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useRelatorios } from "@/hooks/use-relatorios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Building2, 
  FileText, 
  GitCompare, 
  Plus, 
  Settings, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function EmpresaDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { getEmpresa } = useEmpresasStore()
  const { getCenariosByEmpresa } = useCenariosStore()
  
  const empresa = getEmpresa(id)
  const cenarios = getCenariosByEmpresa(id)
  const anoAtual = new Date().getFullYear()
  const { dadosEvolucao, totais, cenariosAprovados } = useRelatorios(id, anoAtual)
  
  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <p>Empresa não encontrada</p>
        <Button onClick={() => router.push("/empresas")}>Voltar</Button>
      </div>
    )
  }

  const cenariosRecentes = cenarios
    .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
    .slice(0, 5)

  // Calcular insights
  const insights = useMemo(() => {
    const results = []
    
    if (cenariosAprovados.length === 0) {
      results.push({
        tipo: 'warning',
        mensagem: 'Nenhum cenário aprovado para análise',
        acao: 'Aprove cenários para visualizar insights'
      })
    } else {
      // Insight de carga tributária
      if (totais.cargaTributariaEfetiva > 35) {
        results.push({
          tipo: 'alert',
          mensagem: `Carga tributária elevada: ${totais.cargaTributariaEfetiva.toFixed(1)}%`,
          acao: 'Considere otimizações fiscais'
        })
      } else if (totais.cargaTributariaEfetiva > 0) {
        results.push({
          tipo: 'success',
          mensagem: `Carga tributária adequada: ${totais.cargaTributariaEfetiva.toFixed(1)}%`,
          acao: 'Continue monitorando'
        })
      }
      
      // Insight de margem líquida
      if (totais.margemLiquida < 10 && totais.margemLiquida > 0) {
        results.push({
          tipo: 'alert',
          mensagem: `Margem líquida baixa: ${totais.margemLiquida.toFixed(1)}%`,
          acao: 'Revise custos e despesas'
        })
      } else if (totais.margemLiquida >= 20) {
        results.push({
          tipo: 'success',
          mensagem: `Ótima margem líquida: ${totais.margemLiquida.toFixed(1)}%`,
          acao: 'Empresa saudável'
        })
      }
      
      // Insight de tendência (se houver evolução)
      if (dadosEvolucao.length >= 2) {
        const primeiro = dadosEvolucao[0]
        const ultimo = dadosEvolucao[dadosEvolucao.length - 1]
        const crescimentoReceita = ((ultimo.receita - primeiro.receita) / primeiro.receita) * 100
        
        if (crescimentoReceita > 10) {
          results.push({
            tipo: 'success',
            mensagem: `Receita crescendo ${crescimentoReceita.toFixed(1)}%`,
            acao: 'Tendência positiva'
          })
        } else if (crescimentoReceita < -10) {
          results.push({
            tipo: 'alert',
            mensagem: `Receita em queda ${Math.abs(crescimentoReceita).toFixed(1)}%`,
            acao: 'Atenção necessária'
          })
        }
      }
    }
    
    return results.slice(0, 3) // Máximo 3 insights
  }, [cenariosAprovados, totais, dadosEvolucao])

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/empresas")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Empresas
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {empresa.nome}
            </h1>
            <p className="text-muted-foreground mt-1">
              CNPJ: {empresa.cnpj} • {empresa.razaoSocial}
            </p>
          </div>
          <Link href={`/empresas/${id}/configuracoes`}>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs Calculados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total (Ano)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              }).format(totais.receitaBruta || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cenariosAprovados.length} {cenariosAprovados.length === 1 ? 'cenário aprovado' : 'cenários aprovados'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carga Tributária</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totais.cargaTributariaEfetiva?.toFixed(2) || '0.00'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totais.cargaTributariaEfetiva > 35 ? 'Elevada' : totais.cargaTributariaEfetiva > 25 ? 'Moderada' : 'Adequada'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totais.margemLiquida?.toFixed(2) || '0.00'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro: {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              }).format(totais.lucroLiquido || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cenários</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cenarios.length}</div>
            <p className="text-xs text-muted-foreground">
              {cenarios.filter(c => c.status === 'rascunho').length} rascunhos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução Mensal - {anoAtual}</CardTitle>
            <CardDescription>
              Acompanhe a evolução da receita e lucro ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dadosEvolucao.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="mes" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                      return value.toString()
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 0,
                      }).format(value),
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Receita"
                  />
                  <Line
                    type="monotone"
                    dataKey="lucro"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Lucro"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-center">Aprove cenários mensais para visualizar o gráfico de evolução</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights Automáticos */}
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Análises automáticas dos seus cenários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    insight.tipo === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : insight.tipo === 'alert'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                      : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {insight.tipo === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : insight.tipo === 'alert' ? (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{insight.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.acao}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum insight disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/empresas/${id}/cenarios`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cenários
              </CardTitle>
              <CardDescription>
                Gerencie e crie novos cenários de planejamento
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/empresas/${id}/relatorios`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Visualize análises e gráficos consolidados
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/empresas/${id}/comparativos`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Comparativos
              </CardTitle>
              <CardDescription>
                Compare cenários e analise variações
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Cenários Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cenários Recentes</CardTitle>
            <Link href={`/empresas/${id}/cenarios`}>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {cenariosRecentes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Nenhum cenário criado ainda</p>
              <Link href={`/empresas/${id}/cenarios/novo`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Cenário
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cenariosRecentes.map((cenario) => (
                <Link
                  key={cenario.id}
                  href={`/empresas/${id}/cenarios/${cenario.id}`}
                >
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">{cenario.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {cenario.periodo.tipo} • {new Date(cenario.atualizadoEm).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        cenario.status === 'aprovado' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : cenario.status === 'rascunho'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                      }`}>
                        {cenario.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
