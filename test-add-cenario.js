/**
 * Script para testar a adição de cenários após correção
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testAddCenario() {
  console.log('🔧 [ADD] Configurações:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando')
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [ADD] Configurações de Supabase não encontradas')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔄 [ADD] Iniciando teste de adição de cenário...')

  try {
    // 1. Buscar uma empresa existente
    console.log('1️⃣ [ADD] Buscando empresa existente...')
    const { data: empresas, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nome')
      .limit(1)

    if (empresaError || !empresas || empresas.length === 0) {
      console.error('❌ [ADD] Erro ao buscar empresa:', empresaError)
      return
    }

    const empresa = empresas[0]
    console.log('✅ [ADD] Empresa encontrada:', empresa.nome)

    // 2. Testar inserção com apenas campos que existem
    const currentYear = new Date().getFullYear()
    const cenarioData = {
      empresa_id: empresa.id,
      nome: 'Teste Adição - ' + new Date().toLocaleTimeString(),
      descricao: 'Cenário criado por teste',
      ano: currentYear,
      configuracao: {
        regimeTributario: 'lucro-presumido',
        tipoEmpresa: 'comercio',
        aliquotas: {
          irpj: 0.15,
          csll: 0.09,
          pis: 0.0165,
          cofins: 0.076
        },
        periodo: {
          tipo: 'anual',
          inicio: new Date(currentYear, 0, 1).toISOString(),
          fim: new Date(currentYear, 11, 31).toISOString(),
          ano: currentYear
        }
      },
      status: 'rascunho'
    }

    console.log('2️⃣ [ADD] Tentando inserir cenário...')
    console.log('📝 [ADD] Dados:', JSON.stringify(cenarioData, null, 2))

    const { data: resultado, error: insertError } = await supabase
      .from('cenarios')
      .insert(cenarioData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ [ADD] Erro na inserção:', insertError)
      return
    }

    console.log('✅ [ADD] Cenário criado com sucesso!')
    console.log('📄 [ADD] Dados retornados:', JSON.stringify(resultado, null, 2))

    // 3. Limpar - deletar o cenário de teste
    console.log('3️⃣ [ADD] Limpando cenário de teste...')
    const { error: deleteError } = await supabase
      .from('cenarios')
      .delete()
      .eq('id', resultado.id)

    if (deleteError) {
      console.error('⚠️ [ADD] Erro ao limpar:', deleteError)
    } else {
      console.log('✅ [ADD] Limpeza concluída!')
    }

  } catch (error) {
    console.error('💥 [ADD] Erro inesperado:', error)
  }

  console.log('🏁 [ADD] Teste finalizado')
}

testAddCenario()