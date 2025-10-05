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
      const margin = 15
      let yPosition = margin

      // Função para adicionar nova página se necessário
      const checkPageBreak = (neededSpace: number) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
          return true
        }
        return false
      }

      // === CABEÇALHO ===
      pdf.setFontSize(24)
      pdf.setFont(undefined, 'bold')
      pdf.text('Relatórios Tributários', pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 12
      pdf.setFontSize(16)
      pdf.setFont(undefined, 'normal')
      pdf.text(`${nomeEmpresa}`, pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 8
      pdf.setFontSize(12)
      pdf.text(`Ano: ${ano} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' })
      
      yPosition += 20

      // === CARDS DE RESUMO (4 cards em linha) ===
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Resumo Executivo', margin, yPosition)
      yPosition += 12

      const cardWidth = (pageWidth - 2 * margin - 15) / 4 // 4 cards com espaçamento
      const cardHeight = 25
      
      // Calcular valores dos cards
      const totalImpostos = totais.icmsTotal + totais.pisTotal + totais.cofinsTotal + totais.irpjTotal + totais.csllTotal + totais.issTotal

      const cards = [
        {
          title: 'Receita Total',
          value: `R$ ${totais.receitaBruta.toLocaleString('pt-BR')}`,
          subtitle: `${linhas.length} ${linhas.length === 1 ? 'mês' : 'meses'} consolidados`
        },
        {
          title: 'Total Impostos',
          value: `R$ ${totalImpostos.toLocaleString('pt-BR')}`,
          subtitle: `Carga: ${totais.cargaTributariaEfetiva.toFixed(2)}%`
        },
        {
          title: 'Lucro Líquido',
          value: `R$ ${totais.lucroLiquido.toLocaleString('pt-BR')}`,
          subtitle: `Margem: ${totais.margemLiquida.toFixed(2)}%`
        },
        {
          title: 'Margem Bruta',
          value: `${totais.margemBruta.toFixed(2)}%`,
          subtitle: `Lucro Bruto: R$ ${totais.lucroBruto.toLocaleString('pt-BR')}`
        }
      ]

      // Desenhar os cards
      cards.forEach((card, index) => {
        const x = margin + (cardWidth + 5) * index
        
        // Fundo do card (cinza claro)
        pdf.setFillColor(248, 250, 252)
        pdf.rect(x, yPosition - 2, cardWidth, cardHeight, 'F')
        
        // Borda do card
        pdf.setDrawColor(229, 231, 235)
        pdf.rect(x, yPosition - 2, cardWidth, cardHeight, 'S')
        
        // Título do card
        pdf.setFontSize(8)
        pdf.setFont(undefined, 'normal')
        pdf.setTextColor(107, 114, 128)
        pdf.text(card.title, x + 2, yPosition + 3)
        
        // Valor principal
        pdf.setFontSize(12)
        pdf.setFont(undefined, 'bold')
        pdf.setTextColor(17, 24, 39)
        pdf.text(card.value, x + 2, yPosition + 10)
        
        // Subtítulo
        pdf.setFontSize(7)
        pdf.setFont(undefined, 'normal')
        pdf.setTextColor(107, 114, 128)
        pdf.text(card.subtitle, x + 2, yPosition + 17)
      })

      yPosition += cardHeight + 15

      // === GRÁFICOS LADO A LADO ===
      checkPageBreak(80)
      
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(17, 24, 39)
      pdf.text('Análises Gráficas', margin, yPosition)
      yPosition += 12

      // Capturar os dois primeiros gráficos (Evolução e Composição)
      const graficos = containerRef.current.querySelectorAll('[class*="recharts"], .recharts-wrapper')
      
      if (graficos.length >= 2) {
        const graficoWidth = (pageWidth - 2 * margin - 10) / 2
        const graficoHeight = 60

        try {
          // Gráfico 1 - Evolução Mensal (esquerda)
          const canvas1 = await html2canvas(graficos[0] as HTMLElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          })
          
          const imgData1 = canvas1.toDataURL('image/png')
          pdf.addImage(imgData1, 'PNG', margin, yPosition, graficoWidth, graficoHeight)
          
          // Título do gráfico 1
          pdf.setFontSize(10)
          pdf.setFont(undefined, 'bold')
          pdf.text('Evolução Mensal', margin, yPosition - 3)
          
          // Gráfico 2 - Composição de Impostos (direita)
          const canvas2 = await html2canvas(graficos[1] as HTMLElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          })
          
          const imgData2 = canvas2.toDataURL('image/png')
          pdf.addImage(imgData2, 'PNG', margin + graficoWidth + 10, yPosition, graficoWidth, graficoHeight)
          
          // Título do gráfico 2
          pdf.text('Composição de Impostos', margin + graficoWidth + 10, yPosition - 3)
          
          yPosition += graficoHeight + 15
          
        } catch (error) {
          console.warn('Erro ao capturar gráficos lado a lado:', error)
          yPosition += 15
        }
      }

      // === GRÁFICO DE EVOLUÇÃO FINANCEIRA (largura completa) ===
      checkPageBreak(70)
      
      if (graficos.length >= 3) {
        try {
          const canvas3 = await html2canvas(graficos[2] as HTMLElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          })
          
          const imgData3 = canvas3.toDataURL('image/png')
          const graficoWidthFull = pageWidth - 2 * margin
          const graficoHeightFull = 55
          
          // Título
          pdf.setFontSize(10)
          pdf.setFont(undefined, 'bold')
          pdf.text('Evolução Financeira Mensal', margin, yPosition)
          yPosition += 5
          
          pdf.addImage(imgData3, 'PNG', margin, yPosition, graficoWidthFull, graficoHeightFull)
          yPosition += graficoHeightFull + 20
          
        } catch (error) {
          console.warn('Erro ao capturar gráfico de evolução financeira:', error)
          yPosition += 15
        }
      }

      // === NOVA PÁGINA PARA A TABELA ===
      pdf.addPage()
      yPosition = margin

      // === DEMONSTRATIVO CONSOLIDADO ===
      pdf.setFontSize(16)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(17, 24, 39)
      pdf.text(`Demonstrativo Consolidado - ${ano}`, margin, yPosition)
      yPosition += 8

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(107, 114, 128)
      pdf.text('Tabela detalhada com todos os valores mensais e totalizações', margin, yPosition)
      yPosition += 15

      // Cabeçalho da tabela com fundo
      pdf.setFontSize(8)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(255, 255, 255)
      
      const headers = ['Mês', 'Receita', 'ICMS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'Total Imp.', 'Lucro Líq.']
      const colWidths = [18, 22, 16, 14, 16, 14, 14, 14, 22, 22]
      let xPosition = margin

      // Fundo do cabeçalho
      pdf.setFillColor(59, 130, 246) // Azul
      pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 8, 'F')

      // Texto do cabeçalho
      headers.forEach((header, index) => {
        pdf.text(header, xPosition + 1, yPosition + 2)
        xPosition += colWidths[index]
      })
      yPosition += 10

      // Linhas de dados com alternância de cores
      pdf.setFont(undefined, 'normal')
      linhas.forEach((linha, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = margin + 15
        }

        // Fundo alternado
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251)
          pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 8, 'F')
        }

        xPosition = margin
        pdf.setTextColor(17, 24, 39)
        
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
          pdf.text(value, xPosition + 1, yPosition + 2)
          xPosition += colWidths[index]
        })
        yPosition += 8
      })

      // Linha de separação antes dos totais
      yPosition += 3
      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 5

      // Linha de totais com destaque
      pdf.setFillColor(243, 244, 246)
      pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 8, 'F')
      
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(17, 24, 39)
      xPosition = margin
      
      const totalValues = [
        'TOTAL',
        `R$ ${totais.receitaBruta.toLocaleString('pt-BR')}`,
        `R$ ${totais.icmsTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.pisTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.cofinsTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.irpjTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.csllTotal.toLocaleString('pt-BR')}`,
        `R$ ${totais.issTotal.toLocaleString('pt-BR')}`,
        `R$ ${totalImpostos.toLocaleString('pt-BR')}`,
        `R$ ${totais.lucroLiquido.toLocaleString('pt-BR')}`
      ]

      totalValues.forEach((value, index) => {
        pdf.text(value, xPosition + 1, yPosition + 2)
        xPosition += colWidths[index]
      })

      // Rodapé
      pdf.setFontSize(8)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(107, 114, 128)
      pdf.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Salvar PDF
      pdf.save(`${nomeEmpresa}_Relatorio_Completo_${ano}.pdf`)

      toast({
        title: "PDF estilizado gerado com sucesso",
        description: "O relatório foi gerado seguindo o layout da página.",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF estilizado:", error)
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
