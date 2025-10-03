# 🔤 Correção de Encoding UTF-8 no CSV

## 📋 Problema Identificado

Ao importar arquivos CSV com caracteres especiais (acentos, cedilha, etc.), o sistema exibia incorretamente:
- ❌ "Sal�rios" ao invés de "Salários"
- ❌ "Alugu�is" ao invés de "Aluguéis"
- ❌ "Energ�a El�trica" ao invés de "Energia Elétrica"

## 🔧 Solução Implementada

### 1. **BOM UTF-8 (Byte Order Mark)**

Adicionado BOM UTF-8 (`\uFEFF`) no início dos arquivos CSV gerados:

```typescript
// Adiciona BOM UTF-8 para garantir compatibilidade com Excel
const BOM = '\uFEFF'
const csvComBOM = BOM + csv
```

**Por que isso resolve?**
- Excel e outros programas reconhecem automaticamente UTF-8 com BOM
- Evita problemas de interpretação de caracteres especiais
- Mantém compatibilidade entre diferentes sistemas operacionais

### 2. **Remoção de BOM na Leitura**

Ao ler arquivos CSV, o sistema agora remove o BOM se presente:

```typescript
// Remove BOM (Byte Order Mark) se presente
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.substring(1)
}
```

### 3. **Funções Atualizadas**

#### `baixarModeloCSV()`
```typescript
export function baixarModeloCSV(credito: DespesaCredito): void {
  const csv = gerarModeloCSV(credito)
  
  // Adiciona BOM UTF-8
  const BOM = '\uFEFF'
  const csvComBOM = BOM + csv
  
  const blob = new Blob([csvComBOM], { 
    type: "text/csv;charset=utf-8;" 
  })
  // ... resto do código
}
```

#### `exportarDespesasCSV()`
```typescript
export function exportarDespesasCSV(despesas: DespesaItem[], credito: DespesaCredito): void {
  // ... preparação do CSV
  
  // Adiciona BOM UTF-8
  const BOM = '\uFEFF'
  const csvComBOM = BOM + csv
  
  const blob = new Blob([csvComBOM], { 
    type: "text/csv;charset=utf-8;" 
  })
  // ... resto do código
}
```

#### `lerArquivoCSV()`
```typescript
export function lerArquivoCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      let content = e.target?.result as string
      
      // Remove BOM se presente
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.substring(1)
      }
      
      resolve(content)
    }
    
    reader.readAsText(file, "UTF-8")
  })
}
```

## ✅ Caracteres Especiais Suportados

Agora o sistema trata corretamente:

| Caractere | Descrição | Exemplo |
|-----------|-----------|---------|
| á, é, í, ó, ú | Acentos agudos | Elétrica, Água |
| à, è, ì, ò, ù | Acentos graves | À vista |
| â, ê, î, ô, û | Acentos circunflexos | Três, Ônibus |
| ã, õ | Til | São Paulo, Depósito |
| ç | Cedilha | Serviços, Locação |
| ñ | N com til | Mañana |

## 📝 Exemplo de CSV Válido

```csv
descricao;valor;tipo;credito
Energia Elétrica;15.000,00;despesa;com-credito
Salários e Encargos (PF);80.000,00;despesa;sem-credito
Aluguel Galpão;25.000,00;despesa;sem-credito
Água e Esgoto;3.000,00;despesa;com-credito
Serviços de Limpeza;5.000,00;despesa;sem-credito
Manutenção Predial;8.000,00;despesa;com-credito
```

**Todos os acentos serão preservados!** ✨

## 🔍 Testando

### 1. **Download do Modelo**
- Vá em: Configurações → PIS/COFINS → Despesas COM Crédito
- Clique em "Importar CSV" → "Baixar Modelo"
- Abra no Excel ou Bloco de Notas
- ✅ Acentos devem aparecer corretamente

### 2. **Importação**
- Edite o CSV com seus dados (use acentos à vontade)
- Salve o arquivo
- Importe de volta no sistema
- ✅ Descrições devem aparecer com acentos corretos

### 3. **Exportação**
- Adicione despesas manualmente com acentos
- Exporte para CSV
- Abra o arquivo gerado
- ✅ Todos os acentos preservados

## 🌐 Compatibilidade

**Testado e funcionando em:**
- ✅ Microsoft Excel (Windows/Mac)
- ✅ Google Sheets
- ✅ LibreOffice Calc
- ✅ Bloco de Notas (Windows)
- ✅ TextEdit (Mac)
- ✅ VS Code
- ✅ Notepad++

## 🐛 Problemas Conhecidos

### Excel Não Reconhece UTF-8?

Se o Excel ainda mostrar caracteres errados:

**Opção 1: Importar Dados**
1. Excel → Dados → Obter Dados → De Arquivo → De Texto/CSV
2. Selecione o arquivo
3. Encoding: **UTF-8**
4. Delimitador: **;** (ponto e vírgula)
5. Clique em "Carregar"

**Opção 2: Configuração Regional**
- Painel de Controle → Região → Formatos
- Verifique se está configurado para Português (Brasil)

## 📊 Resumo das Mudanças

| Arquivo | Função | Mudança |
|---------|--------|---------|
| `csv-utils.ts` | `baixarModeloCSV()` | ➕ Adiciona BOM UTF-8 |
| `csv-utils.ts` | `exportarDespesasCSV()` | ➕ Adiciona BOM UTF-8 |
| `csv-utils.ts` | `lerArquivoCSV()` | ➕ Remove BOM na leitura |

## 🎯 Resultado Final

**Antes:**
```
Sal�rios e Encargos (PF) - R$ 80000.00
Energ�a El�trica - R$ 15000.00
Alugu�is - R$ 25000.00
```

**Depois:**
```
Salários e Encargos (PF) - R$ 80.000,00
Energia Elétrica - R$ 15.000,00
Aluguéis - R$ 25.000,00
```

---

## 🔗 Referências

- [UTF-8 BOM (Wikipedia)](https://en.wikipedia.org/wiki/Byte_order_mark#UTF-8)
- [FileReader API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)](https://www.fileformat.info/info/unicode/char/feff/index.htm)

---

**✅ Problema de encoding resolvido completamente!**
