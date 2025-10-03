"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useRelatorios } from "@/hooks/use-relatorios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"
import { GraficoEvolucao } from "@/components/relatorios/grafico-evolucao"
import { GraficoComposicao } from "@/components/relatorios/grafico-composicao"
import { GraficoMargem } from "@/components/relatorios/grafico-margem"
import { TabelaConsolidada } from "@/components/relatorios/tabela-consolidada"
import { BotoesExportacao } from "@/components/relatorios/botoes-exportacao"

export default function RelatoriosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: empresaId } = use(params)
  const router = useRouter()
  const { getEmpresa } = useEmpresasStore()
  const empresa = getEmpresa(empresaId)

  const anoAtual = new Date().getFullYear()
  const [anoSelecionado, setAnoSelecionado] = useState<number>(anoAtual)

  const {
    dadosEvolucao,
    dadosComposicao,
    dadosMargem,
    linhasTabela,
    totais,
    anosDisponiveis,
    temDados,
  } = useRelatorios(empresaId, anoSelecionado)

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
                <SelectItem value={anoAtual.toString()}>{anoAtual}</SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Botões de Exportação */}
          {temDados && (
            <BotoesExportacao
              linhas={linhasTabela}
              totais={totais}
              nomeEmpresa={empresa.nome}
              ano={anoSelecionado}
            />
          )}
        </div>
      </div>

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

          <GraficoMargem
            dados={dadosMargem}
            titulo="Indicadores de Lucratividade"
            descricao="Margens brutas e líquidas comparadas com as metas"
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
