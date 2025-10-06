"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Bell, Check, CheckCheck, Trash2, X, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { useNotificacoesStore, type Notificacao } from "@/stores/notificacoes-store"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function CentroNotificacoes() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  
  const {
    notificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    removerNotificacao,
    limparNotificacoes,
    getQuantidadeNaoLidas
  } = useNotificacoesStore()

  const quantidadeNaoLidas = getQuantidadeNaoLidas()

  const getIconeNotificacao = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'sucesso':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      case 'aviso':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getCorFundo = (tipo: Notificacao['tipo'], lida: boolean) => {
    if (lida) return 'bg-muted/50'
    
    switch (tipo) {
      case 'sucesso':
        return 'bg-green-50 dark:bg-green-950/20'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/20'
      case 'aviso':
        return 'bg-yellow-50 dark:bg-yellow-950/20'
      case 'erro':
        return 'bg-red-50 dark:bg-red-950/20'
    }
  }

  const handleClickNotificacao = (notificacao: Notificacao) => {
    marcarComoLida(notificacao.id)
    
    if (notificacao.linkComparativo) {
      const empresaId = notificacao.linkComparativo.split('/')[0] // Assumindo formato empresaId/comparativoId
      router.push(`/empresas/${empresaId}/comparativos/${notificacao.linkComparativo}`)
      setAberto(false)
    }
  }

  const formatarTempo = (timestamp: Date) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return 'Agora'
    }
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {quantidadeNaoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {quantidadeNaoLidas > 9 ? '9+' : quantidadeNaoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notificações</h3>
            {quantidadeNaoLidas > 0 && (
              <p className="text-xs text-muted-foreground">
                {quantidadeNaoLidas} não {quantidadeNaoLidas === 1 ? 'lida' : 'lidas'}
              </p>
            )}
          </div>
          
          <div className="flex gap-1">
            {quantidadeNaoLidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={marcarTodasComoLidas}
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            )}
            {notificacoes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limparNotificacoes}
                title="Limpar todas"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notificacao, index) => (
                <div
                  key={notificacao.id}
                  className={`p-4 transition-colors ${
                    getCorFundo(notificacao.tipo, notificacao.lida)
                  } ${notificacao.linkComparativo ? 'cursor-pointer hover:bg-accent' : ''}`}
                  onClick={() => notificacao.linkComparativo && handleClickNotificacao(notificacao)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIconeNotificacao(notificacao.tipo)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-none">
                          {notificacao.titulo}
                          {!notificacao.lida && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full" />
                          )}
                        </p>
                        
                        <div className="flex gap-1">
                          {!notificacao.lida && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                marcarComoLida(notificacao.id)
                              }}
                              title="Marcar como lida"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              removerNotificacao(notificacao.id)
                            }}
                            title="Remover"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {notificacao.mensagem}
                      </p>
                      
                      <p className="text-xs text-muted-foreground/70">
                        {formatarTempo(notificacao.timestamp)}
                      </p>

                      {notificacao.acoes && notificacao.acoes.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {notificacao.acoes.map((acao, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                acao.onClick()
                              }}
                            >
                              {acao.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notificacoes.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // Futuramente pode abrir página dedicada de notificações
                  setAberto(false)
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
