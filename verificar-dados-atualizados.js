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

async function verificarDadosAtualizados() {
  console.log('🔍 VERIFICAÇÃO DE DADOS ATUALIZADOS\n')
  console.log('═'.repeat(100))
  
  // Buscar empresa RB
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nome')
    .ilike('nome', '%RB%')
    .single()

  console.log(`\n✅ Empresa: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}`)
  
  // Buscar todos os registros
  console.log('\n📊 DADOS DE LUCRO PRESUMIDO - 2025')
  console.log('─'.repeat(100))
  
  const { data: registros } = await supabase
    .from('dados_comparativos_mensais')
    .select('*')
    .eq('empresa_id', empresa.id)
    .eq('regime', 'lucro_presumido')
    .eq('ano', 2025)
    .order('mes')
  
  if (!registros || registros.length === 0) {
    console.log('⚠️  Nenhum registro encontrado')
    return
  }
  
  console.log(`\nTotal: ${registros.length} registros\n`)
  
  registros.forEach((reg, idx) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const mesNome = meses[parseInt(reg.mes) - 1]
    
    const total = (reg.icms || 0) + (reg.pis || 0) + (reg.cofins || 0) + 
                   (reg.irpj || 0) + (reg.csll || 0) + (reg.iss || 0) + (reg.outros || 0)
    
    const dataAtualizacao = new Date(reg.atualizado_em)
    const agora = new Date()
    const diffMinutos = Math.floor((agora - dataAtualizacao) / 1000 / 60)
    
    const recenteTag = diffMinutos < 5 ? '🆕 ATUALIZADO AGORA!' : 
                       diffMinutos < 60 ? '🕐 Atualizado recentemente' : 
                       diffMinutos < 1440 ? '📅 Atualizado hoje' : ''
    
    console.log(`${idx + 1}. ${mesNome}/2025 ${recenteTag}`)
    console.log(`   ─────────────────────────────────────────────────────────────`)
    console.log(`   📌 ID: ${reg.id}`)
    console.log(`   💰 Receita: R$ ${reg.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   🏛️  ICMS:    R$ ${(reg.icms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   💼 PIS:     R$ ${(reg.pis || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   💵 COFINS:  R$ ${(reg.cofins || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   🏢 IRPJ:    R$ ${(reg.irpj || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   📊 CSLL:    R$ ${(reg.csll || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   📝 Observações: ${reg.observacoes || 'Sem observações'}`)
    console.log(`   ─────────────────────────────────────────────────────────────`)
    console.log(`   ✅ TOTAL: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`   🕐 Atualizado: ${dataAtualizacao.toLocaleString('pt-BR')} (${diffMinutos} min atrás)`)
    console.log()
  })
  
  console.log('═'.repeat(100))
  console.log('\n💡 Procure por 🆕 para ver registros atualizados recentemente')
}

verificarDadosAtualizados()
