"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import { CurrencyInput } from "@/components/common/currency-input"
import type { FormularioDadosComparativos, RegimeTributario, DadosComparativoMensal } from "@/types/comparativo"
import { MESES_ANO, REGIMES_TRIBUTARIOS } from "@/types/comparativo"
import { Plus, Save, CheckCircle, Edit, X, TrendingUp, TrendingDown } from "lucide-react"

interface FormularioComparativosProps {
  empresaId: string
  onSucesso?: () => void
  onCancelar?: () => void
  dadosIniciais?: DadosComparativoMensal | null
  modoEdicao?: boolean
}

export function FormularioComparativos({ 
  empresaId, 
  onSucesso, 
  onCancelar,
  dadosIniciais, 
  modoEdicao = false 
}: FormularioComparativosProps) {
  const { toast } = useToast()
  const { adicionarDadoComparativo, atualizarDadoComparativo } = useRegimesTributariosStore()

  const [formulario, setFormulario] = useState<FormularioDadosComparativos>({
    mes: '',
    ano: new Date().getFullYear(),
    regime: 'lucro_presumido',
    receita: '0',
    icms: '0',
    pis: '0',
    cofins: '0',
    irpj: '0',
    csll: '0',
    iss: '0',
    outros: '0',
    observacoes: '',
  })

  const [salvando, setSalvando] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Preencher formulário quando em modo edição
  useEffect(() => {
    console.log('📝 useEffect disparado - modoEdicao:', modoEdicao, 'dadosIniciais:', dadosIniciais)
    
    if (modoEdicao && dadosIniciais) {
      const novoFormulario = {
        mes: dadosIniciais.mes || '',
        ano: dadosIniciais.ano || new Date().getFullYear(),
        regime: dadosIniciais.regime || 'lucro_presumido',
        receita: (dadosIniciais.receita || 0).toString(),
        icms: (dadosIniciais.icms || 0).toString(),
        pis: (dadosIniciais.pis || 0).toString(),
        cofins: (dadosIniciais.cofins || 0).toString(),
        irpj: (dadosIniciais.irpj || 0).toString(),
        csll: (dadosIniciais.csll || 0).toString(),
        iss: (dadosIniciais.iss || 0).toString(),
        outros: (dadosIniciais.outros || 0).toString(),
        observacoes: dadosIniciais.observacoes || '',
      }
      
      console.log('📝 Novo formulário preenchido:', novoFormulario)
      setFormulario(novoFormulario)
    }
  }, [modoEdicao, dadosIniciais])

  const handleInputChange = (campo: keyof FormularioDadosComparativos, valor: string | number) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const handleMoedaChange = (campo: keyof FormularioDadosComparativos) => (valor: number) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor.toString()
    }))
  }
  
  // Helper para calcular diferenças entre valores originais e atuais (modo edição)
  const calcularDiferenca = useMemo(() => {
    if (!modoEdicao || !dadosIniciais) return {}
    
    const diferencas: Record<string, { original: number; atual: number; diferenca: number; percentual: number }> = {}
    const camposMonetarios = ['receita', 'icms', 'pis', 'cofins', 'irpj', 'csll', 'iss', 'outros']
    
    camposMonetarios.forEach(campo => {
      const original = (dadosIniciais as any)[campo] || 0
      const atual = parseFloat((formulario as any)[campo] || '0')
      const diferenca = atual - original
      const percentual = original !== 0 ? ((diferenca / original) * 100) : 0
      
      if (Math.abs(diferenca) > 0.01) { // Diferença maior que 1 centavo
        diferencas[campo] = { original, atual, diferenca, percentual }
      }
    })
    
    return diferencas
  }, [modoEdicao, dadosIniciais, formulario])

  // Helper component usando CurrencyInput
  const MoedaInputComDiff = ({ 
    campo, 
    label, 
    obrigatorio = false 
  }: { 
    campo: keyof FormularioDadosComparativos
    label: string
    obrigatorio?: boolean
  }) => {
    const diff = calcularDiferenca[campo]
    const valor = parseFloat((formulario as any)[campo] || '0')
    
    return (
      <div className="space-y-2">
        {diff && (
          <div className="flex items-center justify-end mb-1">
            <Badge 
              variant={diff.diferenca > 0 ? "default" : "destructive"}
              className="text-xs gap-1"
            >
              {diff.diferenca > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {diff.diferenca > 0 ? '+' : ''}{diff.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-[10px]">({diff.percentual > 0 ? '+' : ''}{diff.percentual.toFixed(1)}%)</span>
            </Badge>
          </div>
        )}
        <CurrencyInput
          label={label}
          value={valor}
          onChange={handleMoedaChange(campo)}
          required={obrigatorio}
        />
        {diff && (
          <p className="text-xs text-muted-foreground">
            Anterior: R$ {diff.original.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>
    )
  }

  const validarFormulario = (): boolean => {
    console.log('🔍 Validando formulário:', formulario)
    
    if (!formulario.mes) {
      console.log('❌ Validação falhou: mês não preenchido')
      toast({
        title: "Mês obrigatório",
        description: "Selecione o mês para os dados comparativos.",
        variant: "destructive",
      })
      return false
    }

    const receitaNumero = parseFloat(formulario.receita || '0')
    
    if (!formulario.receita || receitaNumero <= 0) {
      console.log('❌ Validação falhou: receita inválida')
      toast({
        title: "Receita obrigatória",
        description: "Informe um valor de receita válido e maior que zero.",
        variant: "destructive",
      })
      return false
    }
    
    // VALIDAÇÃO: Receita realista (< R$ 1 trilhão)
    if (receitaNumero > 1_000_000_000_000) {
      console.log('❌ Validação falhou: receita muito alta')
      toast({
        title: "Receita inválida",
        description: `Receita de R$ ${(receitaNumero / 1_000_000_000).toFixed(2)} bilhões parece irreal. Verifique o valor.`,
        variant: "destructive",
      })
      return false
    }
    
    // VALIDAÇÃO: Total de impostos não pode exceder receita
    const totalImpostos = 
      parseFloat(formulario.icms || '0') +
      parseFloat(formulario.pis || '0') +
      parseFloat(formulario.cofins || '0') +
      parseFloat(formulario.irpj || '0') +
      parseFloat(formulario.csll || '0') +
      parseFloat(formulario.iss || '0') +
      parseFloat(formulario.outros || '0')
    
    if (totalImpostos > receitaNumero) {
      const cargaTributaria = ((totalImpostos / receitaNumero) * 100).toFixed(2)
      console.log('❌ Validação falhou: impostos > receita')
      toast({
        title: "Impostos excedem receita",
        description: `Total de impostos (R$ ${totalImpostos.toLocaleString('pt-BR')}) excede a receita (R$ ${receitaNumero.toLocaleString('pt-BR')}). Carga tributária: ${cargaTributaria}%`,
        variant: "destructive",
      })
      return false
    }
    
    // ALERTA: Carga tributária muito alta (> 80%)
    const cargaTributaria = (totalImpostos / receitaNumero) * 100
    if (cargaTributaria > 80) {
      console.warn(`⚠️ Carga tributária alta: ${cargaTributaria.toFixed(2)}%`)
    }

    console.log('✅ Formulário válido')
    return true
  }

  const handleSubmit = async (e: React.FormEvent, sairAposSalvar = false) => {
    e.preventDefault()
    
    console.log('🚀 HandleSubmit chamado:', { sairAposSalvar, modoEdicao })

    if (!validarFormulario()) {
      console.log('❌ Validação falhou')
      return
    }

    console.log('✅ Validação passou, iniciando salvamento...')
    setSalvando(true)

    try {
      // VERIFICAÇÃO DE DUPLICATA CLIENT-SIDE (só para novos registros)
      if (!modoEdicao) {
        const { dadosComparativos } = useRegimesTributariosStore.getState()
        const duplicado = dadosComparativos.find(
          (dado) =>
            dado.empresaId === empresaId &&
            dado.mes === formulario.mes &&
            dado.ano === formulario.ano &&
            dado.regime === formulario.regime
        )
        
        if (duplicado) {
          const nomesMeses: Record<string, string> = {
            'jan': 'Janeiro', 'fev': 'Fevereiro', 'mar': 'Março',
            'abr': 'Abril', 'mai': 'Maio', 'jun': 'Junho',
            'jul': 'Julho', 'ago': 'Agosto', 'set': 'Setembro',
            'out': 'Outubro', 'nov': 'Novembro', 'dez': 'Dezembro'
          }
          
          const nomesRegimes: Record<string, string> = {
            'lucro_real': 'Lucro Real',
            'lucro_presumido': 'Lucro Presumido',
            'simples_nacional': 'Simples Nacional'
          }

          const mesNome = nomesMeses[formulario.mes] || formulario.mes
          const regimeNome = nomesRegimes[formulario.regime] || formulario.regime
          
          toast({
            title: "Registro duplicado",
            description: `Já existe um registro de ${regimeNome} para ${mesNome}/${formulario.ano}. Use a função de editar.`,
            variant: "destructive",
          })
          
          setSalvando(false)
          return
        }
      }
      
      const dadosParaSalvar = {
        empresaId,
        mes: formulario.mes,
        ano: formulario.ano,
        regime: formulario.regime,
        receita: parseFloat(formulario.receita || '0'),
        icms: parseFloat(formulario.icms || '0'),
        pis: parseFloat(formulario.pis || '0'),
        cofins: parseFloat(formulario.cofins || '0'),
        irpj: parseFloat(formulario.irpj || '0'),
        csll: parseFloat(formulario.csll || '0'),
        iss: parseFloat(formulario.iss || '0'),
        outros: parseFloat(formulario.outros || '0'),
        observacoes: formulario.observacoes || undefined,
      }

      if (modoEdicao && dadosIniciais?.id) {
        console.log('🔄 [FORMULARIO] Modo EDIÇÃO detectado!')
        console.log('🔄 [FORMULARIO] ID do registro:', dadosIniciais.id)
        console.log('🔄 [FORMULARIO] dadosParaSalvar:', dadosParaSalvar)
        console.log('🔄 [FORMULARIO] Chamando atualizarDadoComparativo...')
        
        await atualizarDadoComparativo(dadosIniciais.id, dadosParaSalvar)
        
        console.log('✅ [FORMULARIO] atualizarDadoComparativo retornou com sucesso')
        
        toast({
          title: "Dados atualizados com sucesso",
          description: `Dados de ${REGIMES_TRIBUTARIOS.find(r => r.value === formulario.regime)?.label} para ${MESES_ANO.find(m => m.value === formulario.mes)?.label} foram atualizados.`,
        })
      } else {
        console.log('➕ [FORMULARIO] Modo INSERÇÃO detectado!')
        console.log('➕ [FORMULARIO] dadosParaSalvar:', dadosParaSalvar)
        console.log('➕ [FORMULARIO] Chamando adicionarDadoComparativo...')
        
        await adicionarDadoComparativo(dadosParaSalvar)
        
        toast({
          title: "Dados salvos com sucesso",
          description: `Dados de ${REGIMES_TRIBUTARIOS.find(r => r.value === formulario.regime)?.label} para ${MESES_ANO.find(m => m.value === formulario.mes)?.label} foram salvos.`,
        })
      }

      // Limpar formulário apenas se não estiver editando
      if (!modoEdicao) {
        setFormulario({
          mes: '',
          ano: formulario.ano,
          regime: 'lucro_presumido',
          receita: '0',
          icms: '0',
          pis: '0',
          cofins: '0',
          irpj: '0',
          csll: '0',
          iss: '0',
          outros: '0',
          observacoes: '',
        })
      }

      if (sairAposSalvar) {
        console.log('🚪 Saindo após salvar...')
        onSucesso?.()
      } else {
        console.log('📝 Permanecendo no formulário...')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error)
      toast({
        title: "Erro ao salvar",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      })
    } finally {
      console.log('✅ Finalizando operação de salvamento')
      setSalvando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {modoEdicao ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {modoEdicao ? 'Editar Dados Comparativos' : 'Adicionar Dados Comparativos'}
        </CardTitle>
        <CardDescription>
          {modoEdicao 
            ? 'Edite os dados mensais de impostos para Lucro Presumido ou Simples Nacional'
            : 'Insira os dados mensais de impostos para Lucro Presumido ou Simples Nacional'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Seleções principais */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="regime">Regime Tributário</Label>
              <Select
                value={formulario.regime}
                onValueChange={(value: RegimeTributario) => handleInputChange('regime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent>
                  {REGIMES_TRIBUTARIOS.filter(r => r.value !== 'lucro_real').map((regime) => (
                    <SelectItem key={regime.value} value={regime.value}>
                      {regime.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mes">Mês</Label>
              <Select
                value={formulario.mes}
                onValueChange={(value) => handleInputChange('mes', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {MESES_ANO.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                value={formulario.ano}
                onChange={(e) => handleInputChange('ano', parseInt(e.target.value) || new Date().getFullYear())}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          {/* Receita */}
          <MoedaInputComDiff
            campo="receita"
            label="Receita Bruta"
            obrigatorio={true}
          />

          {/* Impostos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">
                {formulario.regime === 'simples_nacional' ? 'DAS - Simples Nacional' : 'Impostos e Contribuições'}
              </h4>
              {formulario.regime === 'simples_nacional' && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Todos os impostos incluídos no DAS
                </span>
              )}
            </div>
            
            {formulario.regime === 'simples_nacional' ? (
              <MoedaInputComDiff
                campo="outros"
                label="Valor do DAS"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MoedaInputComDiff campo="icms" label="ICMS" />
                <MoedaInputComDiff campo="pis" label="PIS" />
                <MoedaInputComDiff campo="cofins" label="COFINS" />
                <MoedaInputComDiff campo="irpj" label="IRPJ" />
                <MoedaInputComDiff campo="csll" label="CSLL" />
                <MoedaInputComDiff campo="iss" label="ISS" />
              </div>
            )}
          </div>

          {/* Outros impostos e observações */}
          {formulario.regime !== 'simples_nacional' && (
            <div className="grid gap-4 md:grid-cols-2">
              <MoedaInputComDiff campo="outros" label="Outros Impostos" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre os dados..."
              value={formulario.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Botões de submissão */}
          <div className="flex gap-3">
            {modoEdicao && onCancelar && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancelar}
                disabled={salvando}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={salvando} 
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {salvando ? 'Salvando...' : (modoEdicao ? 'Atualizar Dados' : 'Salvar Dados')}
            </Button>
            
            <Button 
              type="button"
              disabled={salvando}
              variant="outline"
              className="flex-1"
              onClick={(e) => handleSubmit(e as any, true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {salvando ? 'Salvando...' : (modoEdicao ? 'Atualizar e Sair' : 'Salvar e Sair')}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground text-center">
            <p>
              <strong>{modoEdicao ? 'Atualizar Dados:' : 'Salvar Dados:'}</strong> {modoEdicao ? 'Atualiza e mantém o formulário aberto' : 'Salva e mantém o formulário para adicionar mais dados'}
            </p>
            <p>
              <strong>{modoEdicao ? 'Atualizar e Sair:' : 'Salvar e Sair:'}</strong> {modoEdicao ? 'Atualiza e vai para a listagem dos dados' : 'Salva e vai para a visualização dos dados'}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}