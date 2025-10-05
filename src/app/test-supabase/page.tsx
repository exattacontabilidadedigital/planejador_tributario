"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  const testConnection = async () => {
    setStatus('testing')
    setMessage('Testando conexão...')
    setDetails(null)

    try {
      const supabase = createClient()

      console.log('🔄 Iniciando testes de conexão...')

      // 1. Testar conexão básica
      const { data: testData, error: testError } = await supabase
        .from('empresas')
        .select('count')
        .limit(1)

      console.log('📊 Teste básico:', { testData, testError })

      if (testError) {
        throw new Error(`Erro ao conectar: ${testError.message}`)
      }

      // 2. Testar inserção
      console.log('🔄 Testando inserção...')
      
      const testEmpresa = {
        nome: `Teste ${Date.now()}`,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Teste LTDA',
        regime_tributario: 'lucro-real',
        setor: 'comercio',
        uf: 'SP',
        municipio: 'São Paulo',
        inscricao_estadual: null,
        inscricao_municipal: null,
      }
      
      const { data: insertResult, error: insertError } = await supabase
        .from('empresas')
        .insert(testEmpresa)
        .select()
        .single()
      
      console.log('📥 Resultado inserção:', { insertResult, insertError })
      
      if (insertError) {
        setDetails({
          basicTest: { success: true },
          insertTest: { error: insertError, data: testEmpresa }
        })
        throw new Error(`Erro na inserção: ${insertError.message}`)
      }
      
      // 3. Limpar teste - deletar empresa criada
      if (insertResult) {
        await supabase
          .from('empresas')
          .delete()
          .eq('id', insertResult.id)
        
        console.log('🧹 Empresa de teste removida')
      }

      // 2. Verificar funções SQL (opcional)
      let functionsStatus = 'Pendente (executar schema.sql)'
      try {
        await supabase.rpc('get_empresa_stats', { empresa_uuid: '00000000-0000-0000-0000-000000000000' })
        functionsStatus = 'OK'
      } catch (e) {
        // Funções ainda não criadas
      }

      setStatus('success')
      setMessage('✅ Conexão com Supabase estabelecida com sucesso!')
      setDetails({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString(),
        empresasTable: 'OK',
        functions: functionsStatus
      })
    } catch (error: any) {
      setStatus('error')
      setMessage(`❌ Erro: ${error.message}`)
      setDetails({
        error: error.message,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO CONFIGURADA',
        hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
    }
  }

  useEffect(() => {
    // Testar automaticamente ao carregar
    testConnection()
  }, [])

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Teste de Conexão - Supabase
          </CardTitle>
          <CardDescription>
            Validando configuração e conectividade com o banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {status === 'idle' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {status === 'testing' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            
            <div className="flex-1">
              <p className="font-medium">{message}</p>
              {status === 'testing' && (
                <p className="text-sm text-muted-foreground">
                  Conectando ao Supabase...
                </p>
              )}
            </div>
          </div>

          {/* Detalhes */}
          {details && (
            <div className="space-y-2">
              <h3 className="font-semibold">Detalhes:</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
                <div>
                  <strong>URL:</strong> {details.url}
                </div>
                <div>
                  <strong>Anon Key:</strong> {details.hasAnon ? '✅ Configurada' : '❌ Não configurada'}
                </div>
                {details.timestamp && (
                  <div>
                    <strong>Timestamp:</strong> {details.timestamp}
                  </div>
                )}
                {details.empresasTable && (
                  <div>
                    <strong>Tabela empresas:</strong> {details.empresasTable}
                  </div>
                )}
                {details.functions && (
                  <div>
                    <strong>Funções SQL:</strong> {details.functions}
                  </div>
                )}
                {details.error && (
                  <div className="text-red-500">
                    <strong>Erro:</strong> {details.error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instruções */}
          {status === 'error' && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                ⚠️ Possíveis soluções:
              </h3>
              <ul className="text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
                <li>1. Verifique se o arquivo <code>.env.local</code> existe</li>
                <li>2. Confirme se as variáveis estão corretas</li>
                <li>3. Execute o schema SQL no Supabase (SQL Editor)</li>
                <li>4. Reinicie o servidor de desenvolvimento</li>
              </ul>
            </div>
          )}

          {status === 'success' && details.functions === 'Pendente (executar schema.sql)' && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                📋 Próximo passo:
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Execute o arquivo <code>supabase/schema.sql</code> no SQL Editor do Supabase para criar as funções auxiliares.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={status === 'testing'}>
              {status === 'testing' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Testar Novamente
            </Button>
            
            {status === 'success' && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/empresas'}
              >
                Ir para Empresas
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
