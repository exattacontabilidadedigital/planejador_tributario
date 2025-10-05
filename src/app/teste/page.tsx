"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react"
import Link from "next/link"
import TesteValidacao from "@/components/teste-validacao"
import { CenariosErrorBoundary } from "@/components/cenarios-error-boundary"

interface ErrorLog {
  id: string
  timestamp: Date
  error: Error
  component: string
  user?: string
}

export default function TestePage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)

  const handleError = (error: Error, component: string = 'TesteValidacao') => {
    if (!isMonitoring) return

    const newLog: ErrorLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      error,
      component,
      user: 'test-user'
    }

    setErrorLogs(prev => [newLog, ...prev.slice(0, 19)]) // Manter últimos 20 erros

    // Log estruturado no console
    console.group('🚨 [ERROR MONITOR] Erro capturado')
    console.error('Timestamp:', newLog.timestamp.toISOString())
    console.error('Component:', component)
    console.error('Error:', error)
    console.error('Stack:', error.stack)
    console.error('User:', newLog.user)
    console.groupEnd()

    // Aqui você integraria com Sentry, LogRocket, etc.
    // Sentry.captureException(error, { 
    //   tags: { component },
    //   user: { id: newLog.user }
    // })
  }

  const clearErrorLogs = () => {
    setErrorLogs([])
    console.log('🧹 [ERROR MONITOR] Logs de erro limpos')
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    console.log(`📊 [ERROR MONITOR] Monitoramento ${!isMonitoring ? 'ativado' : 'desativado'}`)
  }

  const simulateNetworkError = () => {
    const networkError = new Error('Failed to fetch: Network timeout')
    networkError.name = 'NetworkError'
    handleError(networkError, 'NetworkSimulation')
  }

  const simulateValidationError = () => {
    const validationError = new Error('Validation failed: Required field missing')
    validationError.name = 'ValidationError'
    handleError(validationError, 'ValidationSimulation')
  }

  const simulateRuntimeError = () => {
    const runtimeError = new Error('Cannot read property of undefined')
    runtimeError.name = 'RuntimeError'
    handleError(runtimeError, 'RuntimeSimulation')
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/empresas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ambiente de Teste</h1>
            <p className="text-muted-foreground">
              Teste validação Zod, Error Boundary e monitoramento de erros
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isMonitoring ? "default" : "outline"}
            onClick={toggleMonitoring}
            className="gap-2"
          >
            {isMonitoring ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isMonitoring ? "Monitorando" : "Pausado"}
          </Button>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Boundary</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Capturando erros automaticamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validação Zod</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Schema validation funcionando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Capturados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Monitor</CardTitle>
            {isMonitoring ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isMonitoring ? 'text-green-600' : 'text-red-600'}`}>
              {isMonitoring ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema de monitoramento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Simuladores de Erro */}
      <Card>
        <CardHeader>
          <CardTitle>Simuladores de Erro</CardTitle>
          <CardDescription>
            Teste diferentes tipos de erro para verificar o comportamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={simulateNetworkError} variant="outline" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Erro de Rede
            </Button>
            
            <Button onClick={simulateValidationError} variant="outline" className="gap-2">
              <XCircle className="h-4 w-4" />
              Erro de Validação
            </Button>
            
            <Button onClick={simulateRuntimeError} variant="outline" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Erro de Runtime
            </Button>
            
            <Button onClick={clearErrorLogs} variant="ghost" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Limpar Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Teste Principal */}
      <CenariosErrorBoundary>
        <TesteValidacao onError={(error) => handleError(error)} />
      </CenariosErrorBoundary>

      {/* Monitor de Erros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Monitor de Erros ({errorLogs.length})
          </CardTitle>
          <CardDescription>
            Logs estruturados de todos os erros capturados pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum erro capturado</p>
              <p className="text-sm">Sistema funcionando perfeitamente! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {errorLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800 dark:text-red-200">
                          {log.error.name || 'Error'}
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {log.component}
                        </span>
                      </div>
                      
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        {log.error.message}
                      </p>
                      
                      <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                        <div>⏰ {log.timestamp.toLocaleString()}</div>
                        {log.user && <div>👤 {log.user}</div>}
                      </div>
                      
                      {log.error.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                            Stack trace
                          </summary>
                          <pre className="text-xs bg-red-100 dark:bg-red-900 p-2 rounded mt-1 overflow-auto max-h-32">
                            {log.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Como Usar Este Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">🧪 Teste de Validação</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Deixe o nome vazio para testar erro de validação</li>
                <li>• Digite -100 na receita para testar valor inválido</li>
                <li>• Use o botão "Testar Validação" para ver os resultados</li>
                <li>• Tente criar um cenário com dados inválidos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🛡️ Teste de Error Boundary</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use "Simular Erro Runtime" para testar captura</li>
                <li>• Observe como o Error Boundary protege a aplicação</li>
                <li>• Veja os logs estruturados no console do navegador</li>
                <li>• Teste os simuladores de diferentes tipos de erro</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Dica:</strong> Abra o console do navegador (F12) para ver logs detalhados de todos os eventos de erro e validação.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}