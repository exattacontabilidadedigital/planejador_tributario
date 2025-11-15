"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { HelpCircle, Calculator, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTermoGlossario, type TermoGlossario } from "@/lib/glossario-tributario"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = TooltipPrimitive.Content

interface TooltipExplicativoProps {
  termo: string
  children?: React.ReactNode
  showIcon?: boolean
  iconSize?: "sm" | "md" | "lg"
}

/**
 * Componente que exibe um tooltip com explicação de termos tributários
 * e um modal com informações detalhadas ao clicar
 */
export function TooltipExplicativo({ 
  termo, 
  children, 
  showIcon = true,
  iconSize = "sm" 
}: TooltipExplicativoProps) {
  const [open, setOpen] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  
  const termoInfo = getTermoGlossario(termo)
  
  if (!termoInfo) {
    return <>{children}</>
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="inline-flex items-center gap-1.5">
        {children}
        
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {showIcon && <HelpCircle className={iconSizes[iconSize]} />}
            </button>
          </TooltipTrigger>
          <TooltipPrimitive.Portal>
            <TooltipContent
              side="top"
              className="max-w-xs z-50 overflow-hidden rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
              sideOffset={5}
            >
              <div className="space-y-2">
                <div>
                  <p className="font-semibold flex items-center gap-1.5">
                    {termoInfo.sigla && (
                      <Badge variant="secondary" className="text-xs">
                        {termoInfo.sigla}
                      </Badge>
                    )}
                    {termoInfo.termo}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {termoInfo.definicao.slice(0, 120)}
                    {termoInfo.definicao.length > 120 && '...'}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setOpen(false)
                    setDialogOpen(true)
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Info className="h-3 w-3" />
                  Ver detalhes completos
                </button>
              </div>
            </TooltipContent>
          </TooltipPrimitive.Portal>
        </Tooltip>

        {/* Modal com informações detalhadas */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {termoInfo.sigla && (
                  <Badge variant="default" className="text-sm">
                    {termoInfo.sigla}
                  </Badge>
                )}
                {termoInfo.termo}
              </DialogTitle>
              <DialogDescription>
                Entenda o conceito e como é calculado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Definição */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  O que é?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {termoInfo.definicao}
                </p>
              </div>

              <Separator />

              {/* Fórmula */}
              {termoInfo.formula && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Como é calculado?
                    </h4>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-line">
                      {termoInfo.formula}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Exemplo */}
              {termoInfo.exemplo && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">💡 Exemplo Prático</h4>
                    <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line">
                        {termoInfo.exemplo}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Observação */}
              {termoInfo.observacao && (
                <div>
                  <h4 className="font-semibold mb-2">📌 Observação Importante</h4>
                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      {termoInfo.observacao}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

/**
 * Wrapper para valores monetários com tooltip explicativo
 */
interface ValorComTooltipProps {
  valor: string | number
  termo: string
  label?: string
  className?: string
}

export function ValorComTooltip({ valor, termo, label, className }: ValorComTooltipProps) {
  return (
    <div className={cn("inline-flex items-baseline gap-1", className)}>
      {label && <span className="text-sm text-muted-foreground">{label}:</span>}
      <span className="font-semibold">{valor}</span>
      <TooltipExplicativo termo={termo} iconSize="sm" />
    </div>
  )
}

/**
 * Badge com tooltip explicativo
 */
interface BadgeComTooltipProps {
  texto: string
  termo: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function BadgeComTooltip({ texto, termo, variant = "default" }: BadgeComTooltipProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <Badge variant={variant}>{texto}</Badge>
      <TooltipExplicativo termo={termo} iconSize="sm" />
    </div>
  )
}
