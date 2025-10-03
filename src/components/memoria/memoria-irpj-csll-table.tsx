"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMemoriaIRPJCSLL } from "@/hooks/use-memoria-irpj-csll"
import { useTaxStore } from "@/hooks/use-tax-store"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { TrendingUp, DollarSign, PieChart, BarChart3 } from "lucide-react"

export const MemoriaIRPJCSLLTable = React.memo(function MemoriaIRPJCSLLTable() {
  const { config } = useTaxStore()
  const memoria = useMemoriaIRPJCSLL(config)

  return (
    <div className="space-y-6">
      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Lucro Antes IR/CS */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Lucro Antes IR/CS</CardDescription>
              <PieChart className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(memoria.lucroAntesIRCSLL)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Base para cálculo tributário
            </p>
          </CardContent>
        </Card>

        {/* Card Lucro Real */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">Lucro Real</CardDescription>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(memoria.lucroReal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Após adições e exclusões
            </p>
          </CardContent>
        </Card>

        {/* Card IRPJ */}
        <Card className="border-l-4 border-l-irpj">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">IRPJ a Pagar</CardDescription>
              <TrendingUp className="h-4 w-4 text-irpj" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-irpj">
              {formatCurrency(memoria.totalIRPJ)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alíquota base: {formatPercentage(config.irpjBase)}
            </p>
          </CardContent>
        </Card>

        {/* Card CSLL */}
        <Card className="border-l-4 border-l-csll">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">CSLL a Pagar</CardDescription>
              <DollarSign className="h-4 w-4 text-csll" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-csll">
              {formatCurrency(memoria.csll.valor)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alíquota: {formatPercentage(config.csllAliq)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-irpj">
        <CardHeader>
          <CardTitle>Memória de Cálculo - IRPJ e CSLL</CardTitle>
          <CardDescription>
            Lucro Real - Detalhamento completo do cálculo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BASE DE CÁLCULO */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-irpj">Apuração do Lucro Real</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">Receita Bruta de Vendas</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.receitaBruta)}</TableCell>
                </TableRow>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">(-) Custo das Mercadorias Vendidas (CMV)</TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    ({formatCurrency(memoria.cmv)})
                  </TableCell>
                </TableRow>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">(-) Despesas Operacionais</TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    ({formatCurrency(memoria.despesasOperacionais)})
                  </TableCell>
                </TableRow>
                <TableRow className="bg-blue-100 dark:bg-blue-900/30 font-semibold">
                  <TableCell>Lucro Antes do IRPJ/CSLL</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.lucroAntesIRCSLL)}</TableCell>
                </TableRow>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">(+) Adições</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.adicoes)}</TableCell>
                </TableRow>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">(-) Exclusões</TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    ({formatCurrency(memoria.exclusoes)})
                  </TableCell>
                </TableRow>
                <TableRow className="bg-irpj/10 dark:bg-irpj/20">
                  <TableCell className="font-bold text-lg">LUCRO REAL</TableCell>
                  <TableCell className="text-right font-bold text-xl text-irpj">
                    {formatCurrency(memoria.lucroReal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* IRPJ */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-irpj">Cálculo do IRPJ</h3>
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
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">IRPJ Base (15%)</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.irpjBase.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.irpjBase.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.irpjBase.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">
                    IRPJ Adicional (10%)
                    <div className="text-xs text-muted-foreground mt-1">
                      Sobre o que exceder R$ {formatCurrency(memoria.limiteAnual)} anual
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.irpjAdicional.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.irpjAdicional.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.irpjAdicional.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-blue-100 dark:bg-blue-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL IRPJ</TableCell>
                  <TableCell className="text-right text-irpj">{formatCurrency(memoria.totalIRPJ)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* CSLL */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-irpj">Cálculo da CSLL</h3>
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
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">CSLL sobre Lucro Real</TableCell>
                  <TableCell className="text-right">{formatCurrency(memoria.csll.base)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(memoria.csll.aliquota)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(memoria.csll.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-blue-100 dark:bg-blue-900/30 font-bold">
                  <TableCell colSpan={3}>TOTAL CSLL</TableCell>
                  <TableCell className="text-right text-irpj">{formatCurrency(memoria.csll.valor)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* RESULTADO FINAL */}
          <div className="pt-4 border-t">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-lg">Total IRPJ</TableCell>
                  <TableCell className="text-right font-semibold text-lg">{formatCurrency(memoria.totalIRPJ)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-lg">Total CSLL</TableCell>
                  <TableCell className="text-right font-semibold text-lg">{formatCurrency(memoria.csll.valor)}</TableCell>
                </TableRow>
                <TableRow className="bg-irpj/10 dark:bg-irpj/20">
                  <TableCell className="font-bold text-xl">TOTAL IRPJ + CSLL A PAGAR</TableCell>
                  <TableCell className="text-right font-bold text-2xl text-irpj">
                    {formatCurrency(memoria.totalIRPJCSLL)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* RESUMO INFORMATIVO */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Informações Complementares</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Regime: Lucro Real</li>
              <li>• IRPJ: 15% sobre o lucro real + 10% adicional sobre o que exceder R$ 20.000/mês</li>
              <li>• CSLL: 9% sobre o lucro real (empresas em geral)</li>
              <li>• Base de cálculo: Lucro antes do IRPJ/CSLL + Adições - Exclusões</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
