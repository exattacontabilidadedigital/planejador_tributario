import { useToast as useToastOriginal } from "./use-toast"

/**
 * Helper para criar notificações toast consistentes em toda aplicação
 * Centraliza estilos e comportamentos dos toasts
 */
export const toast = {
  /**
   * Exibe toast de sucesso
   */
  success: (message: string, description?: string) => {
    const { toast } = useToastOriginal()
    toast({
      title: "✅ Sucesso",
      description: message,
      variant: "default",
    })
  },

  /**
   * Exibe toast de erro
   */
  error: (message: string, description?: string) => {
    const { toast } = useToastOriginal()
    toast({
      title: "❌ Erro",
      description: message || description,
      variant: "destructive",
    })
  },

  /**
   * Exibe toast de aviso
   */
  warning: (message: string, description?: string) => {
    const { toast } = useToastOriginal()
    toast({
      title: "⚠️ Atenção",
      description: message || description,
      variant: "default",
      className: "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
    })
  },

  /**
   * Exibe toast informativo
   */
  info: (message: string, description?: string) => {
    const { toast } = useToastOriginal()
    toast({
      title: "ℹ️ Informação",
      description: message || description,
      variant: "default",
      className: "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
    })
  },

  /**
   * Exibe toast de loading/processo em andamento
   */
  loading: (message: string) => {
    const { toast } = useToastOriginal()
    const { dismiss } = toast({
      title: "⏳ Processando...",
      description: message,
      duration: Infinity, // Não fecha automaticamente
    })
    return { dismiss }
  },

  /**
   * Exibe toast de operação concluída
   */
  done: (message: string) => {
    const { toast } = useToastOriginal()
    toast({
      title: "✓ Concluído",
      description: message,
      duration: 3000,
    })
  },
}

/**
 * Hook para usar o sistema de toast
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { success, error, loading } = useAppToast()
 * 
 *   const handleSave = async () => {
 *     const { dismiss } = loading('Salvando dados...')
 *     try {
 *       await saveData()
 *       dismiss()
 *       success('Dados salvos com sucesso!')
 *     } catch (err) {
 *       dismiss()
 *       error('Falha ao salvar dados')
 *     }
 *   }
 * }
 * ```
 */
export function useAppToast() {
  return toast
}
