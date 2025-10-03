import { useMemo } from 'react';
import { useTaxStore } from './use-tax-store';
import { useMemoriaICMS } from './use-memoria-icms';
import { useMemoriaPISCOFINS } from './use-memoria-pis-cofins';
import { useMemoriaIRPJCSLL } from './use-memoria-irpj-csll';
import { useDRECalculation } from './use-dre-calculation';

/**
 * Hook principal que agrega todos os cálculos tributários
 */
export function useTaxCalculations() {
  const { config } = useTaxStore();
  
  const memoriaICMS = useMemoriaICMS(config);
  const memoriaPISCOFINS = useMemoriaPISCOFINS(config);
  const memoriaIRPJCSLL = useMemoriaIRPJCSLL(config);
  const dre = useDRECalculation(config);

  // Resumo para Dashboard
  const summary = useMemo(() => {
    const receitaBruta = config.receitaBruta;
    const totalImpostos = 
      memoriaICMS.icmsAPagar +
      memoriaPISCOFINS.totalPISCOFINS +
      memoriaIRPJCSLL.totalIRPJCSLL +
      (receitaBruta * config.issAliq) / 100;

    const cargaTributaria = receitaBruta > 0 ? (totalImpostos / receitaBruta) * 100 : 0;

    return {
      receitaBruta,
      icms: memoriaICMS.icmsAPagar,
      pisCofins: memoriaPISCOFINS.totalPISCOFINS,
      irpjCsll: memoriaIRPJCSLL.totalIRPJCSLL,
      iss: (receitaBruta * config.issAliq) / 100,
      totalImpostos,
      cargaTributaria,
      lucroLiquido: dre.lucroLiquido,
      margemLiquida: dre.margemLiquida,
    };
  }, [config, memoriaICMS, memoriaPISCOFINS, memoriaIRPJCSLL, dre]);

  return {
    config,
    memoriaICMS,
    memoriaPISCOFINS,
    memoriaIRPJCSLL,
    dre,
    summary,
  };
}
