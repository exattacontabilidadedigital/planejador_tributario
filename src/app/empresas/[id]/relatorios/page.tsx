"use client"

import { use, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useRelatorios } from "@/hooks/use-relatorios"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, BarChart3, TrendingUp, Filter, X } from "lucide-react"
import Link from "next/link"
import { GraficoEvolucao } from "@/components/relatorios/grafico-evolucao"
import { GraficoComposicao } from "@/components/relatorios/grafico-composicao"
import { GraficoEvolucaoFinanceira } from "@/components/relatorios/grafico-evolucao-financeira"
import { TabelaConsolidada } from "@/components/relatorios/tabela-consolidada"
import { BotoesExportacao } from "@/components/relatorios/botoes-exportacao"

const mesesDoAno = [
  { value: "jan", label: "Janeiro" },
  { value: "fev", label: "Fevereiro" },
  { value: "mar", label: "Março" },
  { value: "abr", label: "Abril" },
  { value: "mai", label: "Maio" },
  { value: "jun", label: "Junho" },
  { value: "jul", label: "Julho" },
  { value: "ago", label: "Agosto" },
  { value: "set", label: "Setembro" },
  { value: "out", label: "Outubro" },
  { value: "nov", label: "Novembro" },
  { value: "dez", label: "Dezembro" },
]

export default function RelatoriosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: empresaId } = use(params)
  const router = useRouter()
  const { getEmpresa } = useEmpresasStore()
  const empresa = getEmpresa(empresaId)

  // Inicializar com ano fixo para evitar problemas de hidratação
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025)
  const [mounted, setMounted] = useState(false)
  
  // Estados para filtros de mês
  const [mesesSelecionados, setMesesSelecionados] = useState<string[]>(
    mesesDoAno.map(mes => mes.value)
  )
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Marcar componente como montado e atualizar ano
  useEffect(() => {
    setMounted(true)
    const anoAtual = new Date().getFullYear()
    setAnoSelecionado(anoAtual)
  }, [])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAberto(false)
      }
    }

    if (dropdownAberto) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownAberto])

  // Funções para controle dos filtros de mês
  const toggleMes = (mes: string) => {
    setMesesSelecionados(prev => 
      prev.includes(mes) 
        ? prev.filter(m => m !== mes)
        : [...prev, mes]
    )
  }

  const selecionarTodosMeses = () => {
    setMesesSelecionados(mesesDoAno.map(mes => mes.value))
  }

  const limparMeses = () => {
    setMesesSelecionados([])
  }

  const {
    dadosEvolucao,
    dadosComposicao,
    dadosMargem,
    dadosEvolucaoFinanceira,
    linhasTabela,
    totais,
    anosDisponiveis,
    temDados,
  } = useRelatorios(empresaId, anoSelecionado, mesesSelecionados)

  if (!empresa) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/empresas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/empresas/${empresaId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">{empresa.nome}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mounted && (
            <>
              {/* Seletor de Ano */}
              <Select
                value={anoSelecionado.toString()}
                onValueChange={(value) => setAnoSelecionado(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.length > 0 ? (
                    anosDisponiveis.map((ano) => (
                      <SelectItem key={ano} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={anoSelecionado.toString()}>{anoSelecionado}</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Filtro de Meses */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setDropdownAberto(!dropdownAberto)}
                >
                  <Filter className="h-4 w-4" />
                  Meses ({mesesSelecionados.length})
                </Button>
                
                {/* Dropdown para meses */}
                {dropdownAberto && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">Selecionar Meses</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={selecionarTodosMeses}>
                          Todos
                        </Button>
                        <Button variant="ghost" size="sm" onClick={limparMeses}>
                          Limpar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {mesesDoAno.map(mes => (
                        <label
                          key={mes.value}
                          className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={mesesSelecionados.includes(mes.value)}
                            onChange={() => toggleMes(mes.value)}
                            className="rounded"
                          />
                          <span className="text-sm">{mes.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Exportação */}
              {temDados && (
                <BotoesExportacao
                  linhas={linhasTabela}
                  totais={totais}
                  nomeEmpresa={empresa.nome}
                  ano={anoSelecionado}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Badges dos meses selecionados */}
      {mesesSelecionados.length > 0 && mesesSelecionados.length < 12 && (
        <div className="flex flex-wrap gap-1 mb-6">
          {mesesSelecionados.map(mes => {
            const mesInfo = mesesDoAno.find(m => m.value === mes)
            return (
              <Badge key={mes} variant="secondary" className="text-xs">
                {mesInfo?.label}
                <button
                  onClick={() => toggleMes(mes)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Conteúdo */}
      {!temDados ? (
        <Card>
          <CardHeader>
            <CardTitle>Sem dados para exibir</CardTitle>
            <CardDescription>
              Crie e aprove cenários para {anoSelecionado} para visualizar os relatórios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <BarChart3 className="h-24 w-24 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-center max-w-md">
                Os relatórios consolidam os dados dos cenários aprovados. Vá para a página de
                cenários e crie seu primeiro cenário mensal.
              </p>
              <Button asChild>
                <Link href={`/empresas/${empresaId}/cenarios`}>
                  Ir para Cenários
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  }).format(totais.receitaBruta)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {linhasTabela.length} {linhasTabela.length === 1 ? "mês" : "meses"}{" "}
                  consolidados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impostos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  }).format(
                    totais.icmsTotal +
                      totais.pisTotal +
                      totais.cofinsTotal +
                      totais.irpjTotal +
                      totais.csllTotal +
                      totais.issTotal
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Carga: {totais.cargaTributariaEfetiva.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  }).format(totais.lucroLiquido)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {totais.margemLiquida.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totais.margemBruta.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">
                  Lucro Bruto:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  }).format(totais.lucroBruto)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid gap-6 md:grid-cols-2">
            <GraficoEvolucao
              dados={dadosEvolucao}
              titulo="Evolução Mensal"
              descricao="Acompanhe a evolução da receita, impostos e lucro ao longo do ano"
            />
            <GraficoComposicao
              dados={dadosComposicao}
              titulo="Composição de Impostos"
              descricao="Distribuição percentual dos impostos pagos"
            />
          </div>

          <GraficoEvolucaoFinanceira
            dados={dadosEvolucaoFinanceira}
            titulo="Evolução Financeira Mensal"
            descricao="Receita, lucro e impostos mês a mês ao longo do ano"
          />

          {/* Tabela Consolidada */}
          <TabelaConsolidada
            linhas={linhasTabela}
            totais={totais}
            titulo={`Demonstrativo Consolidado - ${anoSelecionado}`}
            descricao="Tabela detalhada com todos os valores mensais e totalizações"
          />
        </div>
      )}
    </div>
  )
}
