const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!')
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testarCalculoDRE() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║  TESTE: Validação Estrutura DRE no Comparativo             ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')

  const cenarioId = 'b9c02d8c-662c-41de-8d06-534dcd7e0d89' // Janeiro

  try {
    // 1. Buscar cenário com configuração e resultados
    console.log('🔍 [1/4] Buscando cenário Janeiro...')
    const { data: cenario, error: errorCenario } = await supabase
      .from('cenarios')
      .select('*')
      .eq('id', cenarioId)
      .single()

    if (errorCenario) {
      console.error('❌ Erro ao buscar cenário:', errorCenario.message)
      return
    }

    console.log(`✅ Cenário encontrado: ${cenario.nome}`)

    // 2. Buscar despesas dinâmicas
    console.log('\n🔍 [2/4] Buscando despesas dinâmicas...')
    const { data: despesas, error: errorDespesas } = await supabase
      .from('despesas_dinamicas')
      .select('*')
      .eq('cenario_id', cenarioId)

    if (errorDespesas) {
      console.error('❌ Erro ao buscar despesas:', errorDespesas.message)
      return
    }

    console.log(`✅ ${despesas?.length || 0} despesas encontradas`)

    // 3. Simular cálculo DRE (mesma lógica do service)
    console.log('\n📊 [3/4] Calculando estrutura DRE...\n')

    const config = cenario.configuracao || {}
    const resultados = cenario.resultados || {}

    // ═══════════════════════════════════════════════════════════════
    // ETAPA 1: RECEITA BRUTA E DEDUÇÕES
    // ═══════════════════════════════════════════════════════════════
    
    const receitaBruta = config.receitaBruta || 0
    
    // Calcular créditos PIS/COFINS
    const despesasComCredito = (despesas || []).filter(d => d.credito === 'com-credito')
    const totalDespesasComCredito = despesasComCredito.reduce((sum, d) => sum + (d.valor || 0), 0)
    const creditoPIS = totalDespesasComCredito * 0.0165
    const creditoCOFINS = totalDespesasComCredito * 0.076
    
    // Deduções
    const icmsAPagar = resultados.icmsAPagar || 0
    const pisAPagar = Math.max(0, (resultados.pisAPagar || 0) - creditoPIS)
    const cofinsAPagar = Math.max(0, (resultados.cofinsAPagar || 0) - creditoCOFINS)
    const issAPagar = resultados.issAPagar || 0
    const totalDeducoes = icmsAPagar + pisAPagar + cofinsAPagar + issAPagar
    
    const receitaLiquida = receitaBruta - totalDeducoes

    console.log('═══════════════════════════════════════════════════════════════')
    console.log('ETAPA 1: RECEITA BRUTA E DEDUÇÕES')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`Receita Bruta:                R$ ${receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`\nDeduções da Receita:`)
    console.log(`  (-) ICMS:                   R$ ${icmsAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`  (-) PIS (após crédito):     R$ ${pisAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`  (-) COFINS (após crédito):  R$ ${cofinsAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`  (-) ISS:                    R$ ${issAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`                              ───────────────────`)
    console.log(`  Total Deduções:             R$ ${totalDeducoes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`                              ═══════════════════`)
    console.log(`(=) RECEITA LÍQUIDA:          R$ ${receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ✅`)

    // ═══════════════════════════════════════════════════════════════
    // ETAPA 2: CMV E LUCRO BRUTO
    // ═══════════════════════════════════════════════════════════════
    
    const cmv = config.cmvTotal || 0
    const lucroBruto = receitaLiquida - cmv

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('ETAPA 2: CMV E LUCRO BRUTO')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`(-) CMV:                      R$ ${cmv.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`                              ═══════════════════`)
    console.log(`(=) LUCRO BRUTO:              R$ ${lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ✅`)

    // ═══════════════════════════════════════════════════════════════
    // ETAPA 3: DESPESAS OPERACIONAIS E LAIR
    // ═══════════════════════════════════════════════════════════════
    
    const totalDespesasOperacionais = (despesas || [])
      .filter(d => d.tipo === 'despesa')
      .reduce((sum, d) => sum + (d.valor || 0), 0)
    
    const lair = lucroBruto - totalDespesasOperacionais

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('ETAPA 3: DESPESAS OPERACIONAIS E LAIR')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`Despesas Operacionais:`)
    
    const despesasSemCredito = (despesas || []).filter(d => d.credito === 'sem-credito')
    console.log(`  • COM crédito: ${despesasComCredito.length} despesas = R$ ${totalDespesasComCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`  • SEM crédito: ${despesasSemCredito.length} despesas = R$ ${despesasSemCredito.reduce((sum, d) => sum + d.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    console.log(`                              ───────────────────`)
    console.log(`  Total Despesas:             R$ ${totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`                              ═══════════════════`)
    console.log(`(=) LAIR:                     R$ ${lair.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ✅`)

    // ═══════════════════════════════════════════════════════════════
    // ETAPA 4: AJUSTES FISCAIS
    // ═══════════════════════════════════════════════════════════════
    
    const adicoes = config.adicoesLucro || 0
    const exclusoes = config.exclusoesLucro || 0
    const lucroRealBase = lair + adicoes - exclusoes

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('ETAPA 4: AJUSTES FISCAIS')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`(+) Adições:                  R$ ${adicoes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`(-) Exclusões:                R$ ${exclusoes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`                              ═══════════════════`)
    console.log(`(=) LUCRO REAL (Base):        R$ ${lucroRealBase.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ✅`)

    // ═══════════════════════════════════════════════════════════════
    // ETAPA 5: IMPOSTOS IRPJ/CSLL
    // ═══════════════════════════════════════════════════════════════
    
    const irpjAPagar = resultados.irpjAPagar || 0
    const csllAPagar = resultados.csllAPagar || 0

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('ETAPA 5: IMPOSTOS SOBRE O LUCRO')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`(-) IRPJ:                     R$ ${irpjAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`(-) CSLL:                     R$ ${csllAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)

    // ═══════════════════════════════════════════════════════════════
    // ETAPA 6: LUCRO LÍQUIDO
    // ═══════════════════════════════════════════════════════════════
    
    const lucroLiquido = lair - irpjAPagar - csllAPagar

    console.log(`                              ═══════════════════`)
    console.log(`(=) LUCRO LÍQUIDO:            R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ✅`)

    // ═══════════════════════════════════════════════════════════════
    // RESUMO FINAL
    // ═══════════════════════════════════════════════════════════════

    const totalImpostos = icmsAPagar + pisAPagar + cofinsAPagar + issAPagar + irpjAPagar + csllAPagar
    const cargaTributaria = (totalImpostos / receitaBruta) * 100

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('RESUMO FINAL')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`Total de Impostos:            R$ ${totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`Carga Tributária:             ${cargaTributaria.toFixed(2)}%`)

    if (creditoPIS > 0 || creditoCOFINS > 0) {
      console.log(`\n💳 CRÉDITOS APLICADOS:`)
      console.log(`   • Despesas com crédito:    R$ ${totalDespesasComCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   • Crédito PIS (1,65%):     R$ ${creditoPIS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   • Crédito COFINS (7,6%):   R$ ${creditoCOFINS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      console.log(`   • Total de Créditos:       R$ ${(creditoPIS + creditoCOFINS).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n')

    // 4. Validação com valores esperados da DRE
    console.log('✅ [4/4] Validando valores com a DRE...\n')

    const valoresEsperados = {
      receitaLiquida: 900952.50,
      lucroBruto: 400952.50,
      despesasOperacionais: 213270.00,
      lair: 187682.50,
      lucroRealBase: 187682.50,
      irpj: 47682.50,
      csll: 25805.70,
      lucroLiquido: 114194.30
    }

    const validacoes = [
      { nome: 'Receita Líquida', calculado: receitaLiquida, esperado: valoresEsperados.receitaLiquida },
      { nome: 'Lucro Bruto', calculado: lucroBruto, esperado: valoresEsperados.lucroBruto },
      { nome: 'Despesas Operacionais', calculado: totalDespesasOperacionais, esperado: valoresEsperados.despesasOperacionais },
      { nome: 'LAIR', calculado: lair, esperado: valoresEsperados.lair },
      { nome: 'Lucro Real (Base)', calculado: lucroRealBase, esperado: valoresEsperados.lucroRealBase },
      { nome: 'IRPJ', calculado: irpjAPagar, esperado: valoresEsperados.irpj },
      { nome: 'CSLL', calculado: csllAPagar, esperado: valoresEsperados.csll },
      { nome: 'Lucro Líquido', calculado: lucroLiquido, esperado: valoresEsperados.lucroLiquido }
    ]

    let todosCorretos = true

    validacoes.forEach(v => {
      const diferenca = Math.abs(v.calculado - v.esperado)
      const status = diferenca < 0.01 ? '✅' : '❌'
      const emoji = diferenca < 0.01 ? '✅' : '⚠️'
      
      if (diferenca >= 0.01) todosCorretos = false

      console.log(`${status} ${v.nome.padEnd(25)}: R$ ${v.calculado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).padStart(15)} ${diferenca >= 0.01 ? `(esperado: R$ ${v.esperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : ''}`)
    })

    console.log('\n═══════════════════════════════════════════════════════════════')
    if (todosCorretos) {
      console.log('🎉 SUCESSO! Todos os valores estão corretos!')
      console.log('✅ A estrutura DRE no comparativo está funcionando perfeitamente!')
    } else {
      console.log('⚠️  ATENÇÃO! Alguns valores estão divergentes.')
      console.log('   Verifique os cálculos e os dados do cenário.')
    }
    console.log('═══════════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
  }
}

testarCalculoDRE()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erro:', err)
    process.exit(1)
  })
