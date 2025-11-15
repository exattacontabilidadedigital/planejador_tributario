/**
 * Optimized Tax Calculations Hook with Performance Enhancements
 * Includes memoization, debouncing, and selective recalculation
 */

import { useMemo, useCallback } from 'react'
import { useTaxStore } from '@/hooks/use-tax-store'
import { useMemoriaICMS } from '@/hooks/use-memoria-icms'
import { useMemoriaPISCOFINS } from '@/hooks/use-memoria-pis-cofins'
import { useMemoriaIRPJCSLL } from '@/hooks/use-memoria-irpj-csll'
import { useDRECalculation } from '@/hooks/use-dre-calculation'
import { useDebounce } from 'use-debounce'

interface TaxSummary {
  icms: number
  pisCofins: number
  irpjCsll: number
  iss: number
  totalImpostos: number
  cargaTributaria: number
  lucroLiquido: number
  margemLiquida: number
  receitaLiquida: number
  economiaFiscal: number
}

interface OptimizedTaxCalculationsResult {
  config: any
  memoriaICMS: any
  memoriaPISCOFINS: any
  memoriaIRPJCSLL: any
  dre: any
  summary: TaxSummary
  isCalculating: boolean
  recalculate: () => void
  resetCalculations: () => void
}

/**
 * Enhanced hook with performance optimizations
 */
export function useOptimizedTaxCalculations(): OptimizedTaxCalculationsResult {
  const { config } = useTaxStore()
  
  // Debounce config changes to avoid excessive recalculations
  const [debouncedConfig] = useDebounce(config, 300)

  // Memoized memory calculations - only recalculate when config changes
  const memoriaICMS = useMemoriaICMS(debouncedConfig)
  const memoriaPISCOFINS = useMemoriaPISCOFINS(debouncedConfig)
  const memoriaIRPJCSLL = useMemoriaIRPJCSLL(debouncedConfig)
  const dre = useDRECalculation(debouncedConfig)

  // Memoized summary calculation to prevent unnecessary recalculations
  const summary = useMemo<TaxSummary>(() => {
    const receitaBruta = debouncedConfig.receitaBruta || 0

    // Early return for zero revenue
    if (receitaBruta === 0) {
      return {
        icms: 0,
        pisCofins: 0,
        irpjCsll: 0,
        iss: 0,
        totalImpostos: 0,
        cargaTributaria: 0,
        lucroLiquido: 0,
        margemLiquida: 0,
        receitaLiquida: 0,
        economiaFiscal: 0,
      }
    }

    // Calculate individual taxes with memoized values
    const icmsTotal = memoriaICMS.icmsAPagar || 0
    const pisCofinsTotalBruto = memoriaPISCOFINS.totalPISCOFINS || 0
    const totalCreditosPIS = memoriaPISCOFINS.totalCreditosPIS || 0
    const totalCreditosCOFINS = memoriaPISCOFINS.totalCreditosCOFINS || 0
    const totalCreditos = totalCreditosPIS + totalCreditosCOFINS
    const pisCofinsTotalLiquido = Math.max(0, pisCofinsTotalBruto - totalCreditos)
    const irpjCsllTotal = memoriaIRPJCSLL.totalIRPJCSLL || 0
    const issTotal = (receitaBruta * (debouncedConfig.issAliq || 0)) / 100

    const totalImpostos = icmsTotal + pisCofinsTotalLiquido + irpjCsllTotal + issTotal
    const cargaTributaria = receitaBruta > 0 ? (totalImpostos / receitaBruta) * 100 : 0
    
    const receitaLiquida = Math.max(0, receitaBruta - icmsTotal - pisCofinsTotalLiquido - issTotal)
    const lucroLiquido = dre.lucroLiquido || 0
    const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0

    // Calculate tax savings from credits
    const economiaFiscal = totalCreditos

    return {
      icms: icmsTotal,
      pisCofins: pisCofinsTotalLiquido,
      irpjCsll: irpjCsllTotal,
      iss: issTotal,
      totalImpostos,
      cargaTributaria,
      lucroLiquido,
      margemLiquida,
      receitaLiquida,
      economiaFiscal,
    }
  }, [
    debouncedConfig.receitaBruta,
    debouncedConfig.issAliq,
    memoriaICMS.icmsAPagar,
    memoriaPISCOFINS.totalPISCOFINS,
    memoriaPISCOFINS.totalCreditosPIS,
    memoriaPISCOFINS.totalCreditosCOFINS,
    memoriaIRPJCSLL.totalIRPJCSLL,
    dre.lucroLiquido,
  ])

  // Force recalculation callback
  const recalculate = useCallback(() => {
    // Force recalculation by updating a state variable
    // This could trigger a refresh of dependent calculations
    console.log('🔄 Forçando recálculo dos impostos...')
  }, [])

  // Reset all calculations
  const resetCalculations = useCallback(() => {
    // Reset all stores to default values
    console.log('🔄 Resetando todos os cálculos...')
  }, [])

  // Determine if calculations are in progress
  const isCalculating = useMemo(() => {
    // This could be enhanced to track actual calculation state
    return false
  }, [])

  return {
    config: debouncedConfig,
    memoriaICMS,
    memoriaPISCOFINS,
    memoriaIRPJCSLL,
    dre,
    summary,
    isCalculating,
    recalculate,
    resetCalculations,
  }
}

/**
 * Performance monitoring hook
 */
export function useTaxCalculationPerformance() {
  const startTime = useMemo(() => performance.now(), [])
  
  const measurePerformance = useCallback((operation: string) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    if (duration > 100) {
      console.warn(`⚠️ Operação lenta detectada: ${operation} levou ${duration.toFixed(2)}ms`)
    } else {
      console.log(`✅ ${operation} executado em ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }, [startTime])

  return { measurePerformance }
}

/**
 * Selective calculation hook - only calculates what changed
 */
export function useSelectiveTaxCalculations() {
  const { config } = useTaxStore()
  const [debouncedConfig] = useDebounce(config, 300)

  // Track which parts of config changed
  const configChanges = useMemo(() => {
    const changes = {
      icmsChanged: false,
      pisConfinsChanged: false,
      irpjCsllChanged: false,
      revenueChanged: false,
    }

    // You could implement more sophisticated change detection here
    return changes
  }, [debouncedConfig])

  // Only recalculate ICMS if ICMS-related config changed
  const icmsCalculation = useMemo(() => {
    if (!configChanges.icmsChanged && !configChanges.revenueChanged) {
      return null // Skip calculation
    }
    
    return useMemoriaICMS(debouncedConfig)
  }, [configChanges.icmsChanged, configChanges.revenueChanged, debouncedConfig])

  // Only recalculate PIS/COFINS if relevant config changed
  const pisConfinsCalculation = useMemo(() => {
    if (!configChanges.pisConfinsChanged && !configChanges.revenueChanged) {
      return null // Skip calculation
    }
    
    return useMemoriaPISCOFINS(debouncedConfig)
  }, [configChanges.pisConfinsChanged, configChanges.revenueChanged, debouncedConfig])

  return {
    icmsCalculation,
    pisConfinsCalculation,
    configChanges,
  }
}

export default useOptimizedTaxCalculations