"use client"

import * as React from "react"
import { Calculator, Settings, FileText, BarChart3, TrendingUp, Folder } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTaxStore } from "@/hooks/use-tax-store"
import { useTaxCalculations } from "@/hooks/use-tax-calculations"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { ConfigPanel } from "@/components/config/config-panel"
import { MemoriaICMSTable } from "@/components/memoria/memoria-icms-table"
import { MemoriaPISCOFINSTable } from "@/components/memoria/memoria-pis-cofins-table"
import { MemoriaIRPJCSLLTable } from "@/components/memoria/memoria-irpj-csll-table"
import { DRETable } from "@/components/dre/dre-table"
import { TaxCompositionChart } from "@/components/dashboard/tax-composition-chart"
import { ScenarioManager } from "@/components/scenarios/scenario-manager"

export function TaxPlannerDashboard() {
  const { activeTab, setActiveTab } = useTaxStore()
  const { summary } = useTaxCalculations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Planejador Tributário</h1>
              <p className="text-xs text-muted-foreground">v3.0 - Lucro Real</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-7 lg:w-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="cenarios" className="gap-2">
              <Folder className="h-4 w-4" />
              Cenários
            </TabsTrigger>
            <TabsTrigger value="memoria-icms" className="gap-2">
              <FileText className="h-4 w-4" />
              ICMS
            </TabsTrigger>
            <TabsTrigger value="memoria-pis-cofins" className="gap-2">
              <FileText className="h-4 w-4" />
              PIS/COFINS
            </TabsTrigger>
            <TabsTrigger value="memoria-irpj-csll" className="gap-2">
              <FileText className="h-4 w-4" />
              IRPJ/CSLL
            </TabsTrigger>
            <TabsTrigger value="dre" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              DRE
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Receita Bruta */}
              <Card className="border-l-4 border-l-lucro">
                <CardHeader className="pb-3">
                  <CardDescription>Receita Bruta Mensal</CardDescription>
                  <CardTitle className="text-3xl font-bold text-lucro">
                    {formatCurrency(summary.receitaBruta)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Base para cálculos tributários</p>
                </CardContent>
              </Card>

              {/* ICMS */}
              <Card className="border-l-4 border-l-icms">
                <CardHeader className="pb-3">
                  <CardDescription>ICMS a Pagar</CardDescription>
                  <CardTitle className="text-3xl font-bold text-icms">
                    {formatCurrency(summary.icms)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage((summary.icms / summary.receitaBruta) * 100)} da receita
                  </p>
                </CardContent>
              </Card>

              {/* PIS/COFINS */}
              <Card className="border-l-4 border-l-pis">
                <CardHeader className="pb-3">
                  <CardDescription>PIS/COFINS a Pagar</CardDescription>
                  <CardTitle className="text-3xl font-bold text-pis">
                    {formatCurrency(summary.pisCofins)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage((summary.pisCofins / summary.receitaBruta) * 100)} da receita
                  </p>
                </CardContent>
              </Card>

              {/* IRPJ/CSLL */}
              <Card className="border-l-4 border-l-irpj">
                <CardHeader className="pb-3">
                  <CardDescription>IRPJ/CSLL a Pagar</CardDescription>
                  <CardTitle className="text-3xl font-bold text-irpj">
                    {formatCurrency(summary.irpjCsll)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage((summary.irpjCsll / summary.receitaBruta) * 100)} da receita
                  </p>
                </CardContent>
              </Card>

              {/* Carga Tributária */}
              <Card className="border-l-4 border-l-destructive">
                <CardHeader className="pb-3">
                  <CardDescription>Carga Tributária Total</CardDescription>
                  <CardTitle className="text-3xl font-bold text-destructive">
                    {formatPercentage(summary.cargaTributaria)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Total de impostos: {formatCurrency(summary.totalImpostos)}
                  </p>
                </CardContent>
              </Card>

              {/* Lucro Líquido */}
              <Card className="border-l-4 border-l-lucro">
                <CardHeader className="pb-3">
                  <CardDescription>Lucro Líquido</CardDescription>
                  <CardTitle className="text-3xl font-bold text-lucro">
                    {formatCurrency(summary.lucroLiquido)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Margem: {formatPercentage(summary.margemLiquida)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Composição Tributária */}
            <TaxCompositionChart />

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Bem-vindo ao Planejador Tributário v3.0!</CardTitle>
                <CardDescription>
                  Sistema moderno de planejamento tributário desenvolvido com React, Next.js e shadcn/ui
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">✅ Recursos Implementados:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Dashboard com métricas principais</li>
                      <li>• Dark mode completo</li>
                      <li>• Componentes shadcn/ui</li>
                      <li>• State management com Zustand</li>
                      <li>• TypeScript para type safety</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">⏳ Em Desenvolvimento:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Painel de configurações</li>
                      <li>• Memórias de cálculo detalhadas</li>
                      <li>• Gráficos interativos (Chart.js)</li>
                      <li>• Exportação PDF</li>
                      <li>• DRE completa</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    variant="default" 
                    className="w-full md:w-auto"
                    onClick={() => setActiveTab('configuracoes')}
                  >
                    Ir para Configurações →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="configuracoes" className="space-y-6">
            <ConfigPanel />
          </TabsContent>

          {/* ICMS Tab */}
          <TabsContent value="memoria-icms" className="space-y-6">
            <MemoriaICMSTable />
          </TabsContent>

          {/* PIS/COFINS Tab */}
          <TabsContent value="memoria-pis-cofins" className="space-y-6">
            <MemoriaPISCOFINSTable />
          </TabsContent>

          {/* IRPJ/CSLL Tab */}
          <TabsContent value="memoria-irpj-csll" className="space-y-6">
            <MemoriaIRPJCSLLTable />
          </TabsContent>

          {/* Cenários Tab */}
          <TabsContent value="cenarios" className="space-y-6">
            <ScenarioManager />
          </TabsContent>

          {/* DRE Tab */}
          <TabsContent value="dre" className="space-y-6">
            <DRETable />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Planejador Tributário v3.0 - Desenvolvido com ❤️ usando React + Next.js + shadcn/ui
          </p>
          <p className="text-xs text-muted-foreground">
            Status: 🏗️ Em Construção (40% concluído)
          </p>
        </div>
      </footer>
    </div>
  )
}
