require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function buscarEmpresaRB() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔍 Buscando empresa RB...')

  // Buscar todas as empresas para ver o que temos
  const { data: empresas, error } = await supabase
    .from('empresas')
    .select('id, nome')
    .order('nome')

  if (error) {
    console.error('❌ Erro:', error)
    return
  }

  console.log('\n📋 EMPRESAS CADASTRADAS:')
  empresas.forEach(emp => {
    console.log(`   ${emp.nome} (ID: ${emp.id})`)
  })

  // Buscar especificamente RB
  const rbEmpresa = empresas.find(e => 
    e.nome.toLowerCase().includes('rb') || 
    e.nome.toLowerCase().includes('acessorios')
  )

  if (rbEmpresa) {
    console.log(`\n✅ EMPRESA RB ENCONTRADA:`)
    console.log(`   Nome: ${rbEmpresa.nome}`)
    console.log(`   ID: ${rbEmpresa.id}`)
    
    // Buscar cenários desta empresa
    const { data: cenarios, error: cenError } = await supabase
      .from('cenarios')
      .select('id, nome, mes, ano, configuracao')
      .eq('empresa_id', rbEmpresa.id)
      .order('mes')

    if (cenError) {
      console.error('❌ Erro ao buscar cenários:', cenError)
    } else {
      console.log(`\n📊 CENÁRIOS DA EMPRESA (${cenarios.length} total):`)
      cenarios.forEach(c => {
        const receita = c.configuracao?.receitaBruta || 0
        const cmv = c.configuracao?.cmvTotal || 0
        console.log(`   ${c.nome} (Mês: ${c.mes}) - Receita: R$ ${receita.toLocaleString('pt-BR')} - CMV: R$ ${cmv.toLocaleString('pt-BR')}`)
      })
    }
  } else {
    console.log('\n❌ Empresa RB não encontrada')
  }
}

buscarEmpresaRB()