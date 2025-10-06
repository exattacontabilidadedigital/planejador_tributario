#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executarMigracao() {
  try {
    console.log('🚀 Iniciando migração da tabela dados_comparativos_mensais...')

    // Ler o arquivo SQL
    const sqlPath = join(__dirname, 'supabase', 'migrations', 'create_dados_comparativos_mensais.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')

    // Executar a migração
    const { error } = await supabase.rpc('exec_sql', { sql_string: sqlContent })

    if (error) {
      console.error('❌ Erro ao executar migração:', error)
      process.exit(1)
    }

    console.log('✅ Migração executada com sucesso!')

    // Verificar se a tabela foi criada
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'dados_comparativos_mensais')

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError)
      process.exit(1)
    }

    if (tables && tables.length > 0) {
      console.log('✅ Tabela dados_comparativos_mensais criada com sucesso!')
      
      // Verificar estrutura da tabela
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'dados_comparativos_mensais')
        .order('ordinal_position')

      if (!columnsError && columns) {
        console.log('\n📋 Estrutura da tabela:')
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`)
        })
      }
    } else {
      console.log('⚠️  Tabela não encontrada após migração')
    }

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    process.exit(1)
  }
}

// Executar migração
executarMigracao()