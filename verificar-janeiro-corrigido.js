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

async function verificarJaneiroCorrigido() {
  console.log('🔍 Verificando cenário de Janeiro corrigido...\n')
  
  const cenarioId = 'b9c02d8c-662c-41de-8d06-534dcd7e0d89'
  
  const { data: cenario, error } = await supabase
    .from('cenarios')
    .select('*')
    .eq('id', cenarioId)
    .single()
  
  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }
  
  console.log('📋 CENÁRIO: Janeiro')
  console.log('─'.repeat(80))
  
  const resultados = cenario.resultados
  const config = cenario.configuracao
  
  if (!resultados) {
    console.log('❌ SEM RESULTADOS!')
    return
  }
  
  console.log('\n💰 IMPOSTOS A PAGAR (campo resultados):')
  console.log(`   • ICMS........: R$ ${(resultados.icmsAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • PIS.........: R$ ${(resultados.pisAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • COFINS......: R$ ${(resultados.cofinsAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • IRPJ........: R$ ${(resultados.irpjAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • CSLL........: R$ ${(resultados.csllAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • ISS.........: R$ ${(resultados.issAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   ─────────────────────────────────────`)
  console.log(`   • TOTAL.......: R$ ${(resultados.totalImpostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  
  console.log('\n📊 TOTALIZADORES:')
  console.log(`   • Federais....: R$ ${(resultados.totalImpostosFederais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • Estaduais...: R$ ${(resultados.totalImpostosEstaduais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • Municipais..: R$ ${(resultados.totalImpostosMunicipais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  
  console.log('\n💵 RECEITAS E LUCROS:')
  console.log(`   • Receita Bruta: R$ ${(config.receitaBruta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • CMV Total....: R$ ${(config.cmvTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • Lucro Líquido: R$ ${(resultados.lucroLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   • Carga Trib...: ${(resultados.cargaTributaria || 0).toFixed(2)}%`)
  
  console.log('\n✅ VALORES ESPERADOS PARA O GRÁFICO:')
  console.log(`   🔵 Lucro Real: R$ ${(resultados.totalImpostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`   (Soma de TODOS os impostos)`)
  
  console.log('\n' + '='.repeat(80))
  console.log('✨ Janeiro corrigido! Agora o gráfico deve mostrar R$ 597.514,00')
}

verificarJaneiroCorrigido().catch(console.error)
