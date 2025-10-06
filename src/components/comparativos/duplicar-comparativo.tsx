"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Copy, Loader2 } from "lucide-react"
import { ComparativosAnaliseServiceCompleto } from "@/services/comparativos-analise-service-completo"
import type { ComparativoCompleto, ConfigComparativo } from "@/types/comparativo-analise-completo"

interface DuplicarComparativoProps {
  comparativo: ComparativoCompleto
  onSucesso?: (novoComparativoId: string) => void
  trigger?: React.ReactNode
}

export function DuplicarComparativo({ comparativo, onSucesso, trigger }: DuplicarComparativoProps) {
  const { toast } = useToast()
  const [aberto, setAberto] = useState(false)
  const [duplicando, setDuplicando] = useState(false)
  
  const [nome, setNome] = useState(`${comparativo.nome} (Cópia)`)
  const [descricao, setDescricao] = useState(comparativo.descricao || '')

  const handleDuplicar = async () => {
    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o novo comparativo",
        variant: "destructive"
      })
      return
    }

    setDuplicando(true)

    try {
      // Criar nova configuração baseada na original
      const novaConfig: ConfigComparativo = {
        ...comparativo.configuracao,
        nome: nome.trim(),
        descricao: descricao.trim()
      }

      // Criar novo comparativo usando o serviço
      const novoComparativo = await ComparativosAnaliseServiceCompleto.criarComparativo(novaConfig)

      if (!novoComparativo) {
        throw new Error('Erro ao duplicar comparativo')
      }

      toast({
        title: "Comparativo duplicado!",
        description: `${nome} foi criado com sucesso`
      })

      setAberto(false)
      onSucesso?.(novoComparativo.id)

    } catch (error) {
      console.error('Erro ao duplicar comparativo:', error)
      toast({
        title: "Erro ao duplicar",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive"
      })
    } finally {
      setDuplicando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Duplicar Comparativo</DialogTitle>
          <DialogDescription>
            Crie uma cópia deste comparativo com a mesma configuração
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do novo comparativo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {nome.length}/100 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite uma descrição..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {descricao.length}/500 caracteres
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Configuração que será copiada:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tipo: {getTipoLabel(comparativo.tipo)}</li>
              <li>• Ano: {comparativo.configuracao.ano}</li>
              <li>• Meses: {comparativo.configuracao.mesesSelecionados.length}</li>
              <li>• Cenários LR: {comparativo.configuracao.lucroReal.cenarioIds.length}</li>
              {comparativo.configuracao.dadosManuais.lucroPresumido.incluir && (
                <li>• Dados LP: {comparativo.configuracao.dadosManuais.lucroPresumido.dadosIds?.length || 0}</li>
              )}
              {comparativo.configuracao.dadosManuais.simplesNacional.incluir && (
                <li>• Dados SN: {comparativo.configuracao.dadosManuais.simplesNacional.dadosIds?.length || 0}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAberto(false)} disabled={duplicando}>
            Cancelar
          </Button>
          <Button onClick={handleDuplicar} disabled={duplicando}>
            {duplicando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getTipoLabel(tipo: string): string {
  const tipos: Record<string, string> = {
    'simples': 'Simples',
    'multiplo': 'Múltiplo',
    'temporal': 'Temporal',
    'por_imposto': 'Por Imposto',
    'cenarios': 'Entre Cenários'
  }
  return tipos[tipo] || tipo
}
