"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useTaxStore } from "@/hooks/use-tax-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle2, Save, Edit2 } from "lucide-react"
import { ConfigPanel } from "@/components/config/config-panel"
import { DRETable } from "@/components/dre/dre-table"
import { MemoriaPISCOFINSTable } from "@/components/memoria/memoria-pis-cofins-table"
import { MemoriaICMSTable } from "@/components/memoria/memoria-icms-table"
import { MemoriaIRPJCSLLTable } from "@/components/memoria/memoria-irpj-csll-table"
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

  // Estados para edição de nome e descrição
  const [editandoNome, setEditandoNome] = useState(false)
  const [nomeEditavel, setNomeEditavel] = useState(cenario?.nome || "")
  const [descricaoEditavel, setDescricaoEditavel] = useState(cenario?.descricao || "")

  // Carrega config do cenário ao montar
  useEffect(() => {
    if (cenario) {
      updateConfig(cenario.config)
      setNomeEditavel(cenario.nome)
      setDescricaoEditavel(cenario.descricao || "")
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
    // Atualiza o cenário com a config atual e informações editadas
    updateCenario(cenarioId, {
      nome: nomeEditavel,
      descricao: descricaoEditavel,
      config,
    })

    setEditandoNome(false)

    toast({
      title: "Cenário salvo!",
      description: `${nomeEditavel} foi atualizado.`,
    })
  }

  const handleSalvarEAprovar = () => {
    // Atualiza e aprova
    updateCenario(cenarioId, {
      nome: nomeEditavel,
      descricao: descricaoEditavel,
      config,
    })
    aprovarCenario(cenarioId)

    setEditandoNome(false)

    toast({
      title: "Cenário aprovado!",
      description: `${nomeEditavel} foi salvo e aprovado.`,
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
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3">
              {editandoNome ? (
                <Input
                  value={nomeEditavel}
                  onChange={(e) => setNomeEditavel(e.target.value)}
                  className="text-3xl font-bold h-auto py-2 px-3 max-w-2xl"
                  placeholder="Nome do cenário"
                  autoFocus
                />
              ) : (
                <h1 className="text-3xl font-bold">
                  {nomeEditavel}
                </h1>
              )}
              {!editandoNome && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditandoNome(true)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground mt-1">
              {empresa.nome} • {cenario.periodo.tipo} • {cenario.periodo.ano}
            </p>
            {editandoNome ? (
              <Textarea
                value={descricaoEditavel}
                onChange={(e) => setDescricaoEditavel(e.target.value)}
                className="mt-2 max-w-2xl"
                placeholder="Descrição do cenário (opcional)"
                rows={2}
              />
            ) : (
              descricaoEditavel && (
                <p className="text-sm text-muted-foreground mt-2">
                  {descricaoEditavel}
                </p>
              )
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
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="configuracoes">⚙️ Configurações</TabsTrigger>
          <TabsTrigger value="icms">📦 ICMS</TabsTrigger>
          <TabsTrigger value="pis-cofins">📊 PIS/COFINS</TabsTrigger>
          <TabsTrigger value="irpj-csll">💼 IRPJ/CSLL</TabsTrigger>
          <TabsTrigger value="dre">📈 DRE</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracoes" className="mt-6">
          <ConfigPanel />
        </TabsContent>

        <TabsContent value="icms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Memória de Cálculo ICMS</CardTitle>
            </CardHeader>
            <CardContent>
              <MemoriaICMSTable />
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

        <TabsContent value="irpj-csll" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Memória de Cálculo IRPJ/CSLL</CardTitle>
            </CardHeader>
            <CardContent>
              <MemoriaIRPJCSLLTable />
            </CardContent>
          </Card>
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
