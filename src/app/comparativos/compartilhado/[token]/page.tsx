"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { buscarComparativoPublico, type ComparativoPublico } from "@/services/compartilhamento-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, TrendingDown, TrendingUp, DollarSign, Percent, AlertCircle, Lock } from "lucide-react"
import { GraficoDashboardComparativo } from "@/components/comparativos/graficos/grafico-dashboard-comparativo"
import { Button } from "@/components/ui/button"

export default function ComparativoCompartilhadoPage() {
  const params = useParams()
  const token = params.token as string

  const [comparativo, setComparativo] = useState<ComparativoPublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarComparativo() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 [PÁGINA PÚBLICA] Carregando comparativo:', { token })
        
        const dados = await buscarComparativoPublico(token)
        
        if (!dados) {
          setError('Link inválido ou expirado')
          return
        }
        
        setComparativo(dados)
      } catch (err) {
        console.error('❌ [PÁGINA PÚBLICA] Erro ao carregar:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar relatório')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      carregarComparativo()
    }
  }, [token])

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando relatório...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Estado de erro
  if (error || !comparativo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {error || 'Este link de compartilhamento não é válido ou expirou.'}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Verifique se o link está completo e correto</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>O link pode ter expirado após 30 dias</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>O proprietário pode ter desativado o compartilhamento</span>
                </li>
              </ul>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Entre em contato com quem compartilhou este relatório para obter um novo link.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extrair análise dos resultados
  const resultados = comparativo.resultados
  const temVencedor = resultados && 'vencedor' in resultados
  const temInsights = resultados && 'insights' in resultados
  
  let analise: any
  if (temVencedor || temInsights) {
    const r = resultados as any
    analise = {
      regimeMaisVantajoso: r.vencedor?.regime || '',
      economiaAnual: r.vencedor?.economia || 0,
      economiaPercentual: r.vencedor?.economiaPercentual || 0,
      diferencaMaiorMenor: r.vencedor?.diferencaMaiorMenor || 0,
      insights: r.insights?.map((i: any) => i.descricao || i.mensagem || i) || [],
      recomendacoes: r.recomendacoes?.map((r: any) => r.descricao || r.acao || r) || []
    }
  } else {
    analise = resultados?.analise
  }

  // Extrair dados dos regimes
  const regimes = resultados?.comparacao?.regimes || {}
  const lucroReal = regimes.lucro_real
  const lucroPresumido = regimes.lucro_presumido  
  const simplesNacional = regimes.simples_nacional

  const getNomeRegime = (regime: string): string => {
    const nomes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime] || regime
  }

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    })
  }

  const formatarPercentual = (valor: number): string => {
    return `${valor.toFixed(2)}%`
  }

  const ano = comparativo.configuracao?.ano || new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header com marca d'água de compartilhamento */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                Relatório Compartilhado
              </Badge>
              <h1 className="text-2xl font-bold">{comparativo.nome}</h1>
              {comparativo.empresaNome && (
                <p className="text-sm text-muted-foreground">
                  {comparativo.empresaNome}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Gerado em: {new Date(comparativo.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {analise && (
          <>
            {/* Card de Destaque - Regime Mais Vantajoso */}
            <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-green-600" />
                    Regime Mais Vantajoso
                  </CardTitle>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {getNomeRegime(analise.regimeMaisVantajoso)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Economia Anual</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarMoeda(analise.economiaAnual || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Economia Percentual</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarPercentual(analise.economiaPercentual || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Diferença vs. Maior</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarMoeda(analise.diferencaMaiorMenor || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico Principal */}
            {(lucroReal?.dadosMensais || lucroPresumido?.dadosMensais || simplesNacional?.dadosMensais) && (
              <GraficoDashboardComparativo
                dadosLucroReal={lucroReal?.dadosMensais}
                dadosLucroPresumido={lucroPresumido?.dadosMensais}
                dadosSimplesNacional={simplesNacional?.dadosMensais}
                ano={ano}
              />
            )}

            {/* Insights */}
            {analise.insights && analise.insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Insights da Análise
                  </CardTitle>
                  <CardDescription>
                    Principais observações sobre os regimes tributários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analise.insights.map((insight: any, index: number) => {
                      const texto = typeof insight === 'string' ? insight : insight.descricao || insight.mensagem
                      return (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="mt-0.5 text-primary">•</div>
                          <span className="text-sm flex-1">{texto}</span>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recomendações */}
            {analise.recomendacoes && analise.recomendacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Recomendações
                  </CardTitle>
                  <CardDescription>
                    Ações sugeridas com base na análise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analise.recomendacoes.map((rec: any, index: number) => {
                      const texto = typeof rec === 'string' ? rec : rec.descricao || rec.acao
                      return (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                          <div className="mt-0.5 text-blue-600">→</div>
                          <span className="text-sm flex-1">{texto}</span>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Rodapé */}
        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Este é um relatório compartilhado do Sistema de Planejamento Tributário
              </p>
              <p className="text-xs text-muted-foreground">
                Para criar suas próprias análises, solicite acesso ao sistema
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
