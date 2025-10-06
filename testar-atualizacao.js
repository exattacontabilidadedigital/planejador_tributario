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

async function testarAtualizacao() {
  console.log('🧪 TESTE DE ATUALIZAÇÃO (UPDATE)\n')
  console.log('═'.repeat(100))
  
  // Buscar empresa RB
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nome')
    .ilike('nome', '%RB%')
    .single()

  console.log(`\n✅ Empresa: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}`)
  
  // PASSO 1: Buscar registro de Janeiro para editar
  console.log('\n' + '─'.repeat(100))
  console.log('🔍 PASSO 1: Buscando registro de Janeiro')
  console.log('─'.repeat(100))
  
  const { data: janeiro, error: erroJaneiro } = await supabase
    .from('dados_comparativos_mensais')
    .select('*')
    .eq('empresa_id', empresa.id)
    .eq('mes', '01')
    .eq('ano', 2025)
    .eq('regime', 'lucro_presumido')
    .single()
  
  if (erroJaneiro || !janeiro) {
    console.log('❌ Erro ao buscar Janeiro:', erroJaneiro)
    console.log('\n⚠️  Criando registro de Janeiro primeiro...')
    
    const { data: criado } = await supabase
      .from('dados_comparativos_mensais')
      .insert({
        empresa_id: empresa.id,
        mes: '01',
        ano: 2025,
        regime: 'lucro_presumido',
        receita: 1800000,
        icms: 4000,
        pis: 1000,
        cofins: 1500,
        irpj: 300,
        csll: 200,
        iss: 0,
        outros: 0,
        observacoes: 'Dados iniciais'
      })
      .select()
      .single()
    
    console.log('✅ Registro criado:', criado.id)
    janeiro = criado
  } else {
    console.log('✅ Registro encontrado!')
    console.log(`   ID: ${janeiro.id}`)
    console.log(`   Receita ANTES: R$ ${janeiro.receita.toLocaleString('pt-BR')}`)
    console.log(`   ICMS ANTES: R$ ${janeiro.icms.toLocaleString('pt-BR')}`)
    console.log(`   PIS ANTES: R$ ${janeiro.pis.toLocaleString('pt-BR')}`)
    console.log(`   Observações ANTES: "${janeiro.observacoes || 'vazio'}"`)
    
    const totalAntes = (janeiro.icms || 0) + (janeiro.pis || 0) + (janeiro.cofins || 0) + 
                       (janeiro.irpj || 0) + (janeiro.csll || 0)
    console.log(`   TOTAL ANTES: R$ ${totalAntes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  }
  
  // PASSO 2: Simular edição na interface (usuário altera valores)
  console.log('\n' + '─'.repeat(100))
  console.log('✏️  PASSO 2: Simulando Edição na Interface')
  console.log('─'.repeat(100))
  
  const dadosEditados = {
    // Valores NOVOS que o usuário digitou
    receita: 2000000,  // Aumentou de 1.800.000 para 2.000.000
    icms: 5000,        // Aumentou de 4.000 para 5.000
    pis: 1200,         // Aumentou de 1.000 para 1.200
    cofins: 1800,      // Aumentou de 1.500 para 1.800
    irpj: 400,         // Aumentou de 300 para 400
    csll: 250,         // Aumentou de 200 para 250
    iss: 0,
    outros: 0,
    observacoes: `Dados atualizados em ${new Date().toLocaleString('pt-BR')}`
  }
  
  console.log('📝 Novos valores:')
  console.log(`   Receita: R$ ${dadosEditados.receita.toLocaleString('pt-BR')}`)
  console.log(`   ICMS: R$ ${dadosEditados.icms.toLocaleString('pt-BR')}`)
  console.log(`   PIS: R$ ${dadosEditados.pis.toLocaleString('pt-BR')}`)
  console.log(`   Observações: "${dadosEditados.observacoes}"`)
  
  const totalNovo = dadosEditados.icms + dadosEditados.pis + dadosEditados.cofins + 
                    dadosEditados.irpj + dadosEditados.csll
  console.log(`   TOTAL NOVO: R$ ${totalNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  
  // PASSO 3: Executar UPDATE
  console.log('\n' + '─'.repeat(100))
  console.log('📤 PASSO 3: Executando UPDATE no Supabase')
  console.log('─'.repeat(100))
  
  const { data: atualizado, error: erroUpdate } = await supabase
    .from('dados_comparativos_mensais')
    .update(dadosEditados)
    .eq('id', janeiro.id)
    .select()
    .single()
  
  if (erroUpdate) {
    console.log('\n❌ ERRO ao atualizar:')
    console.log(JSON.stringify(erroUpdate, null, 2))
  } else {
    console.log('\n✅ ATUALIZAÇÃO BEM-SUCEDIDA!')
    console.log(`   ID: ${atualizado.id}`)
    console.log(`   Receita DEPOIS: R$ ${atualizado.receita.toLocaleString('pt-BR')}`)
    console.log(`   ICMS DEPOIS: R$ ${atualizado.icms.toLocaleString('pt-BR')}`)
    console.log(`   PIS DEPOIS: R$ ${atualizado.pis.toLocaleString('pt-BR')}`)
    console.log(`   Observações DEPOIS: "${atualizado.observacoes}"`)
    
    const totalDepois = (atualizado.icms || 0) + (atualizado.pis || 0) + (atualizado.cofins || 0) + 
                        (atualizado.irpj || 0) + (atualizado.csll || 0)
    console.log(`   TOTAL DEPOIS: R$ ${totalDepois.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  }
  
  // PASSO 4: Verificar se realmente atualizou
  console.log('\n' + '─'.repeat(100))
  console.log('🔍 PASSO 4: Re-buscando registro para confirmar')
  console.log('─'.repeat(100))
  
  const { data: verificacao } = await supabase
    .from('dados_comparativos_mensais')
    .select('*')
    .eq('id', janeiro.id)
    .single()
  
  console.log('\n📊 Verificação final:')
  console.log(`   Receita: R$ ${verificacao.receita.toLocaleString('pt-BR')}`)
  console.log(`   ICMS: R$ ${verificacao.icms.toLocaleString('pt-BR')}`)
  console.log(`   PIS: R$ ${verificacao.pis.toLocaleString('pt-BR')}`)
  console.log(`   Observações: "${verificacao.observacoes}"`)
  
  const totalFinal = (verificacao.icms || 0) + (verificacao.pis || 0) + (verificacao.cofins || 0) + 
                     (verificacao.irpj || 0) + (verificacao.csll || 0)
  console.log(`   TOTAL: R$ ${totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  console.log(`   Atualizado em: ${new Date(verificacao.atualizado_em).toLocaleString('pt-BR')}`)
  
  // Comparar valores
  const mudou = verificacao.icms === dadosEditados.icms &&
                verificacao.pis === dadosEditados.pis &&
                verificacao.observacoes === dadosEditados.observacoes
  
  console.log('\n' + '═'.repeat(100))
  if (mudou) {
    console.log('\n✅ SUCESSO! Os dados foram atualizados corretamente no banco!')
  } else {
    console.log('\n❌ FALHA! Os dados NÃO foram atualizados!')
    console.log('\nEsperado vs Encontrado:')
    console.log(`   ICMS: ${dadosEditados.icms} vs ${verificacao.icms}`)
    console.log(`   PIS: ${dadosEditados.pis} vs ${verificacao.pis}`)
  }
  console.log('═'.repeat(100))
}

testarAtualizacao()
