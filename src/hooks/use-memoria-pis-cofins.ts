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

    // CRÉDITOS - Energia Elétrica
    const creditoPISEnergia = {
      base: config.energiaEletrica,
      aliquota: config.pisAliq,
      valor: (config.energiaEletrica * config.pisAliq) / 100,
    };

    const creditoCOFINSEnergia = {
      base: config.energiaEletrica,
      aliquota: config.cofinsAliq,
      valor: (config.energiaEletrica * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Aluguéis
    const creditoPISAluguel = {
      base: config.alugueis,
      aliquota: config.pisAliq,
      valor: (config.alugueis * config.pisAliq) / 100,
    };

    const creditoCOFINSAluguel = {
      base: config.alugueis,
      aliquota: config.cofinsAliq,
      valor: (config.alugueis * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Arrendamento
    const creditoPISArrendamento = {
      base: config.arrendamento,
      aliquota: config.pisAliq,
      valor: (config.arrendamento * config.pisAliq) / 100,
    };

    const creditoCOFINSArrendamento = {
      base: config.arrendamento,
      aliquota: config.cofinsAliq,
      valor: (config.arrendamento * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Frete
    const creditoPISFrete = {
      base: config.frete,
      aliquota: config.pisAliq,
      valor: (config.frete * config.pisAliq) / 100,
    };

    const creditoCOFINSFrete = {
      base: config.frete,
      aliquota: config.cofinsAliq,
      valor: (config.frete * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Depreciação
    const creditoPISDepreciacao = {
      base: config.depreciacao,
      aliquota: config.pisAliq,
      valor: (config.depreciacao * config.pisAliq) / 100,
    };

    const creditoCOFINSDepreciacao = {
      base: config.depreciacao,
      aliquota: config.cofinsAliq,
      valor: (config.depreciacao * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Combustíveis
    const creditoPISCombustivel = {
      base: config.combustiveis,
      aliquota: config.pisAliq,
      valor: (config.combustiveis * config.pisAliq) / 100,
    };

    const creditoCOFINSCombustivel = {
      base: config.combustiveis,
      aliquota: config.cofinsAliq,
      valor: (config.combustiveis * config.cofinsAliq) / 100,
    };

    // CRÉDITOS - Vale Transporte
    const creditoPISValeTransporte = {
      base: config.valeTransporte,
      aliquota: config.pisAliq,
      valor: (config.valeTransporte * config.pisAliq) / 100,
    };

    const creditoCOFINSValeTransporte = {
      base: config.valeTransporte,
      aliquota: config.cofinsAliq,
      valor: (config.valeTransporte * config.cofinsAliq) / 100,
    };

    // TOTALIZADORES
    const totalDebitosPIS = debitoPIS.valor;
    const totalCreditosPIS =
      creditoPISCompras.valor +
      creditoPISEnergia.valor +
      creditoPISAluguel.valor +
      creditoPISArrendamento.valor +
      creditoPISFrete.valor +
      creditoPISDepreciacao.valor +
      creditoPISCombustivel.valor +
      creditoPISValeTransporte.valor;

    const pisAPagar = Math.max(0, totalDebitosPIS - totalCreditosPIS);

    const totalDebitosCOFINS = debitoCOFINS.valor;
    const totalCreditosCOFINS =
      creditoCOFINSCompras.valor +
      creditoCOFINSEnergia.valor +
      creditoCOFINSAluguel.valor +
      creditoCOFINSArrendamento.valor +
      creditoCOFINSFrete.valor +
      creditoCOFINSDepreciacao.valor +
      creditoCOFINSCombustivel.valor +
      creditoCOFINSValeTransporte.valor;

    const cofinsAPagar = Math.max(0, totalDebitosCOFINS - totalCreditosCOFINS);

    const totalPISCOFINS = pisAPagar + cofinsAPagar;

    return {
      debitoPIS,
      debitoCOFINS,
      creditoPISCompras,
      creditoCOFINSCompras,
      creditoPISEnergia,
      creditoCOFINSEnergia,
      creditoPISAluguel,
      creditoCOFINSAluguel,
      creditoPISArrendamento,
      creditoCOFINSArrendamento,
      creditoPISFrete,
      creditoCOFINSFrete,
      creditoPISDepreciacao,
      creditoCOFINSDepreciacao,
      creditoPISCombustivel,
      creditoCOFINSCombustivel,
      creditoPISValeTransporte,
      creditoCOFINSValeTransporte,
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
