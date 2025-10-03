"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMemoriaPISCOFINS } from "@/hooks/use-memoria-pis-cofins"
import { useTaxStore } from "@/hooks/use-tax-store"
import { usePDFExport } from "@/hooks/use-pdf-export"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Download, TrendingUp, TrendingDown, Receipt, DollarSign } from "lucide-react"

export const MemoriaPISCOFINSTable = React.memo(function MemoriaPISCOFINSTable() {
  const { config } = useTaxStore()
  const memoria = useMemoriaPISCOFINS(config)
  const { exportPISCOFINS } = usePDFExport()

  const temMonofasico = config.percentualMonofasico > 0
  
  // Calcula receita com e sem monofásico
  const receitaComMonofasico = memoria.debitoPIS.base
  const fatorMonofasico = temMonofasico ? (100 - config.percentualMonofasico) / 100 : 1
  const receitaSemMonofasico = temMonofasico ? receitaComMonofasico / fatorMonofasico : receitaComMonofasico

  return (
    <div className="space-y-6">
      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Receita Bruta */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Receita Bruta</CardDescription>
              <Receipt className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(receitaSemMonofasico)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Base de cálculo PIS/COFINS
              {temMonofasico && (
                <span className="text-amber-600">
                  {' '}(com Monofásico: {formatCurrency(receitaComMonofasico)})
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Card Débito PIS */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Débito PIS</CardDescription>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(memoria.debitoPIS.valor)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PIS sobre receitas
            </p>
          </CardContent>
        </Card>

        {/* Card Crédito PIS */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Crédito PIS</CardDescription>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(memoria.totalCreditosPIS)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Créditos apurados
            </p>
          </CardContent>
        </Card>

        {/* Card PIS a Pagar */}
        <Card className="border-l-4 border-l-pis">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">PIS a Pagar</CardDescription>
              <DollarSign className="h-4 w-4 text-pis" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pis">
              {formatCurrency(memoria.pisAPagar)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Débito - Crédito
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CARDS DE RESUMO COFINS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Receita Bruta (repetido para simetria) */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Receita Bruta</CardDescription>
              <Receipt className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(receitaSemMonofasico)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Base de cálculo PIS/COFINS
              {temMonofasico && (
                <span className="text-amber-600">
                  {' '}(com Monofásico: {formatCurrency(receitaComMonofasico)})
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Card Débito COFINS */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Débito COFINS</CardDescription>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(memoria.debitoCOFINS.valor)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              COFINS sobre receitas
            </p>
          </CardContent>
        </Card>

        {/* Card Crédito COFINS */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Crédito COFINS</CardDescription>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(memoria.totalCreditosCOFINS)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Créditos apurados
            </p>
          </CardContent>
        </Card>

        {/* Card COFINS a Pagar */}
        <Card className="border-l-4 border-l-cofins">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">COFINS a Pagar</CardDescription>
              <DollarSign className="h-4 w-4 text-cofins" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cofins">
              {formatCurrency(memoria.cofinsAPagar)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Débito - Crédito
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PIS */}
      <Card className="border-l-4 border-l-pis">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Memória de Cálculo - PIS</CardTitle>
              <CardDescription>
                Regime Não Cumulativo - Detalhamento de débitos e créditos
                {temMonofasico && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Aplicando {formatPercentage(config.percentualMonofasico)} de Regime Monofásico
                  </span>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportPISCOFINS}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DÉBITOS PIS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pis">Débitos de PIS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Descrição</TableHead>
                  <TableHead className="text-right">Base de Cálculo</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-amber-50 dark:bg-amber-950/20">
                  <TableCell className="font-medium">
                    PIS sobre Receita Bruta
                    {temMonofasico && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        (Base reduzida em {formatPercentage(config.percentualMonofasico)} por Monofásico)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.debitoPIS.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.debitoPIS.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.debitoPIS.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-amber-100 dark:bg-amber-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL DE DÉBITOS PIS</TableCell>
                  <TableCell className="text-right text-pis">{formatCurrency(memoria.totalDebitosPIS)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* CRÉDITOS PIS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Créditos de PIS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Descrição</TableHead>
                  <TableHead className="text-right">Base de Cálculo</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Crédito sobre Compras</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.creditoPISCompras.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.creditoPISCompras.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoPISCompras.valor)}</TableCell>
                </TableRow>
                
                {/* Créditos sobre despesas dinâmicas COM crédito */}
                {memoria.despesasComCredito && memoria.despesasComCredito.length > 0 ? (
                  memoria.despesasComCredito.map((despesa) => {
                    const creditoPIS = (despesa.valor * memoria.creditoPISDespesas.aliquota) / 100
                    return (
                      <TableRow key={despesa.id} className="bg-green-50 dark:bg-green-950/20">
                        <TableCell className="font-medium">Crédito sobre {despesa.descricao}</TableCell>
                        <TableCell className="text-right">{formatCurrency(despesa.valor)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(memoria.creditoPISDespesas.aliquota)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(creditoPIS)}</TableCell>
                      </TableRow>
                    )
                  })
                ) : null}
                
                <TableRow className="bg-green-100 dark:bg-green-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL DE CRÉDITOS PIS</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">{formatCurrency(memoria.totalCreditosPIS)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* RESULTADO PIS */}
          <div className="pt-4 border-t">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total de Débitos PIS</TableCell>
                  <TableCell className="text-right text-pis font-semibold">{formatCurrency(memoria.totalDebitosPIS)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">(-) Total de Créditos PIS</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                    ({formatCurrency(memoria.totalCreditosPIS)})
                  </TableCell>
                </TableRow>
                <TableRow className="bg-pis/10 dark:bg-pis/20">
                  <TableCell className="font-bold text-lg">PIS A PAGAR</TableCell>
                  <TableCell className="text-right font-bold text-xl text-pis">
                    {formatCurrency(memoria.pisAPagar)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* COFINS */}
      <Card className="border-l-4 border-l-cofins">
        <CardHeader>
          <CardTitle>Memória de Cálculo - COFINS</CardTitle>
          <CardDescription>
            Regime Não Cumulativo - Detalhamento de débitos e créditos
            {temMonofasico && (
              <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Aplicando {formatPercentage(config.percentualMonofasico)} de Regime Monofásico
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DÉBITOS COFINS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pis">Débitos de COFINS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Descrição</TableHead>
                  <TableHead className="text-right">Base de Cálculo</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-amber-50 dark:bg-amber-950/20">
                  <TableCell className="font-medium">
                    COFINS sobre Receita Bruta
                    {temMonofasico && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        (Base reduzida em {formatPercentage(config.percentualMonofasico)} por Monofásico)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.debitoCOFINS.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.debitoCOFINS.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.debitoCOFINS.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-amber-100 dark:bg-amber-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL DE DÉBITOS COFINS</TableCell>
                  <TableCell className="text-right text-pis">{formatCurrency(memoria.totalDebitosCOFINS)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* CRÉDITOS COFINS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Créditos de COFINS</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Descrição</TableHead>
                  <TableHead className="text-right">Base de Cálculo</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-green-50 dark:bg-green-950/20">
                  <TableCell className="font-medium">Crédito sobre Compras</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.creditoCOFINSCompras.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.creditoCOFINSCompras.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.creditoCOFINSCompras.valor)}</TableCell>
                </TableRow>
                
                {/* Créditos sobre despesas dinâmicas COM crédito */}
                {memoria.despesasComCredito && memoria.despesasComCredito.length > 0 ? (
                  memoria.despesasComCredito.map((despesa) => {
                    const creditoCOFINS = (despesa.valor * memoria.creditoCOFINSDespesas.aliquota) / 100
                    return (
                      <TableRow key={despesa.id} className="bg-green-50 dark:bg-green-950/20">
                        <TableCell className="font-medium">Crédito sobre {despesa.descricao}</TableCell>
                        <TableCell className="text-right">{formatCurrency(despesa.valor)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(memoria.creditoCOFINSDespesas.aliquota)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(creditoCOFINS)}</TableCell>
                      </TableRow>
                    )
                  })
                ) : null}
                
                <TableRow className="bg-green-100 dark:bg-green-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL DE CRÉDITOS COFINS</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">{formatCurrency(memoria.totalCreditosCOFINS)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* RESULTADO COFINS */}
          <div className="pt-4 border-t">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total de Débitos COFINS</TableCell>
                  <TableCell className="text-right text-pis font-semibold">{formatCurrency(memoria.totalDebitosCOFINS)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">(-) Total de Créditos COFINS</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                    ({formatCurrency(memoria.totalCreditosCOFINS)})
                  </TableCell>
                </TableRow>
                <TableRow className="bg-pis/10 dark:bg-pis/20">
                  <TableCell className="font-bold text-lg">COFINS A PAGAR</TableCell>
                  <TableCell className="text-right font-bold text-xl text-pis">
                    {formatCurrency(memoria.cofinsAPagar)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* TOTAL PIS + COFINS */}
      <Card className="border-l-4 border-l-pis bg-pis/5 dark:bg-pis/10">
        <CardHeader>
          <CardTitle className="text-2xl">Total PIS + COFINS</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-lg">PIS a Pagar</TableCell>
                <TableCell className="text-right font-semibold text-lg">{formatCurrency(memoria.pisAPagar)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-lg">COFINS a Pagar</TableCell>
                <TableCell className="text-right font-semibold text-lg">{formatCurrency(memoria.cofinsAPagar)}</TableCell>
              </TableRow>
              <TableRow className="bg-pis/20 dark:bg-pis/30">
                <TableCell className="font-bold text-xl">TOTAL PIS/COFINS A PAGAR</TableCell>
                <TableCell className="text-right font-bold text-2xl text-pis">
                  {formatCurrency(memoria.totalPISCOFINS)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
})
