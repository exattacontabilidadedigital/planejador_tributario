/**
 * Sistema de monitoramento de erros para desenvolvimento e produção
 * Integração preparada para Sentry, LogRocket, Datadog, etc.
 */

export interface ErrorContext {
  component?: string
  user?: {
    id: string
    email?: string
    role?: string
  }
  session?: {
    id: string
    timestamp: Date
    userAgent?: string
  }
  action?: string
  metadata?: Record<string, any>
}

export interface ErrorReport {
  id: string
  timestamp: Date
  error: {
    name: string
    message: string
    stack?: string
  }
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  environment: 'development' | 'staging' | 'production'
  fingerprint: string
}

class ErrorMonitor {
  private static instance: ErrorMonitor
  private reports: ErrorReport[] = []
  private maxReports = 100
  private isEnabled = true
  private environment: 'development' | 'staging' | 'production'

  constructor() {
    this.environment = process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development'
    
    // Configurar handlers globais apenas em desenvolvimento E no browser
    if (this.environment === 'development' && typeof window !== 'undefined') {
      this.setupGlobalHandlers()
    }
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  private setupGlobalHandlers() {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') {
      return
    }
    
    // Capturar erros não tratados
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), {
        component: 'GlobalErrorHandler',
        action: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        component: 'GlobalErrorHandler',
        action: 'unhandled_promise_rejection'
      })
    })
  }

  private generateFingerprint(error: Error, context: ErrorContext): string {
    const key = `${error.name}:${error.message}:${context.component}:${context.action}`
    return btoa(key).substring(0, 16)
  }

  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Erros críticos
    if (error.name === 'NetworkError' || error.message.includes('Failed to fetch')) {
      return 'critical'
    }
    
    // Erros de validação são médios
    if (error.name === 'ValidationError' || context.action?.includes('validation')) {
      return 'medium'
    }
    
    // Erros de UI são baixos
    if (context.component?.includes('UI') || context.component?.includes('Component')) {
      return 'low'
    }
    
    // Outros erros são altos por padrão
    return 'high'
  }

  captureError(error: Error, context: ErrorContext = {}): ErrorReport {
    if (!this.isEnabled) return {} as ErrorReport

    const report: ErrorReport = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: {
        ...context,
        session: {
          id: typeof window !== 'undefined' && sessionStorage 
            ? sessionStorage.getItem('session-id') || 'anonymous' 
            : 'ssr-session',
          timestamp: new Date(),
          userAgent: typeof window !== 'undefined' && navigator 
            ? navigator.userAgent 
            : 'SSR',
          ...context.session
        }
      },
      severity: this.determineSeverity(error, context),
      environment: this.environment,
      fingerprint: this.generateFingerprint(error, context)
    }

    // Adicionar ao array local
    this.reports.unshift(report)
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports)
    }

    // Log estruturado no console (desenvolvimento)
    if (this.environment === 'development') {
      console.group(`🚨 [ERROR MONITOR] ${report.severity.toUpperCase()}`)
      console.error('Report ID:', report.id)
      console.error('Timestamp:', report.timestamp.toISOString())
      console.error('Component:', context.component)
      console.error('Action:', context.action)
      console.error('Error:', error)
      console.error('Fingerprint:', report.fingerprint)
      if (context.metadata) {
        console.error('Metadata:', context.metadata)
      }
      console.groupEnd()
    }

    // Enviar para serviços externos (produção)
    if (this.environment === 'production') {
      this.sendToExternalServices(report)
    }

    return report
  }

  private async sendToExternalServices(report: ErrorReport) {
    try {
      // Integração com Sentry
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(report.error.message), {
          tags: {
            component: report.context.component,
            action: report.context.action,
            severity: report.severity
          },
          user: report.context.user,
          fingerprint: [report.fingerprint],
          extra: report.context.metadata
        })
      }

      // Integração com LogRocket
      if (typeof window !== 'undefined' && (window as any).LogRocket) {
        (window as any).LogRocket.captureException(new Error(report.error.message), {
          tags: {
            component: report.context.component,
            severity: report.severity
          }
        })
      }

      // Envio para API própria
      if (process.env.NEXT_PUBLIC_ERROR_REPORTING_URL) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report)
        })
      }
    } catch (sendError) {
      console.error('Failed to send error report:', sendError)
    }
  }

  getReports(): ErrorReport[] {
    return [...this.reports]
  }

  getReportsByComponent(component: string): ErrorReport[] {
    return this.reports.filter(report => report.context.component === component)
  }

  getReportsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.reports.filter(report => report.severity === severity)
  }

  clearReports(): void {
    this.reports = []
    console.log('🧹 [ERROR MONITOR] All reports cleared')
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    console.log(`📊 [ERROR MONITOR] Monitoring ${enabled ? 'enabled' : 'disabled'}`)
  }

  isMonitoringEnabled(): boolean {
    return this.isEnabled
  }

  getStats() {
    const total = this.reports.length
    const byComponent = this.reports.reduce((acc, report) => {
      const component = report.context.component || 'unknown'
      acc[component] = (acc[component] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const bySeverity = this.reports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const last24h = this.reports.filter(
      report => Date.now() - report.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length

    return {
      total,
      last24h,
      byComponent,
      bySeverity,
      environment: this.environment
    }
  }
}

// Hook para usar o monitor em React components
export function useErrorMonitor() {
  const monitor = getErrorMonitor()

  const captureError = (error: Error, context?: ErrorContext) => {
    return monitor.captureError(error, context)
  }

  const captureInfo = (message: string, context?: ErrorContext) => {
    const info = new Error(message)
    info.name = 'InfoEvent'
    return monitor.captureError(info, { ...context, action: 'info' })
  }

  const captureWarning = (message: string, context?: ErrorContext) => {
    const warning = new Error(message)
    warning.name = 'WarningEvent'
    return monitor.captureError(warning, { ...context, action: 'warning' })
  }

  return {
    captureError,
    captureInfo,
    captureWarning,
    getReports: () => monitor.getReports(),
    clearReports: () => monitor.clearReports(),
    setEnabled: (enabled: boolean) => monitor.setEnabled(enabled),
    isEnabled: () => monitor.isMonitoringEnabled(),
    getStats: () => monitor.getStats()
  }
}

// Lazy singleton instance - só instancia quando usado no browser
export const getErrorMonitor = () => {
  if (typeof window === 'undefined') {
    // Retorna mock para SSR
    return {
      captureError: () => ({ id: 'ssr-error', timestamp: new Date() }),
      captureInfo: () => ({ id: 'ssr-info', timestamp: new Date() }),
      captureWarning: () => ({ id: 'ssr-warning', timestamp: new Date() }),
      getReports: () => [],
      clearReports: () => {},
      setEnabled: () => {},
      isEnabled: () => false,
      isMonitoringEnabled: () => false,
      getStats: () => ({ total: 0, byLevel: {} })
    }
  }
  return ErrorMonitor.getInstance()
}

export default ErrorMonitor