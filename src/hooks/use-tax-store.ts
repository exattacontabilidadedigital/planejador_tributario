import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaxConfig, TabSection } from '@/types';

interface TaxStore {
  config: TaxConfig;
  activeTab: TabSection;
  updateConfig: (config: Partial<TaxConfig>) => void;
  setConfig: (config: TaxConfig) => void;
  setActiveTab: (tab: TabSection) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: TaxConfig = {
  // Alíquotas
  icmsInterno: 18,
  icmsSul: 12,
  icmsNorte: 7,
  difal: 6,
  fcp: 2,
  pisAliq: 1.65,
  cofinsAliq: 7.6,
  irpjBase: 15,
  irpjAdicional: 10,
  limiteIrpj: 20000,
  csllAliq: 9,
  issAliq: 5,

  // Valores Financeiros
  receitaBruta: 1000000,
  vendasInternas: 70,
  vendasInterestaduais: 30,
  consumidorFinal: 30,

  // Regimes Especiais de Tributação
  percentualST: 0,
  percentualMonofasico: 0,

  // Compras e Custos
  comprasInternas: 300000,
  comprasInterestaduais: 200000,
  comprasUso: 100000,
  cmvTotal: 500000,

  // Despesas com Crédito PIS/COFINS
  energiaEletrica: 15000,
  alugueis: 25000,
  arrendamento: 10000,
  frete: 8000,
  depreciacao: 12000,
  combustiveis: 5000,
  valeTransporte: 3000,

  // Despesas sem Crédito
  salariosPF: 80000,
  alimentacao: 15000,
  combustivelPasseio: 3000,
  outrasDespesas: 35000,

  // Ajustes IRPJ/CSLL
  adicoesLucro: 13000,
  exclusoesLucro: 3000,

  // Créditos Adicionais ICMS
  creditoEstoqueInicial: 5000,
  creditoAtivoImobilizado: 8000,
  creditoEnergiaIndustria: 2000,
  creditoSTEntrada: 3000,
  outrosCreditos: 1000,
};

export const useTaxStore = create<TaxStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      activeTab: 'dashboard',
      
      updateConfig: (newConfig) =>
        set((state) => {
          const updatedConfig = { ...state.config, ...newConfig };
          
          // Auto-calcular vendas interestaduais
          if (newConfig.vendasInternas !== undefined) {
            updatedConfig.vendasInterestaduais = 100 - newConfig.vendasInternas;
          }
          
          return { config: updatedConfig };
        }),
      
      setConfig: (config) => set({ config }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      resetConfig: () => set({ config: DEFAULT_CONFIG }),
    }),
    {
      name: 'tax-planner-storage',
    }
  )
);
