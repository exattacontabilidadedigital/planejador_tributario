import { useMemo } from 'react';
import type { TaxConfig, MemoriaPISCOFINS } from '@/types';

/**
 * Hook para cálculos da Memória de PIS/COFINS
 */
export function useMemoriaPISCOFINS(config: TaxConfig): MemoriaPISCOFINS {
  return useMemo(() => {
    // Percentual de vendas com Regime Monofásico (não tributa PIS/COFINS)
    const percentualTributavel = 100 - (config.percentualMonofasico || 0);
    const fatorMonofasico = percentualTributavel / 100;

    // DÉBITOS (aplicando fator monofásico para deduzir vendas monofásicas)
    const debitoPIS = {
      base: config.receitaBruta * fatorMonofasico,
      aliquota: config.pisAliq,
      valor: (config.receitaBruta * fatorMonofasico * config.pisAliq) / 100,
    };

    const debitoCOFINS = {
      base: config.receitaBruta * fatorMonofasico,
      aliquota: config.cofinsAliq,
      valor: (config.receitaBruta * fatorMonofasico * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Compras
    const baseCompras = config.comprasInternas + config.comprasInterestaduais;
    
    const creditoPISCompras = {
      base: baseCompras,
      aliquota: config.pisAliq,
      valor: (baseCompras * config.pisAliq) / 100,
    };

    const creditoCOFINSCompras = {
      base: baseCompras,
      aliquota: config.cofinsAliq,
      valor: (baseCompras * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Despesas Dinâmicas COM Crédito
    const despesasComCredito = (config.despesasDinamicas || [])
      .filter(d => d.credito === 'com-credito')
      .reduce((total, despesa) => total + despesa.valor, 0);

    const creditoPISDespesas = {
      base: despesasComCredito,
      aliquota: config.pisAliq,
      valor: (despesasComCredito * config.pisAliq) / 100,
    };

    const creditoCOFINSDespesas = {
      base: despesasComCredito,
      aliquota: config.cofinsAliq,
      valor: (despesasComCredito * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Estoque Inicial (similar ao ICMS)
    const creditoPISEstoqueInicial = {
      base: config.creditoPISEstoqueInicial || 0,
      valor: config.creditoPISEstoqueInicial || 0,
    };

    const creditoCOFINSEstoqueInicial = {
      base: config.creditoCOFINSEstoqueInicial || 0,
      valor: config.creditoCOFINSEstoqueInicial || 0,
    };

    // CRÉDITOS - Outros Créditos (similar ao ICMS)
    const creditoPISOutros = {
      base: config.creditoPISOutros || 0,
      valor: config.creditoPISOutros || 0,
    };

    const creditoCOFINSOutros = {
      base: config.creditoCOFINSOutros || 0,
      valor: config.creditoCOFINSOutros || 0,
    };

    // TOTALIZADORES
    const totalDebitosPIS = debitoPIS.valor;
    const totalCreditosPIS = 
      creditoPISCompras.valor + 
      creditoPISDespesas.valor +
      creditoPISEstoqueInicial.valor +
      creditoPISOutros.valor;

    // Se crédito > débito, imposto = 0 e fica crédito para próxima apuração
    const saldoPIS = totalDebitosPIS - totalCreditosPIS;
    const pisAPagar = Math.max(0, saldoPIS);
    const creditoPISDisponivelProximaApuracao = Math.abs(Math.min(0, saldoPIS));

    const totalDebitosCOFINS = debitoCOFINS.valor;
    const totalCreditosCOFINS = 
      creditoCOFINSCompras.valor + 
      creditoCOFINSDespesas.valor +
      creditoCOFINSEstoqueInicial.valor +
      creditoCOFINSOutros.valor;

    const saldoCOFINS = totalDebitosCOFINS - totalCreditosCOFINS;
    const cofinsAPagar = Math.max(0, saldoCOFINS);
    const creditoCOFINSDisponivelProximaApuracao = Math.abs(Math.min(0, saldoCOFINS));

    const totalPISCOFINS = pisAPagar + cofinsAPagar;

    return {
      debitoPIS,
      debitoCOFINS,
      creditoPISCompras,
      creditoCOFINSCompras,
      creditoPISDespesas,
      creditoCOFINSDespesas,
      creditoPISEstoqueInicial,
      creditoCOFINSEstoqueInicial,
      creditoPISOutros,
      creditoCOFINSOutros,
      despesasComCredito: (config.despesasDinamicas || []).filter(d => d.credito === 'com-credito'),
      totalDebitosPIS,
      totalCreditosPIS,
      pisAPagar,
      creditoPISDisponivelProximaApuracao,
      totalDebitosCOFINS,
      totalCreditosCOFINS,
      cofinsAPagar,
      creditoCOFINSDisponivelProximaApuracao,
      totalPISCOFINS,
    };
  }, [config]);
}
