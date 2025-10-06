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

async function verificarEstruturaCenarios() {
  console.log('🔍 Verificando estrutura da tabela cenarios...\n')
  
  // Buscar empresa RB
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .ilike('nome', '%RB%')
    .single()

  // Buscar um cenário para ver as colunas
  const { data: cenario, error } = await supabase
    .from('cenarios')
    .select('*')
    .eq('empresa_id', empresa.id)
    .limit(1)
    .single()

  if (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }

  console.log('📋 Colunas disponíveis na tabela cenarios:')
  console.log('═'.repeat(80))
  
  Object.keys(cenario).forEach((col, idx) => {
    const valor = cenario[col]
    const tipo = typeof valor
    console.log(`${idx + 1}. ${col}`)
    console.log(`   Tipo: ${tipo}`)
    if (tipo === 'object' && valor !== null) {
      console.log(`   Valor: ${JSON.stringify(valor).substring(0, 100)}...`)
    } else {
      console.log(`   Valor: ${valor}`)
    }
    console.log()
  })

  console.log('═'.repeat(80))
}

verificarEstruturaCenarios()
