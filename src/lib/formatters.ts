/**
 * Utilitários de Formatação - Centralizado e Consistente
 * Substitui funções duplicadas de formatação
 */

/**
 * Formata valor como moeda brasileira
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return 'R$ 0,00'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue)
}

/**
 * Formata valor como porcentagem
 */
export function formatPercentage(value: number | string, decimals: number = 2): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0,00%'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue / 100)
}

/**
 * Formata número simples
 */
export function formatNumber(value: number | string, decimals: number = 2): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0,00'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue)
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '')
  
  if (digits.length !== 14) {
    return cnpj
  }
  
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

/**
 * Formata CEP
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '')
  
  if (digits.length !== 8) {
    return cep
  }
  
  return digits.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

/**
 * Formata telefone
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  
  if (digits.length === 10) {
    // Telefone fixo: (11) 1234-5678
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  } else if (digits.length === 11) {
    // Celular: (11) 91234-5678
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Formata data brasileira
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Formata bytes para tamanho legível
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Trunca texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalizeWords(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Remove acentos de texto
 */
export function removeAccents(text: string): string {
  if (!text) return ''
  
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Gera slug a partir de texto
 */
export function generateSlug(text: string): string {
  if (!text) return ''
  
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens do início e fim
}

/**
 * Valida se é um número válido
 */
export function isValidNumber(value: any): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && isFinite(num)
}

/**
 * Clamp - limita número entre min e max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calcula porcentagem de um valor
 */
export function calculatePercentage(value: number, percentage: number): number {
  return (value * percentage) / 100
}

/**
 * Converte string para número seguro
 */
export function safeParseFloat(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') return isFinite(value) ? value : defaultValue
  
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  return isFinite(parsed) ? parsed : defaultValue
}

/**
 * Formata valor com símbolo customizado
 */
export function formatWithSymbol(value: number, symbol: string): string {
  return `${symbol} ${formatNumber(value)}`
}

// Exportar utilitários agrupados para facilitar importação
export const formatters = {
  currency: formatCurrency,
  percentage: formatPercentage,
  number: formatNumber,
  cnpj: formatCNPJ,
  cep: formatCEP,
  phone: formatPhone,
  date: formatDate,
  dateTime: formatDateTime,
  bytes: formatBytes,
  truncate: truncateText,
  capitalize: capitalizeWords,
  slug: generateSlug
}

export const validators = {
  isValidNumber,
  clamp,
  safeParseFloat
}

export const calculators = {
  percentage: calculatePercentage,
  withSymbol: formatWithSymbol
}

export default {
  ...formatters,
  ...validators,
  ...calculators
}