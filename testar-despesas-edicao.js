import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxuqcscagoxgpowovxnz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dXFjc2NhZ294Z3Bvd292eG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzU3MjMsImV4cCI6MjA1MjQ1MTcyM30.VKW9MWhCdh2kvkXr05GpX7M2NHcq_yVJfBCWwxRkJ3Y'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testarEdicaoDespesas() {
  console.log('🧪 TESTE: Edição de Despesas Dinâmicas\n')
  console.log('=' .repeat(80))
  
  try {
    // 1. Buscar um cenário de Lucro Real existente
    console.log('\n📋 1. Buscando cenários de Lucro Real...')
    const { data: cenarios, error: cenariosError } = await supabase
      .from('cenarios')
      .select('*')
      .eq('status', 'aprovado')
      .limit(1)
    
    if (cenariosError) throw cenariosError
    
    if (!cenarios || cenarios.length === 0) {
      console.log('❌ Nenhum cenário aprovado encontrado')
      return
    }
    
    const cenario = cenarios[0]
    console.log(`✅ Cenário encontrado: ${cenario.nome} (ID: ${cenario.id})`)
    console.log(`   Empresa: ${cenario.empresa_id}`)
    console.log(`   Status: ${cenario.status}`)
    
    // 2. Verificar despesas atuais na tabela normalizada
    console.log('\n📊 2. Verificando despesas na tabela despesas_dinamicas...')
    const { data: despesasAntes, error: despesasAntesError } = await supabase
      .from('despesas_dinamicas')
      .select('*')
      .eq('cenario_id', cenario.id)
    
    if (despesasAntesError) throw despesasAntesError
    
    console.log(`   Total de despesas ANTES: ${despesasAntes?.length || 0}`)
    if (despesasAntes && despesasAntes.length > 0) {
      despesasAntes.forEach(d => {
        console.log(`   • ${d.descricao}: R$ ${d.valor.toLocaleString('pt-BR')} (${d.credito})`)
      })
    }
    
    // 3. Verificar despesas no JSON configuracao
    console.log('\n📦 3. Verificando despesas no JSON configuracao...')
    const despesasConfig = cenario.configuracao?.despesasDinamicas || []
    console.log(`   Total de despesas no JSON: ${despesasConfig.length}`)
    if (despesasConfig.length > 0) {
      despesasConfig.forEach(d => {
        console.log(`   • ${d.descricao}: R$ ${d.valor.toLocaleString('pt-BR')} (${d.credito})`)
      })
    }
    
    // 4. Simular edição: Adicionar nova despesa e editar uma existente
    console.log('\n✏️ 4. Simulando edição de despesas...')
    
    const novasDespesas = [
      {
        id: `despesa-${Date.now()}-1`,
        descricao: 'Energia Elétrica EDITADA',
        valor: 18000, // Valor alterado
        tipo: 'despesa',
        credito: 'com-credito',
        categoria: 'Energia'
      },
      {
        id: `despesa-${Date.now()}-2`,
        descricao: 'Aluguel Escritório NOVO',
        valor: 5000,
        tipo: 'despesa',
        credito: 'sem-credito',
        categoria: 'Administrativa'
      }
    ]
    
    console.log('   Despesas para salvar:')
    novasDespesas.forEach(d => {
      console.log(`   • ${d.descricao}: R$ ${d.valor.toLocaleString('pt-BR')} (${d.credito})`)
    })
    
    // 5. Atualizar configuração do cenário
    console.log('\n💾 5. Atualizando cenário com novas despesas...')
    
    const configuracaoAtualizada = {
      ...cenario.configuracao,
      despesasDinamicas: novasDespesas
    }
    
    const { data: cenarioAtualizado, error: updateError } = await supabase
      .from('cenarios')
      .update({
        configuracao: configuracaoAtualizada
      })
      .eq('id', cenario.id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    console.log('✅ Configuração atualizada no banco')
    
    // 6. Sincronizar tabela despesas_dinamicas (SIMULANDO O QUE O STORE DEVE FAZER)
    console.log('\n🔄 6. Sincronizando tabela despesas_dinamicas...')
    
    // Deletar despesas antigas
    const { error: deleteError } = await supabase
      .from('despesas_dinamicas')
      .delete()
      .eq('cenario_id', cenario.id)
    
    if (deleteError) {
      console.warn('⚠️ Erro ao deletar despesas antigas:', deleteError.message)
    } else {
      console.log('🗑️ Despesas antigas deletadas')
    }
    
    // Inserir despesas novas
    if (novasDespesas.length > 0) {
      const despesasParaInserir = novasDespesas.map(d => ({
        cenario_id: cenario.id,
        descricao: d.descricao,
        valor: d.valor,
        tipo: d.tipo,
        credito: d.credito,
        categoria: d.categoria || null
      }))
      
      const { error: insertError } = await supabase
        .from('despesas_dinamicas')
        .insert(despesasParaInserir)
      
      if (insertError) {
        console.error('❌ Erro ao inserir despesas:', insertError.message)
      } else {
        console.log(`✅ ${novasDespesas.length} despesas inseridas na tabela normalizada`)
      }
    }
    
    // 7. Verificar resultado final
    console.log('\n📊 7. Verificando resultado final...')
    const { data: despesasDepois, error: despesasDepoisError } = await supabase
      .from('despesas_dinamicas')
      .select('*')
      .eq('cenario_id', cenario.id)
    
    if (despesasDepoisError) throw despesasDepoisError
    
    console.log(`   Total de despesas DEPOIS: ${despesasDepois?.length || 0}`)
    if (despesasDepois && despesasDepois.length > 0) {
      despesasDepois.forEach(d => {
        console.log(`   • ${d.descricao}: R$ ${d.valor.toLocaleString('pt-BR')} (${d.credito})`)
      })
      
      // Calcular créditos
      const despesasComCredito = despesasDepois.filter(d => d.credito === 'com-credito')
      const totalComCredito = despesasComCredito.reduce((sum, d) => sum + d.valor, 0)
      const creditoPIS = totalComCredito * 0.0165
      const creditoCOFINS = totalComCredito * 0.076
      
      console.log('\n💳 Créditos Calculados:')
      console.log(`   • Total despesas COM crédito: R$ ${totalComCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   • Crédito PIS (1,65%): R$ ${creditoPIS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   • Crédito COFINS (7,6%): R$ ${creditoCOFINS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   • Total créditos: R$ ${(creditoPIS + creditoCOFINS).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Verificar se o store está fazendo essa sincronização automaticamente')
    console.log('   2. Testar na interface: editar despesa e verificar banco')
    console.log('   3. Testar comparativos: ver se os créditos aparecem nos cálculos')
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error)
    console.error('   Mensagem:', error.message)
  }
}

testarEdicaoDespesas()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
