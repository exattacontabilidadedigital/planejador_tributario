"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { useRegimesTributariosStore } from "@/stores/regimes-tributarios-store"
import type { FormularioDadosComparativos, RegimeTributario, DadosComparativoMensal } from "@/types/comparativo"
import { MESES_ANO, REGIMES_TRIBUTARIOS } from "@/types/comparativo"
import { Plus, Save, CheckCircle, Edit, X } from "lucide-react"

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
    receita: '',
    icms: '',
    pis: '',
    cofins: '',
    irpj: '',
    csll: '',
    iss: '',
    outros: '',
    observacoes: '',
  })

  const [salvando, setSalvando] = useState(false)

  // Preencher formulário quando em modo edição
  useEffect(() => {
    console.log('📝 useEffect disparado - modoEdicao:', modoEdicao, 'dadosIniciais:', dadosIniciais)
    
    if (modoEdicao && dadosIniciais) {
      const formatarValorMoeda = (valor: number | undefined | null): string => {
        const valorSeguro = typeof valor === 'number' ? valor : 0
        return valorSeguro.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }

      const novoFormulario = {
        mes: dadosIniciais.mes || '',
        ano: dadosIniciais.ano || new Date().getFullYear(),
        regime: dadosIniciais.regime || 'lucro_presumido',
        receita: formatarValorMoeda(dadosIniciais.receita),
        icms: formatarValorMoeda(dadosIniciais.icms),
        pis: formatarValorMoeda(dadosIniciais.pis),
        cofins: formatarValorMoeda(dadosIniciais.cofins),
        irpj: formatarValorMoeda(dadosIniciais.irpj),
        csll: formatarValorMoeda(dadosIniciais.csll),
        iss: formatarValorMoeda(dadosIniciais.iss),
        outros: formatarValorMoeda(dadosIniciais.outros),
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

  const formatarMoeda = (valor: string): string => {
    if (!valor || valor.trim() === '') return '0,00'
    const apenasNumeros = valor.replace(/\D/g, '')
    if (!apenasNumeros) return '0,00'
    const numero = parseInt(apenasNumeros) / 100
    
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleMoedaChange = (campo: keyof FormularioDadosComparativos, valor: string) => {
    const valorFormatado = formatarMoeda(valor)
    handleInputChange(campo, valorFormatado)
  }

  const converterMoedaParaNumero = (valorFormatado: string): number => {
    if (!valorFormatado || valorFormatado.trim() === '') return 0
    return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.')) || 0
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

    const receitaNumero = converterMoedaParaNumero(formulario.receita)
    
    if (!formulario.receita || receitaNumero <= 0) {
      console.log('❌ Validação falhou: receita inválida')
      toast({
        title: "Receita obrigatória",
        description: "Informe um valor de receita válido e maior que zero.",
        variant: "destructive",
      })
      return false
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
      const dadosParaSalvar = {
        empresaId,
        mes: formulario.mes,
        ano: formulario.ano,
        regime: formulario.regime,
        receita: converterMoedaParaNumero(formulario.receita),
        icms: converterMoedaParaNumero(formulario.icms),
        pis: converterMoedaParaNumero(formulario.pis),
        cofins: converterMoedaParaNumero(formulario.cofins),
        irpj: converterMoedaParaNumero(formulario.irpj),
        csll: converterMoedaParaNumero(formulario.csll),
        iss: converterMoedaParaNumero(formulario.iss),
        outros: converterMoedaParaNumero(formulario.outros),
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
          receita: '',
          icms: '',
          pis: '',
          cofins: '',
          irpj: '',
          csll: '',
          iss: '',
          outros: '',
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
          <div className="space-y-2">
            <Label htmlFor="receita">Receita Bruta *</Label>
            <Input
              id="receita"
              placeholder="0,00"
              value={formulario.receita}
              onChange={(e) => handleMoedaChange('receita', e.target.value)}
              className="text-right"
            />
          </div>

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
              <div className="space-y-2">
                <Label htmlFor="das">Valor do DAS</Label>
                <Input
                  id="das"
                  placeholder="0,00"
                  value={formulario.outros}
                  onChange={(e) => handleMoedaChange('outros', e.target.value)}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground">
                  Valor total do DAS que inclui: IRPJ, CSLL, PIS, COFINS, IPI, ICMS, ISS, CPP
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="icms">ICMS</Label>
                  <Input
                    id="icms"
                    placeholder="0,00"
                    value={formulario.icms}
                    onChange={(e) => handleMoedaChange('icms', e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pis">PIS</Label>
                  <Input
                    id="pis"
                    placeholder="0,00"
                    value={formulario.pis}
                    onChange={(e) => handleMoedaChange('pis', e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cofins">COFINS</Label>
                  <Input
                    id="cofins"
                    placeholder="0,00"
                    value={formulario.cofins}
                    onChange={(e) => handleMoedaChange('cofins', e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="irpj">IRPJ</Label>
                  <Input
                    id="irpj"
                    placeholder="0,00"
                    value={formulario.irpj}
                    onChange={(e) => handleMoedaChange('irpj', e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csll">CSLL</Label>
                  <Input
                    id="csll"
                    placeholder="0,00"
                    value={formulario.csll}
                    onChange={(e) => handleMoedaChange('csll', e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iss">ISS</Label>
                  <Input
                    id="iss"
                    placeholder="0,00"
                    value={formulario.iss}
                    onChange={(e) => handleMoedaChange('iss', e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Outros impostos e observações */}
          {formulario.regime !== 'simples_nacional' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="outros">Outros Impostos</Label>
                <Input
                  id="outros"
                  placeholder="0,00"
                  value={formulario.outros}
                  onChange={(e) => handleMoedaChange('outros', e.target.value)}
                  className="text-right"
                />
              </div>
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