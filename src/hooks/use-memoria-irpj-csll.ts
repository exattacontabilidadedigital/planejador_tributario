import { useMemo } from 'react';
import type { TaxConfig, MemoriaIRPJCSLL } from '@/types';
import { useMemoriaICMS } from './use-memoria-icms';
import { useMemoriaPISCOFINS } from './use-memoria-pis-cofins';

/**
 * Hook para cálculos da Memória de IRPJ/CSLL
 * Segue estrutura da DRE: Receita Bruta - Deduções - CMV - Despesas = LAIR
 */
export function useMemoriaIRPJCSLL(config: TaxConfig): MemoriaIRPJCSLL {
  // Calcular impostos sobre faturamento (deduções da receita)
  const memoriaICMS = useMemoriaICMS(config);
  const memoriaPISCOFINS = useMemoriaPISCOFINS(config);

  return useMemo(() => {
    // ═══════════════════════════════════════════════════════════════
    // ETAPA 1: RECEITA BRUTA E DEDUÇÕES
    // ═══════════════════════════════════════════════════════════════
    const receitaBruta = config.receitaBruta;
    
    // Deduções da Receita (impostos sobre faturamento)
    const icms = memoriaICMS.icmsAPagar;
    const pis = memoriaPISCOFINS.pisAPagar;
    const cofins = memoriaPISCOFINS.cofinsAPagar;
    const iss = (config.receitaBruta * config.issAliq) / 100;
    const totalDeducoes = icms + pis + cofins + iss;
    
    const receitaLiquida = receitaBruta - totalDeducoes;
    
    // ═══════════════════════════════════════════════════════════════
    // ETAPA 2: CMV E LUCRO BRUTO
    // ═══════════════════════════════════════════════════════════════
    const cmv = config.cmvTotal;
    const lucroBruto = receitaLiquida - cmv;
    
    // ═══════════════════════════════════════════════════════════════
    // ETAPA 3: DESPESAS OPERACIONAIS E LAIR
    // ═══════════════════════════════════════════════════════════════
    // Somatório das despesas dinâmicas (somente tipo "despesa")
    // ✅ USAR APENAS DESPESAS DINÂMICAS (as despesas da config são valores de teste)
    const despesasOperacionais = (config.despesasDinamicas || [])
      .filter(d => d.tipo === 'despesa')
      .reduce((total, despesa) => total + despesa.valor, 0);

    const lucroAntesIRCSLL = lucroBruto - despesasOperacionais;
    
    const adicoes = config.adicoesLucro;
    const exclusoes = config.exclusoesLucro;
    
    const lucroReal = lucroAntesIRCSLL + adicoes - exclusoes;

    // IRPJ Base (15% sobre lucro real)
    const irpjBase = {
      base: lucroReal,
      aliquota: config.irpjBase,
      valor: (lucroReal * config.irpjBase) / 100,
    };

    // ═══════════════════════════════════════════════════════════════
    // IRPJ Adicional (10% sobre o que exceder o limite)
    // ═══════════════════════════════════════════════════════════════
    // Limites conforme período de apuração:
    // - Mensal: R$ 20.000
    // - Trimestral: R$ 60.000 (R$ 20.000 × 3 meses)
    // - Anual: R$ 240.000 (R$ 20.000 × 12 meses)
    const limitePorPeriodo = {
      mensal: 20000,
      trimestral: 60000,
      anual: 240000,
    };
    
    const periodoPagamento = config.periodoPagamento || 'mensal';
    const limiteAdicional = limitePorPeriodo[periodoPagamento];
    const baseAdicional = Math.max(0, lucroReal - limiteAdicional);
    
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
      // Valores de Receita e Deduções
      receitaBruta,
      totalDeducoes,
      receitaLiquida,
      
      // Valores de Custo e Margens
      cmv,
      lucroBruto,
      
      // Valores Operacionais
      despesasOperacionais,
      lucroAntesIRCSLL,
      
      // Ajustes fiscais
      adicoes,
      exclusoes,
      lucroReal,
      
      // IRPJ
      irpjBase,
      irpjAdicional,
      totalIRPJ,
      
      // CSLL
      csll,
      
      // Total e Limites
      totalIRPJCSLL,
      limiteAdicional,
      periodoPagamento,
    };
  }, [config, memoriaICMS, memoriaPISCOFINS]);
}
