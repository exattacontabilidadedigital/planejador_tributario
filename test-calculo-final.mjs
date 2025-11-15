// Teste forçado de carregamento de cenários
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!')
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetchAndCalc() {
  try {
    console.log('🔄 Testando busca e cálculo de cenários...')
    
    const empresaId = 'd8b61e2a-b02b-46d9-8af5-835720a622ae'
    
    // Buscar cenários
    const { data: cenarios, error } = await supabase
      .from('cenarios')
      .select('*')
      .eq('empresa_id', empresaId)
    
    if (error) throw error
    
    console.log(`✅ Cenários encontrados: ${cenarios?.length || 0}`)
    
    // Simular processamento dos dados como no hook useRelatorios
    const cenariosAprovados = cenarios?.filter(c => c.status === 'aprovado') || []
    console.log(`📊 Cenários aprovados: ${cenariosAprovados.length}`)
    
    // Calcular totais
    let receitaTotal = 0
    let impostosTotal = 0
    let lucroTotal = 0
    
    cenariosAprovados.forEach(cenario => {
      const config = cenario.configuracao || {}
      const receita = config.receitaBruta || 0
      
      // Calcular impostos simplificado
      const icms = receita * ((config.icmsInterno || 0) / 100)
      const pis = receita * ((config.pisAliq || 0) / 100)
      const cofins = receita * ((config.cofinsAliq || 0) / 100)
      const impostos = icms + pis + cofins
      
      const lucro = receita - impostos - (config.cmvTotal || 0)
      
      receitaTotal += receita
      impostosTotal += impostos
      lucroTotal += lucro
      
      console.log(`  📄 ${cenario.nome}: Receita R$ ${receita.toLocaleString('pt-BR')}, Impostos R$ ${impostos.toLocaleString('pt-BR')}`)
    })
    
    const cargaTributaria = receitaTotal > 0 ? (impostosTotal / receitaTotal) * 100 : 0
    const margemLiquida = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0
    
    console.log('\n🎯 RESULTADO FINAL:')
    console.log(`💰 Receita Total: R$ ${receitaTotal.toLocaleString('pt-BR')}`)
    console.log(`💼 Impostos Total: R$ ${impostosTotal.toLocaleString('pt-BR')}`)
    console.log(`📊 Carga Tributária: ${cargaTributaria.toFixed(2)}%`)
    console.log(`📈 Margem Líquida: ${margemLiquida.toFixed(2)}%`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testFetchAndCalc()