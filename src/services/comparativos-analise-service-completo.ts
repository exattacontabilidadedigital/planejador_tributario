import { createClient } from '@/lib/supabase/client'
import { MotorInsights } from './motor-insights'
import type {
  ConfigComparativo,
  ComparativoCompleto,
  AnaliseComparativa,
  ResultadoRegime,
  ImpostosPorTipo,
  DadosMensalRegime,
  AnalisePorImposto,
  ComparacaoImposto,
  DisponibilidadeDados,
  CenarioDisponivel,
  DadoMensalDisponivel,
  HeatmapCobertura,
  Simulacao
} from '@/types/comparativo-analise-completo'
import type { RegimeTributario } from '@/types/comparativo'

/**
 * Serviço Completo de Análise Comparativa de Regimes Tributários
 * Responsável por toda a lógica de criação, processamento e análise de comparativos
 */
export class ComparativosAnaliseServiceCompleto {

  /**
   * Cria um novo comparativo com análise completa
   */
  static async criarComparativo(config: ConfigComparativo): Promise<ComparativoCompleto | null> {
    try {
      console.log('\n🆕 ══════════════════════════════════════════════════════════')
      console.log('🆕 [CRIAR] Iniciando NOVA análise comparativa')
      console.log('🆕 [CRIAR] Nome:', config.nome)
      console.log('🆕 [CRIAR] Ano:', config.ano)
      console.log('🆕 [CRIAR] Tipo:', config.tipo)
      console.log('🆕 [CRIAR] Empresa ID:', config.empresaId)
      console.log('🆕 ══════════════════════════════════════════════════════════\n')

      // 1. Buscar dados de cada regime configurado
      const dadosRegimes = await this.buscarDadosRegimes(config)
      
      console.log('\n📊 [CRIAR] Dados buscados:', {
        quantidadeRegimes: Object.keys(dadosRegimes).length,
        regimes: Object.keys(dadosRegimes)
      })
      
      // 2. Processar e agregar dados
      const resultados = this.processarResultados(dadosRegimes, config)
      
      console.log('\n🔄 [CRIAR] Resultados processados:', {
        quantidadeRegimes: Object.keys(resultados).length,
        regimes: Object.keys(resultados),
        detalhes: Object.entries(resultados).map(([key, r]) => ({
          chave: key,
          regime: r.regime,
          receita: r.receitaTotal,
          impostos: r.totalImpostos,
          meses: r.dadosMensais?.length
        }))
      })
      
      // 3. Realizar análise comparativa completa
      const analise = this.analisarComparativo(resultados, config)
      
      console.log('\n🧮 [CRIAR] Análise comparativa gerada:', {
        vencedor: analise.vencedor?.regime,
        economia: analise.vencedor?.economia,
        insights: analise.insights?.length,
        regimesAnalisados: analise.comparacao ? Object.keys(analise.comparacao.regimes).length : 0
      })
      
      // 4. Salvar no banco de dados
      const comparativo = await this.salvarComparativo(config, analise)
      
      console.log('✅ Comparativo criado com sucesso:', comparativo?.id)
      return comparativo

    } catch (error) {
      console.error('❌ Erro ao criar comparativo:', error)
      throw error
    }
  }

  /**
   * 🆕 Atualiza um comparativo existente com dados atualizados do banco
   * Útil para refletir alterações em cenários sem recriar o comparativo
   */
  static async atualizarComparativo(comparativoId: string): Promise<ComparativoCompleto | null> {
    try {
      console.log('🔄 Atualizando comparativo:', comparativoId)
      
      const supabase = createClient()
      
      // 1. Buscar comparativo existente
      const { data: comparativo, error } = await supabase
        .from('comparativos_analise')
        .select('*')
        .eq('id', comparativoId)
        .single()
      
      if (error || !comparativo) {
        throw new Error('Comparativo não encontrado')
      }
      
      console.log('📦 [ATUALIZAR] Comparativo do banco:', {
        id: comparativo.id,
        empresa_id: comparativo.empresa_id,
        nome: comparativo.nome,
        temConfiguracao: !!comparativo.configuracao,
        tipoConfiguracao: typeof comparativo.configuracao
      })
      
      // 2. Extrair configuração original
      let config: ConfigComparativo | null = null
      
      // O campo no banco é 'configuracao', não 'config'
      const configRaw = comparativo.configuracao || comparativo.config
      
      if (!configRaw) {
        console.error('❌ Comparativo não possui campo configuracao ou config:', comparativo)
        throw new Error('Comparativo não possui configuração válida')
      }
      
      if (typeof configRaw === 'string') {
        try {
          config = JSON.parse(configRaw)
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse de configuracao:', parseError)
          throw new Error('Configuração do comparativo está corrompida')
        }
      } else {
        config = configRaw
      }
      
      // Validar se config existe após parse
      if (!config) {
        console.error('❌ Config é null após parse:', comparativo)
        throw new Error('Configuração do comparativo é inválida')
      }
      
      console.log('📋 Config recuperada:', config)
      console.log('🔍 [ATUALIZAR] Configuração detalhada:', {
        empresaIdNaConfig: config.empresaId,
        empresaIdNoComparativo: comparativo.empresa_id,
        saoIguais: config.empresaId === comparativo.empresa_id,
        ano: config.ano,
        mesesSelecionados: config.mesesSelecionados,
        lucroReal: config.lucroReal,
        dadosManuais: config.dadosManuais
      })
      
      // 🔥 CORREÇÃO: Garantir que usamos o empresa_id do registro, não da config
      if (!config.empresaId || config.empresaId !== comparativo.empresa_id) {
        console.warn('⚠️ [ATUALIZAR] empresaId da config difere do registro! Corrigindo...')
        config.empresaId = comparativo.empresa_id
      }
      
      // 3. Buscar dados ATUALIZADOS do banco
      const dadosRegimes = await this.buscarDadosRegimes(config)
      
      // 4. Reprocessar resultados com dados atuais
      const resultados = this.processarResultados(dadosRegimes, config)
      
      // 5. Reanalisar comparativo
      const analise = this.analisarComparativo(resultados, config)
      
      // 6. Atualizar no banco
      const { data: comparativoAtualizado, error: updateError } = await supabase
        .from('comparativos_analise')
        .update({
          resultados: analise, // O campo no banco é 'resultados', não 'analise'
          updated_at: new Date().toISOString()
        })
        .eq('id', comparativoId)
        .select()
        .single()
      
      if (updateError) {
        throw updateError
      }
      
      console.log('✅ Comparativo atualizado com sucesso!')
      
      return {
        ...comparativoAtualizado,
        config,
        analise
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar comparativo:', error)
      throw error
    }
  }

  /**
   * Busca dados de todos os regimes configurados
   */
  private static async buscarDadosRegimes(config: ConfigComparativo): Promise<Map<string, any[]>> {
    const dadosRegimes = new Map<string, any[]>()

    console.log('🔍 [BUSCAR DADOS] Iniciando busca com config:', {
      empresaId: config.empresaId,
      ano: config.ano,
      mesesSelecionados: config.mesesSelecionados,
      incluirLucroReal: config.lucroReal?.incluir,
      incluirLucroPresumido: config.dadosManuais?.lucroPresumido?.incluir,
      incluirSimplesNacional: config.dadosManuais?.simplesNacional?.incluir
    })

    // Validar estrutura de config
    if (!config.lucroReal) {
      console.warn('⚠️ [SERVICE] config.lucroReal não definido, usando valores padrão')
      config.lucroReal = { incluir: false, cenarioIds: [], tipo: 'todos' }
    }
    if (!config.dadosManuais) {
      console.warn('⚠️ [SERVICE] config.dadosManuais não definido, usando valores padrão')
      config.dadosManuais = {
        lucroPresumido: { incluir: false },
        simplesNacional: { incluir: false }
      }
    }

    // Buscar dados de Lucro Real (cenários aprovados)
    if (config.lucroReal?.incluir && config.lucroReal?.cenarioIds?.length > 0) {
      console.log('🔍 [SERVICE] Buscando Lucro Real:', {
        empresaId: config.empresaId,
        ano: config.ano,
        meses: config.mesesSelecionados,
        cenarioIds: config.lucroReal.cenarioIds
      })
      
      const dadosLR = await this.buscarDadosLucroReal(
        config.empresaId,
        config.ano,
        config.mesesSelecionados,
        config.lucroReal.cenarioIds
      )
      
      console.log('✅ [SERVICE] Dados Lucro Real recebidos:', {
        quantidade: dadosLR.length,
        dados: dadosLR
      })
      
      dadosRegimes.set('lucro_real', dadosLR)
    }

    // Buscar dados de Lucro Presumido
    if (config.dadosManuais?.lucroPresumido?.incluir) {
      const dadosLP = await this.buscarDadosManuais(
        config.empresaId,
        config.ano,
        config.mesesSelecionados,
        'lucro_presumido',
        config.dadosManuais.lucroPresumido.dadosIds
      )
      dadosRegimes.set('lucro_presumido', dadosLP)
    }

    // Buscar dados de Simples Nacional
    if (config.dadosManuais?.simplesNacional?.incluir) {
      const dadosSN = await this.buscarDadosManuais(
        config.empresaId,
        config.ano,
        config.mesesSelecionados,
        'simples_nacional',
        config.dadosManuais.simplesNacional.dadosIds
      )
      dadosRegimes.set('simples_nacional', dadosSN)
    }

    return dadosRegimes
  }

  /**
   * Busca cenários aprovados de Lucro Real COM despesas dinâmicas
   */
  private static async buscarDadosLucroReal(
    empresaId: string,
    ano: number,
    meses: string[],
    cenarioIds: string[]
  ): Promise<any[]> {
    const supabase = createClient()
    const mesesNumero = meses.map(m => parseInt(m))

    // 1. Buscar cenários da tabela
    const { data, error } = await supabase
      .from('cenarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .in('id', cenarioIds)

    if (error) {
      console.error('Erro ao buscar cenários de Lucro Real:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Nenhum cenário de Lucro Real encontrado')
      return []
    }

    // 2. Buscar despesas dinâmicas de todos os cenários
    const { data: despesas, error: despesasError } = await supabase
      .from('despesas_dinamicas')
      .select('*')
      .in('cenario_id', cenarioIds)

    if (despesasError) {
      console.warn('⚠️ Erro ao buscar despesas dinâmicas:', despesasError)
    }

    console.log(`💼 [DESPESAS DINÂMICAS] Total encontradas: ${despesas?.length || 0}`)

    // 3. Agrupar despesas por cenário
    const despesasPorCenario = new Map<string, any[]>()
    despesas?.forEach(d => {
      if (!despesasPorCenario.has(d.cenario_id)) {
        despesasPorCenario.set(d.cenario_id, [])
      }
      despesasPorCenario.get(d.cenario_id)!.push(d)
    })

    // 4. Processar cada cenário seguindo estrutura da DRE
    const cenariosFormatados = data.map(c => {
      const mes = c.mes || (c.data_inicio ? new Date(c.data_inicio).getMonth() + 1 : null)
      const config = c.configuracao || {}
      const resultados = c.resultados || {}
      
      console.log(`\n� [DRE] Processando cenário: ${c.nome}`)
      console.log(`   ID: ${c.id}`)
      
      // ═══════════════════════════════════════════════════════════════
      // ETAPA 1: RECEITA BRUTA E DEDUÇÕES (DRE)
      // ═══════════════════════════════════════════════════════════════
      
      const receitaBruta = config.receitaBruta || 0
      
      // Buscar despesas dinâmicas
      const despesasCenario = despesasPorCenario.get(c.id) || []
      const despesasComCredito = despesasCenario.filter(d => d.credito === 'com-credito')
      const despesasSemCredito = despesasCenario.filter(d => d.credito === 'sem-credito')
      
      // Calcular créditos PIS/COFINS
      const totalDespesasComCredito = despesasComCredito.reduce((sum, d) => sum + (d.valor || 0), 0)
      const creditoPIS = totalDespesasComCredito * 0.0165  // 1,65%
      const creditoCOFINS = totalDespesasComCredito * 0.076 // 7,6%
      
      // Deduções da receita (impostos sobre faturamento)
      // Buscar ICMS do objeto icms.icmsAPagar ou direto de icmsAPagar
      const icmsAPagar = resultados.icms?.icmsAPagar || resultados.icmsAPagar || 0
      const pisAPagar = Math.max(0, (resultados.pisCofins?.pisAPagar || resultados.pisAPagar || 0) - creditoPIS)
      const cofinsAPagar = Math.max(0, (resultados.pisCofins?.cofinsAPagar || resultados.cofinsAPagar || 0) - creditoCOFINS)
      const issAPagar = resultados.issAPagar || 0
      const totalDeducoes = icmsAPagar + pisAPagar + cofinsAPagar + issAPagar
      
      const receitaLiquida = receitaBruta - totalDeducoes
      
      console.log(`   ✅ Receita Bruta: R$ ${receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   ❌ Deduções (ICMS+PIS+COFINS+ISS): R$ ${totalDeducoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   = Receita Líquida: R$ ${receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      // ═══════════════════════════════════════════════════════════════
      // ETAPA 2: CMV E LUCRO BRUTO
      // ═══════════════════════════════════════════════════════════════
      
      const cmv = config.cmvTotal || 0
      const lucroBruto = receitaLiquida - cmv
      
      console.log(`   ❌ CMV: R$ ${cmv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   = Lucro Bruto: R$ ${lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      // ═══════════════════════════════════════════════════════════════
      // ETAPA 3: DESPESAS OPERACIONAIS E LAIR
      // ═══════════════════════════════════════════════════════════════
      
      const totalDespesasOperacionais = despesasCenario
        .filter(d => d.tipo === 'despesa')
        .reduce((sum, d) => sum + (d.valor || 0), 0)
      
      const lair = lucroBruto - totalDespesasOperacionais
      
      console.log(`   ❌ Despesas Operacionais: R$ ${totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   = LAIR (Lucro Antes IRPJ/CSLL): R$ ${lair.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      // ═══════════════════════════════════════════════════════════════
      // ETAPA 4: AJUSTES FISCAIS (ADIÇÕES E EXCLUSÕES)
      // ═══════════════════════════════════════════════════════════════
      
      const adicoes = config.adicoesLucro || 0
      const exclusoes = config.exclusoesLucro || 0
      const lucroRealBase = lair + adicoes - exclusoes
      
      console.log(`   ➕ Adições: R$ ${adicoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   ➖ Exclusões: R$ ${exclusoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   = LUCRO REAL (Base IRPJ/CSLL): R$ ${lucroRealBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      // ═══════════════════════════════════════════════════════════════
      // 🆕 ETAPA 5: RECALCULAR IRPJ/CSLL COM PERÍODO DE APURAÇÃO CORRETO
      // ═══════════════════════════════════════════════════════════════
      
      // Extrair período de apuração do cenário (ou usar padrão 'mensal')
      const periodoPagamento = config.periodoPagamento || c.periodoPagamento || 'mensal'
      
      // Definir limites por período de apuração
      const limitesPorPeriodo = {
        mensal: 20000,      // R$ 20.000
        trimestral: 60000,  // R$ 60.000 (R$ 20.000 × 3 meses)
        anual: 240000       // R$ 240.000 (R$ 20.000 × 12 meses)
      }
      
      const limiteIRPJ = limitesPorPeriodo[periodoPagamento as keyof typeof limitesPorPeriodo] || 20000
      
      console.log(`   📅 Período de Apuração: ${periodoPagamento.toUpperCase()}`)
      console.log(`   💰 Limite IRPJ Adicional: R$ ${limiteIRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      // IRPJ Base (15%)
      const irpjBase = lucroRealBase * 0.15
      
      // IRPJ Adicional (10% sobre o que exceder o limite do período)
      const baseAdicional = Math.max(0, lucroRealBase - limiteIRPJ)
      const irpjAdicional = baseAdicional * 0.10
      
      // Total IRPJ
      const irpjAPagar = irpjBase + irpjAdicional
      
      // CSLL (9%)
      const csllAPagar = lucroRealBase * 0.09
      
      console.log(`   💰 IRPJ BASE (15%): R$ ${irpjBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   💰 IRPJ ADICIONAL (10% sobre R$ ${baseAdicional.toLocaleString('pt-BR')}): R$ ${irpjAdicional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   💰 IRPJ TOTAL: R$ ${irpjAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   💰 CSLL (9%): R$ ${csllAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      // ═══════════════════════════════════════════════════════════════
      // ETAPA 6: LUCRO LÍQUIDO
      // ═══════════════════════════════════════════════════════════════
      
      const lucroLiquido = lair - irpjAPagar - csllAPagar
      
      console.log(`   ✅ LUCRO LÍQUIDO: R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   ─────────────────────────────────────`)
      
      // Montar objeto de impostos detalhados
      const impostos = {
        icms: icmsAPagar,
        pis: pisAPagar,
        cofins: cofinsAPagar,
        irpj: irpjAPagar,
        csll: csllAPagar,
        iss: issAPagar,
        cpp: resultados.cpp?.cppAPagar || resultados.cppAPagar || 0,
        inss: resultados.inss?.inssAPagar || resultados.inssAPagar || 0
      }
      
      const totalImpostos = Object.values(impostos).reduce((sum, val) => sum + (val || 0), 0)
      
      if (totalDespesasComCredito > 0) {
        console.log(`� [CRÉDITOS] Despesas COM crédito: R$ ${totalDespesasComCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`   • Crédito PIS: R$ ${creditoPIS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`   • Crédito COFINS: R$ ${creditoCOFINS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      }
      
      return {
        id: c.id,
        nome: c.nome,
        tipo: c.tipo_periodo || 'anual',
        ano: c.ano || (c.data_inicio ? new Date(c.data_inicio).getFullYear() : ano),
        mes: mes,
        
        // 🆕 Período de Apuração IRPJ/CSLL
        periodoPagamento: periodoPagamento,
        limiteIRPJ: limiteIRPJ,
        
        // Dados completos da DRE
        receita_total: receitaBruta,
        receita: receitaBruta,
        deducoes: totalDeducoes,
        receita_liquida: receitaLiquida,
        cmv: cmv,
        lucro_bruto: lucroBruto,
        despesas_operacionais: totalDespesasOperacionais,
        lair: lair,
        adicoes: adicoes,
        exclusoes: exclusoes,
        lucro_real_base: lucroRealBase,
        lucro_liquido: lucroLiquido,
        
        total_impostos: totalImpostos,
        impostos_detalhados: impostos,
        
        // 🆕 Detalhamento do IRPJ com período de apuração
        irpj_detalhado: {
          base: irpjBase,
          adicional: irpjAdicional,
          total: irpjAPagar,
          baseAdicional: baseAdicional,
          limite: limiteIRPJ,
          periodo: periodoPagamento
        },
        
        // Informações de despesas dinâmicas
        despesas_dinamicas: {
          total: despesasCenario.length,
          comCredito: despesasComCredito.length,
          semCredito: despesasSemCredito.length,
          valorComCredito: totalDespesasComCredito,
          creditoPIS,
          creditoCOFINS,
          totalCreditos: creditoPIS + creditoCOFINS
        },
        
        configuracao: c.configuracao
      }
    })

    return cenariosFormatados
  }

  /**
   * Busca dados manuais de outros regimes
   */
  private static async buscarDadosManuais(
    empresaId: string,
    ano: number,
    meses: string[],
    regime: RegimeTributario,
    dadosIds?: string[]
  ): Promise<any[]> {
    console.log(`\n🔍 [BUSCAR DADOS MANUAIS] Regime: ${regime}`)
    console.log(`   Empresa ID: ${empresaId}`)
    console.log(`   Ano: ${ano}`)
    console.log(`   Meses solicitados:`, meses)
    console.log(`   IDs específicos:`, dadosIds)
    
    const supabase = createClient()
    let query = supabase
      .from('dados_comparativos_mensais')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ano', ano)
      .eq('regime', regime)
      .in('mes', meses)
      .order('mes', { ascending: true })

    if (dadosIds && dadosIds.length > 0) {
      query = query.in('id', dadosIds)
    }

    const { data, error } = await query

    if (error) {
      console.error(`❌ [${regime}] Erro ao buscar:`, error)
      throw error
    }

    console.log(`📊 [${regime}] Registros encontrados: ${data?.length || 0}`)
    
    if (data && data.length > 0) {
      data.forEach((d, i) => {
        // Calcular total de impostos manualmente
        const totalImpostos = (parseFloat(d.icms) || 0) + 
                              (parseFloat(d.pis) || 0) + 
                              (parseFloat(d.cofins) || 0) + 
                              (parseFloat(d.irpj) || 0) + 
                              (parseFloat(d.csll) || 0) + 
                              (parseFloat(d.iss) || 0) + 
                              (parseFloat(d.outros) || 0)
        
        console.log(`\n   ${i + 1}. Mês ${d.mes} (Ano ${d.ano}):`)
        console.log(`      • ID: ${d.id}`)
        console.log(`      • Regime: ${d.regime}`)
        console.log(`      • Receita: R$ ${parseFloat(d.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • ICMS: R$ ${parseFloat(d.icms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • PIS: R$ ${parseFloat(d.pis || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • COFINS: R$ ${parseFloat(d.cofins || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • IRPJ: R$ ${parseFloat(d.irpj || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • CSLL: R$ ${parseFloat(d.csll || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • ISS: R$ ${parseFloat(d.iss || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • Outros: R$ ${parseFloat(d.outros || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`      • Total Calculado: R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      })
    } else {
      console.log(`   ⚠️  NENHUM REGISTRO ENCONTRADO!`)
    }

    return data || []
  }

  /**
   * Processa e agrega dados de cada regime
   */
  private static processarResultados(
    dadosRegimes: Map<string, any[]>,
    config: ConfigComparativo
  ): Record<string, ResultadoRegime> {
    const resultados: Record<string, ResultadoRegime> = {}

    // Processar Lucro Real (pode ter múltiplos cenários)
    const dadosLR = dadosRegimes.get('lucro_real')
    if (dadosLR && dadosLR.length > 0) {
      const cenariosPorId = this.agruparCenariosPorId(dadosLR)
      
      cenariosPorId.forEach((dados, cenarioId) => {
        const key = `lucro_real_${cenarioId}`
        resultados[key] = this.processarRegime(dados, 'lucro_real', config, cenarioId)
      })
    }

    // Processar Lucro Presumido
    const dadosLP = dadosRegimes.get('lucro_presumido')
    if (dadosLP && dadosLP.length > 0) {
      resultados['lucro_presumido'] = this.processarRegime(dadosLP, 'lucro_presumido', config)
    }

    // Processar Simples Nacional
    const dadosSN = dadosRegimes.get('simples_nacional')
    if (dadosSN && dadosSN.length > 0) {
      resultados['simples_nacional'] = this.processarRegime(dadosSN, 'simples_nacional', config)
    }

    return resultados
  }

  /**
   * Agrupa cenários de Lucro Real por ID
   */
  private static agruparCenariosPorId(cenarios: any[]): Map<string, any[]> {
    const grupos = new Map<string, any[]>()
    
    cenarios.forEach(cenario => {
      const id = cenario.id.split('_')[0] // Pegar apenas o ID base
      if (!grupos.has(id)) {
        grupos.set(id, [])
      }
      grupos.get(id)!.push(cenario)
    })

    return grupos
  }

  /**
   * Processa dados de um regime específico
   */
  private static processarRegime(
    dados: any[],
    regime: RegimeTributario,
    config: ConfigComparativo,
    cenarioId?: string
  ): ResultadoRegime {
    
    // ✅ Filtrar dados com mes inválido
    const dadosValidos = dados.filter(d => {
      if (d.mes === null || d.mes === undefined || d.mes === '') {
        console.warn(`⚠️ Registro ignorado: mes inválido`, d)
        return false
      }
      return true
    })

    if (dadosValidos.length === 0) {
      console.error(`❌ Nenhum dado válido para processar no regime ${regime}`)
      // Retornar resultado vazio mas válido
      return {
        regime,
        cenarioId,
        cenarioNome: undefined,
        receitaTotal: 0,
        impostos: { irpj: 0, csll: 0, pis: 0, cofins: 0, icms: 0, cpp: 0, iss: 0, outros: 0 },
        totalImpostos: 0,
        lucroLiquido: 0,
        cargaTributaria: 0,
        dadosMensais: [],
        mesesComDados: [],
        mesesSemDados: config.mesesSelecionados,
        percentualCobertura: 0
      }
    }
    
    const cenarioNome = dadosValidos[0]?.nome || undefined
    const mesesSelecionados = config.mesesSelecionados
    const mesesComDados = dadosValidos.map(d => this.formatarMes(d.mes))
    const mesesSemDados = mesesSelecionados.filter(m => !mesesComDados.includes(m))

    console.log(`\n📊 [PROCESSAR REGIME] ${this.formatarRegime(regime)}${cenarioNome ? ` - ${cenarioNome}` : ''}`)
    console.log(`   Dados recebidos: ${dados.length} registros (${dadosValidos.length} válidos)`)

    // Agregar dados mensais
    const dadosMensais: DadosMensalRegime[] = dadosValidos.map(dado => {
      const receita = this.extrairReceita(dado)
      const impostos = this.extrairImpostos(dado)
      const totalImpostos = this.calcularTotalImpostos(impostos)
      
      // ✅ USAR O REGIME DO BANCO DE DADOS se disponível, senão usar o parâmetro
      const regimeDado = dado.regime || regime
      
      console.log(`   📅 Mês ${dado.mes}:`)
      console.log(`      Regime (banco): ${dado.regime}`)
      console.log(`      Regime (parâmetro): ${regime}`)
      console.log(`      Regime (escolhido): ${regimeDado}`)
      console.log(`      Receita: R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`      Impostos detalhados:`, impostos)
      console.log(`      Total Impostos: R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      return {
        mes: this.formatarMes(dado.mes),
        ano: dado.ano,
        regime: regimeDado, // ✅ PRIORIZAR O REGIME DO BANCO DE DADOS
        receita,
        impostos,
        totalImpostos,
        lucro: 0, // Calculado depois
        lucroLiquido: 0, // Calculado depois
        cargaTributaria: 0, // Calculado depois
        estimado: false // Dados reais, não estimados
      }
    })

    // Calcular totais
    const receitaTotal = dadosMensais.reduce((sum, d) => sum + d.receita, 0)
    const impostosPorTipo = this.somarImpostos(dadosMensais.map(d => d.impostos))
    const totalImpostos = this.calcularTotalImpostos(impostosPorTipo)
    const lucroLiquido = receitaTotal - totalImpostos
    const cargaTributaria = receitaTotal > 0 ? (totalImpostos / receitaTotal) * 100 : 0
    
    console.log(`\n   💰 TOTAIS DO REGIME:`)
    console.log(`      Receita Total: R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`      Impostos por tipo:`, impostosPorTipo)
    console.log(`      Total Impostos: R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`      Lucro Líquido: R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`      Carga Tributária: ${cargaTributaria.toFixed(2)}%`)
    console.log(`   ──────────────────────────────────────`)

    // Atualizar lucro líquido e carga nos dados mensais
    dadosMensais.forEach(dado => {
      const totalImp = dado.totalImpostos || 0
      dado.lucro = dado.receita - totalImp
      dado.lucroLiquido = dado.receita - totalImp // Alias
      dado.cargaTributaria = dado.receita > 0 ? (totalImp / dado.receita) * 100 : 0
    })

    return {
      regime,
      cenarioId,
      cenarioNome,
      receitaTotal,
      impostos: impostosPorTipo,
      totalImpostos,
      lucroLiquido,
      cargaTributaria,
      dadosMensais,
      mesesComDados,
      mesesSemDados,
      percentualCobertura: (mesesComDados.length / mesesSelecionados.length) * 100
    }
  }

  /**
   * Realiza análise comparativa completa
   */
  private static analisarComparativo(
    resultados: Record<string, ResultadoRegime>,
    config: ConfigComparativo
  ): any {
    
    // Determinar vencedor
    const vencedor = this.determinarVencedor(resultados)
    
    // Calcular comparação
    const comparacao = this.calcularComparacao(resultados)
    
    // Analisar variação de Lucro Real (se houver múltiplos cenários)
    const variacaoLucroReal = this.analisarVariacaoLucroReal(resultados)
    
    // Análise por tipo de imposto
    const analisePorImposto = this.analisarPorImposto(resultados)
    
    // Análise de cobertura
    const cobertura = this.analisarCobertura(resultados, config)
    
    // Gerar insights usando o motor inteligente
    const analiseBase: any = {
      vencedor,
      comparacao,
      variacaoLucroReal,
      analisePorImposto,
      cobertura,
      insights: [],
      recomendacoes: [],
      alertas: [],
      breakEvenPoints: [],
      tendencias: []
    }
    
    // Usar motor de insights
    analiseBase.insights = MotorInsights.gerarInsights(analiseBase)
    analiseBase.recomendacoes = MotorInsights.gerarRecomendacoes(analiseBase, resultados)
    analiseBase.alertas = MotorInsights.gerarAlertas(resultados)
    analiseBase.breakEvenPoints = MotorInsights.calcularBreakEven(resultados)
    analiseBase.tendencias = MotorInsights.analisarTendencias(resultados)
    
    // 🔥 CRÍTICO: Adicionar regimes individuais diretamente no objeto
    // Isso mantém compatibilidade com a UI e garante que os dados sejam acessíveis
    Object.entries(resultados).forEach(([key, regime]) => {
      analiseBase[key] = regime
    })
    
    console.log('\n🔥 [ANÁLISE] Estrutura final com regimes individuais:', {
      chavesFinais: Object.keys(analiseBase),
      temComparacao: !!analiseBase.comparacao,
      temVencedor: !!analiseBase.vencedor,
      regimesIndividuais: Object.keys(resultados)
    })
    
    return analiseBase
  }

  /**
   * Determina o regime vencedor (menor carga tributária)
   */
  private static determinarVencedor(resultados: Record<string, ResultadoRegime>) {
    let vencedor = Object.values(resultados)[0]
    
    Object.values(resultados).forEach(resultado => {
      if (resultado.cargaTributaria < vencedor.cargaTributaria) {
        vencedor = resultado
      }
    })

    // Calcular economia vs segundo colocado
    const regimesOrdenados = Object.values(resultados)
      .sort((a, b) => a.cargaTributaria - b.cargaTributaria)
    
    const segundoColocado = regimesOrdenados[1]
    const economia = segundoColocado ? segundoColocado.totalImpostos - vencedor.totalImpostos : 0
    const economiaPercentual = segundoColocado 
      ? ((economia / segundoColocado.totalImpostos) * 100) 
      : 0

    return {
      regime: vencedor.regime,
      cenarioId: vencedor.cenarioId,
      cenarioNome: vencedor.cenarioNome,
      economia,
      economiaPercentual,
      justificativa: `${this.formatarRegime(vencedor.regime)}${vencedor.cenarioNome ? ` (${vencedor.cenarioNome})` : ''} apresenta a menor carga tributária com ${vencedor.cargaTributaria.toFixed(1)}%`
    }
  }

  /**
   * Calcula estatísticas de comparação
   */
  private static calcularComparacao(resultados: Record<string, ResultadoRegime>) {
    const impostos = Object.values(resultados).map(r => r.totalImpostos)
    
    return {
      regimes: resultados,
      diferencaMaxima: Math.max(...impostos) - Math.min(...impostos),
      diferencaMinima: Math.min(...impostos)
    }
  }

  /**
   * Analisa variação entre cenários de Lucro Real
   */
  private static analisarVariacaoLucroReal(resultados: Record<string, ResultadoRegime>) {
    const cenariosLR = Object.values(resultados)
      .filter(r => r.regime === 'lucro_real')
    
    if (cenariosLR.length < 2) return undefined

    const ordenados = cenariosLR.sort((a, b) => a.cargaTributaria - b.cargaTributaria)
    const melhor = ordenados[0]
    const pior = ordenados[ordenados.length - 1]
    
    // Calcular média
    const somaImpostos = cenariosLR.reduce((sum, c) => sum + c.totalImpostos, 0)
    const somaReceita = cenariosLR.reduce((sum, c) => sum + c.receitaTotal, 0)
    const medio: ResultadoRegime = {
      ...melhor,
      totalImpostos: somaImpostos / cenariosLR.length,
      receitaTotal: somaReceita / cenariosLR.length,
      cargaTributaria: (somaImpostos / somaReceita) * 100
    }

    const amplitude = pior.totalImpostos - melhor.totalImpostos
    const amplitudePercentual = (amplitude / pior.totalImpostos) * 100
    
    // Calcular desvio padrão
    const media = somaImpostos / cenariosLR.length
    const variancia = cenariosLR.reduce((sum, c) => 
      sum + Math.pow(c.totalImpostos - media, 2), 0) / cenariosLR.length
    const desviopadrao = Math.sqrt(variancia)

    return {
      cenarioMelhor: melhor,
      cenarioPior: pior,
      cenarioMedio: medio,
      amplitude,
      amplitudePercentual,
      desviopadrao
    }
  }

  /**
   * Analisa cada tipo de imposto separadamente
   */
  private static analisarPorImposto(resultados: Record<string, ResultadoRegime>): AnalisePorImposto {
    const tiposImposto: (keyof ImpostosPorTipo)[] = [
      'icms', 'pis', 'cofins', 'irpj', 'csll', 'iss', 'cpp', 'outros'
    ]

    const analise = {} as AnalisePorImposto

    console.log('\n📊 [ANÁLISE POR IMPOSTO]')

    tiposImposto.forEach(tipo => {
      const valores: Record<string, number> = {}
      const percentuais: Record<string, number> = {}
      
      Object.entries(resultados).forEach(([key, resultado]) => {
        valores[key] = resultado.impostos[tipo] || 0
        percentuais[key] = resultado.totalImpostos > 0 
          ? ((resultado.impostos[tipo] || 0) / resultado.totalImpostos) * 100
          : 0
      })

      const valoresArray = Object.values(valores)
      const maiorValor = Math.max(...valoresArray)
      const menorValor = Math.min(...valoresArray)
      const economia = maiorValor - menorValor
      
      // Log detalhado
      if (economia > 1000) {
        console.log(`\n💡 ${String(tipo).toUpperCase()}:`)
        console.log(`   Valores por regime:`, valores)
        console.log(`   Maior valor: R$ ${maiorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`   Menor valor: R$ ${menorValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`   Economia: R$ ${economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      }
      
      // Encontrar regime com menor valor (vencedor)
      let vencedorKey = ''
      let menorValorEncontrado = Infinity
      for (const [key, valor] of Object.entries(valores)) {
        if (valor < menorValorEncontrado) {
          menorValorEncontrado = valor
          vencedorKey = key
        }
      }

      (analise as any)[tipo] = {
        tipo,
        valores,
        vencedor: vencedorKey,
        maiorValor,
        menorValor,
        economia: maiorValor - menorValor,
        percentualSobreTotal: percentuais
      }
    })

    return analise
  }

  /**
   * Analisa cobertura de dados
   */
  private static analisarCobertura(
    resultados: Record<string, ResultadoRegime>,
    config: ConfigComparativo
  ) {
    const mesesSelecionados = config.mesesSelecionados
    const todosOsMesesComDados = new Set<string>()
    
    Object.values(resultados).forEach(resultado => {
      resultado.mesesComDados.forEach(mes => todosOsMesesComDados.add(mes))
    })

    const mesesComDados = Array.from(todosOsMesesComDados).sort()
    const mesesSemDados = mesesSelecionados.filter(m => !mesesComDados.includes(m))
    
    const regimesIncompletos = Object.entries(resultados)
      .filter(([, r]) => r.percentualCobertura < 100)
      .map(([key]) => key)

    return {
      mesesSelecionados,
      mesesComDados,
      mesesSemDados,
      percentualCobertura: (mesesComDados.length / mesesSelecionados.length) * 100,
      regimesIncompletos
    }
  }

  /**
   * Salva comparativo no banco de dados
   */
  private static async salvarComparativo(
    config: ConfigComparativo,
    analise: any
  ): Promise<ComparativoCompleto | null> {
    const supabase = createClient()
    
    console.log('\n💾 [SALVAR] Iniciando salvamento do comparativo')
    console.log('💾 [SALVAR] Nome:', config.nome)
    console.log('💾 [SALVAR] Tipo:', config.tipo)
    console.log('💾 [SALVAR] Ano:', config.ano)
    console.log('💾 [SALVAR] Estrutura da análise:', {
      temVencedor: !!analise.vencedor,
      temComparacao: !!analise.comparacao,
      temAnalisePorImposto: !!analise.analisePorImposto,
      regimesNaComparacao: analise.comparacao ? Object.keys(analise.comparacao.regimes) : [],
      quantidadeInsights: analise.insights?.length || 0,
      quantidadeRecomendacoes: analise.recomendacoes?.length || 0
    })
    
    // Log detalhado dos regimes
    if (analise.comparacao?.regimes) {
      console.log('💾 [SALVAR] Detalhes dos regimes:')
      Object.entries(analise.comparacao.regimes).forEach(([key, regime]) => {
        const reg = regime as ResultadoRegime
        console.log(`   • ${key}:`, {
          regime: reg.regime,
          cenarioNome: reg.cenarioNome,
          receitaTotal: reg.receitaTotal,
          totalImpostos: reg.totalImpostos,
          quantidadeMeses: reg.dadosMensais?.length || 0,
          primeiroMes: reg.dadosMensais?.[0] || null
        })
      })
    }
    
    const comparativo: Omit<ComparativoCompleto, 'id' | 'criadoEm' | 'atualizadoEm'> = {
      empresaId: config.empresaId,
      nome: config.nome,
      descricao: config.descricao,
      tipo: config.tipo,
      configuracao: config,
      resultados: analise,
      simulacoes: [],
      favorito: false,
      compartilhado: false,
      ultimaVisualizacao: new Date()
    }

    console.log('💾 [SALVAR] Payload para insert:', {
      empresa_id: comparativo.empresaId,
      nome: comparativo.nome,
      tipo: comparativo.tipo,
      tamanhoResultados: JSON.stringify(comparativo.resultados).length,
      chavesResultados: Object.keys(comparativo.resultados),
      tipoResultadosAntesDeSalvar: typeof comparativo.resultados,
      ehObjetoJavaScript: comparativo.resultados instanceof Object
    })
    
    const { data, error} = await supabase
      .from('comparativos_analise')
      .insert({
        empresa_id: comparativo.empresaId,
        nome: comparativo.nome,
        descricao: comparativo.descricao,
        tipo: comparativo.tipo,
        configuracao: comparativo.configuracao,
        resultados: comparativo.resultados,
        simulacoes: comparativo.simulacoes,
        favorito: comparativo.favorito,
        compartilhado: comparativo.compartilhado
      })
      .select()
      .single()
    
    console.log('💾 [SALVAR] Resposta do Supabase após insert:', {
      temData: !!data,
      tipoResultadosDepoisDeSalvar: typeof data?.resultados,
      ehStringAgora: typeof data?.resultados === 'string',
      primeirasPalavras: typeof data?.resultados === 'string' ? data.resultados.substring(0, 100) : 'não é string'
    })

    if (error) {
      console.error('❌ [SALVAR] Erro ao salvar comparativo:', error)
      throw error
    }
    
    console.log('✅ [SALVAR] Comparativo salvo com sucesso!')
    console.log('✅ [SALVAR] ID gerado:', data?.id)
    console.log('✅ [SALVAR] Resultados salvos:', {
      temResultados: !!data?.resultados,
      tipoResultados: typeof data?.resultados,
      chavesResultados: data?.resultados ? Object.keys(data.resultados) : []
    })

    return {
      ...comparativo,
      id: data.id,
      criadoEm: new Date(data.created_at),
      atualizadoEm: new Date(data.updated_at)
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private static formatarMes(mes: number | string | null | undefined): string {
    if (mes === null || mes === undefined) {
      console.warn('⚠️ formatarMes recebeu valor null/undefined')
      return '00'
    }
    
    const mesNum = typeof mes === 'string' ? parseInt(mes) : mes
    
    if (isNaN(mesNum)) {
      console.warn(`⚠️ formatarMes recebeu valor inválido: ${mes}`)
      return '00'
    }
    
    return mesNum.toString().padStart(2, '0')
  }

  private static extrairReceita(dado: any): number {
    // Prioridade: receita_total > receita > receitaBrutaTotal (do configuracao)
    const valor = dado.receita_total || dado.receita || dado.configuracao?.receitaBruta || 0
    // Garantir conversão para número
    return typeof valor === 'string' ? parseFloat(valor) : valor
  }

  private static extrairImpostos(dado: any): ImpostosPorTipo {
    const fonte = dado.impostos_detalhados ? 'LUCRO REAL (impostos_detalhados)' : 'DADOS MANUAIS (campos diretos)'
    const identificacao = dado.nome || dado.mes || 'desconhecido'
    
    // Função auxiliar para garantir conversão de string para número
    const toNumber = (val: any): number => {
      if (val === null || val === undefined) return 0
      return typeof val === 'string' ? parseFloat(val) || 0 : val || 0
    }
    
    // Para cenários de Lucro Real com impostos_detalhados (vem do buscarDadosLucroReal)
    if (dado.impostos_detalhados) {
      const impostos = {
        icms: toNumber(dado.impostos_detalhados.icms),
        pis: toNumber(dado.impostos_detalhados.pis),
        cofins: toNumber(dado.impostos_detalhados.cofins),
        irpj: toNumber(dado.impostos_detalhados.irpj),
        csll: toNumber(dado.impostos_detalhados.csll),
        iss: toNumber(dado.impostos_detalhados.iss),
        cpp: toNumber(dado.impostos_detalhados.cpp),
        das: toNumber(dado.impostos_detalhados.das),
        outros: toNumber(dado.impostos_detalhados.outros)
      }
      
      console.log(`📦 [${fonte}] ${identificacao}:`, {
        icms: impostos.icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        pis: impostos.pis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        cofins: impostos.cofins.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        irpj: impostos.irpj.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        csll: impostos.csll.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      })
      
      return impostos
    }

    // Para dados manuais (dos_comparativos_mensais)
    const impostos = {
      icms: toNumber(dado.icms),
      pis: toNumber(dado.pis),
      cofins: toNumber(dado.cofins),
      irpj: toNumber(dado.irpj),
      csll: toNumber(dado.csll),
      iss: toNumber(dado.iss),
      cpp: toNumber(dado.cpp),
      das: toNumber(dado.das),
      outros: toNumber(dado.outros)
    }
    
    console.log(`📦 [${fonte}] ${identificacao}:`, {
      icms: impostos.icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      pis: impostos.pis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      cofins: impostos.cofins.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      irpj: impostos.irpj.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      csll: impostos.csll.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      iss: impostos.iss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      outros: impostos.outros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      total: Object.values(impostos).reduce((sum, val) => sum + (val || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    })
    
    return impostos
  }

  private static calcularTotalImpostos(impostos: ImpostosPorTipo): number {
    return Object.values(impostos).reduce((sum: number, val) => sum + (val || 0), 0)
  }

  private static somarImpostos(impostosArray: ImpostosPorTipo[]): ImpostosPorTipo {
    return impostosArray.reduce((acc, impostos) => ({
      icms: acc.icms + (impostos.icms || 0),
      pis: acc.pis + (impostos.pis || 0),
      cofins: acc.cofins + (impostos.cofins || 0),
      irpj: acc.irpj + (impostos.irpj || 0),
      csll: acc.csll + (impostos.csll || 0),
      iss: acc.iss + (impostos.iss || 0),
      cpp: acc.cpp + (impostos.cpp || 0),
      das: acc.das ? acc.das + (impostos.das || 0) : impostos.das,
      outros: acc.outros + (impostos.outros || 0)
    }), {
      icms: 0, pis: 0, cofins: 0, irpj: 0, csll: 0, iss: 0, cpp: 0, outros: 0
    } as ImpostosPorTipo)
  }

  private static formatarRegime(regime: RegimeTributario): string {
    const nomes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime] || regime
  }
}
