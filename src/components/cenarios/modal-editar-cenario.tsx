"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { TipoPeriodo } from "@/types/cenario"

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

interface ModalEditarCenarioProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cenario: any
  onSave: (dados: any) => Promise<void>
}

export function ModalEditarCenario({
  open,
  onOpenChange,
  cenario,
  onSave
}: ModalEditarCenarioProps) {
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("mensal")
  const [periodoPagamento, setPeriodoPagamento] = useState<'mensal' | 'trimestral' | 'anual'>('mensal')
  const [ano, setAno] = useState(2025)
  const [mes, setMes] = useState(1)
  const [trimestre, setTrimestre] = useState<1 | 2 | 3 | 4>(1)

  // Carregar dados do cenário quando abrir o modal
  useEffect(() => {
    if (open && cenario) {
      setNome(cenario.nome || "")
      setDescricao(cenario.descricao || "")
      
      const config = cenario.configuracao || {}
      const periodo = config.periodo || {}
      
      setTipoPeriodo(periodo.tipo || "mensal")
      setPeriodoPagamento(config.periodoPagamento || 'mensal')
      setAno(periodo.ano || new Date().getFullYear())
      
      if (periodo.mes) {
        setMes(parseInt(periodo.mes) || 1)
      }
      
      if (periodo.trimestre) {
        setTrimestre(periodo.trimestre)
      }
    }
  }, [open, cenario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calcular período baseado nos campos
      const periodo: any = {
        tipo: tipoPeriodo,
        ano,
        inicio: "",
        fim: "",
      }

      switch (tipoPeriodo) {
        case "mensal":
          periodo.mes = mes.toString().padStart(2, '0')
          periodo.inicio = new Date(ano, mes - 1, 1).toISOString()
          periodo.fim = new Date(ano, mes, 0).toISOString()
          break
        
        case "trimestral":
          periodo.trimestre = trimestre
          const mesInicio = (trimestre - 1) * 3 + 1
          const mesFim = trimestre * 3
          periodo.inicio = new Date(ano, mesInicio - 1, 1).toISOString()
          periodo.fim = new Date(ano, mesFim, 0).toISOString()
          break
        
        case "semestral":
          periodo.inicio = new Date(ano, 0, 1).toISOString()
          periodo.fim = new Date(ano, 5, 30).toISOString()
          break
        
        case "anual":
          periodo.inicio = new Date(ano, 0, 1).toISOString()
          periodo.fim = new Date(ano, 11, 31).toISOString()
          break
      }

      // Atualizar configuração com novo período
      const novaConfiguracao = {
        ...cenario.configuracao,
        periodo,
        periodoPagamento,
      }

      await onSave({
        nome: nome.trim(),
        descricao: descricao.trim(),
        configuracao: novaConfiguracao,
        tipo_periodo: tipoPeriodo,
        ano,
        mes: tipoPeriodo === 'mensal' ? mes : null,
        trimestre: tipoPeriodo === 'trimestral' ? trimestre : null,
        data_inicio: periodo.inicio,
        data_fim: periodo.fim,
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cenário</DialogTitle>
          <DialogDescription>
            Altere as informações do cenário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Cenário */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cenário</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cenário Otimista 2025"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o cenário..."
              rows={3}
            />
          </div>

          {/* Tipo de Período */}
          <div className="space-y-2">
            <Label htmlFor="tipo-periodo">Tipo de Período</Label>
            <Select
              value={tipoPeriodo}
              onValueChange={(value) => setTipoPeriodo(value as TipoPeriodo)}
            >
              <SelectTrigger id="tipo-periodo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Período de Apuração IRPJ/CSLL */}
          <div className="space-y-2">
            <Label htmlFor="periodo-pagamento">Período de Apuração IRPJ/CSLL</Label>
            <Select
              value={periodoPagamento}
              onValueChange={(value) => setPeriodoPagamento(value as 'mensal' | 'trimestral' | 'anual')}
            >
              <SelectTrigger id="periodo-pagamento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define o limite para adicional de IRPJ (10% sobre o excedente)
            </p>
          </div>

          {/* Ano */}
          <div className="space-y-2">
            <Label htmlFor="ano">Ano</Label>
            <Input
              id="ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value) || 2025)}
              min={2020}
              max={2030}
              required
            />
          </div>

          {/* Mês (se tipo for mensal) */}
          {tipoPeriodo === "mensal" && (
            <div className="space-y-2">
              <Label htmlFor="mes">Mês</Label>
              <Select
                value={mes.toString()}
                onValueChange={(value) => setMes(parseInt(value))}
              >
                <SelectTrigger id="mes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((nome, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Trimestre (se tipo for trimestral) */}
          {tipoPeriodo === "trimestral" && (
            <div className="space-y-2">
              <Label htmlFor="trimestre">Trimestre</Label>
              <Select
                value={trimestre.toString()}
                onValueChange={(value) => setTrimestre(parseInt(value) as 1 | 2 | 3 | 4)}
              >
                <SelectTrigger id="trimestre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Trimestre (Jan-Mar)</SelectItem>
                  <SelectItem value="2">2º Trimestre (Abr-Jun)</SelectItem>
                  <SelectItem value="3">3º Trimestre (Jul-Set)</SelectItem>
                  <SelectItem value="4">4º Trimestre (Out-Dez)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
