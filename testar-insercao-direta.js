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

async function testarInsercao() {
  console.log('🧪 Testando inserção direta na tabela dados_comparativos_mensais...\n')
  
  // Buscar empresa RB
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nome')
    .ilike('nome', '%RB%')
    .single()

  console.log(`✅ Empresa: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}\n`)

  // Dados de teste
  const dadosTeste = {
    empresa_id: empresa.id,
    mes: '04', // Abril
    ano: 2025,
    regime: 'lucro_presumido',
    receita: 1200000,
    icms: 5000,
    pis: 1200,
    cofins: 1800,
    irpj: 400,
    csll: 200,
    iss: 0,
    outros: 0,
    observacoes: 'Teste de inserção direta'
  }

  console.log('📝 Tentando inserir dados de teste:')
  console.log(JSON.stringify(dadosTeste, null, 2))
  console.log('\n' + '═'.repeat(80))

  try {
    const { data, error } = await supabase
      .from('dados_comparativos_mensais')
      .insert(dadosTeste)
      .select()
      .single()

    if (error) {
      console.error('❌ ERRO ao inserir:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Verificar se é erro de constraint única
      if (error.code === '23505') {
        console.log('\n⚠️  Já existe um registro com esses dados!')
        console.log('Tentando atualizar o registro existente...\n')
        
        // Buscar o registro existente
        const { data: existente } = await supabase
          .from('dados_comparativos_mensais')
          .select('id, receita, icms, pis, cofins')
          .eq('empresa_id', empresa.id)
          .eq('mes', '04')
          .eq('ano', 2025)
          .eq('regime', 'lucro_presumido')
          .single()
        
        if (existente) {
          console.log('📊 Dados existentes:', existente)
          
          // Atualizar
          const { data: atualizado, error: erroUpdate } = await supabase
            .from('dados_comparativos_mensais')
            .update({
              receita: dadosTeste.receita,
              icms: dadosTeste.icms,
              pis: dadosTeste.pis,
              cofins: dadosTeste.cofins,
              irpj: dadosTeste.irpj,
              csll: dadosTeste.csll,
              observacoes: 'Teste de atualização'
            })
            .eq('id', existente.id)
            .select()
            .single()
          
          if (erroUpdate) {
            console.error('❌ Erro ao atualizar:', erroUpdate)
          } else {
            console.log('✅ Registro atualizado com sucesso!')
            console.log(JSON.stringify(atualizado, null, 2))
          }
        }
      }
    } else {
      console.log('✅ Dados inseridos com sucesso!')
      console.log(JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }

  console.log('\n' + '═'.repeat(80))
  console.log('\n🔍 Verificando todos os registros da RB...\n')

  // Buscar todos os registros
  const { data: todos } = await supabase
    .from('dados_comparativos_mensais')
    .select('mes, ano, regime, receita, icms, pis, cofins, irpj, csll')
    .eq('empresa_id', empresa.id)
    .eq('regime', 'lucro_presumido')
    .eq('ano', 2025)
    .order('mes')

  if (todos && todos.length > 0) {
    console.log(`📊 Total de registros: ${todos.length}`)
    todos.forEach(reg => {
      const total = (reg.icms || 0) + (reg.pis || 0) + (reg.cofins || 0) + 
                     (reg.irpj || 0) + (reg.csll || 0)
      console.log(`   Mês ${reg.mes}: Total R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    })
  } else {
    console.log('⚠️  Nenhum registro encontrado')
  }

  console.log('\n✅ Teste concluído!')
}

testarInsercao()
