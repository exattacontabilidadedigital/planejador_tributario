import { createClient } from '@/lib/supabase/client'
import type { MemoriaICMS, MemoriaPISCOFINS, MemoriaIRPJCSLL } from '@/types'

export class MemoriasCalculoService {
  static async salvarMemoriaICMS(cenarioId: string, memoria: MemoriaICMS): Promise<void> {
    console.log('💾 [ICMS] Salvando para cenário:', cenarioId)
    console.log('📊 [ICMS] Memória recebida:', {
      totalDebitos: memoria.totalDebitos,
      totalCreditos: memoria.totalCreditos,
      icmsAPagar: memoria.icmsAPagar
    })
    
    const supabase = createClient()
    if (!supabase) {
      throw new Error('❌ [ICMS] Cliente Supabase não foi criado')
    }
    
    const dados = {
      cenario_id: cenarioId,
      vendas_internas_base: memoria.vendasInternas.base,
      vendas_internas_aliquota: memoria.vendasInternas.aliquota / 100, // Converter % para decimal
      vendas_internas_valor: memoria.vendasInternas.valor,
      vendas_interestaduais_base: memoria.vendasInterestaduais.base,
      vendas_interestaduais_aliquota: memoria.vendasInterestaduais.aliquota / 100,
      vendas_interestaduais_valor: memoria.vendasInterestaduais.valor,
      difal_base: memoria.difal.base,
      difal_aliquota: memoria.difal.aliquota / 100,
      difal_valor: memoria.difal.valor,
      fcp_base: memoria.fcp.base,
      fcp_aliquota: memoria.fcp.aliquota / 100,
      fcp_valor: memoria.fcp.valor,
      credito_compras_internas_base: memoria.creditoComprasInternas.base,
      credito_compras_internas_aliquota: memoria.creditoComprasInternas.aliquota / 100,
      credito_compras_internas_valor: memoria.creditoComprasInternas.valor,
      credito_compras_interestaduais_base: memoria.creditoComprasInterestaduais.base,
      credito_compras_interestaduais_aliquota: memoria.creditoComprasInterestaduais.aliquota / 100,
      credito_compras_interestaduais_valor: memoria.creditoComprasInterestaduais.valor,
      credito_estoque_inicial_base: memoria.creditoEstoqueInicial?.base || 0,
      credito_estoque_inicial_valor: memoria.creditoEstoqueInicial?.valor || 0,
      credito_ativo_imobilizado_base: memoria.creditoAtivoImobilizado?.base || 0,
      credito_ativo_imobilizado_valor: memoria.creditoAtivoImobilizado?.valor || 0,
      credito_energia_base: memoria.creditoEnergia?.base || 0,
      credito_energia_valor: memoria.creditoEnergia?.valor || 0,
      credito_st_base: memoria.creditoST?.base || 0,
      credito_st_valor: memoria.creditoST?.valor || 0,
      outros_creditos_base: memoria.outrosCreditos?.base || 0,
      outros_creditos_valor: memoria.outrosCreditos?.valor || 0,
      total_debitos: memoria.totalDebitos,
      total_creditos: memoria.totalCreditos,
      icms_a_pagar: memoria.icmsAPagar,
    }

    console.log('📝 [ICMS] Dados preparados:', Object.keys(dados).length, 'campos')

    try {
      console.log('🔍 [ICMS] Verificando se registro existe...')
      const { data: existente, error: selectError } = await supabase
        .from('calculos_icms')
        .select('id')
        .eq('cenario_id', cenarioId)
        .maybeSingle()

      if (selectError) {
        console.error('❌ [ICMS] Erro ao buscar registro:', JSON.stringify(selectError, null, 2))
        throw selectError
      }

      if (existente) {
        console.log('🔄 [ICMS] Registro existe, atualizando...')
        const { error: updateError } = await supabase
          .from('calculos_icms')
          .update(dados)
          .eq('id', existente.id)
        
        if (updateError) {
          console.error('❌ [ICMS] Erro ao atualizar:', JSON.stringify(updateError, null, 2))
          throw updateError
        }
        console.log('✅ [ICMS] Atualizado com sucesso')
      } else {
        console.log('➕ [ICMS] Registro não existe, inserindo...')
        const { error: insertError, data: insertData } = await supabase
          .from('calculos_icms')
          .insert(dados)
          .select()
        
        if (insertError) {
          console.error('❌ [ICMS] Erro ao inserir:', JSON.stringify(insertError, null, 2))
          console.error('❌ [ICMS] Dados que causaram erro:', JSON.stringify(dados, null, 2))
          throw insertError
        }
        console.log('✅ [ICMS] Inserido com sucesso:', insertData)
      }
    } catch (error) {
      console.error('❌ [ICMS] Erro geral:', error)
      console.error('❌ [ICMS] Tipo do erro:', typeof error)
      console.error('❌ [ICMS] Erro stringified:', JSON.stringify(error, null, 2))
      throw error
    }
  }

  static async salvarMemoriaPISCOFINS(cenarioId: string, memoria: MemoriaPISCOFINS): Promise<void> {
    console.log('💾 [PIS/COFINS] Salvando para cenário:', cenarioId)
    
    const supabase = createClient()
    
    const dados = {
      cenario_id: cenarioId,
      debito_pis_base: memoria.debitoPIS.base,
      debito_pis_aliquota: memoria.debitoPIS.aliquota / 100, // Converter % para decimal
      debito_pis_valor: memoria.debitoPIS.valor,
      debito_cofins_base: memoria.debitoCOFINS.base,
      debito_cofins_aliquota: memoria.debitoCOFINS.aliquota / 100,
      debito_cofins_valor: memoria.debitoCOFINS.valor,
      credito_pis_compras_base: memoria.creditoPISCompras.base,
      credito_pis_compras_aliquota: memoria.creditoPISCompras.aliquota / 100,
      credito_pis_compras_valor: memoria.creditoPISCompras.valor,
      credito_cofins_compras_base: memoria.creditoCOFINSCompras.base,
      credito_cofins_compras_aliquota: memoria.creditoCOFINSCompras.aliquota / 100,
      credito_cofins_compras_valor: memoria.creditoCOFINSCompras.valor,
      credito_pis_despesas_base: memoria.creditoPISDespesas?.base || 0,
      credito_pis_despesas_aliquota: (memoria.creditoPISDespesas?.aliquota || 0) / 100,
      credito_pis_despesas_valor: memoria.creditoPISDespesas?.valor || 0,
      credito_cofins_despesas_base: memoria.creditoCOFINSDespesas?.base || 0,
      credito_cofins_despesas_aliquota: (memoria.creditoCOFINSDespesas?.aliquota || 0) / 100,
      credito_cofins_despesas_valor: memoria.creditoCOFINSDespesas?.valor || 0,
      total_debitos_pis: memoria.totalDebitosPIS,
      total_creditos_pis: memoria.totalCreditosPIS,
      pis_a_pagar: memoria.pisAPagar,
      total_debitos_cofins: memoria.totalDebitosCOFINS,
      total_creditos_cofins: memoria.totalCreditosCOFINS,
      cofins_a_pagar: memoria.cofinsAPagar,
      total_pis_cofins: memoria.totalPISCOFINS,
    }

    try {
      const { data: existente } = await supabase
        .from('calculos_pis_cofins')
        .select('id')
        .eq('cenario_id', cenarioId)
        .maybeSingle()

      if (existente) {
        const { error: updateError } = await supabase
          .from('calculos_pis_cofins')
          .update(dados)
          .eq('id', existente.id)
        
        if (updateError) {
          console.error('❌ [PIS/COFINS] Erro ao atualizar:', updateError)
          throw updateError
        }
        console.log('✅ [PIS/COFINS] Atualizado')
      } else {
        const { error: insertError } = await supabase
          .from('calculos_pis_cofins')
          .insert(dados)
        
        if (insertError) {
          console.error('❌ [PIS/COFINS] Erro ao inserir:', insertError)
          throw insertError
        }
        console.log('✅ [PIS/COFINS] Inserido')
      }
    } catch (error) {
      console.error('❌ [PIS/COFINS] Erro geral:', error)
      throw error
    }
  }

  static async salvarMemoriaIRPJCSLL(cenarioId: string, memoria: MemoriaIRPJCSLL): Promise<void> {
    console.log('💾 [IRPJ/CSLL] Salvando para cenário:', cenarioId)
    
    const supabase = createClient()
    
    const dados = {
      cenario_id: cenarioId,
      receita_bruta: memoria.receitaBruta,
      cmv: memoria.cmv,
      despesas_operacionais: memoria.despesasOperacionais,
      lucro_antes_ircsll: memoria.lucroAntesIRCSLL,
      adicoes: memoria.adicoes,
      exclusoes: memoria.exclusoes,
      lucro_real: memoria.lucroReal,
      limite_anual: memoria.limiteAdicional,
      irpj_base_base: memoria.irpjBase.base,
      irpj_base_aliquota: memoria.irpjBase.aliquota / 100, // Converter % para decimal
      irpj_base_valor: memoria.irpjBase.valor,
      irpj_adicional_base: memoria.irpjAdicional.base,
      irpj_adicional_aliquota: memoria.irpjAdicional.aliquota / 100,
      irpj_adicional_valor: memoria.irpjAdicional.valor,
      total_irpj: memoria.totalIRPJ,
      csll_base: memoria.csll.base,
      csll_aliquota: memoria.csll.aliquota / 100,
      csll_valor: memoria.csll.valor,
      total_irpj_csll: memoria.totalIRPJ + memoria.csll.valor,
    }

    try {
      const { data: existente } = await supabase
        .from('calculos_irpj_csll')
        .select('id')
        .eq('cenario_id', cenarioId)
        .maybeSingle()

      if (existente) {
        const { error: updateError } = await supabase
          .from('calculos_irpj_csll')
          .update(dados)
          .eq('id', existente.id)
        
        if (updateError) {
          console.error('❌ [IRPJ/CSLL] Erro ao atualizar:', updateError)
          throw updateError
        }
        console.log('✅ [IRPJ/CSLL] Atualizado')
      } else {
        const { error: insertError } = await supabase
          .from('calculos_irpj_csll')
          .insert(dados)
        
        if (insertError) {
          console.error('❌ [IRPJ/CSLL] Erro ao inserir:', insertError)
          throw insertError
        }
        console.log('✅ [IRPJ/CSLL] Inserido')
      }
    } catch (error) {
      console.error('❌ [IRPJ/CSLL] Erro geral:', error)
      throw error
    }
  }

  static async salvarTodasMemorias(
    cenarioId: string,
    memoriaICMS: MemoriaICMS,
    memoriaPISCOFINS: MemoriaPISCOFINS,
    memoriaIRPJCSLL: MemoriaIRPJCSLL
  ): Promise<void> {
    console.log('💾 [MEMÓRIAS] Salvando todas para cenário:', cenarioId)
    
    try {
      await this.salvarMemoriaICMS(cenarioId, memoriaICMS)
      await this.salvarMemoriaPISCOFINS(cenarioId, memoriaPISCOFINS)
      await this.salvarMemoriaIRPJCSLL(cenarioId, memoriaIRPJCSLL)
      console.log('✅ [MEMÓRIAS] Todas salvas com sucesso!')
    } catch (error) {
      console.error('❌ [MEMÓRIAS] Erro ao salvar:', error)
      throw error
    }
  }
}
