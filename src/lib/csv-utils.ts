import type { DespesaItem, DespesaCredito } from "@/types"

/**
 * Utilitários para manipulação de CSV de despesas PIS/COFINS
 */

// Template CSV para despesas
const CSV_HEADERS = ["descricao", "valor", "tipo", "categoria"] as const

/**
 * Gera um arquivo CSV modelo para download
 */
export function gerarModeloCSV(credito: DespesaCredito): string {
  const headers = CSV_HEADERS.join(";")
  
  // Exemplos conforme o tipo (COM ou SEM crédito) - FORMATO BRASILEIRO
  const exemplos = credito === "com-credito" 
    ? [
        "Energia Elétrica;15.000,00;despesa;Utilidades",
        "Aluguel Comercial;25.000,00;despesa;Ocupação",
        "Frete sobre Compras;8.000,00;custo;Logística",
        "Combustível Veículos Empresa;5.000,00;despesa;Transporte",
        "Depreciação Máquinas;12.000,00;custo;Ativo Imobilizado",
      ]
    : [
        "Salários e Encargos;80.000,00;despesa;Pessoal",
        "Vale Alimentação;15.000,00;despesa;Benefícios",
        "Combustível Veículo Passeio;3.000,00;despesa;Transporte",
        "Material de Escritório;2.000,00;despesa;Administrativo",
        "Serviços Profissionais PF;5.000,00;despesa;Terceiros",
      ]
  
  return `${headers}\n${exemplos.join("\n")}`
}

/**
 * Baixa o arquivo CSV modelo com UTF-8 BOM
 */
export function baixarModeloCSV(credito: DespesaCredito): void {
  const csv = gerarModeloCSV(credito)
  
  // Adiciona BOM UTF-8 para garantir compatibilidade com Excel
  const BOM = '\uFEFF'
  const csvComBOM = BOM + csv
  
  const blob = new Blob([csvComBOM], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  
  const fileName = credito === "com-credito" 
    ? "modelo-despesas-com-credito.csv"
    : "modelo-despesas-sem-credito.csv"
  
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  
  // Cleanup
  URL.revokeObjectURL(link.href)
}

/**
 * Converte valor do formato brasileiro (1.500,00) ou internacional (1500.00) para número
 */
function parseValorBR(valorStr: string): number {
  // Remove espaços e símbolo R$
  let valor = valorStr.trim()
    .replace(/R\$/g, '')  // Remove R$
    .replace(/\s+/g, '')  // Remove todos os espaços
  
  // Detecta formato brasileiro: 1.500,00 ou 1500,00
  if (valor.includes(',')) {
    // Remove pontos de milhar e substitui vírgula por ponto
    valor = valor.replace(/\./g, '').replace(',', '.')
  }
  // Formato internacional: 1,500.00 ou 1500.00
  else if (valor.includes('.')) {
    // Remove vírgulas de milhar (se houver)
    valor = valor.replace(/,/g, '')
  }
  
  return parseFloat(valor)
}

/**
 * Parseia arquivo CSV e retorna array de despesas
 */
export function parseCSV(
  csvContent: string,
  credito: DespesaCredito
): { sucesso: DespesaItem[]; erros: string[] } {
  // Remove BOM e normaliza quebras de linha
  let content = csvContent.trim()
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.substring(1)
  }
  
  // Split por quebra de linha e remove espaços no início/fim de cada linha
  const linhas = content.split(/\r?\n/).map(linha => linha.trim())
  const sucesso: DespesaItem[] = []
  const erros: string[] = []
  
  // Valida se tem header
  if (linhas.length < 2) {
    erros.push("Arquivo CSV vazio ou sem dados")
    return { sucesso, erros }
  }
  
  // Pula header (primeira linha)
  const dados = linhas.slice(1)
  
  // Timestamp base para IDs únicos
  const baseTimestamp = Date.now()
  
  dados.forEach((linha, index) => {
    const numeroLinha = index + 2 // +2 porque pulamos header e index começa em 0
    
    // Pula linhas vazias
    if (!linha) return
    
    const colunas = linha.split(";").map(col => col.trim())
    
    // Valida número de colunas
    if (colunas.length < 3) {
      erros.push(`Linha ${numeroLinha}: Formato inválido (mínimo 3 colunas)`)
      return
    }
    
    const [descricao, valorStr, tipo, categoria = ""] = colunas
    
    // Valida descrição
    if (!descricao) {
      erros.push(`Linha ${numeroLinha}: Descrição obrigatória`)
      return
    }
    
    // Valida e converte valor (aceita formato BR e internacional)
    const valor = parseValorBR(valorStr)
    if (isNaN(valor) || valor <= 0) {
      erros.push(`Linha ${numeroLinha}: Valor inválido "${valorStr}"`)
      return
    }
    
    // Valida tipo
    if (tipo !== "custo" && tipo !== "despesa") {
      erros.push(`Linha ${numeroLinha}: Tipo deve ser "custo" ou "despesa", recebido "${tipo}"`)
      return
    }
    
    // Cria despesa com ID único (timestamp + contador)
    sucesso.push({
      id: `import-${baseTimestamp}-${index}`,
      descricao,
      valor,
      tipo: tipo as "custo" | "despesa",
      credito,
      categoria: categoria || undefined,
    })
  })
  
  return { sucesso, erros }
}

/**
 * Lê arquivo CSV do input file com múltiplas tentativas de encoding
 */
export function lerArquivoCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const bytes = new Uint8Array(arrayBuffer)
      
      // Tenta decodificar com diferentes encodings
      let content = ''
      
      // 1. Tenta UTF-8
      try {
        const decoderUTF8 = new TextDecoder('utf-8', { fatal: true })
        content = decoderUTF8.decode(bytes)
      } catch {
        // 2. Se falhar, tenta ISO-8859-1 (Latin1)
        try {
          const decoderLatin1 = new TextDecoder('iso-8859-1')
          content = decoderLatin1.decode(bytes)
        } catch {
          // 3. Se falhar, tenta Windows-1252
          try {
            const decoderWin = new TextDecoder('windows-1252')
            content = decoderWin.decode(bytes)
          } catch {
            // 4. Último recurso: força UTF-8 não-fatal
            const decoderUTF8NonFatal = new TextDecoder('utf-8', { fatal: false })
            content = decoderUTF8NonFatal.decode(bytes)
          }
        }
      }
      
      // Remove BOM (Byte Order Mark) se presente
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.substring(1)
      }
      
      resolve(content)
    }
    
    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"))
    }
    
    // Lê como ArrayBuffer para ter controle total do encoding
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Valida extensão do arquivo
 */
export function validarArquivoCSV(file: File): string | null {
  const extensoesValidas = [".csv", ".txt"]
  const extensao = file.name.toLowerCase().slice(file.name.lastIndexOf("."))
  
  if (!extensoesValidas.includes(extensao)) {
    return "Arquivo deve ter extensão .csv ou .txt"
  }
  
  // Valida tamanho (máx 1MB)
  const maxSize = 1024 * 1024 // 1MB
  if (file.size > maxSize) {
    return "Arquivo muito grande (máximo 1MB)"
  }
  
  return null
}

/**
 * Formata número para formato brasileiro (1.500,00)
 */
function formatarValorBR(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Exporta despesas existentes para CSV (formato brasileiro com UTF-8 BOM)
 */
export function exportarDespesasCSV(despesas: DespesaItem[], credito: DespesaCredito): void {
  if (despesas.length === 0) {
    return
  }
  
  const headers = CSV_HEADERS.join(";")
  const linhas = despesas.map(d => 
    `${d.descricao};${formatarValorBR(d.valor)};${d.tipo};${d.categoria || ""}`
  )
  
  const csv = `${headers}\n${linhas.join("\n")}`
  
  // Adiciona BOM UTF-8 para garantir compatibilidade com Excel
  const BOM = '\uFEFF'
  const csvComBOM = BOM + csv
  
  const blob = new Blob([csvComBOM], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  
  const fileName = credito === "com-credito"
    ? "despesas-com-credito.csv"
    : "despesas-sem-credito.csv"
  
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  
  URL.revokeObjectURL(link.href)
}
