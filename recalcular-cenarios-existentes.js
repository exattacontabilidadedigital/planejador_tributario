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

/**
 * Calcula todos os impostos baseado na configuração
 */
function calcularImpostos(config) {
  const receitaBruta = config.receitaBruta || 0
  
  // ICMS
  const vendasComST = receitaBruta * ((config.percentualST || 0) / 100)
  const vendasSemST = receitaBruta - vendasComST
  const debitoICMS = vendasSemST * ((config.icmsInterno || 0) / 100)
  
  const compras = (config.comprasInternas || 0) + (config.comprasInterestaduais || 0) + (config.comprasUso || 0)
  const creditoICMS = ((config.comprasInternas || 0) * ((config.icmsInterno || 0) / 100)) +
                      ((config.comprasInterestaduais || 0) * ((config.icmsSul || 0) / 100)) +
                      ((config.comprasUso || 0) * ((config.icmsInterno || 0) / 100))
  
  const icmsAPagar = Math.max(0, debitoICMS - creditoICMS)
  
  // PIS/COFINS
  const vendasMonofasico = receitaBruta * ((config.percentualMonofasico || 0) / 100)
  const vendasTributadas = receitaBruta - vendasMonofasico
  
  const debitoPIS = vendasTributadas * ((config.pisAliq || 0) / 100)
  const debitoCOFINS = vendasTributadas * ((config.cofinsAliq || 0) / 100)
  
  const despesasComCredito = 
    (config.energiaEletrica || 0) +
    (config.alugueis || 0) +
    (config.arrendamento || 0) +
    (config.frete || 0) +
    (config.depreciacao || 0) +
    (config.combustiveis || 0) +
    (config.valeTransporte || 0)
  
  const creditoPIS = (compras + despesasComCredito) * ((config.pisAliq || 0) / 100)
  const creditoCOFINS = (compras + despesasComCredito) * ((config.cofinsAliq || 0) / 100)
  
  const pisAPagar = Math.max(0, debitoPIS - creditoPIS)
  const cofinsAPagar = Math.max(0, debitoCOFINS - creditoCOFINS)
  
  // IRPJ/CSLL
  const cmv = config.cmvTotal || 0
  const despesasOperacionais =
    (config.salariosPF || 0) +
    (config.energiaEletrica || 0) +
    (config.alugueis || 0) +
    (config.alimentacao || 0) +
    (config.combustivelPasseio || 0) +
    (config.outrasDespesas || 0) +
    (config.arrendamento || 0) +
    (config.frete || 0) +
    (config.depreciacao || 0) +
    (config.combustiveis || 0) +
    (config.valeTransporte || 0)
  
  const lucroAntesIRCSLL = receitaBruta - cmv - despesasOperacionais
  const adicoes = config.adicoesLucro || 0
  const exclusoes = config.exclusoesLucro || 0
  const lucroReal = lucroAntesIRCSLL + adicoes - exclusoes
  
  const irpjBase = Math.max(0, lucroReal * ((config.irpjBase || 15) / 100))
  
  const limiteAnual = 240000
  const baseAdicional = Math.max(0, lucroReal - limiteAnual)
  const irpjAdicional = baseAdicional * ((config.irpjAdicional || 10) / 100)
  
  const irpjAPagar = irpjBase + irpjAdicional
  const csllAPagar = Math.max(0, lucroReal * ((config.csllAliq || 9) / 100))
  const issAPagar = receitaBruta * ((config.issAliq || 0) / 100)
  
  const totalImpostos = icmsAPagar + pisAPagar + cofinsAPagar + irpjAPagar + csllAPagar + issAPagar
  const lucroLiquido = receitaBruta - cmv - despesasOperacionais - totalImpostos
  const cargaTributaria = receitaBruta > 0 ? (totalImpostos / receitaBruta) * 100 : 0
  const margemLucro = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0
  
  return {
    icmsAPagar,
    pisAPagar,
    cofinsAPagar,
    irpjAPagar,
    csllAPagar,
    issAPagar,
    cppAPagar: 0,
    inssAPagar: 0,
    baseCalculoICMS: vendasSemST,
    baseCalculoPIS: vendasTributadas,
    baseCalculoCOFINS: vendasTributadas,
    baseCalculoIRPJ: lucroReal,
    baseCalculoCSLL: lucroReal,
    aliquotaICMS: config.icmsInterno || 0,
    aliquotaPIS: config.pisAliq || 0,
    aliquotaCOFINS: config.cofinsAliq || 0,
    aliquotaIRPJ: config.irpjBase || 15,
    aliquotaCSLL: config.csllAliq || 9,
    aliquotaISS: config.issAliq || 0,
    totalImpostosFederais: pisAPagar + cofinsAPagar + irpjAPagar + csllAPagar,
    totalImpostosMunicipais: issAPagar,
    totalImpostosEstaduais: icmsAPagar,
    totalImpostos,
    receitaBrutaTotal: receitaBruta,
    lucroContabil: lucroAntesIRCSLL,
    lucroReal: lucroReal,
    lucroLiquido,
    margemLucro,
    cargaTributaria
  }
}

/**
 * Gera dados mensais
 */
function gerarDadosMensais(config, ano) {
  const meses = []
  
  for (let mes = 1; mes <= 12; mes++) {
    const receitaMensal = (config.receitaBruta || 0) / 12
    
    const configMensal = {
      ...config,
      receitaBruta: receitaMensal,
      cmvTotal: (config.cmvTotal || 0) / 12,
      salariosPF: (config.salariosPF || 0) / 12,
    }
    
    const impostosCalculados = calcularImpostos(configMensal)
    
    meses.push({
      mes,
      ano,
      receita: receitaMensal,
      impostos: {
        icms: impostosCalculados.icmsAPagar,
        pis: impostosCalculados.pisAPagar,
        cofins: impostosCalculados.cofinsAPagar,
        irpj: impostosCalculados.irpjAPagar,
        csll: impostosCalculados.csllAPagar,
        iss: impostosCalculados.issAPagar
      },
      totalImpostos: impostosCalculados.totalImpostos,
      lucroLiquido: impostosCalculados.lucroLiquido
    })
  }
  
  return meses
}

async function recalcularCenariosExistentes() {
  console.log('🔄 Iniciando recálculo de cenários existentes...\n')
  
  // Buscar empresa EMA MATERIAL
  const { data: empresas } = await supabase
    .from('empresas')
    .select('*')
    .ilike('nome', '%EMA MATERIAL%')
  
  if (!empresas || empresas.length === 0) {
    console.error('❌ Empresa não encontrada!')
    return
  }
  
  const empresa = empresas[0]
  console.log(`✅ Empresa encontrada: ${empresa.nome}`)
  console.log(`   ID: ${empresa.id}\n`)
  
  // Buscar todos os cenários desta empresa
  const { data: cenarios, error } = await supabase
    .from('cenarios')
    .select('*')
    .eq('empresa_id', empresa.id)
  
  if (error || !cenarios || cenarios.length === 0) {
    console.error('❌ Nenhum cenário encontrado ou erro:', error)
    return
  }
  
  console.log(`📊 Encontrados ${cenarios.length} cenários para recalcular:\n`)
  
  let sucessos = 0
  let erros = 0
  
  for (const cenario of cenarios) {
    try {
      console.log(`${'─'.repeat(80)}`)
      console.log(`🔧 Recalculando: ${cenario.nome}`)
      console.log(`   ID: ${cenario.id}`)
      console.log(`   Ano: ${cenario.ano}`)
      
      const configuracao = cenario.configuracao || {}
      
      // Verificar se tem configuração válida
      if (!configuracao.receitaBruta && configuracao.receitaBruta !== 0) {
        console.log('   ⚠️  Sem receita configurada, pulando...\n')
        continue
      }
      
      // Calcular impostos
      const resultados = calcularImpostos(configuracao)
      const dadosMensais = gerarDadosMensais(configuracao, cenario.ano)
      
      console.log(`   💰 Impostos calculados:`)
      console.log(`      • ICMS: R$ ${resultados.icmsAPagar.toFixed(2)}`)
      console.log(`      • PIS: R$ ${resultados.pisAPagar.toFixed(2)}`)
      console.log(`      • COFINS: R$ ${resultados.cofinsAPagar.toFixed(2)}`)
      console.log(`      • IRPJ: R$ ${resultados.irpjAPagar.toFixed(2)}`)
      console.log(`      • CSLL: R$ ${resultados.csllAPagar.toFixed(2)}`)
      console.log(`      • TOTAL: R$ ${resultados.totalImpostos.toFixed(2)}`)
      console.log(`      • Lucro Líquido: R$ ${resultados.lucroLiquido.toFixed(2)}`)
      
      // Atualizar no banco (só resultados, dados_mensais não existe na tabela ainda)
      const { error: updateError } = await supabase
        .from('cenarios')
        .update({
          resultados: resultados
        })
        .eq('id', cenario.id)
      
      if (updateError) {
        console.error(`   ❌ Erro ao atualizar: ${updateError.message}\n`)
        erros++
      } else {
        console.log(`   ✅ Atualizado com sucesso!\n`)
        sucessos++
      }
      
    } catch (err) {
      console.error(`   ❌ Erro ao processar cenário: ${err.message}\n`)
      erros++
    }
  }
  
  console.log(`${'='.repeat(80)}`)
  console.log(`\n✨ RECÁLCULO CONCLUÍDO!`)
  console.log(`   ✅ Sucessos: ${sucessos}`)
  console.log(`   ❌ Erros: ${erros}`)
  console.log(`   📊 Total: ${cenarios.length}`)
}

recalcularCenariosExistentes().catch(console.error)
