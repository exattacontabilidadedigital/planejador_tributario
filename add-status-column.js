/**
 * Script para adicionar a coluna status na tabela cenarios
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function addStatusColumn() {
  console.log('🔧 [STATUS] Configurações:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando')
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [STATUS] Configurações de Supabase não encontradas')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔄 [STATUS] Iniciando adição da coluna status...')

  try {
    // 1. Verificar estrutura atual
    console.log('1️⃣ [STATUS] Verificando estrutura atual...')
    const { data: columns } = await supabase
      .from('cenarios')
      .select('*')
      .limit(1)

    if (columns && columns.length > 0) {
      console.log('📋 [STATUS] Colunas atuais:', Object.keys(columns[0]))
    }

    // 2. Adicionar coluna status
    console.log('2️⃣ [STATUS] Adicionando coluna status...')
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'rascunho\';'
    })

    if (addColumnError) {
      console.error('❌ [STATUS] Erro ao adicionar coluna:', addColumnError)
      return
    }

    console.log('✅ [STATUS] Coluna adicionada!')

    // 3. Verificar se funcionou
    console.log('3️⃣ [STATUS] Verificando nova estrutura...')
    const { data: newColumns } = await supabase
      .from('cenarios')
      .select('*')
      .limit(1)

    if (newColumns && newColumns.length > 0) {
      console.log('📋 [STATUS] Novas colunas:', Object.keys(newColumns[0]))
    }

    // 4. Atualizar cenários existentes para ter status padrão
    console.log('4️⃣ [STATUS] Atualizando cenários existentes...')
    const { error: updateError } = await supabase
      .from('cenarios')
      .update({ status: 'rascunho' })
      .is('status', null)

    if (updateError) {
      console.error('⚠️ [STATUS] Erro ao atualizar cenários existentes:', updateError)
    } else {
      console.log('✅ [STATUS] Cenários existentes atualizados!')
    }

  } catch (error) {
    console.error('💥 [STATUS] Erro inesperado:', error)
  }

  console.log('🏁 [STATUS] Processo finalizado')
}

addStatusColumn()