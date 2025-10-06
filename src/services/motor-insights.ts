import type {
  AnaliseComparativa,
  ResultadoRegime,
  Insight,
  Recomendacao,
  Alerta,
  BreakEvenPoint,
  Tendencia,
  TipoInsight,
  TipoRecomendacao,
  PrioridadeRecomendacao
} from '@/types/comparativo-analise-completo'
import type { RegimeTributario } from '@/types/comparativo'

/**
 * Motor de Insights Inteligentes
 * Gera insights, recomendações e alertas automáticos baseados na análise comparativa
 */
export class MotorInsights {
  
  /**
   * Gera todos os insights para uma análise comparativa
   */
  static gerarInsights(analise: AnaliseComparativa): Insight[] {
    const insights: Insight[] = []
    let ordem = 1

    // Insight sobre o vencedor
    insights.push(this.insightVencedor(analise, ordem++))

    // Insight sobre economia
    if (analise.vencedor.economia > 0) {
      insights.push(this.insightEconomia(analise, ordem++))
    }

    // Insights sobre variação de Lucro Real
    if (analise.variacaoLucroReal) {
      insights.push(...this.insightsVariacaoLucroReal(analise, ordem))
      ordem += 2
    }

    // Insights por imposto
    insights.push(...this.insightsPorImposto(analise, ordem))
    ordem += 3

    // Insights sobre cobertura
    if (analise.cobertura.percentualCobertura < 100) {
      insights.push(this.insightCobertura(analise, ordem++))
    }

    // Insights de tendências
    if (analise.tendencias && analise.tendencias.length > 0) {
      insights.push(...this.insightsTendencias(analise.tendencias, ordem))
    }

    return insights.sort((a, b) => a.ordem - b.ordem)
  }

  private static insightVencedor(analise: AnaliseComparativa, ordem: number): Insight {
    const { vencedor } = analise
    
    // Buscar regime vencedor - pode ser cenário específico de Lucro Real ou regime base
    let regimeVencedor = null
    for (const [key, resultado] of Object.entries(analise.comparacao.regimes)) {
      if (key === vencedor.regime || key.startsWith(vencedor.regime)) {
        if (!regimeVencedor || resultado.cargaTributaria < regimeVencedor.cargaTributaria) {
          regimeVencedor = resultado
        }
      }
    }
    
    const cargaTributaria = regimeVencedor ? regimeVencedor.cargaTributaria : 0
    const nomeRegime = this.extrairNomeRegime(vencedor.regime)
    const nomeCenario = vencedor.cenarioNome ? ` (${vencedor.cenarioNome})` : ''
    
    return {
      id: `insight-vencedor`,
      tipo: 'economia',
      icone: '🏆',
      titulo: `${nomeRegime}${nomeCenario} é o melhor regime para sua empresa`,
      descricao: `Este regime tem a menor carga de impostos (${cargaTributaria.toFixed(1)}% da receita), resultando em mais dinheiro disponível para investir no seu negócio`,
      valor: vencedor.economia,
      percentual: vencedor.economiaPercentual,
      destaque: true,
      ordem
    }
  }

  private static insightEconomia(analise: AnaliseComparativa, ordem: number): Insight {
    const { vencedor } = analise
    const economiaAnual = vencedor.economia * (12 / analise.cobertura.mesesComDados.length)
    const nomeRegime = this.extrairNomeRegime(vencedor.regime)
    const nomeCenario = vencedor.cenarioNome ? ` (${vencedor.cenarioNome})` : ''
    
    return {
      id: `insight-economia`,
      tipo: 'economia',
      icone: '💰',
      titulo: `Você pode economizar ${this.formatarMoeda(economiaAnual)} por ano`,
      descricao: `Ao escolher ${nomeRegime}${nomeCenario} em vez do segundo regime mais barato, sua empresa paga ${vencedor.economiaPercentual.toFixed(1)}% menos impostos. Isso significa mais capital para crescimento, contratações e investimentos`,
      valor: vencedor.economia,
      percentual: vencedor.economiaPercentual,
      destaque: true,
      ordem
    }
  }

  private static insightsVariacaoLucroReal(analise: AnaliseComparativa, ordem: number): Insight[] {
    const insights: Insight[] = []
    const { variacaoLucroReal } = analise

    if (!variacaoLucroReal) return insights

    // Insight sobre amplitude
    insights.push({
      id: `insight-variacao-lr`,
      tipo: 'outlier',
      icone: '📊',
      titulo: `Seus cenários de Lucro Real mostram diferença de ${this.formatarMoeda(variacaoLucroReal.amplitude)}`,
      descricao: `Dependendo do cenário (otimista ou conservador), você pode pagar até ${variacaoLucroReal.amplitudePercentual.toFixed(1)}% a mais ou menos de impostos. Vale a pena acompanhar de perto qual cenário está se realizando`,
      valor: variacaoLucroReal.amplitude,
      percentual: variacaoLucroReal.amplitudePercentual,
      destaque: variacaoLucroReal.amplitudePercentual > 15,
      ordem
    })

    // Insight sobre melhor cenário
    insights.push({
      id: `insight-melhor-cenario-lr`,
      tipo: 'economia',
      icone: '⭐',
      titulo: `O cenário "${variacaoLucroReal.cenarioMelhor.cenarioNome || 'Otimista'}" é o mais vantajoso no Lucro Real`,
      descricao: `Neste cenário, você pagaria ${variacaoLucroReal.cenarioMelhor.cargaTributaria.toFixed(1)}% da receita em impostos. Use este cenário como referência para decisões estratégicas`,
      percentual: variacaoLucroReal.cenarioMelhor.cargaTributaria,
      destaque: false,
      ordem: ordem + 1
    })

    return insights
  }

  private static insightsPorImposto(analise: AnaliseComparativa, ordem: number): Insight[] {
    const insights: Insight[] = []
    const { analisePorImposto } = analise

    // Encontrar o imposto com maior economia
    let maiorEconomia = 0
    let impostoMaiorEconomia = ''
    let regimeVencedor = ''

    Object.entries(analisePorImposto).forEach(([tipo, comparacao]) => {
      if (comparacao.economia > maiorEconomia) {
        maiorEconomia = comparacao.economia
        impostoMaiorEconomia = tipo.toUpperCase()
        regimeVencedor = comparacao.vencedor
      }
    })

    if (maiorEconomia > 0) {
      const nomeRegimeVencedor = this.extrairNomeRegime(regimeVencedor)
      
      console.log(`\n🎯 [INSIGHT ECONOMIA] Gerando insight para ${impostoMaiorEconomia}:`)
      console.log(`   Regime vencedor: ${regimeVencedor} → Nome formatado: ${nomeRegimeVencedor}`)
      console.log(`   Economia: R$ ${maiorEconomia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   Insight será: "A diferença para o regime mais caro é de ${this.formatarMoeda(maiorEconomia)}"`)
      
      // maiorEconomia já é a diferença (maiorValor - menorValor) calculada em comparacao.economia
      insights.push({
        id: `insight-imposto-economia`,
        tipo: 'economia',
        icone: '💡',
        titulo: `${impostoMaiorEconomia} tem a maior diferença entre regimes`,
        descricao: `O regime ${nomeRegimeVencedor} tem o menor ${impostoMaiorEconomia}. A diferença para o regime mais caro é de ${this.formatarMoeda(maiorEconomia)}. Esta é a maior economia possível entre os regimes comparados`,
        valor: maiorEconomia,
        destaque: false,
        ordem
      })
    }

    // Insight sobre composição tributária
    const totalImpostos = Object.values(analisePorImposto).reduce((sum, comp) => sum + comp.maiorValor, 0)
    const impostoMaiorImpacto = Object.entries(analisePorImposto)
      .sort(([, a], [, b]) => b.maiorValor - a.maiorValor)[0]

    if (impostoMaiorImpacto) {
      const [tipo, comparacao] = impostoMaiorImpacto
      const percentual = (comparacao.maiorValor / totalImpostos) * 100

      insights.push({
        id: `insight-imposto-composicao`,
        tipo: 'outlier',
        icone: '🎯',
        titulo: `${tipo.toUpperCase()} é o imposto que mais pesa no seu bolso`,
        descricao: `Este imposto representa ${percentual.toFixed(1)}% de tudo que você paga em tributos. Qualquer otimização aqui terá grande impacto no resultado final da empresa`,
        percentual,
        destaque: percentual > 30,
        ordem: ordem + 1
      })
    }

    return insights
  }

  private static insightCobertura(analise: AnaliseComparativa, ordem: number): Insight {
    const { cobertura } = analise
    const mesesFaltantes = cobertura.mesesSemDados.map(m => {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      return meses[parseInt(m) - 1]
    }).join(', ')
    
    return {
      id: `insight-cobertura`,
      tipo: 'alerta',
      icone: '⚠️',
      titulo: `Atenção: Faltam dados de ${cobertura.mesesSemDados.length} ${cobertura.mesesSemDados.length === 1 ? 'mês' : 'meses'}`,
      descricao: `Esta análise está com ${cobertura.percentualCobertura.toFixed(0)}% dos dados. Faltam informações de: ${mesesFaltantes}. Complete estes dados para ter uma visão mais precisa`,
      percentual: cobertura.percentualCobertura,
      destaque: cobertura.percentualCobertura < 70,
      ordem
    }
  }

  private static insightsTendencias(tendencias: Tendencia[], ordem: number): Insight[] {
    return tendencias.slice(0, 2).map((tendencia, index) => ({
      id: `insight-tendencia-${index}`,
      tipo: 'tendencia' as TipoInsight,
      icone: tendencia.tipo === 'crescimento' ? '📈' : tendencia.tipo === 'reducao' ? '📉' : '➡️',
      titulo: tendencia.descricao,
      descricao: `Variação de ${tendencia.variacaoPercentual.toFixed(1)}% no período analisado`,
      valor: tendencia.variacao,
      percentual: tendencia.variacaoPercentual,
      destaque: Math.abs(tendencia.variacaoPercentual) > 20,
      ordem: ordem + index
    }))
  }

  /**
   * Gera recomendações automáticas
   */
  static gerarRecomendacoes(analise: AnaliseComparativa, resultados: Record<string, ResultadoRegime>): Recomendacao[] {
    const recomendacoes: Recomendacao[] = []

    // Recomendação de mudança de regime
    if (analise.vencedor.economia > 5000) {
      recomendacoes.push(this.recomendacaoMudancaRegime(analise, resultados))
    }

    // Recomendação de otimização de impostos específicos
    recomendacoes.push(...this.recomendacoesOtimizacaoImpostos(analise))

    // Recomendação sobre variação de cenários
    if (analise.variacaoLucroReal && analise.variacaoLucroReal.amplitudePercentual > 20) {
      recomendacoes.push(this.recomendacaoVariacaoCenarios(analise))
    }

    // Recomendação sobre dados faltantes
    if (analise.cobertura.percentualCobertura < 80) {
      recomendacoes.push(this.recomendacaoDadosFaltantes(analise))
    }

    return recomendacoes.sort((a, b) => {
      const prioridadeOrdem = { alta: 1, media: 2, baixa: 3 }
      return prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade]
    })
  }

  private static recomendacaoMudancaRegime(analise: AnaliseComparativa, resultados: Record<string, ResultadoRegime>): Recomendacao {
    const { vencedor, cobertura } = analise
    const regimeAtual = Object.values(resultados).find(r => r.regime !== vencedor.regime)
    const economiaAnual = vencedor.economia * (12 / cobertura.mesesComDados.length)
    const nomeRegime = this.extrairNomeRegime(vencedor.regime)
    const nomeCenario = vencedor.cenarioNome ? ` (cenário ${vencedor.cenarioNome})` : ''
    
    return {
      id: 'rec-mudanca-regime',
      tipo: 'mudanca_regime',
      titulo: `Vale a pena migrar para ${nomeRegime}${nomeCenario}`,
      descricao: `Projeção: você economizaria ${this.formatarMoeda(economiaAnual)} por ano. Isso equivale a ${vencedor.economiaPercentual.toFixed(1)}% menos impostos que você pode usar para investir na empresa`,
      impactoFinanceiro: economiaAnual,
      impactoPercentual: vencedor.economiaPercentual,
      prioridade: economiaAnual > 50000 ? 'alta' : 'media',
      acoes: [
        'Converse com seu contador sobre a mudança',
        'Verifique se sua empresa se enquadra neste regime',
        'Planeje a transição para o próximo ano fiscal',
        'Compare os requisitos e obrigações de cada regime'
      ],
      prazo: 'Planeje para o próximo ano',
      complexidade: 'alta'
    }
  }

  private static recomendacoesOtimizacaoImpostos(analise: AnaliseComparativa): Recomendacao[] {
    const recomendacoes: Recomendacao[] = []
    const { analisePorImposto } = analise

    // Encontrar impostos com alta variação entre regimes
    Object.entries(analisePorImposto).forEach(([tipo, comparacao]) => {
      // Variação percentual: (diferença / menor valor) * 100
      // Ex: Se um regime paga 45k e outro 91k: (46k / 45k) * 100 = 102% mais caro
      const variacaoPercentual = comparacao.menorValor > 0 
        ? ((comparacao.maiorValor - comparacao.menorValor) / comparacao.menorValor) * 100
        : 0
      
      if (variacaoPercentual > 30 && comparacao.economia > 3000) {
        const economiaPeriodo = comparacao.economia
        const mesesAnalisados = analise.cobertura.mesesComDados.length
        const economiaAnual = economiaPeriodo * (12 / mesesAnalisados)
        
        // Descrição mais clara com valores do período e projeção
        const descricaoPeriodo = mesesAnalisados === 12 
          ? 'no ano'
          : `nos ${mesesAnalisados} meses analisados`
        
        const descricaoCompleta = mesesAnalisados === 12
          ? `Entre os regimes comparados, há uma diferença de ${this.formatarMoeda(economiaPeriodo)} em ${tipo.toUpperCase()} no ano. Escolhendo o regime mais econômico neste imposto, você economiza ${variacaoPercentual.toFixed(0)}% em ${tipo.toUpperCase()}`
          : `Entre os regimes comparados, há uma diferença de ${this.formatarMoeda(economiaPeriodo)} em ${tipo.toUpperCase()} ${descricaoPeriodo}. Projetando para o ano inteiro, isso representa até ${this.formatarMoeda(economiaAnual)}. Escolhendo o regime mais econômico neste imposto, você economiza ${variacaoPercentual.toFixed(0)}%`
        
        recomendacoes.push({
          id: `rec-otimizar-${tipo}`,
          tipo: 'otimizacao_tributaria',
          titulo: `${tipo.toUpperCase()} tem grande variação entre regimes`,
          descricao: descricaoCompleta,
          impactoFinanceiro: economiaAnual,
          impactoPercentual: variacaoPercentual,
          prioridade: economiaAnual > 50000 ? 'alta' : economiaAnual > 20000 ? 'media' : 'baixa',
          acoes: [
            `Peça ao contador para revisar o cálculo de ${tipo.toUpperCase()}`,
            'Veja se há créditos ou incentivos fiscais disponíveis',
            'Analise se há formas legais de reduzir este imposto',
            'Considere reestruturar operações para otimizar tributação'
          ],
          prazo: 'Nos próximos 1-3 meses',
          complexidade: 'media'
        })
      }
    })

    return recomendacoes.slice(0, 2) // Máximo 2 recomendações de otimização
  }

  private static recomendacaoVariacaoCenarios(analise: AnaliseComparativa): Recomendacao {
    const { variacaoLucroReal } = analise
    
    return {
      id: 'rec-variacao-cenarios',
      tipo: 'alerta',
      titulo: 'Seus cenários de Lucro Real têm grande variação',
      descricao: `A diferença entre o melhor e pior cenário é de ${this.formatarMoeda(variacaoLucroReal!.amplitude)} (${variacaoLucroReal!.amplitudePercentual.toFixed(0)}%). Acompanhe de perto qual está se realizando na prática`,
      impactoFinanceiro: variacaoLucroReal!.amplitude,
      impactoPercentual: variacaoLucroReal!.amplitudePercentual,
      prioridade: 'media',
      acoes: [
        'Revise as premissas dos seus cenários com o contador',
        'Identifique quais fatores causam mais impacto nos impostos',
        'Crie um cenário intermediário mais realista',
        'Mensalmente, compare o real com o planejado e ajuste'
      ],
      prazo: 'Comece imediatamente',
      complexidade: 'media'
    }
  }

  private static recomendacaoDadosFaltantes(analise: AnaliseComparativa): Recomendacao {
    const { cobertura } = analise
    const mesesFaltantes = cobertura.mesesSemDados.map(m => {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      return meses[parseInt(m) - 1]
    }).join(', ')
    
    return {
      id: 'rec-dados-faltantes',
      tipo: 'alerta',
      titulo: 'Complete os dados para uma análise mais precisa',
      descricao: `Faltam dados de ${cobertura.mesesSemDados.length} ${cobertura.mesesSemDados.length === 1 ? 'mês' : 'meses'} (${mesesFaltantes}). Com dados completos, você terá uma visão muito mais confiável para tomar decisões`,
      impactoFinanceiro: 0,
      impactoPercentual: 100 - cobertura.percentualCobertura,
      prioridade: cobertura.percentualCobertura < 60 ? 'alta' : 'baixa',
      acoes: [
        'Adicione os dados de receitas e despesas dos meses faltantes',
        'Se não tem dados reais, faça uma projeção baseada na média',
        'Revise se há informações incompletas nos meses cadastrados'
      ],
      prazo: 'Quanto antes melhor',
      complexidade: 'baixa'
    }
  }

  /**
   * Gera alertas automáticos
   */
  static gerarAlertas(resultados: Record<string, ResultadoRegime>): Alerta[] {
    const alertas: Alerta[] = []

    // Alertas de limite de receita (Simples Nacional)
    const simplesNacional = Object.values(resultados).find(r => r.regime === 'simples_nacional')
    if (simplesNacional) {
      alertas.push(...this.alertasLimiteReceita(simplesNacional))
    }

    // Alertas de variação atípica
    alertas.push(...this.alertasVariacaoAtipica(resultados))

    return alertas
  }

  private static alertasLimiteReceita(resultado: ResultadoRegime): Alerta[] {
    const alertas: Alerta[] = []
    const LIMITE_SIMPLES_ANUAL = 4800000 // R$ 4,8 milhões
    
    const receitaAnualProjetada = (resultado.receitaTotal / resultado.mesesComDados.length) * 12
    const percentualDoLimite = (receitaAnualProjetada / LIMITE_SIMPLES_ANUAL) * 100

    if (percentualDoLimite > 80) {
      alertas.push({
        id: 'alerta-limite-simples',
        tipo: 'limite_receita',
        nivel: percentualDoLimite > 95 ? 'error' : 'warning',
        titulo: `Aproximação do limite do Simples Nacional (${percentualDoLimite.toFixed(0)}%)`,
        descricao: `Receita anual projetada de ${this.formatarMoeda(receitaAnualProjetada)}. Limite de ${this.formatarMoeda(LIMITE_SIMPLES_ANUAL)}`,
        valor: receitaAnualProjetada,
        requer_acao: percentualDoLimite > 90
      })
    }

    return alertas
  }

  private static alertasVariacaoAtipica(resultados: Record<string, ResultadoRegime>): Alerta[] {
    const alertas: Alerta[] = []

    Object.values(resultados).forEach(resultado => {
      if (resultado.dadosMensais.length < 2) return

      // Calcular variação mês a mês
      for (let i = 1; i < resultado.dadosMensais.length; i++) {
        const atual = resultado.dadosMensais[i]
        const anterior = resultado.dadosMensais[i - 1]
        
        const variacaoCarga = Math.abs(atual.cargaTributaria - anterior.cargaTributaria)
        
        if (variacaoCarga > 5) { // Variação > 5 pontos percentuais
          alertas.push({
            id: `alerta-variacao-${resultado.regime}-${atual.mes}`,
            tipo: 'variacao_atipica',
            nivel: 'warning',
            titulo: `Variação atípica em ${this.formatarRegime(resultado.regime)}`,
            descricao: `Carga tributária variou ${variacaoCarga.toFixed(1)} p.p. de ${anterior.mes} para ${atual.mes}`,
            valor: variacaoCarga,
            requer_acao: false
          })
        }
      }
    })

    return alertas
  }

  /**
   * Calcula pontos de break-even entre regimes
   */
  static calcularBreakEven(resultados: Record<string, ResultadoRegime>): BreakEvenPoint[] {
    const breakPoints: BreakEvenPoint[] = []
    const regimes = Object.values(resultados)

    // Comparar cada par de regimes
    for (let i = 0; i < regimes.length - 1; i++) {
      for (let j = i + 1; j < regimes.length; j++) {
        const regime1 = regimes[i]
        const regime2 = regimes[j]
        
        const breakEven = this.calcularBreakEvenEntreRegimes(regime1, regime2)
        if (breakEven) {
          breakPoints.push(breakEven)
        }
      }
    }

    return breakPoints
  }

  private static calcularBreakEvenEntreRegimes(
    regime1: ResultadoRegime,
    regime2: ResultadoRegime
  ): BreakEvenPoint | null {
    // Simplificação: assume relação linear entre receita e carga tributária
    const carga1 = regime1.cargaTributaria / 100
    const carga2 = regime2.cargaTributaria / 100
    
    // Se as cargas são muito próximas, não há break-even significativo
    if (Math.abs(carga1 - carga2) < 0.02) return null

    // Estimar receita de break-even baseado na receita média
    const receitaMedia1 = regime1.receitaTotal / regime1.mesesComDados.length
    const receitaMedia2 = regime2.receitaTotal / regime2.mesesComDados.length
    
    // Ponto de break-even estimado
    const receitaBreakEven = (receitaMedia1 + receitaMedia2) / 2 * (1 / Math.abs(carga1 - carga2))

    return {
      regimes: [regime1.regime, regime2.regime],
      receitaBreakEven,
      descricao: `Com receita mensal de ${this.formatarMoeda(receitaBreakEven)}, ${this.formatarRegime(regime1.regime)} e ${this.formatarRegime(regime2.regime)} teriam carga tributária similar`
    }
  }

  /**
   * Analisa tendências nos dados
   */
  static analisarTendencias(resultados: Record<string, ResultadoRegime>): Tendencia[] {
    const tendencias: Tendencia[] = []

    Object.values(resultados).forEach(resultado => {
      if (resultado.dadosMensais.length < 3) return

      // Tendência de carga tributária
      const tendenciaCarga = this.calcularTendencia(
        resultado.dadosMensais.map(d => d.cargaTributaria)
      )
      
      if (Math.abs(tendenciaCarga.variacaoPercentual) > 5) {
        tendencias.push({
          tipo: tendenciaCarga.variacao > 0 ? 'crescimento' : 'reducao',
          metrica: 'carga_tributaria',
          regime: resultado.regime,
          variacao: tendenciaCarga.variacao,
          variacaoPercentual: tendenciaCarga.variacaoPercentual,
          descricao: `Carga tributária de ${this.formatarRegime(resultado.regime)} está ${tendenciaCarga.variacao > 0 ? 'aumentando' : 'diminuindo'}`
        })
      }
    })

    return tendencias
  }

  private static calcularTendencia(valores: number[]): { variacao: number, variacaoPercentual: number } {
    if (valores.length < 2) return { variacao: 0, variacaoPercentual: 0 }

    const primeiro = valores[0]
    const ultimo = valores[valores.length - 1]
    const variacao = ultimo - primeiro
    const variacaoPercentual = (variacao / primeiro) * 100

    return { variacao, variacaoPercentual }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Extrai nome limpo do regime removendo IDs técnicos
   * Ex: "lucro_real_b9c02d8c-662c-41de-8d06-534dcd7e0d89" -> "Lucro Real"
   */
  private static extrairNomeRegime(regime: string): string {
    // Remover ID técnico se existir
    const regimeBase = regime.split('_').slice(0, 2).join('_') // Pega apenas "lucro_real", "lucro_presumido", etc
    return this.formatarRegime(regimeBase)
  }

  private static formatarRegime(regime: RegimeTributario | string): string {
    const nomes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime] || regime
  }

  private static formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(valor)
  }
}
