import { createClient } from '@/lib/supabase/client'
import type {
  Comparativo,
  ComparativoSupabase,
  ConfigComparativo,
  ResultadosComparativo,
  ResultadoRegime,
  DadosMensalRegime,
  ImpostosPorTipo,
  AnaliseComparativa,
  DisponibilidadeDados
} from '@/types/comparativo-analise'
import type { RegimeTributario } from '@/types/comparativo'

/**
 * Serviço para análise e comparação de regimes tributários
 */
export class ComparativosAnaliseService {
  private supabase = createClient()

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Criar um novo comparativo
   */
  async criarComparativo(config: ConfigComparativo): Promise<Comparativo> {
    console.log('📊 Iniciando criação de comparativo:', config)

    try {
      // 1. Validar configuração
      this.validarConfig(config)

      // 2. Buscar dados de cada regime
      const resultados = await this.processarDadosRegimes(config)

      // 3. Calcular análise comparativa
      const analise = this.calcularAnaliseComparativa(resultados, config.regimesIncluidos)

      // 4. Montar resultado final
      const resultadoFinal: ResultadosComparativo = {
        ...resultados,
        analise
      }

      // 5. Salvar no banco
      const comparativo = await this.salvarComparativo(config, resultadoFinal)

      console.log('✅ Comparativo criado com sucesso:', comparativo.id)
      return comparativo

    } catch (error) {
      console.error('❌ Erro ao criar comparativo:', error)
      throw error
    }
  }

  /**
   * Obter comparativo por ID
   */
  async obterComparativo(id: string): Promise<Comparativo | null> {
    try {
      console.log('🔍 [SERVICE] Buscando comparativo:', id)
      
      const { data, error } = await this.supabase
        .from('comparativos_analise')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      console.log('🔍 [SERVICE] Resposta Supabase:', {
        temDados: !!data,
        temErro: !!error,
        dadosBrutos: data
      })

      if (error) throw error
      
      const comparativo = data ? this.fromSupabaseFormat(data) : null
      
      console.log('🔍 [SERVICE] Comparativo formatado:', {
        temComparativo: !!comparativo,
        comparativo
      })
      
      return comparativo

    } catch (error) {
      console.error('❌ [SERVICE] Erro ao obter comparativo:', error)
      return null
    }
  }

  /**
   * Listar comparativos de uma empresa
   */
  async listarComparativos(empresaId: string): Promise<Comparativo[]> {
    try {
      console.log('🔍 [SERVICE] Listando comparativos para empresa:', empresaId)
      
      const { data, error } = await this.supabase
        .from('comparativos_analise')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

      console.log('📊 [SERVICE] Resposta do Supabase:', {
        quantidade: data?.length || 0,
        erro: error,
        primeiroItem: data?.[0]
      })

      if (error) {
        console.error('❌ [SERVICE] Erro ao buscar comparativos:', error)
        throw error
      }

      const comparativos = data?.map(item => this.fromSupabaseFormat(item)) || []
      
      console.log('✅ [SERVICE] Comparativos formatados:', {
        quantidade: comparativos.length,
        ids: comparativos.map(c => c.id),
        nomes: comparativos.map(c => c.nome)
      })

      return comparativos

    } catch (error) {
      console.error('❌ [SERVICE] Erro ao listar comparativos:', error)
      return []
    }
  }

  /**
   * Excluir comparativo
   */
  async excluirComparativo(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('comparativos_analise')
        .delete()
        .eq('id', id)

      if (error) throw error

    } catch (error) {
      console.error('Erro ao excluir comparativo:', error)
      throw error
    }
  }

  /**
   * Atualizar informações básicas do comparativo (nome e descrição)
   */
  async atualizarComparativo(
    id: string, 
    dados: { nome?: string; descricao?: string }
  ): Promise<Comparativo> {
    try {
      console.log('📝 [SERVICE] Atualizando comparativo:', { id, dados })

      const atualizacao: any = {
        updated_at: new Date().toISOString()
      }

      if (dados.nome !== undefined) {
        atualizacao.nome = dados.nome
      }

      if (dados.descricao !== undefined) {
        atualizacao.descricao = dados.descricao
      }

      console.log('📝 [SERVICE] Dados a atualizar:', atualizacao)

      const { data, error } = await this.supabase
        .from('comparativos_analise')
        .update(atualizacao)
        .eq('id', id)
        .select()
        .single()

      console.log('📝 [SERVICE] Resposta do Supabase:', { 
        temDados: !!data, 
        temErro: !!error, 
        erro: error,
        dados: data 
      })

      if (error) {
        console.error('❌ [SERVICE] Erro do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Erro ao atualizar: ${error.message || 'Erro desconhecido'}`)
      }
      
      if (!data) {
        throw new Error('Comparativo não encontrado após atualização')
      }

      console.log('✅ [SERVICE] Comparativo atualizado com sucesso')
      return this.fromSupabaseFormat(data)

    } catch (error) {
      console.error('❌ [SERVICE] Erro ao atualizar comparativo:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  /**
   * Verificar disponibilidade de dados para comparação
   */
  async verificarDisponibilidade(
    empresaId: string,
    ano: number
  ): Promise<DisponibilidadeDados> {
    try {
      // Verificar dados de Lucro Real (cenários)
      const { data: cenarios } = await this.supabase
        .from('cenarios')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('ano', ano)
        .eq('status', 'aprovado')

      // Verificar dados manuais (Presumido e Simples)
      const { data: dadosPresumido } = await this.supabase
        .from('dados_comparativos_mensais')
        .select('mes')
        .eq('empresa_id', empresaId)
        .eq('ano', ano)
        .eq('regime', 'lucro_presumido')

      const { data: dadosSimples } = await this.supabase
        .from('dados_comparativos_mensais')
        .select('mes')
        .eq('empresa_id', empresaId)
        .eq('ano', ano)
        .eq('regime', 'simples_nacional')

      return {
        lucroReal: {
          disponivel: (cenarios?.length || 0) > 0,
          cenarios: cenarios?.length || 0,
          meses: 12 // Cenários cobrem o ano todo
        },
        lucroPresumido: {
          disponivel: (dadosPresumido?.length || 0) > 0,
          meses: dadosPresumido?.length || 0
        },
        simplesNacional: {
          disponivel: (dadosSimples?.length || 0) > 0,
          meses: dadosSimples?.length || 0
        }
      }

    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      throw error
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - PROCESSAMENTO DE DADOS
  // ============================================================================

  /**
   * Processar dados de todos os regimes incluídos
   */
  private async processarDadosRegimes(config: ConfigComparativo): Promise<Partial<ResultadosComparativo>> {
    const resultados: Partial<ResultadosComparativo> = {}

    for (const regime of config.regimesIncluidos) {
      console.log(`📊 Processando dados de ${regime}...`)

      try {
        if (regime === 'lucro_real') {
          resultados.lucroReal = await this.processarLucroReal(config)
        } else if (regime === 'lucro_presumido') {
          resultados.lucroPresumido = await this.processarDadosManuais(config, regime)
        } else if (regime === 'simples_nacional') {
          resultados.simplesNacional = await this.processarDadosManuais(config, regime)
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${regime}:`, error)
        throw new Error(`Erro ao processar dados de ${regime}`)
      }
    }

    return resultados
  }

  /**
   * Processar dados de Lucro Real (de cenários)
   */
  private async processarLucroReal(config: ConfigComparativo): Promise<ResultadoRegime> {
    const { empresaId, periodoInicio, periodoFim, ano, fonteDados } = config

    // Buscar cenários aprovados
    const cenarioIds = fonteDados.lucroReal?.cenarioIds || []
    
    if (cenarioIds.length === 0) {
      // Buscar todos os cenários aprovados do ano
      const { data: cenarios } = await this.supabase
        .from('cenarios')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('ano', ano)
        .eq('status', 'aprovado')

      if (cenarios) {
        cenarioIds.push(...cenarios.map(c => c.id))
      }
    }

    // Buscar dados dos cenários
    const { data: dadosCenarios, error } = await this.supabase
      .from('cenarios')
      .select('*')
      .in('id', cenarioIds)

    console.log('🔍 [LUCRO REAL] Dados brutos do Supabase:', {
      cenarioIds,
      quantidadeCenarios: dadosCenarios?.length || 0,
      error,
      primeirosCenarios: dadosCenarios?.slice(0, 2).map(c => ({
        id: c.id,
        nome: c.nome,
        configuracao: c.configuracao,
        resultados: c.resultados,
        todasColunas: Object.keys(c)
      }))
    })

    if (!dadosCenarios || dadosCenarios.length === 0) {
      throw new Error('Nenhum cenário aprovado encontrado para Lucro Real')
    }

    // Agregar dados mensais
    return this.agregarDadosLucroReal(dadosCenarios, periodoInicio, periodoFim, ano)
  }

  /**
   * Processar dados manuais (Presumido ou Simples)
   */
  private async processarDadosManuais(
    config: ConfigComparativo,
    regime: RegimeTributario
  ): Promise<ResultadoRegime> {
    const { empresaId, periodoInicio, periodoFim, ano } = config

    // Converter meses para números
    const mesesOrdem = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const mesInicioIdx = parseInt(periodoInicio) - 1
    const mesFimIdx = parseInt(periodoFim) - 1

    // Buscar dados manuais
    const { data: dadosManuais } = await this.supabase
      .from('dados_comparativos_mensais')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ano', ano)
      .eq('regime', regime)

    if (!dadosManuais || dadosManuais.length === 0) {
      throw new Error(`Nenhum dado manual encontrado para ${regime}`)
    }

    // Converter dados do Supabase
    const dadosConvertidos = dadosManuais.map(d => ({
      mes: this.converterNumeroParaMes(d.mes),
      ano: d.ano,
      receita: d.receita,
      impostos: d.icms + d.pis + d.cofins + d.irpj + d.csll + d.iss + (d.outros || 0),
      lucro: d.receita - (d.icms + d.pis + d.cofins + d.irpj + d.csll + d.iss + (d.outros || 0)),
      estimado: false,
      impostosPorTipo: {
        icms: d.icms,
        pis: d.pis,
        cofins: d.cofins,
        irpj: d.irpj,
        csll: d.csll,
        iss: d.iss,
        outros: d.outros || 0
      }
    }))

    return this.agregarDadosManuais(dadosConvertidos, mesesOrdem, mesInicioIdx, mesFimIdx, regime)
  }

  /**
   * Agregar dados de cenários de Lucro Real
   */
  private agregarDadosLucroReal(cenarios: any[], periodoInicio: string, periodoFim: string, ano: number): ResultadoRegime {
    console.log('🔧 [agregarDadosLucroReal] Processando cenários:', {
      quantidadeCenarios: cenarios.length,
      cenarios: cenarios.map(c => ({ id: c.id, nome: c.nome, configuracao: c.configuracao }))
    })
    
    const dadosMensais: DadosMensalRegime[] = []
    let receitaTotal = 0
    let totalImpostos = 0
    const impostosPorTipo: ImpostosPorTipo = {
      icms: 0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      iss: 0,
      outros: 0
    }

    // Processar cada cenário (cada cenário = 1 mês)
    cenarios.forEach(cenario => {
      const config = cenario.configuracao || {}
      const resultados = cenario.resultados || {}
      
      console.log('📊 [CENÁRIO] Processando:', {
        id: cenario.id,
        nome: cenario.nome,
        temConfiguracao: !!config,
        temResultados: !!resultados,
        keysConfig: Object.keys(config),
        keysResultados: Object.keys(resultados)
      })
      
      // Tentar extrair dados dos resultados calculados
      const receita = config.receitaBruta || 0
      const icms = resultados.icmsAPagar || 0
      const pis = resultados.pisAPagar || 0
      const cofins = resultados.cofinsAPagar || 0
      const irpj = resultados.irpjAPagar || 0
      const csll = resultados.csllAPagar || 0
      const iss = resultados.issAPagar || 0
      const cpp = resultados.cppAPagar || 0
      
      const impostosMes = icms + pis + cofins + irpj + csll + iss + cpp
      
      // Determinar o mês do cenário (pode estar no nome ou configuração)
      const nomeCenario = (cenario.nome || '').toLowerCase()
      const mesesNomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
      const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
      
      let mesIdx = -1
      mesesNomes.forEach((nomeMes, idx) => {
        if (nomeCenario.includes(nomeMes)) {
          mesIdx = idx
        }
      })
      
      if (mesIdx >= 0) {
        const mes = mesesAbrev[mesIdx]
        
        receitaTotal += receita
        totalImpostos += impostosMes
        
        impostosPorTipo.icms += icms
        impostosPorTipo.pis += pis
        impostosPorTipo.cofins += cofins
        impostosPorTipo.irpj += irpj
        impostosPorTipo.csll += csll
        impostosPorTipo.iss += iss
        impostosPorTipo.outros += cpp  // CPP vai em "outros"
        
        dadosMensais.push({
          mes,
          ano,
          receita,
          impostos: impostosMes,
          lucro: receita - impostosMes,
          estimado: false
        })
        
        console.log(`✅ [MÊS ${mes.toUpperCase()}] Dados extraídos:`, {
          receita,
          icms, pis, cofins, irpj, csll, iss, cpp,
          totalImpostos: impostosMes
        })
      } else {
        console.warn('⚠️ [CENÁRIO] Não foi possível determinar o mês:', nomeCenario)
      }
    })

    console.log('📊 [RESULTADO FINAL]:', {
      receitaTotal,
      totalImpostos,
      impostosPorTipo,
      mesesProcessados: dadosMensais.length
    })

    return {
      regime: 'lucro_real',
      receitaTotal,
      totalImpostos,
      lucroLiquido: receitaTotal - totalImpostos,
      cargaTributaria: receitaTotal > 0 ? (totalImpostos / receitaTotal) * 100 : 0,
      impostosPorTipo,
      dadosMensais,
      mesesComDados: dadosMensais.length,
      mesesEstimados: 0,
      dataCalculado: new Date()
    }
  }

  /**
   * Agregar dados manuais
   */
  private agregarDadosManuais(
    dados: any[],
    mesesOrdem: string[],
    mesInicioIdx: number,
    mesFimIdx: number,
    regime: RegimeTributario
  ): ResultadoRegime {
    let receitaTotal = 0
    let totalImpostos = 0
    const impostosPorTipo: ImpostosPorTipo = {
      icms: 0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      iss: 0,
      outros: 0
    }
    const dadosMensais: DadosMensalRegime[] = []
    let mesesComDados = 0

    for (let i = mesInicioIdx; i <= mesFimIdx; i++) {
      const mes = mesesOrdem[i]
      const dadoMes = dados.find(d => d.mes === mes)

      if (dadoMes) {
        receitaTotal += dadoMes.receita
        totalImpostos += dadoMes.impostos

        impostosPorTipo.icms += dadoMes.impostosPorTipo.icms
        impostosPorTipo.pis += dadoMes.impostosPorTipo.pis
        impostosPorTipo.cofins += dadoMes.impostosPorTipo.cofins
        impostosPorTipo.irpj += dadoMes.impostosPorTipo.irpj
        impostosPorTipo.csll += dadoMes.impostosPorTipo.csll
        impostosPorTipo.iss += dadoMes.impostosPorTipo.iss
        impostosPorTipo.outros += dadoMes.impostosPorTipo.outros

        dadosMensais.push({
          mes: dadoMes.mes,
          ano: dadoMes.ano,
          receita: dadoMes.receita,
          impostos: dadoMes.impostos,
          lucro: dadoMes.lucro,
          estimado: false
        })

        mesesComDados++
      }
    }

    return {
      regime,
      receitaTotal,
      totalImpostos,
      lucroLiquido: receitaTotal - totalImpostos,
      cargaTributaria: receitaTotal > 0 ? (totalImpostos / receitaTotal) * 100 : 0,
      impostosPorTipo,
      dadosMensais,
      mesesComDados,
      mesesEstimados: 0,
      dataCalculado: new Date()
    }
  }

  // ============================================================================
  // CÁLCULO DE ANÁLISE COMPARATIVA
  // ============================================================================

  /**
   * Calcular análise comparativa entre regimes
   */
  private calcularAnaliseComparativa(
    resultados: Partial<ResultadosComparativo>,
    regimesIncluidos: RegimeTributario[]
  ): AnaliseComparativa {
    const regimesComDados: Array<{ regime: RegimeTributario; resultado: ResultadoRegime }> = []

    if (resultados.lucroReal) {
      regimesComDados.push({ regime: 'lucro_real', resultado: resultados.lucroReal })
    }
    if (resultados.lucroPresumido) {
      regimesComDados.push({ regime: 'lucro_presumido', resultado: resultados.lucroPresumido })
    }
    if (resultados.simplesNacional) {
      regimesComDados.push({ regime: 'simples_nacional', resultado: resultados.simplesNacional })
    }

    // Encontrar regime com menor carga tributária (mais vantajoso)
    const regimeMaisVantajoso = regimesComDados.reduce((melhor, atual) =>
      atual.resultado.totalImpostos < melhor.resultado.totalImpostos ? atual : melhor
    )

    // Encontrar regime com maior carga
    const regimeMenosVantajoso = regimesComDados.reduce((pior, atual) =>
      atual.resultado.totalImpostos > pior.resultado.totalImpostos ? atual : pior
    )

    const economiaAnual = regimeMenosVantajoso.resultado.totalImpostos - regimeMaisVantajoso.resultado.totalImpostos
    const economiaPercentual = ((economiaAnual / regimeMenosVantajoso.resultado.totalImpostos) * 100)
    const diferencaMaiorMenor = regimeMenosVantajoso.resultado.totalImpostos - regimeMaisVantajoso.resultado.totalImpostos

    // Gerar insights automáticos
    const insights = this.gerarInsights(regimesComDados, regimeMaisVantajoso.regime)
    const recomendacoes = this.gerarRecomendacoes(regimesComDados, regimeMaisVantajoso.regime, economiaAnual)

    return {
      regimeMaisVantajoso: regimeMaisVantajoso.regime,
      economiaAnual,
      economiaPercentual,
      diferencaMaiorMenor,
      insights,
      recomendacoes
    }
  }

  /**
   * Gerar insights automáticos
   */
  private gerarInsights(
    regimes: Array<{ regime: RegimeTributario; resultado: ResultadoRegime }>,
    melhorRegime: RegimeTributario
  ): string[] {
    const insights: string[] = []

    // Insight sobre o regime mais vantajoso
    const nomeRegime = this.getNomeRegime(melhorRegime)
    insights.push(`✅ ${nomeRegime} apresenta a menor carga tributária entre os regimes analisados`)

    // Comparar cargas tributárias
    regimes.forEach(({ regime, resultado }) => {
      if (regime !== melhorRegime) {
        const diferenca = resultado.cargaTributaria - regimes.find(r => r.regime === melhorRegime)!.resultado.cargaTributaria
        insights.push(`⚠️  ${this.getNomeRegime(regime)} tem ${diferenca.toFixed(2)}% a mais de carga tributária`)
      }
    })

    return insights
  }

  /**
   * Gerar recomendações
   */
  private gerarRecomendacoes(
    regimes: Array<{ regime: RegimeTributario; resultado: ResultadoRegime }>,
    melhorRegime: RegimeTributario,
    economia: number
  ): string[] {
    const recomendacoes: string[] = []

    if (economia > 50000) {
      recomendacoes.push(`💰 Economia significativa de R$ ${economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - considere mudança de regime`)
    }

    const nomeRegime = this.getNomeRegime(melhorRegime)
    recomendacoes.push(`💡 Avalie a viabilidade de migração para ${nomeRegime}`)
    recomendacoes.push(`📊 Consulte um contador para análise detalhada antes de mudar de regime`)

    return recomendacoes
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private validarConfig(config: ConfigComparativo): void {
    if (!config.empresaId) throw new Error('empresaId é obrigatório')
    if (!config.nome) throw new Error('nome é obrigatório')
    if (config.regimesIncluidos.length < 2) {
      throw new Error('É necessário incluir pelo menos 2 regimes para comparação')
    }
  }

  private async salvarComparativo(config: ConfigComparativo, resultados: ResultadosComparativo): Promise<Comparativo> {
    const dadosSupabase = {
      empresa_id: config.empresaId,
      nome: config.nome,
      descricao: config.descricao || null,
      tipo: this.determinarTipo(config),
      configuracao: config,
      resultados: resultados,
      simulacoes: [],
      favorito: false,
      compartilhado: false
    }

    const { data, error } = await this.supabase
      .from('comparativos_analise')
      .insert(dadosSupabase)
      .select()
      .single()

    if (error) throw error
    return this.fromSupabaseFormat(data)
  }

  private determinarTipo(config: ConfigComparativo): string {
    // Determinar tipo baseado na configuração
    const regimesCount = config.regimesIncluidos.length
    if (regimesCount > 2) return 'multiplo'
    if (config.ano) return 'temporal'
    return 'simples'
  }

  private fromSupabaseFormat(data: ComparativoSupabase): Comparativo {
    // Extrair informações da configuração se existir
    const config = data.configuracao || {}
    
    const keysResultados = data.resultados ? Object.keys(data.resultados) : []
    
    console.log('🔧 [fromSupabaseFormat] Convertendo dados:', {
      temResultados: !!data.resultados,
      tipoResultados: typeof data.resultados,
      quantidadeChaves: keysResultados.length,
      todasAsChaves: keysResultados,
      primeiroValor: data.resultados ? data.resultados[keysResultados[0]] : null
    })
    
    // data.resultados vem do Supabase como AnaliseComparativa completa
    // Precisamos adaptá-la para a estrutura antiga esperada pelo componente
    // que é: { analise: AnaliseComparativa, lucroReal?, lucroPresumido?, simplesNacional? }
    
    return {
      id: data.id,
      empresaId: data.empresa_id,
      nome: data.nome,
      descricao: data.descricao || undefined,
      periodoInicio: config.periodoInicio || '',
      periodoFim: config.periodoFim || '',
      ano: config.ano || new Date().getFullYear(),
      regimesIncluidos: this.extrairRegimesIncluidos(config),
      fonteDados: config,
      // CORREÇÃO: data.resultados JÁ É a AnaliseComparativa
      // O componente espera isso diretamente, não wrapped em { analise: ... }
      resultados: data.resultados as any,
      criadoEm: new Date(data.created_at),
      atualizadoEm: new Date(data.updated_at)
    }
  }

  private extrairRegimesIncluidos(config: any): RegimeTributario[] {
    const regimes: RegimeTributario[] = []
    if (config.lucroReal?.incluir) regimes.push('lucro_real')
    if (config.dadosManuais?.lucroPresumido?.incluir) regimes.push('lucro_presumido')
    if (config.dadosManuais?.simplesNacional?.incluir) regimes.push('simples_nacional')
    return regimes
  }

  private converterNumeroParaMes(mes: string): string {
    const meses: Record<string, string> = {
      '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr',
      '05': 'mai', '06': 'jun', '07': 'jul', '08': 'ago',
      '09': 'set', '10': 'out', '11': 'nov', '12': 'dez'
    }
    return meses[mes] || mes
  }

  private getNomeRegime(regime: RegimeTributario): string {
    const nomes: Record<RegimeTributario, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime]
  }
}

export const comparativosAnaliseService = new ComparativosAnaliseService()
