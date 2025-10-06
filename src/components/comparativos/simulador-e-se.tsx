"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  Save,
  RotateCcw,
  Play,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import type { ComparativoCompleto, Simulacao } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface SimuladorESeProps {
  comparativo: ComparativoCompleto
  onSalvarSimulacao?: (simulacao: Simulacao) => Promise<void>
}

export function SimuladorESe({ comparativo, onSalvarSimulacao }: SimuladorESeProps) {
  
  const [variacaoReceita, setVariacaoReceita] = useState<number>(0)
  const [variacoesAliquotas, setVariacoesAliquotas] = useState<Record<string, number>>({})
  const [simulacaoAtiva, setSimulacaoAtiva] = useState<Simulacao | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [cenarioPredefinido, setCenarioPredefinido] = useState<string | null>(null)

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return `${valor >= 0 ? '+' : ''}${valor.toFixed(2)}%`
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

  // Cenários pré-definidos
  const cenariosPredefinidos = [
    {
      id: 'otimista',
      nome: 'Otimista',
      descricao: 'Crescimento de 20% na receita',
      icone: <TrendingUp className="h-4 w-4" />,
      cor: 'bg-green-500',
      parametros: {
        variacaoReceita: 20,
        variacaoAliquotas: {}
      }
    },
    {
      id: 'pessimista',
      nome: 'Pessimista',
      descricao: 'Redução de 20% na receita',
      icone: <TrendingDown className="h-4 w-4" />,
      cor: 'bg-red-500',
      parametros: {
        variacaoReceita: -20,
        variacaoAliquotas: {}
      }
    },
    {
      id: 'crescimento_moderado',
      nome: 'Crescimento Moderado',
      descricao: 'Aumento de 10% na receita',
      icone: <TrendingUp className="h-4 w-4" />,
      cor: 'bg-blue-500',
      parametros: {
        variacaoReceita: 10,
        variacaoAliquotas: {}
      }
    },
    {
      id: 'reducao_moderada',
      nome: 'Redução Moderada',
      descricao: 'Queda de 10% na receita',
      icone: <TrendingDown className="h-4 w-4" />,
      cor: 'bg-orange-500',
      parametros: {
        variacaoReceita: -10,
        variacaoAliquotas: {}
      }
    }
  ]

  // Simular com os parâmetros atuais
  const executarSimulacao = () => {
    // TODO: Implementar lógica real de simulação
    // Por enquanto, vamos criar uma simulação mockada
    
    const resultadosOriginais = comparativo.resultados.comparacao.regimes
    const resultadosSimulados: Record<string, any> = {}

    Object.entries(resultadosOriginais).forEach(([key, resultado]) => {
      const fatorReceita = 1 + (variacaoReceita / 100)
      
      resultadosSimulados[key] = {
        ...resultado,
        receitaTotal: resultado.receitaTotal * fatorReceita,
        totalImpostos: resultado.totalImpostos * fatorReceita,
        lucroLiquido: resultado.lucroLiquido * fatorReceita
      }
    })

    // Determinar novo vencedor
    const regimesOrdenados = Object.entries(resultadosSimulados)
      .sort(([, a], [, b]) => a.totalImpostos - b.totalImpostos)
    
    const novoVencedor = regimesOrdenados[0]
    const vencedorOriginal = comparativo.resultados.vencedor
    
    const mudouVencedor = novoVencedor[1].regime !== vencedorOriginal.regime

    const simulacao: Simulacao = {
      id: `sim_${Date.now()}`,
      nome: cenarioPredefinido 
        ? cenariosPredefinidos.find(c => c.id === cenarioPredefinido)?.nome || 'Simulação Personalizada'
        : 'Simulação Personalizada',
      descricao: `Variação de receita: ${formatarPercentual(variacaoReceita)}`,
      tipo: cenarioPredefinido === 'otimista' ? 'cenario_otimista' :
            cenarioPredefinido === 'pessimista' ? 'cenario_pessimista' :
            'variacao_receita',
      parametros: {
        variacaoReceita,
        variacaoAliquotas: variacoesAliquotas
      },
      resultados: {
        regimes: resultadosSimulados,
        novoVencedor: {
          regime: novoVencedor[1].regime,
          mudou: mudouVencedor,
          economia: novoVencedor[1].lucroLiquido - regimesOrdenados[regimesOrdenados.length - 1][1].lucroLiquido
        },
        diferencaEconomia: (vencedorOriginal.economia * (1 + variacaoReceita / 100)) - vencedorOriginal.economia,
        impactoLucroLiquido: (novoVencedor[1].lucroLiquido - vencedorOriginal.economia),
        insights: [
          {
            id: 'sim_insight_1',
            tipo: 'projecao',
            icone: '📊',
            titulo: mudouVencedor ? 'Mudança de Regime Vencedor!' : 'Regime Vencedor Mantido',
            descricao: mudouVencedor
              ? `Com ${formatarPercentual(variacaoReceita)} na receita, ${formatarRegime(novoVencedor[1].regime)} se torna mais vantajoso`
              : `Mesmo com ${formatarPercentual(variacaoReceita)} na receita, ${formatarRegime(vencedorOriginal.regime)} continua sendo o melhor`,
            destaque: mudouVencedor,
            ordem: 1
          }
        ]
      }
    }

    setSimulacaoAtiva(simulacao)
  }

  const aplicarCenarioPredefinido = (cenarioId: string) => {
    const cenario = cenariosPredefinidos.find(c => c.id === cenarioId)
    if (cenario) {
      setCenarioPredefinido(cenarioId)
      setVariacaoReceita(cenario.parametros.variacaoReceita)
      setVariacoesAliquotas(cenario.parametros.variacaoAliquotas)
    }
  }

  const resetarSimulacao = () => {
    setVariacaoReceita(0)
    setVariacoesAliquotas({})
    setSimulacaoAtiva(null)
    setCenarioPredefinido(null)
  }

  const salvarSimulacao = async () => {
    if (!simulacaoAtiva || !onSalvarSimulacao) return
    
    setSalvando(true)
    try {
      await onSalvarSimulacao(simulacaoAtiva)
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error('Erro ao salvar simulação:', error)
      // TODO: Mostrar toast de erro
    } finally {
      setSalvando(false)
    }
  }

  const vencedorAtual = comparativo.resultados.vencedor

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Simulador "E se..."
          </CardTitle>
          <CardDescription>
            Simule diferentes cenários e veja como impactam a escolha do regime tributário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cenarios" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cenarios">Cenários Pré-definidos</TabsTrigger>
              <TabsTrigger value="receita">Variação de Receita</TabsTrigger>
              <TabsTrigger value="aliquotas">Alíquotas</TabsTrigger>
            </TabsList>

            {/* TAB: Cenários Pré-definidos */}
            <TabsContent value="cenarios" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {cenariosPredefinidos.map(cenario => (
                  <Card
                    key={cenario.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      cenarioPredefinido === cenario.id
                        ? 'border-2 border-primary'
                        : 'border'
                    }`}
                    onClick={() => aplicarCenarioPredefinido(cenario.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${cenario.cor} text-white`}>
                          {cenario.icone}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{cenario.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cenario.descricao}
                          </p>
                        </div>
                        {cenarioPredefinido === cenario.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Dica:</strong> Selecione um cenário pré-definido ou personalize os parâmetros nas outras abas.
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: Variação de Receita */}
            <TabsContent value="receita" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="variacao-receita">
                    Variação de Receita
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={variacaoReceita > 0 ? 'default' : variacaoReceita < 0 ? 'destructive' : 'outline'}>
                      {formatarPercentual(variacaoReceita)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    id="variacao-receita"
                    min={-50}
                    max={50}
                    step={1}
                    value={[variacaoReceita]}
                    onValueChange={(value) => {
                      setVariacaoReceita(value[0])
                      setCenarioPredefinido(null)
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Receita Atual</div>
                    <div className="text-xl font-bold">
                      {formatarMoeda(
                        Object.values(comparativo.resultados.comparacao.regimes)
                          .reduce((acc, r) => acc + r.receitaTotal, 0) / 
                          Object.keys(comparativo.resultados.comparacao.regimes).length
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10">
                    <div className="text-sm text-muted-foreground mb-1">Receita Simulada</div>
                    <div className="text-xl font-bold text-primary">
                      {formatarMoeda(
                        (Object.values(comparativo.resultados.comparacao.regimes)
                          .reduce((acc, r) => acc + r.receitaTotal, 0) / 
                          Object.keys(comparativo.resultados.comparacao.regimes).length) *
                        (1 + variacaoReceita / 100)
                      )}
                    </div>
                  </div>
                </div>

                {/* Atalhos rápidos */}
                <div className="space-y-2">
                  <Label>Atalhos Rápidos</Label>
                  <div className="flex flex-wrap gap-2">
                    {[-25, -10, -5, 5, 10, 25].map(valor => (
                      <Button
                        key={valor}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVariacaoReceita(valor)
                          setCenarioPredefinido(null)
                        }}
                      >
                        {valor > 0 ? '+' : ''}{valor}%
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: Alíquotas */}
            <TabsContent value="aliquotas" className="space-y-4">
              <div className="space-y-4">
                {['ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'CPP'].map(imposto => (
                  <div key={imposto} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`aliquota-${imposto}`}>
                        {imposto}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`aliquota-${imposto}`}
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={variacoesAliquotas[imposto] || 0}
                          onChange={(e) => {
                            const valor = parseFloat(e.target.value) || 0
                            setVariacoesAliquotas(prev => ({
                              ...prev,
                              [imposto]: valor
                            }))
                            setCenarioPredefinido(null)
                          }}
                          className="w-24 text-right"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Slider
                      min={0}
                      max={50}
                      step={0.5}
                      value={[variacoesAliquotas[imposto] || 0]}
                      onValueChange={(value) => {
                        setVariacoesAliquotas(prev => ({
                          ...prev,
                          [imposto]: value[0]
                        }))
                        setCenarioPredefinido(null)
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-900 dark:text-yellow-100">
                    <strong>Atenção:</strong> As alíquotas inseridas aqui sobrescrevem as alíquotas reais dos regimes para fins de simulação.
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={executarSimulacao}
              className="flex-1"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Executar Simulação
            </Button>
            <Button
              onClick={resetarSimulacao}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Simulação */}
      {simulacaoAtiva && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Resultados da Simulação</CardTitle>
                <CardDescription>{simulacaoAtiva.nome}</CardDescription>
              </div>
              {onSalvarSimulacao && (
                <Button
                  onClick={salvarSimulacao}
                  disabled={salvando}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vencedor */}
            {simulacaoAtiva.resultados.novoVencedor && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary">
                <div className="flex items-center gap-3">
                  {simulacaoAtiva.resultados.novoVencedor.mudou ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-900 dark:text-orange-100">
                        Mudança de Vencedor!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        Vencedor Mantido
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Regime Vencedor</div>
                    <div className="text-xl font-bold">
                      {formatarRegime(simulacaoAtiva.resultados.novoVencedor.regime)}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Economia Estimada</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatarMoeda(simulacaoAtiva.resultados.novoVencedor.economia)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comparação Original vs Simulado */}
            <div>
              <h4 className="font-semibold mb-4">Comparação de Resultados</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Regime</th>
                      <th className="text-right py-3 px-4 font-semibold">Original</th>
                      <th className="text-right py-3 px-4 font-semibold">Simulado</th>
                      <th className="text-right py-3 px-4 font-semibold">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(simulacaoAtiva.resultados.regimes).map(([key, resultado]) => {
                      const original = comparativo.resultados.comparacao.regimes[key]
                      const diferenca = resultado.totalImpostos - original.totalImpostos
                      const diferencaPerc = original.totalImpostos > 0
                        ? ((diferenca / original.totalImpostos) * 100)
                        : 0

                      return (
                        <tr key={key} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${obterCorRegime(resultado.regime)}`} />
                              {formatarRegime(resultado.regime)}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatarMoeda(original.totalImpostos)}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold">
                            {formatarMoeda(resultado.totalImpostos)}
                          </td>
                          <td className={`text-right py-3 px-4 font-semibold ${
                            diferenca > 0 ? 'text-red-600' :
                            diferenca < 0 ? 'text-green-600' :
                            'text-muted-foreground'
                          }`}>
                            {formatarMoeda(diferenca)}
                            <span className="text-xs ml-1">
                              ({formatarPercentual(diferencaPerc)})
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Insights da Simulação */}
            {simulacaoAtiva.resultados.insights && simulacaoAtiva.resultados.insights.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Insights da Simulação</h4>
                {simulacaoAtiva.resultados.insights.map(insight => (
                  <Card key={insight.id} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{insight.icone}</div>
                        <div className="flex-1">
                          <h5 className="font-semibold">{insight.titulo}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {insight.descricao}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
