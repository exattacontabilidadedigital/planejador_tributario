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

async function testarBuscaDados() {
  console.log('🔍 Testando busca de dados para o gráfico...\n')
  
  // Buscar empresa RB
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nome')
    .ilike('nome', '%RB%')
    .single()

  console.log(`✅ Empresa: ${empresa.nome}\n`)

  // Simular busca do serviço - LUCRO REAL
  console.log('📊 1. LUCRO REAL')
  console.log('═'.repeat(80))
  
  const { data: cenarios } = await supabase
    .from('cenarios')
    .select('id, mes, resultados')
    .eq('empresa_id', empresa.id)
    .eq('tipo', 'mensal')
    .eq('ano', 2025)
    .in('mes', [1, 2, 3])
    .order('mes')

  if (cenarios) {
    cenarios.forEach(c => {
      const resultados = c.resultados || {}
      const impostos = {
        icms: resultados.icmsAPagar || 0,
        pis: resultados.pisAPagar || 0,
        cofins: resultados.cofinsAPagar || 0,
        irpj: resultados.irpjAPagar || 0,
        csll: resultados.csllAPagar || 0,
        iss: resultados.issAPagar || 0
      }
      const total = Object.values(impostos).reduce((sum, val) => sum + val, 0)
      
      const mesNome = ['Janeiro', 'Fevereiro', 'Março'][c.mes - 1]
      console.log(`   ${mesNome}: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    })
  }

  // Simular busca do serviço - LUCRO PRESUMIDO
  console.log('\n📊 2. LUCRO PRESUMIDO')
  console.log('═'.repeat(80))
  
  const { data: registros } = await supabase
    .from('dados_comparativos_mensais')
    .select('mes, icms, pis, cofins, irpj, csll, iss, outros')
    .eq('empresa_id', empresa.id)
    .eq('regime', 'lucro_presumido')
    .eq('ano', 2025)
    .in('mes', ['01', '02', '03'])
    .order('mes')

  if (registros) {
    registros.forEach(reg => {
      // Simula lógica do serviço buscarDadosManuais
      const total = (reg.icms || 0) + (reg.pis || 0) + (reg.cofins || 0) + 
                     (reg.irpj || 0) + (reg.csll || 0) + (reg.iss || 0) + (reg.outros || 0)
      
      const mesNome = ['Janeiro', 'Fevereiro', 'Março'][parseInt(reg.mes) - 1]
      console.log(`   ${mesNome}: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    })
  }

  console.log('\n' + '═'.repeat(80))
  console.log('\n✅ BUSCA SIMULADA CONCLUÍDA!')
  console.log('\n📈 O gráfico deve mostrar:')
  console.log('   - Lucro Real (vermelho): valores dos cenários')
  console.log('   - Lucro Presumido (azul): R$ 7.000, R$ 3.500, R$ 4.200 ✅')
}

testarBuscaDados()
