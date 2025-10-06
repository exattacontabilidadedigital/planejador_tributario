import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * IMPORTANTE: Este script NÃO recalcula nada!
 * Ele apenas corrige os valores de RESULTADOS para refletir os valores
 * que JÁ FORAM CALCULADOS pelo sistema web e estão nos cenários.
 */
async function corrigirResultadosComValoresReais() {
  console.log('🔧 Corrigindo resultados com valores REAIS dos cenários...\n')
  
  // Buscar empresa EMA MATERIAL
  const { data: empresas } = await supabase
    .from('empresas')
    .select('*')
    .ilike('nome', '%EMA MATERIAL%')
  
  if (!empresas || empresas.length === 0) {
    console.error('❌ Empresa não encontrada!')
    return
  }
  
  const empresa = empresas[0]
  console.log(`✅ Empresa: ${empresa.nome}\n`)
  
  // Valores REAIS informados pelo usuário
  const valoresReaisPorCenario = {
    'b9c02d8c-662c-41de-8d06-534dcd7e0d89': { // Janeiro
      nome: 'Janeiro',
      icmsAPagar: 279800.00,
      pisAPagar: 17721.00,
      cofinsAPagar: 81624.00,
      irpjAPagar: 154212.50,
      csllAPagar: 64156.50,
      issAPagar: 0,
      cppAPagar: 0,
      inssAPagar: 0
    }
    // Adicionar outros meses conforme necessário
  }
  
  let sucessos = 0
  let erros = 0
  
  for (const [cenarioId, valores] of Object.entries(valoresReaisPorCenario)) {
    try {
      console.log(`${'─'.repeat(80)}`)
      console.log(`🔧 Corrigindo: ${valores.nome}`)
      console.log(`   ID: ${cenarioId}`)
      
      // Buscar cenário atual
      const { data: cenario } = await supabase
        .from('cenarios')
        .select('*')
        .eq('id', cenarioId)
        .single()
      
      if (!cenario) {
        console.log(`   ⚠️  Cenário não encontrado\n`)
        continue
      }
      
      const config = cenario.configuracao || {}
      const receitaBruta = config.receitaBruta || 0
      
      // Calcular totais
      const totalImpostos = 
        valores.icmsAPagar +
        valores.pisAPagar +
        valores.cofinsAPagar +
        valores.irpjAPagar +
        valores.csllAPagar +
        valores.issAPagar
      
      const lucroLiquido = receitaBruta - (config.cmvTotal || 0) - totalImpostos
      const cargaTributaria = receitaBruta > 0 ? (totalImpostos / receitaBruta) * 100 : 0
      
      // Montar objeto de resultados
      const resultados = {
        // Impostos a pagar (valores REAIS)
        icmsAPagar: valores.icmsAPagar,
        pisAPagar: valores.pisAPagar,
        cofinsAPagar: valores.cofinsAPagar,
        irpjAPagar: valores.irpjAPagar,
        csllAPagar: valores.csllAPagar,
        issAPagar: valores.issAPagar,
        cppAPagar: valores.cppAPagar || 0,
        inssAPagar: valores.inssAPagar || 0,
        
        // Bases de cálculo (manter as existentes ou calcular)
        baseCalculoICMS: receitaBruta * 0.8, // 80% sem ST
        baseCalculoPIS: receitaBruta,
        baseCalculoCOFINS: receitaBruta,
        baseCalculoIRPJ: lucroLiquido,
        baseCalculoCSLL: lucroLiquido,
        
        // Alíquotas
        aliquotaICMS: config.icmsInterno || 0,
        aliquotaPIS: config.pisAliq || 0,
        aliquotaCOFINS: config.cofinsAliq || 0,
        aliquotaIRPJ: config.irpjBase || 15,
        aliquotaCSLL: config.csllAliq || 9,
        aliquotaISS: config.issAliq || 0,
        
        // Totalizadores
        totalImpostosFederais: valores.pisAPagar + valores.cofinsAPagar + valores.irpjAPagar + valores.csllAPagar,
        totalImpostosMunicipais: valores.issAPagar,
        totalImpostosEstaduais: valores.icmsAPagar,
        totalImpostos: totalImpostos,
        
        // Resultados finais
        receitaBrutaTotal: receitaBruta,
        lucroContabil: lucroLiquido,
        lucroReal: lucroLiquido,
        lucroLiquido: lucroLiquido,
        margemLucro: receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0,
        cargaTributaria: cargaTributaria
      }
      
      console.log(`   💰 Valores REAIS:`)
      console.log(`      • ICMS: R$ ${valores.icmsAPagar.toFixed(2)}`)
      console.log(`      • PIS: R$ ${valores.pisAPagar.toFixed(2)}`)
      console.log(`      • COFINS: R$ ${valores.cofinsAPagar.toFixed(2)}`)
      console.log(`      • IRPJ: R$ ${valores.irpjAPagar.toFixed(2)}`)
      console.log(`      • CSLL: R$ ${valores.csllAPagar.toFixed(2)}`)
      console.log(`      • TOTAL: R$ ${totalImpostos.toFixed(2)}`)
      console.log(`      • Lucro Líquido: R$ ${lucroLiquido.toFixed(2)}`)
      console.log(`      • Carga Tributária: ${cargaTributaria.toFixed(2)}%`)
      
      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('cenarios')
        .update({
          resultados: resultados
        })
        .eq('id', cenarioId)
      
      if (updateError) {
        console.error(`   ❌ Erro ao atualizar: ${updateError.message}\n`)
        erros++
      } else {
        console.log(`   ✅ Atualizado com valores REAIS!\n`)
        sucessos++
      }
      
    } catch (err) {
      console.error(`   ❌ Erro: ${err.message}\n`)
      erros++
    }
  }
  
  console.log(`${'='.repeat(80)}`)
  console.log(`\n✨ CORREÇÃO CONCLUÍDA!`)
  console.log(`   ✅ Sucessos: ${sucessos}`)
  console.log(`   ❌ Erros: ${erros}`)
  console.log(`\n⚠️  IMPORTANTE: Adicione os valores reais dos outros meses (Fevereiro, Março) no script!`)
}

corrigirResultadosComValoresReais().catch(console.error)
