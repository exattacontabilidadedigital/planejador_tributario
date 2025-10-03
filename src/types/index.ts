// ========================================
// TIPOS DE DESPESAS DINÂMICAS
// ========================================

export type DespesaTipo = "custo" | "despesa";
export type DespesaCredito = "com-credito" | "sem-credito";

export interface DespesaItem {
  id: string;
  descricao: string;
  valor: number;
  tipo: DespesaTipo; // "custo" ou "despesa" (para DRE)
  credito: DespesaCredito; // "com-credito" ou "sem-credito"
  categoria?: string; // Opcional: energia, frete, salários, etc.
}

// ========================================
// TIPOS DE CONFIGURAÇÃO
// ========================================

export interface TaxConfig {
  // Alíquotas
  icmsInterno: number;
  icmsSul: number;
  icmsNorte: number;
  difal: number;
  fcp: number;
  pisAliq: number;
  cofinsAliq: number;
  irpjBase: number;
  irpjAdicional: number;
  limiteIrpj: number;
  csllAliq: number;
  issAliq: number;

  // Valores Financeiros
  receitaBruta: number;
  vendasInternas: number; // Percentual
  vendasInterestaduais: number; // Percentual (calculado)
  consumidorFinal: number; // Percentual

  // Regimes Especiais de Tributação
  percentualST: number; // Percentual de vendas com Substituição Tributária (não tributa ICMS)
  percentualMonofasico: number; // Percentual de vendas com PIS/COFINS Monofásico (não tributa PIS/COFINS)

  // Compras e Custos
  comprasInternas: number;
  comprasInterestaduais: number;
  comprasUso: number;
  cmvTotal: number;

  // Despesas com Crédito PIS/COFINS
  energiaEletrica: number;
  alugueis: number;
  arrendamento: number;
  frete: number;
  depreciacao: number;
  combustiveis: number;
  valeTransporte: number;

  // Despesas sem Crédito
  salariosPF: number;
  alimentacao: number;
  combustivelPasseio: number;
  outrasDespesas: number;

  // Ajustes IRPJ/CSLL
  adicoesLucro: number;
  exclusoesLucro: number;

  // Créditos Adicionais ICMS
  creditoEstoqueInicial: number;
  creditoAtivoImobilizado: number;
  creditoEnergiaIndustria: number;
  creditoSTEntrada: number;
  outrosCreditos: number;

  // Despesas Dinâmicas (PIS/COFINS)
  despesasDinamicas?: DespesaItem[];
}

// ========================================
// TIPOS DE CÁLCULOS
// ========================================

export interface MemoriaICMS {
  // Débitos
  vendasInternas: {
    base: number;
    aliquota: number;
    valor: number;
  };
  vendasInterestaduais: {
    base: number;
    aliquota: number;
    valor: number;
  };
  difal: {
    base: number;
    aliquota: number;
    valor: number;
  };
  fcp: {
    base: number;
    aliquota: number;
    valor: number;
  };

  // Créditos
  creditoComprasInternas: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoComprasInterestaduais: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoEstoqueInicial: {
    base: number;
    valor: number;
  };
  creditoAtivoImobilizado: {
    base: number;
    valor: number;
  };
  creditoEnergia: {
    base: number;
    valor: number;
  };
  creditoST: {
    base: number;
    valor: number;
  };
  outrosCreditos: {
    base: number;
    valor: number;
  };

  // Totais
  totalDebitos: number;
  totalCreditos: number;
  icmsAPagar: number;
}

export interface MemoriaPISCOFINS {
  // Débitos
  debitoPIS: {
    base: number;
    aliquota: number;
    valor: number;
  };
  debitoCOFINS: {
    base: number;
    aliquota: number;
    valor: number;
  };

  // Créditos
  creditoPISCompras: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSCompras: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoPISEnergia: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSEnergia: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoPISAluguel: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSAluguel: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoPISArrendamento: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSArrendamento: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoPISFrete: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSFrete: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoPISDepreciacao: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSDepreciacao: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoPISCombustivel: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSCombustivel: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoPISValeTransporte: {
    base: number;
    aliquota: number;
    valor: number;
  };
  creditoCOFINSValeTransporte: {
    base: number;
    aliquota: number;
    valor: number;
  };

  // Totais
  totalDebitosPIS: number;
  totalCreditosPIS: number;
  pisAPagar: number;
  totalDebitosCOFINS: number;
  totalCreditosCOFINS: number;
  cofinsAPagar: number;
  totalPISCOFINS: number;
}

export interface MemoriaIRPJCSLL {
  // Base de Cálculo
  receitaBruta: number;
  cmv: number;
  despesasOperacionais: number;
  lucroAntesIRCSLL: number;
  adicoes: number;
  exclusoes: number;
  lucroReal: number;
  limiteAnual: number;

  // IRPJ
  irpjBase: {
    base: number;
    aliquota: number;
    valor: number;
  };
  irpjAdicional: {
    base: number;
    aliquota: number;
    valor: number;
  };
  totalIRPJ: number;

  // CSLL
  csll: {
    base: number;
    aliquota: number;
    valor: number;
  };

  // Total
  totalIRPJCSLL: number;
}

export interface DREData {
  receitaBrutaVendas: number;
  deducoes: {
    icms: number;
    pis: number;
    cofins: number;
    pisCofins: number;
    iss: number;
    total: number;
  };
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: {
    salariosPF: number;
    energia: number;
    alugueis: number;
    arrendamento: number;
    frete: number;
    depreciacao: number;
    combustiveis: number;
    valeTransporte: number;
    valeAlimentacao: number;
    combustivelPasseio: number;
    outras: number;
    despesasDinamicas: number;
    total: number;
  };
  lucroAntesIRCSLL: number;
  impostos: {
    irpj: number;
    csll: number;
    total: number;
  };
  lucroLiquido: number;
  margemBruta: number;
  margemLiquida: number;
}

// ========================================
// TIPOS DE UI/ESTADO
// ========================================

export type TabSection = 
  | "configuracoes"
  | "dashboard"
  | "memoria-icms"
  | "memoria-pis-cofins"
  | "memoria-irpj-csll"
  | "dre"
  | "cenarios";

export interface AppState {
  config: TaxConfig;
  activeTab: TabSection;
  isDarkMode: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// ========================================
// TIPOS DE UTILITÁRIOS
// ========================================

export type CurrencyValue = number;
export type PercentageValue = number;

export interface ValidationError {
  field: string;
  message: string;
}

// ========================================
// TIPOS DE CENÁRIOS
// ========================================

export interface ScenarioMetadata {
  id: string
  name: string
  description?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  favorite?: boolean
}

export interface Scenario {
  metadata: ScenarioMetadata
  config: TaxConfig
  calculations?: {
    icms: number
    pisCofins: number
    irpjCsll: number
    iss: number
    totalImpostos: number
    cargaTributaria: number
    lucroLiquido: number
  }
}

export interface ScenarioComparison {
  scenarios: Scenario[]
  differences: {
    field: keyof TaxConfig
    label: string
    values: number[]
    variance: number
    percentageChange: number
  }[]
  calculationDifferences: {
    metric: string
    label: string
    values: number[]
    variance: number
    percentageChange: number
  }[]
}

export interface ScenarioFilter {
  searchTerm?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
