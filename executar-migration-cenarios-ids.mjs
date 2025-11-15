import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeMigration() {
  console.log('🔧 Executando migration: add_cenarios_ids_to_comparativos...')
  
  try {
    // Ler o arquivo SQL
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'add_cenarios_ids_to_comparativos.sql')
    const sql = readFileSync(migrationPath, 'utf-8')
    
    // Executar a migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // Se a função exec_sql não existe, tentar executar diretamente
      console.warn('⚠️ Função exec_sql não encontrada, tentando método alternativo...')
      
      // Verificar se a tabela existe
      const { data: tables, error: tableError } = await supabase
        .from('comparativos')
        .select('id')
        .limit(1)
      
      if (tableError) {
        if (tableError.message.includes('does not exist')) {
          console.error('❌ Tabela comparativos não existe!')
          console.log('📝 Execute primeiro a migration: create_comparativos.sql')
          process.exit(1)
        } else {
          throw tableError
        }
      }
      
      console.log('✅ Tabela comparativos existe')
      
      // Verificar se a coluna já existe
      const { data: columns, error: columnError } = await supabase
        .rpc('get_table_columns', { table_name: 'comparativos' })
      
      if (columnError) {
        console.warn('⚠️ Não foi possível verificar colunas automaticamente')
        console.log('📝 Execute manualmente a migration no Supabase SQL Editor:')
        console.log(sql)
        process.exit(0)
      }
      
      const hasCenariosIds = columns?.some((col) => col.column_name === 'cenarios_ids')
      
      if (hasCenariosIds) {
        console.log('✅ Coluna cenarios_ids já existe!')
      } else {
        console.log('⚠️ Coluna cenarios_ids não encontrada')
        console.log('📝 Execute manualmente a migration no Supabase SQL Editor:')
        console.log(sql)
      }
    } else {
      console.log('✅ Migration executada com sucesso!')
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message)
    console.log('\n📝 Você pode executar manualmente no Supabase SQL Editor:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql/new')
    console.log('2. Cole o conteúdo do arquivo: supabase/migrations/add_cenarios_ids_to_comparativos.sql')
    console.log('3. Execute')
    process.exit(1)
  }
}

executeMigration()
