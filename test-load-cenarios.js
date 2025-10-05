/**
 * Script para testar se os cenários estão sendo carregados corretamente
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testLoadCenarios() {
  console.log('🔧 [LOAD] Configurações:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando')
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [LOAD] Configurações de Supabase não encontradas')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔄 [LOAD] Testando carregamento de cenários...')

  try {
    // 1. Listar todas as empresas
    console.log('1️⃣ [LOAD] Buscando empresas...')
    const { data: empresas, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nome')
      .limit(3)

    if (empresaError) {
      console.error('❌ [LOAD] Erro ao buscar empresas:', empresaError)
      return
    }

    console.log('✅ [LOAD] Empresas encontradas:', empresas.length)
    empresas.forEach(emp => console.log(`   - ${emp.nome} (${emp.id})`))

    // 2. Para cada empresa, buscar cenários
    for (const empresa of empresas) {
      console.log(`\n2️⃣ [LOAD] Buscando cenários da empresa: ${empresa.nome}`)
      
      const { data: cenarios, error: cenariosError } = await supabase
        .from('cenarios')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false })

      if (cenariosError) {
        console.error(`❌ [LOAD] Erro ao buscar cenários da ${empresa.nome}:`, cenariosError)
        continue
      }

      console.log(`📊 [LOAD] ${empresa.nome}: ${cenarios.length} cenários`)
      
      if (cenarios.length > 0) {
        cenarios.forEach(cenario => {
          console.log(`   📄 ${cenario.nome} (${cenario.status}) - ${cenario.ano}`)
          if (cenario.configuracao) {
            const config = cenario.configuracao
            if (config.periodo) {
              console.log(`      🗓️ Período: ${config.periodo.tipo} (${config.periodo.ano})`)
            }
            if (config.regimeTributario) {
              console.log(`      ⚖️ Regime: ${config.regimeTributario}`)
            }
          }
        })
      } else {
        console.log(`   ⚠️ Nenhum cenário encontrado para ${empresa.nome}`)
      }
    }

    // 3. Estatísticas gerais
    console.log('\n3️⃣ [LOAD] Estatísticas gerais...')
    const { data: totalCenarios, error: totalError } = await supabase
      .from('cenarios')
      .select('id, status')

    if (!totalError && totalCenarios) {
      const stats = {
        total: totalCenarios.length,
        aprovados: totalCenarios.filter(c => c.status === 'aprovado').length,
        rascunhos: totalCenarios.filter(c => c.status === 'rascunho').length,
        arquivados: totalCenarios.filter(c => c.status === 'arquivado').length,
      }
      
      console.log('📈 [LOAD] Total de cenários no sistema:', stats.total)
      console.log(`   - Aprovados: ${stats.aprovados}`)
      console.log(`   - Rascunhos: ${stats.rascunhos}`)
      console.log(`   - Arquivados: ${stats.arquivados}`)
    }

  } catch (error) {
    console.error('💥 [LOAD] Erro inesperado:', error)
  }

  console.log('\n🏁 [LOAD] Teste finalizado')
}

testLoadCenarios()