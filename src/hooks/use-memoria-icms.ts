import { useMemo } from 'react';
import type { TaxConfig, MemoriaICMS } from '@/types';

/**
 * Hook para cálculos da Memória de ICMS
 */
export function useMemoriaICMS(config: TaxConfig): MemoriaICMS {
  return useMemo(() => {
    // Percentual de vendas com Substituição Tributária (não tributa ICMS)
    const percentualTributavel = 100 - (config.percentualST || 0);
    const fatorST = percentualTributavel / 100;

    // Valores base (aplicando fator de ST para deduzir vendas com ST)
    const vendasInternasBase = (config.receitaBruta * config.vendasInternas) / 100;
    const vendasInterestaduaisBase = (config.receitaBruta * config.vendasInterestaduais) / 100;
    const consumidorFinalBase = (config.receitaBruta * config.consumidorFinal) / 100;

    // DÉBITOS (aplicando fator ST apenas nas vendas tributáveis)
    const vendasInternas = {
      base: vendasInternasBase * fatorST,
      aliquota: config.icmsInterno,
      valor: (vendasInternasBase * fatorST * config.icmsInterno) / 100,
    };

    const vendasInterestaduais = {
      base: vendasInterestaduaisBase * fatorST,
      aliquota: config.icmsSul,
      valor: (vendasInterestaduaisBase * fatorST * config.icmsSul) / 100,
    };

    const difal = {
      base: consumidorFinalBase * fatorST,
      aliquota: config.difal,
      valor: (consumidorFinalBase * fatorST * config.difal) / 100,
    };

    const fcp = {
      base: consumidorFinalBase * fatorST,
      aliquota: config.fcp,
      valor: (consumidorFinalBase * fatorST * config.fcp) / 100,
    };

    // CRÉDITOS
    const creditoComprasInternas = {
      base: config.comprasInternas,
      aliquota: config.icmsInterno,
      valor: (config.comprasInternas * config.icmsInterno) / 100,
    };

    const creditoComprasInterestaduais = {
      base: config.comprasInterestaduais,
      aliquota: config.icmsSul,
      valor: (config.comprasInterestaduais * config.icmsSul) / 100,
    };

    const creditoEstoqueInicial = {
      base: config.creditoEstoqueInicial,
      valor: config.creditoEstoqueInicial,
    };

    const creditoAtivoImobilizado = {
      base: config.creditoAtivoImobilizado,
      valor: config.creditoAtivoImobilizado,
    };

    const creditoEnergia = {
      base: config.creditoEnergiaIndustria,
      valor: config.creditoEnergiaIndustria,
    };

    const creditoST = {
      base: config.creditoSTEntrada,
      valor: config.creditoSTEntrada,
    };

    const outrosCreditos = {
      base: config.outrosCreditos,
      valor: config.outrosCreditos,
    };

    // TOTALIZADORES
    const totalDebitos = 
      vendasInternas.valor +
      vendasInterestaduais.valor +
      difal.valor +
      fcp.valor;

    const totalCreditos =
      creditoComprasInternas.valor +
      creditoComprasInterestaduais.valor +
      creditoEstoqueInicial.valor +
      creditoAtivoImobilizado.valor +
      creditoEnergia.valor +
      creditoST.valor +
      outrosCreditos.valor;

    // Se crédito > débito, ICMS = 0 e fica crédito para próxima apuração
    const saldoICMS = totalDebitos - totalCreditos;
    const icmsAPagar = Math.max(0, saldoICMS);
    const creditoDisponivelProximaApuracao = Math.abs(Math.min(0, saldoICMS));

    return {
      vendasInternas,
      vendasInterestaduais,
      difal,
      fcp,
      creditoComprasInternas,
      creditoComprasInterestaduais,
      creditoEstoqueInicial,
      creditoAtivoImobilizado,
      creditoEnergia,
      creditoST,
      outrosCreditos,
      totalDebitos,
      totalCreditos,
      icmsAPagar,
      creditoDisponivelProximaApuracao,
    };
  }, [config]);
}
