const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function recriarCenarioPerdido() {
  console.log('🔧 RECRIANDO CENÁRIO PERDIDO\n')
  
  const empresaId = '20b8a917-ed8d-4c5e-8160-30014d13c563'
  
  // Dados baseados no que você mostrou
  const dadosPerdidos = {
    mes: "02",
    ano: 2026,
    regime: "lucro_presumido", 
    receita: "250050.00",
    icms: "0.00", // Assumindo valores padrão
    // Adicione outros campos conforme necessário
  }
  
  // Criar estrutura compatível com a aplicação
  const novoCenario = {
    id: '4b335702-4640-43de-a1f0-66d34cbb70f4', // Mantém o ID original
    empresa_id: empresaId,
    nome: `fevereiro-2026`,
    descricao: 'Cenário recriado - Fevereiro 2026',
    ano: 2026,
    mes: 2, // Fevereiro
    status: 'rascunho',
    tipo_periodo: 'mensal',
    configuracao: {
      periodo: {
        mes: parseInt(dadosPerdidos.mes),
        ano: dadosPerdidos.ano
      },
      regime: dadosPerdidos.regime,
      receita: parseFloat(dadosPerdidos.receita),
      icms: parseFloat(dadosPerdidos.icms || 0),
      // Configurações padrão necessárias
      fcp: 0,
      difal: 0,
      frete: 0,
      icmsSul: 0,
      issAliq: 0,
      pisAliq: 1.65,
      cofinsAliq: 7.6,
      alugueis: 0,
      outrasReceitas: 0
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  console.log('📝 Dados do novo cenário:')
  console.log(`   Nome: ${novoCenario.nome}`)
  console.log(`   Mês/Ano: ${novoCenario.mes}/${novoCenario.ano}`)
  console.log(`   Regime: ${novoCenario.configuracao.regime}`)
  console.log(`   Receita: R$ ${parseFloat(novoCenario.configuracao.receita).toLocaleString('pt-BR')}`)
  
  console.log('\n❓ Deseja realmente criar este cenário? (Execute o script com --create para confirmar)')
  
  // Verificar se deve realmente criar
  const shouldCreate = process.argv.includes('--create')
  
  if (shouldCreate) {
    console.log('\n🚀 Criando cenário...')
    
    try {
      const { data, error } = await supabase
        .from('cenarios')
        .insert([novoCenario])
        .select()
      
      if (error) {
        console.error('❌ Erro ao criar cenário:', error)
        return
      }
      
      console.log('✅ Cenário criado com sucesso!')
      console.log(`🆔 ID: ${data[0].id}`)
      console.log(`📅 Criado em: ${new Date(data[0].created_at).toLocaleString('pt-BR')}`)
      
    } catch (e) {
      console.error('❌ Erro inesperado:', e)
    }
  } else {
    console.log('\n💡 Para criar o cenário, execute:')
    console.log('   node recriar-cenario-perdido.js --create')
  }
}

recriarCenarioPerdido().catch(console.error)