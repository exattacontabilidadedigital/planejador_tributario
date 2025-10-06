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

// Simular conversão de mês do serviço
function converterMesParaNumero(mes) {
  const meses = {
    'jan': '01', 'janeiro': '01',
    'fev': '02', 'fevereiro': '02',
    'mar': '03', 'março': '03',
    'abr': '04', 'abril': '04',
    'mai': '05', 'maio': '05',
    'jun': '06', 'junho': '06',
    'jul': '07', 'julho': '07',
    'ago': '08', 'agosto': '08',
    'set': '09', 'setembro': '09',
    'out': '10', 'outubro': '10',
    'nov': '11', 'novembro': '11',
    'dez': '12', 'dezembro': '12'
  }

  // Se já está no formato número, retornar com zero à esquerda
  const numeroMes = parseInt(mes)
  if (!isNaN(numeroMes) && numeroMes >= 1 && numeroMes <= 12) {
    return numeroMes.toString().padStart(2, '0')
  }

  // Se é nome do mês, converter
  const mesLower = mes.toLowerCase()
  if (meses[mesLower]) {
    return meses[mesLower]
  }

  // Se já está no formato correto (01, 02, etc.), retornar como está
  if (/^(0[1-9]|1[0-2])$/.test(mes)) {
    return mes
  }

  throw new Error(`Mês inválido: ${mes}`)
}

async function testarSalvamentoCompleto() {
  console.log('🧪 TESTE COMPLETO DE SALVAMENTO\n')
  console.log('Simulando o fluxo da interface → store → serviço → banco\n')
  console.log('═'.repeat(100))
  
  // Buscar empresa RB
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nome')
    .ilike('nome', '%RB%')
    .single()

  console.log(`\n✅ Empresa: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}`)
  
  // PASSO 1: Dados do formulário (como chegam da interface)
  console.log('\n' + '─'.repeat(100))
  console.log('📝 PASSO 1: Dados do Formulário (como o usuário preenche)')
  console.log('─'.repeat(100))
  
  const dadosFormulario = {
    mes: 'mai',  // Usuário seleciona "Maio" no dropdown
    ano: 2025,
    regime: 'lucro_presumido',
    receita: '1.500.000,00',  // Formatado com máscara de moeda
    icms: '5.500,00',
    pis: '1.350,00',
    cofins: '2.000,00',
    irpj: '600,00',
    csll: '300,00',
    iss: '0,00',
    outros: '0,00',
    observacoes: 'Teste de salvamento completo'
  }
  
  console.log(JSON.stringify(dadosFormulario, null, 2))
  
  // PASSO 2: Conversão para números (como o FormularioComparativos faz)
  console.log('\n' + '─'.repeat(100))
  console.log('🔄 PASSO 2: Conversão de Moeda para Número')
  console.log('─'.repeat(100))
  
  const converterMoedaParaNumero = (valorFormatado) => {
    if (!valorFormatado || valorFormatado.trim() === '') return 0
    return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.')) || 0
  }
  
  const dadosConvertidos = {
    empresaId: empresa.id,
    mes: dadosFormulario.mes,
    ano: dadosFormulario.ano,
    regime: dadosFormulario.regime,
    receita: converterMoedaParaNumero(dadosFormulario.receita),
    icms: converterMoedaParaNumero(dadosFormulario.icms),
    pis: converterMoedaParaNumero(dadosFormulario.pis),
    cofins: converterMoedaParaNumero(dadosFormulario.cofins),
    irpj: converterMoedaParaNumero(dadosFormulario.irpj),
    csll: converterMoedaParaNumero(dadosFormulario.csll),
    iss: converterMoedaParaNumero(dadosFormulario.iss),
    outros: converterMoedaParaNumero(dadosFormulario.outros),
    observacoes: dadosFormulario.observacoes
  }
  
  console.log(JSON.stringify(dadosConvertidos, null, 2))
  
  // PASSO 3: Formato Supabase (como o serviço converte)
  console.log('\n' + '─'.repeat(100))
  console.log('🔄 PASSO 3: Conversão para Formato Supabase')
  console.log('─'.repeat(100))
  
  const dadosSupabase = {
    empresa_id: dadosConvertidos.empresaId,
    mes: converterMesParaNumero(dadosConvertidos.mes),
    ano: dadosConvertidos.ano,
    regime: dadosConvertidos.regime,
    receita: dadosConvertidos.receita || 0,
    icms: dadosConvertidos.icms || 0,
    pis: dadosConvertidos.pis || 0,
    cofins: dadosConvertidos.cofins || 0,
    irpj: dadosConvertidos.irpj || 0,
    csll: dadosConvertidos.csll || 0,
    iss: dadosConvertidos.iss || 0,
    outros: dadosConvertidos.outros || 0,
    observacoes: dadosConvertidos.observacoes || undefined
  }
  
  console.log(JSON.stringify(dadosSupabase, null, 2))
  
  // PASSO 4: Verificar se já existe
  console.log('\n' + '─'.repeat(100))
  console.log('🔍 PASSO 4: Verificando se já existe registro')
  console.log('─'.repeat(100))
  
  const { data: existente } = await supabase
    .from('dados_comparativos_mensais')
    .select('id, receita, icms, atualizado_em')
    .eq('empresa_id', dadosSupabase.empresa_id)
    .eq('mes', dadosSupabase.mes)
    .eq('ano', dadosSupabase.ano)
    .eq('regime', dadosSupabase.regime)
    .single()
  
  if (existente) {
    console.log('⚠️  Registro já existe!')
    console.log(JSON.stringify(existente, null, 2))
    console.log('\n🔄 Tentando ATUALIZAR ao invés de INSERIR...')
    
    const { data: atualizado, error: erroUpdate } = await supabase
      .from('dados_comparativos_mensais')
      .update(dadosSupabase)
      .eq('id', existente.id)
      .select()
      .single()
    
    if (erroUpdate) {
      console.log('\n❌ ERRO ao atualizar:')
      console.log(JSON.stringify(erroUpdate, null, 2))
    } else {
      console.log('\n✅ ATUALIZAÇÃO BEM-SUCEDIDA!')
      console.log(JSON.stringify(atualizado, null, 2))
    }
  } else {
    console.log('✅ Registro não existe, pode inserir')
    
    // PASSO 5: Inserir no banco
    console.log('\n' + '─'.repeat(100))
    console.log('📤 PASSO 5: Executando INSERT no Supabase')
    console.log('─'.repeat(100))
    
    const { data: inserido, error: erroInsert } = await supabase
      .from('dados_comparativos_mensais')
      .insert(dadosSupabase)
      .select()
      .single()
    
    if (erroInsert) {
      console.log('\n❌ ERRO ao inserir:')
      console.log(JSON.stringify(erroInsert, null, 2))
    } else {
      console.log('\n✅ INSERÇÃO BEM-SUCEDIDA!')
      console.log(JSON.stringify(inserido, null, 2))
    }
  }
  
  // PASSO 6: Verificar resultado final
  console.log('\n' + '═'.repeat(100))
  console.log('🔍 VERIFICAÇÃO FINAL: Buscando todos os registros da RB')
  console.log('═'.repeat(100))
  
  const { data: todos } = await supabase
    .from('dados_comparativos_mensais')
    .select('mes, ano, regime, receita, icms, pis, cofins, irpj, csll, observacoes')
    .eq('empresa_id', empresa.id)
    .eq('regime', 'lucro_presumido')
    .eq('ano', 2025)
    .order('mes')
  
  if (todos && todos.length > 0) {
    console.log(`\n📊 Total de registros: ${todos.length}\n`)
    todos.forEach(reg => {
      const total = (reg.icms || 0) + (reg.pis || 0) + (reg.cofins || 0) + 
                     (reg.irpj || 0) + (reg.csll || 0)
      const mesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][parseInt(reg.mes) - 1]
      console.log(`   ${mesNome}/${reg.ano}: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${reg.observacoes ? `(${reg.observacoes})` : ''}`)
    })
  }
  
  console.log('\n' + '═'.repeat(100))
  console.log('\n✅ TESTE CONCLUÍDO!')
  console.log('\n💡 Se este teste funcionou, o problema está na interface.')
  console.log('   Abra o console do navegador (F12) e procure por erros quando salvar.')
}

testarSalvamentoCompleto()
