"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { 
  DadosGraficoEvolucao, 
  DadosGraficoComposicao, 
  DadosGraficoMargem,
  LinhaRelatorioAnual,
  TotaisRelatorio 
} from "@/types/relatorio"

// Lazy loading otimizado dos componentes de relatórios
const GraficoEvolucao = dynamic(
  () => import("@/components/relatorios/grafico-evolucao").then(mod => ({ default: mod.GraficoEvolucao })),
  { 
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }
)

const GraficoComposicao = dynamic(
  () => import("@/components/relatorios/grafico-composicao").then(mod => ({ default: mod.GraficoComposicao })),
  { 
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }
)

const GraficoMargem = dynamic(
  () => import("@/components/relatorios/grafico-margem").then(mod => ({ default: mod.GraficoMargem })),
  { 
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }
)

const TabelaConsolidada = dynamic(
  () => import("@/components/relatorios/tabela-consolidada").then(mod => ({ default: mod.TabelaConsolidada })),
  { 
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }
)

const BotoesExportacao = dynamic(
  () => import("@/components/relatorios/botoes-exportacao").then(mod => ({ default: mod.BotoesExportacao })),
  { 
    loading: () => (
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }
)

interface RelatoriosContentProps {
  dadosEvolucao: DadosGraficoEvolucao[]
  dadosComposicao: DadosGraficoComposicao[]
  dadosMargem: DadosGraficoMargem[]
  linhasTabela: LinhaRelatorioAnual[]
  totais: TotaisRelatorio
  nomeEmpresa: string
  anoSelecionado: number
}

export const RelatoriosContent = React.memo(function RelatoriosContent({
  dadosEvolucao,
  dadosComposicao,
  dadosMargem,
  linhasTabela,
  totais,
  nomeEmpresa,
  anoSelecionado,
}: RelatoriosContentProps) {
  return (
    <div className="space-y-8">
      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoEvolucao
          dados={dadosEvolucao}
          titulo="Evolução Temporal dos Tributos"
          descricao="Acompanhe a evolução dos tributos ao longo do tempo"
        />
        <GraficoComposicao
          dados={dadosComposicao}
          titulo="Composição Tributária"
          descricao="Distribuição dos tributos por tipo"
        />
      </div>

      {/* Gráfico de Margem */}
      <GraficoMargem
        dados={dadosMargem}
        titulo="Análise de Margem"
        descricao="Evolução da margem líquida e tributos"
      />

      {/* Tabela Consolidada */}
      <TabelaConsolidada
        linhas={linhasTabela}
        totais={totais}
        titulo={`Relatório Consolidado ${anoSelecionado}`}
        descricao="Resumo detalhado de todos os cenários aprovados"
      />

      {/* Botões de Exportação */}
      <div className="flex justify-end pt-4">
        <BotoesExportacao
          linhas={linhasTabela}
          totais={totais}
          nomeEmpresa={nomeEmpresa}
          ano={anoSelecionado}
        />
      </div>
    </div>
  )
})