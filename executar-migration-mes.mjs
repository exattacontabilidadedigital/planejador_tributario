import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SERVICE_ROLE não encontradas')
  console.log('⚠️ Esta migration requer SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executarMigration() {
  console.log('🚀 Executando migration: fix-mes-column-type.sql\n')

  try {
    // Ler arquivo SQL
    const sql = readFileSync('migrations/fix-mes-column-type.sql', 'utf8')
    
    console.log('📄 SQL a ser executado:')
    console.log('─'.repeat(80))
    console.log(sql)
    console.log('─'.repeat(80))
    console.log()

    // Confirmar execução
    console.log('⚠️  ATENÇÃO: Esta migration vai alterar o schema da tabela cenarios')
    console.log('⚠️  Certifique-se de ter backup dos dados antes de continuar')
    console.log()
    
    // Listar cenários existentes antes da migration
    const { data: cenariosAntes, error: erroListar } = await supabase
      .from('cenarios')
      .select('id, nome, mes')
      .not('mes', 'is', null)
      .limit(10)

    if (erroListar) {
      console.error('❌ Erro ao listar cenários:', erroListar)
    } else {
      console.log('📊 Cenários existentes (amostra):')
      console.table(cenariosAntes?.map(c => ({
        id: c.id.substring(0, 8) + '...',
        nome: c.nome.substring(0, 30),
        mes: c.mes,
        tipo: typeof c.mes
      })))
      console.log()
    }

    // Executar migration usando rpc (raw SQL)
    console.log('🔧 Executando migration...')
    
    // Nota: Supabase não permite executar ALTER TABLE via API
    // A migration deve ser executada manualmente no Dashboard do Supabase
    console.log()
    console.log('📋 INSTRUÇÕES PARA EXECUTAR A MIGRATION:')
    console.log()
    console.log('1. Acesse o Supabase Dashboard:')
    console.log(`   ${supabaseUrl.replace('https://', 'https://app.')}/project/sql`)
    console.log()
    console.log('2. Copie o conteúdo do arquivo:')
    console.log('   migrations/fix-mes-column-type.sql')
    console.log()
    console.log('3. Cole no SQL Editor e execute')
    console.log()
    console.log('4. Verifique os resultados da query de verificação')
    console.log()
    console.log('💡 Alternativamente, use o Supabase CLI:')
    console.log('   supabase db push migrations/fix-mes-column-type.sql')
    console.log()

  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

executarMigration()
