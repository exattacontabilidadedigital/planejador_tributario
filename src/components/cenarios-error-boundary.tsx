'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMonitor } from '@/lib/error-monitor'

interface CenariosErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  reportId?: string
}

export class CenariosErrorBoundary extends React.Component<
  CenariosErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: CenariosErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualiza o state para mostrar a UI de erro
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capturar erro com o novo sistema de monitoramento
    const report = getErrorMonitor().captureError(error, {
      component: 'CenariosErrorBoundary',
      action: 'component_error',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    })

    this.setState({
      error,
      errorInfo,
      reportId: report.id
    })
  }

  handleRetry = () => {
    // Log da tentativa de retry
    getErrorMonitor().captureError(new Error('User triggered retry'), {
      component: 'CenariosErrorBoundary',
      action: 'user_retry',
      metadata: {
        originalErrorId: this.state.reportId
      }
    })

    // Limpa o estado de erro para tentar novamente
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      reportId: undefined
    })
  }

  handleGoHome = () => {
    // Log da navegação
    getErrorMonitor().captureError(new Error('User navigated away from error'), {
      component: 'CenariosErrorBoundary',
      action: 'user_navigation',
      metadata: {
        originalErrorId: this.state.reportId
      }
    })

    // Redireciona para a página inicial
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Se há um fallback customizado, usa ele
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI de erro padrão para cenários
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Erro no Sistema de Cenários</CardTitle>
              <CardDescription className="text-base">
                Ocorreu um erro inesperado ao carregar os cenários tributários.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Informações do erro com Report ID */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nosso sistema detectou um problema e estamos trabalhando para resolvê-lo.
                </p>
                <p className="text-sm text-muted-foreground">
                  Você pode tentar recarregar a página ou voltar ao início.
                </p>
                {this.state.reportId && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    ID do Erro: {this.state.reportId}
                  </p>
                )}
              </div>

              {/* Detalhes técnicos (colapsíveis) */}
              {this.state.error && (
                <details className="border rounded-lg p-4 bg-muted/50">
                  <summary className="cursor-pointer text-sm font-medium hover:text-primary">
                    Detalhes técnicos (clique para expandir)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Erro:</span>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    
                    {this.state.error.stack && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Stack trace:</span>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Componente:</span>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} variant="default" size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>

              {/* Informações de suporte */}
              <div className="text-center border-t pt-6">
                <p className="text-xs text-muted-foreground mb-2">
                  Se o problema persistir, entre em contato com o suporte:
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs">
                  <span>📧 suporte@exemplo.com</span>
                  <span>📞 (11) 9999-9999</span>
                  <span>💬 Chat online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar com React Query ou SWR - Integrado com Error Monitor
export function useCenariosErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: { component?: string, action?: string }) => {
    const report = getErrorMonitor().captureError(error, {
      component: context?.component || 'useCenariosErrorHandler',
      action: context?.action || 'hook_error',
      metadata: {
        hookUsage: true
      }
    })
    
    // Aqui você pode adicionar lógica personalizada de tratamento de erro
    // como notificações toast, redirect, etc.
    
    return {
      title: 'Erro nos Cenários',
      message: error.message || 'Ocorreu um erro inesperado',
      action: 'retry',
      reportId: report.id
    }
  }, [])

  return { handleError }
}

// Componente para erro simples (sem error boundary)
export function CenariosErrorMessage({ 
  error, 
  onRetry 
}: { 
  error: Error
  onRetry?: () => void 
}) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-destructive">Erro ao carregar cenários</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message || 'Ocorreu um erro inesperado'}
            </p>
          </div>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CenariosErrorBoundary