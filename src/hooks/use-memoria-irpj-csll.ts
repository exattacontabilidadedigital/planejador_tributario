import { useMemo } from 'react';
import type { TaxConfig, MemoriaIRPJCSLL } from '@/types';

/**
 * Hook para cálculos da Memória de IRPJ/CSLL
 */
export function useMemoriaIRPJCSLL(config: TaxConfig): MemoriaIRPJCSLL {
  return useMemo(() => {
    // Base de Cálculo
    const receitaBruta = config.receitaBruta;
    const cmv = config.cmvTotal;
    
    // Somatório das despesas dinâmicas (somente tipo "despesa")
    const despesasDinamicasTotal = (config.despesasDinamicas || [])
      .filter(d => d.tipo === 'despesa')
      .reduce((total, despesa) => total + despesa.valor, 0);
    
    // Despesas operacionais fixas + despesas dinâmicas
    const despesasOperacionais =
      config.salariosPF +
      config.energiaEletrica +
      config.alugueis +
      config.alimentacao +
      config.combustivelPasseio +
      config.outrasDespesas +
      config.arrendamento +
      config.frete +
      config.depreciacao +
      config.combustiveis +
      config.valeTransporte +
      despesasDinamicasTotal; // Adiciona despesas dinâmicas

    const lucroAntesIRCSLL = receitaBruta - cmv - despesasOperacionais;
    
    const adicoes = config.adicoesLucro;
    const exclusoes = config.exclusoesLucro;
    
    const lucroReal = lucroAntesIRCSLL + adicoes - exclusoes;

    // IRPJ Base (15% sobre lucro real)
    const irpjBase = {
      base: lucroReal,
      aliquota: config.irpjBase,
      valor: (lucroReal * config.irpjBase) / 100,
    };

    // IRPJ Adicional (10% sobre o que exceder o limite)
    const limiteAnual = config.limiteIrpj * 12; // Limite mensal -> anual
    const baseAdicional = Math.max(0, lucroReal - limiteAnual);
    
    const irpjAdicional = {
      base: baseAdicional,
      aliquota: config.irpjAdicional,
      valor: (baseAdicional * config.irpjAdicional) / 100,
    };

    const totalIRPJ = irpjBase.valor + irpjAdicional.valor;

    // CSLL (9% sobre lucro real)
    const csll = {
      base: lucroReal,
      aliquota: config.csllAliq,
      valor: (lucroReal * config.csllAliq) / 100,
    };

    const totalIRPJCSLL = totalIRPJ + csll.valor;

    return {
      receitaBruta,
      cmv,
      despesasOperacionais,
      lucroAntesIRCSLL,
      adicoes,
      exclusoes,
      lucroReal,
      irpjBase,
      irpjAdicional,
      totalIRPJ,
      csll,
      totalIRPJCSLL,
      limiteAnual,
    };
  }, [config]);
}
