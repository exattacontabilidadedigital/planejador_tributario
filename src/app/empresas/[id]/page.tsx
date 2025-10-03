"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building2, FileText, GitCompare, Plus, Settings, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function EmpresaDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { getEmpresa } = useEmpresasStore()
  const { getCenariosByEmpresa } = useCenariosStore()
  
  const empresa = getEmpresa(id)
  const cenarios = getCenariosByEmpresa(id)
  
  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <p>Empresa não encontrada</p>
        <Button onClick={() => router.push("/empresas")}>Voltar</Button>
      </div>
    )
  }

  const cenariosRecentes = cenarios
    .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
    .slice(0, 5)

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/empresas")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Empresas
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {empresa.nome}
            </h1>
            <p className="text-muted-foreground mt-1">
              CNPJ: {empresa.cnpj} • {empresa.razaoSocial}
            </p>
          </div>
          <Link href={`/empresas/${id}/configuracoes`}>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs (Placeholder - será implementado com dados reais) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Cenários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cenarios.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cenários Aprovados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {cenarios.filter(c => c.status === 'aprovado').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rascunhos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {cenarios.filter(c => c.status === 'rascunho').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Regime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {empresa.regimeTributario}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/empresas/${id}/cenarios`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cenários
              </CardTitle>
              <CardDescription>
                Gerencie e crie novos cenários de planejamento
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/empresas/${id}/relatorios`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Visualize análises e gráficos consolidados
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/empresas/${id}/comparativos`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Comparativos
              </CardTitle>
              <CardDescription>
                Compare cenários e identifique variações
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Cenários Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cenários Recentes</CardTitle>
            <Link href={`/empresas/${id}/cenarios`}>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {cenariosRecentes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Nenhum cenário criado ainda</p>
              <Link href={`/empresas/${id}/cenarios/novo`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Cenário
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cenariosRecentes.map((cenario) => (
                <Link
                  key={cenario.id}
                  href={`/empresas/${id}/cenarios/${cenario.id}`}
                >
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">{cenario.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {cenario.periodo.tipo} • {new Date(cenario.atualizadoEm).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        cenario.status === 'aprovado' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : cenario.status === 'rascunho'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                      }`}>
                        {cenario.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
