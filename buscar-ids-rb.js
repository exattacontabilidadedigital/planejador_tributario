import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function buscarIdsRB() {
  console.log('🔍 Buscando IDs da RB ACESSÓRIOS...\n')
  
  // Buscar empresa RB
  const { data: empresa, error: empresaError } = await supabase
    .from('empresas')
    .select('id, nome')
    .ilike('nome', '%RB%')
    .single()

  if (empresaError || !empresa) {
    console.error('❌ Erro ao buscar empresa:', empresaError)
    process.exit(1)
  }

  console.log(`✅ Empresa: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}\n`)

  // Buscar registros de Lucro Presumido
  const { data: registros, error } = await supabase
    .from('dados_comparativos_mensais')
    .select('id, mes, regime, receita, icms, pis, cofins, irpj, csll, iss')
    .eq('empresa_id', empresa.id)
    .eq('regime', 'lucro_presumido')
    .eq('ano', 2025)
    .order('mes')

  if (error) {
    console.error('❌ Erro ao buscar registros:', error)
    process.exit(1)
  }

  console.log(`📊 Registros encontrados: ${registros.length}`)
  console.log('═'.repeat(80))

  registros.forEach((reg, idx) => {
    const total = (reg.icms || 0) + (reg.pis || 0) + (reg.cofins || 0) + 
                   (reg.irpj || 0) + (reg.csll || 0) + (reg.iss || 0)
    
    console.log(`\n${idx + 1}. Mês: ${reg.mes} | Regime: ${reg.regime}`)
    console.log(`   ID: ${reg.id}`)
    console.log(`   Receita: R$ ${(reg.receita || 0).toLocaleString('pt-BR')}`)
    console.log(`   Total Impostos: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  })

  console.log('\n' + '═'.repeat(80))
  console.log('\n💡 Use esses IDs no script de atualização!')
}

buscarIdsRB()
