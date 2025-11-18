"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, TrendingDown, TrendingUp, DollarSign, Percent, Share2, Link2, Lock, Check } from "lucide-react"
import type { Comparativo } from "@/types/comparativo-analise"
import { GraficoComparacaoImpostos } from "./graficos/grafico-comparacao-impostos"
import { GraficoCargaTributaria } from "./graficos/grafico-carga-tributaria"
import { GraficoEvolucaoRegimes } from "./graficos/grafico-evolucao-regimes"
import { GraficoComparacaoLucros } from "./graficos/grafico-comparacao-lucros"
import { GraficoDashboardComparativo } from "./graficos/grafico-dashboard-comparativo"
import { 
  ativarCompartilhamentoPublico, 
  desativarCompartilhamentoPublico,
  verificarCompartilhamento,
  copiarLinkPublico,
  type CompartilhamentoInfo 
} from "@/services/compartilhamento-service"
import { toast } from "sonner"
import { TooltipExplicativo, ValorComTooltip } from "@/components/ui/tooltip-explicativo"
import { GlossarioModal } from "@/components/glossario-modal"

interface VisualizacaoComparativoProps {
  comparativo: Comparativo
}

export function VisualizacaoComparativo({ comparativo }: VisualizacaoComparativoProps) {
  const { resultados, nome, descricao, id } = comparativo

  // Compartilhamento
  const [compartilhamentoInfo, setCompartilhamentoInfo] = useState<CompartilhamentoInfo | null>(null)
  const [estaCompartilhado, setEstaCompartilhado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  // Verificar status de compartilhamento ao carregar
  useEffect(() => {
    async function verificarStatus() {
      const status = await verificarCompartilhamento(id)
      if (status?.compartilhado && status.token) {
        setEstaCompartilhado(true)
        setCompartilhamentoInfo({
          token: status.token,
          expiraEm: status.expiraEm || '',
          urlPublica: `${window.location.origin}/comparativos/compartilhado/${status.token}`
        })
      }
    }
    verificarStatus()
  }, [id])

  // Função para gerar link de compartilhamento
  const gerarLinkCompartilhado = async () => {
    try {
      setCarregando(true)
      const info = await ativarCompartilhamentoPublico(id, 30) // 30 dias de validade
      setCompartilhamentoInfo(info)
      setEstaCompartilhado(true)
      toast.success('Link de compartilhamento gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar link:', error)
      toast.error('Erro ao gerar link de compartilhamento')
    } finally {
      setCarregando(false)
    }
  }

  // Função para desativar compartilhamento
  const desativarCompartilhamento = async () => {
    try {
      setCarregando(true)
      await desativarCompartilhamentoPublico(id)
      setCompartilhamentoInfo(null)
      setEstaCompartilhado(false)
      setCopiado(false)
      toast.success('Compartilhamento desativado')
    } catch (error) {
      console.error('Erro ao desativar:', error)
      toast.error('Erro ao desativar compartilhamento')
    } finally {
      setCarregando(false)
    }
  }

  // Função para copiar link
  const copiarLink = async () => {
    if (compartilhamentoInfo?.urlPublica) {
      const sucesso = await copiarLinkPublico(compartilhamentoInfo.urlPublica)
      if (sucesso) {
        setCopiado(true)
        toast.success('Link copiado para área de transferência!')
        setTimeout(() => setCopiado(false), 3000)
      } else {
        toast.error('Erro ao copiar link')
      }
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
      console.log(`🔧 [CONSOLIDAR] Buscando regime: "${nomeRegime}"`)
      console.log(`🔧 [CONSOLIDAR] Chaves disponíveis:`, Object.keys(regimes))
      console.log(`🔧 [CONSOLIDAR] Objeto regimes COMPLETO:`, regimes)
      
      // Buscar por chave direta primeiro
      const dadoDireto = regimes[nomeRegime] || regimes[nomeRegime.replace('_', '')] || regimes[nomeRegime.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())]
      
      console.log(`🔧 [CONSOLIDAR] Busca direta por "${nomeRegime}":`, {
        encontrado: !!dadoDireto,
        temDadosMensais: !!dadoDireto?.dadosMensais,
        quantidadeMeses: dadoDireto?.dadosMensais?.length || 0
      })
      
      if (dadoDireto && dadoDireto.dadosMensais && dadoDireto.dadosMensais.length > 0) {
        console.log(`✅ [CONSOLIDAR] Encontrou dados diretos para ${nomeRegime}`)
        return dadoDireto
      }
      
      // Se não encontrou direto, procurar por chaves que comecem com o nome do regime
      const chavesCenarios = Object.keys(regimes).filter(k => k.startsWith(nomeRegime))
      
      console.log(`🔧 [CONSOLIDAR] Busca por prefixo "${nomeRegime}":`, {
        chaveEncontradas: chavesCenarios,
        quantidade: chavesCenarios.length
      })
      
      if (chavesCenarios.length === 0) {
        console.warn(`⚠️ [CONSOLIDAR] Nenhuma chave encontrada para "${nomeRegime}"`)
        return null
      }
      
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
          // Adicionar campo regime a cada dado mensal para preservar a informação
          console.log(`  🔍 [REGIME DEBUG] Antes de adicionar regime:`, {
            dadoMensalOriginal: dadosCenario.dadosMensais[0],
            temRegimeNoDado: !!dadosCenario.dadosMensais[0]?.regime,
            temRegimeNoCenario: !!dadosCenario.regime,
            nomeRegimeParam: nomeRegime,
            cenarioCompleto: dadosCenario
          })
          
          const dadosMensaisComRegime = dadosCenario.dadosMensais.map((dadoMensal: any) => {
            const regimeEscolhido = dadoMensal.regime || dadosCenario.regime || nomeRegime
            
            console.log(`  🎯 [REGIME] Escolhendo regime para mês ${dadoMensal.mes}:`, {
              dadoMensal_regime: dadoMensal.regime,
              dadosCenario_regime: dadosCenario.regime,
              nomeRegime_param: nomeRegime,
              regimeEscolhido
            })
            
            return {
              ...dadoMensal,
              regime: regimeEscolhido // Priorizar regime do dado, depois do cenário, depois o parâmetro
            }
          })
          
          // Log cada dado mensal
          dadosMensaisComRegime.forEach((dadoMensal: any, idx: number) => {
            console.log(`  📅 Mês ${idx + 1} COM REGIME:`, {
              mes: dadoMensal.mes,
              ano: dadoMensal.ano,
              regime: dadoMensal.regime, // ✅ Agora inclui regime
              receita: dadoMensal.receita,
              impostos: dadoMensal.impostos,
              totalImpostos: dadoMensal.totalImpostos,
              lucroLiquido: dadoMensal.lucroLiquido
            })
          })
          todosOsDadosMensais.push(...dadosMensaisComRegime)
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
        consolidado: regimeConsolidado,
        dadosMensaisDetalhado: todosOsDadosMensais.map(d => ({
          mes: d.mes,
          ano: d.ano,
          totalImpostos: d.totalImpostos,
          receita: d.receita
        }))
      })
      
      return regimeConsolidado
    }
    
    // Tentar pegar os dados usando consolidação
    console.log('🔍 [CONSOLIDAÇÃO] Iniciando busca de regimes:', {
      regimesDisponíveis: Object.keys(regimes),
      regimesCompleto: regimes
    })
    
    lucroReal = consolidarDadosRegime('lucro_real')
    lucroPresumido = consolidarDadosRegime('lucro_presumido')
    simplesNacional = consolidarDadosRegime('simples_nacional')
    
    console.log('🔍 [CONSOLIDAÇÃO] Resultados após consolidação:', {
      lucroReal: lucroReal ? {
        regime: lucroReal.regime,
        dadosMensais: lucroReal.dadosMensais?.length,
        primeiroMes: lucroReal.dadosMensais?.[0]
      } : null,
      lucroPresumido: lucroPresumido ? {
        regime: lucroPresumido.regime,
        dadosMensais: lucroPresumido.dadosMensais?.length,
        primeiroMes: lucroPresumido.dadosMensais?.[0]
      } : null,
      simplesNacional: simplesNacional ? {
        regime: simplesNacional.regime,
        dadosMensais: simplesNacional.dadosMensais?.length,
        primeiroMes: simplesNacional.dadosMensais?.[0]
      } : null
    })
    
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
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Header + Compartilhamento */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold break-words">{nome}</h2>
            {descricao && (
              <p className="text-muted-foreground mt-1">{descricao}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {periodoTexto}
            </p>
          </div>
          
          {/* Botão do Glossário */}
          <div className="hidden md:block">
            <GlossarioModal />
          </div>
          
          {/* Controles de Compartilhamento */}
          <div className="flex flex-col gap-2 w-full md:min-w-[200px] md:w-auto">
            {!estaCompartilhado ? (
              <Button
                variant="default"
                onClick={gerarLinkCompartilhado}
                disabled={carregando}
                className="w-full text-sm md:text-base"
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Relatório
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center py-1">
                  <Link2 className="h-3 w-3 mr-1" />
                  Compartilhamento Ativo
                </Badge>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarLink}
                    className="flex-1 text-xs md:text-sm"
                  >
                    {copiado ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-1" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={desativarCompartilhamento}
                    disabled={carregando}
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </div>
                {compartilhamentoInfo?.expiraEm && (
                  <p className="text-xs text-muted-foreground text-center">
                    Expira em: {new Date(compartilhamentoInfo.expiraEm).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Botão Glossário Mobile */}
        <div className="md:hidden">
          <GlossarioModal />
        </div>
        
        {/* Aviso quando compartilhado */}
        {estaCompartilhado && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
              <Share2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Este relatório está público. Qualquer pessoa com o link pode visualizá-lo.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Resumo Executivo - Visualização de Impacto */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 md:h-7 md:w-7 text-primary" />
            Resumo Executivo
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Análise do potencial de economia tributária
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
          {/* Destaque Principal - Economia */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm font-medium opacity-90 mb-2">Você pode economizar</p>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  {formatarMoeda(analise.economiaAnual || 0)}
                </p>
                <p className="text-xs md:text-sm mt-2 opacity-90">por ano mudando para {getNomeRegime(analise.regimeMaisVantajoso)}</p>
              </div>
              <div className="text-center md:text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 md:px-6 py-3 md:py-4">
                  <p className="text-xs md:text-sm font-medium opacity-90 mb-1">Potencial de economia</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold">{formatarPercentual(analise.economiaPercentual || 0)}</p>
                  <p className="text-xs mt-1 opacity-90">na sua tributação</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparação Visual em Semáforo */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-base md:text-lg">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
              Comparação entre Regimes
            </h3>
            <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
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
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 text-xl md:text-3xl opacity-20">{icone}</div>
                      <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                        <CardTitle className="text-sm md:text-lg flex items-center justify-between">
                          <span className="truncate mr-2">{regime.nome}</span>
                          {isMelhor && <Trophy className="h-4 w-4 md:h-5 md:w-5 text-green-600 flex-shrink-0" />}
                        </CardTitle>
                        <Badge 
                          variant={isMelhor ? 'default' : 'secondary'} 
                          className={`w-fit text-xs ${isMelhor ? 'bg-green-600' : isIntermediario ? 'bg-yellow-600' : 'bg-red-600'}`}
                        >
                          <span className="truncate">{label}</span>
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2 p-3 md:p-6">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-xs text-muted-foreground">Total de Impostos/Ano</p>
                            <TooltipExplicativo termo="economia_tributaria" showIcon={true} iconSize="sm" />
                          </div>
                          <p className="text-lg md:text-xl font-bold">{formatarMoeda(regime.total)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-xs text-muted-foreground">Carga Tributária</p>
                            <TooltipExplicativo termo="carga_tributaria" showIcon={true} iconSize="sm" />
                          </div>
                          <p className="text-base md:text-lg font-semibold flex items-center gap-2">
                            <Percent className="h-3 w-3 md:h-4 md:w-4" />
                            {formatarPercentual(regime.carga)}
                          </p>
                        </div>
                        {!isMelhor && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">A mais que a melhor opção</p>
                            <p className="text-xs md:text-sm font-semibold text-red-600">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="bg-muted/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xs text-muted-foreground">Economia Anual</p>
                    <TooltipExplicativo termo="economia_tributaria" showIcon={true} iconSize="sm" />
                  </div>
                  <p className="text-base md:text-lg font-bold text-green-600">{formatarMoeda(analise.economiaAnual || 0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xs text-muted-foreground">Economia %</p>
                    <TooltipExplicativo termo="aliquota_efetiva" showIcon={true} iconSize="sm" />
                  </div>
                  <p className="text-base md:text-lg font-bold text-green-600">{formatarPercentual(analise.economiaPercentual || 0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xs text-muted-foreground">Diferença Maior-Menor</p>
                    <TooltipExplicativo termo="economia_tributaria" showIcon={true} iconSize="sm" />
                  </div>
                  <p className="text-base md:text-lg font-bold">{formatarMoeda(analise.diferencaMaiorMenor || 0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xs text-muted-foreground">Regime Recomendado</p>
                    <TooltipExplicativo termo={analise.regimeMaisVantajoso} showIcon={true} iconSize="sm" />
                  </div>
                  <Badge variant="default" className="text-xs truncate max-w-full">
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
          <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
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
        <CardContent className="p-3 md:p-6">
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 md:p-3 font-semibold text-sm md:text-base">Métrica</th>
                  {regimes.map(r => (
                    <th key={r.id} className="text-right p-2 md:p-3 font-semibold text-sm md:text-base whitespace-nowrap">{r.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 md:p-3 text-sm md:text-base">Receita Total</td>
                  {regimes.map(r => (
                    <td key={r.id} className="text-right p-2 md:p-3 font-mono text-xs md:text-sm whitespace-nowrap">
                      {formatarMoeda(r.dados!.receitaTotal)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 md:p-3 text-sm md:text-base">Total de Impostos</td>
                  {regimes.map(r => (
                    <td key={r.id} className="text-right p-2 md:p-3 font-mono text-xs md:text-sm whitespace-nowrap">
                      {formatarMoeda(r.dados!.totalImpostos)}
                      {r.id === analise.regimeMaisVantajoso && (
                        <span className="ml-2">🥇</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 md:p-3 text-sm md:text-base">Lucro Líquido</td>
                  {regimes.map(r => (
                    <td key={r.id} className="text-right p-2 md:p-3 font-mono text-xs md:text-sm whitespace-nowrap">
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
            <CardContent className="p-3 md:p-6">
              <div className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-lg md:text-xl font-semibold">{formatarMoeda(regime.dados!.receitaTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Impostos</p>
                    <p className="text-lg md:text-xl font-semibold">{formatarMoeda(regime.dados!.totalImpostos)}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Lucro Líquido</p>
                    <p className="text-lg md:text-xl font-semibold">{formatarMoeda(regime.dados!.lucroLiquido)}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Carga Tributária</p>
                    <p className="text-lg md:text-xl font-semibold">{formatarPercentual(regime.dados!.cargaTributaria)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Detalhamento de Impostos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    <div className="flex justify-between">
                      <span className="text-xs md:text-sm">ICMS:</span>
                      <span className="font-mono text-xs md:text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.icms)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs md:text-sm">PIS:</span>
                      <span className="font-mono text-xs md:text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.pis)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs md:text-sm">COFINS:</span>
                      <span className="font-mono text-xs md:text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.cofins)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs md:text-sm">IRPJ:</span>
                      <span className="font-mono text-xs md:text-sm">{formatarMoeda(regime.dados!.impostosPorTipo.irpj)}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
