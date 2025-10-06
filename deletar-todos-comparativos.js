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

async function deletarTodosComparativos() {
  console.log('🗑️  Deletando TODOS os comparativos salvos...\n')
  
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
  
  const { data: comparativos, error: fetchError } = await supabase
    .from('comparativos_analise')
    .select('id, nome')
    .eq('empresa_id', empresa.id)
  
  if (fetchError) {
    console.error('❌ Erro ao buscar comparativos:', fetchError.message)
    return
  }
  
  if (!comparativos || comparativos.length === 0) {
    console.log('✅ Nenhum comparativo salvo encontrado! (Já está limpo)')
    return
  }
  
  console.log(`📊 Encontrados ${comparativos.length} comparativos:`)
  comparativos.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.nome} (${c.id})`)
  })
  
  console.log('\n🗑️  Deletando...')
  
  const { error: deleteError } = await supabase
    .from('comparativos_analise')
    .delete()
    .eq('empresa_id', empresa.id)
  
  if (deleteError) {
    console.error('❌ Erro ao deletar:', deleteError.message)
    return
  }
  
  console.log('✅ Todos os comparativos deletados com sucesso!')
  console.log('\n📋 PRÓXIMOS PASSOS:')
  console.log('   1. Pressione Ctrl+Shift+R no navegador (hard refresh)')
  console.log('   2. Edite os dados de Lucro Presumido novamente')
  console.log('   3. Crie um novo comparativo')
  console.log('   4. Os valores atualizados serão mostrados!')
}

deletarTodosComparativos().catch(console.error)
