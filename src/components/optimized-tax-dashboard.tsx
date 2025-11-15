"use client"

import React, { memo, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { useOptimizedTaxCalculations } from '@/hooks/use-optimized-tax-calculations'

interface TaxSummaryCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'percentage'
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  showTrend?: boolean
  isLoading?: boolean
}

// Memoized individual tax summary card
const TaxSummaryCard = memo<TaxSummaryCardProps>(({
  title,
  value,
  previousValue,
  format = 'currency',
  variant = 'default',
  showTrend = false,
  isLoading = false
}) => {
  // Memoized formatted value to prevent recalculation
  const formattedValue = useMemo(() => {
    if (isLoading) return null
    return format === 'currency' ? formatCurrency(value) : formatPercentage(value)
  }, [value, format, isLoading])

  // Memoized trend calculation
  const trend = useMemo(() => {
    if (!showTrend || previousValue === undefined) return null
    
    const difference = value - previousValue
    const percentage = previousValue !== 0 ? (difference / previousValue) * 100 : 0
    
    return {
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral',
      value: Math.abs(percentage),
      difference: Math.abs(difference)
    }
  }, [value, previousValue, showTrend])

  // Memoized trend icon
  const TrendIcon = useMemo(() => {
    if (!trend) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }, [trend])

  // Memoized variant styles
  const variantStyles = useMemo(() => {
    const styles = {
      default: 'border-border',
      success: 'border-green-500 bg-green-50 dark:bg-green-950',
      warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
      destructive: 'border-red-500 bg-red-50 dark:bg-red-950'
    }
    return styles[variant] || styles.default
  }, [variant])

  if (isLoading) {
    return (
      <Card className={variantStyles}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          {showTrend && <Skeleton className="h-4 w-16" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={variantStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {trend && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            {TrendIcon}
            <span>{formatPercentage(trend.value)}</span>
            <span>vs anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
TaxSummaryCard.displayName = 'TaxSummaryCard'

interface OptimizedTaxDashboardProps {
  showComparison?: boolean
  showActions?: boolean
}

// Main optimized dashboard component
const OptimizedTaxDashboard = memo<OptimizedTaxDashboardProps>(({
  showComparison = false,
  showActions = true
}) => {
  const { 
    summary, 
    isCalculating, 
    recalculate, 
    resetCalculations 
  } = useOptimizedTaxCalculations()

  // Memoized tax data to prevent unnecessary re-renders
  const taxData = useMemo(() => [
    {
      title: 'ICMS',
      value: summary.icms,
      variant: 'default' as const,
    },
    {
      title: 'PIS/COFINS',
      value: summary.pisCofins,
      variant: 'default' as const,
    },
    {
      title: 'IRPJ/CSLL',
      value: summary.irpjCsll,
      variant: 'default' as const,
    },
    {
      title: 'Total de Impostos',
      value: summary.totalImpostos,
      variant: 'destructive' as const,
    },
    {
      title: 'Carga Tributária',
      value: summary.cargaTributaria,
      format: 'percentage' as const,
      variant: summary.cargaTributaria > 30 ? 'warning' as const : 'success' as const,
    },
    {
      title: 'Lucro Líquido',
      value: summary.lucroLiquido,
      variant: summary.lucroLiquido > 0 ? 'success' as const : 'destructive' as const,
    },
    {
      title: 'Margem Líquida',
      value: summary.margemLiquida,
      format: 'percentage' as const,
      variant: summary.margemLiquida > 10 ? 'success' as const : 'warning' as const,
    },
    {
      title: 'Economia Fiscal',
      value: summary.economiaFiscal,
      variant: 'success' as const,
    },
  ], [summary])

  // Memoized handlers
  const handleRecalculate = useCallback(() => {
    recalculate()
  }, [recalculate])

  const handleReset = useCallback(() => {
    resetCalculations()
  }, [resetCalculations])

  // Memoized warning conditions
  const warnings = useMemo(() => {
    const warns = []
    
    if (summary.cargaTributaria > 40) {
      warns.push('Carga tributária muito alta (>40%)')
    }
    
    if (summary.margemLiquida < 5) {
      warns.push('Margem líquida baixa (<5%)')
    }
    
    if (summary.lucroLiquido < 0) {
      warns.push('Resultado negativo')
    }
    
    return warns
  }, [summary.cargaTributaria, summary.margemLiquida, summary.lucroLiquido])

  return (
    <div className="space-y-6">
      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard Tributário</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleRecalculate} 
              disabled={isCalculating}
              variant="outline"
              size="sm"
            >
              {isCalculating ? 'Calculando...' : 'Recalcular'}
            </Button>
            <Button 
              onClick={handleReset}
              variant="ghost"
              size="sm"
            >
              Resetar
            </Button>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-900 dark:text-yellow-100">
                Alertas Importantes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                  • {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tax Summary Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {taxData.map((item, index) => (
          <TaxSummaryCard
            key={`${item.title}-${index}`} // Stable key for performance
            title={item.title}
            value={item.value}
            format={item.format}
            variant={item.variant}
            showTrend={showComparison}
            isLoading={isCalculating}
          />
        ))}
      </div>

      {/* Performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground text-center">
          🚀 Dashboard otimizado com React.memo e useMemo
        </div>
      )}
    </div>
  )
})
OptimizedTaxDashboard.displayName = 'OptimizedTaxDashboard'

export default OptimizedTaxDashboard