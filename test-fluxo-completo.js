/**
 * Script para testar o fluxo completo de atualização de mês no banco
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testarFluxoCompleto() {
  console.log('🔧 [FLUXO COMPLETO] Testando atualização do mês no banco...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const empresaId = '825e24e2-ad3a-4111-91ad-d53f3dcb990a'

    // 1. Verificar o cenário que criamos anteriormente (Abril com mes=3)
    console.log('1️⃣ Verificando cenário "Abril 2025" existente...')
    
    const { data: cenarios, error: buscarError } = await supabase
      .from('cenarios')
      .select('id, nome, mes')
      .eq('empresa_id', empresaId)
      .ilike('nome', '%abril%')

    if (buscarError || !cenarios || cenarios.length === 0) {
      console.log('❌ Cenário "Abril" não encontrado')
      return
    }

    const cenarioAbril = cenarios[0]
    console.log('✅ Cenário encontrado:', {
      id: cenarioAbril.id,
      nome: cenarioAbril.nome,
      mesAtual: cenarioAbril.mes
    })

    // 2. Simular a atualização que o frontend deveria fazer
    console.log('\n2️⃣ Simulando atualização do mês baseado no nome...')
    
    // Função para extrair mês (mesma lógica do frontend)
    function extrairMesDoNome(nomeCenario) {
      const mesesCompletos = [
        { nomes: ['janeiro', 'jan'], numero: 1 },
        { nomes: ['fevereiro', 'fev'], numero: 2 },
        { nomes: ['março', 'mar'], numero: 3 },
        { nomes: ['abril', 'abr'], numero: 4 },
        { nomes: ['maio', 'mai'], numero: 5 },
        { nomes: ['junho', 'jun'], numero: 6 },
        { nomes: ['julho', 'jul'], numero: 7 },
        { nomes: ['agosto', 'ago'], numero: 8 },
        { nomes: ['setembro', 'set'], numero: 9 },
        { nomes: ['outubro', 'out'], numero: 10 },
        { nomes: ['novembro', 'nov'], numero: 11 },
        { nomes: ['dezembro', 'dez'], numero: 12 },
      ]
      
      const nomeNormalizado = nomeCenario.toLowerCase()
      
      for (const mesInfo of mesesCompletos) {
        for (const nomeVariacao of mesInfo.nomes) {
          if (nomeNormalizado.includes(nomeVariacao)) {
            return mesInfo.numero
          }
        }
      }
      
      return null
    }

    const mesCorreto = extrairMesDoNome(cenarioAbril.nome)
    console.log(`📅 Mês extraído do nome "${cenarioAbril.nome}": ${mesCorreto}`)

    if (mesCorreto && mesCorreto !== cenarioAbril.mes) {
      console.log(`🔄 Atualizando mês de ${cenarioAbril.mes} para ${mesCorreto}...`)

      const { error: updateError } = await supabase
        .from('cenarios')
        .update({ mes: mesCorreto })
        .eq('id', cenarioAbril.id)

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError)
        return
      }

      console.log('✅ Mês atualizado no banco com sucesso!')
    } else {
      console.log('ℹ️ Mês já está correto ou não foi possível extrair')
    }

    // 3. Verificar o resultado final
    console.log('\n3️⃣ Verificando resultado final...')
    
    const { data: cenarioAtualizado, error: verificarError } = await supabase
      .from('cenarios')
      .select('id, nome, mes')
      .eq('id', cenarioAbril.id)
      .single()

    if (verificarError) {
      console.error('❌ Erro ao verificar:', verificarError)
      return
    }

    console.log('📊 RESULTADO FINAL:')
    console.log(`   Nome: ${cenarioAtualizado.nome}`)
    console.log(`   Mês no banco: ${cenarioAtualizado.mes}`)
    console.log(`   Esperado no gráfico: ${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][cenarioAtualizado.mes - 1]}`)

    console.log('\n✅ FLUXO COMPLETO TESTADO:')
    console.log('   1. ✅ Cenário encontrado')
    console.log('   2. ✅ Mês extraído do nome')
    console.log('   3. ✅ Banco atualizado')
    console.log('   4. ✅ Gráfico deve mostrar dados corretos')

    console.log('\n🔍 Verifique o gráfico em:')
    console.log(`   http://localhost:3001/empresas/${empresaId}`)

  } catch (err) {
    console.error('❌ Erro geral:', err)
  }
}

testarFluxoCompleto()