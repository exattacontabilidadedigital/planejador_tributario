"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Database, Download, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { 
  migrarDadosLocalStorage, 
  limparLocalStorageAposMigracao, 
  verificarDadosParaMigracao 
} from '@/lib/migration-script'

interface MigrationResult {
  success: boolean
  empresasMigradas: number
  cenariosMigrados: number
  comparativosMigrados: number
  errors: string[]
}

export default function MigrationPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [localStorageData, setLocalStorageData] = useState<{
    empresas: number
    cenarios: number
    comparativos: number
  } | null>(null)

  const handleCheckData = () => {
    setIsChecking(true)
    
    try {
      // Verificar dados do localStorage
      const empresasStorage = localStorage.getItem('empresas-storage')
      const cenariosStorage = localStorage.getItem('cenarios-storage')
      const comparativosStorage = localStorage.getItem('comparativos-storage')

      const data = {
        empresas: 0,
        cenarios: 0,
        comparativos: 0,
      }

      if (empresasStorage) {
        const { state } = JSON.parse(empresasStorage)
        data.empresas = state?.empresas?.length || 0
      }

      if (cenariosStorage) {
        const { state } = JSON.parse(cenariosStorage)
        data.cenarios = state?.cenarios?.length || 0
      }

      if (comparativosStorage) {
        const { state } = JSON.parse(comparativosStorage)
        data.comparativos = state?.comparativos?.length || 0
      }

      setLocalStorageData(data)
      verificarDadosParaMigracao()
    } catch (error) {
      console.error('Erro ao verificar dados:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleMigration = async () => {
    setIsMigrating(true)
    setMigrationResult(null)

    try {
      const result = await migrarDadosLocalStorage()
      setMigrationResult(result)
    } catch (error) {
      console.error('Erro na migração:', error)
      setMigrationResult({
        success: false,
        empresasMigradas: 0,
        cenariosMigrados: 0,
        comparativosMigrados: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleClearLocalStorage = () => {
    limparLocalStorageAposMigracao()
    setLocalStorageData(null)
    setMigrationResult(null)
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Database className="h-8 w-8" />
            Migração de Dados
          </h1>
          <p className="text-muted-foreground">
            Migre seus dados existentes do localStorage para o Supabase
          </p>
        </div>

        {/* Verificação de dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              1. Verificar Dados Existentes
            </CardTitle>
            <CardDescription>
              Primeiro, verifique quantos dados você tem no localStorage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCheckData} 
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? 'Verificando...' : 'Verificar Dados do localStorage'}
            </Button>

            {localStorageData && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold">{localStorageData.empresas}</div>
                  <div className="text-sm text-muted-foreground">Empresas</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold">{localStorageData.cenarios}</div>
                  <div className="text-sm text-muted-foreground">Cenários</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold">{localStorageData.comparativos}</div>
                  <div className="text-sm text-muted-foreground">Comparativos</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Migração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              2. Executar Migração
            </CardTitle>
            <CardDescription>
              Migre todos os dados para o Supabase. Esta operação é segura e não remove os dados do localStorage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleMigration} 
              disabled={isMigrating || !localStorageData}
              className="w-full"
              size="lg"
            >
              {isMigrating ? 'Migrando...' : 'Iniciar Migração'}
            </Button>

            {!localStorageData && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Execute a verificação de dados primeiro
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Resultado da migração */}
        {migrationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {migrationResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Resultado da Migração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {migrationResult.empresasMigradas}
                  </div>
                  <div className="text-sm text-muted-foreground">Empresas Migradas</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {migrationResult.cenariosMigrados}
                  </div>
                  <div className="text-sm text-muted-foreground">Cenários Migrados</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {migrationResult.comparativosMigrados}
                  </div>
                  <div className="text-sm text-muted-foreground">Comparativos Migrados</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={migrationResult.success ? "default" : "destructive"}>
                  {migrationResult.success ? "Migração Bem-sucedida" : "Migração com Erros"}
                </Badge>
              </div>

              {migrationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-semibold">Erros encontrados:</div>
                      {migrationResult.errors.map((error, index) => (
                        <div key={index} className="text-sm">• {error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Limpeza do localStorage */}
        {migrationResult?.success && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                3. Limpeza (Opcional)
              </CardTitle>
              <CardDescription>
                Após confirmar que a migração foi bem-sucedida, você pode limpar os dados do localStorage.
                <strong className="text-destructive"> Esta ação é irreversível!</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleClearLocalStorage}
                variant="destructive"
                className="w-full"
              >
                Limpar dados do localStorage
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <strong>Backup:</strong> Faça um backup dos seus dados antes de executar a migração, 
                exportando-os ou salvando uma cópia do localStorage.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <strong>Verificação:</strong> Sempre verifique os dados primeiro para entender 
                quantos registros serão migrados.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <strong>Segurança:</strong> A migração não remove dados do localStorage automaticamente. 
                Você pode executá-la múltiplas vezes sem perder dados.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <strong>Limpeza:</strong> Só limpe o localStorage após confirmar que todos os dados 
                foram migrados corretamente no Supabase.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}