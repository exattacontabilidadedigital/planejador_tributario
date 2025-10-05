"use client"

import { Button } from "@/components/ui/button"
import type { LinhaRelatorioAnual, TotaisRelatorio } from "@/types/relatorio"
import { Download, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

interface BotoesExportacaoProps {
  linhas: LinhaRelatorioAnual[]
  totais: TotaisRelatorio
  nomeEmpresa: string
  ano: number
  containerRef?: React.RefObject<HTMLDivElement>
}

export function BotoesExportacao({ linhas, totais, nomeEmpresa, ano, containerRef }: BotoesExportacaoProps) {
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

  const exportarPDFAvancado = async () => {
    if (linhas.length === 0) {
      toast({
        title: "Sem dados para exportar",
        description: "Crie cenários aprovados antes de exportar.",
        variant: "destructive",
      })
      return
    }

    if (!containerRef?.current) {
      // Fallback para versão simples se não houver container
      return exportarPDF()
    }

    try {
      toast({
        title: "Gerando PDF avançado...",
        description: "Capturando gráficos e gerando relatório completo.",
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Cabeçalho
      pdf.setFontSize(20)
      pdf.setFont(undefined, 'bold')
      pdf.text('Relatório Tributário Completo', pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 10
      pdf.setFontSize(14)
      pdf.text(`${nomeEmpresa} - ${ano}`, pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 10
      pdf.setFontSize(10)
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 20

      // Capturar gráficos se possível
      const graficos = containerRef.current.querySelectorAll('[data-testid*="recharts"], .recharts-wrapper, canvas')
      
      if (graficos.length > 0) {
        pdf.setFontSize(12)
        pdf.setFont(undefined, 'bold')
        pdf.text('Gráficos e Análises', 20, yPosition)
        yPosition += 15

        for (let i = 0; i < Math.min(graficos.length, 3); i++) {
          const grafico = graficos[i] as HTMLElement
          
          try {
            const canvas = await html2canvas(grafico, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff'
            })
            
            const imgData = canvas.toDataURL('image/png')
            const imgWidth = 160
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            
            if (yPosition + imgHeight > pageHeight - 30) {
              pdf.addPage()
              yPosition = 20
            }
            
            pdf.addImage(imgData, 'PNG', 25, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 15
          } catch (error) {
            console.warn(`Erro ao capturar gráfico ${i}:`, error)
          }
        }

        // Nova página para tabela
        pdf.addPage()
        yPosition = 20
      }

      // Tabela de dados (mesmo código da versão simples)
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.text('Demonstrativo Mensal', 20, yPosition)
      yPosition += 10

      // Cabeçalho da tabela
      pdf.setFontSize(8)
      const headers = ['Mês', 'Receita', 'ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'Total Imp.', 'Lucro Líq.']
      const colWidths = [15, 20, 15, 15, 15, 15, 15, 15, 20, 20]
      let xPosition = 20

      // Desenhar cabeçalho
      pdf.setFont(undefined, 'bold')
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition)
        xPosition += colWidths[index]
      })
      yPosition += 7

      // Linha separadora
      pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2)

      // Dados
      pdf.setFont(undefined, 'normal')
      linhas.forEach((linha) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = 20
        }

        xPosition = 20
        const values = [
          linha.mes,
          `R$ ${linha.receita.toLocaleString('pt-BR')}`,
          `R$ ${linha.icms.toLocaleString('pt-BR')}`,
          `R$ ${linha.pis.toLocaleString('pt-BR')}`,
          `R$ ${linha.cofins.toLocaleString('pt-BR')}`,
          `R$ ${linha.irpj.toLocaleString('pt-BR')}`,
          `R$ ${linha.csll.toLocaleString('pt-BR')}`,
          `R$ ${linha.iss.toLocaleString('pt-BR')}`,
          `R$ ${linha.totalImpostos.toLocaleString('pt-BR')}`,
          `R$ ${linha.lucroLiquido.toLocaleString('pt-BR')}`
        ]

        values.forEach((value, index) => {
          pdf.text(value, xPosition, yPosition)
          xPosition += colWidths[index]
        })
        yPosition += 6
      })

      // Linha separadora antes dos totais
      yPosition += 3
      pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2)

      // Totais
      pdf.setFont(undefined, 'bold')
      xPosition = 20
      const totalValues = [
        'TOTAL',
        `R$ ${totais.receitaBruta.toLocaleString('pt-BR')}`,
        `R$ ${totais.icmsTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.pisTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.cofinsTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.irpjTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.csllTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.issTotal.toLocaleString('pt-BR')}`,
        `R$ ${(totais.icmsTotal + totais.pisTotal + totais.cofinsTotal + totais.irpjTotal + totais.csllTotal + totais.issTotal).toLocaleString('pt-BR')}`,
        `R$ ${totais.lucroLiquido.toLocaleString('pt-BR')}`
      ]

      totalValues.forEach((value, index) => {
        pdf.text(value, xPosition, yPosition)
        xPosition += colWidths[index]
      })
      yPosition += 10

      // Resumo executivo
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = 20
      }

      yPosition += 10
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.text('Resumo Executivo', 20, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      const resumo = [
        `Receita Bruta Total: R$ ${totais.receitaBruta.toLocaleString('pt-BR')}`,
        `Total de Impostos: R$ ${(totais.icmsTotal + totais.pisTotal + totais.cofinsTotal + totais.irpjTotal + totais.csllTotal + totais.issTotal).toLocaleString('pt-BR')}`,
        `Lucro Líquido: R$ ${totais.lucroLiquido.toLocaleString('pt-BR')}`,
        `Margem Líquida: ${totais.margemLiquida.toFixed(2)}%`,
        `Carga Tributária Efetiva: ${totais.cargaTributariaEfetiva.toFixed(2)}%`
      ]

      resumo.forEach((linha) => {
        pdf.text(linha, 20, yPosition)
        yPosition += 7
      })

      // Rodapé
      pdf.setFontSize(8)
      pdf.text(`Relatório Tributário - ${nomeEmpresa}`, pageWidth - 80, pageHeight - 10)

      // Salvar PDF
      pdf.save(`${nomeEmpresa}_Relatorio_Completo_${ano}.pdf`)

      toast({
        title: "PDF completo gerado com sucesso",
        description: "O arquivo PDF com gráficos foi baixado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF completo:", error)
      toast({
        title: "Erro na geração do PDF",
        description: "Tentando versão simplificada...",
        variant: "destructive",
      })
      // Fallback para versão simples
      exportarPDF()
    }
  }

  const exportarPDF = async () => {
    if (linhas.length === 0) {
      toast({
        title: "Sem dados para exportar",
        description: "Crie cenários aprovados antes de exportar.",
        variant: "destructive",
      })
      return
    }

    try {
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto o relatório está sendo gerado.",
      })

      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Cabeçalho
      pdf.setFontSize(20)
      pdf.setFont(undefined, 'bold')
      pdf.text('Relatório Tributário', pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 10
      pdf.setFontSize(14)
      pdf.text(`${nomeEmpresa} - ${ano}`, pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 10
      pdf.setFontSize(10)
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 20

      // Tabela de dados
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.text('Demonstrativo Mensal', 20, yPosition)
      yPosition += 10

      // Cabeçalho da tabela
      pdf.setFontSize(8)
      const headers = ['Mês', 'Receita', 'ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'Total Imp.', 'Lucro Líq.']
      const colWidths = [15, 20, 15, 15, 15, 15, 15, 15, 20, 20]
      let xPosition = 20

      // Desenhar cabeçalho
      pdf.setFont(undefined, 'bold')
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition)
        xPosition += colWidths[index]
      })
      yPosition += 7

      // Linha separadora
      pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2)

      // Dados
      pdf.setFont(undefined, 'normal')
      linhas.forEach((linha) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = 20
        }

        xPosition = 20
        const values = [
          linha.mes,
          `R$ ${linha.receita.toLocaleString('pt-BR')}`,
          `R$ ${linha.icms.toLocaleString('pt-BR')}`,
          `R$ ${linha.pis.toLocaleString('pt-BR')}`,
          `R$ ${linha.cofins.toLocaleString('pt-BR')}`,
          `R$ ${linha.irpj.toLocaleString('pt-BR')}`,
          `R$ ${linha.csll.toLocaleString('pt-BR')}`,
          `R$ ${linha.iss.toLocaleString('pt-BR')}`,
          `R$ ${linha.totalImpostos.toLocaleString('pt-BR')}`,
          `R$ ${linha.lucroLiquido.toLocaleString('pt-BR')}`
        ]

        values.forEach((value, index) => {
          pdf.text(value, xPosition, yPosition)
          xPosition += colWidths[index]
        })
        yPosition += 6
      })

      // Linha separadora antes dos totais
      yPosition += 3
      pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2)

      // Totais
      pdf.setFont(undefined, 'bold')
      xPosition = 20
      const totalValues = [
        'TOTAL',
        `R$ ${totais.receitaBruta.toLocaleString('pt-BR')}`,
        `R$ ${totais.icmsTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.pisTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.cofinsTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.irpjTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.csllTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.issTotal.toLocaleString('pt-BR')}`,
        `R$ ${(totais.icmsTotal + totais.pisTotal + totais.cofinsTotal + totais.irpjTotal + totais.csllTotal + totais.issTotal).toLocaleString('pt-BR')}`,
        `R$ ${totais.lucroLiquido.toLocaleString('pt-BR')}`
      ]

      totalValues.forEach((value, index) => {
        pdf.text(value, xPosition, yPosition)
        xPosition += colWidths[index]
      })
      yPosition += 10

      // Resumo executivo
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = 20
      }

      yPosition += 10
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.text('Resumo Executivo', 20, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      const resumo = [
        `Receita Bruta Total: R$ ${totais.receitaBruta.toLocaleString('pt-BR')}`,
        `Total de Impostos: R$ ${(totais.icmsTotal + totais.pisTotal + totais.cofinsTotal + totais.irpjTotal + totais.csllTotal + totais.issTotal).toLocaleString('pt-BR')}`,
        `Lucro Líquido: R$ ${totais.lucroLiquido.toLocaleString('pt-BR')}`,
        `Margem Líquida: ${totais.margemLiquida.toFixed(2)}%`,
        `Carga Tributária Efetiva: ${totais.cargaTributariaEfetiva.toFixed(2)}%`
      ]

      resumo.forEach((linha) => {
        pdf.text(linha, 20, yPosition)
        yPosition += 7
      })

      // Rodapé
      pdf.setFontSize(8)
      pdf.text(`Relatório Tributário - ${nomeEmpresa}`, pageWidth - 80, pageHeight - 10)

      // Salvar PDF
      pdf.save(`${nomeEmpresa}_Relatorio_${ano}.pdf`)

      toast({
        title: "PDF gerado com sucesso",
        description: "O arquivo PDF foi baixado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        title: "Erro na geração do PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={exportarExcel} variant="outline" size="sm">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>
      <Button onClick={containerRef ? exportarPDFAvancado : exportarPDF} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  )
}
