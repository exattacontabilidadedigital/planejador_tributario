"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEmpresas } from "@/hooks/use-empresas"
import { useCenarios } from "@/hooks/use-cenarios"
import { useTaxStore } from "@/hooks/use-tax-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import type { PeriodoCenario, TipoPeriodo } from "@/types/cenario"
import { useToast } from "@/hooks/use-toast"

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export default function NovoCenarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getEmpresa } = useEmpresas()
  const { addCenario } = useCenarios(id)
  const { config } = useTaxStore()
  
  const empresa = getEmpresa(id)
  
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("mensal")
  const [ano, setAno] = useState(2025) // Valor fixo para evitar hidratação mismatch
  const [mes, setMes] = useState(10) // Valor fixo para evitar hidratação mismatch
  const [trimestre, setTrimestre] = useState<1 | 2 | 3 | 4>(4)
  const [mounted, setMounted] = useState(false)

  // Definir valores de data apenas no cliente
  useEffect(() => {
    const currentDate = new Date()
    setAno(currentDate.getFullYear())
    setMes(currentDate.getMonth() + 1)
    setTrimestre(Math.ceil((currentDate.getMonth() + 1) / 3) as 1 | 2 | 3 | 4)
    setMounted(true)
  }, [])

  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <p>Empresa não encontrada</p>
        <Button onClick={() => router.push("/empresas")}>Voltar</Button>
      </div>
    )
  }

  const calcularPeriodo = (): PeriodoCenario => {
    const periodo: PeriodoCenario = {
      tipo: tipoPeriodo,
      ano,
      inicio: "",
      fim: "",
    }

    switch (tipoPeriodo) {
      case "mensal":
        periodo.mes = mes
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

    return periodo
  }

  const gerarNomeAutomatico = (): string => {
    switch (tipoPeriodo) {
      case "mensal":
        return `${MESES[mes - 1]} ${ano}`
      case "trimestral":
        return `Q${trimestre} ${ano}`
      case "semestral":
        return `Semestre 1 ${ano}`
      case "anual":
        return `Ano ${ano}`
      default:
        return ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nomeDefinitivo = nome.trim() || gerarNomeAutomatico()
    const periodo = calcularPeriodo()

    try {
      const novoCenario = await addCenario(
        {
          nome: nomeDefinitivo,
          descricao: descricao.trim() || undefined,
          periodo,
          status: 'rascunho',
        },
        config
      )

      toast({
        title: "Cenário criado!",
        description: `${novoCenario.nome} foi criado como rascunho.`,
      })

      router.push(`/empresas/${id}/cenarios/${novoCenario.id}`)
    } catch (error) {
      console.error('Erro ao criar cenário:', error)
      toast({
        title: "Erro ao criar cenário",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Anos disponíveis (último ano até próximo ano)
  const anosDisponiveis = Array.from(
    { length: 3 },
    (_, i) => (mounted ? new Date().getFullYear() : 2025) - 1 + i
  )

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Novo Cenário - {empresa.nome}</CardTitle>
          <CardDescription>
            Crie um novo cenário de planejamento tributário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cenário</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={`Ex: ${gerarNomeAutomatico()} (Gerado automaticamente se vazio)`}
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para gerar automaticamente baseado no período
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Cenário otimista considerando aumento de 10% nas vendas"
                rows={3}
              />
            </div>

            {/* Tipo de Período */}
            <div className="space-y-2">
              <Label htmlFor="tipoPeriodo">Tipo de Período *</Label>
              <Select
                value={tipoPeriodo}
                onValueChange={(value: TipoPeriodo) => setTipoPeriodo(value)}
              >
                <SelectTrigger id="tipoPeriodo">
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

            {/* Ano */}
            <div className="space-y-2">
              <Label htmlFor="ano">Ano *</Label>
              <Select
                value={ano.toString()}
                onValueChange={(value) => setAno(parseInt(value))}
              >
                <SelectTrigger id="ano">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.map((a) => (
                    <SelectItem key={a} value={a.toString()}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mês (se mensal) */}
            {tipoPeriodo === "mensal" && (
              <div className="space-y-2">
                <Label htmlFor="mes">Mês *</Label>
                <Select
                  value={mes.toString()}
                  onValueChange={(value) => setMes(parseInt(value))}
                >
                  <SelectTrigger id="mes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((nomeMes, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {nomeMes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Trimestre (se trimestral) */}
            {tipoPeriodo === "trimestral" && (
              <div className="space-y-2">
                <Label htmlFor="trimestre">Trimestre *</Label>
                <Select
                  value={trimestre.toString()}
                  onValueChange={(value) => setTrimestre(parseInt(value) as 1 | 2 | 3 | 4)}
                >
                  <SelectTrigger id="trimestre">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Abr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Set)</SelectItem>
                    <SelectItem value="4">Q4 (Out-Dez)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preview do Nome */}
            {!nome && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Nome gerado:</p>
                <p className="text-lg">{gerarNomeAutomatico()}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Criar e Editar Configurações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
