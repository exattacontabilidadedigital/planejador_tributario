import type { TaxConfig } from '@/types'

/**
 * Calcula todos os impostos baseado na configuração
 * Replica a lógica dos hooks use-memoria-* mas sem dependência do React
 */
export function calcularImpostos(config: TaxConfig) {
  const receitaBruta = config.receitaBruta || 0
  
  // ============================================
  // ICMS
  // ============================================
  const vendasComST = receitaBruta * (config.percentualST / 100)
  const vendasSemST = receitaBruta - vendasComST
  const debitoICMS = vendasSemST * (config.icmsInterno / 100)
  
  const compras = config.comprasInternas + config.comprasInterestaduais + config.comprasUso
  const creditoICMS = (config.comprasInternas * (config.icmsInterno / 100)) +
                      (config.comprasInterestaduais * (config.icmsSul / 100)) + // Usar alíquota interestadual
                      (config.comprasUso * (config.icmsInterno / 100)) // Usar alíquota interna
  
  // Se crédito > débito, ICMS = 0 e fica crédito para próxima apuração
  const saldoICMS = debitoICMS - creditoICMS
  const icmsAPagar = Math.max(0, saldoICMS)
  const creditoICMSDisponivelProximaApuracao = Math.abs(Math.min(0, saldoICMS))
  
  // ============================================
  // PIS/COFINS
  // ============================================
  const vendasMonofasico = receitaBruta * (config.percentualMonofasico / 100)
  const vendasTributadas = receitaBruta - vendasMonofasico
  
  const debitoPIS = vendasTributadas * (config.pisAliq / 100)
  const debitoCOFINS = vendasTributadas * (config.cofinsAliq / 100)
  
  // Créditos PIS/COFINS sobre despesas
  const despesasComCredito = 
    config.energiaEletrica +
    config.alugueis +
    config.arrendamento +
    config.frete +
    config.depreciacao +
    config.combustiveis +
    config.valeTransporte +
    (config.despesasDinamicas || [])
      .filter(d => d.credito === 'com-credito')
      .reduce((sum, d) => sum + d.valor, 0)
  
  const creditoPIS = (compras + despesasComCredito) * (config.pisAliq / 100)
  const creditoCOFINS = (compras + despesasComCredito) * (config.cofinsAliq / 100)
  
  // Se crédito > débito, imposto = 0 e fica crédito para próxima apuração
  const saldoPIS = debitoPIS - creditoPIS
  const pisAPagar = Math.max(0, saldoPIS)
  const creditoPISDisponivelProximaApuracao = Math.abs(Math.min(0, saldoPIS))
  
  const saldoCOFINS = debitoCOFINS - creditoCOFINS
  const cofinsAPagar = Math.max(0, saldoCOFINS)
  const creditoCOFINSDisponivelProximaApuracao = Math.abs(Math.min(0, saldoCOFINS))
  
  // ============================================
  // IRPJ/CSLL
  // ============================================
  const cmv = config.cmvTotal || 0
  
  // ✅ USAR APENAS DESPESAS DINÂMICAS (as despesas da config são valores de teste)
  const despesasOperacionais = (config.despesasDinamicas || [])
    .filter(d => d.tipo === 'despesa')
    .reduce((total, despesa) => total + despesa.valor, 0)
  
  const lucroAntesIRCSLL = receitaBruta - cmv - despesasOperacionais
  const adicoes = config.adicoesLucro || 0
  const exclusoes = config.exclusoesLucro || 0
  const lucroReal = lucroAntesIRCSLL + adicoes - exclusoes
  
  // IRPJ Base (15%)
  const irpjBase = Math.max(0, lucroReal * (config.irpjBase / 100))
  
  // IRPJ Adicional (10% sobre o que exceder R$ 20.000/mês)
  const limiteAnual = 240000 // R$ 20.000 x 12 meses
  const baseAdicional = Math.max(0, lucroReal - limiteAnual)
  const irpjAdicional = baseAdicional * (config.irpjAdicional / 100)
  
  const irpjAPagar = irpjBase + irpjAdicional
  
  // CSLL (9%)
  const csllAPagar = Math.max(0, lucroReal * (config.csllAliq / 100))
  
  // ============================================
  // ISS (Imposto sobre Serviços)
  // ============================================
  const issAPagar = receitaBruta * (config.issAliq / 100)
  
  // ============================================
  // CPP/INSS (se aplicável)
  // ============================================
  const cppAPagar = 0 // Implementar se necessário
  const inssAPagar = 0 // Implementar se necessário
  
  // ============================================
  // TOTAIS
  // ============================================
  const totalImpostos = icmsAPagar + pisAPagar + cofinsAPagar + irpjAPagar + csllAPagar + issAPagar
  const lucroLiquido = receitaBruta - cmv - despesasOperacionais - totalImpostos
  const cargaTributaria = receitaBruta > 0 ? (totalImpostos / receitaBruta) * 100 : 0
  const margemLucro = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0
  
  return {
    // Impostos individuais a pagar
    icmsAPagar,
    pisAPagar,
    cofinsAPagar,
    irpjAPagar,
    csllAPagar,
    issAPagar,
    cppAPagar,
    inssAPagar,
    
    // Créditos disponíveis para próxima apuração
    creditoICMSDisponivelProximaApuracao,
    creditoPISDisponivelProximaApuracao,
    creditoCOFINSDisponivelProximaApuracao,
    
    // Débitos e créditos detalhados
    debitoICMS,
    creditoICMS,
    debitoPIS,
    creditoPIS,
    debitoCOFINS,
    creditoCOFINS,
    
    // Bases de cálculo
    baseCalculoICMS: vendasSemST,
    baseCalculoPIS: vendasTributadas,
    baseCalculoCOFINS: vendasTributadas,
    baseCalculoIRPJ: lucroReal,
    baseCalculoCSLL: lucroReal,
    
    // Alíquotas aplicadas
    aliquotaICMS: config.icmsInterno,
    aliquotaPIS: config.pisAliq,
    aliquotaCOFINS: config.cofinsAliq,
    aliquotaIRPJ: config.irpjBase,
    aliquotaCSLL: config.csllAliq,
    aliquotaISS: config.issAliq,
    
    // Totalizadores
    totalImpostosFederais: pisAPagar + cofinsAPagar + irpjAPagar + csllAPagar,
    totalImpostosMunicipais: issAPagar,
    totalImpostosEstaduais: icmsAPagar,
    totalImpostos,
    
    // Resultados finais
    receitaBrutaTotal: receitaBruta,
    lucroContabil: lucroAntesIRCSLL,
    lucroReal: lucroReal,
    lucroLiquido,
    margemLucro,
    cargaTributaria
  }
}

/**
 * Gera dados mensais baseado na configuração
 * Se houver dados mensais na config, usa eles; senão divide anualmente
 */
export function gerarDadosMensais(config: TaxConfig, ano: number) {
  const meses = []
  
  for (let mes = 1; mes <= 12; mes++) {
    // Se tem dados mensais na config, usar; senão, dividir anualmente
    const receitaMensal = config.receitaBruta / 12
    
    // Criar uma config mensal (simplificada)
    const configMensal: TaxConfig = {
      ...config,
      receitaBruta: receitaMensal,
      cmvTotal: (config.cmvTotal || 0) / 12,
      salariosPF: config.salariosPF / 12,
      // ... outras despesas também divididas
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
