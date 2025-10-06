"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useComparativosAnaliseStore } from "@/stores/comparativos-analise-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import type { Comparativo } from "@/types/comparativo-analise"

export default function EditarComparativoPage({
  params,
}: {
  params: Promise<{ id: string; comparativoId: string }>
}) {
  const { id: empresaId, comparativoId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getEmpresa } = useEmpresasStore()
  const [isMounted, setIsMounted] = useState(false)
  
  const { 
    comparativoAtual, 
    loading, 
    erro, 
    obterComparativo,
    atualizarComparativo
  } = useComparativosAnaliseStore()

  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (comparativoId) {
      obterComparativo(comparativoId)
    }
  }, [comparativoId, obterComparativo])

  useEffect(() => {
    if (comparativoAtual) {
      setNome(comparativoAtual.nome)
      setDescricao(comparativoAtual.descricao || "")
    }
  }, [comparativoAtual])

  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome é obrigatório",
        variant: "destructive"
      })
      return
    }

    setSalvando(true)

    try {
      const resultado = await atualizarComparativo(comparativoId, { 
        nome: nome.trim(), 
        descricao: descricao.trim() || undefined 
      })

      if (resultado) {
        toast({
          title: "Sucesso",
          description: "Análise comparativa atualizada com sucesso",
        })

        router.push(`/empresas/${empresaId}/comparativos/${comparativoId}`)
      } else {
        throw new Error("Erro ao atualizar comparativo")
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setSalvando(false)
    }
  }

  const empresa = isMounted ? getEmpresa(empresaId) : null

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (erro || !comparativoAtual) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-red-600 mb-4">
                {erro || "Análise comparativa não encontrada"}
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/empresas/${empresaId}/comparativos`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Comparativos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push(`/empresas/${empresaId}/comparativos/${comparativoId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Análise Comparativa</h1>
            {empresa && (
              <p className="text-sm text-muted-foreground">{empresa.razaoSocial}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Análise</CardTitle>
          <CardDescription>
            Edite o nome e descrição da análise comparativa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Análise *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Comparativo Anual 2025"
              disabled={salvando}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Adicione uma descrição opcional..."
              rows={4}
              disabled={salvando}
            />
          </div>

          {/* Informações somente leitura */}
          <div className="space-y-2 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Ano</Label>
                <p className="font-medium">{comparativoAtual.ano}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Criado em</Label>
                <p className="font-medium">
                  {new Date(comparativoAtual.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSalvar}
              disabled={salvando || !nome.trim()}
              className="flex-1"
            >
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/empresas/${empresaId}/comparativos/${comparativoId}`)}
              disabled={salvando}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aviso sobre limitações */}
      <Card className="mt-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardContent className="py-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Nota:</strong> Esta funcionalidade permite editar apenas o nome e descrição da análise. 
            Para alterar os dados dos regimes tributários ou refazer a análise, será necessário criar uma nova análise comparativa.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
