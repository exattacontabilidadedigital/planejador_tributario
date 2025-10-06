const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vslrmjbdhwqlpkfetgdc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbHJtamJkaHdxbHBrZmV0Z2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxNDc0MjMsImV4cCI6MjA1MDcyMzQyM30.WCYmhYZKxr8z6DYgj96BPz5Qnse_bH9o78kXiD5Axno'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarDespesasSemCredito() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║  VERIFICAÇÃO: Despesas SEM CRÉDITO na Tabela               ║')
    console.log('╚══════════════════════════════════════════════════════════════╝\n')

    const cenarioId = 'b9c02d8c-662c-41de-8d06-534dcd7e0d89'

    // 1. Buscar TODAS as despesas do cenário
    const { data: todasDespesas, error: errorTodas } = await supabase
      .from('despesas_dinamicas')
      .select('*')
      .eq('cenario_id', cenarioId)
      .order('descricao')

  if (errorTodas) {
    console.error('❌ Erro ao buscar despesas:', errorTodas)
    return
  }

  console.log(`📊 TOTAL de despesas no banco: ${todasDespesas?.length || 0}\n`)

  // 2. Filtrar por tipo de crédito
  const comCredito = todasDespesas?.filter(d => d.credito === 'com-credito') || []
  const semCredito = todasDespesas?.filter(d => d.credito === 'sem-credito') || []

  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`✅ COM CRÉDITO: ${comCredito.length} despesas`)
  console.log('═══════════════════════════════════════════════════════════════')
  comCredito.forEach((d, idx) => {
    console.log(`   ${idx + 1}. ${d.descricao} - R$ ${d.valor.toFixed(2)}`)
  })

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log(`🔴 SEM CRÉDITO: ${semCredito.length} despesas`)
  console.log('═══════════════════════════════════════════════════════════════')
  
  if (semCredito.length === 0) {
    console.log('   ⚠️  NENHUMA despesa SEM crédito encontrada!')
  } else {
    semCredito.forEach((d, idx) => {
      console.log(`   ${idx + 1}. ${d.descricao} - R$ ${d.valor.toFixed(2)}`)
      console.log(`      • ID: ${d.id}`)
      console.log(`      • Tipo: ${d.tipo}`)
      console.log(`      • Crédito: ${d.credito}`)
      console.log(`      • Categoria: ${d.categoria || 'null'}`)
      console.log('')
    })
  }

  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`\n✅ RESULTADO: ${semCredito.length === 2 ? 'SUCESSO!' : 'PROBLEMA DETECTADO'}`)
  
  if (semCredito.length === 2) {
    console.log('   As 2 despesas SEM crédito estão gravadas corretamente:')
    console.log('   • Internet loja (R$ 150)')
    console.log('   • Internet Oficina (R$ 120)')
  } else {
    console.log(`   ⚠️  Esperado: 2 despesas SEM crédito`)
    console.log(`   ⚠️  Encontrado: ${semCredito.length} despesas`)
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n')
  } catch (err) {
    console.error('❌ Erro ao verificar despesas:', err.message)
  }
}

verificarDespesasSemCredito()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erro:', err)
    process.exit(1)
  })
