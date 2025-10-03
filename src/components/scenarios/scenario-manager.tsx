"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  Star,
  StarOff,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Folder,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileJson,
  Play,
} from "lucide-react"
import { useScenarios } from "@/hooks/use-scenarios"
import { useTaxStore } from "@/hooks/use-tax-store"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { SaveScenarioDialog } from "@/components/scenarios/save-scenario-dialog"

export const ScenarioManager = React.memo(function ScenarioManager() {
  const {
    scenarios,
    statistics,
    filter,
    setFilter,
    toggleFavorite,
    deleteScenario,
    duplicateScenario,
    exportScenario,
    exportAllScenarios,
    importScenario,
  } = useScenarios()

  const { setConfig } = useTaxStore()
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.metadata.id === scenarioId)
    if (scenario) {
      setConfig(scenario.config)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        importScenario(text)
      }
    }
    input.click()
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setFilter({ ...filter, searchTerm: value || undefined })
  }

  return (
    <div className="space-y-6">
      {/* Header e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Gerenciador de Cenários
              </CardTitle>
              <CardDescription>
                Salve, compare e gerencie diferentes simulações tributárias
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <SaveScenarioDialog />
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              {scenarios.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportAllScenarios}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todos
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{statistics.total}</div>
              <div className="text-xs text-muted-foreground">Total de Cenários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{statistics.favorites}</div>
              <div className="text-xs text-muted-foreground">Favoritos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.tags.length}</div>
              <div className="text-xs text-muted-foreground">Tags Únicas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((localStorage.getItem('tax-planner-scenarios')?.length || 0) / 1024)}KB
              </div>
              <div className="text-xs text-muted-foreground">Espaço Usado</div>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cenários por nome, descrição ou tags..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cenários */}
      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum cenário salvo</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Salve diferentes configurações tributárias para comparar e analisar
            </p>
            <SaveScenarioDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Card 
              key={scenario.metadata.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate flex items-center gap-2">
                      {scenario.metadata.favorite && (
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500 flex-shrink-0" />
                      )}
                      {scenario.metadata.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(scenario.metadata.updatedAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(scenario.metadata.id)}
                  >
                    {scenario.metadata.favorite ? (
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {scenario.metadata.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {scenario.metadata.description}
                  </p>
                )}

                {scenario.metadata.tags && scenario.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scenario.metadata.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {scenario.metadata.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{scenario.metadata.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Métricas */}
                {scenario.calculations && (
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="text-muted-foreground mb-1">Carga Tributária</div>
                      <div className="font-bold text-destructive">
                        {formatPercentage(scenario.calculations.cargaTributaria, 2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Lucro Líquido</div>
                      <div className="font-bold text-lucro">
                        {formatCurrency(scenario.calculations.lucroLiquido)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-muted-foreground mb-1">Total Impostos</div>
                      <div className="font-mono">
                        {formatCurrency(scenario.calculations.totalImpostos)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleLoadScenario(scenario.metadata.id)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Carregar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => duplicateScenario(scenario.metadata.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => exportScenario(scenario.metadata.id)}
                  >
                    <FileJson className="h-3 w-3 mr-1" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-destructive hover:text-destructive"
                    onClick={() => setScenarioToDelete(scenario.metadata.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Confirmação de Deleção */}
      <AlertDialog open={!!scenarioToDelete} onOpenChange={() => setScenarioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🗑️ Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este cenário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (scenarioToDelete) {
                  deleteScenario(scenarioToDelete)
                  setScenarioToDelete(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})
