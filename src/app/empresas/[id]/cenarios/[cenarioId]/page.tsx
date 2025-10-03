"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useTaxStore } from "@/hooks/use-tax-store"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Save } from "lucide-react"
import { ConfigPanel } from "@/components/config/config-panel"
import { DRETable } from "@/components/dre/dre-table"
import { MemoriaPISCOFINSTable } from "@/components/memoria/memoria-pis-cofins-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function EditarCenarioPage({
  params,
}: {
  params: Promise<{ id: string; cenarioId: string }>
}) {
  const { id, cenarioId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getEmpresa } = useEmpresasStore()
  const { getCenario, updateCenario, aprovarCenario } = useCenariosStore()
  const { config, updateConfig } = useTaxStore()
  
  const empresa = getEmpresa(id)
  const cenario = getCenario(cenarioId)

  // Carrega config do cenário ao montar
  useEffect(() => {
    if (cenario) {
      updateConfig(cenario.config)
    }
  }, [cenarioId])

  if (!empresa || !cenario) {
    return (
      <div className="container mx-auto py-8">
        <p>{!empresa ? "Empresa não encontrada" : "Cenário não encontrado"}</p>
        <Button onClick={() => router.push("/empresas")}>Voltar</Button>
      </div>
    )
  }

  const handleSalvar = () => {
    // Atualiza o cenário com a config atual
    updateCenario(cenarioId, {
      config,
    })

    toast({
      title: "Cenário salvo!",
      description: `${cenario.nome} foi atualizado.`,
    })
  }

  const handleSalvarEAprovar = () => {
    // Atualiza e aprova
    updateCenario(cenarioId, {
      config,
    })
    aprovarCenario(cenarioId)

    toast({
      title: "Cenário aprovado!",
      description: `${cenario.nome} foi salvo e aprovado.`,
    })

    router.push(`/empresas/${id}/cenarios`)
  }

  const getStatusBadge = () => {
    const styles = {
      aprovado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      rascunho: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      arquivado: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    }
    
    return (
      <span className={`text-xs px-3 py-1 rounded-full ${styles[cenario.status]}`}>
        {cenario.status.charAt(0).toUpperCase() + cenario.status.slice(1)}
      </span>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/empresas/${id}/cenarios`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Cenários
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {cenario.nome}
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground mt-1">
              {empresa.nome} • {cenario.periodo.tipo} • {cenario.periodo.ano}
            </p>
            {cenario.descricao && (
              <p className="text-sm text-muted-foreground mt-2">
                {cenario.descricao}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSalvar} variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Rascunho
            </Button>
            {cenario.status === 'rascunho' && (
              <Button onClick={handleSalvarEAprovar} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Salvar e Aprovar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Abas */}
      <Tabs defaultValue="configuracoes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="pis-cofins">PIS/COFINS</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracoes" className="mt-6">
          <ConfigPanel />
        </TabsContent>

        <TabsContent value="dre" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Demonstração do Resultado do Exercício</CardTitle>
            </CardHeader>
            <CardContent>
              <DRETable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pis-cofins" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Memória de Cálculo PIS/COFINS</CardTitle>
            </CardHeader>
            <CardContent>
              <MemoriaPISCOFINSTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aviso de salvamento automático */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> As alterações são salvas automaticamente no navegador. 
            Clique em "Salvar Rascunho" para persistir as mudanças no cenário, ou 
            "Salvar e Aprovar" para finalizar e aprovar o cenário.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
