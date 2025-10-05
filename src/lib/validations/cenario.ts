import { z } from 'zod'

/**
 * Schemas de validação para Cenários
 * Implementa validação robusta com Zod
 */

// Schema para periodo do cenário
const PeriodoSchema = z.object({
  tipo: z.enum(['mensal', 'trimestral', 'semestral', 'anual']),
  inicio: z.string(),
  fim: z.string(),
  ano: z.number().int().min(2020).max(2030),
  mes: z.number().int().min(1).max(12).optional(),
  trimestre: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
}).refine((data) => {
  // Validar que data fim é depois da data início
  const inicio = new Date(data.inicio)
  const fim = new Date(data.fim)
  return fim >= inicio
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['fim']
})

// Schema para configuração básica (simplificado)
const ConfiguracaoSchema = z.object({
  receitaBruta: z.number().min(0).optional(),
  cmvTotal: z.number().min(0).optional(),
  salariosPF: z.number().min(0).optional(),
  alimentacao: z.number().min(0).optional(),
  combustivelPasseio: z.number().min(0).optional(),
  outrasDespesas: z.number().min(0).optional(),
  icmsInterno: z.number().min(0).max(100).optional(),
  pisAliq: z.number().min(0).max(100).optional(),
  cofinsAliq: z.number().min(0).max(100).optional(),
  irpjBase: z.number().min(0).max(100).optional(),
  csllAliq: z.number().min(0).max(100).optional(),
  issAliq: z.number().min(0).max(100).optional(),
}).passthrough()

// Schema principal do cenário
const CenarioSchema = z.object({
  id: z.string().uuid().optional(),
  empresaId: z.string().uuid(),
  
  // Identificação
  nome: z.string().min(1).max(100).trim(),
  descricao: z.string().max(500).trim().optional(),
    
  periodo: PeriodoSchema,
  configuracao: ConfiguracaoSchema,
  
  // Status
  status: z.enum(['rascunho', 'aprovado', 'arquivado']).default('rascunho'),
  
  // Campos opcionais do banco
  ano: z.number().int().min(2020).max(2030).optional(),
  tipo_periodo: z.enum(['mensal', 'trimestral', 'semestral', 'anual']).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  mes: z.number().int().min(1).max(12).optional(),
  trimestre: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  criado_por: z.string().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  
  // Metadados (somente leitura)
  criadoEm: z.string().optional(),
  atualizadoEm: z.string().optional(),
})

// Schema para criação de cenário (sem ID)
const CenarioCreateSchema = CenarioSchema.omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
})

// Schema para atualização de cenário (todos campos opcionais exceto ID)
const CenarioUpdateSchema = CenarioSchema.partial().extend({
  id: z.string().uuid(),
})

/**
 * Funções de validação
 */

export function validateCenario(data: unknown) {
  return CenarioSchema.safeParse(data)
}

export function validateCenarioCreate(data: unknown) {
  return CenarioCreateSchema.safeParse(data)
}

export function validateCenarioUpdate(data: unknown) {
  return CenarioUpdateSchema.safeParse(data)
}

export function validatePeriodo(data: unknown) {
  return PeriodoSchema.safeParse(data)
}

export function validateConfiguracao(data: unknown) {
  return ConfiguracaoSchema.safeParse(data)
}

/**
 * Utilitários de validação
 */

export function isValidCenario(data: unknown): boolean {
  return CenarioSchema.safeParse(data).success
}

export function getValidationErrors(result: any): string[] {
  if (result.success) return []
  
  return result.error.issues.map((issue: any) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  })
}

/**
 * Função de validação para usar no store
 */
export function validateCenarioData(data: any): { success: boolean; errors: string[] } {
  const result = validateCenario(data)
  
  if (result.success) {
    return { success: true, errors: [] }
  }
  
  return {
    success: false,
    errors: getValidationErrors(result)
  }
}

// Exportar schemas para uso direto se necessário
export {
  CenarioSchema,
  CenarioCreateSchema,
  CenarioUpdateSchema,
  PeriodoSchema,
  ConfiguracaoSchema
}