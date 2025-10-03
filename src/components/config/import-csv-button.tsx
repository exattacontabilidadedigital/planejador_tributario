"use client"

import { useState, useRef } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DespesaItem, DespesaCredito } from "@/types"
import {
  baixarModeloCSV,
  lerArquivoCSV,
  parseCSV,
  validarArquivoCSV,
} from "@/lib/csv-utils"

interface ImportCSVButtonProps {
  credito: DespesaCredito
  onImport: (despesas: DespesaItem[]) => void
  className?: string
}

export function ImportCSVButton({ credito, onImport, className }: ImportCSVButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState<DespesaItem[]>([])
  const [erros, setErros] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const titulo = credito === "com-credito" 
    ? "Despesas COM Crédito"
    : "Despesas SEM Crédito"

  const handleDownloadModelo = () => {
    baixarModeloCSV(credito)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset estados
    setSucesso([])
    setErros([])
    setLoading(true)

    try {
      // Valida arquivo
      const erroValidacao = validarArquivoCSV(file)
      if (erroValidacao) {
        setErros([erroValidacao])
        setLoading(false)
        return
      }

      // Lê arquivo
      const conteudo = await lerArquivoCSV(file)
      
      // Parseia CSV
      const resultado = parseCSV(conteudo, credito)
      
      setSucesso(resultado.sucesso)
      setErros(resultado.erros)
      
    } catch (error) {
      setErros(["Erro ao processar arquivo: " + (error as Error).message])
    } finally {
      setLoading(false)
      // Reset input para permitir upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImportar = () => {
    if (sucesso.length > 0) {
      onImport(sucesso)
      setOpen(false)
      // Reset estados
      setSucesso([])
      setErros([])
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setSucesso([])
    setErros([])
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={className}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar {titulo}</DialogTitle>
            <DialogDescription>
              Importe múltiplas despesas de uma vez usando um arquivo CSV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Botão Download Modelo */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Baixar Modelo CSV</p>
                <p className="text-xs text-muted-foreground">
                  Arquivo de exemplo com o formato correto
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadModelo}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>

            {/* Formato do CSV */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Formato esperado:</strong><br />
                • Separador: ponto-e-vírgula (;)<br />
                • Colunas: descricao;valor;tipo;categoria<br />
                • Tipo: "custo" ou "despesa"<br />
                • Valor: formato brasileiro (1.500,00) ou internacional (1500.00)
              </AlertDescription>
            </Alert>

            {/* Input File */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Arquivo CSV</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="w-full text-sm border rounded-md p-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                disabled={loading}
              />
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Processando arquivo...</p>
              </div>
            )}

            {/* Erros */}
            {erros.length > 0 && (
              <Alert variant="destructive" className="max-h-96 overflow-hidden flex flex-col">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription className="flex-1 overflow-hidden flex flex-col">
                  <strong>Erros encontrados: {erros.length}</strong>
                  {erros.length > 50 && (
                    <p className="text-xs mt-1 text-destructive/80">
                      Mostrando primeiros 50 erros de {erros.length} encontrados
                    </p>
                  )}
                  <div 
                    className="mt-2 flex-1 overflow-y-auto border border-destructive/20 rounded p-2 bg-background/50"
                    style={{ maxHeight: '240px' }}
                  >
                    <ul className="list-disc list-inside space-y-1">
                      {erros.slice(0, 50).map((erro, i) => (
                        <li key={i} className="text-xs break-words">{erro}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Sucesso */}
            {sucesso.length > 0 && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong className="text-green-900 dark:text-green-100">
                    {sucesso.length} despesa(s) pronta(s) para importar
                  </strong>
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-1">Descrição</th>
                          <th className="pb-1 text-right">Valor</th>
                          <th className="pb-1">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="text-green-800 dark:text-green-200">
                        {sucesso.map((desp, i) => (
                          <tr key={i} className="border-b border-green-200 dark:border-green-800">
                            <td className="py-1">{desp.descricao}</td>
                            <td className="py-1 text-right">R$ {desp.valor.toFixed(2)}</td>
                            <td className="py-1">{desp.tipo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleImportar}
                disabled={sucesso.length === 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar {sucesso.length} Despesa(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
