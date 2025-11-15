import { z } from 'zod'

// Schema de validação para mês (formato 'jan', 'fev', etc.)
const mesesValidos = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'
] as const

export const mesSchema = z.enum(mesesValidos, {
  message: 'Mês inválido. Use formato: jan, fev, mar, etc.'
})

// Schema de validação para regime tributário
export const regimeTributarioComparativoSchema = z.enum(
  ['lucro_real', 'lucro_presumido', 'simples_nacional'],
  { message: 'Regime tributário inválido' }
)

// Schema de validação para valores monetários (não negativos)
const valorMonetarioSchema = z.number()
  .min(0, 'Valor não pode ser negativo')
  .max(1_000_000_000_000, 'Valor muito alto (máximo: R$ 1 trilhão)')

// Schema de validação para criação de dados comparativos
export const dadoComparativoCreateSchema = z.object({
  empresaId: z.string().uuid('ID da empresa inválido'),
  mes: mesSchema,
  ano: z.number()
    .int('Ano deve ser um número inteiro')
    .min(2020, 'Ano muito antigo')
    .max(2100, 'Ano muito distante'),
  regime: regimeTributarioComparativoSchema,
  receita: valorMonetarioSchema.min(0.01, 'Receita deve ser maior que zero'),
  icms: valorMonetarioSchema,
  pis: valorMonetarioSchema,
  cofins: valorMonetarioSchema,
  irpj: valorMonetarioSchema,
  csll: valorMonetarioSchema,
  iss: valorMonetarioSchema,
  outros: valorMonetarioSchema.optional().default(0),
  observacoes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal(''))
}).refine(
  (data) => {
    // Validação: Total de impostos não pode exceder receita
    const totalImpostos = 
      data.icms + 
      data.pis + 
      data.cofins + 
      data.irpj + 
      data.csll + 
      data.iss + 
      (data.outros || 0)
    
    return totalImpostos <= data.receita
  },
  {
    message: 'Total de impostos não pode exceder a receita declarada',
    path: ['receita'] // Mostra erro no campo receita
  }
)

// Schema de validação para atualização de dados comparativos
export const dadoComparativoUpdateSchema = dadoComparativoCreateSchema.partial().extend({
  id: z.string().uuid('ID do dado comparativo inválido'),
}).refine(
  (data) => {
    // Só valida relação impostos/receita se ambos foram fornecidos
    if (!data.receita) return true
    
    const totalImpostos = 
      (data.icms || 0) + 
      (data.pis || 0) + 
      (data.cofins || 0) + 
      (data.irpj || 0) + 
      (data.csll || 0) + 
      (data.iss || 0) + 
      (data.outros || 0)
    
    return totalImpostos <= data.receita
  },
  {
    message: 'Total de impostos não pode exceder a receita declarada',
    path: ['receita']
  }
)

// Tipos inferidos dos schemas
export type DadoComparativoCreateInput = z.infer<typeof dadoComparativoCreateSchema>
export type DadoComparativoUpdateInput = z.infer<typeof dadoComparativoUpdateSchema>

// Função helper para validar criação
export function validarDadoComparativo(dados: unknown): DadoComparativoCreateInput {
  try {
    return dadoComparativoCreateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}

// Função helper para validar atualização
export function validarAtualizacaoDadoComparativo(dados: unknown): DadoComparativoUpdateInput {
  try {
    return dadoComparativoUpdateSchema.parse(dados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      throw new Error(`Dados inválidos: ${mensagens}`)
    }
    throw error
  }
}

// Função para verificar duplicata antes de insert
export function verificarDuplicataDadoComparativo(
  empresaId: string,
  mes: string,
  ano: number,
  regime: string,
  dadosExistentes: Array<{ empresaId: string; mes: string; ano: number; regime: string }>
): void {
  const duplicado = dadosExistentes.find(
    (dado) =>
      dado.empresaId === empresaId &&
      dado.mes === mes &&
      dado.ano === ano &&
      dado.regime === regime
  )

  if (duplicado) {
    const nomesMeses: Record<string, string> = {
      'jan': 'Janeiro', 'fev': 'Fevereiro', 'mar': 'Março',
      'abr': 'Abril', 'mai': 'Maio', 'jun': 'Junho',
      'jul': 'Julho', 'ago': 'Agosto', 'set': 'Setembro',
      'out': 'Outubro', 'nov': 'Novembro', 'dez': 'Dezembro'
    }
    
    const nomesRegimes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }

    const mesNome = nomesMeses[mes] || mes
    const regimeNome = nomesRegimes[regime] || regime

    throw new Error(
      `Já existe um registro de ${regimeNome} para ${mesNome}/${ano}. ` +
      `Use a função de editar para atualizar dados existentes.`
    )
  }
}

// Função para validar valores realistas
export function validarValoresRealistas(receita: number, impostosTotais: number): void {
  // Carga tributária > 100% é impossível
  const cargaTributaria = (impostosTotais / receita) * 100
  
  if (cargaTributaria > 100) {
    throw new Error(
      `Carga tributária de ${cargaTributaria.toFixed(2)}% é inválida. ` +
      `Total de impostos (R$ ${impostosTotais.toLocaleString('pt-BR')}) ` +
      `excede a receita (R$ ${receita.toLocaleString('pt-BR')})`
    )
  }

  // Alerta se carga tributária muito alta (> 80%)
  if (cargaTributaria > 80) {
    console.warn(
      `⚠️ Carga tributária muito alta: ${cargaTributaria.toFixed(2)}%. ` +
      `Verifique se os valores estão corretos.`
    )
  }

  // Alerta se receita muito baixa (< R$ 100)
  if (receita < 100) {
    console.warn(
      `⚠️ Receita muito baixa: R$ ${receita.toFixed(2)}. ` +
      `Verifique se o valor está correto.`
    )
  }

  // Alerta se receita muito alta (> R$ 100 bilhões)
  if (receita > 100_000_000_000) {
    console.warn(
      `⚠️ Receita muito alta: R$ ${(receita / 1_000_000_000).toFixed(2)} bilhões. ` +
      `Verifique se o valor está correto.`
    )
  }
}
