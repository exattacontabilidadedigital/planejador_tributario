"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WizardCriarComparativoCompleto } from "./wizard-criar-comparativo-completo"
import type { ComparativoCompleto } from "@/types/comparativo-analise-completo"
import { Component, ReactNode } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// Error Boundary para capturar erros do Wizard
class WizardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ ERRO NO WIZARD:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar o wizard</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-60">
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

interface ModalCriarComparativoProps {
  empresaId: string
  aberto: boolean
  onFechar: () => void
}

export function ModalCriarComparativo({
  empresaId,
  aberto,
  onFechar
}: ModalCriarComparativoProps) {

  const handleConcluir = (comparativo: ComparativoCompleto) => {
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Criar Nova Análise Comparativa</DialogTitle>
            <DialogDescription>
              Assistente para criar análises comparativas entre regimes tributários
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        
        <WizardErrorBoundary>
          <WizardCriarComparativoCompleto
            empresaId={empresaId}
            aberto={aberto}
            onFechar={onFechar}
            onConcluir={handleConcluir}
          />
        </WizardErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}
