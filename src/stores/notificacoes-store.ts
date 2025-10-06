"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notificacao {
  id: string
  tipo: 'sucesso' | 'info' | 'aviso' | 'erro'
  titulo: string
  mensagem: string
  lida: boolean
  timestamp: Date
  acoes?: Array<{
    label: string
    onClick: () => void
  }>
  linkComparativo?: string
}

interface NotificacoesState {
  notificacoes: Notificacao[]
  preferencias: {
    notificarCriacaoComparativo: boolean
    notificarConclusaoAnalise: boolean
    notificarAlertasValidacao: boolean
    mostrarBadge: boolean
  }
  
  // Actions
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'lida' | 'timestamp'>) => void
  marcarComoLida: (id: string) => void
  marcarTodasComoLidas: () => void
  removerNotificacao: (id: string) => void
  limparNotificacoes: () => void
  atualizarPreferencias: (preferencias: Partial<NotificacoesState['preferencias']>) => void
  
  // Getters
  getNaoLidas: () => Notificacao[]
  getQuantidadeNaoLidas: () => number
}

export const useNotificacoesStore = create<NotificacoesState>()(
  persist(
    (set, get) => ({
      notificacoes: [],
      preferencias: {
        notificarCriacaoComparativo: true,
        notificarConclusaoAnalise: true,
        notificarAlertasValidacao: true,
        mostrarBadge: true
      },

      adicionarNotificacao: (notificacao) => {
        const novaNotificacao: Notificacao = {
          ...notificacao,
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          lida: false,
          timestamp: new Date()
        }

        set((state) => ({
          notificacoes: [novaNotificacao, ...state.notificacoes].slice(0, 50) // Manter apenas as últimas 50
        }))
      },

      marcarComoLida: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          )
        }))
      },

      marcarTodasComoLidas: () => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true }))
        }))
      },

      removerNotificacao: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.filter((n) => n.id !== id)
        }))
      },

      limparNotificacoes: () => {
        set({ notificacoes: [] })
      },

      atualizarPreferencias: (preferencias) => {
        set((state) => ({
          preferencias: { ...state.preferencias, ...preferencias }
        }))
      },

      getNaoLidas: () => {
        return get().notificacoes.filter((n) => !n.lida)
      },

      getQuantidadeNaoLidas: () => {
        return get().notificacoes.filter((n) => !n.lida).length
      }
    }),
    {
      name: 'notificacoes-storage'
    }
  )
)

// Helper function para criar notificações comuns
export const notificarComparativoCriado = (nomeComparativo: string, comparativoId: string) => {
  const { adicionarNotificacao, preferencias } = useNotificacoesStore.getState()
  
  if (preferencias.notificarCriacaoComparativo) {
    adicionarNotificacao({
      tipo: 'sucesso',
      titulo: 'Comparativo criado!',
      mensagem: `"${nomeComparativo}" foi criado e está pronto para visualização`,
      linkComparativo: comparativoId
    })
  }
}

export const notificarAnaliseConcluida = (nomeComparativo: string, comparativoId: string, insights?: string) => {
  const { adicionarNotificacao, preferencias } = useNotificacoesStore.getState()
  
  if (preferencias.notificarConclusaoAnalise) {
    adicionarNotificacao({
      tipo: 'info',
      titulo: 'Análise concluída!',
      mensagem: insights || `A análise de "${nomeComparativo}" foi finalizada com sucesso`,
      linkComparativo: comparativoId
    })
  }
}

export const notificarAlertaValidacao = (titulo: string, mensagem: string) => {
  const { adicionarNotificacao, preferencias } = useNotificacoesStore.getState()
  
  if (preferencias.notificarAlertasValidacao) {
    adicionarNotificacao({
      tipo: 'aviso',
      titulo,
      mensagem
    })
  }
}

export const notificarErro = (titulo: string, mensagem: string) => {
  const { adicionarNotificacao } = useNotificacoesStore.getState()
  
  adicionarNotificacao({
    tipo: 'erro',
    titulo,
    mensagem
  })
}
