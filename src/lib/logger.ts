/**
 * Sistema de Logging Estruturado
 * Substitui console.error/log por sistema profissional
 * Integração preparada para Sentry, LogRocket, etc.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

export interface LogContext {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: LogContext
  error?: Error
  environment: 'development' | 'staging' | 'production'
}

class Logger {
  private static instance: Logger
  private environment: 'development' | 'staging' | 'production'
  private isEnabled: boolean
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private constructor() {
    this.environment = (process.env.NODE_ENV as any) || 'development'
    this.isEnabled = true
    
    // Em desenvolvimento, mostrar logs no console
    if (this.environment === 'development') {
      this.setupConsoleOutput()
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private setupConsoleOutput() {
    // Interceptar console.error/log apenas em desenvolvimento
    if (typeof window !== 'undefined') {
      const originalError = console.error
      const originalLog = console.log
      const originalWarn = console.warn

      console.error = (...args) => {
        this.error(args.join(' '))
        originalError.apply(console, args)
      }

      console.warn = (...args) => {
        this.warn(args.join(' '))
        originalWarn.apply(console, args)
      }
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.isEnabled) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      environment: this.environment
    }

    // Adicionar ao array local
    this.logs.unshift(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Em produção, enviar para serviços externos
    if (this.environment === 'production') {
      this.sendToExternalService(entry)
    }

    // Em desenvolvimento, console colorido
    if (this.environment === 'development') {
      this.outputToConsole(entry)
    }
  }

  private outputToConsole(entry: LogEntry) {
    const timestamp = entry.timestamp.toISOString()
    const context = entry.context ? JSON.stringify(entry.context) : ''
    
    const colors = {
      debug: '\x1b[36m',    // Cyan
      info: '\x1b[32m',     // Green
      warn: '\x1b[33m',     // Yellow
      error: '\x1b[31m',    // Red
      critical: '\x1b[35m'  // Magenta
    }

    const reset = '\x1b[0m'
    const color = colors[entry.level]

    console.log(
      `${color}[${entry.level.toUpperCase()}]${reset} ${timestamp} - ${entry.message}`,
      context ? `\nContext: ${context}` : '',
      entry.error ? `\nError: ${entry.error.stack}` : ''
    )
  }

  private async sendToExternalService(entry: LogEntry) {
    try {
      // Integração com Sentry
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        const Sentry = (window as any).Sentry
        
        if (entry.level === 'error' || entry.level === 'critical') {
          Sentry.captureException(entry.error || new Error(entry.message), {
            tags: {
              level: entry.level,
              component: entry.context?.component,
              action: entry.context?.action
            },
            user: {
              id: entry.context?.userId
            },
            extra: entry.context?.metadata
          })
        } else {
          Sentry.addBreadcrumb({
            message: entry.message,
            level: entry.level as any,
            data: entry.context
          })
        }
      }

      // Integração com LogRocket
      if (typeof window !== 'undefined' && (window as any).LogRocket) {
        const LogRocket = (window as any).LogRocket
        LogRocket.log(entry.level, entry.message, entry.context)
      }

      // API própria de logs (opcional)
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })

    } catch (error) {
      // Fallback silencioso para não quebrar aplicação
      if (this.environment === 'development') {
        console.error('Erro ao enviar log para serviço externo:', error)
      }
    }
  }

  // Métodos públicos
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error)
  }

  critical(message: string, context?: LogContext, error?: Error) {
    this.log('critical', message, context, error)
  }

  // Métodos de controle
  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }

  clear() {
    this.logs = []
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  // Método para capturar performance
  time(label: string) {
    console.time(label)
  }

  timeEnd(label: string, context?: LogContext) {
    console.timeEnd(label)
    this.debug(`Performance: ${label} completed`, context)
  }
}

// Singleton instance
export const logger = Logger.getInstance()

// Hook para React components
export function useLogger() {
  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    critical: logger.critical.bind(logger),
    time: logger.time.bind(logger),
    timeEnd: logger.timeEnd.bind(logger)
  }
}

// Utilitários para facilitar uso
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, context?: LogContext, error?: Error) => logger.error(message, context, error),
  critical: (message: string, context?: LogContext, error?: Error) => logger.critical(message, context, error)
}

export default logger