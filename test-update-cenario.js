/**
 * Script para testar a atualização de cenários
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testUpdateCenario() {
  console.log('🔧 [TESTE] Configurações:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando')
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [TESTE] Configurações de Supabase não encontradas')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔄 [TESTE] Iniciando teste de atualização...')

  try {
    // 1. Buscar um cenário existente
    console.log('1️⃣ [TESTE] Buscando cenário existente...')
    const { data: cenarios, error: selectError } = await supabase
      .from('cenarios')
      .select('*')
      .limit(1)

    if (selectError) {
      console.error('❌ [TESTE] Erro ao buscar cenários:', selectError)
      return
    }

    if (!cenarios || cenarios.length === 0) {
      console.log('⚠️ [TESTE] Nenhum cenário encontrado')
      return
    }

    const cenario = cenarios[0]
    console.log('✅ [TESTE] Cenário encontrado:', cenario.id, cenario.nome)

    // 2. Simular atualização com apenas campos que existem
    const updateData = {
      nome: cenario.nome + ' - TESTE',
      descricao: 'Teste de atualização',
      ano: 2025,
      configuracao: {
        regimeTributario: 'lucro-presumido',
        tipoEmpresa: 'comercio',
        aliquotas: {
          irpj: 0.15,
          csll: 0.09,
          pis: 0.0165,
          cofins: 0.076
        }
      }
    }

    console.log('2️⃣ [TESTE] Testando atualização...')
    console.log('📝 [TESTE] Dados:', JSON.stringify(updateData, null, 2))

    const { data: updated, error: updateError } = await supabase
      .from('cenarios')
      .update(updateData)
      .eq('id', cenario.id)
      .select()

    if (updateError) {
      console.error('❌ [TESTE] Erro na atualização:', updateError)
      return
    }

    console.log('✅ [TESTE] Atualização OK!')
    console.log('📄 [TESTE] Dados atualizados:', JSON.stringify(updated[0], null, 2))

    // 3. Reverter para o estado original
    console.log('3️⃣ [TESTE] Revertendo mudanças...')
    const { error: revertError } = await supabase
      .from('cenarios')
      .update({
        nome: cenario.nome,
        descricao: cenario.descricao,
        configuracao: cenario.configuracao
      })
      .eq('id', cenario.id)

    if (revertError) {
      console.error('❌ [TESTE] Erro ao reverter:', revertError)
    } else {
      console.log('✅ [TESTE] Revertido com sucesso!')
    }

  } catch (error) {
    console.error('💥 [TESTE] Erro inesperado:', error)
  }

  console.log('🏁 [TESTE] Teste finalizado')
}

testUpdateCenario()