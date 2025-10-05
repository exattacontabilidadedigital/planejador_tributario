"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useTaxStore } from "@/hooks/use-tax-store"
import { CenariosErrorBoundary } from "@/components/cenarios-error-boundary"
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
  const { getCenario, updateCenario, aprovarCenario, fetchCenarios } = useCenariosStore()
  const { config, updateConfig } = useTaxStore()
  
  // Estados para hidratação
  const [mounted, setMounted] = useState(false)
  const [empresa, setEmpresa] = useState<any>(null)
  const [cenario, setCenario] = useState<any>(null)

  // Estados para edição de nome e descrição
  const [editandoNome, setEditandoNome] = useState(false)
  const [nomeEditavel, setNomeEditavel] = useState("")
  const [descricaoEditavel, setDescricaoEditavel] = useState("")
  const [loading, setLoading] = useState(true)

  // Effect para hidratação segura
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const empresaData = getEmpresa(id)
    const cenarioData = getCenario(cenarioId)
    
    setEmpresa(empresaData)
    setCenario(cenarioData)
    
    if (cenarioData) {
      setNomeEditavel(cenarioData.nome || "")
      setDescricaoEditavel(cenarioData.descricao || "")
    }
  }, [mounted, id, cenarioId, getEmpresa, getCenario])

  // Carrega config do cenário ao montar
  useEffect(() => {
    if (!mounted) return
    
    // Se não encontrou o cenário, tenta carregar da empresa
    if (!cenario) {
      console.log('Cenário não encontrado, carregando da empresa:', id)
      fetchCenarios(id)
    } else {
      updateConfig(cenario.configuracao)
      setNomeEditavel(cenario.nome)
      setDescricaoEditavel(cenario.descricao || "")
      setLoading(false)
    }
  }, [mounted, cenarioId, cenario, id, fetchCenarios, updateConfig])

  // Loading durante hidratação
  if (!mounted) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <p>Empresa não encontrada</p>
        <Button onClick={() => router.push("/empresas")}>Voltar</Button>
      </div>
    )
  }

  const handleSalvar = async () => {
    if (!cenario) {
      toast({
        title: "Erro",
        description: "Cenário não encontrado",
        variant: "destructive",
      })
      return
    }

    try {
      // Função para extrair mês do nome do cenário
      const extrairMesDoNome = (nomeCenario: string): number | null => {
        const mesesCompletos = [
          { nomes: ['janeiro', 'jan'], numero: 1 },
          { nomes: ['fevereiro', 'fev'], numero: 2 },
          { nomes: ['março', 'mar'], numero: 3 },
          { nomes: ['abril', 'abr'], numero: 4 },
          { nomes: ['maio', 'mai'], numero: 5 },
          { nomes: ['junho', 'jun'], numero: 6 },
          { nomes: ['julho', 'jul'], numero: 7 },
          { nomes: ['agosto', 'ago'], numero: 8 },
          { nomes: ['setembro', 'set'], numero: 9 },
          { nomes: ['outubro', 'out'], numero: 10 },
          { nomes: ['novembro', 'nov'], numero: 11 },
          { nomes: ['dezembro', 'dez'], numero: 12 },
        ]
        
        const nomeNormalizado = nomeCenario.toLowerCase()
        
        for (const mesInfo of mesesCompletos) {
          for (const nomeVariacao of mesInfo.nomes) {
            if (nomeNormalizado.includes(nomeVariacao)) {
              return mesInfo.numero
            }
          }
        }
        
        return null
      }

      // Preparar dados para atualização
      const dadosAtualizacao: any = {
        nome: nomeEditavel,
        descricao: descricaoEditavel,
        configuracao: config,
      }

      // Se o nome mudou, tentar extrair o mês e atualizar
      if (nomeEditavel !== cenario.nome) {
        const mesExtraido = extrairMesDoNome(nomeEditavel)
        if (mesExtraido) {
          dadosAtualizacao.mes = mesExtraido
          console.log(`🗓️ [CENÁRIO] Mês extraído do nome "${nomeEditavel}": ${mesExtraido}`)
          
          toast({
            title: "Mês atualizado",
            description: `Mês automaticamente alterado para ${mesExtraido} baseado no nome do cenário.`,
          })
        }
      }

      // Atualiza o cenário com a config atual e informações editadas
      await updateCenario(cenarioId, dadosAtualizacao)

      setEditandoNome(false)

      toast({
        title: "Cenário salvo!",
        description: `${nomeEditavel} foi atualizado.`,
      })
    } catch (error) {
      console.error('Erro ao salvar cenário:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar o cenário",
        variant: "destructive",
      })
    }
  }

  const handleSalvarEAprovar = async () => {
    if (!cenario) {
      toast({
        title: "Erro",
        description: "Cenário não encontrado",
        variant: "destructive",
      })
      return
    }

    try {
      // Função para extrair mês do nome do cenário (reutilizando a mesma lógica)
      const extrairMesDoNome = (nomeCenario: string): number | null => {
        const mesesCompletos = [
          { nomes: ['janeiro', 'jan'], numero: 1 },
          { nomes: ['fevereiro', 'fev'], numero: 2 },
          { nomes: ['março', 'mar'], numero: 3 },
          { nomes: ['abril', 'abr'], numero: 4 },
          { nomes: ['maio', 'mai'], numero: 5 },
          { nomes: ['junho', 'jun'], numero: 6 },
          { nomes: ['julho', 'jul'], numero: 7 },
          { nomes: ['agosto', 'ago'], numero: 8 },
          { nomes: ['setembro', 'set'], numero: 9 },
          { nomes: ['outubro', 'out'], numero: 10 },
          { nomes: ['novembro', 'nov'], numero: 11 },
          { nomes: ['dezembro', 'dez'], numero: 12 },
        ]
        
        const nomeNormalizado = nomeCenario.toLowerCase()
        
        for (const mesInfo of mesesCompletos) {
          for (const nomeVariacao of mesInfo.nomes) {
            if (nomeNormalizado.includes(nomeVariacao)) {
              return mesInfo.numero
            }
          }
        }
        
        return null
      }

      // Preparar dados para atualização
      const dadosAtualizacao: any = {
        nome: nomeEditavel,
        descricao: descricaoEditavel,
        configuracao: config,
      }

      // Se o nome mudou, tentar extrair o mês e atualizar
      if (nomeEditavel !== cenario.nome) {
        const mesExtraido = extrairMesDoNome(nomeEditavel)
        if (mesExtraido) {
          dadosAtualizacao.mes = mesExtraido
          console.log(`🗓️ [CENÁRIO] Mês extraído do nome "${nomeEditavel}": ${mesExtraido}`)
        }
      }

      // Primeiro salva as alterações
      await updateCenario(cenarioId, dadosAtualizacao)
      
      // Depois aprova o cenário
      await aprovarCenario(cenarioId)
      
      // Força um refresh dos cenários para garantir que o status seja atualizado
      await fetchCenarios(id)

      setEditandoNome(false)

      toast({
        title: "Cenário aprovado!",
        description: `${nomeEditavel} foi salvo e aprovado.`,
      })

      router.push(`/empresas/${id}/cenarios`)
    } catch (error) {
      console.error('Erro ao salvar e aprovar cenário:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar e aprovar o cenário",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = () => {
    const styles = {
      aprovado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      rascunho: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      arquivado: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    }
    
    const status = cenario?.status || 'rascunho'
    
    return (
      <span className={`text-xs px-3 py-1 rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <CenariosErrorBoundary>
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
            <Button onClick={handleSalvarEAprovar} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Salvar e Aprovar
            </Button>
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
    </CenariosErrorBoundary>
  )
}
