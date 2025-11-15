'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useCenariosStore } from '@/stores/cenarios-store'
import { validateCenarioData } from '@/lib/validations/cenario'
import { CenariosErrorBoundary, CenariosErrorMessage } from '@/components/cenarios-error-boundary'
import { AlertTriangle, CheckCircle2, Bug, Zap, Database } from 'lucide-react'

interface TesteValidacaoProps {
  onError?: (error: Error) => void
}

// Componente que pode gerar erros propositalmente
function ComponenteComErro({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Erro simulado para testar Error Boundary!')
  }
  
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span className="text-green-800 font-medium">Componente funcionando normalmente</span>
      </div>
    </div>
  )
}

export function TesteValidacao({ onError }: TesteValidacaoProps) {
  const [nomeInput, setNomeInput] = useState('')
  const [descricaoInput, setDescricaoInput] = useState('')
  const [receitaInput, setReceitaInput] = useState('')
  const [forcarErro, setForcarErro] = useState(false)
  const [testeResults, setTesteResults] = useState<string[]>([])
  const { toast } = useToast()
  const { addCenario } = useCenariosStore()

  const adicionarLog = (mensagem: string) => {
    setTesteResults(prev => [`${new Date().toLocaleTimeString()}: ${mensagem}`, ...prev.slice(0, 9)])
  }

  const testarValidacao = async () => {
    try {
      adicionarLog('🧪 Iniciando teste de validação...')
      
      // Dados de teste (alguns inválidos propositalmente)
      const dadosTeste = {
        nome: nomeInput || '', // String vazia deve falhar
        descricao: descricaoInput,
        empresaId: 'test-empresa-123',
        configuracao: {
          receitaBruta: receitaInput ? parseFloat(receitaInput) : -100, // Valor negativo deve falhar
          cmvTotal: 50000,
          icmsInterno: 18
        },
        status: 'rascunho' as const,
        ano: 2025,
        tipo_periodo: 'mensal' as const,
        data_inicio: '2025-01-01',
        data_fim: '2025-01-31',
        mes: 1,
        trimestre: 1 as const,
        criado_por: 'test-user',
        tags: ['teste']
      }

      adicionarLog('📋 Validando dados com Zod schema...')
      
      // Testar validação
      const resultadoValidacao = validateCenarioData(dadosTeste)
      
      if (resultadoValidacao.success) {
        adicionarLog('✅ Validação passou! Dados estão corretos.')
        toast({
          title: "Validação bem-sucedida!",
          description: "Todos os dados são válidos.",
        })
      } else {
        adicionarLog('❌ Validação falhou:')
        resultadoValidacao.errors.forEach(error => {
          adicionarLog(`  - ${error}`)
        })
        toast({
          title: "Falha na validação",
          description: `${resultadoValidacao.errors.length} erro(s) encontrado(s)`,
          variant: "destructive",
        })
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      adicionarLog(`💥 Erro durante teste: ${errorMessage}`)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      toast({
        title: "Erro no teste",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const testarCriacaoCenario = async () => {
    try {
      adicionarLog('🏗️ Testando criação de cenário via store...')
      
      const novoCenario = {
        nome: nomeInput || 'Cenário Teste',
        descricao: descricaoInput || 'Cenário criado para teste de validação',
        periodo: {
          tipo: 'mensal' as const,
          inicio: '2025-01-01',
          fim: '2025-01-31',
          mes: '1',
          ano: 2025
        },
        status: 'rascunho' as const
      }

      const configTeste = {
        receitaBruta: receitaInput ? parseFloat(receitaInput) : 100000,
        cmvTotal: 50000,
        despOperacionais: 0,
        icmsInterno: 18,
        icmsSul: 0,
        icmsNorte: 0,
        difal: 0,
        fcp: 0,
        pisAliq: 1.65,
        cofinsAliq: 7.6,
        irpjBase: 25,
        csllAliq: 9,
        issAliq: 0,
        // Valores padrão para todos os outros campos obrigatórios
        aluguel: 0,
        energia: 0,
        telefone: 0,
        contabilidade: 0,
        prolabore: 0,
        salarios: 0,
        alimentacao: 0,
        combustivelPasseio: 0,
        outrasDespesas: 0,
        salariosPF: 0,
        percentualST: 0,
        totalVendas: 0,
        impostoDebitoIcms: 0,
        impostoCreditoIcms: 0,
        percentualMargemIcms: 0,
        impostoDebito: 0,
        impostoCredito: 0,
        percentualMargem: 0,
        baseCalculoPisCofins: 0,
        baseCalculoIr: 0,
        valorImposto: 0,
        percentualDAS: 0,
        anexoSimples: '',
        faixaFaturamento: '',
        percentualFaixa: 0
      } as any // Usar any para evitar erro de tipagem durante teste

      await addCenario('test-empresa-123', novoCenario, configTeste)
      adicionarLog('✅ Cenário criado com sucesso via store!')
      toast({
        title: "Cenário criado!",
        description: "Validação e criação funcionaram corretamente.",
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      adicionarLog(`💥 Erro ao criar cenário: ${errorMessage}`)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      toast({
        title: "Erro na criação",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const simularErroRuntime = () => {
    adicionarLog('💣 Simulando erro de runtime...')
    setForcarErro(true)
    setTimeout(() => setForcarErro(false), 3000) // Reset after 3 seconds
  }

  const limparLogs = () => {
    setTesteResults([])
    adicionarLog('🧹 Logs limpos')
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Teste de Validação e Error Handling
          </CardTitle>
          <CardDescription>
            Use este ambiente para testar a validação Zod e o sistema de tratamento de erros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cenário</Label>
              <Input
                id="nome"
                value={nomeInput}
                onChange={(e) => setNomeInput(e.target.value)}
                placeholder="Deixe vazio para testar erro"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receita">Receita Bruta (R$)</Label>
              <Input
                id="receita"
                type="number"
                value={receitaInput}
                onChange={(e) => setReceitaInput(e.target.value)}
                placeholder="Digite -100 para testar erro"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricaoInput}
              onChange={(e) => setDescricaoInput(e.target.value)}
              placeholder="Descrição opcional do cenário de teste"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testarValidacao} variant="outline" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Testar Validação
            </Button>
            
            <Button onClick={testarCriacaoCenario} className="gap-2">
              <Database className="h-4 w-4" />
              Criar Cenário
            </Button>
            
            <Button onClick={simularErroRuntime} variant="destructive" className="gap-2">
              <Zap className="h-4 w-4" />
              Simular Erro Runtime
            </Button>
            
            <Button onClick={limparLogs} variant="ghost" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Limpar Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Componente que pode gerar erro */}
      <Card>
        <CardHeader>
          <CardTitle>Teste do Error Boundary</CardTitle>
          <CardDescription>
            O componente abaixo é protegido por Error Boundary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CenariosErrorBoundary>
            <ComponenteComErro shouldError={forcarErro} />
          </CenariosErrorBoundary>
        </CardContent>
      </Card>

      {/* Logs de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Teste</CardTitle>
          <CardDescription>
            Acompanhe os resultados dos testes em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
            {testeResults.length === 0 ? (
              <div className="text-gray-500">Nenhum teste executado ainda...</div>
            ) : (
              testeResults.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TesteValidacao