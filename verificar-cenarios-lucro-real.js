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

async function verificarCenariosLucroReal() {
  console.log('🔍 Verificando cenários de Lucro Real...\n')
  
  // Buscar empresa RB
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nome')
    .ilike('nome', '%RB%')
    .single()

  console.log(`✅ Empresa: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}\n`)

  // Buscar cenários
  const { data: cenarios, error } = await supabase
    .from('cenarios')
    .select('id, nome, mes, ano, tipo_periodo, resultados')
    .eq('empresa_id', empresa.id)
    .eq('ano', 2025)
    .order('mes')

  if (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }

  console.log(`📊 Total de cenários: ${cenarios.length}`)
  console.log('═'.repeat(100))

  cenarios.forEach((c, idx) => {
    const temResultados = c.resultados && Object.keys(c.resultados).length > 0
    
    console.log(`\n${idx + 1}. ${c.nome} (Mês ${c.mes}/${c.ano})`)
    console.log(`   ID: ${c.id}`)
    console.log(`   Tipo: ${c.tipo_periodo}`)
    console.log(`   Tem resultados? ${temResultados ? '✅ SIM' : '❌ NÃO'}`)
    
    if (temResultados) {
      const r = c.resultados
      const total = (r.icmsAPagar || 0) + (r.pisAPagar || 0) + (r.cofinsAPagar || 0) + 
                     (r.irpjAPagar || 0) + (r.csllAPagar || 0) + (r.issAPagar || 0)
      
      console.log(`   Total Impostos: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }
  })

  console.log('\n' + '═'.repeat(100))
  
  // Resumo
  const comResultados = cenarios.filter(c => c.resultados && Object.keys(c.resultados).length > 0)
  console.log(`\n📋 Resumo:`)
  console.log(`   Total de cenários: ${cenarios.length}`)
  console.log(`   Com resultados: ${comResultados.length} ✅`)
  console.log(`   Sem resultados: ${cenarios.length - comResultados.length} ❌`)
}

verificarCenariosLucroReal()
