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

    // TOTALIZADORES
    const totalDebitosPIS = debitoPIS.valor;
    const totalCreditosPIS = creditoPISCompras.valor + creditoPISDespesas.valor;

    const pisAPagar = Math.max(0, totalDebitosPIS - totalCreditosPIS);

    const totalDebitosCOFINS = debitoCOFINS.valor;
    const totalCreditosCOFINS = creditoCOFINSCompras.valor + creditoCOFINSDespesas.valor;

    const cofinsAPagar = Math.max(0, totalDebitosCOFINS - totalCreditosCOFINS);

    const totalPISCOFINS = pisAPagar + cofinsAPagar;

    return {
      debitoPIS,
      debitoCOFINS,
      creditoPISCompras,
      creditoCOFINSCompras,
      creditoPISDespesas,
      creditoCOFINSDespesas,
      despesasComCredito: (config.despesasDinamicas || []).filter(d => d.credito === 'com-credito'),
      totalDebitosPIS,
      totalCreditosPIS,
      pisAPagar,
      totalDebitosCOFINS,
      totalCreditosCOFINS,
      cofinsAPagar,
      totalPISCOFINS,
    };
  }, [config]);
}
