// Script para debugar dados do gráfico de evolução
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rqsuwjgtwdclokigdgpq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxc3V3amd0d2RjbG9raWdkZ3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4Nzg4MjIsImV4cCI6MjA0ODQ1NDgyMn0.hRJDfD_rFBVFtyxLXLKqONUSmyiI6_fz6i7qnMsm7ps'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugGraficos() {
  try {
    console.log('🔍 Verificando cenários no Supabase...')
    
    // Buscar todas as empresas
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('*')
    
    if (empresasError) {
      console.error('❌ Erro ao buscar empresas:', empresasError)
      return
    }
    
    console.log(`📊 Encontradas ${empresas.length} empresas:`)
    empresas.forEach(empresa => {
      console.log(`  - ${empresa.nome} (ID: ${empresa.id})`)
    })
    
    // Buscar todos os cenários
    const { data: cenarios, error: cenariosError } = await supabase
      .from('cenarios')
      .select('*')
    
    if (cenariosError) {
      console.error('❌ Erro ao buscar cenários:', cenariosError)
      return
    }
    
    console.log(`\n📈 Encontrados ${cenarios.length} cenários:`)
    cenarios.forEach(cenario => {
      console.log(`  - ${cenario.nome} (Empresa: ${cenario.empresa_id})`)
      console.log(`    Mês: ${cenario.mes || 'N/A'}, Trimestre: ${cenario.trimestre || 'N/A'}`)
      console.log(`    Configuração presente: ${!!cenario.configuracao}`)
      if (cenario.configuracao && cenario.configuracao.receitaBruta) {
        console.log(`    Receita: R$ ${cenario.configuracao.receitaBruta.toLocaleString('pt-BR')}`)
      }
      console.log('')
    })
    
    // Verificar especificamente a empresa RB ACESSÓRIOS
    const rbEmpresa = empresas.find(e => e.nome.includes('RB ACESSORIOS'))
    if (rbEmpresa) {
      console.log(`\n🎯 Dados específicos da RB ACESSÓRIOS (ID: ${rbEmpresa.id}):`)
      
      const cenariosDaEmpresa = cenarios.filter(c => c.empresa_id === rbEmpresa.id)
      console.log(`  - Total de cenários: ${cenariosDaEmpresa.length}`)
      
      const cenariosComMes = cenariosDaEmpresa.filter(c => c.mes)
      console.log(`  - Cenários com mês definido: ${cenariosComMes.length}`)
      
      cenariosComMes.forEach(cenario => {
        console.log(`    • ${cenario.nome} - Mês ${cenario.mes}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

debugGraficos()