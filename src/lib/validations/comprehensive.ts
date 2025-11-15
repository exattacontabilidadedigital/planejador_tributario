import { z } from 'zod'

/**
 * Comprehensive Zod Validations for Tax Planner
 * Covers all test cases mentioned in TestSprite report
 */

// Base validation utilities
const positiveNumber = z.number().positive("Valor deve ser positivo")
const nonNegativeNumber = z.number().min(0, "Valor não pode ser negativo")
const percentage = z.number().min(0, "Percentual mínimo: 0%").max(100, "Percentual máximo: 100%")
const currency = z.number().min(0, "Valor monetário não pode ser negativo")
const taxRate = z.number().min(0, "Alíquota mínima: 0%").max(50, "Alíquota máxima: 50%")

// R1. Cálculos Tributários (ICMS, PIS/COFINS, IRPJ/CSLL)
export const TaxConfigSchema = z.object({
  // ICMS Rates
  icmsInterno: taxRate.refine(val => val >= 7 && val <= 25, {
    message: "ICMS interno deve estar entre 7% e 25%"
  }),
  icmsSul: taxRate.refine(val => val >= 7 && val <= 18, {
    message: "ICMS Sul deve estar entre 7% e 18%"
  }),
  icmsNorte: taxRate.refine(val => val >= 7 && val <= 18, {
    message: "ICMS Norte deve estar entre 7% e 18%"
  }),
  difal: taxRate.refine(val => val >= 0 && val <= 12, {
    message: "DIFAL deve estar entre 0% e 12%"
  }),
  fcp: taxRate.refine(val => val >= 0 && val <= 4, {
    message: "FCP deve estar entre 0% e 4%"
  }),
  
  // PIS/COFINS Rates
  pisAliq: taxRate.refine(val => val >= 0.65 && val <= 3, {
    message: "Alíquota PIS deve estar entre 0,65% e 3%"
  }),
  cofinsAliq: taxRate.refine(val => val >= 3 && val <= 12, {
    message: "Alíquota COFINS deve estar entre 3% e 12%"
  }),
  
  // IRPJ/CSLL Rates  
  irpjBase: taxRate.refine(val => val === 15, {
    message: "IRPJ base deve ser 15%"
  }),
  irpjAdicional: taxRate.refine(val => val === 10, {
    message: "IRPJ adicional deve ser 10%"
  }),
  csllAliq: taxRate.refine(val => val >= 9 && val <= 20, {
    message: "CSLL deve estar entre 9% e 20%"
  }),
  
  // ISS for service companies
  issAliq: taxRate.optional().refine(val => !val || (val >= 2 && val <= 5), {
    message: "ISS deve estar entre 2% e 5%"
  }),
  
  // Revenue and costs
  receitaBruta: currency.refine(val => val <= 78000000, {
    message: "Receita bruta não pode exceder R$ 78 milhões (limite Lucro Real)"
  }),
  cmv: currency,
  
  // Special regimes
  icmsSubstituicao: z.boolean().default(false),
  pisCofinsMono: z.boolean().default(false),
  
  // Additional settings
  percentualVendasSul: percentage.default(30),
  percentualVendasNorte: percentage.default(20),
}).refine(data => data.percentualVendasSul + data.percentualVendasNorte <= 100, {
  message: "Percentual de vendas Sul + Norte não pode exceder 100%",
  path: ["percentualVendasSul"]
})

// R2. Importação CSV e Memórias de Cálculo
export const DespesaSchema = z.object({
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(100, "Descrição não pode exceder 100 caracteres"),
  valor: currency.refine(val => val <= 10000000, {
    message: "Valor da despesa não pode exceder R$ 10 milhões"
  }),
  categoria: z.string().min(2, "Categoria deve ter pelo menos 2 caracteres"),
  temCredito: z.boolean(),
  mes: z.number().int().min(1).max(12).optional(),
  ano: z.number().int().min(2020).max(2030).optional(),
})

export const CSVImportSchema = z.object({
  despesas: z.array(DespesaSchema).min(1, "Deve haver pelo menos uma despesa")
    .max(10000, "Máximo de 10.000 despesas por importação"),
  validateHeaders: z.boolean().default(true),
  allowDuplicates: z.boolean().default(false),
}).refine(data => {
  if (!data.allowDuplicates) {
    const descriptions = data.despesas.map(d => d.descricao)
    return new Set(descriptions).size === descriptions.length
  }
  return true
}, {
  message: "Despesas duplicadas encontradas",
  path: ["despesas"]
})

// R3. DRE Dinâmica e Indicadores
export const DRESchema = z.object({
  receitaBruta: currency,
  deducoes: z.object({
    icms: currency,
    pisCofins: currency,
    iss: currency.optional(),
    outros: currency.optional(),
  }),
  cmv: currency,
  despesasOperacionais: z.object({
    comCredito: currency,
    semCredito: currency,
  }),
  tributosLucro: z.object({
    irpj: currency,
    csll: currency,
  }),
}).refine(data => {
  const receitaLiquida = data.receitaBruta - (
    data.deducoes.icms + 
    data.deducoes.pisCofins + 
    (data.deducoes.iss || 0) + 
    (data.deducoes.outros || 0)
  )
  return receitaLiquida >= 0
}, {
  message: "Receita líquida não pode ser negativa",
  path: ["receitaBruta"]
})

// R4. Gestão de Cenários (CRUD e Comparação)
export const CenarioSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(50, "Nome não pode exceder 50 caracteres"),
  descricao: z.string().max(200, "Descrição não pode exceder 200 caracteres").optional(),
  empresaId: z.string().uuid(),
  config: TaxConfigSchema,
  despesas: z.array(DespesaSchema),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).max(10, "Máximo 10 tags por cenário").optional(),
})

export const CenarioComparisonSchema = z.object({
  cenarios: z.array(CenarioSchema).min(2, "Necessário pelo menos 2 cenários para comparar")
    .max(5, "Máximo 5 cenários para comparação"),
  metricas: z.array(z.enum([
    'cargaTributaria',
    'lucroLiquido', 
    'margemLiquida',
    'totalImpostos',
    'economiaFiscal'
  ])).min(1, "Selecione pelo menos uma métrica"),
})

// R5. Exportação PDF
export const PDFExportSchema = z.object({
  cenarioId: z.string().uuid(),
  incluirGraficos: z.boolean().default(true),
  incluirMemorias: z.boolean().default(true),
  incluirComparativo: z.boolean().default(false),
  formato: z.enum(['A4', 'A3']).default('A4'),
  orientacao: z.enum(['portrait', 'landscape']).default('portrait'),
  template: z.enum(['completo', 'resumido', 'executivo']).default('completo'),
})

// R6. Persistência Local
export const LocalStorageDataSchema = z.object({
  version: z.string().default('3.0'),
  lastSync: z.date(),
  empresas: z.array(z.object({
    id: z.string().uuid(),
    nome: z.string(),
    cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos"),
  })),
  configuracoes: z.object({
    tema: z.enum(['light', 'dark', 'system']).default('system'),
    autoSave: z.boolean().default(true),
    notificacoes: z.boolean().default(true),
  }),
})

// R8. Validações de Inputs Financeiros
export const CurrencyInputSchema = z.object({
  value: z.string().regex(/^\d{1,3}(\.\d{3})*(\,\d{2})?$/, {
    message: "Formato inválido. Use: 1.234.567,89"
  }).transform(val => {
    // Convert Brazilian format to number
    return parseFloat(val.replace(/\./g, '').replace(',', '.'))
  }).pipe(currency),
})

export const PercentageInputSchema = z.object({
  value: z.string().regex(/^\d{1,2}(\,\d{1,4})?%?$/, {
    message: "Formato inválido. Use: 18,5% ou 18,5"
  }).transform(val => {
    // Remove % and convert to number
    const cleaned = val.replace('%', '').replace(',', '.')
    return parseFloat(cleaned)
  }).pipe(percentage),
})

// R10. Tratamento de Erros na Importação
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['text/csv', 'application/csv']),
}).refine(data => data.file.size <= data.maxSize, {
  message: "Arquivo muito grande. Máximo 5MB.",
  path: ["file"]
}).refine(data => data.allowedTypes.includes(data.file.type), {
  message: "Tipo de arquivo não permitido. Use apenas CSV.",
  path: ["file"]
})

// R13. Integração Supabase
export const SupabaseConfigSchema = z.object({
  url: z.string().url("URL do Supabase inválida"),
  anonKey: z.string().min(100, "Chave anônima do Supabase inválida"),
  enableRLS: z.boolean().default(true),
  timeout: z.number().min(1000).max(30000).default(10000),
})

// Utility functions for validation
export const validateTaxConfig = (data: unknown) => {
  return TaxConfigSchema.safeParse(data)
}

export const validateCSVImport = (data: unknown) => {
  return CSVImportSchema.safeParse(data)
}

export const validateCenario = (data: unknown) => {
  return CenarioSchema.safeParse(data)
}

export const validateCurrencyInput = (value: string) => {
  return CurrencyInputSchema.safeParse({ value })
}

export const validatePercentageInput = (value: string) => {
  return PercentageInputSchema.safeParse({ value })
}

// Error message helpers
export const getValidationErrors = (result: any) => {
  if (!result.success) {
    return result.error.issues.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
  }
  return []
}

export const formatValidationError = (error: z.ZodError) => {
  return error.issues.map((err: z.ZodIssue) => {
    const field = err.path.join('.')
    return `${field}: ${err.message}`
  }).join('; ')
}

// Type exports
export type TaxConfig = z.infer<typeof TaxConfigSchema>
export type Despesa = z.infer<typeof DespesaSchema>
export type CSVImport = z.infer<typeof CSVImportSchema>
export type DRE = z.infer<typeof DRESchema>
export type Cenario = z.infer<typeof CenarioSchema>
export type CenarioComparison = z.infer<typeof CenarioComparisonSchema>
export type PDFExport = z.infer<typeof PDFExportSchema>
export type LocalStorageData = z.infer<typeof LocalStorageDataSchema>
export type SupabaseConfig = z.infer<typeof SupabaseConfigSchema>