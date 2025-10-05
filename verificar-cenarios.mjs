// Verificar dados completos dos cenários da empresa EMA MATERIAL
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxrtplvkvulwhengeune.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cnRwbHZrdnVsd2hlbmdldW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjY2NzEsImV4cCI6MjA3NTEwMjY3MX0.1Ekwv-xKO8DXwDXzIhWBBDd3wMOeNbsNKqiVoGhwrJI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarCenarios() {
  try {
    console.log('🔍 Verificando cenários da empresa EMA MATERIAL...')
    
    const empresaId = 'd8b61e2a-b02b-46d9-8af5-835720a622ae'
    
    const { data: cenarios, error } = await supabase
      .from('cenarios')
      .select('*')
      .eq('empresa_id', empresaId)
    
    if (error) {
      console.error('❌ Erro ao buscar cenários:', error)
      return
    }
    
    console.log(`✅ Encontrados ${cenarios?.length || 0} cenários:`)
    
    cenarios?.forEach((cenario, index) => {
      console.log(`\n📄 CENÁRIO ${index + 1}:`)
      console.log(`  - ID: ${cenario.id}`)
      console.log(`  - Nome: ${cenario.nome}`)
      console.log(`  - Status: ${cenario.status}`)
      console.log(`  - Ano: ${cenario.ano}`)
      console.log(`  - Configuração:`, typeof cenario.configuracao, cenario.configuracao)
      
      // Se tem configuração, vamos ver os dados principais
      if (cenario.configuracao) {
        const config = typeof cenario.configuracao === 'string' 
          ? JSON.parse(cenario.configuracao) 
          : cenario.configuracao
        
        console.log(`  - Receita Bruta: ${config.receitaBruta || 'NÃO DEFINIDO'}`)
        console.log(`  - CMV: ${config.cmvTotal || 'NÃO DEFINIDO'}`)
        console.log(`  - ICMS: ${config.icmsInterno || 'NÃO DEFINIDO'}%`)
        console.log(`  - PIS: ${config.pisAliq || 'NÃO DEFINIDO'}%`)
        console.log(`  - COFINS: ${config.cofinsAliq || 'NÃO DEFINIDO'}%`)
      } else {
        console.log(`  - ⚠️ SEM CONFIGURAÇÃO DEFINIDA`)
      }
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificarCenarios()