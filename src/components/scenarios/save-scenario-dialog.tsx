"use client"

import * as React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, X } from "lucide-react"
import { useScenarios } from "@/hooks/use-scenarios"
import { useTaxStore } from "@/hooks/use-tax-store"
import { useTaxCalculations } from "@/hooks/use-tax-calculations"

interface SaveScenarioDialogProps {
  children?: React.ReactNode
  onSaved?: () => void
}

export function SaveScenarioDialog({ children, onSaved }: SaveScenarioDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const { config } = useTaxStore()
  const { summary } = useTaxCalculations()
  const { createScenario } = useScenarios()

  const handleSave = () => {
    if (!name.trim()) {
      return
    }

    createScenario(
      config,
      {
        name: name.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        icms: summary.icms,
        pisCofins: summary.pisCofins,
        irpjCsll: summary.irpjCsll,
        iss: summary.iss,
        totalImpostos: summary.totalImpostos,
        cargaTributaria: summary.cargaTributaria,
        lucroLiquido: summary.lucroLiquido,
      }
    )

    // Reset form
    setName("")
    setDescription("")
    setTags([])
    setTagInput("")
    setOpen(false)

    onSaved?.()
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (tagInput.trim()) {
        handleAddTag()
      } else if (name.trim()) {
        handleSave()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default" className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Cenário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>💾 Salvar Cenário Atual</DialogTitle>
          <DialogDescription>
            Salve a configuração atual para comparar ou carregar posteriormente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome do Cenário <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Cenário Otimizado - Janeiro 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/100 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione notas sobre este cenário..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 caracteres
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Ex: otimização, q1-2025"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                maxLength={30}
                disabled={tags.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                Adicionar
              </Button>
            </div>
            
            {/* Tag List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              {tags.length}/10 tags
            </p>
          </div>

          {/* Preview dos cálculos */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-semibold">📊 Cálculos que serão salvos:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Receita:</span>
                <span className="ml-2 font-mono">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(config.receitaBruta)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carga:</span>
                <span className="ml-2 font-mono text-destructive">
                  {summary.cargaTributaria.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Impostos:</span>
                <span className="ml-2 font-mono">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalImpostos)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Lucro:</span>
                <span className="ml-2 font-mono text-lucro">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.lucroLiquido)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Cenário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
