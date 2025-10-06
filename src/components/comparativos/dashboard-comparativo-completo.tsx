"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2,
  Info,
  DollarSign,
  Percent,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Share2,
  Star,
  Trash2
} from "lucide-react"
import type { ComparativoCompleto } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface DashboardComparativoCompletoProps {
  comparativo: ComparativoCompleto
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onToggleFavorito?: () => void
}

export function DashboardComparativoCompleto({
  comparativo,
  onEdit,
  onDelete,
  onShare,
  onToggleFavorito
}: DashboardComparativoCompletoProps) {

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`
  }

  const formatarRegime = (regime: RegimeTributario | string): string => {
    const nomes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime] || regime
  }

  const obterCorRegime = (regime: RegimeTributario | string): string => {
    const cores: Record<string, string> = {
      'lucro_real': 'bg-blue-500',
      'lucro_presumido': 'bg-green-500',
      'simples_nacional': 'bg-orange-500'
    }
    return cores[regime] || 'bg-gray-500'
  }

  const obterIconeInsight = (tipo: string) => {
    switch (tipo) {
      case 'economia': return <DollarSign className="h-4 w-4" />
      case 'alerta': return <AlertTriangle className="h-4 w-4" />
      case 'tendencia': return <TrendingUp className="h-4 w-4" />
      case 'breakeven': return <BarChart3 className="h-4 w-4" />
      case 'outlier': return <Info className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const obterCorPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive'
      case 'media': return 'default'
      case 'baixa': return 'secondary'
      default: return 'outline'
    }
  }

  const obterCorNivelAlerta = (nivel: string) => {
    switch (nivel) {
      case 'error': return 'destructive'
      case 'warning': return 'default'
      case 'info': return 'secondary'
      default: return 'outline'
    }
  }

  const { resultados, configuracao } = comparativo
  const { vencedor, comparacao, insights, recomendacoes, alertas, variacaoLucroReal, cobertura } = resultados

  // Ordenar regimes por carga tributária
  const regimesOrdenados = Object.entries(comparacao.regimes)
    .sort(([, a], [, b]) => a.cargaTributaria - b.cargaTributaria)

  return (
    <div className="space-y-6">
      {/* Header do Comparativo */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{comparativo.nome}</h1>
            {comparativo.favorito && <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />}
          </div>
          {comparativo.descricao && (
            <p className="text-muted-foreground">{comparativo.descricao}</p>
          )}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {configuracao.mesesSelecionados.length} meses • {configuracao.ano}
            </span>
            <span>
              Criado em {new Date(comparativo.criadoEm).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {onToggleFavorito && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleFavorito}
            >
              <Star className={comparativo.favorito ? "h-4 w-4 fill-yellow-500 text-yellow-500" : "h-4 w-4"} />
            </Button>
          )}
          {onShare && (
            <Button
              variant="outline"
              size="icon"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Card do Vencedor (Hero Section) */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h2 className="text-2xl font-bold">Regime Vencedor</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${obterCorRegime(vencedor.regime)}`} />
                <span className="text-3xl font-bold">
                  {formatarRegime(vencedor.regime)}
                </span>
                {vencedor.cenarioNome && (
                  <Badge variant="outline" className="text-base">
                    {vencedor.cenarioNome}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {vencedor.justificativa}
              </p>
            </div>

            <div className="text-right space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Economia Total</div>
                <div className="text-4xl font-bold text-green-600">
                  {formatarMoeda(vencedor.economia)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Economia Percentual</div>
                <div className="text-2xl font-semibold text-green-600">
                  {formatarPercentual(vencedor.economiaPercentual)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Resumo Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Regimes</CardTitle>
          <CardDescription>Análise detalhada de cada regime tributário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Regime</th>
                  <th className="text-right py-3 px-4 font-semibold">Receita Total</th>
                  <th className="text-right py-3 px-4 font-semibold">Total Impostos</th>
                  <th className="text-right py-3 px-4 font-semibold">Lucro Líquido</th>
                  <th className="text-right py-3 px-4 font-semibold">Carga Tributária</th>
                  <th className="text-center py-3 px-4 font-semibold">Cobertura</th>
                </tr>
              </thead>
              <tbody>
                {regimesOrdenados.map(([key, resultado], index) => {
                  const isVencedor = resultado.regime === vencedor.regime && 
                    (!vencedor.cenarioId || resultado.cenarioId === vencedor.cenarioId)
                  
                  return (
                    <tr
                      key={key}
                      className={`border-b hover:bg-muted/50 ${
                        isVencedor ? 'bg-primary/5 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${obterCorRegime(resultado.regime)}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              {formatarRegime(resultado.regime)}
                              {isVencedor && <Trophy className="h-4 w-4 text-yellow-500" />}
                              {index === 0 && !isVencedor && <span className="text-xs text-green-600">Melhor</span>}
                            </div>
                            {resultado.cenarioNome && (
                              <div className="text-xs text-muted-foreground">
                                {resultado.cenarioNome}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatarMoeda(resultado.receitaTotal)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatarMoeda(resultado.totalImpostos)}
                      </td>
                      <td className="text-right py-3 px-4 text-green-600">
                        {formatarMoeda(resultado.lucroLiquido)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge variant={isVencedor ? 'default' : 'outline'}>
                          {formatarPercentual(resultado.cargaTributaria)}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge
                          variant={resultado.percentualCobertura === 100 ? 'default' : 'secondary'}
                        >
                          {formatarPercentual(resultado.percentualCobertura)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Variação de Lucro Real (se houver múltiplos cenários) */}
      {variacaoLucroReal && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Cenários - Lucro Real</CardTitle>
            <CardDescription>
              Variação entre cenários conservador, moderado e otimista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {/* Melhor Cenário */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingDown className="h-5 w-5" />
                  <span className="font-semibold">Melhor Cenário</span>
                </div>
                <div className="text-2xl font-bold">
                  {variacaoLucroReal.cenarioMelhor.cenarioNome || 'Otimista'}
                </div>
                <div className="space-y-1 text-sm">
                  <div>Carga: {formatarPercentual(variacaoLucroReal.cenarioMelhor.cargaTributaria)}</div>
                  <div>Impostos: {formatarMoeda(variacaoLucroReal.cenarioMelhor.totalImpostos)}</div>
                </div>
              </div>

              {/* Cenário Médio */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-semibold">Cenário Médio</span>
                </div>
                <div className="text-2xl font-bold">Média dos Cenários</div>
                <div className="space-y-1 text-sm">
                  <div>Carga: {formatarPercentual(variacaoLucroReal.cenarioMedio.cargaTributaria)}</div>
                  <div>Impostos: {formatarMoeda(variacaoLucroReal.cenarioMedio.totalImpostos)}</div>
                </div>
              </div>

              {/* Pior Cenário */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Pior Cenário</span>
                </div>
                <div className="text-2xl font-bold">
                  {variacaoLucroReal.cenarioPior.cenarioNome || 'Conservador'}
                </div>
                <div className="space-y-1 text-sm">
                  <div>Carga: {formatarPercentual(variacaoLucroReal.cenarioPior.cargaTributaria)}</div>
                  <div>Impostos: {formatarMoeda(variacaoLucroReal.cenarioPior.totalImpostos)}</div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amplitude de Variação:</span>
                <span className="ml-2 font-semibold">
                  {formatarMoeda(variacaoLucroReal.amplitude)} ({formatarPercentual(variacaoLucroReal.amplitudePercentual)})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Desvio Padrão:</span>
                <span className="ml-2 font-semibold">
                  {formatarMoeda(variacaoLucroReal.desviopadrao)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights em Destaque */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights Importantes
            </CardTitle>
            <CardDescription>
              Análises automáticas geradas pelo sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {insights
                .filter(i => i.destaque)
                .slice(0, 5)
                .map((insight) => (
                  <Card key={insight.id} className="bg-muted/50">
                    <CardContent className="flex items-start gap-4 pt-6">
                      <div className="mt-1">
                        {obterIconeInsight(insight.tipo)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          {insight.icone} {insight.titulo}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.descricao}
                        </p>
                        {(insight.valor !== undefined || insight.percentual !== undefined) && (
                          <div className="flex gap-4 text-sm font-semibold pt-1">
                            {insight.valor !== undefined && (
                              <span className="text-primary">
                                {formatarMoeda(insight.valor)}
                              </span>
                            )}
                            {insight.percentual !== undefined && (
                              <span className="text-primary">
                                {formatarPercentual(insight.percentual)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Mostrar todos os insights não destacados */}
              {insights.filter(i => !i.destaque).length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Ver todos os insights ({insights.filter(i => !i.destaque).length} adicionais)
                  </summary>
                  <div className="mt-4 space-y-3">
                    {insights
                      .filter(i => !i.destaque)
                      .map((insight) => (
                        <div key={insight.id} className="flex items-start gap-3 text-sm">
                          <div className="mt-0.5">
                            {obterIconeInsight(insight.tipo)}
                          </div>
                          <div>
                            <div className="font-medium">{insight.titulo}</div>
                            <div className="text-muted-foreground">{insight.descricao}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {recomendacoes && recomendacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recomendações
            </CardTitle>
            <CardDescription>
              Ações sugeridas para otimização tributária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recomendacoes.map((rec) => (
                <Card key={rec.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{rec.titulo}</h4>
                          <Badge variant={obterCorPrioridade(rec.prioridade)}>
                            {rec.prioridade.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.descricao}
                        </p>
                        
                        {rec.acoes && rec.acoes.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-2">Ações sugeridas:</div>
                            <ul className="space-y-1">
                              {rec.acoes.map((acao, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                                  <span>{acao}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                          {rec.prazo && (
                            <span>📅 Prazo: {rec.prazo}</span>
                          )}
                          {rec.complexidade && (
                            <span>
                              ⚙️ Complexidade: {rec.complexidade}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm text-muted-foreground">Impacto Financeiro</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatarMoeda(rec.impactoFinanceiro)}
                        </div>
                        <div className="text-sm text-green-600">
                          {formatarPercentual(rec.impactoPercentual)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {alertas && alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas e Avisos
            </CardTitle>
            <CardDescription>
              Pontos de atenção identificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <Card key={alerta.id} className={`border-l-4 ${
                  alerta.nivel === 'error' ? 'border-l-red-500' :
                  alerta.nivel === 'warning' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <AlertTriangle className={`h-5 w-5 ${
                      alerta.nivel === 'error' ? 'text-red-500' :
                      alerta.nivel === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{alerta.titulo}</h4>
                        <Badge variant={obterCorNivelAlerta(alerta.nivel)}>
                          {alerta.nivel.toUpperCase()}
                        </Badge>
                        {alerta.requer_acao && (
                          <Badge variant="outline" className="text-xs">
                            Requer Ação
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alerta.descricao}
                      </p>
                      {alerta.valor !== undefined && (
                        <div className="text-sm font-semibold mt-2">
                          Valor: {formatarMoeda(alerta.valor)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cobertura de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Cobertura de Dados</CardTitle>
          <CardDescription>
            Análise da completude dos dados utilizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Cobertura Geral</span>
                  <span className="font-semibold">
                    {formatarPercentual(cobertura.percentualCobertura)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${cobertura.percentualCobertura}%` }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-muted-foreground mb-2">Meses com Dados</div>
                <div className="flex flex-wrap gap-1">
                  {cobertura.mesesComDados.map(mes => (
                    <Badge key={mes} variant="default">
                      {mes}
                    </Badge>
                  ))}
                </div>
              </div>

              {cobertura.mesesSemDados.length > 0 && (
                <div>
                  <div className="text-muted-foreground mb-2">Meses sem Dados</div>
                  <div className="flex flex-wrap gap-1">
                    {cobertura.mesesSemDados.map(mes => (
                      <Badge key={mes} variant="outline">
                        {mes}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {cobertura.regimesIncompletos.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      Dados Incompletos
                    </div>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      Os seguintes regimes não possuem dados completos para todos os meses:
                      {' '}
                      {cobertura.regimesIncompletos.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Área para Gráficos (Placeholder) */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <LineChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Gráfico de Evolução Mensal</h3>
            <p className="text-sm text-muted-foreground">
              Visualize a evolução dos impostos ao longo dos meses
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PieChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Composição de Impostos</h3>
            <p className="text-sm text-muted-foreground">
              Breakdown detalhado dos impostos por tipo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
