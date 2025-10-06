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

async function analisarTabelas() {
  console.log('📊 ANÁLISE COMPLETA DAS TABELAS\n')
  console.log('═'.repeat(100))
  
  // 1. TABELA: dados_comparativos_mensais
  console.log('\n1️⃣  TABELA: dados_comparativos_mensais')
  console.log('   Objetivo: Dados manuais de Lucro Presumido e Simples Nacional')
  console.log('   ' + '─'.repeat(90))
  
  const { data: dadosComp, error: errorComp } = await supabase
    .from('dados_comparativos_mensais')
    .select('*')
    .order('ano', { ascending: false })
    .order('mes')
  
  if (errorComp) {
    console.log('   ❌ Erro:', errorComp.message)
  } else if (!dadosComp || dadosComp.length === 0) {
    console.log('   ⚠️  VAZIA - Nenhum dado manual inserido')
  } else {
    console.log(`   ✅ TEM DADOS - ${dadosComp.length} registros encontrados\n`)
    
    // Agrupar por empresa
    const porEmpresa = dadosComp.reduce((acc, d) => {
      if (!acc[d.empresa_id]) acc[d.empresa_id] = []
      acc[d.empresa_id].push(d)
      return acc
    }, {})
    
    for (const [empresaId, registros] of Object.entries(porEmpresa)) {
      // Buscar nome da empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('nome')
        .eq('id', empresaId)
        .single()
      
      console.log(`   📌 Empresa: ${empresa?.nome || empresaId}`)
      registros.forEach(r => {
        const total = (r.icms || 0) + (r.pis || 0) + (r.cofins || 0) + 
                       (r.irpj || 0) + (r.csll || 0) + (r.iss || 0) + (r.outros || 0)
        console.log(`      - Mês ${r.mes}/${r.ano} (${r.regime}): R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      })
      console.log()
    }
  }
  
  // 2. TABELA: comparativos
  console.log('\n2️⃣  TABELA: comparativos')
  console.log('   Objetivo: Análises comparativas salvas entre cenários')
  console.log('   ' + '─'.repeat(90))
  
  const { data: comparativos, error: errorComparativos } = await supabase
    .from('comparativos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (errorComparativos) {
    console.log('   ❌ Erro:', errorComparativos.message)
  } else if (!comparativos || comparativos.length === 0) {
    console.log('   ⚠️  VAZIA - Nenhuma análise comparativa salva')
    console.log('   💡 Para criar: Clique em "Nova Análise Comparativa" na página de Comparativos')
  } else {
    console.log(`   ✅ TEM DADOS - ${comparativos.length} análises salvas\n`)
    comparativos.forEach((c, idx) => {
      console.log(`   ${idx + 1}. ${c.nome}`)
      console.log(`      Descrição: ${c.descricao || 'Sem descrição'}`)
      console.log(`      Cenários: ${c.cenario_ids?.length || 0} cenários`)
      console.log(`      Criado em: ${new Date(c.created_at).toLocaleString('pt-BR')}`)
      console.log()
    })
  }
  
  // 3. VIEW: comparativos_detalhados
  console.log('\n3️⃣  VIEW: comparativos_detalhados')
  console.log('   Objetivo: Consulta que junta comparativos + cenários + empresas')
  console.log('   ' + '─'.repeat(90))
  
  const { data: viewData, error: errorView } = await supabase
    .from('comparativos_detalhados')
    .select('*')
  
  if (errorView) {
    console.log('   ❌ Erro:', errorView.message)
  } else if (!viewData || viewData.length === 0) {
    console.log('   ⚠️  VAZIA - Depende da tabela `comparativos`')
  } else {
    console.log(`   ✅ TEM DADOS - ${viewData.length} registros\n`)
    viewData.forEach((v, idx) => {
      console.log(`   ${idx + 1}. ${v.nome} (${v.total_cenarios} cenários)`)
      if (v.cenarios_info) {
        v.cenarios_info.forEach(c => {
          console.log(`      - ${c.nome} (${c.empresa} - ${c.ano})`)
        })
      }
      console.log()
    })
  }
  
  console.log('═'.repeat(100))
  console.log('\n📋 RESUMO:\n')
  console.log('1️⃣  dados_comparativos_mensais: Para adicionar dados de Lucro Presumido/Simples')
  console.log('    ↳ Use a aba "Adicionar Dados" na página Comparativos')
  console.log()
  console.log('2️⃣  comparativos: Para salvar análises entre cenários de Lucro Real')
  console.log('    ↳ Use o botão "Nova Análise Comparativa" na página Comparativos')
  console.log()
  console.log('3️⃣  comparativos_detalhados: View automática (não precisa inserir dados)')
  console.log('    ↳ Mostra informações detalhadas das análises salvas')
  console.log()
  console.log('═'.repeat(100))
}

analisarTabelas()
