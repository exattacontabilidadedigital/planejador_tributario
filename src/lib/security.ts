/**
 * Utilitários de Sanitização e Rate Limiting
 * Implementa segurança básica para entrada de dados
 */

import DOMPurify from 'isomorphic-dompurify'

// Rate limiting em memória (para desenvolvimento)
// Em produção, usar Redis ou similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitOptions {
  max: number // máximo de tentativas
  window: string // janela de tempo (ex: '1m', '1h', '1d')
  keyGenerator?: (identifier: string) => string
}

/**
 * Sanitiza entrada de texto para prevenir XSS
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  // Remove HTML malicioso
  const cleaned = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // Remove todas as tags HTML
    ALLOWED_ATTR: [] // Remove todos os atributos
  })
  
  // Remove caracteres especiais perigosos
  return cleaned
    .replace(/[<>\"'&]/g, '') // Remove caracteres HTML básicos
    .trim()
    .substring(0, 1000) // Limita tamanho
}

/**
 * Sanitiza entrada de HTML permitindo apenas tags seguras
 */
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  })
}

/**
 * Valida e sanitiza entrada numérica
 */
export function sanitizeNumber(input: any): number {
  const num = parseFloat(String(input).replace(/[^0-9.-]/g, ''))
  
  if (isNaN(num) || !isFinite(num)) return 0
  
  // Limita valores extremos
  const max = 999_999_999
  const min = -999_999_999
  
  return Math.max(min, Math.min(max, num))
}

/**
 * Valida entrada de email
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const cleaned = input.toLowerCase().trim()
  
  return emailRegex.test(cleaned) ? cleaned : ''
}

/**
 * Converte string de tempo para milissegundos
 */
function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/)
  if (!match) throw new Error('Formato de tempo inválido. Use: 30s, 5m, 1h, 1d')
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  const multipliers = {
    s: 1000,      // segundos
    m: 60000,     // minutos
    h: 3600000,   // horas
    d: 86400000   // dias
  }
  
  return value * multipliers[unit as keyof typeof multipliers]
}

/**
 * Implementa rate limiting simples
 */
export async function rateLimit(
  identifier: string, 
  options: RateLimitOptions
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  
  const key = options.keyGenerator ? options.keyGenerator(identifier) : identifier
  const windowMs = parseTimeWindow(options.window)
  const now = Date.now()
  
  const current = rateLimitStore.get(key)
  
  // Se não existe ou janela expirou, criar nova entrada
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      success: true,
      remaining: options.max - 1,
      resetTime: now + windowMs
    }
  }
  
  // Verificar se excedeu limite
  if (current.count >= options.max) {
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }
  
  // Incrementar contador
  current.count++
  rateLimitStore.set(key, current)
  
  return {
    success: true,
    remaining: options.max - current.count,
    resetTime: current.resetTime
  }
}

/**
 * Middleware de rate limiting para funções
 */
export function withRateLimit<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  identifier: string,
  options: RateLimitOptions
) {
  return async (...args: T): Promise<R> => {
    const result = await rateLimit(identifier, options)
    
    if (!result.success) {
      const timeLeft = Math.ceil((result.resetTime - Date.now()) / 1000)
      throw new Error(`Rate limit excedido. Tente novamente em ${timeLeft} segundos.`)
    }
    
    return fn(...args)
  }
}

/**
 * Limpa entradas expiradas do rate limiting (executar periodicamente)
 */
export function cleanupRateLimit() {
  const now = Date.now()
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Validação de entrada de cenário
 */
export function sanitizeCenarioInput(input: any): any {
  if (!input || typeof input !== 'object') return {}
  
  return {
    nome: sanitizeText(input.nome || ''),
    descricao: sanitizeText(input.descricao || ''),
    receitaBruta: sanitizeNumber(input.receitaBruta),
    cmvTotal: sanitizeNumber(input.cmvTotal),
    salariosPF: sanitizeNumber(input.salariosPF),
    alimentacao: sanitizeNumber(input.alimentacao),
    combustivelPasseio: sanitizeNumber(input.combustivelPasseio),
    outrasDespesas: sanitizeNumber(input.outrasDespesas),
    // Continuar com outros campos...
  }
}

/**
 * Validação de entrada de empresa
 */
export function sanitizeEmpresaInput(input: any): any {
  if (!input || typeof input !== 'object') return {}
  
  return {
    nome: sanitizeText(input.nome || ''),
    cnpj: sanitizeText(input.cnpj || '').replace(/[^0-9]/g, ''), // Apenas números
    email: sanitizeEmail(input.email || ''),
    telefone: sanitizeText(input.telefone || '').replace(/[^0-9]/g, ''),
    endereco: sanitizeText(input.endereco || ''),
    cidade: sanitizeText(input.cidade || ''),
    estado: sanitizeText(input.estado || '').toUpperCase().substring(0, 2),
    cep: sanitizeText(input.cep || '').replace(/[^0-9]/g, ''),
    setor: sanitizeText(input.setor || ''),
    regime: sanitizeText(input.regime || ''),
    porte: sanitizeText(input.porte || '')
  }
}

/**
 * Hook React para rate limiting
 */
export function useRateLimit(identifier: string, options: RateLimitOptions) {
  return {
    checkLimit: () => rateLimit(identifier, options),
    withLimit: <T extends any[], R>(fn: (...args: T) => Promise<R>) => 
      withRateLimit(fn, identifier, options)
  }
}

// Executar limpeza a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000)
}