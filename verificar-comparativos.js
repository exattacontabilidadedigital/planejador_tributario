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

async function verificarComparativos() {
  console.log('🔍 Verificando tabela de comparativos salvos...\n')
  
  // Buscar empresa EMA MATERIAL
  const { data: empresas } = await supabase
    .from('empresas')
    .select('*')
    .ilike('nome', '%EMA MATERIAL%')
  
  if (!empresas || empresas.length === 0) {
    console.error('❌ Empresa não encontrada!')
    return
  }
  
  const empresa = empresas[0]
  
  // Verificar tabela comparativos_analise
  const { data: comparativos, error } = await supabase
    .from('comparativos_analise')
    .select('*')
    .eq('empresa_id', empresa.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('❌ Erro ao buscar comparativos:', error.message)
    return
  }
  
  if (!comparativos || comparativos.length === 0) {
    console.log('⚠️  Nenhum comparativo salvo encontrado!')
    console.log('   O gráfico deve estar sendo gerado em tempo real.\n')
    return
  }
  
  console.log(`📊 Total de comparativos salvos: ${comparativos.length}\n`)
  console.log('═'.repeat(100))
  
  comparativos.forEach((comp, index) => {
    console.log(`\n${index + 1}. ${comp.nome}`)
    console.log(`   ID: ${comp.id}`)
    console.log(`   Ano: ${comp.ano}`)
    console.log(`   Criado em: ${new Date(comp.created_at).toLocaleString('pt-BR')}`)
    console.log(`   ─────────────────────────────────────────────────`)
    
    // Verificar se tem dados salvos
    const analise = comp.analise || {}
    const resultados = analise.resultados || {}
    
    if (Object.keys(resultados).length === 0) {
      console.log(`   ⚠️  SEM RESULTADOS salvos`)
    } else {
      console.log(`   📋 Resultados salvos:`)
      Object.entries(resultados).forEach(([regime, dados]) => {
        if (regime.startsWith('lucro_real')) {
          const totalImpostos = dados.totalImpostos || 0
          console.log(`      • ${regime}: R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
          
          // Verificar valores de Janeiro
          if (dados.dadosMensais && dados.dadosMensais.length > 0) {
            const janeiro = dados.dadosMensais.find(d => d.mes === 1)
            if (janeiro) {
              console.log(`        - Janeiro: R$ ${(janeiro.totalImpostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
              if (janeiro.totalImpostos === 614245) {
                console.log(`        ⚠️  VALOR ANTIGO (ERRADO) detectado!`)
              } else if (janeiro.totalImpostos === 597514) {
                console.log(`        ✅ VALOR CORRETO!`)
              }
            }
          }
        }
      })
    }
  })
  
  console.log('\n' + '═'.repeat(100))
  console.log('\n💡 SOLUÇÃO:')
  console.log('   Se existem comparativos salvos com valores antigos:')
  console.log('   1️⃣  DELETE os comparativos antigos')
  console.log('   2️⃣  Recrie o comparativo no sistema')
  console.log('   3️⃣  Os novos valores corretos serão usados')
}

verificarComparativos().catch(console.error)
