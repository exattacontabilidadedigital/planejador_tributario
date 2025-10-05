/**
 * Script para testar a função fetchCenarios após correção
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testFetchCenarios() {
  console.log('🔧 [FETCH] Configurações:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando')
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [FETCH] Configurações de Supabase não encontradas')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔄 [FETCH] Testando fetchCenarios...')

  try {
    // ID da empresa que tem cenários
    const empresaId = 'd8b61e2a-b02b-46d9-8af5-835720a622ae'
    
    console.log('1️⃣ [FETCH] Simulando fetchCenarios para:', empresaId)
    
    const { data, error } = await supabase
      .from('cenarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [FETCH] Erro:', error)
      return
    }

    console.log('📊 [FETCH] Dados brutos do Supabase:', data.length, 'cenários')
    
    // Simular o mapeamento
    const cenarios = data.map((row) => {
      const configuracao = row.configuracao || {}
      const periodo = configuracao.periodo || {
        tipo: 'anual',
        inicio: new Date(row.ano, 0, 1).toISOString(),
        fim: new Date(row.ano, 11, 31).toISOString(),
        ano: row.ano
      }
      
      return {
        id: row.id,
        empresaId: row.empresa_id,
        nome: row.nome,
        descricao: row.descricao || '',
        periodo: {
          tipo: periodo.tipo,
          inicio: periodo.inicio,
          fim: periodo.fim,
          ano: row.ano,
          mes: periodo.mes || undefined,
          trimestre: periodo.trimestre || undefined,
        },
        config: configuracao,
        status: row.status,
        criadoEm: row.created_at,
        atualizadoEm: row.updated_at,
        criadoPor: row.criado_por || undefined,
        tags: row.tags || [],
      }
    })

    console.log('✅ [FETCH] Cenários mapeados:', cenarios.length)
    
    cenarios.forEach(cenario => {
      console.log(`\n📄 [FETCH] ${cenario.nome}`)
      console.log(`   📊 Status: ${cenario.status}`)
      console.log(`   📅 Período: ${cenario.periodo.tipo} (${cenario.periodo.ano})`)
      console.log(`   ⚙️ Config: ${Object.keys(cenario.config).length} propriedades`)
      console.log(`   🆔 ID: ${cenario.id}`)
    })

    // Teste de busca geral (todos os cenários)
    console.log('\n2️⃣ [FETCH] Testando busca geral...')
    const { data: todosCenarios, error: allError } = await supabase
      .from('cenarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (!allError) {
      console.log('📊 [FETCH] Total de cenários no sistema:', todosCenarios.length)
    }

  } catch (error) {
    console.error('💥 [FETCH] Erro inesperado:', error)
  }

  console.log('\n🏁 [FETCH] Teste finalizado')
}

testFetchCenarios()