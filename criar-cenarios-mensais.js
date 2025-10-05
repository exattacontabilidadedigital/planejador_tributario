/**
 * Script para criar cenários mensais de teste com dados reais
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function criarCenariosMensais() {
  console.log('🔧 [CENÁRIOS MENSAIS] Iniciando criação...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    // 1. Buscar empresa RB Acessórios
    console.log('1️⃣ Buscando empresa RB Acessórios...')
    const { data: empresas, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nome')
      .ilike('nome', '%rb%acessorios%')
      .limit(1)

    let empresaId
    if (!empresas || empresas.length === 0) {
      // Criar empresa RB Acessórios se não existir
      console.log('2️⃣ Criando empresa RB Acessórios...')
      const { data: novaEmpresa, error: criarError } = await supabase
        .from('empresas')
        .insert({
          nome: 'RB Acessórios',
          razao_social: 'RB Acessórios para Motos Ltda',
          cnpj: '12.345.678/0001-99',
          tipo_empresa: 'comercio',
          ativa: true
        })
        .select()
        .single()

      if (criarError) {
        console.error('❌ Erro ao criar empresa:', criarError)
        return
      }
      empresaId = novaEmpresa.id
      console.log('✅ Empresa criada:', novaEmpresa.nome)
    } else {
      empresaId = empresas[0].id
      console.log('✅ Empresa encontrada:', empresas[0].nome)
    }

    // 2. Criar cenários mensais com dados progressivos
    const meses = [
      { num: 1, nome: 'Janeiro', receita: 95000, cmv: 33250 },
      { num: 2, nome: 'Fevereiro', receita: 105000, cmv: 36750 },
      { num: 3, nome: 'Março', receita: 115000, cmv: 40250 },
      { num: 4, nome: 'Abril', receita: 125000, cmv: 43750 },
      { num: 5, nome: 'Maio', receita: 135000, cmv: 47250 },
      { num: 6, nome: 'Junho', receita: 130000, cmv: 45500 },
      { num: 7, nome: 'Julho', receita: 140000, cmv: 49000 },
      { num: 8, nome: 'Agosto', receita: 150000, cmv: 52500 },
      { num: 9, nome: 'Setembro', receita: 155000, cmv: 54250 },
      { num: 10, nome: 'Outubro', receita: 165000, cmv: 57750 },
      { num: 11, nome: 'Novembro', receita: 175000, cmv: 61250 },
      { num: 12, nome: 'Dezembro', receita: 185000, cmv: 64750 }
    ]

    console.log('3️⃣ Criando cenários mensais...')
    
    for (const mes of meses) {
      const cenarioData = {
        empresa_id: empresaId,
        nome: `${mes.nome} 2025`,
        descricao: `Cenário para ${mes.nome}/2025`,
        ano: 2025,
        mes: mes.num,
        tipo_periodo: 'mensal',
        data_inicio: `2025-${mes.num.toString().padStart(2, '0')}-01`,
        data_fim: `2025-${mes.num.toString().padStart(2, '0')}-${new Date(2025, mes.num, 0).getDate()}`,
        configuracao: {
          regimeTributario: 'lucro-presumido',
          tipoEmpresa: 'comercio',
          receitaBruta: mes.receita,
          cmvTotal: mes.cmv,
          icmsInterno: 7.0,
          pisAliq: 0.65,
          cofinsAliq: 3.0,
          periodo: {
            tipo: 'mensal',
            mes: mes.num,
            ano: 2025,
            inicio: `2025-${mes.num.toString().padStart(2, '0')}-01T00:00:00.000Z`,
            fim: `2025-${mes.num.toString().padStart(2, '0')}-${new Date(2025, mes.num, 0).getDate()}T23:59:59.999Z`
          }
        },
        status: 'aprovado'
      }

      const { data, error } = await supabase
        .from('cenarios')
        .insert(cenarioData)
        .select()
        .single()

      if (error) {
        console.error(`❌ Erro ao criar cenário ${mes.nome}:`, error)
      } else {
        console.log(`✅ Cenário ${mes.nome} criado com ID: ${data.id}`)
      }
    }

    console.log('🏁 Criação de cenários mensais finalizada!')

  } catch (err) {
    console.error('❌ Erro geral:', err)
  }
}

criarCenariosMensais()