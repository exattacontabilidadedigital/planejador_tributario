"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, Download, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { testRunner } from "@/lib/testing/automated-test-suite"

interface TestResult {
  testId: string
  requirement: string
  description: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  details: string
  executedAt: Date
  duration: number
}

interface TestSuite {
  suiteName: string
  tests: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
    duration: number
  }
}

export default function AutomatedTestsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null)
  const [progress, setProgress] = useState(0)

  const runTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setTestSuite(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const results = await testRunner.runAllTests()
      
      clearInterval(progressInterval)
      setProgress(100)
      setTestSuite(results)
    } catch (error) {
      console.error('Erro ao executar testes:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const downloadReport = () => {
    if (!testSuite) return

    const report = testRunner.generateReport(testSuite)
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tax-planner-test-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'SKIP':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-500'
      case 'FAIL':
        return 'bg-red-500'
      case 'SKIP':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
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
            <h1 className="text-3xl font-bold">Testes Automatizados</h1>
            <p className="text-muted-foreground">
              Suite de testes baseada no relatório TestSprite MCP
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={runTests} disabled={isRunning} className="gap-2">
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </Button>
          
          {testSuite && (
            <Button onClick={downloadReport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Baixar Relatório
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Executando Testes...</CardTitle>
            <CardDescription>
              Verificando todos os requisitos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% concluído
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Summary */}
      {testSuite && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSuite.summary.total}</div>
              <p className="text-xs text-muted-foreground">
                testes executados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Passou</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{testSuite.summary.passed}</div>
              <p className="text-xs text-muted-foreground">
                {((testSuite.summary.passed / testSuite.summary.total) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Falhou</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{testSuite.summary.failed}</div>
              <p className="text-xs text-muted-foreground">
                {((testSuite.summary.failed / testSuite.summary.total) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Duração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSuite.summary.duration}</div>
              <p className="text-xs text-muted-foreground">milissegundos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results by Requirement */}
      {testSuite && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados por Requisito</CardTitle>
            <CardDescription>
              Detalhamento dos testes executados conforme relatório TestSprite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(
                testSuite.tests.reduce((acc, test) => {
                  if (!acc[test.requirement]) {
                    acc[test.requirement] = []
                  }
                  acc[test.requirement].push(test)
                  return acc
                }, {} as Record<string, TestResult[]>)
              ).map(([requirement, tests]) => (
                <div key={requirement} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{requirement}</h3>
                    <Badge variant="outline">
                      {tests.length} teste{tests.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {tests.map((test) => (
                      <div 
                        key={test.testId}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <p className="font-medium">{test.testId}</p>
                            <p className="text-sm text-muted-foreground">
                              {test.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`${getStatusColor(test.status)} text-white`}
                          >
                            {test.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {test.duration}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Tests Details */}
      {testSuite && testSuite.summary.failed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Testes Falhados</CardTitle>
            <CardDescription>
              Detalhes dos erros encontrados durante a execução
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testSuite.tests
                .filter(test => test.status === 'FAIL')
                .map((test) => (
                  <div key={test.testId} className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        {test.testId} - {test.requirement}
                      </h4>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                      {test.description}
                    </p>
                    <div className="bg-red-100 dark:bg-red-900 p-3 rounded font-mono text-xs">
                      <strong>Erro:</strong> {test.details}
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                      Executado em: {test.executedAt.toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre os Testes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Requisitos Cobertos</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>R1:</strong> Cálculos Tributários (ICMS, PIS/COFINS, IRPJ/CSLL)</li>
              <li>• <strong>R2:</strong> Importação CSV e Memórias de Cálculo</li>
              <li>• <strong>R3:</strong> DRE Dinâmica e Indicadores</li>
              <li>• <strong>R4:</strong> Gestão de Cenários (CRUD e Comparação)</li>
              <li>• <strong>R5:</strong> Exportação PDF</li>
              <li>• <strong>R6-R13:</strong> Outros requisitos em desenvolvimento</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Como Interpretar os Resultados</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>PASS:</strong> Teste executado com sucesso</li>
              <li>• <strong>FAIL:</strong> Teste falhou - requer correção</li>
              <li>• <strong>SKIP:</strong> Teste pulado - funcionalidade não implementada</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}