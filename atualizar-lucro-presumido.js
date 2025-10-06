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

async function atualizarLucroPresumido() {
  console.log('🔧 Atualizando dados de Lucro Presumido...\n')
  
  // IDs dos registros para atualizar com VALORES REAIS
  const dadosParaAtualizar = [
    {
      id: '6674f75f-b350-43c9-8a2b-18e5318407a8',
      mes: 1,
      nome: 'Janeiro',
      receita: 1800000,
      total_impostos: 7000.00, // VALOR REAL do gráfico
      impostos_detalhados: {
        icms: 4140,
        pis: 990,
        cofins: 1368,
        irpj: 576,
        csll: 259.2,
        iss: 0
      }
    },
    {
      id: '4982eaed-2b92-4069-9956-ffa65fa50773',
      mes: 2,
      nome: 'Fevereiro',
      receita: 1500000,
      total_impostos: 3500.00, // VALOR REAL do gráfico
      impostos_detalhados: {
        icms: 3450,
        pis: 825,
        cofins: 1140,
        irpj: 480,
        csll: 216,
        iss: 0
      }
    },
    {
      id: '658582df-355a-4226-9fc4-8877fe06b167',
      mes: 3,
      nome: 'Março',
      receita: 1950000,
      total_impostos: 4200.00, // VALOR REAL do gráfico
      impostos_detalhados: {
        icms: 4485,
        pis: 1072.50,
        cofins: 1482,
        irpj: 624,
        csll: 280.80,
        iss: 0
      }
    }
  ]
  
  console.log('⚠️  ATENÇÃO: Este script usará valores ESTIMADOS!')
  console.log('   Você precisa fornecer os valores REAIS de Lucro Presumido.\n')
  console.log('═'.repeat(80))
  
  for (const dado of dadosParaAtualizar) {
    console.log(`\n🔧 Atualizando: ${dado.nome}`)
    console.log(`   ID: ${dado.id}`)
    console.log(`   Mês: ${dado.mes}`)
    console.log(`   Receita: R$ ${dado.receita.toLocaleString('pt-BR')}`)
    console.log(`   Total Impostos: R$ ${dado.total_impostos.toLocaleString('pt-BR')}`)
    
    const { error } = await supabase
      .from('dados_comparativos_mensais')
      .update({
        mes: dado.mes.toString().padStart(2, '0'), // Formato: '01', '02', '03'
        receita: dado.receita,
        icms: dado.impostos_detalhados.icms,
        pis: dado.impostos_detalhados.pis,
        cofins: dado.impostos_detalhados.cofins,
        irpj: dado.impostos_detalhados.irpj,
        csll: dado.impostos_detalhados.csll,
        iss: dado.impostos_detalhados.iss,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', dado.id)
    
    if (error) {
      console.error(`   ❌ Erro: ${error.message}`)
    } else {
      console.log(`   ✅ Atualizado com sucesso!`)
    }
  }
  
  console.log('\n' + '═'.repeat(80))
  console.log('\n✅ ATUALIZAÇÃO CONCLUÍDA!')
  console.log('\n📋 PRÓXIMOS PASSOS:')
  console.log('   1. Delete o comparativo atual')
  console.log('   2. Crie um novo comparativo')
  console.log('   3. O gráfico mostrará os valores corretos!')
  console.log('\n💡 IMPORTANTE: Substitua os valores acima pelos REAIS do Lucro Presumido!')
}

atualizarLucroPresumido().catch(console.error)
