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

async function compararDados() {
  console.log('🔍 Buscando cenário de Janeiro...\n')
  
  const { data: cenario, error } = await supabase
    .from('cenarios')
    .select('*')
    .eq('id', 'b9c02d8c-662c-41de-8d06-534dcd7e0d89')
    .single()
  
  if (error || !cenario) {
    console.error('❌ Erro:', error)
    return
  }
  
  console.log('📋 CENÁRIO JANEIRO - ESTRUTURA COMPLETA:\n')
  console.log('='.repeat(80))
  
  // CONFIGURAÇÃO
  console.log('\n⚙️  CONFIGURAÇÃO (dados de entrada):')
  console.log('─'.repeat(80))
  const config = cenario.configuracao || {}
  
  console.log('📊 Receitas e Vendas:')
  console.log(`   • Receita Bruta: R$ ${(config.receitaBruta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • Vendas Internas: ${config.vendasInternas || 0}%`)
  console.log(`   • Percentual ST: ${config.percentualST || 0}%`)
  console.log(`   • Percentual Monofásico: ${config.percentualMonofasico || 0}%`)
  
  console.log('\n💰 Compras e Custos:')
  console.log(`   • Compras Internas: R$ ${(config.comprasInternas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • Compras Interestaduais: R$ ${(config.comprasInterestaduais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • CMV Total: R$ ${(config.cmvTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  
  console.log('\n📐 Alíquotas:')
  console.log(`   • ICMS Interno: ${config.icmsInterno || 0}%`)
  console.log(`   • ICMS Sul: ${config.icmsSul || 0}%`)
  console.log(`   • PIS: ${config.pisAliq || 0}%`)
  console.log(`   • COFINS: ${config.cofinsAliq || 0}%`)
  console.log(`   • IRPJ Base: ${config.irpjBase || 0}%`)
  console.log(`   • IRPJ Adicional: ${config.irpjAdicional || 0}%`)
  console.log(`   • CSLL: ${config.csllAliq || 0}%`)
  console.log(`   • ISS: ${config.issAliq || 0}%`)
  
  console.log('\n💸 Despesas:')
  console.log(`   • Salários PF: R$ ${(config.salariosPF || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • Energia Elétrica: R$ ${(config.energiaEletrica || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • Aluguéis: R$ ${(config.alugueis || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • Outras Despesas: R$ ${(config.outrasDespesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  
  // RESULTADOS
  console.log('\n\n💰 RESULTADOS (impostos calculados e salvos):')
  console.log('─'.repeat(80))
  const resultados = cenario.resultados || {}
  
  console.log('📊 Impostos a Pagar:')
  console.log(`   • ICMS: R$ ${(resultados.icmsAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • PIS: R$ ${(resultados.pisAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • COFINS: R$ ${(resultados.cofinsAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • IRPJ: R$ ${(resultados.irpjAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • CSLL: R$ ${(resultados.csllAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • ISS: R$ ${(resultados.issAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • TOTAL: R$ ${(resultados.totalImpostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  
  console.log('\n📈 Outros Valores:')
  console.log(`   • Receita Bruta Total: R$ ${(resultados.receitaBrutaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • Lucro Líquido: R$ ${(resultados.lucroLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   • Carga Tributária: ${(resultados.cargaTributaria || 0).toFixed(2)}%`)
  
  // COMPARAÇÃO COM VALORES REAIS
  console.log('\n\n🔍 COMPARAÇÃO COM VALORES REAIS (que você informou):')
  console.log('─'.repeat(80))
  
  const valoresReais = {
    icms: 279800.00,
    pis: 17721.00,
    cofins: 81624.00,
    irpj: 154212.50,
    csll: 64156.50 // Valor estimado
  }
  
  const valoresCalculados = {
    icms: resultados.icmsAPagar || 0,
    pis: resultados.pisAPagar || 0,
    cofins: resultados.cofinsAPagar || 0,
    irpj: resultados.irpjAPagar || 0,
    csll: resultados.csllAPagar || 0
  }
  
  console.log('\n| Imposto | Valor Real      | Valor Calculado | Diferença       | Status |')
  console.log('|---------|-----------------|-----------------|-----------------|--------|')
  
  Object.keys(valoresReais).forEach(key => {
    const real = valoresReais[key]
    const calculado = valoresCalculados[key]
    const diferenca = calculado - real
    const percentual = real > 0 ? ((diferenca / real) * 100).toFixed(1) : 0
    const status = Math.abs(diferenca) < 1 ? '✅' : Math.abs(diferenca) < 1000 ? '⚠️' : '❌'
    
    console.log(`| ${key.toUpperCase().padEnd(7)} | R$ ${real.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).padEnd(12)} | R$ ${calculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).padEnd(12)} | R$ ${diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' }).padEnd(12)} | ${status} ${percentual}%`)
  })
  
  const totalReal = Object.values(valoresReais).reduce((a, b) => a + b, 0)
  const totalCalculado = Object.values(valoresCalculados).reduce((a, b) => a + b, 0)
  const diferencaTotal = totalCalculado - totalReal
  
  console.log('|---------|-----------------|-----------------|-----------------|--------|')
  console.log(`| TOTAL   | R$ ${totalReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).padEnd(12)} | R$ ${totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).padEnd(12)} | R$ ${diferencaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' }).padEnd(12)} |`)
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Análise concluída!')
}

compararDados().catch(console.error)
