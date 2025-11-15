"use client"

import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface AlertaCreditoDisponivelProps {
  impostos: {
    icms?: number
    pis?: number
    cofins?: number
  }
}

/**
 * Componente que exibe alerta quando há créditos disponíveis para próxima apuração
 * Usado quando débito < crédito, resultando em imposto = R$ 0,00
 */
export function AlertaCreditoDisponivel({ impostos }: AlertaCreditoDisponivelProps) {
  const temCredito = (impostos.icms && impostos.icms > 0) || 
                     (impostos.pis && impostos.pis > 0) || 
                     (impostos.cofins && impostos.cofins > 0)

  if (!temCredito) return null

  return (
    <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-900 dark:text-blue-100">
        💳 Créditos Disponíveis para Próxima Apuração
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-2">
        <p className="text-sm">
          Nesta apuração, os <strong>créditos superaram os débitos</strong>. 
          Isso significa que não há imposto a pagar e você tem crédito acumulado para compensar em apurações futuras:
        </p>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {impostos.icms && impostos.icms > 0 && (
            <Badge variant="outline" className="bg-white dark:bg-blue-900/30 border-blue-300 text-blue-900 dark:text-blue-100">
              <span className="font-semibold">ICMS:</span>
              <span className="ml-1.5">
                {impostos.icms.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </span>
            </Badge>
          )}
          
          {impostos.pis && impostos.pis > 0 && (
            <Badge variant="outline" className="bg-white dark:bg-blue-900/30 border-blue-300 text-blue-900 dark:text-blue-100">
              <span className="font-semibold">PIS:</span>
              <span className="ml-1.5">
                {impostos.pis.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </span>
            </Badge>
          )}
          
          {impostos.cofins && impostos.cofins > 0 && (
            <Badge variant="outline" className="bg-white dark:bg-blue-900/30 border-blue-300 text-blue-900 dark:text-blue-100">
              <span className="font-semibold">COFINS:</span>
              <span className="ml-1.5">
                {impostos.cofins.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </span>
            </Badge>
          )}
        </div>

        <p className="text-xs mt-3 text-blue-700 dark:text-blue-300">
          ℹ️ <strong>Como funciona:</strong> Quando você tem mais créditos (compras, despesas dedutíveis) 
          do que débitos (vendas), o imposto a pagar é R$ 0,00. O saldo credor fica disponível 
          para abater dos impostos das próximas apurações.
        </p>
      </AlertDescription>
    </Alert>
  )
}
