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

async function deletarComparativoAntigo() {
  console.log('🗑️  Deletando comparativo antigo com valores incorretos...\n')
  
  const comparativoId = '09fafab4-398c-4520-9e98-53e718c82047'
  
  const { error } = await supabase
    .from('comparativos_analise')
    .delete()
    .eq('id', comparativoId)
  
  if (error) {
    console.error('❌ Erro ao deletar:', error.message)
    return
  }
  
  console.log('✅ Comparativo deletado com sucesso!')
  console.log('\n📋 PRÓXIMOS PASSOS:')
  console.log('   1. Recarregue a página no navegador')
  console.log('   2. Crie um NOVO comparativo')
  console.log('   3. Os valores corretos dos cenários serão usados!')
  console.log('\n💡 Ou, se preferir, o sistema vai buscar direto dos cenários em tempo real.')
}

deletarComparativoAntigo().catch(console.error)
