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

async function verificarTodosCenarios() {
  console.log('🔍 Verificando TODOS os cenários de Lucro Real...\n')
  
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
  
  // Buscar todos os cenários de 2025
  const { data: cenarios, error } = await supabase
    .from('cenarios')
    .select('*')
    .eq('empresa_id', empresa.id)
    .eq('ano', 2025)
    .order('mes', { ascending: true })
  
  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }
  
  console.log(`📊 Total de cenários encontrados: ${cenarios.length}\n`)
  console.log('═'.repeat(100))
  
  cenarios.forEach((c, index) => {
    const resultados = c.resultados || {}
    const totalImpostos = resultados.totalImpostos || 0
    
    console.log(`\n${index + 1}. ${c.nome.toUpperCase()}`)
    console.log(`   ID: ${c.id}`)
    console.log(`   Mês: ${c.mes || 'N/A'}`)
    console.log(`   Status: ${c.status}`)
    console.log(`   ─────────────────────────────────────────────────`)
    
    if (!resultados || Object.keys(resultados).length === 0) {
      console.log(`   ⚠️  SEM RESULTADOS! (campo vazio)`)
    } else {
      console.log(`   💰 TOTAL IMPOSTOS: R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      console.log(`   📋 Detalhamento:`)
      console.log(`      • ICMS.....: R$ ${(resultados.icmsAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      console.log(`      • PIS......: R$ ${(resultados.pisAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      console.log(`      • COFINS...: R$ ${(resultados.cofinsAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      console.log(`      • IRPJ.....: R$ ${(resultados.irpjAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      console.log(`      • CSLL.....: R$ ${(resultados.csllAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      console.log(`      • ISS......: R$ ${(resultados.issAPagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    }
    
    // Verificar se o valor do gráfico bate
    const valorGrafico = {
      'Janeiro': 614245,
      'Fevereiro': 480295,
      'Março': 757720
    }[c.nome]
    
    if (valorGrafico) {
      const diferenca = Math.abs(totalImpostos - valorGrafico)
      if (diferenca < 1) {
        console.log(`   ✅ VALOR DO GRÁFICO BATE: R$ ${valorGrafico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      } else {
        console.log(`   ⚠️  VALOR DO GRÁFICO: R$ ${valorGrafico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        console.log(`   ⚠️  DIFERENÇA: R$ ${diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      }
    }
  })
  
  console.log('\n' + '═'.repeat(100))
  console.log('\n🔍 ANÁLISE:')
  console.log('   • Se Janeiro mostrar R$ 597.514 no banco mas R$ 614.245 no gráfico = PROBLEMA DE CACHE')
  console.log('   • Se Janeiro mostrar R$ 614.245 no banco = Script de correção não funcionou')
  console.log('   • Se Fevereiro/Março não têm valores corretos = Precisam ser corrigidos')
}

verificarTodosCenarios().catch(console.error)
