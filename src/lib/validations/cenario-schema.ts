import { z } from 'zod'

// Schema de validação para configuração do cenário
export const configuracaoCenarioSchema = z.object({
  receita: z.number().min(0, 'Receita não pode ser negativa'),
  cmv: z.number().min(0, 'CMV não pode ser negativo').optional(),
  despesasOperacionais: z.number().min(0, 'Despesas operacionais não podem ser negativas').optional(),
  despesasFinanceiras: z.number().min(0, 'Despesas financeiras não podem ser negativas').optional(),
  despesasAdministrativas: z.number().min(0, 'Despesas administrativas não podem ser negativas').optional(),
  despesasComerciais: z.number().min(0, 'Despesas comerciais não podem ser negativas').optional(),
  receitasFinanceiras: z.number().min(0, 'Receitas financeiras não podem ser negativas').optional(),
  outrasReceitas: z.number().min(0, 'Outras receitas não podem ser negativas').optional(),
  outrasDespesas: z.number().min(0, 'Outras despesas não podem ser negativas').optional(),
})

// Schema de validação para criação de cenário
export const cenarioCreateSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  mes: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Mês deve estar no formato 01-12'),
  ano: z.number()
    .int('Ano deve ser um número inteiro')
    .min(2020, 'Ano muito antigo')
    .max(2100, 'Ano muito distante'),
  empresaId: z.string()
    .uuid('ID da empresa inválido'),
  configuracao: configuracaoCenarioSchema,
  status: z.enum(['rascunho', 'aprovado', 'arquivado']).default('rascunho'),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
})

// Schema de validação para atualização de cenário
export const cenarioUpdateSchema = cenarioCreateSchema.partial().extend({
  id: z.string().uuid('ID do cenário inválido'),
})

// Tipos inferidos dos schemas
export type CenarioCreateInput = z.infer<typeof cenarioCreateSchema>
export type CenarioUpdateInput = z.infer<typeof cenarioUpdateSchema>
export type ConfiguracaoCenario = z.infer<typeof configuracaoCenarioSchema>

// Função helper para validar e lançar erros amigáveis
export function validarCenario(dados: unknown): CenarioCreateInput {
  try {
    return cenarioCreateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}

export function validarAtualizacaoCenario(dados: unknown): CenarioUpdateInput {
  try {
    return cenarioUpdateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}
