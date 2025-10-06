"use client"

import { useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import { MESES_ANO, REGIMES_TRIBUTARIOS } from "@/types/comparativo"
import { Trash2, Copy, Edit, Calendar, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ListagemDadosComparativosProps {
  empresaId: string
  ano: number
  onEditarDado?: (dado: any) => void
  onDuplicarDado?: (dado: any) => void
}

export function ListagemDadosComparativos({ empresaId, ano, onEditarDado, onDuplicarDado }: ListagemDadosComparativosProps) {
  const { toast } = useToast()
  const { obterDadosPorEmpresa, removerDadoComparativo, limparDadosCorrempidos, adicionarDadoComparativo } = useRegimesTributariosStore()

  // Limpar dados corrompidos na inicialização
  useEffect(() => {
    try {
      limparDadosCorrempidos()
    } catch (error) {
      console.error('Erro ao limpar dados corrompidos:', error)
    }
  }, [limparDadosCorrempidos])

  const dadosEmpresa = useMemo(() => {
    try {
      return obterDadosPorEmpresa(empresaId)
        .filter(dado => {
          // Validar se o dado tem as propriedades necessárias
          if (!dado || typeof dado !== 'object') return false
          if (!dado.ano || dado.ano !== ano) return false
          if (!dado.criadoEm) return false
          
          // Validar se a data é válida
          try {
            const date = dado.criadoEm instanceof Date ? dado.criadoEm : new Date(dado.criadoEm)
            if (isNaN(date.getTime())) return false
          } catch {
            return false
          }
          
          return true
        })
        .sort((a, b) => {
          // Ordenar por mês (Janeiro = 1, Dezembro = 12)
          const ordenMesA = MESES_ANO.findIndex(m => m.value === a.mes) + 1
          const ordenMesB = MESES_ANO.findIndex(m => m.value === b.mes) + 1
          
          if (ordenMesA !== ordenMesB) {
            return ordenMesA - ordenMesB
          }
          
          // Se mesmo mês, ordenar por regime
          return a.regime.localeCompare(b.regime)
        })
    } catch (error) {
      console.error('Erro ao processar dados da empresa:', error)
      return []
    }
  }, [empresaId, ano, obterDadosPorEmpresa])

  const handleRemover = (id: string, mes: string, regime: string) => {
    const nomeRegime = REGIMES_TRIBUTARIOS.find(r => r.value === regime)?.label || regime
    const nomeMes = MESES_ANO.find(m => m.value === mes)?.label || mes
    
    const confirmMessage = `⚠️ CONFIRMAÇÃO DE EXCLUSÃO
    
Você está prestes a remover permanentemente:
• Regime: ${nomeRegime}
• Período: ${nomeMes}
• Esta ação não pode ser desfeita

Tem certeza que deseja continuar?`
    
    if (confirm(confirmMessage)) {
      try {
        removerDadoComparativo(id)
        toast({
          title: "✅ Dados removidos",
          description: `Dados de ${nomeRegime} para ${nomeMes} foram removidos com sucesso.`,
        })
      } catch (error) {
        console.error('Erro ao remover dados:', error)
        toast({
          title: "❌ Erro ao remover",
          description: "Ocorreu um erro ao remover os dados. Tente novamente.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDuplicar = (dado: any) => {
    const nomeRegime = REGIMES_TRIBUTARIOS.find(r => r.value === dado.regime)?.label || dado.regime
    const nomeMes = MESES_ANO.find(m => m.value === dado.mes)?.label || dado.mes
    
    try {
      // Criar uma cópia dos dados removendo id e datas de controle
      const dadosDuplicados = {
        empresaId: dado.empresaId,
        mes: dado.mes,
        ano: dado.ano,
        regime: dado.regime,
        receita: dado.receita,
        icms: dado.icms || 0,
        pis: dado.pis || 0,
        cofins: dado.cofins || 0,
        irpj: dado.irpj || 0,
        csll: dado.csll || 0,
        iss: dado.iss || 0,
        outros: dado.outros || 0,
        observacoes: `${dado.observacoes || ''} (Cópia)`
      }
      
      if (onDuplicarDado) {
        // Se há callback, passar os dados para o componente pai
        onDuplicarDado(dadosDuplicados)
        toast({
          title: "Preparando duplicação",
          description: `Dados de ${nomeRegime} para ${nomeMes} carregados para duplicação. Modifique conforme necessário.`,
        })
      } else {
        // Senão, duplicar diretamente (não recomendado para evitar conflitos)
        toast({
          title: "Duplicação não disponível",
          description: "Use o modo de edição para duplicar dados com segurança.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao duplicar dados:', error)
      toast({
        title: "Erro ao duplicar",
        description: "Ocorreu um erro ao duplicar os dados. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEditar = (dado: any) => {
    const nomeRegime = REGIMES_TRIBUTARIOS.find(r => r.value === dado.regime)?.label || dado.regime
    const nomeMes = MESES_ANO.find(m => m.value === dado.mes)?.label || dado.mes
    
    if (onEditarDado) {
      onEditarDado(dado)
      toast({
        title: "✏️ Modo edição ativado",
        description: `Editando dados de ${nomeRegime} para ${nomeMes}. Modifique os campos conforme necessário.`,
      })
    } else {
      toast({
        title: "⚠️ Função não implementada",
        description: "A função de edição não foi configurada corretamente.",
        variant: "destructive",
      })
    }
  }

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const calcularTotalImpostos = (dado: any) => {
    if (dado.regime === 'simples_nacional') {
      return dado.outros || 0 // DAS do Simples Nacional
    }
    
    return (dado.icms || 0) + 
           (dado.pis || 0) + 
           (dado.cofins || 0) + 
           (dado.irpj || 0) + 
           (dado.csll || 0) + 
           (dado.iss || 0) + 
           (dado.outros || 0)
  }

  if (dadosEmpresa.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dados Cadastrados - {ano}
        </CardTitle>
        <CardDescription>
          Listagem de todos os dados comparativos cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <TrendingUp className="h-16 w-16 text-muted-foreground opacity-50" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Nenhum dado cadastrado
            </h3>
            <p className="text-muted-foreground">
              Você ainda não cadastrou dados comparativos para {ano}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Dados Cadastrados - {ano}
        </CardTitle>
        <CardDescription>
          {dadosEmpresa.length} {dadosEmpresa.length === 1 ? 'registro encontrado' : 'registros encontrados'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Total Impostos</TableHead>
                <TableHead className="text-right">% sobre Receita</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosEmpresa.map((dado) => {
                const nomeRegime = REGIMES_TRIBUTARIOS.find(r => r.value === dado.regime)?.label || dado.regime
                const nomeMes = MESES_ANO.find(m => m.value === dado.mes)?.label || dado.mes
                const totalImpostos = calcularTotalImpostos(dado)
                const percentualImpostos = dado.receita > 0 ? (totalImpostos / dado.receita) * 100 : 0
                
                return (
                  <TableRow key={dado.id}>
                    <TableCell className="font-medium">
                      {nomeMes}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          dado.regime === 'lucro_real' ? 'destructive' :
                          dado.regime === 'lucro_presumido' ? 'default' :
                          'secondary'
                        }
                      >
                        {nomeRegime}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatarMoeda(dado.receita)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatarMoeda(totalImpostos)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${
                        percentualImpostos < 10 ? 'text-green-600' :
                        percentualImpostos < 20 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {percentualImpostos.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          // Validação mais robusta da data
                          let date: Date
                          
                          if (dado.criadoEm instanceof Date) {
                            date = dado.criadoEm
                          } else if (typeof dado.criadoEm === 'string' || typeof dado.criadoEm === 'number') {
                            date = new Date(dado.criadoEm)
                          } else {
                            return 'Data não disponível'
                          }
                          
                          // Verificar se a data é válida
                          if (isNaN(date.getTime()) || date.getTime() === 0) {
                            return 'Data inválida'
                          }
                          
                          // Verificar se a data não é muito antiga ou futura (sanity check)
                          const now = new Date()
                          const oneYearAgo = new Date(now.getFullYear() - 1, 0, 1)
                          const oneYearFromNow = new Date(now.getFullYear() + 1, 11, 31)
                          
                          if (date < oneYearAgo || date > oneYearFromNow) {
                            return 'Data inválida'
                          }
                          
                          return new Intl.DateTimeFormat('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }).format(date)
                        } catch (error) {
                          console.error('Erro ao formatar data:', error, dado.criadoEm)
                          return 'Erro na data'
                        }
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditar(dado)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Editar dados"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicar(dado)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Duplicar dados"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemover(dado.id, dado.mes, dado.regime)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Remover dados"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        
        {dadosEmpresa.length > 0 && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm mb-3 text-muted-foreground">💡 Como usar as ações:</h4>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                  <Edit className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-700">Editar</p>
                  <p className="text-muted-foreground text-xs">Modifica os dados existentes mantendo o mesmo registro</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                  <Copy className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-700">Duplicar</p>
                  <p className="text-muted-foreground text-xs">Cria uma cópia para editar mês/regime diferente</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-700">Excluir</p>
                  <p className="text-muted-foreground text-xs">Remove permanentemente com confirmação</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}