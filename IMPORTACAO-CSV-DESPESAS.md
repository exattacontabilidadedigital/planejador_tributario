# 📁 Importação/Exportação CSV - Despesas PIS/COFINS

## 🎯 Visão Geral

Sistema completo de importação e exportação de despesas PIS/COFINS via arquivo CSV, permitindo gerenciar múltiplas despesas de uma só vez.

---

## ✨ Funcionalidades Implementadas

### 1. **Importar Despesas via CSV**
- ✅ Botão "Importar CSV" em cada card (COM e SEM crédito)
- ✅ Dialog modal com instruções e preview
- ✅ Validação automática de dados
- ✅ Preview das despesas antes de importar
- ✅ Mensagens de erro detalhadas por linha

### 2. **Download de Modelo CSV**
- ✅ Botão para baixar arquivo modelo
- ✅ Exemplos práticos incluídos
- ✅ Modelos específicos por tipo (COM/SEM crédito)

### 3. **Exportar Despesas Existentes**
- ✅ Botão de exportação (ícone Download)
- ✅ Gera CSV das despesas atuais
- ✅ Facilita backup e compartilhamento

---

## 📋 Formato do CSV

### Estrutura Obrigatória

```csv
descricao;valor;tipo;categoria
```

**Colunas:**
- `descricao` (obrigatório): Nome da despesa
- `valor` (obrigatório): Valor numérico (use ponto como decimal)
- `tipo` (obrigatório): "custo" ou "despesa"
- `categoria` (opcional): Classificação personalizada

**Regras:**
- ✅ Separador: **ponto-e-vírgula (;)**
- ✅ Decimal: **ponto (.)**
- ✅ Primeira linha: cabeçalho (ignorado na importação)
- ✅ Valores: sem símbolos de moeda
- ✅ Linhas vazias: ignoradas automaticamente

### Exemplo - Despesas COM Crédito

```csv
descricao;valor;tipo;categoria
Energia Elétrica;15000.00;despesa;Utilidades
Aluguel Comercial;25000.00;despesa;Ocupação
Frete sobre Compras;8000.00;custo;Logística
Combustível Veículos Empresa;5000.00;despesa;Transporte
Depreciação Máquinas;12000.00;custo;Ativo Imobilizado
```

### Exemplo - Despesas SEM Crédito

```csv
descricao;valor;tipo;categoria
Salários e Encargos;80000.00;despesa;Pessoal
Vale Alimentação;15000.00;despesa;Benefícios
Combustível Veículo Passeio;3000.00;despesa;Transporte
Material de Escritório;2000.00;despesa;Administrativo
Serviços Profissionais PF;5000.00;despesa;Terceiros
```

---

## 🚀 Como Usar

### Passo 1: Preparar o Arquivo CSV

**Opção A: Baixar Modelo**
1. Acesse **Configurações** → **PIS/COFINS**
2. No card desejado, clique em **"Importar CSV"**
3. Clique em **"Baixar Modelo CSV"**
4. Edite o arquivo com suas despesas

**Opção B: Criar Manualmente**
1. Abra Excel, LibreOffice ou Google Sheets
2. Use ponto-e-vírgula como separador
3. Preencha conforme formato acima
4. Salve como `.csv`

### Passo 2: Importar Despesas

1. Clique em **"Importar CSV"** no card desejado
2. Selecione o arquivo CSV preparado
3. Aguarde validação automática
4. Revise preview das despesas
5. Confirme a importação

### Passo 3: Verificar Dados Importados

- ✅ Despesas aparecem na lista do card
- ✅ Totais são atualizados automaticamente
- ✅ Cálculos de PIS/COFINS refletem novas despesas

---

## ⚙️ Arquitetura Técnica

### Arquivos Criados

#### 1. `src/lib/csv-utils.ts`
**Utilitários de manipulação CSV**

```typescript
// Funções principais:
- gerarModeloCSV(credito): string
- baixarModeloCSV(credito): void
- parseCSV(csvContent, credito): { sucesso, erros }
- lerArquivoCSV(file): Promise<string>
- validarArquivoCSV(file): string | null
- exportarDespesasCSV(despesas, credito): void
```

**Funcionalidades:**
- ✅ Geração de CSV modelo com exemplos
- ✅ Parsing de CSV com validações
- ✅ Exportação de despesas existentes
- ✅ Validação de formato e tamanho de arquivo

#### 2. `src/components/config/import-csv-button.tsx`
**Componente de importação**

```typescript
interface ImportCSVButtonProps {
  credito: DespesaCredito
  onImport: (despesas: DespesaItem[]) => void
  className?: string
}
```

**Características:**
- ✅ Dialog modal interativo
- ✅ Botão de download de modelo
- ✅ Input de arquivo estilizado
- ✅ Preview de dados importados
- ✅ Validação em tempo real
- ✅ Mensagens de erro detalhadas

#### 3. `src/components/ui/alert.tsx`
**Componente de alertas**

```typescript
<Alert variant="default" | "destructive">
  <AlertDescription>...</AlertDescription>
</Alert>
```

**Uso:**
- ✅ Exibir erros de validação
- ✅ Mostrar mensagens de sucesso
- ✅ Instruções de formato

#### 4. Modificações em `despesas-manager.tsx`

**Adicionado:**
- ✅ Botão "Importar CSV"
- ✅ Botão "Exportar" (download)
- ✅ Handler `handleImportCSV`
- ✅ Handler `handleExportCSV`

---

## ✅ Validações Implementadas

### Validação de Arquivo

```typescript
validarArquivoCSV(file: File)
```

**Verifica:**
- ✅ Extensão: `.csv` ou `.txt`
- ✅ Tamanho: máximo 1MB
- ❌ Erro: mensagem descritiva

### Validação de Conteúdo

```typescript
parseCSV(csvContent, credito)
```

**Verifica cada linha:**

| Campo | Validação | Erro |
|-------|-----------|------|
| **Descrição** | Não vazio | "Descrição obrigatória" |
| **Valor** | Número > 0 | "Valor inválido \"{valor}\"" |
| **Tipo** | "custo" ou "despesa" | "Tipo deve ser 'custo' ou 'despesa'" |
| **Formato** | Mínimo 3 colunas | "Formato inválido" |

**Resultado:**
```typescript
{
  sucesso: DespesaItem[], // Despesas válidas
  erros: string[]          // Mensagens de erro
}
```

---

## 📊 Fluxo de Importação

```
┌─────────────────────┐
│ Usuário clica       │
│ "Importar CSV"      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Dialog abre com     │
│ botão Download      │
│ Modelo              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Usuário seleciona   │
│ arquivo CSV         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Validação Arquivo   │
│ (extensão, tamanho) │
└──────────┬──────────┘
           │
           ├─ ❌ Erro ──→ Exibe mensagem
           │
           ▼ ✅ OK
┌─────────────────────┐
│ Leitura do arquivo  │
│ (FileReader)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Parse CSV           │
│ linha por linha     │
└──────────┬──────────┘
           │
           ├─ ❌ Erros ──→ Lista erros por linha
           │
           ▼ ✅ Sucesso
┌─────────────────────┐
│ Preview despesas    │
│ em tabela           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Usuário confirma    │
│ "Importar X"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ onImport() chamado  │
│ Despesas adicionadas│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Dialog fecha        │
│ Lista atualizada    │
└─────────────────────┘
```

---

## 🎨 Interface do Usuário

### Botões Adicionados

**No DespesasManager:**

```tsx
┌──────────────────────────────────────────┐
│ Total: R$ 15.000,00                   📥 💾 ➕ │
│ Custos: R$ 8.000  Despesas: R$ 7.000     │
└──────────────────────────────────────────┘
     │          │         │
     │          │         └─ Adicionar (manual)
     │          └─────────── Importar CSV
     └────────────────────── Exportar (download)
```

### Dialog de Importação

```
┌─────────────────────────────────────────────┐
│ Importar Despesas COM Crédito PIS/COFINS   │
├─────────────────────────────────────────────┤
│                                             │
│ 📄 Baixar Modelo CSV                    [↓] │
│    Arquivo de exemplo com formato correto  │
│                                             │
│ ⚠️ Formato esperado:                        │
│    • Separador: ponto-e-vírgula (;)        │
│    • Colunas: descricao;valor;tipo;categ.  │
│    • Tipo: "custo" ou "despesa"            │
│                                             │
│ Selecionar Arquivo CSV                      │
│ [Escolher arquivo...]                       │
│                                             │
│ ✅ 5 despesa(s) pronta(s) para importar    │
│ ┌─────────────────────────────────────────┐│
│ │ Descrição          Valor        Tipo    ││
│ │ Energia Elétrica   R$ 15.000   despesa ││
│ │ Aluguel           R$ 25.000   despesa ││
│ │ ...                                     ││
│ └─────────────────────────────────────────┘│
│                                             │
│                    [Cancelar] [Importar 5]  │
└─────────────────────────────────────────────┘
```

---

## 🧪 Testes Sugeridos

### Teste 1: Download de Modelo
1. ✅ Clicar em "Importar CSV"
2. ✅ Clicar em "Baixar Modelo"
3. ✅ Verificar se arquivo foi baixado
4. ✅ Abrir e verificar exemplos

### Teste 2: Importação Válida
1. ✅ Editar modelo com dados reais
2. ✅ Importar arquivo
3. ✅ Verificar preview
4. ✅ Confirmar importação
5. ✅ Verificar despesas na lista

### Teste 3: Validação de Erros
**CSV com erros:**
```csv
descricao;valor;tipo;categoria
;15000.00;despesa;Energia           # ❌ Sem descrição
Aluguel;abc;despesa;Ocupação        # ❌ Valor inválido
Frete;8000.00;invalido;Logística    # ❌ Tipo inválido
```

**Resultado esperado:**
- ❌ Linha 2: Descrição obrigatória
- ❌ Linha 3: Valor inválido "abc"
- ❌ Linha 4: Tipo deve ser "custo" ou "despesa"

### Teste 4: Arquivo Inválido
1. ✅ Tentar importar `.pdf` → Erro de extensão
2. ✅ Tentar importar arquivo > 1MB → Erro de tamanho

### Teste 5: Exportação
1. ✅ Adicionar despesas manualmente
2. ✅ Clicar botão exportar (download)
3. ✅ Verificar se CSV foi gerado
4. ✅ Abrir e verificar dados

### Teste 6: Importação em Lote
**Cenário:** Importar 20+ despesas de uma vez
1. ✅ Preparar CSV com 20 linhas
2. ✅ Importar
3. ✅ Verificar performance
4. ✅ Validar todos os registros

---

## 📈 Benefícios

### Para o Usuário
- ✅ **Produtividade**: Importar 50 despesas em 10 segundos vs 20 minutos manual
- ✅ **Precisão**: Menos erros de digitação
- ✅ **Backup**: Exportar e salvar dados facilmente
- ✅ **Colaboração**: Compartilhar planilhas entre equipes
- ✅ **Migração**: Importar dados de outros sistemas

### Para o Sistema
- ✅ **Escalabilidade**: Suporta grandes volumes de dados
- ✅ **Validação**: Garante integridade dos dados
- ✅ **UX**: Feedback visual e mensagens claras
- ✅ **Flexibilidade**: Aceita diferentes formatos de CSV

---

## 🔧 Manutenção e Evolução

### Melhorias Futuras

#### 1. **Suporte a Excel (.xlsx)**
```typescript
// Adicionar biblioteca de parsing Excel
import * as XLSX from 'xlsx'

function parseExcel(file: File): Promise<DespesaItem[]>
```

#### 2. **Validação Avançada**
```typescript
// Detectar duplicatas
// Validar NCM/CFOP
// Sugerir categorias baseado em descrição
```

#### 3. **Importação com Merge**
```typescript
// Opção: substituir existentes ou adicionar
interface ImportOptions {
  mode: 'replace' | 'append' | 'merge'
}
```

#### 4. **Templates Customizáveis**
```typescript
// Salvar templates personalizados
// Biblioteca de templates por segmento
```

#### 5. **Histórico de Importações**
```typescript
// Log de importações
// Reverter importação
// Auditoria de mudanças
```

---

## 📝 Changelog

### Versão 3.2.0 - 03/10/2025

**Adicionado:**
- ✅ Utilitário CSV (`csv-utils.ts`)
- ✅ Componente ImportCSVButton
- ✅ Componente Alert (UI)
- ✅ Botão Importar CSV nos cards
- ✅ Botão Exportar CSV nos cards
- ✅ Download de modelo CSV
- ✅ Validação completa de dados
- ✅ Preview de despesas antes de importar
- ✅ Mensagens de erro detalhadas

**Melhorado:**
- ✅ Layout do DespesasManager (botões organizados)
- ✅ UX com feedback visual
- ✅ Documentação completa

---

## 📚 Exemplos de Uso Real

### Caso 1: Migração de Sistema Anterior

```csv
# Exportado de sistema legado
descricao;valor;tipo;categoria
Energia Elétrica - Janeiro;14523.45;despesa;Utilidades
Energia Elétrica - Fevereiro;15234.67;despesa;Utilidades
Aluguel Galpão 1;28000.00;despesa;Ocupação
Aluguel Galpão 2;32000.00;despesa;Ocupação
Frete CIF Compras;12345.89;custo;Logística
Combustível Frota;8765.43;despesa;Transporte
```

### Caso 2: Planejamento Anual

```csv
# Despesas projetadas 2025
descricao;valor;tipo;categoria
Energia (média mensal);15000.00;despesa;Utilidades
Aluguel;30000.00;despesa;Ocupação
Salários Admin;85000.00;despesa;Pessoal
Frete sobre vendas;10000.00;custo;Logística
Marketing Digital;12000.00;despesa;Comercial
```

### Caso 3: Múltiplas Unidades

```csv
# Unidade SP
descricao;valor;tipo;categoria
Energia SP;20000.00;despesa;Utilidades - SP
Aluguel SP;45000.00;despesa;Ocupação - SP
Salários SP;120000.00;despesa;Pessoal - SP

# Unidade RJ
Energia RJ;18000.00;despesa;Utilidades - RJ
Aluguel RJ;40000.00;despesa;Ocupação - RJ
Salários RJ;110000.00;despesa;Pessoal - RJ
```

---

**Desenvolvido para maximizar eficiência e precisão no planejamento tributário** ✨
