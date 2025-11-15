"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEmpresas } from "@/hooks/use-empresas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, Search, Loader2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

export default function EmpresasPage() {
  const router = useRouter()
  const { empresas, setEmpresaAtual, isLoading, error, refresh, clearError } = useEmpresas()
  const [busca, setBusca] = useState("")

  // Debug: verificar empresas carregadas
  useEffect(() => {
    console.log("📊 Total de empresas:", empresas.length)
    console.log("📋 Empresas carregadas:", empresas)
  }, [empresas])

  const empresasFiltradas = empresas.filter((empresa) =>
    empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
    empresa.cnpj.includes(busca) ||
    empresa.razaoSocial.toLowerCase().includes(busca.toLowerCase())
  )

  const handleNovaEmpresa = () => {
    router.push("/empresas/nova")
  }
  const handleAbrirEmpresa = (id: string) => {
    setEmpresaAtual(id)
    router.push(`/empresas/${id}`)
  }

  // Se há erro, mostra mensagem
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro ao carregar empresas
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => { clearError(); refresh() }} className="gap-2">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Minhas Empresas
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas empresas e planejamentos tributários
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={handleNovaEmpresa} size="lg" className="gap-2" disabled={isLoading}>
              <Plus className="h-5 w-5" />
              Nova Empresa
            </Button>
          </div>
        </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CNPJ ou razão social..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
      </div>

      {/* Lista de Empresas */}
      {empresasFiltradas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {empresas.length === 0 ? "Nenhuma empresa cadastrada" : "Nenhuma empresa encontrada"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {empresas.length === 0
                ? "Comece criando sua primeira empresa para iniciar o planejamento tributário"
                : "Tente buscar com outros termos"}
            </p>
            {empresas.length === 0 && (
              <Button onClick={handleNovaEmpresa} className="gap-2" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                Criar Primeira Empresa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresasFiltradas.map((empresa) => (
            <Card
              key={empresa.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleAbrirEmpresa(empresa.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 mt-1 flex-shrink-0" />
                  <span className="line-clamp-2">{empresa.nome}</span>
                </CardTitle>
                <CardDescription className="space-y-1">
                  <span className="block"><strong>CNPJ:</strong> {empresa.cnpj}</span>
                  <span className="block"><strong>Razão Social:</strong> {empresa.razaoSocial}</span>
                  <span className="block"><strong>Regime:</strong> {empresa.regimeTributario}</span>
                  <span className="block"><strong>UF:</strong> {empresa.uf}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAbrirEmpresa(empresa.id)
                  }}
                  disabled={isLoading}
                >
                  Abrir Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
