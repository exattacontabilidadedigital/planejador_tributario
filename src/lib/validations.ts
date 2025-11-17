import { z } from "zod"

/**
 * Schema de validação para configuração tributária
 * Garante que todos os valores estejam dentro dos limites aceitáveis
 */
export const TaxConfigSchema = z.object({
  // Receitas
  receitaBruta: z
    .number()
    .min(0, "Receita bruta não pode ser negativa")
    .max(999_999_999, "Receita bruta muito alta")
    .finite("Receita bruta deve ser um número válido"),

  vendasInternas: z
    .number()
    .min(0, "Percentual não pode ser negativo")
    .max(100, "Percentual não pode exceder 100%"),

  vendasInterestaduais: z
    .number()
    .min(0, "Percentual não pode ser negativo")
    .max(100, "Percentual não pode exceder 100%"),

  consumidorFinal: z
    .number()
    .min(0, "Percentual não pode ser negativo")
    .max(100, "Percentual não pode exceder 100%"),

  // ICMS - Alíquotas
  icmsInterno: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(30, "Alíquota de ICMS muito alta"),

  icmsSul: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(30, "Alíquota de ICMS muito alta"),

  difal: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(30, "Alíquota de DIFAL muito alta"),

  fcp: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(5, "Alíquota de FCP muito alta"),

  // ICMS - Créditos
  comprasInternas: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  comprasInterestaduais: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoEstoqueInicial: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoAtivoImobilizado: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoEnergiaIndustria: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoSTEntrada: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  outrosCreditos: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoPISEstoqueInicial: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto")
    .optional(),

  creditoCOFINSEstoqueInicial: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto")
    .optional(),

  creditoPISOutros: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto")
    .optional(),

  creditoCOFINSOutros: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto")
    .optional(),

  // PIS/COFINS - Alíquotas
  pisAliquota: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(10, "Alíquota de PIS muito alta"),

  cofinsAliquota: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(20, "Alíquota de COFINS muito alta"),

  // PIS/COFINS - Créditos
  creditoPisCompras: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoCofinsCompras: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoPisEnergia: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoCofinsEnergia: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoPisFrete: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoCofinsFrete: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoPisAluguel: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoCofinsAluguel: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoPisDepreciacao: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoCofinsDepreciacao: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoPisServicos: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoCofinsServicos: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoPisImobilizado: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  creditoCofinsImobilizado: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  outroCreditoPis: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  outroCreditoCofins: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  // IRPJ/CSLL
  irpjAliquota: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(25, "Alíquota de IRPJ muito alta"),

  irpjAdicional: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(15, "Alíquota adicional muito alta"),

  csllAliquota: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(20, "Alíquota de CSLL muito alta"),

  limiteAnualIRPJ: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  // DRE - Custos
  custoProdutos: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  // DRE - Despesas Operacionais
  despesasAdministrativas: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  despesasComerciais: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  despesasFinanceiras: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  receitasFinanceiras: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  salarios: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  encargos: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  aluguel: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  energia: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  depreciacao: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  marketing: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  outrosCustos: z
    .number()
    .min(0, "Valor não pode ser negativo")
    .max(999_999_999, "Valor muito alto"),

  // ISS
  issAliquota: z
    .number()
    .min(0, "Alíquota não pode ser negativa")
    .max(5, "Alíquota de ISS muito alta"),

  baseCalculoIss: z
    .number()
    .min(0, "Base de cálculo não pode ser negativa")
    .max(999_999_999, "Base de cálculo muito alta"),
})

/**
 * Tipo inferido do schema Zod
 */
export type ValidatedTaxConfig = z.infer<typeof TaxConfigSchema>

/**
 * Valida a configuração tributária
 * @param config - Configuração a ser validada
 * @returns Resultado da validação com erros (se houver)
 */
export function validateTaxConfig(config: unknown) {
  return TaxConfigSchema.safeParse(config)
}

/**
 * Valida e retorna a configuração ou lança erro
 * @param config - Configuração a ser validada
 * @returns Configuração validada
 * @throws ZodError se a validação falhar
 */
export function parseAndValidateTaxConfig(config: unknown): ValidatedTaxConfig {
  return TaxConfigSchema.parse(config)
}

/**
 * Valida um campo específico
 * @param fieldName - Nome do campo
 * @param value - Valor a ser validado
 * @returns true se válido, string de erro se inválido
 */
export function validateField(
  fieldName: keyof ValidatedTaxConfig,
  value: number
): true | string {
  const fieldSchema = TaxConfigSchema.shape[fieldName]
  const result = fieldSchema.safeParse(value)
  
  if (result.success) {
    return true
  }
  
  return result.error.issues[0]?.message || "Valor inválido"
}
