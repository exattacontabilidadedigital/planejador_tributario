// Teste de atualização de status após correção do schema
// Execute: node test-status-update.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStatusUpdate() {
  console.log('🧪 [STATUS] Testando atualização de status...')
  
  try {
    // 1. Verificar se campo status existe
    console.log('1️⃣ [STATUS] Verificando se campo status existe...')
    const { data: cenarios, error: selectError } = await supabase
      .from('cenarios')
      .select('id, nome, status')
      .limit(1)
    
    if (selectError) {
      console.error('❌ [STATUS] Erro ao buscar cenários:', selectError.message)
      return
    }
    
    if (cenarios.length === 0) {
      console.log('⚠️ [STATUS] Nenhum cenário encontrado para testar')
      return
    }
    
    const cenario = cenarios[0]
    console.log('📋 [STATUS] Cenário encontrado:', {
      id: cenario.id,
      nome: cenario.nome,
      status: cenario.status
    })
    
    // 2. Testar atualização de status
    console.log('2️⃣ [STATUS] Testando atualização rascunho → aprovado...')
    
    const { data: updateResult, error: updateError } = await supabase
      .from('cenarios')
      .update({ status: 'aprovado' })
      .eq('id', cenario.id)
      .select('id, nome, status')
      .single()
    
    if (updateError) {
      console.error('❌ [STATUS] Erro na atualização:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details
      })
    } else {
      console.log('✅ [STATUS] ATUALIZAÇÃO FUNCIONOU!')
      console.log('   Status anterior:', cenario.status)
      console.log('   Status atual:', updateResult.status)
      
      // 3. Testar outros status
      console.log('3️⃣ [STATUS] Testando aprovado → arquivado...')
      
      const { data: updateResult2, error: updateError2 } = await supabase
        .from('cenarios')
        .update({ status: 'arquivado' })
        .eq('id', cenario.id)
        .select('id, nome, status')
        .single()
      
      if (updateError2) {
        console.error('❌ [STATUS] Erro na segunda atualização:', updateError2.message)
      } else {
        console.log('✅ [STATUS] Segunda atualização funcionou!')
        console.log('   Status atual:', updateResult2.status)
      }
      
      // 4. Reverter para status original
      console.log('4️⃣ [STATUS] Revertendo para status original...')
      await supabase
        .from('cenarios')
        .update({ status: cenario.status || 'rascunho' })
        .eq('id', cenario.id)
      
      console.log('🔄 [STATUS] Status revertido para:', cenario.status || 'rascunho')
    }
    
  } catch (error) {
    console.error('💥 [STATUS] Erro geral:', error)
  }
}

// Executar teste
testStatusUpdate().then(() => {
  console.log('\n🏁 [STATUS] Teste finalizado')
  process.exit(0)
}).catch(error => {
  console.error('💥 [STATUS] Erro não capturado:', error)
  process.exit(1)
})