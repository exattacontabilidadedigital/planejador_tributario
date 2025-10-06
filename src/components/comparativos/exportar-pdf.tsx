"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Download, FileText, Loader2 } from "lucide-react"
import type { ComparativoCompleto } from "@/types/comparativo-analise-completo"

interface ExportarPDFProps {
  comparativo: ComparativoCompleto
  trigger?: React.ReactNode
}

export function ExportarPDF({ comparativo, trigger }: ExportarPDFProps) {
  const { toast } = useToast()
  const [aberto, setAberto] = useState(false)
  const [exportando, setExportando] = useState(false)
  
  // Opções de export
  const [incluirResumo, setIncluirResumo] = useState(true)
  const [incluirGraficos, setIncluirGraficos] = useState(true)
  const [incluirTabelas, setIncluirTabelas] = useState(true)
  const [incluirInsights, setIncluirInsights] = useState(true)
  const [incluirDetalhes, setIncluirDetalhes] = useState(true)

  const handleExportar = async () => {
    setExportando(true)
    
    try {
      // Importação dinâmica do jsPDF para reduzir bundle size
      const { default: jsPDF } = await import('jspdf')
      await import('jspdf-autotable')
      
      const doc = new jsPDF()
      let yPos = 20

      // Configurações
      const margemEsquerda = 20
      const larguraPagina = doc.internal.pageSize.width
      const larguraUtil = larguraPagina - 40

      // Função auxiliar para adicionar nova página se necessário
      const verificarNovaPagina = (altura: number) => {
        if (yPos + altura > doc.internal.pageSize.height - 20) {
          doc.addPage()
          yPos = 20
        }
      }

      // Cabeçalho
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Análise Comparativa de Regimes Tributários', margemEsquerda, yPos)
      yPos += 10

      doc.setFontSize(16)
      doc.setFont('helvetica', 'normal')
      doc.text(comparativo.nome, margemEsquerda, yPos)
      yPos += 8

      if (comparativo.descricao) {
        doc.setFontSize(10)
        doc.setTextColor(100)
        const descricaoLinhas = doc.splitTextToSize(comparativo.descricao, larguraUtil)
        doc.text(descricaoLinhas, margemEsquerda, yPos)
        yPos += descricaoLinhas.length * 5 + 5
      }

      doc.setTextColor(0)
      doc.setFontSize(9)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margemEsquerda, yPos)
      yPos += 10

      // Linha separadora
      doc.setDrawColor(200)
      doc.line(margemEsquerda, yPos, larguraPagina - margemEsquerda, yPos)
      yPos += 10

      // 1. RESUMO EXECUTIVO
      if (incluirResumo) {
        verificarNovaPagina(40)
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Resumo Executivo', margemEsquerda, yPos)
        yPos += 8

        const analise = (comparativo.resultados as any)?.analise
        
        // Regime vencedor
        if (analise?.regimeVencedor) {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(`Regime Recomendado: ${getNomeRegime(analise.regimeVencedor.regime)}`, margemEsquerda + 5, yPos)
          yPos += 6
          
          if (analise.regimeVencedor.economia > 0) {
            doc.text(`Economia Estimada: R$ ${analise.regimeVencedor.economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margemEsquerda + 5, yPos)
            yPos += 6
          }
          
          if (analise.regimeVencedor.percentualEconomia > 0) {
            doc.text(`Percentual de Economia: ${analise.regimeVencedor.percentualEconomia.toFixed(2)}%`, margemEsquerda + 5, yPos)
            yPos += 6
          }
        }

        yPos += 5
      }

      // 2. INSIGHTS
      if (incluirInsights && (comparativo.resultados as any)?.analise?.insights) {
        verificarNovaPagina(50)
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Principais Insights', margemEsquerda, yPos)
        yPos += 8

        const insights = (comparativo.resultados as any).analise.insights
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')

        const adicionarInsight = (titulo: string, conteudo: string) => {
          verificarNovaPagina(15)
          doc.setFont('helvetica', 'bold')
          doc.text(`• ${titulo}`, margemEsquerda + 5, yPos)
          yPos += 5
          doc.setFont('helvetica', 'normal')
          const linhas = doc.splitTextToSize(conteudo, larguraUtil - 10)
          doc.text(linhas, margemEsquerda + 10, yPos)
          yPos += linhas.length * 4 + 3
        }

        if (insights.principal) adicionarInsight('Principal', insights.principal)
        if (insights.economia) adicionarInsight('Economia', insights.economia)
        if (insights.riscos) adicionarInsight('Riscos', insights.riscos)
        if (insights.oportunidades) adicionarInsight('Oportunidades', insights.oportunidades)

        yPos += 5
      }

      // 3. TABELAS
      if (incluirTabelas) {
        verificarNovaPagina(60)
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Comparativo Detalhado', margemEsquerda, yPos)
        yPos += 10

        const lucroReal = (comparativo.resultados as any)?.lucroReal
        const lucroPresumido = (comparativo.resultados as any)?.lucroPresumido
        const simplesNacional = (comparativo.resultados as any)?.simplesNacional
        
        const dadosTabela: any[] = []
        
        if (lucroReal) {
          dadosTabela.push([
            'Lucro Real',
            `R$ ${lucroReal.receitaTotal?.toLocaleString('pt-BR') || '0'}`,
            `R$ ${lucroReal.totalImpostos?.toLocaleString('pt-BR') || '0'}`,
            `${lucroReal.cargaTributaria?.toFixed(2) || '0'}%`
          ])
        }
        
        if (lucroPresumido) {
          dadosTabela.push([
            'Lucro Presumido',
            `R$ ${lucroPresumido.receitaTotal?.toLocaleString('pt-BR') || '0'}`,
            `R$ ${lucroPresumido.totalImpostos?.toLocaleString('pt-BR') || '0'}`,
            `${lucroPresumido.cargaTributaria?.toFixed(2) || '0'}%`
          ])
        }
        
        if (simplesNacional) {
          dadosTabela.push([
            'Simples Nacional',
            `R$ ${simplesNacional.receitaTotal?.toLocaleString('pt-BR') || '0'}`,
            `R$ ${simplesNacional.totalImpostos?.toLocaleString('pt-BR') || '0'}`,
            `${simplesNacional.cargaTributaria?.toFixed(2) || '0'}%`
          ])
        }

        if (dadosTabela.length > 0) {
          ;(doc as any).autoTable({
            startY: yPos,
            head: [['Regime', 'Receita Total', 'Total Impostos', 'Carga Tributária']],
            body: dadosTabela,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            margin: { left: margemEsquerda }
          })

          yPos = (doc as any).lastAutoTable.finalY + 10
        }
      }

      // 4. DETALHES POR REGIME
      if (incluirDetalhes) {
        const regimes = [
          { nome: 'Lucro Real', dados: (comparativo.resultados as any)?.lucroReal },
          { nome: 'Lucro Presumido', dados: (comparativo.resultados as any)?.lucroPresumido },
          { nome: 'Simples Nacional', dados: (comparativo.resultados as any)?.simplesNacional }
        ].filter(r => r.dados)

        for (const regime of regimes) {
          verificarNovaPagina(80)
          
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text(regime.nome, margemEsquerda, yPos)
          yPos += 8

          const impostos = regime.dados?.impostosPorTipo
          if (impostos) {
            const dadosImpostos: any[] = []
            
            if (impostos.icms > 0) dadosImpostos.push(['ICMS', `R$ ${impostos.icms.toLocaleString('pt-BR')}`])
            if (impostos.pis > 0) dadosImpostos.push(['PIS', `R$ ${impostos.pis.toLocaleString('pt-BR')}`])
            if (impostos.cofins > 0) dadosImpostos.push(['COFINS', `R$ ${impostos.cofins.toLocaleString('pt-BR')}`])
            if (impostos.irpj > 0) dadosImpostos.push(['IRPJ', `R$ ${impostos.irpj.toLocaleString('pt-BR')}`])
            if (impostos.csll > 0) dadosImpostos.push(['CSLL', `R$ ${impostos.csll.toLocaleString('pt-BR')}`])
            if (impostos.iss > 0) dadosImpostos.push(['ISS', `R$ ${impostos.iss.toLocaleString('pt-BR')}`])
            if (impostos.cpp > 0) dadosImpostos.push(['CPP', `R$ ${impostos.cpp.toLocaleString('pt-BR')}`])
            if (impostos.outros > 0) dadosImpostos.push(['Outros', `R$ ${impostos.outros.toLocaleString('pt-BR')}`])

            if (dadosImpostos.length > 0) {
              ;(doc as any).autoTable({
                startY: yPos,
                head: [['Tributo', 'Valor']],
                body: dadosImpostos,
                theme: 'plain',
                styles: { fontSize: 9 },
                margin: { left: margemEsquerda + 5 }
              })

              yPos = (doc as any).lastAutoTable.finalY + 10
            }
          }
        }
      }

      // Rodapé em todas as páginas
      const totalPaginas = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Página ${i} de ${totalPaginas}`,
          larguraPagina / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
        doc.text(
          'Gerado por Tax Planner',
          larguraPagina - margemEsquerda,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        )
      }

      // Salvar PDF
      const nomeArquivo = `comparativo-${comparativo.nome.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(nomeArquivo)

      toast({
        title: "PDF exportado com sucesso!",
        description: `O arquivo ${nomeArquivo} foi baixado`
      })

      setAberto(false)

    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      toast({
        title: "Erro ao exportar PDF",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive"
      })
    } finally {
      setExportando(false)
    }
  }

  const getNomeRegime = (regime: string): string => {
    const nomes: Record<string, string> = {
      'lucro_real': 'Lucro Real',
      'lucro_presumido': 'Lucro Presumido',
      'simples_nacional': 'Simples Nacional'
    }
    return nomes[regime] || regime
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar para PDF</DialogTitle>
          <DialogDescription>
            Selecione quais seções incluir no relatório PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="resumo"
              checked={incluirResumo}
              onCheckedChange={(checked) => setIncluirResumo(checked as boolean)}
            />
            <Label htmlFor="resumo" className="text-sm font-normal cursor-pointer">
              Resumo Executivo
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="insights"
              checked={incluirInsights}
              onCheckedChange={(checked) => setIncluirInsights(checked as boolean)}
            />
            <Label htmlFor="insights" className="text-sm font-normal cursor-pointer">
              Principais Insights
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="tabelas"
              checked={incluirTabelas}
              onCheckedChange={(checked) => setIncluirTabelas(checked as boolean)}
            />
            <Label htmlFor="tabelas" className="text-sm font-normal cursor-pointer">
              Tabelas Comparativas
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="detalhes"
              checked={incluirDetalhes}
              onCheckedChange={(checked) => setIncluirDetalhes(checked as boolean)}
            />
            <Label htmlFor="detalhes" className="text-sm font-normal cursor-pointer">
              Detalhamento por Regime
            </Label>
          </div>

          <div className="flex items-center space-x-2 opacity-50">
            <Checkbox
              id="graficos"
              checked={incluirGraficos}
              onCheckedChange={(checked) => setIncluirGraficos(checked as boolean)}
              disabled
            />
            <Label htmlFor="graficos" className="text-sm font-normal cursor-not-allowed">
              Gráficos (em breve)
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAberto(false)} disabled={exportando}>
            Cancelar
          </Button>
          <Button onClick={handleExportar} disabled={exportando}>
            {exportando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
