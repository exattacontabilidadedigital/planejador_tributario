// Teste rápido da conectividade com Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxrtplvkvulwhengeune.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cnRwbHZrdnVsd2hlbmdldW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjY2NzEsImV4cCI6MjA3NTEwMjY3MX0.1Ekwv-xKO8DXwDXzIhWBBDd3wMOeNbsNKqiVoGhwrJI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Verificar tabelas disponíveis
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('❌ Erro ao buscar tabelas:', tablesError)
    } else {
      console.log('✅ Tabelas encontradas:', tables.map(t => t.table_name))
    }
    
    // Testar query específica na tabela cenarios
    const { data: cenarios, error: cenariosError } = await supabase
      .from('cenarios')
      .select('id, nome, empresa_id, status')
      .limit(5)
    
    if (cenariosError) {
      console.error('❌ Erro ao buscar cenários:', cenariosError)
    } else {
      console.log('✅ Cenários encontrados:', cenarios?.length || 0, cenarios)
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error)
  }
}

testConnection()