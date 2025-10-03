"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useEmpresasStore } from "@/stores/empresas-store"
import { useCenariosStore } from "@/stores/cenarios-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Calendar,
  Copy,
  FileText,
  GitCompare,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { StatusCenario } from "@/types/cenario"

export default function CenariosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getEmpresa } = useEmpresasStore()
  const { getCenariosByEmpresa, deleteCenario, duplicarCenario, aprovarCenario } = useCenariosStore()
  
  const empresa = getEmpresa(id)
  const todosCenarios = getCenariosByEmpresa(id)
  
  const [busca, setBusca] = useState("")
  const [filtroAno, setFiltroAno] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  
  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <p>Empresa não encontrada</p>
        <Button onClick={() => router.push("/empresas")}>Voltar</Button>
      </div>
    )
  }

  // Filtros
  const cenariosFiltrados = todosCenarios.filter((cenario) => {
    const matchBusca = cenario.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       cenario.descricao?.toLowerCase().includes(busca.toLowerCase())
    const matchAno = filtroAno === "todos" || cenario.periodo.ano.toString() === filtroAno
    const matchStatus = filtroStatus === "todos" || cenario.status === filtroStatus
    
    return matchBusca && matchAno && matchStatus
  })

  // Anos disponíveis
  const anosDisponiveis = Array.from(
    new Set(todosCenarios.map(c => c.periodo.ano))
  ).sort((a, b) => b - a)

  const handleDuplicar = (cenarioId: string) => {
    const cenarioDuplicado = duplicarCenario(cenarioId)
    if (cenarioDuplicado) {
      toast({
        title: "Cenário duplicado!",
        description: `${cenarioDuplicado.nome} foi criado com sucesso.`,
      })
    }
  }

  const handleDeletar = (cenarioId: string, nome: string) => {
    if (confirm(`Deseja realmente excluir o cenário "${nome}"?`)) {
      deleteCenario(cenarioId)
      toast({
        title: "Cenário excluído",
        description: `${nome} foi removido.`,
      })
    }
  }

  const handleAprovar = (cenarioId: string, nome: string) => {
    aprovarCenario(cenarioId)
    toast({
      title: "Cenário aprovado!",
      description: `${nome} foi aprovado com sucesso.`,
    })
  }

  const getStatusBadge = (status: StatusCenario) => {
    const styles = {
      aprovado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      rascunho: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      arquivado: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/empresas/${id}`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Dashboard
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Cenários - {empresa.nome}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os cenários de planejamento tributário
            </p>
          </div>
          <Link href={`/empresas/${id}/cenarios/novo`}>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Novo Cenário
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cenários..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Ano */}
            <Select value={filtroAno} onValueChange={setFiltroAno}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os anos</SelectItem>
                {anosDisponiveis.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro Status */}
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visual */}
      {filtroAno !== "todos" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline {filtroAno}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2">
              {[...Array(12)].map((_, index) => {
                const mes = index + 1
                const cenarioDoMes = cenariosFiltrados.find(
                  c => c.periodo.mes === mes && c.periodo.tipo === 'mensal'
                )
                
                return (
                  <div
                    key={mes}
                    className={`p-2 text-center rounded border ${
                      cenarioDoMes
                        ? cenarioDoMes.status === 'aprovado'
                          ? 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700'
                          : 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}
                    </div>
                    {cenarioDoMes && (
                      <div className="text-xl mt-1">✓</div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Cenários */}
      {cenariosFiltrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {todosCenarios.length === 0 ? "Nenhum cenário criado" : "Nenhum cenário encontrado"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {todosCenarios.length === 0
                ? "Comece criando seu primeiro cenário de planejamento"
                : "Tente ajustar os filtros de busca"}
            </p>
            {todosCenarios.length === 0 && (
              <Link href={`/empresas/${id}/cenarios/novo`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Cenário
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cenariosFiltrados.map((cenario) => (
            <Card key={cenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Link
                        href={`/empresas/${id}/cenarios/${cenario.id}`}
                        className="hover:underline"
                      >
                        {cenario.nome}
                      </Link>
                      {getStatusBadge(cenario.status)}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      {cenario.descricao && <span className="block">{cenario.descricao}</span>}
                      <span className="flex items-center gap-4 text-xs">
                        <span>Período: {cenario.periodo.tipo}</span>
                        <span>Ano: {cenario.periodo.ano}</span>
                        {cenario.periodo.mes && <span>Mês: {cenario.periodo.mes}</span>}
                        <span>Atualizado: {format(new Date(cenario.atualizadoEm), 'dd/MM/yyyy')}</span>
                      </span>
                    </CardDescription>
                  </div>

                  {/* Menu de Ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/empresas/${id}/cenarios/${cenario.id}`)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicar(cenario.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      {cenario.status === 'rascunho' && (
                        <DropdownMenuItem onClick={() => handleAprovar(cenario.id, cenario.nome)}>
                          <GitCompare className="h-4 w-4 mr-2" />
                          Aprovar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeletar(cenario.id, cenario.nome)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      {cenariosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cenariosFiltrados.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Aprovados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {cenariosFiltrados.filter(c => c.status === 'aprovado').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rascunhos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {cenariosFiltrados.filter(c => c.status === 'rascunho').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Arquivados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {cenariosFiltrados.filter(c => c.status === 'arquivado').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
