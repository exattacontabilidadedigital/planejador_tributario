/**
 * Script para testar o problema: duplicar março e renomear para abril
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testarProblemaMarcoAbril() {
  console.log('🔧 [MARÇO→ABRIL] Testando problema de duplicação e renomeação...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const empresaId = '825e24e2-ad3a-4111-91ad-d53f3dcb990a'

    // 1. Buscar cenário de março existente
    console.log('1️⃣ Buscando cenário de Março...')
    const { data: cenarioMarco, error: buscarError } = await supabase
      .from('cenarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('mes', 3)
      .limit(1)
      .single()

    if (buscarError || !cenarioMarco) {
      console.log('❌ Cenário de Março não encontrado, criando um...')
      
      // Criar um cenário de março primeiro
      const novoMarco = {
        empresa_id: empresaId,
        nome: 'Março 2025',
        descricao: 'Cenário para Março',
        ano: 2025,
        mes: 3,
        tipo_periodo: 'mensal',
        data_inicio: '2025-03-01',
        data_fim: '2025-03-31',
        configuracao: {
          regimeTributario: 'lucro-presumido',
          tipoEmpresa: 'comercio',
          receitaBruta: 115000,
          cmvTotal: 40250,
          icmsInterno: 7.0,
          pisAliq: 0.65,
          cofinsAliq: 3.0,
          periodo: {
            tipo: 'mensal',
            mes: 3,
            ano: 2025,
            inicio: '2025-03-01T00:00:00.000Z',
            fim: '2025-03-31T23:59:59.999Z'
          }
        },
        status: 'aprovado'
      }

      const { data: criado, error: criarError } = await supabase
        .from('cenarios')
        .insert(novoMarco)
        .select()
        .single()

      if (criarError) {
        console.error('❌ Erro ao criar cenário de Março:', criarError)
        return
      }
      
      console.log('✅ Cenário de Março criado:', criado.id)
      var cenarioMarcoVar = criado
    } else {
      console.log('✅ Cenário de Março encontrado:', cenarioMarco.nome)
      var cenarioMarcoVar = cenarioMarco
    }

    // 2. Duplicar cenário de março
    console.log('2️⃣ Duplicando cenário de Março...')
    const cenarioAbril = {
      ...cenarioMarcoVar,
      id: undefined, // Remove ID para criar novo
      nome: 'Abril 2025', // MUDANÇA DO NOME PARA ABRIL
      descricao: 'Cenário duplicado de Março e renomeado para Abril',
      created_at: undefined,
      updated_at: undefined,
      // MAS O MÊS CONTINUA SENDO 3 (MARÇO) - ESSE É O PROBLEMA!
      mes: 3 // ← Aqui está o problema que vamos resolver
    }

    const { data: duplicado, error: duplicarError } = await supabase
      .from('cenarios')
      .insert(cenarioAbril)
      .select()
      .single()

    if (duplicarError) {
      console.error('❌ Erro ao duplicar cenário:', duplicarError)
      return
    }

    console.log('✅ Cenário duplicado criado:', {
      id: duplicado.id,
      nome: duplicado.nome,
      mes: duplicado.mes // Ainda será 3 (março), mas nome é "Abril"
    })

    console.log('\n📊 SITUAÇÃO ATUAL:')
    console.log('• Nome do cenário: "Abril 2025"')
    console.log('• Campo mes no banco: 3 (março)')
    console.log('• ANTES da correção: gráfico mostraria "Mar"')
    console.log('• DEPOIS da correção: gráfico deve mostrar "Abr"')

    console.log('\n🔍 Verificar no navegador:')
    console.log(`http://localhost:3001/empresas/${empresaId}`)
    console.log('\n⚠️  ID do cenário criado para limpeza:', duplicado.id)

    // Salvar ID para limpeza
    require('fs').writeFileSync('cenario-abril-teste.txt', duplicado.id)

    console.log('\n📋 Para limpar depois, execute:')
    console.log('node -e "const fs = require(\'fs\'); const id = fs.readFileSync(\'cenario-abril-teste.txt\', \'utf8\'); console.log(\'Limpando:\', id);"')

  } catch (err) {
    console.error('❌ Erro geral:', err)
  }
}

testarProblemaMarcoAbril()