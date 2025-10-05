// Teste para listar todas as empresas
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxrtplvkvulwhengeune.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cnRwbHZrdnVsd2hlbmdldW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjY2NzEsImV4cCI6MjA3NTEwMjY3MX0.1Ekwv-xKO8DXwDXzIhWBBDd3wMOeNbsNKqiVoGhwrJI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function listEmpresas() {
  try {
    console.log('🔍 Listando todas as empresas...')
    
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, nome, cnpj')
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error)
    } else {
      console.log('✅ Empresas encontradas:', empresas?.length || 0)
      empresas?.forEach(empresa => {
        console.log(`  - ID: ${empresa.id}, Nome: ${empresa.nome}, CNPJ: ${empresa.cnpj}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error)
  }
}

listEmpresas()