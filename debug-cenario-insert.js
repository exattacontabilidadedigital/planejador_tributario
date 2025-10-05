// Script para debugar inserção de cenários no Supabase
// Execute: node debug-cenario-insert.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 [CENÁRIOS] Configurações:')
console.log('   URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')
console.log('   Key:', supabaseKey ? '✅ Definida' : '❌ Não definida')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCenarios() {
  console.log('🔄 [CENÁRIOS] Iniciando debug...')
  
  try {
    // 1. Verificar se tabela cenarios existe
    console.log('1️⃣ [CENÁRIOS] Testando acesso à tabela...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('cenarios')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ [CENÁRIOS] Erro ao acessar tabela:', connectionError)
      return
    }
    
    console.log('✅ [CENÁRIOS] Conexão OK:', connectionTest)
    
    // 2. Verificar estrutura da tabela cenarios
    console.log('2️⃣ [CENÁRIOS] Verificando estrutura da tabela...')
    const { data: firstRow, error: firstRowError } = await supabase
      .from('cenarios')
      .select('*')
      .limit(1)
    
    if (firstRowError) {
      console.log('⚠️ [CENÁRIOS] Erro ao consultar primeira linha:', firstRowError.message)
    } else {
      console.log('📋 [CENÁRIOS] Colunas disponíveis:', firstRow.length > 0 ? Object.keys(firstRow[0]) : 'Tabela vazia - consultando schema')
      
      // Se vazia, tentar inserir um teste simples para ver quais campos são obrigatórios
      if (firstRow.length === 0) {
        console.log('🧪 [CENÁRIOS] Tabela vazia, testando inserção básica...')
        
        const { data: insertTest, error: insertTestError } = await supabase
          .from('cenarios')
          .insert([{ nome: 'Test Schema' }])
          .select()
          .single()
        
        if (insertTestError) {
          console.log('❌ [CENÁRIOS] Erro inserção teste:', {
            code: insertTestError.code,
            message: insertTestError.message,
            details: insertTestError.details,
            hint: insertTestError.hint
          })
        } else {
          console.log('✅ [CENÁRIOS] Inserção teste OK:', Object.keys(insertTest))
          // Limpar
          await supabase.from('cenarios').delete().eq('id', insertTest.id)
        }
      }
    }
    
    // 3. Verificar se existem empresas para usar como FK
    console.log('3️⃣ [CENÁRIOS] Verificando empresas disponíveis...')
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome')
      .limit(5)
    
    if (empresasError) {
      console.error('❌ [CENÁRIOS] Erro ao buscar empresas:', empresasError)
      return
    }
    
    console.log('📋 [CENÁRIOS] Empresas disponíveis:', empresas?.length || 0)
    if (empresas && empresas.length > 0) {
      console.log('   Primeira empresa:', empresas[0])
      
      // 4. Testar com configuracao válida
      console.log('4️⃣ [CENÁRIOS] Testando com configuracao válida...')
      
      const camposComConfig = {
        empresa_id: empresas[0].id,
        nome: 'Teste com config',
        ano: 2025,
        configuracao: {
          regimeTributario: 'lucro-presumido',
          tipoEmpresa: 'comercio',
          aliquotas: {
            irpj: 0.15,
            csll: 0.09,
            pis: 0.0165,
            cofins: 0.076
          }
        }
      }
      
      console.log('📝 [CENÁRIOS] Dados com config:', camposComConfig)
      
      const { data: testeConfig, error: erroConfig } = await supabase
        .from('cenarios')
        .insert([camposComConfig])
        .select()
        .single()
      
      if (erroConfig) {
        console.error('❌ [CENÁRIOS] Erro com config:', erroConfig.message)
        console.error('   Code:', erroConfig.code)
        console.error('   Details:', erroConfig.details)
        
        // Tentar sem o campo configuracao (deixar usar default)
        console.log('\n🔄 [CENÁRIOS] Tentando sem campo configuracao...')
        const { empresa_id, nome, ano } = camposComConfig
        const camposSemConfig = { empresa_id, nome, ano }
        
        const { data: testeSemConfig, error: erroSemConfig } = await supabase
          .from('cenarios')
          .insert([camposSemConfig])
          .select()
          .single()
        
        if (erroSemConfig) {
          console.error('❌ [CENÁRIOS] Erro sem config:', erroSemConfig.message)
        } else {
          console.log('✅ [CENÁRIOS] SEM CONFIG OK!')
          console.log('   Colunas:', Object.keys(testeSemConfig))
          console.log('   Dados:', testeSemConfig)
          await supabase.from('cenarios').delete().eq('id', testeSemConfig.id)
        }
        
      } else {
        console.log('✅ [CENÁRIOS] COM CONFIG OK!')
        console.log('   Colunas:', Object.keys(testeConfig))
        console.log('   Dados:', testeConfig)
        
        // Testar atualização também
        console.log('\n🔄 [CENÁRIOS] Testando atualização...')
        const { data: updateResult, error: updateError } = await supabase
          .from('cenarios')
          .update({
            nome: 'Teste ATUALIZADO',
            descricao: 'Descrição atualizada',
            configuracao: {
              ...testeConfig.configuracao,
              updated: true
            }
          })
          .eq('id', testeConfig.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('❌ [CENÁRIOS] Erro na atualização:', updateError.message)
        } else {
          console.log('✅ [CENÁRIOS] ATUALIZAÇÃO OK!')
          console.log('   Nome atualizado:', updateResult.nome)
          console.log('   Config atualizada:', updateResult.configuracao.updated)
        }
        
        // Limpar
        await supabase.from('cenarios').delete().eq('id', testeConfig.id)
        console.log('🧹 [CENÁRIOS] Limpeza OK')
      }
      
    } else {
      console.log('⚠️ [CENÁRIOS] Nenhuma empresa encontrada para usar como FK')
    }
    
  } catch (error) {
    console.error('💥 [CENÁRIOS] ERRO GERAL:', {
      type: typeof error,
      message: error.message,
      stack: error.stack,
      full: JSON.stringify(error, null, 2)
    })
  }
}

// Executar debug
debugCenarios().then(() => {
  console.log('🏁 [CENÁRIOS] Debug finalizado')
  process.exit(0)
}).catch(error => {
  console.error('💥 [CENÁRIOS] Erro não capturado:', error)
  process.exit(1)
})