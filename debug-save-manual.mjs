import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase - usando credenciais corretas do .env.local
const supabaseUrl = 'https://qxrtplvkvulwhengeune.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cnRwbHZrdnVsd2hlbmdldW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjY2NzEsImV4cCI6MjA3NTEwMjY3MX0.1Ekwv-xKO8DXwDXzIhWBBDd3wMOeNbsNKqiVoGhwrJI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testarInsercaoManual() {
  console.log('🔍 Testando inserção manual de dados...')
  
  const dadosTest = {
    empresa_id: '65055d21-63c6-4e84-9c53-d462fc0ead29', // UUID real da empresa Tech Solutions Ltda
    mes: '01', // CORREÇÃO: usar string ao invés de número
    ano: 2024,
    regime: 'lucro_presumido', // CORREÇÃO: usar snake_case ao invés de UPPER_CASE
    receita: 50000,
    icms: 2500,
    pis: 825,
    cofins: 3800,
    irpj: 1875,
    csll: 1125,
    iss: 0,
    outros: 0,
    observacoes: 'Teste manual de inserção'
  }
  
  console.log('📝 Dados a serem inseridos:', dadosTest)
  
  try {
    const { data, error } = await supabase
      .from('dados_comparativos_mensais')
      .insert(dadosTest)
      .select()
      .single()
    
    console.log('✅ Resultado da inserção:')
    console.log('Data:', data)
    console.log('Error:', error)
    
    if (error) {
      console.error('❌ Erro detalhado:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    }
    
  } catch (err) {
    console.error('❌ Erro capturado no catch:', err)
  }
}

testarInsercaoManual()