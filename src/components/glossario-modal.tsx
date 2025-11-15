"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search } from "lucide-react"
import { glossarioTributario, categoriasGlossario, buscarTermos, type TermoGlossario } from "@/lib/glossario-tributario"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function GlossarioModal() {
  const [busca, setBusca] = useState("")
  const [open, setOpen] = useState(false)

  const termosEncontrados = busca.length > 0 
    ? buscarTermos(busca) 
    : Object.values(glossarioTributario)

  const TermoCard = ({ termo }: { termo: TermoGlossario }) => (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-2 mb-2">
        {termo.sigla && (
          <Badge variant="secondary" className="text-xs">
            {termo.sigla}
          </Badge>
        )}
        <h4 className="font-semibold flex-1">{termo.termo}</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {termo.definicao}
      </p>
      
      {termo.formula && (
        <details className="text-xs">
          <summary className="cursor-pointer text-primary hover:underline mb-2">
            Ver cálculo
          </summary>
          <div className="bg-muted rounded p-2 font-mono whitespace-pre-line">
            {termo.formula}
          </div>
        </details>
      )}
      
      {termo.exemplo && (
        <details className="text-xs mt-2">
          <summary className="cursor-pointer text-primary hover:underline mb-2">
            Ver exemplo
          </summary>
          <div className="bg-blue-50 dark:bg-blue-950/50 rounded p-2">
            {termo.exemplo}
          </div>
        </details>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Glossário Tributário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Glossário de Termos Tributários
          </DialogTitle>
          <DialogDescription>
            Entenda todos os conceitos, impostos e métricas usados no planejamento tributário
          </DialogDescription>
        </DialogHeader>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar termo, sigla ou conceito..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {busca.length > 0 ? (
            // Resultados da busca
            <div className="space-y-4">
              {termosEncontrados.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {termosEncontrados.length} resultado(s) encontrado(s)
                  </p>
                  {termosEncontrados.map((termo, index) => (
                    <TermoCard key={index} termo={termo} />
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum termo encontrado para "{busca}"
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => setBusca("")}
                    className="mt-2"
                  >
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Navegação por categorias
            <Tabs defaultValue="impostos_federais" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="impostos_federais" className="text-xs">
                  Federais
                </TabsTrigger>
                <TabsTrigger value="impostos_estaduais" className="text-xs">
                  Estaduais
                </TabsTrigger>
                <TabsTrigger value="impostos_municipais" className="text-xs">
                  Municipais
                </TabsTrigger>
                <TabsTrigger value="contribuicoes_previdenciarias" className="text-xs">
                  Previdência
                </TabsTrigger>
                <TabsTrigger value="regimes_tributarios" className="text-xs">
                  Regimes
                </TabsTrigger>
                <TabsTrigger value="metricas" className="text-xs">
                  Métricas
                </TabsTrigger>
              </TabsList>

              {Object.entries(categoriasGlossario).map(([categoria, termos]) => (
                <TabsContent key={categoria} value={categoria} className="space-y-4 mt-4">
                  {termos.map((chave) => {
                    const termo = glossarioTributario[chave]
                    return termo ? <TermoCard key={chave} termo={termo} /> : null
                  })}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
