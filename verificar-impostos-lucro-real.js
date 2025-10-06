import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  console.log('Certifique-se que .env.local existe com:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarImpostosLucroReal() {
  console.log('🔍 Buscando empresa EMA MATERIAL...\n')
  
  // Buscar empresa
  const { data: empresas, error: errorEmpresa } = await supabase
    .from('empresas')
    .select('*')
    .ilike('nome', '%EMA MATERIAL%')
  
  if (errorEmpresa || !empresas || empresas.length === 0) {
    console.error('❌ Erro ao buscar empresa:', errorEmpresa)
    return
  }
  
  const empresa = empresas[0]
  console.log('✅ Empresa encontrada:', empresa.nome)
  console.log('   ID:', empresa.id)
  console.log('\n' + '='.repeat(80) + '\n')
  
  // Buscar todos os cenários (não há coluna regime_tributario)
  // Cenários de Lucro Real são identificados por nome ou tipo
  const { data: cenarios, error: errorCenarios } = await supabase
    .from('cenarios')
    .select('*')
    .eq('empresa_id', empresa.id)
    .order('created_at', { ascending: false })
  
  if (errorCenarios || !cenarios || cenarios.length === 0) {
    console.error('❌ Erro ao buscar cenários:', errorCenarios)
    return
  }
  
  console.log(`📊 Encontrados ${cenarios.length} cenários de Lucro Real:\n`)
  
  cenarios.forEach((cenario, index) => {
    console.log(`\n${'─'.repeat(80)}`)
    console.log(`CENÁRIO ${index + 1}: ${cenario.nome}`)
    console.log(`${'─'.repeat(80)}`)
    console.log(`ID: ${cenario.id}`)
    console.log(`Ano: ${cenario.ano}`)
    console.log(`Mês: ${cenario.mes || 'N/A'}`)
    console.log(`Status: ${cenario.status}`)
    console.log(`Tipo Período: ${cenario.tipo_periodo}`)
    
    // Verificar estrutura de dados
    console.log('\n📋 ESTRUTURA DE DADOS:')
    console.log(`   • Tem configuração: ${!!cenario.configuracao}`)
    console.log(`   • Tem resultados: ${!!cenario.resultados}`)
    
    // CONFIGURAÇÃO (Inputs do usuário)
    if (cenario.configuracao) {
      const config = cenario.configuracao
      console.log('\n⚙️  CONFIGURAÇÃO (Inputs):')
      
      if (config.receitaBruta) {
        console.log(`   • Receita Bruta Total: R$ ${config.receitaBruta.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`)
      }
      
      if (config.aliquotas) {
        console.log('\n   📊 Alíquotas Configuradas:')
        Object.entries(config.aliquotas).forEach(([imposto, valor]) => {
          console.log(`      - ${imposto.toUpperCase()}: ${valor}%`)
        })
      }
    }
    
    // RESULTADOS (Cálculos do sistema)
    if (cenario.resultados) {
      const res = cenario.resultados
      console.log('\n💰 RESULTADOS CALCULADOS (Impostos a Pagar):')
      
      const impostos = {
        'ICMS': res.icmsAPagar,
        'PIS': res.pisAPagar,
        'COFINS': res.cofinsAPagar,
        'IRPJ': res.irpjAPagar,
        'CSLL': res.csllAPagar,
        'ISS': res.issAPagar,
        'CPP': res.cppAPagar,
        'INSS': res.inssAPagar
      }
      
      let totalCalculado = 0
      
      Object.entries(impostos).forEach(([nome, valor]) => {
        if (valor !== undefined && valor !== null) {
          totalCalculado += valor
          console.log(`   • ${nome.padEnd(10)}: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        }
      })
      
      console.log(`   ${'─'.repeat(50)}`)
      console.log(`   • TOTAL       : R$ ${totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      
      // Verificar outros campos de resultados
      console.log('\n📈 Outros Valores dos Resultados:')
      if (res.receitaBrutaTotal !== undefined) {
        console.log(`   • Receita Bruta Total: R$ ${res.receitaBrutaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      }
      if (res.lucroLiquido !== undefined) {
        console.log(`   • Lucro Líquido: R$ ${res.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      }
      if (res.totalImpostos !== undefined) {
        console.log(`   • Total Impostos (campo): R$ ${res.totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      }
    } else {
      console.log('\n⚠️  ATENÇÃO: Este cenário NÃO tem resultados calculados!')
    }
    
    // Dados Mensais
    if (cenario.dados_mensais && Array.isArray(cenario.dados_mensais) && cenario.dados_mensais.length > 0) {
      console.log('\n📅 DADOS MENSAIS:')
      cenario.dados_mensais.forEach(dm => {
        console.log(`   • Mês ${dm.mes}/${dm.ano}: Receita R$ ${dm.receita?.toLocaleString('pt-BR') || '0,00'}`)
        if (dm.impostos) {
          console.log(`      Impostos totais: R$ ${dm.totalImpostos?.toLocaleString('pt-BR') || '0,00'}`)
        }
      })
    }
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Verificação concluída!')
}

verificarImpostosLucroReal().catch(console.error)
