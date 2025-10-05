// Script simples para testar inserção de empresa no Supabase
// Execute: node debug-empresa-insert.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Configurações:')
console.log('   URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')
console.log('   Key:', supabaseKey ? '✅ Definida' : '❌ Não definida')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugInsert() {
  console.log('🔄 Iniciando debug de inserção...')
  
  try {
    // 1. Teste de conexão básica
    console.log('1️⃣ Testando conexão básica...')
    const { data: connectionTest } = await supabase
      .from('empresas')
      .select('count')
      .limit(1)
    
    console.log('✅ Conexão OK:', connectionTest)
    
    // 2. Verificar estrutura da tabela através de uma consulta simples
    console.log('2️⃣ Verificando estrutura da tabela...')
    const { data: firstRow, error: firstRowError } = await supabase
      .from('empresas')
      .select('*')
      .limit(1)
    
    if (firstRowError) {
      console.log('⚠️ Erro ao consultar primeira linha:', firstRowError.message)
    } else {
      console.log('📋 Colunas disponíveis:', firstRow.length > 0 ? Object.keys(firstRow[0]) : 'Tabela vazia')
    }
    
    // 3. Teste com diferentes valores de regime_tributario
    console.log('3️⃣ Testando diferentes regimes tributários...')
    
    const regimes = ['lucro-real', 'simples', 'presumido', 'lucro_real', 'lucro_presumido']
    
    for (const regime of regimes) {
      console.log(`\n🧪 Testando regime: ${regime}`)
      
      const dadosTestRegime = {
        nome: `Test ${regime}`,
        regime_tributario: regime,
        setor: 'comercio'
      }
      
      const { data: testResult, error: testError } = await supabase
        .from('empresas')
        .insert([dadosTestRegime])
        .select()
        .single()
      
      if (testError) {
        console.log(`❌ Falhou: ${testError.code} - ${testError.message}`)
      } else {
        console.log(`✅ Sucesso: ID ${testResult.id}`)
        // Limpar imediatamente
        await supabase.from('empresas').delete().eq('id', testResult.id)
        console.log('🧹 Limpeza OK')
        break // Se um funcionou, parar o teste
      }
    }
    // 4. Teste setor também
    console.log('\n4️⃣ Testando diferentes setores...')
    
    const setores = ['comercio', 'industria', 'servicos', 'comercial', 'industrial', 'servico']
    
    for (const setor of setores) {
      console.log(`\n🧪 Testando setor: ${setor}`)
      
      const dadosTestSetor = {
        nome: `Test ${setor}`,
        regime_tributario: 'simples', // Usar um que funcionou no teste anterior
        setor: setor
      }
      
      const { data: testResult, error: testError } = await supabase
        .from('empresas')
        .insert([dadosTestSetor])
        .select()
        .single()
      
      if (testError) {
        console.log(`❌ Falhou: ${testError.code} - ${testError.message}`)
      } else {
        console.log(`✅ Sucesso: ID ${testResult.id}`)
        // Limpar imediatamente
        await supabase.from('empresas').delete().eq('id', testResult.id)
        console.log('🧹 Limpeza OK')
      }
    }
    
    return // Parar aqui para focar nos testes importantes
    
  } catch (error) {
    console.log('💥 ERRO GERAL CAPTURADO:')
    console.log('   Type:', typeof error)
    console.log('   Message:', error.message)
    console.log('   Stack:', error.stack)
    console.log('   Full:', JSON.stringify(error, null, 2))
  }
}

// Executar debug
debugInsert().then(() => {
  console.log('🏁 Debug finalizado')
  process.exit(0)
}).catch(error => {
  console.log('💥 Erro não capturado:', error)
  process.exit(1)
})