"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Plus, TrendingUp, GitCompare } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import { FormularioComparativos } from "@/components/comparativos/formulario-comparativos"
import { VisualizacaoComparativa } from "@/components/comparativos/visualizacao-comparativa"
import { ListagemComparativos } from "@/components/comparativos/listagem-comparativos"
import { ListaAnalisesComparativas } from "@/components/comparativos/lista-analises-comparativas"
import { useComparativosIntegrados } from "@/hooks/use-comparativos-integrados"
import { ModalCriarComparativo } from "@/components/comparativos/modal-criar-comparativo"
import type { DadosComparativoMensal } from "@/types/comparativo"
import '@/utils/test-salvamento' // Import para teste no console

export default function ComparativosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: empresaId } = use(params)
  const router = useRouter()
  const { getEmpresa } = useEmpresasStore()
  const empresa = getEmpresa(empresaId)
  const { toast } = useToast()

  // Estado para ano selecionado
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025)
  
  // Estado para controlar as abas
  const [abaAtiva, setAbaAtiva] = useState<string>("comparacao")
  
  // Estado para controlar se o componente foi montado
  const [montado, setMontado] = useState(false)
  
  // Estados para controle de edição
  const [dadosEditando, setDadosEditando] = useState<DadosComparativoMensal | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  
  // Estado para controle do modal de criar comparativo
  const [modalComparativoAberto, setModalComparativoAberto] = useState(false)

  // Hook para dados integrados
  const {
    resumoComparativoCompleto,
    temDadosLucroReal,
    temDadosOutrosRegimes,
    temComparacao,
    mesesComDados
  } = useComparativosIntegrados({
    empresaId,
    ano: anoSelecionado
  })

  // Marcar componente como montado e definir ano atual
  useEffect(() => {
    setMontado(true)
    const anoAtual = new Date().getFullYear()
    setAnoSelecionado(anoAtual)
  }, [])

  // Carregar dados do Supabase quando o empresaId estiver disponível
  useEffect(() => {
    if (empresaId && montado) {
      const { carregarDadosEmpresa } = useRegimesTributariosStore.getState()
      carregarDadosEmpresa(empresaId).catch(error => {
        console.error('Erro ao carregar dados da empresa:', error)
      })
    }
  }, [empresaId, montado])

  // Anos disponíveis para seleção
  const anosDisponiveis = [2023, 2024, 2025, 2026]

  // Funções para manipular edição e duplicação
  const handleEditarDado = (dados: DadosComparativoMensal) => {
    setDadosEditando(dados)
    setModoEdicao(true)
    setAbaAtiva("adicionar")
  }

  const handleDuplicarDado = async (dados: DadosComparativoMensal) => {
    try {
      const { adicionarDadoComparativo, dadosComparativos } = useRegimesTributariosStore.getState()
      
      // Função para encontrar o próximo mês disponível
      const encontrarProximoMesDisponivel = (mesAtual: string, anoAtual: number, regime: string): { mes: string, ano: number } => {
        const mesesOrdem = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
        const indiceAtual = mesesOrdem.indexOf(mesAtual)
        
        // Tentar os próximos meses no mesmo ano
        for (let i = indiceAtual + 1; i < 12; i++) {
          const mesTestado = mesesOrdem[i]
          const existe = dadosComparativos.some(item => 
            item.empresaId === dados.empresaId &&
            item.mes === mesTestado &&
            item.ano === anoAtual &&
            item.regime === regime
          )
          if (!existe) {
            return { mes: mesTestado, ano: anoAtual }
          }
        }
        
        // Se não encontrou no mesmo ano, tentar o próximo ano começando de janeiro
        const proximoAno = anoAtual + 1
        for (let i = 0; i < 12; i++) {
          const mesTestado = mesesOrdem[i]
          const existe = dadosComparativos.some(item => 
            item.empresaId === dados.empresaId &&
            item.mes === mesTestado &&
            item.ano === proximoAno &&
            item.regime === regime
          )
          if (!existe) {
            return { mes: mesTestado, ano: proximoAno }
          }
        }
        
        // Se todos os meses estão ocupados, usar ano + 2 em janeiro
        return { mes: 'jan', ano: anoAtual + 2 }
      }
      
      // Encontrar próximo mês disponível
      const { mes: novoMes, ano: novoAno } = encontrarProximoMesDisponivel(dados.mes, dados.ano, dados.regime)
      
      const dadosDuplicados = {
        empresaId: dados.empresaId,
        mes: novoMes,
        ano: novoAno,
        regime: dados.regime,
        receita: dados.receita,
        icms: dados.icms,
        pis: dados.pis,
        cofins: dados.cofins,
        irpj: dados.irpj,
        csll: dados.csll,
        iss: dados.iss,
        outros: dados.outros,
        observacoes: dados.observacoes ? `${dados.observacoes} (cópia)` : 'Cópia'
      }
      
      await adicionarDadoComparativo(dadosDuplicados)
      
      // Mostrar toast de sucesso
      const mesNome = {
        'jan': 'Janeiro', 'fev': 'Fevereiro', 'mar': 'Março', 'abr': 'Abril',
        'mai': 'Maio', 'jun': 'Junho', 'jul': 'Julho', 'ago': 'Agosto',
        'set': 'Setembro', 'out': 'Outubro', 'nov': 'Novembro', 'dez': 'Dezembro'
      }[novoMes]
      
      toast({
        title: "Dados duplicados com sucesso",
        description: `Uma cópia foi criada para ${mesNome}/${novoAno}.`,
      })
    } catch (error) {
      console.error('Erro ao duplicar dados:', error)
      
      // Verificar se é erro de constraint única
      const isConstraintError = error && typeof error === 'object' && 'code' in error && error.code === '23505'
      
      toast({
        title: "Erro ao duplicar",
        description: isConstraintError 
          ? "Já existe um registro com esses dados. Tente duplicar com dados diferentes."
          : "Ocorreu um erro ao duplicar os dados. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleSucessoFormulario = () => {
    // Limpar estados de edição
    setDadosEditando(null)
    setModoEdicao(false)
    // Voltar para aba de listagem para ver o resultado
    setAbaAtiva("listagem")
  }

  const handleCancelarEdicao = () => {
    setDadosEditando(null)
    setModoEdicao(false)
    // Voltar para aba de listagem
    setAbaAtiva("listagem")
  }

  const handleAdicionarDados = () => {
    setDadosEditando(null)
    setModoEdicao(false)
    // Ir para aba de adicionar dados
    setAbaAtiva("adicionar")
  }

  if (!montado) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/empresas")}> 
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/empresas/${empresaId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Comparativos</h1>
            <p className="text-muted-foreground">{empresa.nome}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Button 
              variant="default"
              onClick={() => {
                // TEMPORÁRIO: Remover validação para permitir testar o wizard
                // TODO: Reativar validação quando tiver dados de teste
                // if (!temComparacao) {
                //   toast({
                //     title: "Dados insuficientes",
                //     description: "Adicione dados de pelo menos 2 regimes tributários diferentes para criar uma análise comparativa.",
                //     variant: "destructive",
                //   })
                //   return
                // }
                
                setModalComparativoAberto(true)
              }}
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Nova Análise Comparativa
            </Button>
            {!temComparacao && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            )}
          </div>
          
          <Select
            value={anoSelecionado.toString()}
            onValueChange={(value) => setAnoSelecionado(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anosDisponiveis.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <ThemeToggle />
        </div>
      </div>

      {/* Modal de Criar Comparativo */}
      <ModalCriarComparativo
        empresaId={empresaId}
        aberto={modalComparativoAberto}
        onFechar={() => setModalComparativoAberto(false)}
      />

      {/* Cards de Status */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Real</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {temDadosLucroReal ? '✓' : '○'}
            </div>
            <p className="text-xs text-muted-foreground">
              {temDadosLucroReal ? 'Dados disponíveis' : 'Sem dados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outros Regimes</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {temDadosOutrosRegimes ? '✓' : '○'}
            </div>
            <p className="text-xs text-muted-foreground">
              {temDadosOutrosRegimes ? 'Dados inseridos' : 'Adicione dados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comparação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {temComparacao ? '✓' : '○'}
            </div>
            <p className="text-xs text-muted-foreground">
              {temComparacao ? 'Pronto para comparar' : 'Insuficiente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mesesComDados.length}</div>
            <p className="text-xs text-muted-foreground">
              {mesesComDados.length === 1 ? 'mês com dados' : 'meses com dados'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
        <TabsList>
          <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          <TabsTrigger value="listagem">Listagem</TabsTrigger>
          <TabsTrigger value="adicionar">Adicionar Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="comparacao" className="space-y-6">
          {/* Lista de Análises Comparativas */}
          <ListaAnalisesComparativas 
            empresaId={empresaId}
            onNovo={() => setModalComparativoAberto(true)}
          />
        </TabsContent>

        <TabsContent value="listagem" className="space-y-6">
          <ListagemComparativos
            empresaId={empresaId}
            ano={anoSelecionado}
            onEditar={handleEditarDado}
            onDuplicar={handleDuplicarDado}
            onAdicionar={handleAdicionarDados}
          />
        </TabsContent>

        <TabsContent value="adicionar" className="space-y-6">
          <FormularioComparativos 
            key={dadosEditando?.id || 'novo'}
            empresaId={empresaId}
            dadosIniciais={dadosEditando}
            modoEdicao={modoEdicao}
            onSucesso={handleSucessoFormulario}
            onCancelar={handleCancelarEdicao}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}