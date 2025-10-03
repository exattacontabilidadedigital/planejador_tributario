"use client"

import { Button } from "@/components/ui/button"
import type { LinhaRelatorioAnual, TotaisRelatorio } from "@/types/relatorio"
import { Download, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"

interface BotoesExportacaoProps {
  linhas: LinhaRelatorioAnual[]
  totais: TotaisRelatorio
  nomeEmpresa: string
  ano: number
}

export function BotoesExportacao({ linhas, totais, nomeEmpresa, ano }: BotoesExportacaoProps) {
  const { toast } = useToast()

  const exportarExcel = () => {
    if (linhas.length === 0) {
      toast({
        title: "Sem dados para exportar",
        description: "Crie cenários aprovados antes de exportar.",
        variant: "destructive",
      })
      return
    }

    try {
      // Preparar dados para exportação
      const dadosExcel = linhas.map((linha) => ({
        Mês: linha.mes,
        Receita: linha.receita,
        ICMS: linha.icms,
        PIS: linha.pis,
        COFINS: linha.cofins,
        IRPJ: linha.irpj,
        CSLL: linha.csll,
        ISS: linha.iss,
        "Total Impostos": linha.totalImpostos,
        "Lucro Líquido": linha.lucroLiquido,
        "Margem Líquida (%)": linha.margemLiquida,
        "Carga Tributária (%)": linha.cargaTributaria,
      }))

      // Adicionar linha de totais
      dadosExcel.push({
        Mês: "TOTAL",
        Receita: totais.receitaBruta,
        ICMS: totais.icmsTotal,
        PIS: totais.pisTotal,
        COFINS: totais.cofinsTotal,
        IRPJ: totais.irpjTotal,
        CSLL: totais.csllTotal,
        ISS: totais.issTotal,
        "Total Impostos":
          totais.icmsTotal +
          totais.pisTotal +
          totais.cofinsTotal +
          totais.irpjTotal +
          totais.csllTotal +
          totais.issTotal,
        "Lucro Líquido": totais.lucroLiquido,
        "Margem Líquida (%)": totais.margemLiquida,
        "Carga Tributária (%)": totais.cargaTributariaEfetiva,
      })

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dadosExcel)

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 12 }, // Mês
        { wch: 15 }, // Receita
        { wch: 12 }, // ICMS
        { wch: 12 }, // PIS
        { wch: 12 }, // COFINS
        { wch: 12 }, // IRPJ
        { wch: 12 }, // CSLL
        { wch: 12 }, // ISS
        { wch: 15 }, // Total Impostos
        { wch: 15 }, // Lucro Líquido
        { wch: 16 }, // Margem Líquida
        { wch: 18 }, // Carga Tributária
      ]
      ws["!cols"] = colWidths

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, `Relatório ${ano}`)

      // Gerar e baixar arquivo
      XLSX.writeFile(wb, `${nomeEmpresa}_Relatorio_${ano}.xlsx`)

      toast({
        title: "Exportação concluída",
        description: "O arquivo Excel foi baixado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao exportar Excel:", error)
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o arquivo Excel.",
        variant: "destructive",
      })
    }
  }

  const exportarPDF = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A exportação em PDF será implementada em breve.",
    })
    // TODO: Implementar exportação PDF com jsPDF
    // Pode incluir gráficos convertidos em imagens (canvas)
  }

  return (
    <div className="flex gap-2">
      <Button onClick={exportarExcel} variant="outline" size="sm">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>
      <Button onClick={exportarPDF} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  )
}
