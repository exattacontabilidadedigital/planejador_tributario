/**
 * Script para testar a duplicação de cenários após correção
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testDuplicarCenario() {
  console.log('🔧 [DUPLICAR] Configurações:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando')
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [DUPLICAR] Configurações de Supabase não encontradas')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔄 [DUPLICAR] Iniciando teste de duplicação...')

  try {
    // 1. Buscar um cenário existente
    console.log('1️⃣ [DUPLICAR] Buscando cenário existente...')
    const { data: cenarios, error: selectError } = await supabase
      .from('cenarios')
      .select('*')
      .limit(1)

    if (selectError || !cenarios || cenarios.length === 0) {
      console.error('❌ [DUPLICAR] Erro ao buscar cenário:', selectError)
      return
    }

    const cenarioOriginal = cenarios[0]
    console.log('✅ [DUPLICAR] Cenário original:', {
      id: cenarioOriginal.id,
      nome: cenarioOriginal.nome,
      empresa_id: cenarioOriginal.empresa_id
    })

    // 2. Simular duplicação - criar uma cópia
    const duplicadoData = {
      empresa_id: cenarioOriginal.empresa_id,
      nome: cenarioOriginal.nome + ' (Cópia)',
      descricao: cenarioOriginal.descricao,
      ano: cenarioOriginal.ano,
      configuracao: cenarioOriginal.configuracao,
      status: 'rascunho'
    }

    console.log('2️⃣ [DUPLICAR] Criando duplicata...')
    console.log('📝 [DUPLICAR] Dados:', JSON.stringify(duplicadoData, null, 2))

    const { data: duplicado, error: duplicarError } = await supabase
      .from('cenarios')
      .insert(duplicadoData)
      .select()
      .single()

    if (duplicarError) {
      console.error('❌ [DUPLICAR] Erro na duplicação:', duplicarError)
      return
    }

    console.log('✅ [DUPLICAR] Duplicação bem-sucedida!')
    console.log('📄 [DUPLICAR] Cenário duplicado:', {
      id: duplicado.id,
      nome: duplicado.nome,
      empresa_id: duplicado.empresa_id,
      configuracao: !!duplicado.configuracao
    })

    // 3. Verificar se os dados estão corretos
    if (duplicado.empresa_id === cenarioOriginal.empresa_id) {
      console.log('✅ [DUPLICAR] Empresa_id preservado')
    }
    if (duplicado.configuracao) {
      console.log('✅ [DUPLICAR] Configuração preservada')
    }
    if (duplicado.status === 'rascunho') {
      console.log('✅ [DUPLICAR] Status correto (rascunho)')
    }

    // 4. Limpar - deletar a duplicata
    console.log('4️⃣ [DUPLICAR] Limpando duplicata...')
    const { error: deleteError } = await supabase
      .from('cenarios')
      .delete()
      .eq('id', duplicado.id)

    if (deleteError) {
      console.error('⚠️ [DUPLICAR] Erro ao limpar:', deleteError)
    } else {
      console.log('✅ [DUPLICAR] Limpeza concluída!')
    }

  } catch (error) {
    console.error('💥 [DUPLICAR] Erro inesperado:', error)
  }

  console.log('🏁 [DUPLICAR] Teste finalizado')
}

testDuplicarCenario()