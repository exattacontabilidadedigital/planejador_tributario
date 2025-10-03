"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDRECalculation } from "@/hooks/use-dre-calculation"
import { useTaxStore } from "@/hooks/use-tax-store"
import { usePDFExport } from "@/hooks/use-pdf-export"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Download, TrendingUp, TrendingDown } from "lucide-react"

export const DRETable = React.memo(function DRETable() {
  const { config } = useTaxStore()
  const dre = useDRECalculation(config)
  const { exportDRE } = usePDFExport()

  // Filtrar despesas dinâmicas tipo "despesa"
  const despesasDinamicas = (config.despesasDinamicas || []).filter(d => d.tipo === 'despesa')

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-lucro">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
              <CardDescription>
                Demonstrativo completo do resultado financeiro com regime de competência
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportDRE}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Descrição</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
                <TableHead className="text-right">% Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* RECEITA BRUTA */}
              <TableRow className="bg-green-50 dark:bg-green-950/20">
                <TableCell className="font-bold text-lg">RECEITA BRUTA DE VENDAS</TableCell>
                <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(dre.receitaBrutaVendas)}
                </TableCell>
                <TableCell className="text-right">100,00%</TableCell>
              </TableRow>

              {/* DEDUÇÕES */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="font-semibold text-sm uppercase text-muted-foreground pt-4">
                  Deduções da Receita
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) ICMS sobre Vendas</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.deducoes.icms)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.deducoes.icms / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) PIS</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.deducoes.pis)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.deducoes.pis / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) COFINS</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.deducoes.cofins)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.deducoes.cofins / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) ISS</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.deducoes.iss)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.deducoes.iss / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>

              {/* RECEITA LÍQUIDA */}
              <TableRow className="bg-blue-50 dark:bg-blue-950/20 font-semibold">
                <TableCell className="text-lg">(=) RECEITA LÍQUIDA</TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400">
                  {formatCurrency(dre.receitaLiquida)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.receitaLiquida / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>

              {/* CMV */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="font-semibold text-sm uppercase text-muted-foreground pt-4">
                  Custos
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>(-) Custo das Mercadorias Vendidas (CMV)</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.cmv)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.cmv / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>

              {/* LUCRO BRUTO */}
              <TableRow className="bg-green-100 dark:bg-green-900/30 font-bold">
                <TableCell className="text-lg">(=) LUCRO BRUTO</TableCell>
                <TableCell className="text-right text-lucro">
                  {formatCurrency(dre.lucroBruto)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatPercentage(dre.margemBruta)}
                </TableCell>
              </TableRow>

              {/* DESPESAS OPERACIONAIS */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="font-semibold text-sm uppercase text-muted-foreground pt-4">
                  Despesas Operacionais
                </TableCell>
              </TableRow>
              
              {/* Despesas Dinâmicas Cadastradas */}
              {despesasDinamicas.length > 0 ? (
                <>
                  {despesasDinamicas.map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell className="pl-8">
                        (-) {despesa.descricao}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({despesa.credito === 'com-credito' ? 'COM crédito' : 'SEM crédito'})
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(despesa.valor)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((despesa.valor / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground italic py-8">
                    Nenhuma despesa cadastrada. Adicione despesas em Configurações → PIS/COFINS
                  </TableCell>
                </TableRow>
              )}
              
              {/* Despesas Fixas do Sistema (se houver valores) */}
              {(dre.despesasOperacionais.salariosPF > 0 || 
                dre.despesasOperacionais.energia > 0 ||
                dre.despesasOperacionais.alugueis > 0 ||
                dre.despesasOperacionais.arrendamento > 0 ||
                dre.despesasOperacionais.frete > 0 ||
                dre.despesasOperacionais.depreciacao > 0 ||
                dre.despesasOperacionais.combustiveis > 0 ||
                dre.despesasOperacionais.valeTransporte > 0 ||
                dre.despesasOperacionais.valeAlimentacao > 0 ||
                dre.despesasOperacionais.combustivelPasseio > 0 ||
                dre.despesasOperacionais.outras > 0) && (
                <>
                  {dre.despesasOperacionais.salariosPF > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Salários e Encargos (PF)</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.salariosPF)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.salariosPF / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.energia > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Energia Elétrica</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.energia)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.energia / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.alugueis > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Aluguéis</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.alugueis)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.alugueis / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.arrendamento > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Arrendamento Mercantil</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.arrendamento)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.arrendamento / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.frete > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Frete e Armazenagem</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.frete)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.frete / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.depreciacao > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Depreciação de Máquinas</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.depreciacao)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.depreciacao / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.combustiveis > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Combustíveis (Empresariais)</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.combustiveis)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.combustiveis / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.valeTransporte > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Vale Transporte</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.valeTransporte)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.valeTransporte / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.valeAlimentacao > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Vale Alimentação</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.valeAlimentacao)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.valeAlimentacao / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.combustivelPasseio > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Combustível Passeio</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.combustivelPasseio)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.combustivelPasseio / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                  {dre.despesasOperacionais.outras > 0 && (
                    <TableRow>
                      <TableCell className="pl-8">(-) Outras Despesas</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        ({formatCurrency(dre.despesasOperacionais.outras)})
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage((dre.despesasOperacionais.outras / dre.receitaBrutaVendas) * 100)}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
              
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>Total de Despesas Operacionais</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.despesasOperacionais.total)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.despesasOperacionais.total / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>

              {/* LUCRO ANTES IRPJ/CSLL */}
              <TableRow className="bg-blue-100 dark:bg-blue-900/30 font-bold">
                <TableCell className="text-lg">(=) LUCRO ANTES DO IRPJ/CSLL</TableCell>
                <TableCell className="text-right text-irpj">
                  {formatCurrency(dre.lucroAntesIRCSLL)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.lucroAntesIRCSLL / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>

              {/* IMPOSTOS SOBRE LUCRO */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="font-semibold text-sm uppercase text-muted-foreground pt-4">
                  Impostos sobre o Lucro
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) IRPJ</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.impostos.irpj)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.impostos.irpj / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">(-) CSLL</TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(dre.impostos.csll)})
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage((dre.impostos.csll / dre.receitaBrutaVendas) * 100)}
                </TableCell>
              </TableRow>

              {/* LUCRO LÍQUIDO */}
              <TableRow className="bg-lucro/20 dark:bg-lucro/30 font-bold border-t-2 border-lucro">
                <TableCell className="text-xl py-4">LUCRO LÍQUIDO DO EXERCÍCIO</TableCell>
                <TableCell className="text-right text-2xl text-lucro py-4">
                  {formatCurrency(dre.lucroLiquido)}
                </TableCell>
                <TableCell className="text-right text-xl font-bold py-4">
                  {formatPercentage(dre.margemLiquida)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* INDICADORES */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatPercentage(dre.margemBruta)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lucro Bruto / Receita Bruta
                </p>
              </CardContent>
            </Card>

            <Card className="bg-lucro/10 dark:bg-lucro/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-lucro">
                  {formatPercentage(dre.margemLiquida)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lucro Líquido / Receita Bruta
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
