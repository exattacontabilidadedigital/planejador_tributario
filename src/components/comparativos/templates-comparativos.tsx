"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileText, Calendar, BarChart3, TrendingUp, Check } from "lucide-react"
import type { TipoComparativo } from "@/types/comparativo-analise-completo"

interface TemplateComparativo {
  id: string
  nome: string
  descricao: string
  tipo: TipoComparativo
  icon: React.ReactNode
  config: {
    incluirLucroReal: boolean
    incluirLucroPresumido: boolean
    incluirSimplesNacional: boolean
    mesesSugeridos: string[]
    descricaoDetalhada: string
  }
}

interface TemplatesComparativosProps {
  empresaId: string
  onSelecionarTemplate: (template: TemplateComparativo) => void
  trigger?: React.ReactNode
}

export function TemplatesComparativos({ empresaId, onSelecionarTemplate, trigger }: TemplatesComparativosProps) {
  const { toast } = useToast()
  const [aberto, setAberto] = useState(false)
  const [selecionado, setSelecionado] = useState<string | null>(null)

  const templates: TemplateComparativo[] = [
    {
      id: 'trimestral',
      nome: 'Comparativo Trimestral',
      descricao: 'Análise completa dos 3 regimes para um trimestre específico',
      tipo: 'multiplo',
      icon: <Calendar className="w-5 h-5" />,
      config: {
        incluirLucroReal: true,
        incluirLucroPresumido: true,
        incluirSimplesNacional: true,
        mesesSugeridos: ['01', '02', '03'],
        descricaoDetalhada: 'Compara todos os regimes tributários (Lucro Real, Lucro Presumido e Simples Nacional) para um trimestre. Ideal para análises periódicas e tomada de decisão estratégica.'
      }
    },
    {
      id: 'anual',
      nome: 'Análise Anual Completa',
      descricao: 'Comparação de todos os regimes para o ano inteiro',
      tipo: 'temporal',
      icon: <BarChart3 className="w-5 h-5" />,
      config: {
        incluirLucroReal: true,
        incluirLucroPresumido: true,
        incluirSimplesNacional: true,
        mesesSugeridos: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        descricaoDetalhada: 'Análise evolutiva de todos os regimes ao longo do ano completo. Permite visualizar tendências, sazonalidade e otimização tributária anual.'
      }
    },
    {
      id: 'cenario-realizado',
      nome: 'Cenário vs Realizado',
      descricao: 'Compare os cenários projetados com os dados reais dos outros regimes',
      tipo: 'simples',
      icon: <TrendingUp className="w-5 h-5" />,
      config: {
        incluirLucroReal: true,
        incluirLucroPresumido: true,
        incluirSimplesNacional: false,
        mesesSugeridos: ['01', '02', '03'],
        descricaoDetalhada: 'Confronta as projeções do Lucro Real (cenários) com os dados reais de Lucro Presumido. Útil para validar planejamentos e ajustar estratégias.'
      }
    },
    {
      id: 'todos-regimes',
      nome: 'Comparativo Completo de Regimes',
      descricao: 'Análise detalhada por imposto de todos os regimes disponíveis',
      tipo: 'por_imposto',
      icon: <BarChart3 className="w-5 h-5" />,
      config: {
        incluirLucroReal: true,
        incluirLucroPresumido: true,
        incluirSimplesNacional: true,
        mesesSugeridos: ['01', '02', '03', '04', '05', '06'],
        descricaoDetalhada: 'Análise aprofundada comparando cada tributo (ICMS, PIS, COFINS, IRPJ, CSLL, ISS) entre os três regimes. Identifica onde cada regime é mais vantajoso.'
      }
    },
    {
      id: 'semestral',
      nome: 'Comparativo Semestral',
      descricao: 'Análise de meio ano para acompanhamento de metas',
      tipo: 'multiplo',
      icon: <Calendar className="w-5 h-5" />,
      config: {
        incluirLucroReal: true,
        incluirLucroPresumido: true,
        incluirSimplesNacional: true,
        mesesSugeridos: ['01', '02', '03', '04', '05', '06'],
        descricaoDetalhada: 'Compara os regimes para o primeiro ou segundo semestre. Ideal para reavaliações semestrais e ajustes de planejamento.'
      }
    },
    {
      id: 'cenarios-lr',
      nome: 'Comparação Entre Cenários',
      descricao: 'Compare diferentes cenários de Lucro Real entre si',
      tipo: 'cenarios',
      icon: <TrendingUp className="w-5 h-5" />,
      config: {
        incluirLucroReal: true,
        incluirLucroPresumido: false,
        incluirSimplesNacional: false,
        mesesSugeridos: ['01', '02', '03'],
        descricaoDetalhada: 'Analisa variações entre diferentes cenários de Lucro Real (conservador, moderado, otimista). Auxilia na análise de sensibilidade e gestão de riscos.'
      }
    }
  ]

  const handleSelecionarTemplate = (template: TemplateComparativo) => {
    setSelecionado(template.id)
    
    // Pequeno delay para feedback visual
    setTimeout(() => {
      onSelecionarTemplate(template)
      setAberto(false)
      setSelecionado(null)
      
      toast({
        title: "Template selecionado!",
        description: `Configurando ${template.nome}...`
      })
    }, 300)
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Usar Template
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Templates de Comparativos</DialogTitle>
          <DialogDescription>
            Escolha um template predefinido para começar rapidamente
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selecionado === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelecionarTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.nome}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.descricao}
                      </CardDescription>
                    </div>
                  </div>
                  {selecionado === template.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {template.config.descricaoDetalhada}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getTipoLabel(template.tipo)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.config.mesesSugeridos.length} {template.config.mesesSugeridos.length === 1 ? 'mês' : 'meses'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium">Regimes incluídos:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.config.incluirLucroReal && (
                      <Badge variant="outline" className="text-xs">
                        Lucro Real
                      </Badge>
                    )}
                    {template.config.incluirLucroPresumido && (
                      <Badge variant="outline" className="text-xs">
                        Lucro Presumido
                      </Badge>
                    )}
                    {template.config.incluirSimplesNacional && (
                      <Badge variant="outline" className="text-xs">
                        Simples Nacional
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getTipoLabel(tipo: TipoComparativo): string {
  const tipos: Record<TipoComparativo, string> = {
    'simples': 'Simples',
    'multiplo': 'Múltiplo',
    'temporal': 'Temporal',
    'por_imposto': 'Por Imposto',
    'cenarios': 'Entre Cenários'
  }
  return tipos[tipo] || tipo
}
