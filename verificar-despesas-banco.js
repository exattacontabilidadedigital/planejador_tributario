import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxuqcscagoxgpowovxnz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dXFjc2NhZ294Z3Bvd292eG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzU3MjMsImV4cCI6MjA1MjQ1MTcyM30.VKW9MWhCdh2kvkXr05GpX7M2NHcq_yVJfBCWwxRkJ3Y'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarDespesas() {
  console.log('🔍 Verificando despesas no banco de dados...\n')
  console.log('═'.repeat(80))
  
  try {
    // 1. Buscar todos os cenários
    console.log('\n📋 1. Buscando cenários...')
    const { data: cenarios, error: cenariosError } = await supabase
      .from('cenarios')
      .select('id, nome, empresa_id, configuracao')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (cenariosError) throw cenariosError
    
    console.log(`✅ Encontrados ${cenarios?.length || 0} cenários recentes\n`)
    
    if (!cenarios || cenarios.length === 0) {
      console.log('❌ Nenhum cenário encontrado')
      return
    }
    
    // 2. Para cada cenário, verificar despesas
    for (const cenario of cenarios) {
      console.log('\n' + '─'.repeat(80))
      console.log(`📊 Cenário: ${cenario.nome} (ID: ${cenario.id})`)
      console.log('─'.repeat(80))
      
      // 2a. Verificar despesas na tabela normalizada
      const { data: despesasTabela, error: despesasTabelaError } = await supabase
        .from('despesas_dinamicas')
        .select('*')
        .eq('cenario_id', cenario.id)
        .order('created_at', { ascending: false })
      
      if (despesasTabelaError) {
        console.error('❌ Erro ao buscar despesas da tabela:', despesasTabelaError.message)
      }
      
      console.log(`\n🗄️  Tabela despesas_dinamicas: ${despesasTabela?.length || 0} registros`)
      if (despesasTabela && despesasTabela.length > 0) {
        despesasTabela.forEach((d, idx) => {
          console.log(`   ${idx + 1}. ${d.descricao}: R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${d.credito}) - ${d.tipo}`)
          console.log(`      ID: ${d.id}`)
          console.log(`      Criado: ${new Date(d.created_at).toLocaleString('pt-BR')}`)
        })
      } else {
        console.log('   ⚠️  Nenhuma despesa encontrada na tabela normalizada!')
      }
      
      // 2b. Verificar despesas no JSON configuracao
      const despesasConfig = cenario.configuracao?.despesasDinamicas || []
      console.log(`\n📦 JSON configuracao.despesasDinamicas: ${despesasConfig.length} registros`)
      if (despesasConfig.length > 0) {
        despesasConfig.forEach((d, idx) => {
          console.log(`   ${idx + 1}. ${d.descricao}: R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${d.credito}) - ${d.tipo}`)
          console.log(`      ID local: ${d.id}`)
        })
      } else {
        console.log('   ⚠️  Nenhuma despesa encontrada no JSON!')
      }
      
      // 2c. Comparar
      if (despesasTabela?.length !== despesasConfig.length) {
        console.log(`\n⚠️  ATENÇÃO: Dessincronia detectada!`)
        console.log(`   • Tabela normalizada: ${despesasTabela?.length || 0} despesas`)
        console.log(`   • JSON configuracao: ${despesasConfig.length} despesas`)
        console.log(`   • Diferença: ${Math.abs((despesasTabela?.length || 0) - despesasConfig.length)} despesas`)
      } else if (despesasConfig.length > 0) {
        console.log(`\n✅ Sincronização OK: ${despesasConfig.length} despesas em ambos os locais`)
      }
      
      // Procurar especificamente por "dfadfda"
      const temDfadfdaTabela = despesasTabela?.some(d => d.descricao.toLowerCase().includes('dfad'))
      const temDfadfdaConfig = despesasConfig.some(d => d.descricao.toLowerCase().includes('dfad'))
      
      if (temDfadfdaConfig || temDfadfdaTabela) {
        console.log(`\n🔍 Despesa "dfadfda" encontrada:`)
        console.log(`   • Na tabela normalizada: ${temDfadfdaTabela ? '✅ SIM' : '❌ NÃO'}`)
        console.log(`   • No JSON configuracao: ${temDfadfdaConfig ? '✅ SIM' : '❌ NÃO'}`)
        
        if (temDfadfdaConfig && !temDfadfdaTabela) {
          console.log(`\n⚠️  PROBLEMA IDENTIFICADO:`)
          console.log(`   A despesa "dfadfda" está no JSON mas NÃO foi inserida na tabela!`)
          console.log(`   Isso significa que a sincronização não está funcionando.`)
        }
      }
    }
    
    console.log('\n' + '═'.repeat(80))
    console.log('✅ Verificação concluída!')
    console.log('\n📝 Próximo passo:')
    console.log('   1. Abra o console do navegador (F12)')
    console.log('   2. Clique em "Salvar" no cenário')
    console.log('   3. Verifique se aparecem os logs de sincronização')
    console.log('   4. Me mostre o que aparece no console')
    
  } catch (error) {
    console.error('\n❌ ERRO:', error)
    console.error('   Mensagem:', error.message)
  }
}

verificarDespesas()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
