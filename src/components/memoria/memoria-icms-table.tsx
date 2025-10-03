"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMemoriaICMS } from "@/hooks/use-memoria-icms"
import { useTaxStore } from "@/hooks/use-tax-store"
import { usePDFExport } from "@/hooks/use-pdf-export"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Download, TrendingUp, TrendingDown, Receipt, DollarSign } from "lucide-react"

export const MemoriaICMSTable = React.memo(function MemoriaICMSTable() {
  const { config } = useTaxStore()
  const memoria = useMemoriaICMS(config)
  const { exportICMS } = usePDFExport()

  // Calcula valores sem ST para comparação
  const percentualTributavel = 100 - (config.percentualST || 0)
  const temST = config.percentualST > 0

  // Calcula faturamento total (vendas internas + interestaduais)
  const faturamentoTotal = memoria.vendasInternas.base + memoria.vendasInterestaduais.base
  
  // Calcula faturamento sem ST (valor original antes da redução)
  const fatorST = temST ? (100 - config.percentualST) / 100 : 1
  const faturamentoSemST = temST ? faturamentoTotal / fatorST : faturamentoTotal

  return (
    <div className="space-y-6">
      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Faturamento */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Faturamento Total</CardDescription>
              <Receipt className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(faturamentoSemST)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Base de cálculo ICMS
              {temST && (
                <span className="text-amber-600">
                  {' '}(com ST aplicada: {formatCurrency(faturamentoTotal)})
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Card Débito ICMS */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Débito ICMS</CardDescription>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(memoria.totalDebitos)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ICMS sobre vendas
            </p>
          </CardContent>
        </Card>

        {/* Card Crédito ICMS */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Crédito ICMS</CardDescription>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(memoria.totalCreditos)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ICMS sobre compras e outros
            </p>
          </CardContent>
        </Card>

        {/* Card ICMS a Pagar */}
        <Card className="border-l-4 border-l-icms">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">ICMS a Pagar</CardDescription>
              <DollarSign className="h-4 w-4 text-icms" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-icms">
              {formatCurrency(memoria.icmsAPagar)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Débito - Crédito
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-icms">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Memória de Cálculo - ICMS</CardTitle>
              <CardDescription>
                Detalhamento completo dos débitos e créditos de ICMS
                {temST && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Aplicando {formatPercentage(config.percentualST)} de Substituição Tributária
                  </span>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportICMS}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DÉBITOS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-icms">Débitos de ICMS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Descrição</TableHead>
                  <TableHead className="text-right">Base de Cálculo</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-red-50 dark:bg-red-950/20">
                  <TableCell className="font-medium">
                    Vendas Internas
                    {temST && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        (Base reduzida em {formatPercentage(config.percentualST)} por ST)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.vendasInternas.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.vendasInternas.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.vendasInternas.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-red-50 dark:bg-red-950/20">
                  <TableCell className="font-medium">
                    Vendas Interestaduais
                    {temST && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        (Base reduzida em {formatPercentage(config.percentualST)} por ST)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.vendasInterestaduais.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.vendasInterestaduais.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.vendasInterestaduais.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-red-50 dark:bg-red-950/20">
                  <TableCell className="font-medium">
                    DIFAL (Consumidor Final)
                    {temST && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        (Base reduzida em {formatPercentage(config.percentualST)} por ST)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.difal.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.difal.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.difal.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-red-50 dark:bg-red-950/20">
                  <TableCell className="font-medium">
                    FCP (Fundo de Combate à Pobreza)
                    {temST && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        (Base reduzida em {formatPercentage(config.percentualST)} por ST)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.fcp.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.fcp.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.fcp.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-red-100 dark:bg-red-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL DE DÉBITOS</TableCell>
                  <TableCell className="text-right text-icms">{formatCurrency(memoria.totalDebitos)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* CRÉDITOS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Créditos de ICMS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Descrição</TableHead>
                  <TableHead className="text-right">Base de Cálculo</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Compras Internas</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.creditoComprasInternas.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.creditoComprasInternas.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoComprasInternas.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Compras Interestaduais</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.creditoComprasInterestaduais.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.creditoComprasInterestaduais.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoComprasInterestaduais.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Estoque Inicial</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoEstoqueInicial.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Ativo Imobilizado</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoAtivoImobilizado.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Energia Elétrica (Indústria)</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoEnergia.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">ST na Entrada</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoST.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Outros Créditos</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.outrosCreditos.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-green-100 dark:bg-green-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL DE CRÉDITOS</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">{formatCurrency(memoria.totalCreditos)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* RESULTADO FINAL */}
          <div className="pt-4 border-t">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total de Débitos</TableCell>
                  <TableCell className="text-right text-icms font-semibold">{formatCurrency(memoria.totalDebitos)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">(-) Total de Créditos</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                    ({formatCurrency(memoria.totalCreditos)})
                  </TableCell>
                </TableRow>
                <TableRow className="bg-icms/10 dark:bg-icms/20">
                  <TableCell className="font-bold text-lg">ICMS A PAGAR</TableCell>
                  <TableCell className="text-right font-bold text-xl text-icms">
                    {formatCurrency(memoria.icmsAPagar)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
