import { ComparativosSupabaseService } from './src/services/comparativos-supabase.ts'

const service = new ComparativosSupabaseService()

async function testarServico() {
  console.log('🔍 Testando ComparativosSupabaseService...')
  
  const dadosTest = {
    empresaId: '65055d21-63c6-4e84-9c53-d462fc0ead29',
    mes: 'jan', // Formato nome
    ano: 2024,
    regime: 'lucro_presumido',
    receita: 75000,
    icms: 3750,
    pis: 1237.5,
    cofins: 5700,
    irpj: 2812.5,
    csll: 1687.5,
    iss: 0,
    outros: 0,
    observacoes: 'Teste com serviço atualizado'
  }
  
  console.log('📝 Dados de entrada (formato local):', dadosTest)
  
  try {
    const resultado = await service.adicionarDados(dadosTest)
    console.log('✅ Dados inseridos com sucesso:', resultado)
    
    // Testar busca
    console.log('\n🔍 Testando busca de dados...')
    const dadosEmpresa = await service.obterDadosPorEmpresa('65055d21-63c6-4e84-9c53-d462fc0ead29')
    console.log('📋 Dados da empresa:', dadosEmpresa.slice(0, 3)) // Mostrar apenas os primeiros 3
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testarServico()