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

async function verificarEstruturTabela() {
  console.log('🔍 Verificando estrutura da tabela dados_comparativos_mensais...\n')
  
  // Buscar um registro qualquer para ver as colunas
  const { data, error } = await supabase
    .from('dados_comparativos_mensais')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }
  
  if (!data || data.length === 0) {
    console.log('⚠️  Nenhum registro encontrado!')
    return
  }
  
  const registro = data[0]
  
  console.log('📋 Colunas disponíveis:')
  console.log('═'.repeat(80))
  
  Object.keys(registro).forEach((coluna, index) => {
    const valor = registro[coluna]
    const tipo = typeof valor
    const valorExibir = tipo === 'object' ? JSON.stringify(valor).substring(0, 100) + '...' : valor
    
    console.log(`${index + 1}. ${coluna}`)
    console.log(`   Tipo: ${tipo}`)
    console.log(`   Valor: ${valorExibir}`)
    console.log()
  })
  
  console.log('═'.repeat(80))
  console.log('\n✅ Use essas colunas no script de atualização!')
}

verificarEstruturTabela().catch(console.error)
