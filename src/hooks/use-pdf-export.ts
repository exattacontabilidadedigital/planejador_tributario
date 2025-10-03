import { useMemo } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useTaxStore } from "@/hooks/use-tax-store"
import { useMemoriaICMS } from "@/hooks/use-memoria-icms"
import { useMemoriaPISCOFINS } from "@/hooks/use-memoria-pis-cofins"
import { useMemoriaIRPJCSLL } from "@/hooks/use-memoria-irpj-csll"
import { useDRECalculation } from "@/hooks/use-dre-calculation"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export type ExportType = "icms" | "pis-cofins" | "irpj-csll" | "dre" | "completo"

export function usePDFExport() {
  const { config } = useTaxStore()
  const memoriaICMS = useMemoriaICMS(config)
  const memoriaPISCOFINS = useMemoriaPISCOFINS(config)
  const memoriaIRPJCSLL = useMemoriaIRPJCSLL(config)
  const dre = useDRECalculation(config)

  const exportICMS = useMemo(() => {
    return () => {
      const doc = new jsPDF()
      
      // Cabeçalho
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("Memória de Cálculo - ICMS", 14, 20)
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28)
      doc.text(`Receita Bruta: ${formatCurrency(config.receitaBruta)}`, 14, 34)
      
      // Débitos
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Débitos de ICMS", 14, 45)
      
      autoTable(doc, {
        startY: 50,
        head: [["Descrição", "Base de Cálculo", "Alíquota", "Valor"]],
        body: [
          [
            "Vendas Internas",
            formatCurrency(memoriaICMS.vendasInternas.base),
            formatPercentage(memoriaICMS.vendasInternas.aliquota),
            formatCurrency(memoriaICMS.vendasInternas.valor),
          ],
          [
            "Vendas Interestaduais",
            formatCurrency(memoriaICMS.vendasInterestaduais.base),
            formatPercentage(memoriaICMS.vendasInterestaduais.aliquota),
            formatCurrency(memoriaICMS.vendasInterestaduais.valor),
          ],
          [
            "DIFAL (Consumidor Final)",
            formatCurrency(memoriaICMS.difal.base),
            formatPercentage(memoriaICMS.difal.aliquota),
            formatCurrency(memoriaICMS.difal.valor),
          ],
          [
            "FCP",
            formatCurrency(memoriaICMS.fcp.base),
            formatPercentage(memoriaICMS.fcp.aliquota),
            formatCurrency(memoriaICMS.fcp.valor),
          ],
        ],
        foot: [["Total de Débitos", "", "", formatCurrency(memoriaICMS.totalDebitos)]],
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68] },
        footStyles: { fillColor: [254, 226, 226], textColor: [220, 38, 38], fontStyle: "bold" },
      })
      
      // Créditos
      const finalY = (doc as any).lastAutoTable.finalY || 100
      
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Créditos de ICMS", 14, finalY + 10)
      
      autoTable(doc, {
        startY: finalY + 15,
        head: [["Descrição", "Base de Cálculo", "Alíquota", "Valor"]],
        body: [
          [
            "Compras Internas",
            formatCurrency(memoriaICMS.creditoComprasInternas.base),
            formatPercentage(memoriaICMS.creditoComprasInternas.aliquota),
            formatCurrency(memoriaICMS.creditoComprasInternas.valor),
          ],
          [
            "Compras Interestaduais",
            formatCurrency(memoriaICMS.creditoComprasInterestaduais.base),
            formatPercentage(memoriaICMS.creditoComprasInterestaduais.aliquota),
            formatCurrency(memoriaICMS.creditoComprasInterestaduais.valor),
          ],
          ["Estoque Inicial", "-", "-", formatCurrency(memoriaICMS.creditoEstoqueInicial.valor)],
          ["Ativo Imobilizado", "-", "-", formatCurrency(memoriaICMS.creditoAtivoImobilizado.valor)],
          ["Energia Elétrica", "-", "-", formatCurrency(memoriaICMS.creditoEnergia.valor)],
          ["ST na Entrada", "-", "-", formatCurrency(memoriaICMS.creditoST.valor)],
          ["Outros Créditos", "-", "-", formatCurrency(memoriaICMS.outrosCreditos.valor)],
        ],
        foot: [["Total de Créditos", "", "", formatCurrency(memoriaICMS.totalCreditos)]],
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
        footStyles: { fillColor: [220, 252, 231], textColor: [22, 163, 74], fontStyle: "bold" },
      })
      
      // Resultado
      const finalY2 = (doc as any).lastAutoTable.finalY || 180
      
      autoTable(doc, {
        startY: finalY2 + 5,
        body: [
          ["Total de Débitos", formatCurrency(memoriaICMS.totalDebitos)],
          ["(-) Total de Créditos", `(${formatCurrency(memoriaICMS.totalCreditos)})`],
          ["ICMS A PAGAR", formatCurrency(memoriaICMS.icmsAPagar)],
        ],
        theme: "plain",
        styles: { fontSize: 11, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 140 },
          1: { halign: "right", cellWidth: 40 },
        },
      })
      
      doc.save("memoria-icms.pdf")
      
      toast({
        title: "PDF Exportado com Sucesso!",
        description: "Memória de Cálculo ICMS salva como memoria-icms.pdf",
        variant: "success",
      })
    }
  }, [config, memoriaICMS])

  const exportPISCOFINS = useMemo(() => {
    return () => {
      const doc = new jsPDF()
      
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("Memória de Cálculo - PIS/COFINS", 14, 20)
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28)
      doc.text(`Receita Bruta: ${formatCurrency(config.receitaBruta)}`, 14, 34)
      
      // PIS
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("PIS (Regime Não Cumulativo)", 14, 45)
      
      autoTable(doc, {
        startY: 50,
        head: [["Descrição", "Base", "Alíquota", "Valor"]],
        body: [
          [
            "Débito PIS",
            formatCurrency(memoriaPISCOFINS.debitoPIS.base),
            formatPercentage(memoriaPISCOFINS.debitoPIS.aliquota),
            formatCurrency(memoriaPISCOFINS.debitoPIS.valor),
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11] },
      })
      
      const finalY = (doc as any).lastAutoTable.finalY || 70
      
      // Montar linhas de créditos PIS dinamicamente
      const creditosPISBody = [
        ["Compras", formatCurrency(memoriaPISCOFINS.creditoPISCompras.base), formatPercentage(memoriaPISCOFINS.creditoPISCompras.aliquota), formatCurrency(memoriaPISCOFINS.creditoPISCompras.valor)],
        // Créditos sobre despesas dinâmicas
        ...(memoriaPISCOFINS.despesasComCredito || []).map(despesa => [
          despesa.descricao,
          formatCurrency(despesa.valor),
          formatPercentage(memoriaPISCOFINS.creditoPISDespesas.aliquota),
          formatCurrency((despesa.valor * memoriaPISCOFINS.creditoPISDespesas.aliquota) / 100)
        ])
      ]
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Créditos PIS", "Base", "Alíquota", "Valor"]],
        body: creditosPISBody,
        foot: [["PIS A PAGAR", "", "", formatCurrency(memoriaPISCOFINS.pisAPagar)]],
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
        footStyles: { fillColor: [254, 243, 199], textColor: [217, 119, 6], fontStyle: "bold" },
      })
      
      doc.save("memoria-pis-cofins.pdf")
      
      toast({
        title: "PDF Exportado com Sucesso!",
        description: "Memória de Cálculo PIS/COFINS salva como memoria-pis-cofins.pdf",
        variant: "success",
      })
    }
  }, [config, memoriaPISCOFINS])

  const exportDRE = useMemo(() => {
    return () => {
      const doc = new jsPDF()
      
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("DRE - Demonstração do Resultado", 14, 20)
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28)
      
      autoTable(doc, {
        startY: 35,
        head: [["Descrição", "Valor", "% Receita"]],
        body: [
          ["RECEITA BRUTA", formatCurrency(dre.receitaBrutaVendas), "100,00%"],
          ["(-) ICMS", `(${formatCurrency(dre.deducoes.icms)})`, formatPercentage((dre.deducoes.icms / dre.receitaBrutaVendas) * 100)],
          ["(-) PIS", `(${formatCurrency(dre.deducoes.pis)})`, formatPercentage((dre.deducoes.pis / dre.receitaBrutaVendas) * 100)],
          ["(-) COFINS", `(${formatCurrency(dre.deducoes.cofins)})`, formatPercentage((dre.deducoes.cofins / dre.receitaBrutaVendas) * 100)],
          ["(-) ISS", `(${formatCurrency(dre.deducoes.iss)})`, formatPercentage((dre.deducoes.iss / dre.receitaBrutaVendas) * 100)],
          ["RECEITA LÍQUIDA", formatCurrency(dre.receitaLiquida), formatPercentage((dre.receitaLiquida / dre.receitaBrutaVendas) * 100)],
          ["(-) CMV", `(${formatCurrency(dre.cmv)})`, formatPercentage((dre.cmv / dre.receitaBrutaVendas) * 100)],
          ["LUCRO BRUTO", formatCurrency(dre.lucroBruto), formatPercentage(dre.margemBruta)],
          ["(-) Despesas Operacionais", `(${formatCurrency(dre.despesasOperacionais.total)})`, formatPercentage((dre.despesasOperacionais.total / dre.receitaBrutaVendas) * 100)],
          ["LUCRO ANTES IRPJ/CSLL", formatCurrency(dre.lucroAntesIRCSLL), formatPercentage((dre.lucroAntesIRCSLL / dre.receitaBrutaVendas) * 100)],
          ["(-) IRPJ", `(${formatCurrency(dre.impostos.irpj)})`, formatPercentage((dre.impostos.irpj / dre.receitaBrutaVendas) * 100)],
          ["(-) CSLL", `(${formatCurrency(dre.impostos.csll)})`, formatPercentage((dre.impostos.csll / dre.receitaBrutaVendas) * 100)],
          ["LUCRO LÍQUIDO", formatCurrency(dre.lucroLiquido), formatPercentage(dre.margemLiquida)],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      })
      
      doc.save("dre.pdf")
      
      toast({
        title: "PDF Exportado com Sucesso!",
        description: "DRE salva como dre.pdf",
        variant: "success",
      })
    }
  }, [config, dre])

  return {
    exportICMS,
    exportPISCOFINS,
    exportDRE,
  }
}
