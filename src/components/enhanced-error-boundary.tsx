"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Home, Bug, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { devConfig, errorConfig } from "@/config/dev-config"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string | null
  retryCount: number
  lastErrorTime: number
}

/**
 * Enhanced Error Boundary Component
 * Captures React errors and displays a friendly fallback UI
 * Includes automatic recovery, detailed logging, and better UX
 */
export class EnhancedErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimer: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error,
      errorId,
      lastErrorTime: Date.now()
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      retryCount: this.state.retryCount,
      errorId: this.state.errorId
    }

    // Log to console with detailed information
    if (errorConfig.enableErrorBoundaryLogging) {
      console.group(`🚨 Enhanced Error Boundary: ${this.state.errorId}`)
      console.error("Error:", error)
      console.error("Error Info:", errorInfo)
      console.table(errorDetails)
      console.groupEnd()
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send to external logging service in production
    if (errorConfig.enableExternalLogging && typeof window !== 'undefined') {
      this.logToExternalService(errorDetails)
    }

    // Auto-recovery mechanism for non-critical errors
    if (errorConfig.enableAutoRecovery && this.state.retryCount < 3) {
      this.scheduleAutoRecovery()
    }
  }

  private logToExternalService = async (errorDetails: any) => {
    try {
      // Here you would integrate with Sentry, LogRocket, etc.
      // Example:
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   body: JSON.stringify(errorDetails)
      // })
      console.log('📡 Would log to external service:', errorDetails)
    } catch (e) {
      console.error('Failed to log to external service:', e)
    }
  }

  private scheduleAutoRecovery = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }

    // Auto-retry after 5 seconds
    this.retryTimer = setTimeout(() => {
      console.log(`🔄 Auto-recovery attempt ${this.state.retryCount + 1}`)
      this.retry()
    }, 5000)
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }
  }

  retry = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    this.setState(prevState => ({ 
      hasError: false, 
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  reset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      // Default enhanced fallback
      return (
        <EnhancedErrorFallback 
          error={this.state.error} 
          reset={this.reset}
          retry={this.retry}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          lastErrorTime={this.state.lastErrorTime}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Enhanced Error Fallback Component
 * Better UX with recovery options and detailed information
 */
interface EnhancedErrorFallbackProps {
  error: Error
  reset: () => void
  retry: () => void
  errorId: string | null
  retryCount: number
  lastErrorTime: number
}

function EnhancedErrorFallback({ 
  error, 
  reset, 
  retry,
  errorId,
  retryCount,
  lastErrorTime
}: EnhancedErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const [timeAgo, setTimeAgo] = React.useState('')

  React.useEffect(() => {
    const updateTimeAgo = () => {
      const diff = Date.now() - lastErrorTime
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      
      if (minutes > 0) {
        setTimeAgo(`há ${minutes} minuto${minutes > 1 ? 's' : ''}`)
      } else {
        setTimeAgo(`há ${seconds} segundo${seconds > 1 ? 's' : ''}`)
      }
    }

    updateTimeAgo()
    const timer = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(timer)
  }, [lastErrorTime])

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReloadPage = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
          <CardDescription className="text-base">
            Detectamos um erro inesperado na aplicação. Nossa equipe foi automaticamente notificada.
          </CardDescription>
          
          {/* Error metadata */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {errorId && (
              <Badge variant="secondary" className="font-mono text-xs">
                ID: {errorId}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {timeAgo}
            </Badge>
            {retryCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                Tentativas: {retryCount}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Recovery actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={retry} className="gap-2" size="lg">
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            
            <Button onClick={reset} variant="outline" className="gap-2" size="lg">
              <Shield className="h-4 w-4" />
              Reiniciar Componente
            </Button>
            
            <Button onClick={handleReloadPage} variant="secondary" className="gap-2" size="lg">
              <RefreshCw className="h-4 w-4" />
              Recarregar Página
            </Button>
            
            <Button onClick={handleGoHome} variant="ghost" className="gap-2" size="lg">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>

          {/* Error details toggle */}
          <div className="border-t pt-6">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              size="sm"
              className="gap-2 mx-auto block"
            >
              <Bug className="h-4 w-4" />
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
            </Button>

            {showDetails && (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                  <p className="font-semibold mb-2 text-destructive">
                    Mensagem do Erro:
                  </p>
                  <p className="text-muted-foreground break-all">{error.message}</p>
                </div>

                {error.stack && errorConfig.showErrorDetails && (
                  <details className="rounded-lg bg-muted p-4">
                    <summary className="cursor-pointer text-sm font-medium hover:text-foreground">
                      Stack Trace (Clique para expandir)
                    </summary>
                    <pre className="mt-3 text-xs text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Help information */}
          <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
            <p className="mb-2">💡 <strong>Dicas para resolver:</strong></p>
            <ul className="text-left space-y-1 max-w-md mx-auto">
              <li>• Tente recarregar a página</li>
              <li>• Verifique sua conexão com a internet</li>
              <li>• Limpe o cache do navegador</li>
              <li>• Se o problema persistir, entre em contato conosco</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook for programmatic error handling
 * Useful for capturing errors in async operations
 */
export function useErrorBoundary() {
  const [, setState] = React.useState()
  
  const captureError = React.useCallback((error: Error) => {
    setState(() => {
      throw error
    })
  }, [])

  return { captureError }
}

// Re-export original for backward compatibility
// Note: Original ErrorBoundary is available in error-boundary.tsx

// Default export is the enhanced version
export default EnhancedErrorBoundary