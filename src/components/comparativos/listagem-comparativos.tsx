"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Copy, Trash2, Eye, Plus } from "lucide-react"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import { MESES_ANO, REGIMES_TRIBUTARIOS } from "@/types/comparativo"
import type { DadosComparativoMensal } from "@/types/comparativo"

interface ListagemComparativosProps {
  empresaId: string
  ano: number
  onEditar: (dados: DadosComparativoMensal) => void
  onDuplicar: (dados: DadosComparativoMensal) => void
  onAdicionar: () => void
}

export function ListagemComparativos({ 
  empresaId, 
  ano, 
  onEditar, 
  onDuplicar, 
  onAdicionar 
}: ListagemComparativosProps) {
  const { obterDadosPorEmpresa, removerDadoComparativo } = useRegimesTributariosStore()
  const [expandido, setExpandido] = useState<string | null>(null)

  // Filtrar dados da empresa e ano
  const dadosComparativos = obterDadosPorEmpresa(empresaId).filter(
    dado => dado.ano === ano
  )

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const calcularTotalImpostos = (dados: DadosComparativoMensal) => {
    return dados.icms + dados.pis + dados.cofins + dados.irpj + dados.csll + dados.iss + (dados.outros || 0)
  }

  const obterLabelMes = (mes: string) => {
    return MESES_ANO.find(m => m.value === mes)?.label || mes
  }

  const obterLabelRegime = (regime: string) => {
    return REGIMES_TRIBUTARIOS.find(r => r.value === regime)?.label || regime
  }

  const obterCorRegime = (regime: string) => {
    switch (regime) {
      case 'lucro_real':
        return 'bg-blue-100 text-blue-800'
      case 'lucro_presumido':
        return 'bg-green-100 text-green-800'
      case 'simples_nacional':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (dadosComparativos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dados Comparativos
          </CardTitle>
          <CardDescription>
            Dados mensais de impostos por regime tributário para {ano}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando dados de impostos para comparar os regimes tributários.
              </p>
              <Button onClick={onAdicionar}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Dados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Dados Comparativos ({dadosComparativos.length})
            </CardTitle>
            <CardDescription>
              Dados mensais de impostos por regime tributário para {ano}
            </CardDescription>
          </div>
          <Button onClick={onAdicionar}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Total Impostos</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosComparativos.map((dados) => {
                const totalImpostos = calcularTotalImpostos(dados)
                const percentual = (totalImpostos / dados.receita * 100).toFixed(2)
                
                return (
                  <TableRow key={dados.id}>
                    <TableCell className="font-medium">
                      {obterLabelMes(dados.mes)}
                    </TableCell>
                    <TableCell>
                      <Badge className={obterCorRegime(dados.regime)}>
                        {obterLabelRegime(dados.regime)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(dados.receita)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(totalImpostos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {percentual}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandido(expandido === dados.id ? null : dados.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditar(dados)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDuplicar(dados)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir os dados de {obterLabelRegime(dados.regime)} 
                                para {obterLabelMes(dados.mes)}/{dados.ano}?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={async () => {
                                  try {
                                    await removerDadoComparativo(dados.id)
                                  } catch (error) {
                                    console.error('Erro ao excluir dados:', error)
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Detalhes expandidos */}
          {expandido && (() => {
            const dados = dadosComparativos.find(d => d.id === expandido)
            if (!dados) return null

            return (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Detalhes - {obterLabelRegime(dados.regime)} | {obterLabelMes(dados.mes)}/{dados.ano}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Receita Bruta</p>
                      <p className="text-2xl font-bold">{formatarMoeda(dados.receita)}</p>
                    </div>
                    {dados.icms > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ICMS</p>
                        <p className="text-xl font-semibold">{formatarMoeda(dados.icms)}</p>
                      </div>
                    )}
                    {dados.pis > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">PIS</p>
                        <p className="text-xl font-semibold">{formatarMoeda(dados.pis)}</p>
                      </div>
                    )}
                    {dados.cofins > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">COFINS</p>
                        <p className="text-xl font-semibold">{formatarMoeda(dados.cofins)}</p>
                      </div>
                    )}
                    {dados.irpj > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">IRPJ</p>
                        <p className="text-xl font-semibold">{formatarMoeda(dados.irpj)}</p>
                      </div>
                    )}
                    {dados.csll > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CSLL</p>
                        <p className="text-xl font-semibold">{formatarMoeda(dados.csll)}</p>
                      </div>
                    )}
                    {dados.iss > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ISS</p>
                        <p className="text-xl font-semibold">{formatarMoeda(dados.iss)}</p>
                      </div>
                    )}
                    {(dados.outros || 0) > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {dados.regime === 'simples_nacional' ? 'DAS' : 'Outros'}
                        </p>
                        <p className="text-xl font-semibold">{formatarMoeda(dados.outros || 0)}</p>
                      </div>
                    )}
                  </div>
                  
                  {dados.observacoes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Observações</p>
                      <p className="text-sm mt-1">{dados.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}
        </div>
      </CardContent>
    </Card>
  )
}