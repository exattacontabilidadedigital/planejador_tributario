import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Verificando dados de RB ACESSÓRIOS - Lucro Presumido...\n')

// Buscar empresa RB Acessórios
const { data: empresa, error: empresaError } = await supabase
  .from('empresas')
  .select('id, nome')
  .ilike('nome', '%RB%')
  .single()

if (empresaError || !empresa) {
  console.error('❌ Erro ao buscar empresa:', empresaError)
  process.exit(1)
}

console.log(`✅ Empresa encontrada: ${empresa.nome}`)
console.log(`   ID: ${empresa.id}\n`)

// Buscar dados de Lucro Presumido
const { data: registros, error } = await supabase
  .from('dados_comparativos_mensais')
  .select('*')
  .eq('empresa_id', empresa.id)
  .eq('regime', 'lucro_presumido')
  .eq('ano', 2025)
  .in('mes', ['01', '02', '03'])
  .order('mes')

if (error) {
  console.error('❌ Erro ao buscar dados:', error)
  process.exit(1)
}

if (!registros || registros.length === 0) {
  console.log('⚠️  Nenhum registro encontrado!')
  process.exit(0)
}

console.log(`📊 Registros de Lucro Presumido (${registros.length} encontrados):`)
console.log('═'.repeat(100))

registros.forEach(registro => {
  const total = (registro.icms || 0) +
                (registro.pis || 0) +
                (registro.cofins || 0) +
                (registro.irpj || 0) +
                (registro.csll || 0) +
                (registro.iss || 0) +
                (registro.outros || 0)

  const mesNome = ['Janeiro', 'Fevereiro', 'Março'][parseInt(registro.mes) - 1]

  console.log(`\n📅 ${mesNome} (${registro.mes}/${registro.ano})`)
  console.log(`   ID: ${registro.id}`)
  console.log(`   Receita: R$ ${(registro.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   Impostos:`)
  console.log(`      ICMS:   R$ ${(registro.icms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`      PIS:    R$ ${(registro.pis || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`      COFINS: R$ ${(registro.cofins || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`      IRPJ:   R$ ${(registro.irpj || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`      CSLL:   R$ ${(registro.csll || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`      ISS:    R$ ${(registro.iss || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`      Outros: R$ ${(registro.outros || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   ──────────────────────────────────`)
  console.log(`   TOTAL: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${total > 0 ? '✅' : '❌'}`)
  console.log(`   Atualizado em: ${new Date(registro.atualizado_em).toLocaleString('pt-BR')}`)
})

console.log('\n' + '═'.repeat(100))
console.log('✅ Verificação concluída!')
