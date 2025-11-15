const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function investigarOndeEstaODado() {
  const idProcurado = '4b335702-4640-43de-a1f0-66d34cbb70f4'
  const empresaId = '20b8a917-ed8d-4c5e-8160-30014d13c563'
  
  console.log('🕵️ INVESTIGAÇÃO COMPLETA DOS DADOS PERDIDOS\n')
  console.log(`🔍 Procurando ID: ${idProcurado}`)
  console.log(`🏢 Empresa: ${empresaId}\n`)
  
  // 1. Verificar todas as tabelas do schema público
  console.log('📋 Verificando todas as tabelas do banco...\n')
  
  // Lista mais completa de possíveis tabelas
  const tabelasPossiveis = [
    'cenarios_temporarios',
    'formularios_em_andamento', 
    'dados_formulario',
    'cenarios_draft',
    'cenarios_rascunho',
    'sessoes_usuario',
    'cache_formulario',
    'calculos_temporarios',
    'dados_tributarios',
    'historico_calculos',
    'logs_sistema',
    'audit_trail'
  ]
  
  for (const tabela of tabelasPossiveis) {
    try {
      // Buscar qualquer registro com o ID ou com dados similares aos que você mostrou
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(5)
      
      if (!error && data) {
        console.log(`✅ Tabela '${tabela}' existe e tem ${data.length} registros`)
        
        if (data.length > 0) {
          console.log(`   Estrutura: [${Object.keys(data[0]).join(', ')}]`)
          
          // Verificar se tem o ID que procuramos
          const temId = data.some(item => item.id === idProcurado)
          if (temId) {
            console.log(`   🎯 ENCONTROU O ID PROCURADO!`)
            const item = data.find(item => item.id === idProcurado)
            console.log(`   Dados: ${JSON.stringify(item, null, 2)}`)
          }
          
          // Verificar se tem estrutura similar aos dados que você mostrou
          const temEstruturaSimilar = data.some(item => 
            'mes' in item && 'ano' in item && 'regime' in item && 'receita' in item
          )
          if (temEstruturaSimilar) {
            console.log(`   🎯 ESTRUTURA SIMILAR ENCONTRADA!`)
          }
        }
        console.log('')
      }
    } catch (e) {
      // Tabela não existe ou sem permissão
    }
  }
  
  // 2. Buscar por padrões nos dados existentes
  console.log('🔍 Buscando padrões nos dados existentes...\n')
  
  try {
    // Verificar se há algum registro com mes "02" e ano 2026
    const { data: patterns, error } = await supabase
      .from('cenarios')
      .select('*')
      .eq('ano', 2026)
    
    if (!error && patterns) {
      console.log(`🎯 Cenários de 2026: ${patterns.length}`)
      patterns.forEach(p => {
        console.log(`   • ID: ${p.id} - Mês: ${p.mes} - Nome: "${p.nome}"`)
      })
    }
  } catch (e) {
    console.log('Erro ao buscar padrões:', e.message)
  }
  
  // 3. Mostrar próximos passos
  console.log('\n🚀 PRÓXIMOS PASSOS SUGERIDOS:')
  console.log('1. Verificar localStorage no navegador (F12 > Application > Local Storage)')
  console.log('2. Verificar se o formulário está salvando em outra tabela')
  console.log('3. Verificar se houve erro no processo de salvamento')
  console.log('4. Re-criar o cenário manualmente com os dados que você tem')
  
  console.log('\n💡 DADOS PARA RECRIAR CENÁRIO:')
  console.log('   Mês: 02 (Fevereiro)')
  console.log('   Ano: 2026')
  console.log('   Regime: Lucro Presumido')
  console.log('   Receita: R$ 250.050,00')
  console.log('   (+ outros campos que você preencheu)')
}

investigarOndeEstaODado().catch(console.error)