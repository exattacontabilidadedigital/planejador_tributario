"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 * Captura erros do React e exibe uma UI de fallback amigável
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualiza o estado para renderizar a UI de fallback na próxima renderização
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para serviço de monitoramento (ex: Sentry)
    console.error("Error Boundary capturou erro:", error, errorInfo)
    
    // Aqui você pode enviar para serviço de logging
    // logErrorToService(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Se um componente de fallback customizado foi fornecido, use-o
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      // Caso contrário, use o fallback padrão
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

/**
 * Componente de Fallback Padrão
 * Exibido quando um erro é capturado
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-lg border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Algo deu errado</CardTitle>
              <CardDescription>
                Um erro inesperado ocorreu no sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do erro (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4 font-mono text-sm">
              <p className="font-semibold mb-2 text-destructive">
                Erro (visível apenas em desenvolvimento):
              </p>
              <p className="text-muted-foreground break-all">{error.message}</p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Ver stack trace
                  </summary>
                  <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-48">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Mensagem amigável */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Não se preocupe! Você pode tentar as seguintes ações:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Recarregar a página</li>
              <li>Verificar sua conexão com a internet</li>
              <li>Limpar o cache do navegador</li>
              <li>Entrar em contato com o suporte se o problema persistir</li>
            </ul>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={reset}
              className="flex-1 gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              className="flex-1"
              variant="outline"
            >
              Ir para Início
            </Button>
          </div>

          {/* Informações adicionais */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Se o problema persistir, entre em contato com o suporte técnico
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook para usar Error Boundary de forma declarativa
 * Útil para capturar erros em componentes específicos
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const showError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  const reset = React.useCallback(() => {
    setError(null)
  }, [])

  return { showError, reset }
}
