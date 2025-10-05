// Script para verificar schema das tabelas no Supabase
// Execute: node check-schema.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 [SCHEMA] Verificando schema das tabelas...')
  
  try {
    // 1. Verificar schema EMPRESAS
    console.log('\n1️⃣ [EMPRESAS] Verificando estrutura...')
    const { data: empresasData, error: empresasError } = await supabase
      .from('empresas')
      .select('*')
      .limit(1)
    
    if (empresasError) {
      console.error('❌ [EMPRESAS] Erro:', empresasError.message)
    } else {
      const empresasColunas = empresasData.length > 0 ? Object.keys(empresasData[0]) : []
      console.log('📋 [EMPRESAS] Colunas existentes:', empresasColunas)
      
      // Verificar campos obrigatórios
      const camposEsperados = [
        'id', 'nome', 'cnpj', 'razao_social', 'regime_tributario', 
        'setor', 'uf', 'municipio', 'inscricao_estadual', 
        'inscricao_municipal', 'logo_url', 'created_at', 'updated_at'
      ]
      
      const camposFaltando = camposEsperados.filter(campo => !empresasColunas.includes(campo))
      if (camposFaltando.length > 0) {
        console.log('⚠️ [EMPRESAS] Campos faltando:', camposFaltando)
      } else {
        console.log('✅ [EMPRESAS] Todos os campos presentes!')
      }
    }
    
    // 2. Verificar schema CENARIOS
    console.log('\n2️⃣ [CENARIOS] Verificando estrutura...')
    const { data: cenariosData, error: cenariosError } = await supabase
      .from('cenarios')
      .select('*')
      .limit(1)
    
    if (cenariosError) {
      console.error('❌ [CENARIOS] Erro:', cenariosError.message)
    } else {
      const cenariosColunas = cenariosData.length > 0 ? Object.keys(cenariosData[0]) : []
      console.log('📋 [CENARIOS] Colunas existentes:', cenariosColunas)
      
      // Verificar campos obrigatórios
      const camposEsperados = [
        'id', 'empresa_id', 'nome', 'descricao', 'tipo_periodo', 
        'data_inicio', 'data_fim', 'ano', 'mes', 'trimestre', 
        'status', 'criado_por', 'tags', 'configuracao', 
        'created_at', 'updated_at'
      ]
      
      const camposFaltando = camposEsperados.filter(campo => !cenariosColunas.includes(campo))
      if (camposFaltando.length > 0) {
        console.log('⚠️ [CENARIOS] Campos faltando:', camposFaltando)
      } else {
        console.log('✅ [CENARIOS] Todos os campos presentes!')
      }
      
      // Se tem dados, verificar constraints
      if (cenariosData.length > 0) {
        const cenario = cenariosData[0]
        console.log('📊 [CENARIOS] Exemplo de registro:', {
          id: cenario.id,
          status: cenario.status,
          tipo_periodo: cenario.tipo_periodo,
          tags: cenario.tags
        })
      }
    }
    
    // 3. Tentar uma atualização de teste se possível
    if (cenariosData && cenariosData.length > 0) {
      console.log('\n3️⃣ [TESTE] Testando atualização de status...')
      const cenarioTeste = cenariosData[0]
      
      const { data: updateResult, error: updateError } = await supabase
        .from('cenarios')
        .update({ status: 'aprovado' })
        .eq('id', cenarioTeste.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ [TESTE] Erro na atualização:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details
        })
      } else {
        console.log('✅ [TESTE] Atualização de status funcionou!')
        console.log('   Status atualizado para:', updateResult.status)
        
        // Reverter para o status original
        await supabase
          .from('cenarios')
          .update({ status: cenarioTeste.status })
          .eq('id', cenarioTeste.id)
      }
    }
    
  } catch (error) {
    console.error('💥 [SCHEMA] Erro geral:', error)
  }
}

// Executar verificação
checkSchema().then(() => {
  console.log('\n🏁 [SCHEMA] Verificação finalizada')
  process.exit(0)
}).catch(error => {
  console.error('💥 [SCHEMA] Erro não capturado:', error)
  process.exit(1)
})