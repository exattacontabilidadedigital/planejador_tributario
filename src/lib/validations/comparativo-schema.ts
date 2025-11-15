import { z } from 'zod'

// Schema de validação para criação de comparativo
export const comparativoCreateSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  cenariosIds: z.array(z.string().uuid('ID de cenário inválido'))
    .min(1, 'Selecione pelo menos um cenário para comparar')
    .max(10, 'Máximo de 10 cenários por comparativo'),
  empresaId: z.string().uuid('ID da empresa inválido'),
})

// Schema de validação para atualização de comparativo
export const comparativoUpdateSchema = comparativoCreateSchema.partial().extend({
  id: z.string().uuid('ID do comparativo inválido'),
})

// Tipos inferidos dos schemas
export type ComparativoCreateInput = z.infer<typeof comparativoCreateSchema>
export type ComparativoUpdateInput = z.infer<typeof comparativoUpdateSchema>

// Função helper para validar e lançar erros amigáveis
export function validarComparativo(dados: unknown): ComparativoCreateInput {
  try {
    return comparativoCreateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}

export function validarAtualizacaoComparativo(dados: unknown): ComparativoUpdateInput {
  try {
    return comparativoUpdateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}

// Função para validar se cenários existem antes de criar comparativo
export async function validarCenariosExistem(
  cenariosIds: string[], 
  validarCenario: (id: string) => Promise<boolean>
): Promise<void> {
  const validacoes = await Promise.all(
    cenariosIds.map(async (id) => ({
      id,
      existe: await validarCenario(id)
    }))
  )
  
  const cenariosInvalidos = validacoes
    .filter((v) => !v.existe)
    .map((v) => v.id)
  
  if (cenariosInvalidos.length > 0) {
    throw new Error(
      `Os seguintes cenários não existem: ${cenariosInvalidos.join(', ')}. ` +
      `Verifique se foram deletados ou se os IDs estão corretos.`
    )
  }
}

// Função para validar duplicata (mesmo nome + empresa)
export function validarComparativoDuplicado(
  nome: string,
  empresaId: string,
  comparativosExistentes: Array<{ nome: string; empresaId: string }>
): void {
  const nomeLimpo = nome.trim().toLowerCase()
  const duplicado = comparativosExistentes.find(
    (comp) => 
      comp.nome.trim().toLowerCase() === nomeLimpo && 
      comp.empresaId === empresaId
  )
  
  if (duplicado) {
    throw new Error('Já existe um comparativo com este nome para esta empresa.')
  }
}
