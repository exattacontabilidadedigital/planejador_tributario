import { createClient } from '@/lib/supabase/client'
import { useRegimesTributariosStore } from '@/stores/regimes-tributarios-store'

// Teste direto das funções da store
export async function testarSalvarDados() {
  console.log('🧪 Iniciando teste de salvamento...')
  
  try {
    const { adicionarDadoComparativo } = useRegimesTributariosStore.getState()
    
    console.log('📝 Função adicionarDadoComparativo:', typeof adicionarDadoComparativo)
    
    const dadosTeste = {
      empresaId: '825e24e2-ad3a-4111-91ad-d53f3dcb990a',
      mes: '02',
      ano: 2025,
      regime: 'simples_nacional' as any,
      receita: 5000,
      icms: 600,
      pis: 32.5,
      cofins: 150,
      irpj: 75,
      csll: 45,
      iss: 0,
      outros: 0,
      observacoes: 'Teste direto da store'
    }
    
    console.log('💾 Tentando salvar dados:', dadosTeste)
    
    await adicionarDadoComparativo(dadosTeste)
    
    console.log('✅ Dados salvos com sucesso!')
    
    // Verificar se foi salvo
    const { obterDadosPorEmpresa } = useRegimesTributariosStore.getState()
    const dados = obterDadosPorEmpresa('825e24e2-ad3a-4111-91ad-d53f3dcb990a')
    
    console.log('📊 Dados na store:', dados.length)
    
    return true
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return false
  }
}

// Para chamar no console do browser: window.testarSalvarDados()
if (typeof window !== 'undefined') {
  (window as any).testarSalvarDados = testarSalvarDados
}