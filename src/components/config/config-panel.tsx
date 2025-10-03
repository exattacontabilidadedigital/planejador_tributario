"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrencyInput } from "@/components/common/currency-input"
import { PercentageInput } from "@/components/common/percentage-input"
import { useTaxStore } from "@/hooks/use-tax-store"
import { RotateCcw, Save, Building2, DollarSign, Receipt, FileText, TrendingUp } from "lucide-react"
import { SaveScenarioDialog } from "@/components/scenarios/save-scenario-dialog"
import { DespesasManager } from "@/components/config/despesas-manager"
import type { DespesaItem } from "@/types"

export function ConfigPanel() {
  const { config, updateConfig, resetConfig } = useTaxStore()

  const handleReset = () => {
    if (confirm("Deseja realmente resetar todas as configurações para os valores padrão?")) {
      resetConfig()
    }
  }

  // Gerenciamento de despesas dinâmicas
  const despesas = config.despesasDinamicas || []

  const handleAddDespesa = (despesa: Omit<DespesaItem, "id">) => {
    const novaDespesa: DespesaItem = {
      ...despesa,
      id: `despesa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    updateConfig({
      despesasDinamicas: [...despesas, novaDespesa],
    })
  }

  const handleBulkAddDespesa = (novasDespesas: Omit<DespesaItem, "id">[]) => {
    const baseTimestamp = Date.now()
    const despesasComId: DespesaItem[] = novasDespesas.map((despesa, index) => ({
      ...despesa,
      id: `despesa-${baseTimestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    }))
    
    updateConfig({
      despesasDinamicas: [...despesas, ...despesasComId],
    })
  }

  const handleEditDespesa = (id: string, updates: Partial<DespesaItem>) => {
    updateConfig({
      despesasDinamicas: despesas.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })
  }

  const handleDeleteDespesa = (id: string) => {
    updateConfig({
      despesasDinamicas: despesas.filter((d) => d.id !== id),
    })
  }

  const handleClearDuplicates = () => {
    // Remove despesas com caracteres corrompidos E duplicatas
    const seen = new Map<string, DespesaItem>()
    const despesasLimpas: DespesaItem[] = []
    
    despesas.forEach((despesa) => {
      // Ignora se tem caracteres corrompidos
      if (despesa.descricao.includes('�')) {
        return
      }
      
      // Chave única: descrição + valor
      const key = `${despesa.descricao.toLowerCase()}-${despesa.valor}`
      
      // Se já existe, mantém a mais recente (ID maior)
      const existing = seen.get(key)
      if (!existing || despesa.id > existing.id) {
        seen.set(key, despesa)
      }
    })
    
    // Converte Map para Array
    seen.forEach((despesa) => despesasLimpas.push(despesa))
    
    updateConfig({
      despesasDinamicas: despesasLimpas,
    })
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
          <SaveScenarioDialog />
        </div>
        <div className="text-sm text-muted-foreground">
          💾 Salvamento automático ativado
        </div>
      </div>

      {/* Tabs de Configuração por Imposto */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="icms" className="gap-2">
            <Building2 className="h-4 w-4" />
            ICMS
          </TabsTrigger>
          <TabsTrigger value="pis-cofins" className="gap-2">
            <Receipt className="h-4 w-4" />
            PIS/COFINS
          </TabsTrigger>
          <TabsTrigger value="irpj-csll" className="gap-2">
            <FileText className="h-4 w-4" />
            IRPJ/CSLL
          </TabsTrigger>
          <TabsTrigger value="iss" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            ISS
          </TabsTrigger>
        </TabsList>

        {/* TAB: GERAL - Receitas e Distribuição */}
        <TabsContent value="geral" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Receita Bruta */}
            <Card className="border-l-4 border-l-lucro">
              <CardHeader>
                <CardTitle className="text-lg">💰 Receita Bruta</CardTitle>
                <CardDescription>Faturamento mensal da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CurrencyInput
                  label="Receita Bruta Mensal"
                  value={config.receitaBruta}
                  onChange={(value) => updateConfig({ receitaBruta: value })}
                  required
                />
              </CardContent>
            </Card>

            {/* Distribuição de Vendas */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-lg">📊 Distribuição de Vendas</CardTitle>
                <CardDescription>Proporção de vendas por localização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PercentageInput
                  label="% Vendas Internas (Mesmo Estado)"
                  value={config.vendasInternas}
                  onChange={(value) => updateConfig({ vendasInternas: value })}
                  showSlider
                />
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">% Vendas Interestaduais</p>
                  <p className="text-2xl font-bold text-primary">{config.vendasInterestaduais.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente (100 - Internas)</p>
                </div>
                <PercentageInput
                  label="% Vendas para Consumidor Final"
                  value={config.consumidorFinal}
                  onChange={(value) => updateConfig({ consumidorFinal: value })}
                  showSlider
                  max={50}
                />
              </CardContent>
            </Card>

            {/* Compras para ICMS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🛒 Compras (Base ICMS)</CardTitle>
                <CardDescription>Compras que geram crédito de ICMS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CurrencyInput
                  label="Compras Internas (Mesmo Estado)"
                  value={config.comprasInternas}
                  onChange={(value) => updateConfig({ comprasInternas: value })}
                />
                <CurrencyInput
                  label="Compras Interestaduais (Outros Estados)"
                  value={config.comprasInterestaduais}
                  onChange={(value) => updateConfig({ comprasInterestaduais: value })}
                />
                <CurrencyInput
                  label="Compras para Uso/Consumo"
                  value={config.comprasUso}
                  onChange={(value) => updateConfig({ comprasUso: value })}
                />
              </CardContent>
            </Card>

            {/* CMV - Custo da Mercadoria Vendida */}
            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="text-lg">📦 CMV - Custo da Mercadoria Vendida</CardTitle>
                <CardDescription>Base de cálculo para PIS/COFINS não cumulativo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CurrencyInput
                  label="CMV Total do Período"
                  value={config.cmvTotal}
                  onChange={(value) => updateConfig({ cmvTotal: value })}
                  required
                />
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">ℹ️ Como calcular o CMV:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>CMV = Estoque Inicial + Compras - Estoque Final</li>
                    <li>Gera crédito de PIS/COFINS (1,65% + 7,6%)</li>
                    <li>Essencial para cálculo do Lucro Real</li>
                    <li>Dedutível do IRPJ e CSLL</li>
                  </ul>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">💡 Dica Importante:</p>
                  <p className="text-xs text-muted-foreground">
                    O CMV deve incluir APENAS o custo das mercadorias efetivamente vendidas no período, 
                    não as compras totais. É calculado através do inventário.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: ICMS */}
        <TabsContent value="icms" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Alíquotas ICMS */}
            <Card className="border-l-4 border-l-icms">
              <CardHeader>
                <CardTitle className="text-lg">📋 Alíquotas de ICMS</CardTitle>
                <CardDescription>Percentuais de ICMS por operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PercentageInput
                  label="ICMS Interno (Mesmo Estado)"
                  value={config.icmsInterno}
                  onChange={(value) => updateConfig({ icmsInterno: value })}
                  max={50}
                />
                <PercentageInput
                  label="ICMS Sul/Sudeste"
                  value={config.icmsSul}
                  onChange={(value) => updateConfig({ icmsSul: value })}
                  max={50}
                />
                <PercentageInput
                  label="ICMS Norte/Nordeste/Centro-Oeste"
                  value={config.icmsNorte}
                  onChange={(value) => updateConfig({ icmsNorte: value })}
                  max={50}
                />
                <PercentageInput
                  label="DIFAL (Diferencial de Alíquota)"
                  value={config.difal}
                  onChange={(value) => updateConfig({ difal: value })}
                  max={100}
                />
                <PercentageInput
                  label="FCP (Fundo de Combate à Pobreza)"
                  value={config.fcp}
                  onChange={(value) => updateConfig({ fcp: value })}
                  max={10}
                />
                <div className="pt-2 border-t">
                  <PercentageInput
                    label="% Vendas com Substituição Tributária"
                    value={config.percentualST || 0}
                    onChange={(value) => updateConfig({ percentualST: value })}
                    max={100}
                    helpText="Percentual de vendas com ST que não são tributadas pelo ICMS"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Créditos ICMS */}
            <Card className="border-l-4 border-l-icms">
              <CardHeader>
                <CardTitle className="text-lg">✅ Créditos de ICMS</CardTitle>
                <CardDescription>Créditos especiais e adicionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CurrencyInput
                  label="Crédito Estoque Inicial"
                  value={config.creditoEstoqueInicial}
                  onChange={(value) => updateConfig({ creditoEstoqueInicial: value })}
                />
                <CurrencyInput
                  label="Crédito Ativo Imobilizado"
                  value={config.creditoAtivoImobilizado}
                  onChange={(value) => updateConfig({ creditoAtivoImobilizado: value })}
                />
                <CurrencyInput
                  label="Crédito Energia Elétrica (Indústria)"
                  value={config.creditoEnergiaIndustria}
                  onChange={(value) => updateConfig({ creditoEnergiaIndustria: value })}
                />
                <CurrencyInput
                  label="Crédito Substituição Tributária Entrada"
                  value={config.creditoSTEntrada}
                  onChange={(value) => updateConfig({ creditoSTEntrada: value })}
                />
                <CurrencyInput
                  label="Outros Créditos ICMS"
                  value={config.outrosCreditos}
                  onChange={(value) => updateConfig({ outrosCreditos: value })}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: PIS/COFINS */}
        <TabsContent value="pis-cofins" className="space-y-6 mt-6">
          {/* Alíquotas - Card Horizontal no Topo */}
          <Card className="border-l-4 border-l-pis">
            <CardHeader>
              <CardTitle className="text-lg">📋 Alíquotas PIS/COFINS</CardTitle>
              <CardDescription>Regime não cumulativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <PercentageInput
                  label="PIS Não Cumulativo"
                  value={config.pisAliq}
                  onChange={(value) => updateConfig({ pisAliq: value })}
                  max={10}
                />
                <PercentageInput
                  label="COFINS Não Cumulativo"
                  value={config.cofinsAliq}
                  onChange={(value) => updateConfig({ cofinsAliq: value })}
                  max={20}
                />
              </div>
              <div className="pt-4 border-t mt-4">
                <PercentageInput
                  label="% Vendas com Regime Monofásico"
                  value={config.percentualMonofasico || 0}
                  onChange={(value) => updateConfig({ percentualMonofasico: value })}
                  max={100}
                  helpText="Percentual de vendas monofásicas que não são tributadas pelo PIS/COFINS"
                />
              </div>
            </CardContent>
          </Card>

          {/* Despesas COM e SEM Crédito - Lado a Lado */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Despesas COM Crédito */}
            <Card className="border-l-4 border-l-pis">
              <CardHeader>
                <CardTitle className="text-lg">✅ Despesas COM Crédito PIS/COFINS</CardTitle>
                <CardDescription>Geram direito a crédito (9,25%)</CardDescription>
              </CardHeader>
              <CardContent>
                <DespesasManager
                  despesas={despesas}
                  credito="com-credito"
                  onAdd={handleAddDespesa}
                  onBulkAdd={handleBulkAddDespesa}
                  onEdit={handleEditDespesa}
                  onDelete={handleDeleteDespesa}
                  onClearDuplicates={handleClearDuplicates}
                />
              </CardContent>
            </Card>

            {/* Despesas SEM Crédito */}
            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="text-lg">❌ Despesas SEM Crédito PIS/COFINS</CardTitle>
                <CardDescription>Não geram direito a crédito</CardDescription>
              </CardHeader>
              <CardContent>
                <DespesasManager
                  despesas={despesas}
                  credito="sem-credito"
                  onAdd={handleAddDespesa}
                  onBulkAdd={handleBulkAddDespesa}
                  onEdit={handleEditDespesa}
                  onDelete={handleDeleteDespesa}
                  onClearDuplicates={handleClearDuplicates}
                />
              </CardContent>
            </Card>
          </div>

          {/* Informações Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ℹ️ Informações Importantes sobre PIS/COFINS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 bg-pis/10 rounded-lg">
                  <p className="font-medium text-pis mb-2">✅ Despesas COM Crédito (9,25%)</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Bens para revenda</li>
                    <li>Insumos de produção</li>
                    <li>Energia elétrica e térmica</li>
                    <li>Aluguéis de PJ</li>
                    <li>Frete e armazenagem</li>
                    <li>Depreciação de máquinas</li>
                    <li>Vale transporte</li>
                  </ul>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="font-medium text-destructive mb-2">❌ Despesas SEM Crédito</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Mão de obra (salários PF)</li>
                    <li>Alimentação de empregados</li>
                    <li>Combustível veículos passeio</li>
                    <li>Despesas com brindes</li>
                    <li>Multas e penalidades</li>
                    <li>Despesas com PF</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium mb-2">💡 Dica: Classificação para DRE</p>
                <p className="text-xs">
                  <strong>Custo:</strong> Relacionado à produção (CMV, matéria-prima, mão de obra direta) → Deduz para formar Lucro Bruto
                  <br />
                  <strong>Despesa:</strong> Relacionado à operação (administrativas, comerciais) → Deduz após o Lucro Bruto
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: IRPJ/CSLL */}
        <TabsContent value="irpj-csll" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Alíquotas IRPJ/CSLL */}
            <Card className="border-l-4 border-l-irpj">
              <CardHeader>
                <CardTitle className="text-lg">📋 Alíquotas IRPJ/CSLL</CardTitle>
                <CardDescription>Regime Lucro Real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PercentageInput
                  label="IRPJ Base (até R$ 20.000/mês)"
                  value={config.irpjBase}
                  onChange={(value) => updateConfig({ irpjBase: value })}
                  max={30}
                />
                <PercentageInput
                  label="IRPJ Adicional (acima do limite)"
                  value={config.irpjAdicional}
                  onChange={(value) => updateConfig({ irpjAdicional: value })}
                  max={30}
                />
                <CurrencyInput
                  label="Limite para IRPJ Adicional"
                  value={config.limiteIrpj}
                  onChange={(value) => updateConfig({ limiteIrpj: value })}
                />
                <PercentageInput
                  label="CSLL (Contribuição Social)"
                  value={config.csllAliq}
                  onChange={(value) => updateConfig({ csllAliq: value })}
                  max={20}
                />
              </CardContent>
            </Card>

            {/* Ajustes ao Lucro Real */}
            <Card className="border-l-4 border-l-irpj">
              <CardHeader>
                <CardTitle className="text-lg">⚖️ Ajustes ao Lucro Real</CardTitle>
                <CardDescription>Adições e exclusões tributárias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CurrencyInput
                  label="Adições ao Lucro Real"
                  value={config.adicoesLucro}
                  onChange={(value) => updateConfig({ adicoesLucro: value })}
                />
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Exemplos de adições:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Despesas não dedutíveis</li>
                    <li>Multas fiscais</li>
                    <li>Brindes e doações</li>
                    <li>Depreciação acelerada incentivada</li>
                  </ul>
                </div>
                
                <CurrencyInput
                  label="Exclusões do Lucro Real"
                  value={config.exclusoesLucro}
                  onChange={(value) => updateConfig({ exclusoesLucro: value })}
                />
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Exemplos de exclusões:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Dividendos recebidos</li>
                    <li>Reversões de provisões</li>
                    <li>Incentivos fiscais</li>
                    <li>Prejuízos compensáveis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: ISS */}
        <TabsContent value="iss" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-l-4 border-l-iss">
              <CardHeader>
                <CardTitle className="text-lg">📋 ISS (Imposto sobre Serviços)</CardTitle>
                <CardDescription>Alíquota municipal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PercentageInput
                  label="Alíquota ISS"
                  value={config.issAliq}
                  onChange={(value) => updateConfig({ issAliq: value })}
                  max={15}
                />
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">ℹ️ Informações sobre ISS:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    <li>Alíquota varia de 2% a 5% (geralmente)</li>
                    <li>Cada município define sua alíquota</li>
                    <li>Incide sobre a prestação de serviços</li>
                    <li>Base de cálculo: preço do serviço</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Resumo Tributário</CardTitle>
                <CardDescription>Visão geral das alíquotas configuradas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded bg-icms/10">
                  <span className="text-sm font-medium">ICMS Interno</span>
                  <span className="text-sm font-bold text-icms">{config.icmsInterno}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-pis/10">
                  <span className="text-sm font-medium">PIS</span>
                  <span className="text-sm font-bold text-pis">{config.pisAliq}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-pis/10">
                  <span className="text-sm font-medium">COFINS</span>
                  <span className="text-sm font-bold text-pis">{config.cofinsAliq}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-irpj/10">
                  <span className="text-sm font-medium">IRPJ Base</span>
                  <span className="text-sm font-bold text-irpj">{config.irpjBase}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-irpj/10">
                  <span className="text-sm font-medium">CSLL</span>
                  <span className="text-sm font-bold text-irpj">{config.csllAliq}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-iss/10">
                  <span className="text-sm font-medium">ISS</span>
                  <span className="text-sm font-bold text-iss">{config.issAliq}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
