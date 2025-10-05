"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useEmpresas } from "@/hooks/use-empresas"
import { useCenariosStore } from "@/stores/cenarios-store"
import { useTaxStore } from "@/hooks/use-tax-store"
import { Building2, CheckCircle2, Database, ArrowRight, Loader2 } from "lucide-react"
import type { Empresa } from "@/types/empresa"
import type { Cenario } from "@/types/cenario"

export function MigracaoInicial() {
  const router = useRouter()
  const { toast } = useToast()
  const [migrado, setMigrado] = useState(false)
  const [migrando, setMigrando] = useState(false)

  const { empresas, addEmpresa, setEmpresaAtual, isLoading, error, clearError } = useEmpresas()
  const { addCenario } = useCenariosStore()
  const { config } = useTaxStore()

  const executarMigracao = async () => {
    setMigrando(true)
    clearError()

    try {
      // 1. Criar empresa de exemplo
      const empresaExemplo = {
        nome: "Empresa Exemplo",
        cnpj: "12.345.678/0001-90",
        razaoSocial: "Empresa Exemplo LTDA",
        regimeTributario: "lucro-real" as const,
        setor: "comercio" as const,
        uf: "SP",
        municipio: "São Paulo",
        inscricaoEstadual: "123.456.789.000",
        inscricaoMunicipal: "987654321",
      }

      const empresaCriada = await addEmpresa(empresaExemplo)
      setEmpresaAtual(empresaCriada.id)

      // 2. Verificar se há configuração existente no tax-planner-storage
      const temConfigExistente = config.receitaBruta > 0

      if (temConfigExistente) {
        // 3. Criar cenário com a configuração existente
        const currentYear = new Date().getFullYear() // Usado dentro de função assíncrona, não causa hidratação mismatch
        const cenarioInicial: Omit<Cenario, "id" | "criadoEm" | "atualizadoEm"> = {
          empresaId: empresaCriada.id,
          nome: "Planejamento Atual (Migrado)",
          descricao: "Cenário migrado automaticamente do sistema anterior",
          periodo: {
            tipo: "anual",
            ano: currentYear,
            inicio: `${currentYear}-01-01`,
            fim: `${currentYear}-12-31`,
          },
          status: "rascunho",
          configuracao: { ...config },
          tags: [],
        }

        addCenario(empresaCriada.id, cenarioInicial, config)

        toast({
          title: "Migração concluída com sucesso!",
          description: `Empresa criada e configuração existente migrada para o novo cenário.`,
        })
      } else {
        toast({
          title: "Empresa criada com sucesso!",
          description: "Nenhuma configuração anterior encontrada. Comece criando cenários.",
        })
      }

      setMigrado(true)

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/empresas/${empresaCriada.id}`)
      }, 2000)
    } catch (error) {
      console.error("Erro na migração:", error)
      toast({
        title: "Erro na migração",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao migrar os dados. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setMigrando(false)
    }
  }

  // Se está carregando
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando sistema...
          </CardTitle>
          <CardDescription>
            Verificando dados existentes...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Se há erro
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Database className="h-5 w-5" />
            Erro ao carregar sistema
          </CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => { clearError(); window.location.reload() }} className="gap-2">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Verificar se já existe empresa
  if (empresas.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Sistema já inicializado
          </CardTitle>
          <CardDescription>
            Você já possui empresas cadastradas. Acesse o dashboard para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/empresas")}>
            Ir para Empresas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (migrado) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Migração concluída!
          </CardTitle>
          <CardDescription>
            Redirecionando para o dashboard da empresa...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Configuração Inicial do Sistema
        </CardTitle>
        <CardDescription>
          Configure o sistema multi-empresa e migre seus dados existentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Explicação */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            O que será feito:
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Criar empresa de exemplo:</strong> Uma empresa modelo será criada com dados
                fictícios que você pode editar depois.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Migrar configurações existentes:</strong> Se você já usou o sistema
                anterior, suas configurações serão migradas para um novo cenário.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Preservar dados:</strong> Todos os seus dados serão mantidos e organizados
                no novo formato multi-empresa.
              </span>
            </li>
          </ul>
        </div>

        {/* Preview da empresa */}
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-3">Preview da Empresa:</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Nome:</dt>
              <dd className="font-medium">Empresa Exemplo</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">CNPJ:</dt>
              <dd className="font-medium">12.345.678/0001-90</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Razão Social:</dt>
              <dd className="font-medium">Empresa Exemplo LTDA</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Regime:</dt>
              <dd className="font-medium">Lucro Real</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Setor:</dt>
              <dd className="font-medium">Comércio</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">UF:</dt>
              <dd className="font-medium">SP - São Paulo</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Você poderá editar todos esses dados depois através das configurações da empresa.
          </p>
        </div>

        {/* Status da configuração existente */}
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-2">Configuração Existente:</h3>
          {config.receitaBruta > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Configuração detectada! Será migrada para um cenário.</span>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t">
                <div>
                  <dt className="text-muted-foreground">Receita Bruta:</dt>
                  <dd className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(config.receitaBruta)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">ICMS Interno:</dt>
                  <dd className="font-medium">{config.icmsInterno}%</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Nenhuma configuração anterior encontrada. Sistema limpo.</span>
            </div>
          )}
        </div>

        {/* Botão de ação */}
        <div className="flex gap-3">
          <Button onClick={executarMigracao} disabled={migrando} className="flex-1">
            {migrando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Migrando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Executar Configuração Inicial
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
