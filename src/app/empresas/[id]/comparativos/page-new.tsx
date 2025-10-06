"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { FormularioComparativos } from "@/components/comparativos/formulario-comparativos"
import { VisualizacaoComparativa } from "@/components/comparativos/visualizacao-comparativa"
import { useComparativosIntegrados } from "@/hooks/use-comparativos-integrados"

export default function ComparativosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: empresaId } = use(params)
  const router = useRouter()
  const { getEmpresa } = useEmpresasStore()
  const empresa = getEmpresa(empresaId)

  // Estado para ano selecionado
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025)
  const [mounted, setMounted] = useState(false)

  // Hook para dados integrados
  const {
    resumoComparativoCompleto,
    temDadosLucroReal,
    temDadosOutrosRegimes,
    temComparacao,
    mesesComDados
  } = useComparativosIntegrados({
    empresaId,
    ano: anoSelecionado
  })

  // Marcar componente como montado e definir ano atual
  useEffect(() => {
    setMounted(true)
    const anoAtual = new Date().getFullYear()
    setAnoSelecionado(anoAtual)
  }, [])

  // Anos disponíveis para seleção
  const anosDisponiveis = [2023, 2024, 2025, 2026]

  if (!empresa) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/empresas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/empresas/${empresaId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Comparativos</h1>
            <p className="text-muted-foreground">{empresa.nome}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mounted && (
            <Select
              value={anoSelecionado.toString()}
              onValueChange={(value) => setAnoSelecionado(Number(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anosDisponiveis.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <ThemeToggle />
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Real</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {temDadosLucroReal ? '✓' : '○'}
            </div>
            <p className="text-xs text-muted-foreground">
              {temDadosLucroReal ? 'Dados disponíveis' : 'Sem dados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outros Regimes</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {temDadosOutrosRegimes ? '✓' : '○'}
            </div>
            <p className="text-xs text-muted-foreground">
              {temDadosOutrosRegimes ? 'Dados inseridos' : 'Adicione dados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comparação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {temComparacao ? '✓' : '○'}
            </div>
            <p className="text-xs text-muted-foreground">
              {temComparacao ? 'Pronto para comparar' : 'Insuficiente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mesesComDados.length}</div>
            <p className="text-xs text-muted-foreground">
              {mesesComDados.length === 1 ? 'mês com dados' : 'meses com dados'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="comparacao" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          <TabsTrigger value="adicionar">Adicionar Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="comparacao" className="space-y-6">
          {temComparacao ? (
            <VisualizacaoComparativa 
              empresaId={empresaId} 
              ano={anoSelecionado} 
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo aos Comparativos</CardTitle>
                <CardDescription>
                  Compare diferentes regimes tributários para sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <BarChart3 className="h-24 w-24 text-muted-foreground opacity-50" />
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-semibold mb-2">
                        Pronto para comparar regimes tributários?
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Para começar, você precisa de dados de pelo menos dois regimes tributários. 
                        {!temDadosLucroReal && (
                          <span className="block mt-2">
                            <strong>Primeiro passo:</strong> Crie cenários aprovados de Lucro Real.
                          </span>
                        )}
                        {temDadosLucroReal && !temDadosOutrosRegimes && (
                          <span className="block mt-2">
                            <strong>Próximo passo:</strong> Adicione dados de Lucro Presumido ou Simples Nacional.
                          </span>
                        )}
                      </p>
                      <div className="flex gap-3 justify-center">
                        {!temDadosLucroReal && (
                          <Button asChild>
                            <Link href={`/empresas/${empresaId}/cenarios`}>
                              Criar Cenários
                            </Link>
                          </Button>
                        )}
                        <Button 
                          variant={temDadosLucroReal ? "default" : "outline"}
                          onClick={() => {
                            // Mudar para aba de adicionar dados
                            const addTab = document.querySelector('[value="adicionar"]') as HTMLElement
                            addTab?.click()
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Dados
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="adicionar" className="space-y-6">
          <FormularioComparativos 
            empresaId={empresaId}
            onSucesso={() => {
              // Voltar para aba de comparação após sucesso
              const compTab = document.querySelector('[value="comparacao"]') as HTMLElement
              compTab?.click()
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}