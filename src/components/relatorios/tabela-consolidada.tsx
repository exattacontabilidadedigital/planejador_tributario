"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { LinhaRelatorioAnual, TotaisRelatorio } from "@/types/relatorio"

interface TabelaConsolidadaProps {
  linhas: LinhaRelatorioAnual[]
  totais: TotaisRelatorio
  titulo?: string
  descricao?: string
}

export const TabelaConsolidada = React.memo(function TabelaConsolidada({ linhas, totais, titulo, descricao }: TabelaConsolidadaProps) {
  if (linhas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo || "Tabela Consolidada Anual"}</CardTitle>
          {descricao && <CardDescription>{descricao}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Sem dados para exibir. Crie cenários aprovados para visualizar a tabela consolidada.
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo || "Tabela Consolidada Anual"}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Mês</TableHead>
                <TableHead className="text-right font-semibold">Receita</TableHead>
                <TableHead className="text-right font-semibold">ICMS</TableHead>
                <TableHead className="text-right font-semibold">PIS</TableHead>
                <TableHead className="text-right font-semibold">COFINS</TableHead>
                <TableHead className="text-right font-semibold">IRPJ</TableHead>
                <TableHead className="text-right font-semibold">CSLL</TableHead>
                <TableHead className="text-right font-semibold">ISS</TableHead>
                <TableHead className="text-right font-semibold">Total Impostos</TableHead>
                <TableHead className="text-right font-semibold">Lucro Líquido</TableHead>
                <TableHead className="text-right font-semibold">Margem Líq.</TableHead>
                <TableHead className="text-right font-semibold">Carga Trib.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((linha, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium capitalize">{linha.mes}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(linha.receita)}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(linha.icms)}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(linha.pis)}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(linha.cofins)}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(linha.irpj)}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(linha.csll)}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(linha.iss)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarMoeda(linha.totalImpostos)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarMoeda(linha.lucroLiquido)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatarPercentual(linha.margemLiquida)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatarPercentual(linha.cargaTributaria)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Linha de Totais */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.receitaBruta)}
                </TableCell>
                <TableCell className="text-right">{formatarMoeda(totais.icmsTotal)}</TableCell>
                <TableCell className="text-right">{formatarMoeda(totais.pisTotal)}</TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.cofinsTotal)}
                </TableCell>
                <TableCell className="text-right">{formatarMoeda(totais.irpjTotal)}</TableCell>
                <TableCell className="text-right">{formatarMoeda(totais.csllTotal)}</TableCell>
                <TableCell className="text-right">{formatarMoeda(totais.issTotal)}</TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(
                    totais.icmsTotal +
                      totais.pisTotal +
                      totais.cofinsTotal +
                      totais.irpjTotal +
                      totais.csllTotal +
                      totais.issTotal
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.lucroLiquido)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarPercentual(totais.margemLiquida)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarPercentual(totais.cargaTributariaEfetiva)}
                </TableCell>
              </TableRow>

              {/* Linha de Médias */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold">MÉDIA</TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.receitaBruta / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.icmsTotal / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.pisTotal / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.cofinsTotal / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.irpjTotal / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.csllTotal / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.issTotal / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(
                    (totais.icmsTotal +
                      totais.pisTotal +
                      totais.cofinsTotal +
                      totais.irpjTotal +
                      totais.csllTotal +
                      totais.issTotal) /
                      linhas.length
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(totais.lucroLiquido / linhas.length)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarPercentual(totais.margemLiquida)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarPercentual(totais.cargaTributariaEfetiva)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
})
