/**
 * Constantes da aplicação
 * Centraliza valores fixos para fácil manutenção
 */

/**
 * Alíquotas padrão dos tributos
 */
export const TAX_RATES = {
  PIS: 1.65,
  COFINS: 7.6,
  IRPJ_BASE: 15,
  IRPJ_ADICIONAL: 10,
  CSLL: 9,
  ICMS_INTERNO_SP: 18,
  ICMS_INTERESTADUAL_SUL: 12,
  ISS_PADRAO: 5,
} as const

/**
 * Limites e tetos dos tributos
 */
export const TAX_LIMITS = {
  IRPJ_LIMITE_ISENCAO_ADICIONAL: 20000, // R$ 20.000/mês
  IRPJ_LIMITE_ANUAL_ISENCAO: 240000, // R$ 240.000/ano
  SIMPLES_LIMITE_ANUAL: 4800000, // R$ 4,8 milhões
} as const

/**
 * Mensagens do sistema
 */
export const MENSAGENS = {
  // Sucesso
  EXPORT_ICMS_SUCESSO: "Memória de Cálculo ICMS exportada com sucesso!",
  EXPORT_PIS_COFINS_SUCESSO: "Memória de Cálculo PIS/COFINS exportada com sucesso!",
  EXPORT_IRPJ_CSLL_SUCESSO: "Memória de Cálculo IRPJ/CSLL exportada com sucesso!",
  EXPORT_DRE_SUCESSO: "DRE exportada com sucesso!",
  CONFIG_RESETADA: "Configurações resetadas para valores padrão",
  CONFIG_SALVA: "Configurações salvas com sucesso",

  // Erro
  ERRO_CALCULO: "Erro ao calcular impostos. Verifique os valores informados.",
  ERRO_EXPORT: "Erro ao exportar PDF. Tente novamente.",
  ERRO_VALIDACAO: "Alguns campos possuem valores inválidos",
  ERRO_INESPERADO: "Erro inesperado. Recarregue a página.",

  // Avisos
  AVISO_VALORES_ALTOS: "Alguns valores parecem muito altos. Verifique os dados.",
  AVISO_RECEITA_ZERADA: "Receita bruta está zerada",
  AVISO_CARGA_ALTA: "Carga tributária acima de 40%. Revise o planejamento.",

  // Confirmações
  CONFIRMAR_RESET: "Deseja realmente resetar todas as configurações?",
  CONFIRMAR_RESET_DESC: "Todos os valores serão perdidos e voltarão ao padrão.",
} as const

/**
 * Configurações padrão
 */
export const DEFAULT_VALUES = {
  RECEITA_BRUTA: 1000000,
  VENDAS_INTERNAS: 70,
  VENDAS_INTERESTADUAIS: 20,
  CONSUMIDOR_FINAL: 10,
  ICMS_INTERNO: 18,
  ICMS_SUL: 12,
  DIFAL: 6,
  FCP: 2,
  PIS_ALIQUOTA: 1.65,
  COFINS_ALIQUOTA: 7.6,
  IRPJ_ALIQUOTA: 15,
  IRPJ_ADICIONAL: 10,
  CSLL_ALIQUOTA: 9,
  ISS_ALIQUOTA: 5,
} as const

/**
 * Labels dos campos
 */
export const FIELD_LABELS = {
  receitaBruta: "Receita Bruta",
  vendasInternas: "Vendas Internas",
  vendasInterestaduais: "Vendas Interestaduais",
  consumidorFinal: "Consumidor Final",
  icmsInterno: "ICMS Interno",
  icmsSul: "ICMS Sul/Sudeste",
  difal: "DIFAL",
  fcp: "FCP",
  pisAliquota: "Alíquota PIS",
  cofinsAliquota: "Alíquota COFINS",
  irpjAliquota: "Alíquota IRPJ",
  csllAliquota: "Alíquota CSLL",
} as const

/**
 * Cores dos tributos (Tailwind)
 */
export const TAX_COLORS = {
  ICMS: "text-icms",
  PIS: "text-pis",
  IRPJ: "text-irpj",
  LUCRO: "text-lucro",
  DESTRUCTIVE: "text-destructive",
} as const

/**
 * Categorias de despesas
 */
export const EXPENSE_CATEGORIES = [
  "Custo dos Produtos",
  "Despesas Administrativas",
  "Despesas Comerciais",
  "Despesas Financeiras",
  "Salários",
  "Encargos Sociais",
  "Aluguel",
  "Energia",
  "Depreciação",
  "Marketing",
  "Outros Custos",
] as const

/**
 * Tipos de crédito ICMS
 */
export const ICMS_CREDIT_TYPES = [
  "Compras Internas",
  "Compras Interestaduais",
  "Estoque Inicial",
  "Ativo Imobilizado",
  "Energia Elétrica",
  "Substituição Tributária",
  "Outros Créditos",
] as const

/**
 * Tipos de crédito PIS/COFINS
 */
export const PIS_COFINS_CREDIT_TYPES = [
  "Compras de Insumos",
  "Energia Elétrica",
  "Frete",
  "Aluguel",
  "Depreciação",
  "Serviços PJ",
  "Ativo Imobilizado",
  "Devolução de Vendas",
  "Outros Créditos",
] as const

/**
 * Formatos de data
 */
export const DATE_FORMATS = {
  DISPLAY: "dd/MM/yyyy",
  DISPLAY_WITH_TIME: "dd/MM/yyyy HH:mm",
  ISO: "yyyy-MM-dd",
  PDF_HEADER: "dd/MM/yyyy",
} as const

/**
 * Configurações de PDF
 */
export const PDF_CONFIG = {
  PAGE_WIDTH: 210, // A4 em mm
  PAGE_HEIGHT: 297,
  MARGIN: 14,
  FONT_SIZE_TITLE: 16,
  FONT_SIZE_SUBTITLE: 12,
  FONT_SIZE_NORMAL: 10,
  FONT_SIZE_SMALL: 8,
  LINE_HEIGHT: 5,
} as const

/**
 * Debounce delays (em ms)
 */
export const DEBOUNCE_DELAYS = {
  INPUT: 300,
  SEARCH: 500,
  RESIZE: 150,
  SCROLL: 100,
} as const

/**
 * Limites de performance
 */
export const PERFORMANCE_LIMITS = {
  MAX_TABLE_ROWS_BEFORE_VIRTUALIZATION: 100,
  MAX_CHART_DATA_POINTS: 50,
  TOAST_AUTO_DISMISS_MS: 5000,
  LOADING_SKELETON_MIN_MS: 200,
} as const
