/**
 * Script para corrigir meses nulos baseado nos nomes dos cenários
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function corrigirMesesNulos() {
  console.log('🔧 [CORREÇÃO] Corrigindo meses nulos baseado nos nomes...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const empresaId = '825e24e2-ad3a-4111-91ad-d53f3dcb990a'

    // Buscar cenários com mes = null
    const { data: cenariosNulos, error: buscarError } = await supabase
      .from('cenarios')
      .select('id, nome, mes')
      .eq('empresa_id', empresaId)
      .is('mes', null)

    if (buscarError) {
      console.error('❌ Erro ao buscar cenários:', buscarError)
      return
    }

    console.log(`🔍 Encontrados ${cenariosNulos.length} cenários com mês nulo`)

    // Mapeamento de nomes para números de mês
    const mesesMap = {
      'janeiro': 1, 'jan': 1,
      'fevereiro': 2, 'fev': 2,
      'março': 3, 'mar': 3,
      'abril': 4, 'abr': 4,
      'maio': 5, 'mai': 5,
      'junho': 6, 'jun': 6,
      'julho': 7, 'jul': 7,
      'agosto': 8, 'ago': 8,
      'setembro': 9, 'set': 9,
      'outubro': 10, 'out': 10,
      'novembro': 11, 'nov': 11,
      'dezembro': 12, 'dez': 12
    }

    // Corrigir cada cenário
    for (const cenario of cenariosNulos) {
      const nomeNormalizado = cenario.nome.toLowerCase()
      let mesEncontrado = null

      // Buscar mês no nome
      for (const [nomeMes, numeroMes] of Object.entries(mesesMap)) {
        if (nomeNormalizado.includes(nomeMes)) {
          mesEncontrado = numeroMes
          break
        }
      }

      if (mesEncontrado) {
        console.log(`🔄 Corrigindo "${cenario.nome}" → mês ${mesEncontrado}`)
        
        const { error: updateError } = await supabase
          .from('cenarios')
          .update({ mes: mesEncontrado })
          .eq('id', cenario.id)

        if (updateError) {
          console.error(`❌ Erro ao atualizar ${cenario.nome}:`, updateError)
        } else {
          console.log(`✅ ${cenario.nome} corrigido para mês ${mesEncontrado}`)
        }
      } else {
        console.log(`⚠️ Não foi possível determinar mês para: ${cenario.nome}`)
      }
    }

    // Verificar resultado final
    console.log('\n📊 Verificando resultado final...')
    const { data: todosCenarios, error: verificarError } = await supabase
      .from('cenarios')
      .select('id, nome, mes')
      .eq('empresa_id', empresaId)
      .order('mes')

    if (verificarError) {
      console.error('❌ Erro na verificação:', verificarError)
      return
    }

    const comMes = todosCenarios.filter(c => c.mes !== null)
    const semMes = todosCenarios.filter(c => c.mes === null)

    console.log(`\n✅ RESULTADO FINAL:`)
    console.log(`   • Cenários com mês definido: ${comMes.length}`)
    console.log(`   • Cenários sem mês: ${semMes.length}`)

    if (comMes.length > 0) {
      console.log('\n📈 Cenários que aparecerão no gráfico:')
      comMes.forEach(c => {
        const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        console.log(`   • ${c.nome} → ${meses[c.mes]}`)
      })
    }

    if (semMes.length > 0) {
      console.log('\n⚠️ Cenários que NÃO aparecerão no gráfico:')
      semMes.forEach(c => {
        console.log(`   • ${c.nome} (sem mês definido)`)
      })
    }

  } catch (err) {
    console.error('❌ Erro geral:', err)
  }
}

corrigirMesesNulos()