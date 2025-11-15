"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useComparativosAnaliseStore } from "@/stores/comparativos-analise-store"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { VisualizacaoComparativo } from "@/components/comparativos/visualizacao-comparativo"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ComparativoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string; comparativoId: string }>
}) {
  const { id: empresaId, comparativoId } = use(params)
  const router = useRouter()
  const { getEmpresa } = useEmpresasStore()
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  
  const { 
    comparativoAtual, 
    loading, 
    erro, 
    obterComparativo,
    recarregarDadosComparativo
  } = useComparativosAnaliseStore()
  
  const handleAtualizar = async () => {
    try {
      await recarregarDadosComparativo(comparativoId)
      toast({
        title: "Relatório atualizado!",
        description: "Os dados foram recarregados do banco de dados.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (comparativoId) {
      console.log('🔍 [PAGE] Carregando comparativo com ID:', comparativoId)
      console.log('🔍 [PAGE] Empresa ID:', empresaId)
      obterComparativo(comparativoId)
    }
  }, [comparativoId, obterComparativo])

  // Durante SSR/hidratação, renderiza estado consistente
  const empresa = isMounted ? getEmpresa(empresaId) : null

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push(empresa ? `/empresas/${empresaId}/comparativos` : "/empresas")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {empresa ? "Análise Comparativa" : "Empresa não encontrada"}
            </h1>
            {empresa && <p className="text-muted-foreground">{empresa.nome}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {comparativoAtual && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAtualizar}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Relatório
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Conteúdo */}
      {!empresa ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Empresa não encontrada</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando análise...</p>
            </div>
          </CardContent>
        </Card>
      ) : erro ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-destructive">{erro}</p>
              <Button 
                variant="outline" 
                onClick={() => obterComparativo(comparativoId)}
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : comparativoAtual ? (
        <VisualizacaoComparativo comparativo={comparativoAtual} />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Comparativo não encontrado
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/empresas/${empresaId}/comparativos`)}
              >
                Voltar aos comparativos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
