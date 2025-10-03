import { useMemo } from 'react';
import type { TaxConfig, DREData } from '@/types';
import { useMemoriaICMS } from './use-memoria-icms';
import { useMemoriaPISCOFINS } from './use-memoria-pis-cofins';
import { useMemoriaIRPJCSLL } from './use-memoria-irpj-csll';

/**
 * Hook para cálculos da DRE (Demonstração do Resultado do Exercício)
 */
export function useDRECalculation(config: TaxConfig): DREData {
  const memoriaICMS = useMemoriaICMS(config);
  const memoriaPISCOFINS = useMemoriaPISCOFINS(config);
  const memoriaIRPJCSLL = useMemoriaIRPJCSLL(config);

  return useMemo(() => {
    const receitaBrutaVendas = config.receitaBruta;

    // Deduções da Receita Bruta
    const icms = memoriaICMS.icmsAPagar;
    const pis = memoriaPISCOFINS.pisAPagar;
    const cofins = memoriaPISCOFINS.cofinsAPagar;
    const pisCofins = memoriaPISCOFINS.totalPISCOFINS;
    const iss = (config.receitaBruta * config.issAliq) / 100;
    const totalDeducoes = icms + pisCofins + iss;

    const receitaLiquida = receitaBrutaVendas - totalDeducoes;

    // CMV
    const cmv = config.cmvTotal;

    // Lucro Bruto
    const lucroBruto = receitaLiquida - cmv;

    // Despesas Operacionais - APENAS despesas dinâmicas tipo "despesa"
    // (Despesas fixas antigas foram migradas para despesas dinâmicas)
    const despesasDinamicas = (config.despesasDinamicas || [])
      .filter(d => d.tipo === 'despesa')
      .reduce((total, despesa) => total + despesa.valor, 0);
    
    const totalDespesasOperacionais = despesasDinamicas;

    // Lucro Antes IR/CSLL
    const lucroAntesIRCSLL = lucroBruto - totalDespesasOperacionais;

    // Impostos sobre Lucro
    const irpj = memoriaIRPJCSLL.totalIRPJ;
    const csll = memoriaIRPJCSLL.csll.valor;
    const totalImpostos = irpj + csll;

    // Lucro Líquido
    const lucroLiquido = lucroAntesIRCSLL - totalImpostos;

    // Margens
    const margemBruta = receitaBrutaVendas > 0 ? (lucroBruto / receitaBrutaVendas) * 100 : 0;
    const margemLiquida = receitaBrutaVendas > 0 ? (lucroLiquido / receitaBrutaVendas) * 100 : 0;

    return {
      receitaBrutaVendas,
      deducoes: {
        icms,
        pis,
        cofins,
        pisCofins,
        iss,
        total: totalDeducoes,
      },
      receitaLiquida,
      cmv,
      lucroBruto,
      despesasOperacionais: {
        despesasDinamicas,
        total: totalDespesasOperacionais,
      },
      lucroAntesIRCSLL,
      impostos: {
        irpj,
        csll,
        total: totalImpostos,
      },
      lucroLiquido,
      margemBruta,
      margemLiquida,
    };
  }, [config, memoriaICMS, memoriaPISCOFINS, memoriaIRPJCSLL]);
}
