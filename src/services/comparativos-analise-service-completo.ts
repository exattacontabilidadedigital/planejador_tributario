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
      console.log('🔄 Iniciando criação de comparativo:', config.nome)

      // 1. Buscar dados de cada regime configurado
      const dadosRegimes = await this.buscarDadosRegimes(config)
      
      // 2. Processar e agregar dados
      const resultados = this.processarResultados(dadosRegimes, config)
      
      // 3. Realizar análise comparativa completa
      const analise = this.analisarComparativo(resultados, config)
      
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
        console.log(`\n   ${i + 1}. Mês ${d.mes}:`)
        console.log(`      • ID: ${d.id}`)
        console.log(`      • Receita: R$ ${(d.receita || 0).toLocaleString('pt-BR')}`)
        console.log(`      • Total Impostos: R$ ${(d.total_impostos || 0).toLocaleString('pt-BR')}`)
        console.log(`      • Tem impostos_detalhados?`, !!d.impostos_detalhados)
        
        if (d.total_impostos === 0 || d.total_impostos === null) {
          console.log(`      ⚠️  TOTAL IMPOSTOS ZERADO OU NULO!`)
        }
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
    
    const cenarioNome = dados[0]?.nome || undefined
    const mesesSelecionados = config.mesesSelecionados
    const mesesComDados = dados.map(d => this.formatarMes(d.mes))
    const mesesSemDados = mesesSelecionados.filter(m => !mesesComDados.includes(m))

    console.log(`\n📊 [PROCESSAR REGIME] ${this.formatarRegime(regime)}${cenarioNome ? ` - ${cenarioNome}` : ''}`)
    console.log(`   Dados recebidos: ${dados.length} registros`)

    // Agregar dados mensais
    const dadosMensais: DadosMensalRegime[] = dados.map(dado => {
      const receita = this.extrairReceita(dado)
      const impostos = this.extrairImpostos(dado)
      const totalImpostos = this.calcularTotalImpostos(impostos)
      
      console.log(`   📅 Mês ${dado.mes}:`)
      console.log(`      Receita: R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`      Impostos detalhados:`, impostos)
      console.log(`      Total Impostos: R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      
      return {
        mes: this.formatarMes(dado.mes),
        ano: dado.ano,
        receita,
        impostos,
        totalImpostos,
        lucroLiquido: 0, // Calculado depois
        cargaTributaria: 0 // Calculado depois
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
      dado.lucroLiquido = dado.receita - dado.totalImpostos
      dado.cargaTributaria = dado.receita > 0 ? (dado.totalImpostos / dado.receita) * 100 : 0
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
  ): AnaliseComparativa {
    
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
    const analiseBase: AnaliseComparativa = {
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
    analise: AnaliseComparativa
  ): Promise<ComparativoCompleto | null> {
    const supabase = createClient()
    
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

    if (error) {
      console.error('Erro ao salvar comparativo:', error)
      throw error
    }

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

  private static formatarMes(mes: number | string): string {
    const mesNum = typeof mes === 'string' ? parseInt(mes) : mes
    return mesNum.toString().padStart(2, '0')
  }

  private static extrairReceita(dado: any): number {
    // Prioridade: receita_total > receita > receitaBrutaTotal (do configuracao)
    return dado.receita_total || dado.receita || dado.configuracao?.receitaBruta || 0
  }

  private static extrairImpostos(dado: any): ImpostosPorTipo {
    const fonte = dado.impostos_detalhados ? 'LUCRO REAL (impostos_detalhados)' : 'DADOS MANUAIS (campos diretos)'
    const identificacao = dado.nome || dado.mes || 'desconhecido'
    
    // Para cenários de Lucro Real com impostos_detalhados (vem do buscarDadosLucroReal)
    if (dado.impostos_detalhados) {
      const impostos = {
        icms: dado.impostos_detalhados.icms || 0,
        pis: dado.impostos_detalhados.pis || 0,
        cofins: dado.impostos_detalhados.cofins || 0,
        irpj: dado.impostos_detalhados.irpj || 0,
        csll: dado.impostos_detalhados.csll || 0,
        iss: dado.impostos_detalhados.iss || 0,
        cpp: dado.impostos_detalhados.cpp || 0,
        das: dado.impostos_detalhados.das,
        outros: dado.impostos_detalhados.outros || 0
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

    // Para dados manuais
    const impostos = {
      icms: dado.icms || 0,
      pis: dado.pis || 0,
      cofins: dado.cofins || 0,
      irpj: dado.irpj || 0,
      csll: dado.csll || 0,
      iss: dado.iss || 0,
      cpp: dado.cpp || 0,
      das: dado.das,
      outros: dado.outros || 0
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
