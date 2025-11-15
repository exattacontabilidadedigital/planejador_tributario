import { z } from 'zod'

// Schema de validação para regime tributário
export const regimeTributarioSchema = z.enum(['lucro-real', 'lucro-presumido', 'simples'], {
  message: 'Regime tributário inválido'
})

// Schema de validação para setor da empresa
export const setorEmpresaSchema = z.enum(['comercio', 'industria', 'servicos'], {
  message: 'Setor inválido'
})

// Validação de CNPJ
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/
export const cnpjSchema = z.string()
  .regex(cnpjRegex, 'CNPJ deve estar no formato 00.000.000/0000-00 ou 14 dígitos')
  .optional()
  .or(z.literal(''))

// Validação de UF (estados brasileiros)
const ufsValidas = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const
export const ufSchema = z.enum(ufsValidas, {
  message: 'UF inválida'
})

// Schema de validação para criação de empresa
export const empresaCreateSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  cnpj: cnpjSchema,
  razaoSocial: z.string()
    .min(3, 'Razão social deve ter no mínimo 3 caracteres')
    .max(200, 'Razão social deve ter no máximo 200 caracteres')
    .trim(),
  regimeTributario: regimeTributarioSchema,
  setor: setorEmpresaSchema,
  uf: ufSchema,
  municipio: z.string()
    .min(2, 'Município deve ter no mínimo 2 caracteres')
    .max(100, 'Município deve ter no máximo 100 caracteres')
    .trim(),
  inscricaoEstadual: z.string()
    .max(20, 'Inscrição estadual deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  inscricaoMunicipal: z.string()
    .max(20, 'Inscrição municipal deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
})

// Schema de validação para atualização de empresa
export const empresaUpdateSchema = empresaCreateSchema.partial().extend({
  id: z.string().uuid('ID da empresa inválido'),
})

// Tipos inferidos dos schemas
export type EmpresaCreateInput = z.infer<typeof empresaCreateSchema>
export type EmpresaUpdateInput = z.infer<typeof empresaUpdateSchema>

// Função helper para validar e lançar erros amigáveis
export function validarEmpresa(dados: unknown): EmpresaCreateInput {
  try {
    return empresaCreateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}

export function validarAtualizacaoEmpresa(dados: unknown): EmpresaUpdateInput {
  try {
    return empresaUpdateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}

// Função para validar CNPJ duplicado antes do insert
export function validarCNPJUnico(cnpj: string | undefined, empresasExistentes: Array<{ cnpj: string }>): void {
  if (!cnpj || cnpj === '') return
  
  const cnpjLimpo = cnpj.replace(/\D/g, '')
  const cnpjDuplicado = empresasExistentes.find(
    (empresa) => empresa.cnpj.replace(/\D/g, '') === cnpjLimpo
  )
  
  if (cnpjDuplicado) {
    throw new Error('CNPJ já cadastrado. Verifique se a empresa já existe.')
  }
}
