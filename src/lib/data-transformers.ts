/**
 * Transformadores de Dados - Padronização de Interfaces
 * Resolve inconsistências entre banco de dados e aplicação
 */

import type { Cenario, CenarioFormData, TipoPeriodo, StatusCenario } from '@/types/cenario'
import type { TaxConfig } from '@/types'

// Tipos do banco de dados (snake_case)
export interface DbCenario {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  configuracao: any // JSONB do banco
  status: string
  ano?: number
  tipo_periodo?: string
  data_inicio?: string
  data_fim?: string
  mes?: number
  trimestre?: number
  criado_por?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

// Tipos da interface (camelCase)
export interface AppCenario extends Cenario {
  // Já definido em @/types/cenario
}

/**
 * Transforma dados do banco para interface da aplicação
 */
export function dbToInterface(dbRow: DbCenario): Cenario {
  // Processar configuração
  const configuracao = dbRow.configuracao || {}
  const periodo = configuracao.periodo || {}
  
  // Determinar tipo de período baseado no nome do cenário
  const nomeMinusculo = dbRow.nome.toLowerCase()
  const mesesNomes = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  const isMonthName = mesesNomes.some(mes => nomeMinusculo.includes(mes))
  
  const tipoCalculado = (dbRow.tipo_periodo || periodo.tipo || (isMonthName ? 'mensal' : 'anual')) as TipoPeriodo
  
  // Calcular datas se é mensal e tem nome de mês
  let inicioData = dbRow.data_inicio || periodo.inicio
  let fimData = dbRow.data_fim || periodo.fim
  
  if (tipoCalculado === 'mensal' && isMonthName) {
    const mesIndex = mesesNomes.findIndex(mes => nomeMinusculo.includes(mes))
    if (mesIndex !== -1) {
      const ano = dbRow.ano || 2025
      inicioData = new Date(ano, mesIndex, 1).toISOString()
      fimData = new Date(ano, mesIndex + 1, 0).toISOString() // Último dia do mês
    }
  }
  
  // Garantir datas padrão
  if (!inicioData) {
    inicioData = new Date(dbRow.ano || 2025, 0, 1).toISOString()
  }
  if (!fimData) {
    fimData = new Date(dbRow.ano || 2025, 11, 31).toISOString()
  }
  
  return {
    id: dbRow.id,
    empresaId: dbRow.empresa_id, // snake_case -> camelCase
    nome: dbRow.nome,
    descricao: dbRow.descricao || '',
    
    periodo: {
      tipo: tipoCalculado,
      inicio: inicioData,
      fim: fimData,
      ano: dbRow.ano || 2025,
      mes: dbRow.mes || periodo.mes || undefined,
      trimestre: (dbRow.trimestre || periodo.trimestre) as (1 | 2 | 3 | 4) || undefined,
    },
    
    // PADRONIZADO: sempre usar 'configuracao' (não 'config')
    configuracao: transformConfiguracao(configuracao),
    
    // Campos do banco mapeados
    ano: dbRow.ano,
    tipo_periodo: dbRow.tipo_periodo as TipoPeriodo,
    data_inicio: dbRow.data_inicio,
    data_fim: dbRow.data_fim,
    mes: dbRow.mes,
    trimestre: dbRow.trimestre as (1 | 2 | 3 | 4),
    criado_por: dbRow.criado_por,
    tags: dbRow.tags || [],
    
    status: (dbRow.status || 'rascunho') as StatusCenario,
    criadoEm: dbRow.created_at, // snake_case -> camelCase
    atualizadoEm: dbRow.updated_at, // snake_case -> camelCase
  }
}

/**
 * Transforma dados da interface para banco de dados
 */
export function interfaceToDb(cenario: Cenario): Partial<DbCenario> {
  return {
    id: cenario.id,
    empresa_id: cenario.empresaId, // camelCase -> snake_case
    nome: cenario.nome,
    descricao: cenario.descricao,
    
    // Configuração completa para JSONB
    configuracao: {
      ...cenario.configuracao,
      periodo: cenario.periodo
    },
    
    status: cenario.status,
    ano: cenario.periodo.ano,
    tipo_periodo: cenario.periodo.tipo, // camelCase -> snake_case
    data_inicio: cenario.periodo.inicio, // camelCase -> snake_case
    data_fim: cenario.periodo.fim, // camelCase -> snake_case
    mes: cenario.periodo.mes,
    trimestre: cenario.periodo.trimestre,
    criado_por: cenario.criado_por,
    tags: cenario.tags || []
  }
}

/**
 * Transforma configuração para formato padrão
 */
export function transformConfiguracao(config: any): TaxConfig {
  if (!config || typeof config !== 'object') {
    return getDefaultConfig()
  }
  
  // Mapear campos com nomes inconsistentes
  return {
    // Receitas
    receitaBruta: sanitizeNumber(config.receitaBruta || config.receita_bruta || 0),
    vendasInternas: sanitizeNumber(config.vendasInternas || config.vendas_internas || 0),
    vendasInterestaduais: sanitizeNumber(config.vendasInterestaduais || config.vendas_interestaduais || 0),
    consumidorFinal: sanitizeNumber(config.consumidorFinal || config.consumidor_final || 0),
    
    // ICMS
    icmsInterno: sanitizeNumber(config.icmsInterno || config.icms_interno || 18),
    icmsSul: sanitizeNumber(config.icmsSul || config.icms_sul || 12),
    icmsNorte: sanitizeNumber(config.icmsNorte || config.icms_norte || 7),
    difal: sanitizeNumber(config.difal || 0),
    fcp: sanitizeNumber(config.fcp || 0),
    percentualST: sanitizeNumber(config.percentualST || config.percentual_st || 0),
    percentualMonofasico: sanitizeNumber(config.percentualMonofasico || config.percentual_monofasico || 0),
    
    // PIS/COFINS
    pisAliq: sanitizeNumber(config.pisAliq || config.pis_aliq || 1.65),
    cofinsAliq: sanitizeNumber(config.cofinsAliq || config.cofins_aliq || 7.6),
    
    // IRPJ/CSLL
    irpjBase: sanitizeNumber(config.irpjBase || config.irpj_base || 15),
    irpjAdicional: sanitizeNumber(config.irpjAdicional || config.irpj_adicional || 10),
    limiteIrpj: sanitizeNumber(config.limiteIrpj || config.limite_irpj || 240000),
    csllAliq: sanitizeNumber(config.csllAliq || config.csll_aliq || 9),
    issAliq: sanitizeNumber(config.issAliq || config.iss_aliq || 0),
    
    // Compras e CMV
    comprasInternas: sanitizeNumber(config.comprasInternas || config.compras_internas || 0),
    comprasInterestaduais: sanitizeNumber(config.comprasInterestaduais || config.compras_interestaduais || 0),
    comprasUso: sanitizeNumber(config.comprasUso || config.compras_uso || 0),
    cmvTotal: sanitizeNumber(config.cmvTotal || config.cmv_total || 0),
    
    // Despesas com Crédito
    energiaEletrica: sanitizeNumber(config.energiaEletrica || config.energia_eletrica || 0),
    alugueis: sanitizeNumber(config.alugueis || 0),
    arrendamento: sanitizeNumber(config.arrendamento || 0),
    frete: sanitizeNumber(config.frete || 0),
    depreciacao: sanitizeNumber(config.depreciacao || 0),
    combustiveis: sanitizeNumber(config.combustiveis || 0),
    valeTransporte: sanitizeNumber(config.valeTransporte || config.vale_transporte || 0),
    
    // Despesas sem Crédito
    salariosPF: sanitizeNumber(config.salariosPF || config.salarios_pf || 0),
    alimentacao: sanitizeNumber(config.alimentacao || 0),
    combustivelPasseio: sanitizeNumber(config.combustivelPasseio || config.combustivel_passeio || 0),
    outrasDespesas: sanitizeNumber(config.outrasDespesas || config.outras_despesas || 0),
    
    // Ajustes IRPJ/CSLL
    adicoesLucro: sanitizeNumber(config.adicoesLucro || config.adicoes_lucro || 0),
    exclusoesLucro: sanitizeNumber(config.exclusoesLucro || config.exclusoes_lucro || 0),
    
    // Créditos ICMS
    creditoEstoqueInicial: sanitizeNumber(config.creditoEstoqueInicial || config.credito_estoque_inicial || 0),
    creditoAtivoImobilizado: sanitizeNumber(config.creditoAtivoImobilizado || config.credito_ativo_imobilizado || 0),
    creditoEnergiaIndustria: sanitizeNumber(config.creditoEnergiaIndustria || config.credito_energia_industria || 0),
    creditoSTEntrada: sanitizeNumber(config.creditoSTEntrada || config.credito_st_entrada || 0),
    outrosCreditos: sanitizeNumber(config.outrosCreditos || config.outros_creditos || 0),
    
    // Despesas Dinâmicas
    despesasDinamicas: config.despesasDinamicas || []
  }
}

/**
 * Função auxiliar para sanitizar números
 */
function sanitizeNumber(value: any): number {
  const num = parseFloat(String(value || 0).replace(/[^0-9.-]/g, ''))
  return isNaN(num) || !isFinite(num) ? 0 : num
}

/**
 * Configuração padrão quando não há dados
 */
function getDefaultConfig(): TaxConfig {
  return {
    // Receitas
    receitaBruta: 0,
    vendasInternas: 100,
    vendasInterestaduais: 0,
    consumidorFinal: 100,
    
    // ICMS
    icmsInterno: 18,
    icmsSul: 12,
    icmsNorte: 7,
    difal: 0,
    fcp: 0,
    percentualST: 0,
    percentualMonofasico: 0,
    
    // PIS/COFINS
    pisAliq: 1.65,
    cofinsAliq: 7.6,
    
    // IRPJ/CSLL
    irpjBase: 15,
    irpjAdicional: 10,
    limiteIrpj: 240000,
    csllAliq: 9,
    issAliq: 0,
    
    // Compras e CMV
    comprasInternas: 100,
    comprasInterestaduais: 0,
    comprasUso: 0,
    cmvTotal: 0,
    
    // Despesas com Crédito
    energiaEletrica: 0,
    alugueis: 0,
    arrendamento: 0,
    frete: 0,
    depreciacao: 0,
    combustiveis: 0,
    valeTransporte: 0,
    
    // Despesas sem Crédito
    salariosPF: 0,
    alimentacao: 0,
    combustivelPasseio: 0,
    outrasDespesas: 0,
    
    // Ajustes IRPJ/CSLL
    adicoesLucro: 0,
    exclusoesLucro: 0,
    
    // Créditos ICMS
    creditoEstoqueInicial: 0,
    creditoAtivoImobilizado: 0,
    creditoEnergiaIndustria: 0,
    creditoSTEntrada: 0,
    outrosCreditos: 0,
    
    // Despesas Dinâmicas
    despesasDinamicas: []
  }
}

/**
 * Validador de consistência de dados
 */
export function validateDataConsistency(cenario: Cenario): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validar IDs
  if (!cenario.id || cenario.id.length < 10) {
    errors.push('ID do cenário inválido')
  }
  
  if (!cenario.empresaId || cenario.empresaId.length < 10) {
    errors.push('ID da empresa inválido')
  }
  
  // Validar nome
  if (!cenario.nome || cenario.nome.trim().length < 1) {
    errors.push('Nome do cenário é obrigatório')
  }
  
  // Validar período
  const periodo = cenario.periodo
  if (!periodo.inicio || !periodo.fim) {
    errors.push('Período deve ter data de início e fim')
  }
  
  if (new Date(periodo.inicio) >= new Date(periodo.fim)) {
    errors.push('Data de início deve ser anterior à data de fim')
  }
  
  // Validar configuração
  const config = cenario.configuracao
  if (!config) {
    errors.push('Configuração é obrigatória')
  } else {
    if (config.receitaBruta < 0) {
      errors.push('Receita bruta não pode ser negativa')
    }
    
    if (config.vendasInternas + config.vendasInterestaduais > 100) {
      errors.push('Soma de vendas internas e interestaduais não pode exceder 100%')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Utilitário para migrar dados antigos
 */
export function migrateOldData(oldData: any): Cenario {
  // Identificar formato antigo e converter
  if (oldData.config && !oldData.configuracao) {
    oldData.configuracao = oldData.config
    delete oldData.config
  }
  
  // Converter snake_case para camelCase
  if (oldData.empresa_id && !oldData.empresaId) {
    oldData.empresaId = oldData.empresa_id
  }
  
  if (oldData.created_at && !oldData.criadoEm) {
    oldData.criadoEm = oldData.created_at
  }
  
  if (oldData.updated_at && !oldData.atualizadoEm) {
    oldData.atualizadoEm = oldData.updated_at
  }
  
  return dbToInterface(oldData)
}

// Exportar transformadores principais
export const dataTransformers = {
  dbToInterface,
  interfaceToDb,
  transformConfiguracao,
  validateDataConsistency,
  migrateOldData
}

export default dataTransformers