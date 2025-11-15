const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function investigarDados() {
  console.log('🔍 INVESTIGANDO DADOS SALVOS vs CÓDIGO\n')
  
  // 1. Verificar se existe uma tabela com a estrutura dos dados que você forneceu
  console.log('🔍 Procurando dados com ID:', '4b335702-4640-43de-a1f0-66d34cbb70f4')
  
  // Tentar diferentes tabelas possíveis
  const tabelasPossivies = ['cenarios', 'registros', 'calculos', 'dados', 'planejamentos']
  
  for (const tabela of tabelasPossivies) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .eq('id', '4b335702-4640-43de-a1f0-66d34cbb70f4')
      
      if (!error && data && data.length > 0) {
        console.log(`✅ ENCONTRADO na tabela '${tabela}':`)
        console.log('Estrutura:', Object.keys(data[0]))
        console.log('Dados:', data[0])
        break
      } else if (error && !error.message.includes('does not exist')) {
        console.log(`❌ Erro na tabela '${tabela}':`, error.message)
      }
    } catch (e) {
      // Tabela não existe ou erro de acesso
    }
  }
  
  // 2. Verificar estrutura da tabela cenarios atual
  console.log('\n📋 Estrutura da tabela CENARIOS:')
  const { data: cenarios, error: cenariosError } = await supabase
    .from('cenarios')
    .select('*')
    .limit(1)
  
  if (!cenariosError && cenarios && cenarios.length > 0) {
    console.log('Colunas esperadas:', Object.keys(cenarios[0]))
    console.log('Exemplo de registro:', cenarios[0])
  } else {
    console.log('Tabela cenários vazia ou com erro:', cenariosError?.message)
  }
  
  // 3. Buscar todos os dados da empresa especificada
  console.log('\n🏢 Dados da empresa 20b8a917-ed8d-4c5e-8160-30014d13c563:')
  const { data: dadosEmpresa, error: empresaError } = await supabase
    .from('cenarios')
    .select('*')
    .eq('empresa_id', '20b8a917-ed8d-4c5e-8160-30014d13c563')
  
  console.log('Cenários encontrados:', dadosEmpresa?.length || 0)
  if (dadosEmpresa && dadosEmpresa.length > 0) {
    dadosEmpresa.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.nome || item.id} - Status: ${item.status}`)
    })
  }
  
  // 4. Verificar se os dados estão em uma tabela com nome diferente
  console.log('\n📊 Verificando outras tabelas que podem conter os dados...')
  
  // Buscar todas as tabelas que têm uma coluna 'empresa_id'
  try {
    const { data: todasTabelas, error } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.columns 
          WHERE column_name = 'empresa_id' 
          AND table_schema = 'public'
        `
      })
    
    if (!error && todasTabelas) {
      console.log('Tabelas com coluna empresa_id:', todasTabelas.map(t => t.table_name))
    }
  } catch (e) {
    console.log('Erro ao buscar tabelas:', e.message)
  }
}

investigarDados().catch(console.error)