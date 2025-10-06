"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { ComparativosAnaliseServiceCompleto } from '@/services/comparativos-analise-service-completo'
import { notificarComparativoCriado, notificarAnaliseConcluida } from '@/stores/notificacoes-store'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, CheckCircle, Info, Loader2, Calendar, BarChart3 } from "lucide-react"
import { MESES_ANO } from "@/types/comparativo"
import type { ConfigComparativo, TipoComparativo } from "@/types/comparativo-analise-completo"
import type { RegimeTributario } from "@/types/comparativo"

interface WizardCriarComparativoCompletoProps {
  empresaId: string
  aberto?: boolean
  onFechar?: () => void
  onSucesso?: (comparativoId: string) => void
  onConcluir?: (comparativo: any) => void
}

interface CenarioDisponivel {
  id: string
  nome: string
  tipo: 'conservador' | 'moderado' | 'otimista'
  ano: number
  meses: number[]
  receitaTotal: number
  selecionado: boolean
}

interface DadoMensalDisponivel {
  id: string
  mes: string
  ano: number
  regime: RegimeTributario
  receita: number
  totalImpostos: number
  selecionado: boolean
}

export function WizardCriarComparativoCompleto({
  empresaId,
  aberto,
  onFechar,
  onSucesso,
  onConcluir
}: WizardCriarComparativoCompletoProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Estados do wizard
  const [etapa, setEtapa] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)

  // Etapa 1: Configuração Básica
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [tipo, setTipo] = useState<TipoComparativo>('multiplo')
  const [ano, setAno] = useState(new Date().getFullYear())
  const [mesesSelecionados, setMesesSelecionados] = useState<string[]>([])

  // Etapa 2: Cenários de Lucro Real
  const [incluirLucroReal, setIncluirLucroReal] = useState(true)
  const [cenariosDisponiveis, setCenariosDisponiveis] = useState<CenarioDisponivel[]>([])
  const [tipoCenarioLR, setTipoCenarioLR] = useState<'todos' | 'selecionados'>('selecionados')

  // Etapa 3: Dados Manuais
  const [incluirLP, setIncluirLP] = useState(true)
  const [incluirSN, setIncluirSN] = useState(true)
  const [dadosLP, setDadosLP] = useState<DadoMensalDisponivel[]>([])
  const [dadosSN, setDadosSN] = useState<DadoMensalDisponivel[]>([])

  // Calcular progresso
  const progresso = (etapa / 4) * 100

  // Anos disponíveis
  const anosDisponiveis = [2023, 2024, 2025, 2026]

  // Tipos de comparativo
  const tiposComparativo: { value: TipoComparativo; label: string; descricao: string }[] = [
    { value: 'simples', label: 'Simples', descricao: '1 cenário vs 1 regime' },
    { value: 'multiplo', label: 'Múltiplo', descricao: 'Vários cenários vs vários regimes' },
    { value: 'temporal', label: 'Temporal', descricao: 'Evolução ao longo do tempo' },
    { value: 'por_imposto', label: 'Por Imposto', descricao: 'Análise detalhada por tributo' },
    { value: 'cenarios', label: 'Entre Cenários', descricao: 'Apenas cenários de Lucro Real' }
  ]

  // Resetar wizard quando abrir
  useEffect(() => {
    if (aberto) {
      // Resetar para etapa 1
      setEtapa(1)
      // Limpar seleções
      setCenariosDisponiveis([])
      setDadosLP([])
      setDadosSN([])
    }
  }, [aberto])

  // Carregar cenários disponíveis quando abrir
  useEffect(() => {
    if (aberto && etapa === 2) {
      console.log('🎬 useEffect disparado - carregando cenários')
      carregarCenariosDisponiveis()
    }
  }, [aberto, etapa, ano, empresaId])

  // Carregar dados manuais quando avançar para etapa 3
  useEffect(() => {
    if (aberto && etapa === 3) {
      carregarDadosManuais()
    }
  }, [aberto, etapa, ano, empresaId])

  const carregarCenariosDisponiveis = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      console.log('🔍 Buscando cenários:', { empresaId, ano })
      
      // Buscar todos os cenários da empresa (sem order por enquanto)
      const { data: cenarios, error } = await supabase
        .from('cenarios')
        .select('*')
        .eq('empresa_id', empresaId)

      console.log('📦 Resposta do Supabase:', { 
        encontrados: cenarios?.length || 0, 
        temErro: !!error,
        erro: error,
        primeiroCenario: cenarios?.[0],
        todosCenarios: cenarios
      })

      // Verificar se há erro real (não apenas ausência de dados)
      if (error && error.code) {
        console.error('❌ Erro do Supabase ao buscar cenários:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Erro ao buscar cenários: ${error.message}`)
      }

      // Se não há cenários, apenas define array vazio (não é erro)
      if (!cenarios || cenarios.length === 0) {
        console.log('ℹ️ Nenhum cenário encontrado para empresa:', empresaId)
        toast({
          title: "Nenhum cenário encontrado",
          description: "Não há cenários cadastrados. Você pode criar cenários na página de Análise de Cenários.",
          variant: "default"
        })
        setCenariosDisponiveis([])
        return
      }

      // Filtrar e transformar dados do Supabase para formato do wizard
      const cenariosFormatados: CenarioDisponivel[] = cenarios
        .map(c => {
          // Extrair período do cenário (objeto JSON ou colunas individuais)
          const periodo = c.periodo || {}
          
          // Extrair ano do período (tentar várias fontes)
          const anoCenario = periodo.ano ||  // Prioridade: periodo.ano
                            c.ano ||          // Ou coluna 'ano'
                            (c.data_inicio ? new Date(c.data_inicio).getFullYear() : null) || // Ou data_inicio
                            new Date().getFullYear() // Ou ano atual como fallback

          // Extrair datas de início e fim (priorizar objeto periodo)
          const dataInicio = periodo.inicio || c.data_inicio
          const dataFim = periodo.fim || c.data_fim

          if (!dataInicio || !dataFim) {
            console.warn('⚠️ Cenário sem datas válidas:', { 
              id: c.id, 
              nome: c.nome, 
              periodo, 
              data_inicio: c.data_inicio, 
              data_fim: c.data_fim 
            })
            return null
          }

          // Extrair meses do período
          const inicio = new Date(dataInicio)
          const fim = new Date(dataFim)
          const meses: number[] = []
          
          // Calcular meses entre início e fim
          let atual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
          const fimData = new Date(fim.getFullYear(), fim.getMonth(), 1)
          
          while (atual <= fimData) {
            meses.push(atual.getMonth() + 1)
            atual.setMonth(atual.getMonth() + 1)
          }
          
          console.log(`📅 Cenário ${c.nome}: ${meses.length} meses (${meses.join(', ')})`, {
            inicio: dataInicio,
            fim: dataFim,
            meses
          })

          // Calcular receita total do config
          const receitaTotal = c.config?.receita_total || 
                               c.configuracao?.receitaBruta?.total ||
                               0

          return {
            id: c.id,
            nome: c.nome,
            tipo: c.config?.tipo_cenario || c.tipo_periodo || 'moderado',
            ano: anoCenario,
            meses,
            receitaTotal,
            selecionado: false
          }
        })
        .filter((c): c is CenarioDisponivel => c !== null) // Remove nulls
        .filter(c => c.ano === ano) // Filtra apenas cenários do ano selecionado
      
      console.log('✅ Cenários formatados:', cenariosFormatados)
      setCenariosDisponiveis(cenariosFormatados)
      
      if (cenariosFormatados.length === 0) {
        toast({
          title: "Nenhum cenário para o ano selecionado",
          description: `Não há cenários cadastrados para ${ano}. Você pode criar cenários na página de Análise de Cenários.`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cenários:', error)
      toast({
        title: "Erro ao carregar cenários",
        description: error instanceof Error ? error.message : "Não foi possível carregar os cenários disponíveis",
        variant: "destructive"
      })
      setCenariosDisponiveis([]) // Define array vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }

  const carregarDadosManuais = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Buscar dados de Lucro Presumido
      const { data: dadosLP, error: errorLP } = await supabase
        .from('dados_comparativos_mensais')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('ano', ano)
        .eq('regime', 'lucro_presumido')
        .order('mes', { ascending: true })

      if (errorLP) throw errorLP

      // Buscar dados de Simples Nacional
      const { data: dadosSN, error: errorSN } = await supabase
        .from('dados_comparativos_mensais')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('ano', ano)
        .eq('regime', 'simples_nacional')
        .order('mes', { ascending: true })

      if (errorSN) throw errorSN

      // Transformar dados LP
      const dadosLPFormatados: DadoMensalDisponivel[] = (dadosLP || []).map(d => {
        const totalImpostos = Number(d.icms || 0) + Number(d.pis || 0) + Number(d.cofins || 0) + 
                             Number(d.irpj || 0) + Number(d.csll || 0) + Number(d.iss || 0) + 
                             Number(d.outros || 0)
        
        return {
          id: d.id,
          mes: d.mes,
          ano: d.ano,
          regime: d.regime as RegimeTributario,
          receita: Number(d.receita || 0),
          totalImpostos,
          selecionado: false
        }
      })

      // Transformar dados SN
      const dadosSNFormatados: DadoMensalDisponivel[] = (dadosSN || []).map(d => {
        const totalImpostos = Number(d.icms || 0) + Number(d.pis || 0) + Number(d.cofins || 0) + 
                             Number(d.irpj || 0) + Number(d.csll || 0) + Number(d.iss || 0) + 
                             Number(d.outros || 0)
        
        return {
          id: d.id,
          mes: d.mes,
          ano: d.ano,
          regime: d.regime as RegimeTributario,
          receita: Number(d.receita || 0),
          totalImpostos,
          selecionado: false
        }
      })

      setDadosLP(dadosLPFormatados)
      setDadosSN(dadosSNFormatados)
    } catch (error) {
      console.error('❌ Erro ao carregar dados manuais:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados manuais",
        variant: "destructive"
      })
      setDadosLP([])
      setDadosSN([])
    } finally {
      setLoading(false)
    }
  }

  const toggleMes = (mes: string) => {
    setMesesSelecionados(prev => 
      prev.includes(mes) 
        ? prev.filter(m => m !== mes)
        : [...prev, mes].sort()
    )
  }

  const toggleCenario = (cenarioId: string) => {
    setCenariosDisponiveis(prev =>
      prev.map(c => c.id === cenarioId ? { ...c, selecionado: !c.selecionado } : c)
    )
  }

  const toggleDadoLP = (dadoId: string) => {
    setDadosLP(prev =>
      prev.map(d => d.id === dadoId ? { ...d, selecionado: !d.selecionado } : d)
    )
  }

  const toggleDadoSN = (dadoId: string) => {
    setDadosSN(prev =>
      prev.map(d => d.id === dadoId ? { ...d, selecionado: !d.selecionado } : d)
    )
  }

  const selecionarTodosCenarios = () => {
    setCenariosDisponiveis(prev => prev.map(c => ({ ...c, selecionado: true })))
  }

  const selecionarTodosLP = () => {
    setDadosLP(prev => prev.map(d => ({ ...d, selecionado: true })))
  }

  const selecionarTodosSN = () => {
    setDadosSN(prev => prev.map(d => ({ ...d, selecionado: true })))
  }

  const validarEtapa1 = (): boolean => {
    // Validação: Nome obrigatório
    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o comparativo",
        variant: "destructive"
      })
      return false
    }

    // Validação: Nome com tamanho mínimo
    if (nome.trim().length < 3) {
      toast({
        title: "Nome muito curto",
        description: "O nome deve ter pelo menos 3 caracteres",
        variant: "destructive"
      })
      return false
    }

    // Validação: Nome com tamanho máximo
    if (nome.trim().length > 100) {
      toast({
        title: "Nome muito longo",
        description: "O nome deve ter no máximo 100 caracteres",
        variant: "destructive"
      })
      return false
    }

    // Validação: Período selecionado
    if (mesesSelecionados.length === 0) {
      toast({
        title: "Selecione pelo menos 1 mês",
        description: "É necessário selecionar ao menos um mês para análise",
        variant: "destructive"
      })
      return false
    }

    // Validação: Período máximo recomendado
    if (mesesSelecionados.length > 12) {
      toast({
        title: "Período muito longo",
        description: "Recomendamos análises de até 12 meses. Considere dividir em comparativos menores.",
        variant: "destructive"
      })
      return false
    }

    // Validação: Ano válido
    const anoAtual = new Date().getFullYear()
    if (ano < 2020 || ano > anoAtual + 2) {
      toast({
        title: "Ano inválido",
        description: `O ano deve estar entre 2020 e ${anoAtual + 2}`,
        variant: "destructive"
      })
      return false
    }

    // Alerta: Período futuro
    if (ano > anoAtual) {
      toast({
        title: "⚠️ Análise de período futuro",
        description: "Você está criando uma análise para um ano futuro. Certifique-se de ter projeções adequadas.",
      })
    }

    return true
  }

  const validarEtapa2 = (): boolean => {
    if (!incluirLucroReal) {
      // Se não incluir Lucro Real, OK
      return true
    }

    // Validação: Cenários disponíveis
    if (cenariosDisponiveis.length === 0) {
      toast({
        title: "Sem cenários disponíveis",
        description: "Não há cenários aprovados para o ano selecionado. Crie cenários primeiro.",
        variant: "destructive"
      })
      return false
    }

    // Validação: Seleção de cenários
    if (tipoCenarioLR === 'selecionados') {
      const cenariosSelecionados = cenariosDisponiveis.filter(c => c.selecionado)
      
      if (cenariosSelecionados.length === 0) {
        toast({
          title: "Selecione pelo menos 1 cenário",
          description: "É necessário selecionar ao menos um cenário de Lucro Real",
          variant: "destructive"
        })
        return false
      }

      // Validação: Quantidade máxima recomendada
      if (cenariosSelecionados.length > 5) {
        toast({
          title: "Muitos cenários selecionados",
          description: "Comparar mais de 5 cenários pode dificultar a análise. Considere reduzir a seleção.",
        })
      }

      // Validação: Cobertura de meses
      const mesesCobertos = new Set<number>()
      cenariosSelecionados.forEach(c => {
        c.meses.forEach(m => mesesCobertos.add(m))
      })

      const mesesSelecionadosNum = mesesSelecionados.map(m => parseInt(m))
      const faltamMeses = mesesSelecionadosNum.filter(m => !mesesCobertos.has(m))
      
      if (faltamMeses.length > 0) {
        const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        const mesesFaltantes = faltamMeses.map(m => nomesMeses[m - 1]).join(', ')
        
        toast({
          title: "⚠️ Cobertura incompleta",
          description: `Os cenários selecionados não cobrem os meses: ${mesesFaltantes}`,
        })
      }
    }

    return true
  }

  const validarEtapa3 = (): boolean => {
    const dadosLPSelecionados = dadosLP.filter(d => d.selecionado)
    const dadosSNSelecionados = dadosSN.filter(d => d.selecionado)

    // Contar regimes com dados
    const regimesComDados = [
      incluirLucroReal,
      incluirLP && dadosLPSelecionados.length > 0,
      incluirSN && dadosSNSelecionados.length > 0
    ].filter(Boolean).length

    // Validação: Mínimo 2 regimes
    if (regimesComDados < 2) {
      toast({
        title: "Selecione pelo menos 2 regimes",
        description: "Para comparação, é necessário ter dados de ao menos 2 regimes diferentes",
        variant: "destructive"
      })
      return false
    }

    // Validação: Quantidade mínima de dados por regime
    const regimesSelecionados: string[] = []
    if (incluirLP && dadosLPSelecionados.length > 0) {
      regimesSelecionados.push('Lucro Presumido')
      
      if (dadosLPSelecionados.length < mesesSelecionados.length / 2) {
        toast({
          title: "⚠️ Poucos dados de Lucro Presumido",
          description: `Você selecionou apenas ${dadosLPSelecionados.length} mês(es) de ${mesesSelecionados.length} possíveis. Isso pode afetar a qualidade da análise.`,
        })
      }
    }

    if (incluirSN && dadosSNSelecionados.length > 0) {
      regimesSelecionados.push('Simples Nacional')
      
      if (dadosSNSelecionados.length < mesesSelecionados.length / 2) {
        toast({
          title: "⚠️ Poucos dados de Simples Nacional",
          description: `Você selecionou apenas ${dadosSNSelecionados.length} mês(es) de ${mesesSelecionados.length} possíveis. Isso pode afetar a qualidade da análise.`,
        })
      }
    }

    // Validação: Sobreposição de meses
    const mesesLP = new Set(dadosLPSelecionados.map(d => d.mes))
    const mesesSN = new Set(dadosSNSelecionados.map(d => d.mes))
    
    if (incluirLP && incluirSN && dadosLPSelecionados.length > 0 && dadosSNSelecionados.length > 0) {
      const mesesComuns = [...mesesLP].filter(m => mesesSN.has(m))
      
      if (mesesComuns.length === 0) {
        toast({
          title: "⚠️ Sem meses em comum",
          description: "Os regimes selecionados não têm meses em comum. A comparação será limitada.",
        })
      }
    }

    // Validação: Qualidade dos dados
    const verificarQualidade = (dados: DadoMensalDisponivel[]) => {
      const semReceita = dados.filter(d => d.receita === 0).length
      const semImpostos = dados.filter(d => d.totalImpostos === 0).length
      
      return {
        semReceita,
        semImpostos,
        total: dados.length
      }
    }

    if (dadosLPSelecionados.length > 0) {
      const qualidadeLP = verificarQualidade(dadosLPSelecionados)
      if (qualidadeLP.semReceita > qualidadeLP.total / 2) {
        toast({
          title: "⚠️ Dados incompletos (LP)",
          description: `${qualidadeLP.semReceita} de ${qualidadeLP.total} meses sem receita informada`,
        })
      }
    }

    if (dadosSNSelecionados.length > 0) {
      const qualidadeSN = verificarQualidade(dadosSNSelecionados)
      if (qualidadeSN.semReceita > qualidadeSN.total / 2) {
        toast({
          title: "⚠️ Dados incompletos (SN)",
          description: `${qualidadeSN.semReceita} de ${qualidadeSN.total} meses sem receita informada`,
        })
      }
    }

    return true
  }

  const handleProximaEtapa = () => {
    if (etapa === 1 && !validarEtapa1()) return
    if (etapa === 2 && !validarEtapa2()) return
    if (etapa === 3 && !validarEtapa3()) return

    setEtapa((prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4)
  }

  const handleVoltarEtapa = () => {
    setEtapa((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4)
  }

  const handleCriar = async () => {
    setLoading(true)
    try {
      const config: ConfigComparativo = {
        empresaId,
        nome,
        descricao,
        tipo,
        mesesSelecionados,
        ano,
        lucroReal: {
          incluir: incluirLucroReal,
          cenarioIds: tipoCenarioLR === 'todos' 
            ? cenariosDisponiveis.map(c => c.id)
            : cenariosDisponiveis.filter(c => c.selecionado).map(c => c.id),
          tipo: tipoCenarioLR
        },
        dadosManuais: {
          lucroPresumido: {
            incluir: incluirLP,
            dadosIds: dadosLP.filter(d => d.selecionado).map(d => d.id)
          },
          simplesNacional: {
            incluir: incluirSN,
            dadosIds: dadosSN.filter(d => d.selecionado).map(d => d.id)
          }
        }
      }

      // Chamar serviço para criar comparativo no banco
      console.log('Criando comparativo:', config)

      const comparativoCompleto = await ComparativosAnaliseServiceCompleto.criarComparativo(config)
      
      if (!comparativoCompleto) {
        throw new Error('Erro ao criar comparativo - retorno nulo do serviço')
      }

      toast({
        title: "Comparativo criado com sucesso!",
        description: "Redirecionando para visualização...",
      })

      // Notificar criação
      notificarComparativoCriado(comparativoCompleto.nome, comparativoCompleto.id)
      
      // Notificar conclusão da análise com insights
      const insightPrincipal = (comparativoCompleto.resultados as any)?.analise?.insights?.principal
      if (insightPrincipal) {
        notificarAnaliseConcluida(comparativoCompleto.nome, comparativoCompleto.id, insightPrincipal)
      }

      // Chamar callback onConcluir se existir
      onConcluir?.(comparativoCompleto)
      
      onFechar?.()
      onSucesso?.(comparativoCompleto.id)
      
      // Redirecionar para página de detalhes
      router.push(`/empresas/${empresaId}/comparativos/${comparativoCompleto.id}`)

    } catch (error) {
      console.error('Erro ao criar comparativo:', error)
      toast({
        title: "Erro ao criar comparativo",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const obterNomeMes = (mes: string | number) => {
    const mesNum = typeof mes === 'string' ? parseInt(mes) : mes
    const mesObj = MESES_ANO.find((m, i) => i + 1 === mesNum)
    return mesObj?.label || mes.toString()
  }

  const gerarHeatmapCobertura = () => {
    const regimes: Array<{ label: string; cobertura: boolean[] }> = []

    // Lucro Real
    if (incluirLucroReal) {
      const cenariosSelecionados = tipoCenarioLR === 'todos' 
        ? cenariosDisponiveis 
        : cenariosDisponiveis.filter(c => c.selecionado)
      
      cenariosSelecionados.forEach(cenario => {
        regimes.push({
          label: cenario.nome,
          cobertura: mesesSelecionados.map(m => cenario.meses.includes(parseInt(m)))
        })
      })
    }

    // Lucro Presumido
    if (incluirLP) {
      const dadosSelecionadosLP = dadosLP.filter(d => d.selecionado)
      if (dadosSelecionadosLP.length > 0) {
        regimes.push({
          label: 'Lucro Presumido',
          cobertura: mesesSelecionados.map(m => 
            dadosSelecionadosLP.some(d => d.mes === m)
          )
        })
      }
    }

    // Simples Nacional
    if (incluirSN) {
      const dadosSelecionadosSN = dadosSN.filter(d => d.selecionado)
      if (dadosSelecionadosSN.length > 0) {
        regimes.push({
          label: 'Simples Nacional',
          cobertura: mesesSelecionados.map(m => 
            dadosSelecionadosSN.some(d => d.mes === m)
          )
        })
      }
    }

    return { meses: mesesSelecionados, regimes }
  }

  // Não renderizar se modal estiver explicitamente fechado
  // Mas permitir renderização se aberto for undefined (primeira renderização)
  if (aberto === false) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Criar Análise Comparativa</h2>
        <p className="text-muted-foreground">
          Configure sua análise comparativa de regimes tributários em 4 etapas
        </p>
      </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Etapa {etapa} de 4</span>
            <span>{progresso.toFixed(0)}%</span>
          </div>
          <Progress value={progresso} />
          
          {/* Steps indicator */}
          <div className="flex justify-between pt-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step < etapa ? 'bg-primary text-primary-foreground' :
                  step === etapa ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step < etapa ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                <span className="text-xs text-muted-foreground">
                  {step === 1 && 'Config'}
                  {step === 2 && 'Cenários'}
                  {step === 3 && 'Dados'}
                  {step === 4 && 'Preview'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Etapa 1: Configuração Básica */}
        {etapa === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Comparativo *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Análise Fiscal Q1 2025"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o objetivo desta análise..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Comparativo</Label>
                  <Select value={tipo} onValueChange={(value) => setTipo(value as TipoComparativo)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposComparativo.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div>
                            <div className="font-medium">{t.label}</div>
                            <div className="text-xs text-muted-foreground">{t.descricao}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ano de Referência</Label>
                  <Select value={ano.toString()} onValueChange={(value) => setAno(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {anosDisponiveis.map((a) => (
                        <SelectItem key={a} value={a.toString()}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Período de Análise *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {MESES_ANO.map((mes, index) => {
                    const mesValue = (index + 1).toString().padStart(2, '0')
                    const isSelecionado = mesesSelecionados.includes(mesValue)
                    
                    return (
                      <Button
                        key={mes.value}
                        type="button"
                        variant={isSelecionado ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleMes(mesValue)}
                        className="justify-start"
                      >
                        <Calendar className="mr-2 h-3 w-3" />
                        {mes.label}
                      </Button>
                    )
                  })}
                </div>
                {mesesSelecionados.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {mesesSelecionados.length} {mesesSelecionados.length === 1 ? 'mês selecionado' : 'meses selecionados'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Etapa 2: Cenários de Lucro Real */}
        {etapa === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="incluir-lr"
                  checked={incluirLucroReal}
                  onCheckedChange={(checked) => setIncluirLucroReal(checked as boolean)}
                />
                <Label htmlFor="incluir-lr" className="font-semibold">
                  Incluir Cenários de Lucro Real
                </Label>
              </div>
              {incluirLucroReal && (
                <Select value={tipoCenarioLR} onValueChange={(value) => setTipoCenarioLR(value as 'todos' | 'selecionados')}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cenários</SelectItem>
                    <SelectItem value="selecionados">Cenários selecionados</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {incluirLucroReal && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : cenariosDisponiveis.length > 0 ? (
                  <>
                    {tipoCenarioLR === 'selecionados' && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selecionarTodosCenarios}
                        >
                          Selecionar Todos
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {cenariosDisponiveis.map((cenario) => (
                        <Card
                          key={cenario.id}
                          className={`cursor-pointer transition-colors ${
                            tipoCenarioLR === 'todos' || cenario.selecionado
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => tipoCenarioLR === 'selecionados' && toggleCenario(cenario.id)}
                        >
                          <CardContent className="flex items-center gap-4 p-4">
                            {tipoCenarioLR === 'selecionados' && (
                              <Checkbox
                                checked={cenario.selecionado}
                                onCheckedChange={() => toggleCenario(cenario.id)}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{cenario.nome}</h4>
                                <Badge variant={
                                  cenario.tipo === 'conservador' ? 'secondary' :
                                  cenario.tipo === 'moderado' ? 'default' :
                                  'outline'
                                }>
                                  {cenario.tipo}
                                </Badge>
                              </div>
                              <div className="flex gap-6 text-sm text-muted-foreground">
                                <span>{cenario.meses.length} meses</span>
                                <span>Receita: {formatarMoeda(cenario.receitaTotal)}</span>
                              </div>
                            </div>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Info className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum cenário aprovado encontrado para {ano}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Etapa 3: Dados Manuais */}
        {etapa === 3 && (
          <div className="space-y-6">
            {/* Lucro Presumido */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="incluir-lp"
                    checked={incluirLP}
                    onCheckedChange={(checked) => setIncluirLP(checked as boolean)}
                  />
                  <Label htmlFor="incluir-lp" className="font-semibold">
                    Lucro Presumido
                  </Label>
                </div>
                {incluirLP && dadosLP.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selecionarTodosLP}
                  >
                    Selecionar Todos
                  </Button>
                )}
              </div>

              {incluirLP && (
                <>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : dadosLP.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {dadosLP.map((dado) => (
                        <Card
                          key={dado.id}
                          className={`cursor-pointer transition-colors ${
                            dado.selecionado
                              ? 'border-green-500 bg-green-50 dark:bg-green-950'
                              : 'hover:border-green-300'
                          }`}
                          onClick={() => toggleDadoLP(dado.id)}
                        >
                          <CardContent className="flex items-center gap-3 p-3">
                            <Checkbox
                              checked={dado.selecionado}
                              onCheckedChange={() => toggleDadoLP(dado.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{obterNomeMes(dado.mes)}/{dado.ano}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatarMoeda(dado.receita)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum dado de Lucro Presumido disponível
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Simples Nacional */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="incluir-sn"
                    checked={incluirSN}
                    onCheckedChange={(checked) => setIncluirSN(checked as boolean)}
                  />
                  <Label htmlFor="incluir-sn" className="font-semibold">
                    Simples Nacional
                  </Label>
                </div>
                {incluirSN && dadosSN.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selecionarTodosSN}
                  >
                    Selecionar Todos
                  </Button>
                )}
              </div>

              {incluirSN && (
                <>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : dadosSN.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {dadosSN.map((dado) => (
                        <Card
                          key={dado.id}
                          className={`cursor-pointer transition-colors ${
                            dado.selecionado
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                              : 'hover:border-orange-300'
                          }`}
                          onClick={() => toggleDadoSN(dado.id)}
                        >
                          <CardContent className="flex items-center gap-3 p-3">
                            <Checkbox
                              checked={dado.selecionado}
                              onCheckedChange={() => toggleDadoSN(dado.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{obterNomeMes(dado.mes)}/{dado.ano}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatarMoeda(dado.receita)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum dado de Simples Nacional disponível
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Etapa 4: Preview e Confirmação */}
        {etapa === 4 && (
          <div className="space-y-6">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Configuração</CardTitle>
                <CardDescription>Revise as informações antes de criar o comparativo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{nome}</p>
                </div>
                {descricao && (
                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <p className="text-sm">{descricao}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p className="font-medium">
                      {tiposComparativo.find(t => t.value === tipo)?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ano</Label>
                    <p className="font-medium">{ano}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Período</Label>
                  <p className="font-medium">
                    {mesesSelecionados.map(m => obterNomeMes(m)).join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Heatmap de Cobertura */}
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Cobertura de Dados</CardTitle>
                <CardDescription>Visualize a disponibilidade de dados por regime e mês</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const heatmap = gerarHeatmapCobertura()
                  
                  return (
                    <div className="space-y-2">
                      {/* Header com meses */}
                      <div className="flex gap-2">
                        <div className="w-48" /> {/* Espaço para labels */}
                        {heatmap.meses.map(mes => (
                          <div key={mes} className="flex-1 text-center text-xs font-medium">
                            {obterNomeMes(mes)}
                          </div>
                        ))}
                      </div>

                      {/* Linhas por regime */}
                      {heatmap.regimes.map((regime, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <div className="w-48 text-sm font-medium truncate" title={regime.label}>
                            {regime.label}
                          </div>
                          {regime.cobertura.map((temDados, mesIdx) => (
                            <div
                              key={mesIdx}
                              className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                                temDados
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                              }`}
                            >
                              {temDados ? '✓' : '○'}
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Legenda */}
                      <div className="flex gap-4 pt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-500" />
                          <span>Dados disponíveis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                          <span>Sem dados</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {[
                      incluirLucroReal ? (tipoCenarioLR === 'todos' ? cenariosDisponiveis.length : cenariosDisponiveis.filter(c => c.selecionado).length) : 0,
                      incluirLP && dadosLP.some(d => d.selecionado) ? 1 : 0,
                      incluirSN && dadosSN.some(d => d.selecionado) ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Regimes a Comparar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{mesesSelecionados.length}</div>
                  <p className="text-sm text-muted-foreground">
                    Meses Selecionados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {(() => {
                      const heatmap = gerarHeatmapCobertura()
                      const totalCelulas = heatmap.regimes.length * heatmap.meses.length
                      const celulasComDados = heatmap.regimes.reduce(
                        (sum, r) => sum + r.cobertura.filter(Boolean).length,
                        0
                      )
                      return totalCelulas > 0 
                        ? Math.round((celulasComDados / totalCelulas) * 100)
                        : 0
                    })()}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cobertura de Dados
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Footer com botões */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={etapa === 1 ? onFechar : handleVoltarEtapa}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {etapa === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          <Button
            type="button"
            onClick={etapa === 4 ? handleCriar : handleProximaEtapa}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : etapa === 4 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Criar Comparativo
              </>
            ) : (
              <>
                Próxima
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
    </div>
  )
}
