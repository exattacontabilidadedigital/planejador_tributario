"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, TrendingDown, TrendingUp, DollarSign, Percent } from "lucide-react"
import type { Comparativo } from "@/types/comparativo-analise"
import { GraficoComparacaoImpostos } from "./graficos/grafico-comparacao-impostos"
import { GraficoCargaTributaria } from "./graficos/grafico-carga-tributaria"
import { GraficoEvolucaoRegimes } from "./graficos/grafico-evolucao-regimes"
import { GraficoComparacaoLucros } from "./graficos/grafico-comparacao-lucros"
import { GraficoDashboardComparativo } from "./graficos/grafico-dashboard-comparativo"

interface VisualizacaoComparativoProps {
  comparativo: Comparativo
}

export function VisualizacaoComparativo({ comparativo }: VisualizacaoComparativoProps) {
  const { resultados, nome, descricao, id } = comparativo

  // Compartilhamento
  const [linkCompartilhado, setLinkCompartilhado] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Função para gerar token e link
  const gerarLinkCompartilhado = async () => {
    // Gerar token aleatório (pode ser substituído por backend/Supabase)
    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    // Salvar token no backend (TODO: implementar persistência)
    // await api.salvarTokenCompartilhamento({ comparativoId: id, token })
    // Gerar link público
    const url = `${window.location.origin}/comparativos/compartilhado/${token}`
    setLinkCompartilhado(url)
    setCopiado(false)
    // Exemplo: pode salvar no banco via Supabase
    // ...
  }

  // Função para copiar link
  const copiarLink = () => {
    if (linkCompartilhado) {
      navigator.clipboard.writeText(linkCompartilhado)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }
  
  console.log('🔍 [VISUALIZAÇÃO] Comparativo recebido:', {
    nome,
    temResultados: !!resultados,
    tipoResultados: typeof resultados,
    keysResultados: resultados ? Object.keys(resultados) : [],
    resultadosCompleto: resultados
  })
  
  // Detectar estrutura pelos campos reais presentes
  // Estrutura nova (AnaliseComparativaCompleto): tem 'vencedor', 'insights', 'comparacao'
  // Estrutura antiga (ResultadosComparativo): tem 'analise', 'lucroReal', 'lucroPresumido'
  const temVencedor = resultados && 'vencedor' in resultados
  const temInsights = resultados && 'insights' in resultados
  const temAnaliseProperty = resultados && 'analise' in resultados
  const temLucroReal = resultados && 'lucroReal' in resultados
  
  console.log('🔍 [VISUALIZAÇÃO] Análise de estrutura:', {
    temVencedor,
    temInsights,
    temAnaliseProperty,
    temLucroReal,
    todasAsChaves: resultados ? Object.keys(resultados) : []
  })
  
  // Estrutura nova: resultados é AnaliseComparativa diretamente (tem vencedor)
  const isNovaEstrutura = (temVencedor || temInsights) && !temAnaliseProperty
  
  console.log('🔍 [VISUALIZAÇÃO] Detecção de estrutura:', {
    isNovaEstrutura,
    temAnalise: temAnaliseProperty,
    temVencedor
  })
  
  // Extrair/adaptar análise de acordo com a estrutura detectada
  let analise: any
  if (isNovaEstrutura) {
    // Estrutura nova: adaptar AnaliseComparativaCompleto para formato esperado
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
  
  console.log('🔍 [VISUALIZAÇÃO] Análise extraída:', {
    temAnalise: !!analise,
    keysAnalise: analise ? Object.keys(analise) : [],
    analise
  })
  
  // Extrair dados dos regimes para estrutura antiga e nova
  let lucroReal: any
  let lucroPresumido: any
  let simplesNacional: any
  
  if (isNovaEstrutura) {
    // Estrutura nova: extrair dados de comparacao.regimes
    const r = resultados as any
    const regimes = r.comparacao?.regimes || {}
    
    console.log('🔍 [DEBUG ESTRUTURA] Explorando resultados completos:', {
      resultadosKeys: Object.keys(r),
      temComparacao: !!r.comparacao,
      comparacaoKeys: r.comparacao ? Object.keys(r.comparacao) : [],
      temRegimes: !!regimes,
      regimesKeys: Object.keys(regimes),
      regimesCompleto: regimes,
      todasPropriedadesR: r
    })
    
    // Função para consolidar dados de múltiplos cenários do mesmo regime
    const consolidarDadosRegime = (nomeRegime: string) => {
      // Buscar por chave direta primeiro
      const dadoDireto = regimes[nomeRegime] || regimes[nomeRegime.replace('_', '')] || regimes[nomeRegime.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())]
      
      if (dadoDireto && dadoDireto.dadosMensais && dadoDireto.dadosMensais.length > 0) {
        return dadoDireto
      }
      
      // Se não encontrou direto, procurar por chaves que comecem com o nome do regime
      const chavesCenarios = Object.keys(regimes).filter(k => k.startsWith(nomeRegime))
      
      if (chavesCenarios.length === 0) return null
      
      // Se encontrou múltiplos cenários, consolidar os dados mensais
      const todosOsDadosMensais: any[] = []
      let regimeConsolidado: any = {
        regime: nomeRegime,
        dadosMensais: [],
        receitaTotal: 0,
        lucroLiquido: 0,
        totalImpostos: 0,
        cargaTributaria: 0
      }
      
      chavesCenarios.forEach(chave => {
        const dadosCenario = regimes[chave]
        console.log(`🔧 [CONSOLIDAÇÃO] Processando cenário ${chave}:`, {
          dadosCenario,
          temDadosMensais: !!dadosCenario.dadosMensais,
          quantidadeMeses: dadosCenario.dadosMensais?.length || 0,
          primeiroMes: dadosCenario.dadosMensais?.[0],
          cenarioCompleto: {
            nome: dadosCenario.cenarioNome,
            receita: dadosCenario.receitaTotal,
            impostos: dadosCenario.impostos,
            totalImpostos: dadosCenario.totalImpostos,
            lucroLiquido: dadosCenario.lucroLiquido
          }
        })
        
        if (dadosCenario.dadosMensais) {
          // Log cada dado mensal
          dadosCenario.dadosMensais.forEach((dadoMensal: any, idx: number) => {
            console.log(`  📅 Mês ${idx + 1}:`, {
              mes: dadoMensal.mes,
              ano: dadoMensal.ano,
              receita: dadoMensal.receita,
              impostos: dadoMensal.impostos,
              totalImpostos: dadoMensal.totalImpostos,
              lucroLiquido: dadoMensal.lucroLiquido
            })
          })
          todosOsDadosMensais.push(...dadosCenario.dadosMensais)
        }
        regimeConsolidado.receitaTotal += dadosCenario.receitaTotal || 0
        regimeConsolidado.lucroLiquido += dadosCenario.lucroLiquido || 0
        regimeConsolidado.totalImpostos += dadosCenario.totalImpostos || 0
      })
      
      regimeConsolidado.dadosMensais = todosOsDadosMensais
      regimeConsolidado.cargaTributaria = regimeConsolidado.receitaTotal > 0 
        ? (regimeConsolidado.totalImpostos / regimeConsolidado.receitaTotal * 100) 
        : 0
      
      console.log(`✨ [CONSOLIDAÇÃO] ${nomeRegime}:`, {
        cenarios: chavesCenarios.length,
        meses: todosOsDadosMensais.length,
        consolidado: regimeConsolidado
      })
      
      return regimeConsolidado
    }
    
    // Tentar pegar os dados usando consolidação
    lucroReal = consolidarDadosRegime('lucro_real')
    lucroPresumido = consolidarDadosRegime('lucro_presumido')
    simplesNacional = consolidarDadosRegime('simples_nacional')
    
    console.log('🔍 [VISUALIZAÇÃO] Dados extraídos da estrutura nova:', {
      temLucroReal: !!lucroReal,
      temLucroPresumido: !!lucroPresumido,
      temSimplesNacional: !!simplesNacional,
      lucroRealKeys: lucroReal ? Object.keys(lucroReal) : [],
      lucroPresumidoKeys: lucroPresumido ? Object.keys(lucroPresumido) : [],
      simplesNacionalKeys: simplesNacional ? Object.keys(simplesNacional) : [],
      dadosMensaisLR: lucroReal?.dadosMensais?.length || 0,
      dadosMensaisLP: lucroPresumido?.dadosMensais?.length || 0,
      dadosMensaisSN: simplesNacional?.dadosMensais?.length || 0,
      lucroRealCompleto: lucroReal,
      lucroPresumidoCompleto: lucroPresumido,
      simplesNacionalCompleto: simplesNacional,
      todasKeys: r.comparacao ? Object.keys(r.comparacao) : [],
      regimesKeys: Object.keys(regimes),
      resultadosKeys: Object.keys(r)
    })
    
    console.log('📊 [VISUALIZAÇÃO] Verificação de dados mensais:', {
      temAlgumDadoMensal: !!(lucroReal?.dadosMensais || lucroPresumido?.dadosMensais || simplesNacional?.dadosMensais),
      condicaoGrafico: !!(lucroReal?.dadosMensais || lucroPresumido?.dadosMensais || simplesNacional?.dadosMensais)
    })
  } else {
    // Estrutura antiga: extrair diretamente
    lucroReal = resultados?.lucroReal
    lucroPresumido = resultados?.lucroPresumido
    simplesNacional = resultados?.simplesNacional
  }
  
  // Verificar se temos dados para exibir
  if (!analise) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Análise não disponível</p>
            <p className="text-sm mt-2">Os dados do comparativo ainda estão sendo processados.</p>
            <details className="mt-4 text-left text-xs">
              <summary className="cursor-pointer hover:underline">🔍 Debug Info (clique para expandir)</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-96 text-xs">
                {JSON.stringify({
                  estruturaDetectada: {
                    isNovaEstrutura,
                    temVencedor,
                    temInsights,
                    temAnaliseProperty,
                    temLucroReal
                  },
                  chaves: resultados ? Object.keys(resultados) : [],
                  vencedor: (resultados as any)?.vencedor,
                  primeirosInsights: (resultados as any)?.insights?.slice(0, 2)
                }, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    )
  }

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

  const regimes = !isNovaEstrutura ? [
    { id: 'lucro_real', dados: lucroReal, nome: 'Lucro Real' },
    { id: 'lucro_presumido', dados: lucroPresumido, nome: 'Lucro Presumido' },
    { id: 'simples_nacional', dados: simplesNacional, nome: 'Simples Nacional' }
  ].filter(r => r.dados !== undefined) : []

  // Obter período de exibição
  const periodoTexto = comparativo.ano 
    ? `Ano ${comparativo.ano}`
    : comparativo.periodoInicio && comparativo.periodoFim
    ? `Período: ${comparativo.periodoInicio} a ${comparativo.periodoFim}`
    : 'Período não especificado'

  return (
    <div className="space-y-6">
      {/* Header + Compartilhamento */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-3xl font-bold">{nome}</h2>
          {descricao && (
            <p className="text-muted-foreground mt-1">{descricao}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {periodoTexto}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Button
            variant="default"
            onClick={async () => {
              await gerarLinkCompartilhado();
              copiarLink();
            }}
          >
            Compartilhar relatório
          </Button>
          {copiado && (
            <span className="text-green-500 text-xs font-semibold mt-1">Link gerado e copiado para área de transferência!</span>
          )}
        </div>
      </div>

      {/* Card de Destaque - Regime Mais Vantajoso */}
      <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <div className="flex items-center justify-between">
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
              <p className="text-sm text-muted-foreground">Diferença</p>
              <p className="text-2xl font-bold text-green-600">
                {formatarMoeda(analise.diferencaMaiorMenor || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Comparativo - Apenas para estrutura antiga */}
      {!isNovaEstrutura && regimes.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumo Comparativo</CardTitle>
          <CardDescription>Visão geral dos indicadores por regime</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Métrica</th>
                  {regimes.map(r => (
                    <th key={r.id} className="text-right p-3 font-semibold">{r.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">Receita Total</td>
                  {regimes.map(r => (
                    <td key={r.id} className="text-right p-3 font-mono">
                      {formatarMoeda(r.dados!.receitaTotal)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">Total de Impostos</td>
                  {regimes.map(r => (
                    <td key={r.id} className="text-right p-3 font-mono">
                      {formatarMoeda(r.dados!.totalImpostos)}
                      {r.id === analise.regimeMaisVantajoso && (
                        <span className="ml-2">🥇</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">Lucro Líquido</td>
                  {regimes.map(r => (
                    <td key={r.id} className="text-right p-3 font-mono">
                      {formatarMoeda(r.dados!.lucroLiquido)}
                      {r.id === analise.regimeMaisVantajoso && (
                        <span className="ml-2">🥇</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="p-3">Carga Tributária</td>
                  {regimes.map(r => (
                    <td key={r.id} className="text-right p-3 font-mono">
                      {formatarPercentual(r.dados!.cargaTributaria)}
                      {r.id === analise.regimeMaisVantajoso && (
                        <span className="ml-2">🥇</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Gráficos - Exibir para ambas estruturas se houver dados mensais */}
      {(() => {
        console.log('🎨 [RENDERIZAÇÃO GRÁFICO] Verificando condição:', {
          temDadosMensaisLR: !!lucroReal?.dadosMensais,
          temDadosMensaisLP: !!lucroPresumido?.dadosMensais,
          temDadosMensaisSN: !!simplesNacional?.dadosMensais,
          lengthLR: lucroReal?.dadosMensais?.length || 0,
          lengthLP: lucroPresumido?.dadosMensais?.length || 0,
          lengthSN: simplesNacional?.dadosMensais?.length || 0,
          dadosLR: lucroReal?.dadosMensais,
          dadosLP: lucroPresumido?.dadosMensais,
          dadosSN: simplesNacional?.dadosMensais,
          lucroRealCompleto: lucroReal,
          lucroPresumidoCompleto: lucroPresumido,
          simplesNacionalCompleto: simplesNacional
        })
        return (lucroReal?.dadosMensais || lucroPresumido?.dadosMensais || simplesNacional?.dadosMensais)
      })() && (
      <>
        {/* Gráfico Dashboard Principal - Estilo da Imagem */}
        <GraficoDashboardComparativo 
          dadosLucroReal={lucroReal?.dadosMensais as any}
          dadosLucroPresumido={lucroPresumido?.dadosMensais as any}
          dadosSimplesNacional={simplesNacional?.dadosMensais as any}
          ano={comparativo.ano}
        />

        {/* Detalhamento por Regime */}
        <div className="grid grid-cols-1 gap-6">
          {regimes.map(regime => (
            <Card key={regime.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                <span>📊 {regime.nome}</span>
                {regime.id === analise.regimeMaisVantajoso && (
                  <Badge variant="default">Mais Vantajoso</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-xl font-semibold">{formatarMoeda(regime.dados!.receitaTotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Impostos</p>
                    <p className="text-xl font-semibold">{formatarMoeda(regime.dados!.totalImpostos)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                    <p className="text-xl font-semibold">{formatarMoeda(regime.dados!.lucroLiquido)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carga Tributária</p>
                    <p className="text-xl font-semibold">{formatarPercentual(regime.dados!.cargaTributaria)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Detalhamento de Impostos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm">ICMS:</span>
                      <span className="font-mono text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.icms)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">PIS:</span>
                      <span className="font-mono text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.pis)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">COFINS:</span>
                      <span className="font-mono text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.cofins)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">IRPJ:</span>
                      <span className="font-mono text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.irpj)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CSLL:</span>
                      <span className="font-mono text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.csll)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">ISS:</span>
                      <span className="font-mono text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.iss)}</span>
                    </div>
                    {regime.dados!.impostosPorTipo.outros > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Outros:</span>
                        <span className="font-mono text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.outros)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </>
      )}

      {/* Insights e Recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insights */}
        {analise.insights && analise.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analise.insights.map((insight: any, index: number) => {
                // Insights podem ser strings (formato antigo) ou objetos (formato novo)
                const isObject = typeof insight === 'object' && insight !== null
                const icone = isObject ? insight.icone : '•'
                const titulo = isObject ? insight.titulo : null
                const descricao = isObject ? insight.descricao : insight
                
                return (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="mt-0.5 text-base text-white">{icone}</span>
                    <div className="flex-1">
                      {titulo && (
                        <div className="font-semibold text-white mb-1">
                          {titulo}
                        </div>
                      )}
                      <div className="text-gray-300">
                        {descricao}
                      </div>
                    </div>
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
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {analise.recomendacoes.map((recomendacao: any, index: number) => {
                // Recomendações podem ser strings (formato antigo) ou objetos (formato novo)
                const isObject = typeof recomendacao === 'object' && recomendacao !== null
                const titulo = isObject ? recomendacao.titulo : recomendacao
                const descricao = isObject ? recomendacao.descricao : null
                const prioridade = isObject ? recomendacao.prioridade : null
                const acoes = isObject ? recomendacao.acoes : null
                const prazo = isObject ? recomendacao.prazo : null
                const impacto = isObject ? recomendacao.impactoFinanceiro : null
                
                // Badge de prioridade
                const badgePrioridade = prioridade === 'alta' 
                  ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">🔴 ALTA</span>
                  : prioridade === 'media'
                  ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">🟡 MÉDIA</span>
                  : prioridade === 'baixa'
                  ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">🟢 BAIXA</span>
                  : null
                
                return (
                  <li key={index} className="text-sm border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-semibold text-white">
                        {titulo}
                      </div>
                      {badgePrioridade}
                    </div>
                    
                    {descricao && (
                      <div className="text-gray-300 mb-2">
                        {descricao}
                      </div>
                    )}
                    
                    {impacto && (
                      <div className="text-sm text-green-400 font-medium mb-2">
                        💰 Impacto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(impacto)}/ano
                      </div>
                    )}
                    
                    {acoes && acoes.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-400 mb-1">Ações recomendadas:</div>
                        <ul className="space-y-1">
                          {acoes.map((acao: string, i: number) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                              <span className="text-blue-400">✓</span>
                              <span>{acao}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {prazo && (
                      <div className="text-xs text-gray-400 mt-2">
                        ⏱️ Prazo: {prazo}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
