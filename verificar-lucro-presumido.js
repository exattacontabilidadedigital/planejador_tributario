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

async function verificarDadosLucroPresumido() {
  console.log('🔍 Verificando dados de Lucro Presumido...\n')
  
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
  console.log(`✅ Empresa: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}\n`)
  
  // Buscar dados de Lucro Presumido
  const { data: dadosLP, error } = await supabase
    .from('dados_comparativos_mensais')
    .select('*')
    .eq('empresa_id', empresa.id)
    .eq('regime', 'lucro_presumido')
    .eq('ano', 2025)
    .order('mes', { ascending: true })
  
  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }
  
  if (!dadosLP || dadosLP.length === 0) {
    console.log('⚠️  Nenhum dado de Lucro Presumido encontrado!')
    console.log('   Você precisa criar dados manuais de Lucro Presumido.')
    return
  }
  
  console.log(`📊 Total de registros de Lucro Presumido: ${dadosLP.length}\n`)
  console.log('═'.repeat(100))
  
  dadosLP.forEach((d, index) => {
    const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    
    console.log(`\n${index + 1}. ${meses[d.mes]} - ${d.ano}`)
    console.log(`   ID: ${d.id}`)
    console.log(`   Última atualização: ${new Date(d.updated_at).toLocaleString('pt-BR')}`)
    console.log(`   ─────────────────────────────────────────────────`)
    console.log(`   💰 Receita: R$ ${(d.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   💸 Total Impostos: R$ ${(d.total_impostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    
    // Mostrar detalhamento se existir
    const impostos = d.impostos_detalhados || {}
    if (Object.keys(impostos).length > 0) {
      console.log(`   📋 Detalhamento:`)
      if (impostos.icms) console.log(`      • ICMS: R$ ${impostos.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      if (impostos.pis) console.log(`      • PIS: R$ ${impostos.pis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      if (impostos.cofins) console.log(`      • COFINS: R$ ${impostos.cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      if (impostos.irpj) console.log(`      • IRPJ: R$ ${impostos.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      if (impostos.csll) console.log(`      • CSLL: R$ ${impostos.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      if (impostos.iss) console.log(`      • ISS: R$ ${impostos.iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }
  })
  
  console.log('\n' + '═'.repeat(100))
  console.log('\n💡 SOLUÇÃO:')
  console.log('   Se editou os dados mas o gráfico não atualiza:')
  console.log('   1️⃣  Verifique se os timestamps de updated_at são recentes')
  console.log('   2️⃣  Delete qualquer comparativo salvo (cache)')
  console.log('   3️⃣  Recarregue a página com Ctrl+Shift+R (hard refresh)')
  console.log('   4️⃣  Se ainda não funcionar, recrie o comparativo')
}

verificarDadosLucroPresumido().catch(console.error)
