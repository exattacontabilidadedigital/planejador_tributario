// Script de teste para verificar dados no Supabase
// Cole este código no console do navegador (F12)

import { createClient } from '@/lib/supabase/client'

const testarBancoDeDados = async () => {
  console.log('🔍 Iniciando teste de banco de dados...')
  
  const supabase = createClient()
  
  // 1. Testar conexão
  console.log('📡 Testando conexão com Supabase...')
  const { data: testData, error: testError } = await supabase
    .from('comparativos_analise')
    .select('count')
    .limit(1)
  
  if (testError) {
    console.error('❌ Erro de conexão:', testError)
    return
  }
  console.log('✅ Conexão OK')
  
  // 2. Buscar todos os comparativos
  console.log('\n📊 Buscando todos os comparativos...')
  const { data: todos, error: erroTodos } = await supabase
    .from('comparativos_analise')
    .select('*')
  
  if (erroTodos) {
    console.error('❌ Erro ao buscar comparativos:', erroTodos)
    return
  }
  
  console.log(`✅ Encontrados ${todos?.length || 0} comparativos no total`)
  
  if (todos && todos.length > 0) {
    console.log('\n📋 Lista de comparativos:')
    console.table(todos.map(d => ({
      id: d.id.substring(0, 8) + '...',
      nome: d.nome,
      empresa_id: d.empresa_id.substring(0, 8) + '...',
      ano: d.configuracao?.ano || 'N/A',
      created_at: new Date(d.created_at).toLocaleDateString('pt-BR')
    })))
    
    console.log('\n🔍 Detalhes do primeiro comparativo:')
    console.log('Nome:', todos[0].nome)
    console.log('Empresa ID:', todos[0].empresa_id)
    console.log('Configuração:', todos[0].configuracao)
    console.log('Resultados:', todos[0].resultados)
    console.log('Criado em:', todos[0].created_at)
  } else {
    console.log('⚠️ Nenhum comparativo encontrado no banco!')
  }
  
  // 3. Verificar empresas
  console.log('\n🏢 Verificando empresas únicas:')
  const empresasUnicas = [...new Set(todos?.map(d => d.empresa_id) || [])]
  console.log(`Empresas com comparativos: ${empresasUnicas.length}`)
  empresasUnicas.forEach((id, index) => {
    const count = todos?.filter(d => d.empresa_id === id).length || 0
    console.log(`  ${index + 1}. ${id.substring(0, 8)}... - ${count} comparativo(s)`)
  })
}

// Executar teste
testarBancoDeDados()

export {}
