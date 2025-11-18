// Script para aplicar correção da função buscar_comparativo_publico
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function aplicarCorrecao() {
  console.log('🔧 Aplicando correção da função buscar_comparativo_publico...\n')

  // Ler o arquivo SQL
  const sql = fs.readFileSync('supabase/migrations/fix-buscar-comparativo-publico.sql', 'utf8')
  
  console.log('📝 SQL a ser executado:')
  console.log('─'.repeat(80))
  console.log(sql)
  console.log('─'.repeat(80))
  console.log()

  // NOTA: Supabase JS client não suporta execução direta de DDL
  // Este SQL deve ser executado via Supabase Dashboard → SQL Editor
  
  console.log('⚠️  ATENÇÃO: Este SQL deve ser executado manualmente!')
  console.log()
  console.log('📋 Instruções:')
  console.log('1. Acesse: https://supabase.com/dashboard/project/_/sql')
  console.log('2. Cole o SQL acima no editor')
  console.log('3. Clique em "Run"')
  console.log()
  console.log('Alternativamente, se você tiver o Supabase CLI instalado:')
  console.log('$ supabase db push')
  console.log()

  // Tentar verificar se a função atual funciona
  console.log('🧪 Testando função atual...')
  const { data, error } = await supabase.rpc('buscar_comparativo_publico', {
    p_token: 'token_teste_nao_existe'
  })

  if (error) {
    console.log('❌ Erro atual:', error.message)
    console.log('   Código:', error.code)
    
    if (error.message.includes('structure of query does not match')) {
      console.log()
      console.log('✅ Confirmado: função precisa ser corrigida!')
      console.log('   Execute o SQL acima no Supabase Dashboard')
    }
  } else {
    console.log('✅ Função responde sem erro de estrutura')
    console.log('   Resultado:', data)
  }
}

aplicarCorrecao().catch(console.error)
