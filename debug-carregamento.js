/**
 * Script para debugar o carregamento de cenários
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function debugCarregamentoCenarios() {
  console.log('🔧 [DEBUG] Testando carregamento direto dos cenários...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const empresaId = '825e24e2-ad3a-4111-91ad-d53f3dcb990a'

    console.log('1️⃣ Testando query direta do Supabase...')
    
    const { data, error } = await supabase
      .from('cenarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro na query:', error)
      return
    }

    console.log(`✅ Query executada com sucesso. ${data.length} cenários encontrados.`)

    // Analisar cada cenário
    console.log('\n2️⃣ Analisando cenários encontrados:')
    data.forEach((cenario, index) => {
      console.log(`\n📋 CENÁRIO ${index + 1}:`)
      console.log(`   ID: ${cenario.id}`)
      console.log(`   Nome: ${cenario.nome}`)
      console.log(`   Empresa ID: ${cenario.empresa_id}`)
      console.log(`   Mês: ${cenario.mes}`)
      console.log(`   Ano: ${cenario.ano}`)
      console.log(`   Status: ${cenario.status}`)
      console.log(`   Configuração: ${cenario.configuracao ? 'Presente' : 'Ausente'}`)
      
      if (cenario.configuracao) {
        const config = cenario.configuracao
        console.log(`   Receita Bruta: R$ ${(config.receitaBruta || 0).toLocaleString('pt-BR')}`)
        console.log(`   CMV: R$ ${(config.cmvTotal || 0).toLocaleString('pt-BR')}`)
      }
    })

    // Verificar cenários com mês definido (que aparecem no gráfico)
    const cenariosComMes = data.filter(c => c.mes !== null && c.mes !== undefined)
    console.log(`\n📊 CENÁRIOS COM MÊS DEFINIDO: ${cenariosComMes.length}`)
    
    if (cenariosComMes.length > 0) {
      console.log('📈 Estes cenários DEVEM aparecer no gráfico:')
      cenariosComMes.forEach(c => {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        const mesNome = meses[c.mes - 1] || `Mês ${c.mes}`
        const receita = c.configuracao?.receitaBruta || 0
        console.log(`   • ${c.nome} → ${mesNome} (R$ ${receita.toLocaleString('pt-BR')})`)
      })
    } else {
      console.log('⚠️ NENHUM cenário tem mês definido - gráfico ficará vazio!')
    }

    // Simular o mapeamento que o frontend faz
    console.log('\n3️⃣ Simulando mapeamento do frontend:')
    const cenariosMapeados = data.map(row => {
      const configuracao = row.configuracao || {}
      
      return {
        id: row.id,
        nome: row.nome,
        mes: row.mes,
        receita: configuracao.receitaBruta || 0,
        cmv: configuracao.cmvTotal || 0
      }
    })

    console.log('📊 Dados que o frontend deveria receber:')
    console.log(JSON.stringify(cenariosMapeados, null, 2))

  } catch (err) {
    console.error('❌ Erro geral:', err)
  }
}

debugCarregamentoCenarios()