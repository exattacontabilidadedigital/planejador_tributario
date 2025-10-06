"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Calendar, 
  Eye, 
  Trash2, 
  TrendingUp,
  FileText,
  Plus,
  Edit
} from "lucide-react"
import { ComparativosAnaliseService } from "@/services/comparativos-analise-service"
import type { Comparativo } from "@/types/comparativo-analise"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ListaAnalisesComparativasProps {
  empresaId: string
  onNovo?: () => void
}

export function ListaAnalisesComparativas({ empresaId, onNovo }: ListaAnalisesComparativasProps) {
  const [comparativos, setComparativos] = useState<Comparativo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [comparativoParaExcluir, setComparativoParaExcluir] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const service = new ComparativosAnaliseService()

  useEffect(() => {
    console.log('🎯 [LISTA] useEffect disparado - empresaId:', empresaId)
    carregarComparativos()
  }, [empresaId])

  const carregarComparativos = async () => {
    try {
      console.log('🔄 [LISTA] Iniciando carregamento de comparativos para empresa:', empresaId)
      setCarregando(true)
      const dados = await service.listarComparativos(empresaId)
      console.log('📋 [LISTA] Comparativos recebidos:', {
        quantidade: dados.length,
        dados: dados.map(d => ({
          id: d.id,
          nome: d.nome,
          ano: d.ano,
          resultados: d.resultados
        }))
      })
      setComparativos(dados)
    } catch (error) {
      console.error('❌ [LISTA] Erro ao carregar comparativos:', error)
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as análises comparativas.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  const handleExcluir = async () => {
    if (!comparativoParaExcluir) return

    try {
      await service.excluirComparativo(comparativoParaExcluir)
      toast({
        title: "Análise excluída",
        description: "A análise comparativa foi removida com sucesso.",
      })
      await carregarComparativos()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a análise comparativa.",
        variant: "destructive",
      })
    } finally {
      setComparativoParaExcluir(null)
    }
  }

  const formatarData = (data: Date): string => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const getNomeRegime = (regime: string): string => {
    const nomes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime] || regime
  }

  const getBadgeVariant = (regime: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      'lucro_real': 'default',
      'lucro_presumido': 'default',
      'simples_nacional': 'secondary'
    }
    return variants[regime] || 'outline'
  }

  const getBadgeClassName = (regime: string): string => {
    const classes: Record<string, string> = {
      'lucro_real': 'bg-green-600 hover:bg-green-700 text-white',
      'lucro_presumido': 'bg-blue-600 hover:bg-blue-700 text-white',
      'simples_nacional': 'bg-purple-600 hover:bg-purple-700 text-white'
    }
    return classes[regime] || ''
  }

  console.log('🎨 [LISTA] Renderizando componente:', {
    carregando,
    quantidadeComparativos: comparativos.length,
    empresaId
  })

  if (carregando) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Carregando análises comparativas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (comparativos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo aos Comparativos</CardTitle>
          <CardDescription>
            Compare diferentes regimes tributários para sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <BarChart3 className="h-24 w-24 text-muted-foreground opacity-50" />
            <div className="text-center max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                Pronto para comparar regimes tributários?
              </h3>
              <p className="text-muted-foreground mb-4">
                Para começar, você precisa de dados de pelo menos dois regimes tributários.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                <strong>Primeiro passo:</strong> Crie cenários aprovados de Lucro Real.
              </p>
              <Button onClick={onNovo}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Comparativos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Análises Comparativas</h2>
            <p className="text-muted-foreground">
              {comparativos.length} {comparativos.length === 1 ? 'análise encontrada' : 'análises encontradas'}
            </p>
          </div>
          {onNovo && (
            <Button onClick={onNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Análise
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparativos.map((comparativo) => {
            // Adaptar para ambas estruturas (antiga e nova)
            const resultados = comparativo.resultados as any
            const analise = resultados?.analise || resultados?.vencedor
            const regimeVencedor = analise?.regimeMaisVantajoso || analise?.regime
            const economia = analise?.economiaAnual || analise?.economia || 0

            console.log('🎴 [CARD] Renderizando card:', {
              id: comparativo.id,
              nome: comparativo.nome,
              temResultados: !!resultados,
              temAnalise: !!analise,
              regimeVencedor,
              economia
            })

            return (
              <Card key={comparativo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {comparativo.nome}
                      </CardTitle>
                      {comparativo.descricao && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {comparativo.descricao}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Regime Vencedor */}
                  {regimeVencedor && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <Badge variant={getBadgeVariant(regimeVencedor)} className={getBadgeClassName(regimeVencedor)}>
                        {getNomeRegime(regimeVencedor)}
                      </Badge>
                      {economia > 0 && (
                        <span className="text-sm text-green-600 font-semibold">
                          {formatarMoeda(economia)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Período */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {comparativo.ano 
                        ? `Ano ${comparativo.ano}`
                        : `${comparativo.periodoInicio} - ${comparativo.periodoFim}`
                      }
                    </span>
                  </div>

                  {/* Data de criação */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Criado em {formatarData(comparativo.criadoEm)}</span>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/empresas/${empresaId}/comparativos/${comparativo.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/empresas/${empresaId}/comparativos/${comparativo.id}/editar`)}
                      title="Editar análise"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setComparativoParaExcluir(comparativo.id)}
                      title="Excluir análise"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!comparativoParaExcluir} onOpenChange={() => setComparativoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta análise comparativa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
