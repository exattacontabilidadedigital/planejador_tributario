"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, TrendingDown, TrendingUp, Download } from "lucide-react"
import type { DespesaItem, DespesaTipo, DespesaCredito } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { ImportCSVButton } from "./import-csv-button"
import { exportarDespesasCSV } from "@/lib/csv-utils"

interface DespesasManagerProps {
  despesas: DespesaItem[]
  credito: DespesaCredito
  onAdd: (despesa: Omit<DespesaItem, "id">) => void
  onEdit: (id: string, despesa: Partial<DespesaItem>) => void
  onDelete: (id: string) => void
  onBulkAdd?: (despesas: Omit<DespesaItem, "id">[]) => void
}

export function DespesasManager({ despesas, credito, onAdd, onEdit, onDelete, onBulkAdd }: DespesasManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    descricao: "",
    valor: 0,
    tipo: "despesa" as DespesaTipo,
    categoria: "",
  })

  const despesasFiltradas = despesas.filter((d) => d.credito === credito)

  const handleSubmit = () => {
    if (!formData.descricao || formData.valor <= 0) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }

    if (editingId) {
      onEdit(editingId, formData)
      setEditingId(null)
    } else {
      onAdd({
        ...formData,
        credito,
      })
    }

    setFormData({
      descricao: "",
      valor: 0,
      tipo: "despesa",
      categoria: "",
    })
    setIsOpen(false)
  }

  const handleEdit = (despesa: DespesaItem) => {
    setEditingId(despesa.id)
    setFormData({
      descricao: despesa.descricao,
      valor: despesa.valor,
      tipo: despesa.tipo,
      categoria: despesa.categoria || "",
    })
    setIsOpen(true)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      descricao: "",
      valor: 0,
      tipo: "despesa",
      categoria: "",
    })
    setIsOpen(false)
  }

  const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + d.valor, 0)
  const totalCustos = despesasFiltradas.filter((d) => d.tipo === "custo").reduce((sum, d) => sum + d.valor, 0)
  const totalDespesasOp = despesasFiltradas.filter((d) => d.tipo === "despesa").reduce((sum, d) => sum + d.valor, 0)

  const handleImportCSV = (despesasImportadas: DespesaItem[]) => {
    // Se tem função de bulk add, usa ela (mais eficiente)
    if (onBulkAdd) {
      const despesasSemId = despesasImportadas.map(({ descricao, valor, tipo, credito, categoria }) => ({
        descricao,
        valor,
        tipo,
        credito,
        categoria,
      }))
      onBulkAdd(despesasSemId)
    } else {
      // Fallback: adiciona uma por uma
      despesasImportadas.forEach((despesa) => {
        onAdd({
          descricao: despesa.descricao,
          valor: despesa.valor,
          tipo: despesa.tipo,
          credito: despesa.credito,
          categoria: despesa.categoria,
        })
      })
    }
  }

  const handleExportCSV = () => {
    exportarDespesasCSV(despesasFiltradas, credito)
  }

  return (
    <div className="space-y-4">
      {/* Header com Total e Botões */}
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">Total: {formatCurrency(totalDespesas)}</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Custos: {formatCurrency(totalCustos)}</span>
            <span>Despesas Op.: {formatCurrency(totalDespesasOp)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Botão Exportar CSV */}
          {despesasFiltradas.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              title="Exportar despesas para CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {/* Botão Importar CSV */}
          <ImportCSVButton
            credito={credito}
            onImport={handleImportCSV}
          />
          
          {/* Botão Adicionar Manual */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingId(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar" : "Adicionar"} Despesa{" "}
                  {credito === "com-credito" ? "COM Crédito" : "SEM Crédito"}
                </DialogTitle>
              <DialogDescription>
                {credito === "com-credito"
                  ? "Despesas que geram direito a crédito de PIS/COFINS (9,25%)"
                  : "Despesas que NÃO geram crédito de PIS/COFINS"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Energia elétrica, Aluguel, Salários..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor">
                  Valor (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor || ""}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {/* Tipo (Custo ou Despesa) */}
              <div className="space-y-2">
                <Label htmlFor="tipo">
                  Classificação DRE <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.tipo} onValueChange={(value: DespesaTipo) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custo">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        <div>
                          <div className="font-medium">Custo</div>
                          <div className="text-xs text-muted-foreground">
                            CMV, Matéria-prima, Mão de obra direta
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="despesa">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">Despesa Operacional</div>
                          <div className="text-xs text-muted-foreground">
                            Administrativas, Comerciais, Financeiras
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria (Opcional)</Label>
                <Input
                  id="categoria"
                  placeholder="Ex: Energia, Frete, RH..."
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>

              {/* Info Box */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Diferença entre Custo e Despesa:</strong>
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  <li>
                    <strong>Custo:</strong> Relacionado à produção/aquisição (CMV, matéria-prima, frete de compras)
                  </li>
                  <li>
                    <strong>Despesa:</strong> Relacionada à operação (salários admin, marketing, aluguel escritório)
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Salvar Alterações" : "Adicionar Despesa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Lista de Despesas */}
      {despesasFiltradas.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">
            Nenhuma despesa adicionada. Clique em "Adicionar" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {despesasFiltradas.map((despesa) => (
            <div
              key={despesa.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{despesa.descricao}</p>
                  {despesa.tipo === "custo" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
                      <TrendingDown className="h-3 w-3" />
                      Custo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      <TrendingUp className="h-3 w-3" />
                      Despesa
                    </span>
                  )}
                  {despesa.categoria && (
                    <span className="text-xs text-muted-foreground">({despesa.categoria})</span>
                  )}
                </div>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  {formatCurrency(despesa.valor)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(despesa)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Deletar "${despesa.descricao}"?`)) {
                      onDelete(despesa.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
