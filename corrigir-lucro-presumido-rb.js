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

async function corrigirLucroPresumidoRB() {
  console.log('🔧 Corrigindo Lucro Presumido da RB ACESSÓRIOS...\n')
  
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
  console.log('═'.repeat(80))

  // Valores REAIS do Lucro Presumido (do gráfico/screenshot)
  const meses = [
    {
      mes: '01',
      nome: 'Janeiro',
      receita: 1800000, // Mantém a receita existente
      total: 7000,
      icms: 4140,
      pis: 990,
      cofins: 1368,
      irpj: 354,
      csll: 148
    },
    {
      mes: '02',
      nome: 'Fevereiro',
      receita: 1500000,
      total: 3500,
      icms: 2070,
      pis: 495,
      cofins: 684,
      irpj: 177,
      csll: 74
    },
    {
      mes: '03',
      nome: 'Março',
      receita: 1950000,
      total: 4200,
      icms: 2484,
      pis: 594,
      cofins: 821,
      irpj: 213,
      csll: 88
    }
  ]

  // 1. ATUALIZAR Janeiro (já existe)
  console.log('\n📝 1. Atualizando Janeiro...')
  const janeiro = meses[0]
  
  const { error: updateError } = await supabase
    .from('dados_comparativos_mensais')
    .update({
      receita: janeiro.receita,
      icms: janeiro.icms,
      pis: janeiro.pis,
      cofins: janeiro.cofins,
      irpj: janeiro.irpj,
      csll: janeiro.csll,
      iss: 0,
      outros: 0,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', 'eb96a66a-5bdc-43f4-89e0-ae7a4563f50d')

  if (updateError) {
    console.error('❌ Erro ao atualizar Janeiro:', updateError)
  } else {
    console.log(`   ✅ Janeiro atualizado: Total R$ ${janeiro.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  }

  // 2. CRIAR Fevereiro e Março
  for (let i = 1; i < meses.length; i++) {
    const mes = meses[i]
    console.log(`\n📝 ${i + 1}. Criando ${mes.nome}...`)

    const { error: insertError } = await supabase
      .from('dados_comparativos_mensais')
      .insert({
        empresa_id: empresa.id,
        mes: mes.mes,
        ano: 2025,
        regime: 'lucro_presumido',
        receita: mes.receita,
        icms: mes.icms,
        pis: mes.pis,
        cofins: mes.cofins,
        irpj: mes.irpj,
        csll: mes.csll,
        iss: 0,
        outros: 0
      })

    if (insertError) {
      console.error(`❌ Erro ao criar ${mes.nome}:`, insertError)
    } else {
      console.log(`   ✅ ${mes.nome} criado: Total R$ ${mes.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }
  }

  console.log('\n' + '═'.repeat(80))
  console.log('\n✅ CONCLUÍDO!')
  console.log('\n📊 Verificando dados finais...\n')

  // Verificar dados atualizados
  const { data: registros } = await supabase
    .from('dados_comparativos_mensais')
    .select('mes, receita, icms, pis, cofins, irpj, csll, iss, outros')
    .eq('empresa_id', empresa.id)
    .eq('regime', 'lucro_presumido')
    .eq('ano', 2025)
    .in('mes', ['01', '02', '03'])
    .order('mes')

  if (registros && registros.length > 0) {
    console.log('📈 Dados Atualizados:')
    registros.forEach(reg => {
      const total = (reg.icms || 0) + (reg.pis || 0) + (reg.cofins || 0) + 
                     (reg.irpj || 0) + (reg.csll || 0) + (reg.iss || 0) + (reg.outros || 0)
      
      const mesNome = ['Janeiro', 'Fevereiro', 'Março'][parseInt(reg.mes) - 1]
      console.log(`   ${mesNome}: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ✅`)
    })
  }

  console.log('\n💡 PRÓXIMOS PASSOS:')
  console.log('   1. Delete os comparativos salvos (cache)')
  console.log('   2. Crie um novo comparativo')
  console.log('   3. O gráfico mostrará:')
  console.log('      - Lucro Real (vermelho): ~R$ 597.514, R$ 480.295, R$ 757.720')
  console.log('      - Lucro Presumido (azul): R$ 7.000, R$ 3.500, R$ 4.200 ✅')
}

corrigirLucroPresumidoRB()
