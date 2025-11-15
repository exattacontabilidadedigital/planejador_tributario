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
            {/* Resumo Executivo - Visualização de Impacto */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TrendingUp className="h-7 w-7 text-primary" />
                  Resumo Executivo
                </CardTitle>
                <CardDescription className="text-base">
                  Análise do potencial de economia tributária
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Destaque Principal - Economia */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium opacity-90 mb-2">Você pode economizar</p>
                      <p className="text-4xl md:text-5xl font-bold tracking-tight">
                        {formatarMoeda(analise.economiaAnual || 0)}
                      </p>
                      <p className="text-sm mt-2 opacity-90">por ano mudando para {getNomeRegime(analise.regimeMaisVantajoso)}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
                        <p className="text-sm font-medium opacity-90 mb-1">Potencial de economia</p>
                        <p className="text-3xl font-bold">{formatarPercentual(analise.economiaPercentual || 0)}</p>
                        <p className="text-xs mt-1 opacity-90">na sua tributação</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparação Visual em Semáforo */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Comparação entre Regimes Tributários
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      // Calcular totais de impostos por regime
                      const regimesComTotais = [
                        { 
                          id: 'lucro_real', 
                          nome: 'Lucro Real',
                          total: lucroReal?.totalImpostos || 0,
                          carga: lucroReal?.cargaTributaria || 0
                        },
                        { 
                          id: 'lucro_presumido', 
                          nome: 'Lucro Presumido',
                          total: lucroPresumido?.totalImpostos || 0,
                          carga: lucroPresumido?.cargaTributaria || 0
                        },
                        { 
                          id: 'simples_nacional', 
                          nome: 'Simples Nacional',
                          total: simplesNacional?.totalImpostos || 0,
                          carga: simplesNacional?.cargaTributaria || 0
                        }
                      ].filter(r => r.total > 0).sort((a, b) => a.total - b.total)

                      return regimesComTotais.map((regime, index) => {
                        const isMelhor = index === 0
                        const isPior = index === regimesComTotais.length - 1
                        const isIntermediario = !isMelhor && !isPior
                        
                        const corBorda = isMelhor ? 'border-green-500' : isIntermediario ? 'border-yellow-500' : 'border-red-500'
                        const corBg = isMelhor ? 'bg-green-50 dark:bg-green-950/50' : isIntermediario ? 'bg-yellow-50 dark:bg-yellow-950/50' : 'bg-red-50 dark:bg-red-950/50'
                        const icone = isMelhor ? '🟢' : isIntermediario ? '🟡' : '🔴'
                        const label = isMelhor ? 'Melhor Opção' : isIntermediario ? 'Opção Intermediária' : 'Opção Mais Cara'
                        
                        return (
                          <Card key={regime.id} className={`${corBorda} border-2 ${corBg} relative overflow-hidden`}>
                            <div className="absolute top-2 right-2 text-3xl opacity-20">{icone}</div>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center justify-between">
                                <span>{regime.nome}</span>
                                {isMelhor && <Trophy className="h-5 w-5 text-green-600" />}
                              </CardTitle>
                              <Badge 
                                variant={isMelhor ? 'default' : 'secondary'} 
                                className={`w-fit text-xs ${isMelhor ? 'bg-green-600' : isIntermediario ? 'bg-yellow-600' : 'bg-red-600'}`}
                              >
                                {label}
                              </Badge>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Total de Impostos/Ano</p>
                                <p className="text-xl font-bold">{formatarMoeda(regime.total)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Carga Tributária</p>
                                <p className="text-lg font-semibold flex items-center gap-2">
                                  <Percent className="h-4 w-4" />
                                  {formatarPercentual(regime.carga)}
                                </p>
                              </div>
                              {!isMelhor && (
                                <div className="pt-2 border-t">
                                  <p className="text-xs text-muted-foreground">A mais que a melhor opção</p>
                                  <p className="text-sm font-semibold text-red-600">
                                    +{formatarMoeda(regime.total - regimesComTotais[0].total)}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Métricas Principais em Cards Compactos */}
                <div>
                  <h3 className="font-semibold mb-4">Indicadores Principais</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Economia Anual</p>
                        <p className="text-lg font-bold text-green-600">{formatarMoeda(analise.economiaAnual || 0)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Economia %</p>
                        <p className="text-lg font-bold text-green-600">{formatarPercentual(analise.economiaPercentual || 0)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Diferença Maior-Menor</p>
                        <p className="text-lg font-bold">{formatarMoeda(analise.diferencaMaiorMenor || 0)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Regime Recomendado</p>
                        <Badge variant="default" className="text-xs">
                          {getNomeRegime(analise.regimeMaisVantajoso)}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Indicador de Urgência */}
                {analise.economiaPercentual > 10 && (
                  <div className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-500 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-500 text-white rounded-full p-2 mt-0.5">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          ⚡ Alto Potencial de Economia Identificado
                        </h4>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Com uma economia potencial de <strong>{formatarPercentual(analise.economiaPercentual || 0)}</strong>, 
                          recomendamos avaliar a mudança de regime tributário. Esta economia pode representar 
                          <strong> {formatarMoeda(analise.economiaAnual || 0)}</strong> a mais no seu caixa anualmente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Destaque - Regime Mais Vantajoso (mantido para compatibilidade) */}
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
