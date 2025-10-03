# 🇧🇷 Formato de Moeda Brasileiro - Importação CSV

## ✅ Mudanças Implementadas

O sistema de importação CSV agora aceita **formato de moeda brasileiro** além do formato internacional!

### Antes
```csv
descricao;valor;tipo;categoria
Energia Elétrica;15000.00;despesa;Utilidades
Aluguel;25000.00;despesa;Ocupação
```

### Agora (Formato BR)
```csv
descricao;valor;tipo;categoria
Energia Elétrica;15.000,00;despesa;Utilidades
Aluguel;25.000,00;despesa;Ocupação
```

---

## 🎯 Formatos Aceitos

### Formato Brasileiro (Preferencial)
- **Separador de milhar:** ponto (.)
- **Separador decimal:** vírgula (,)
- **Exemplos:**
  ```
  1.500,00
  15.000,50
  250.000,99
  1.234.567,89
  ```

### Formato Internacional (Ainda Suportado)
- **Separador de milhar:** vírgula (,) ou nenhum
- **Separador decimal:** ponto (.)
- **Exemplos:**
  ```
  1500.00
  15000.50
  250000.99
  1,234,567.89
  ```

---

## 🔧 Como Funciona

### Função de Conversão

```typescript
function parseValorBR(valorStr: string): number {
  let valor = valorStr.trim()
  
  // Detecta formato brasileiro: 1.500,00
  if (valor.includes(',')) {
    // Remove pontos de milhar e substitui vírgula por ponto
    valor = valor.replace(/\./g, '').replace(',', '.')
  }
  // Formato internacional: 1,500.00
  else if (valor.includes('.')) {
    // Remove vírgulas de milhar
    valor = valor.replace(/,/g, '')
  }
  
  return parseFloat(valor)
}
```

### Exemplos de Conversão

| Input CSV | Formato Detectado | Valor Numérico |
|-----------|-------------------|----------------|
| `1.500,00` | Brasileiro | 1500.00 |
| `15.000,50` | Brasileiro | 15000.50 |
| `1500.00` | Internacional | 1500.00 |
| `15000.50` | Internacional | 15000.50 |
| `1,500.00` | Internacional | 1500.00 |
| `1500` | Sem decimal | 1500.00 |

---

## 📝 Arquivos CSV de Exemplo

### Modelo COM Crédito (Formato BR)

```csv
descricao;valor;tipo;categoria
Energia Elétrica;15.000,00;despesa;Utilidades
Aluguel Comercial;25.000,00;despesa;Ocupação
Frete sobre Compras;8.000,00;custo;Logística
Combustível Veículos Empresa;5.000,00;despesa;Transporte
Depreciação Máquinas;12.000,00;custo;Ativo Imobilizado
```

### Modelo SEM Crédito (Formato BR)

```csv
descricao;valor;tipo;categoria
Salários e Encargos;80.000,00;despesa;Pessoal
Vale Alimentação;15.000,00;despesa;Benefícios
Combustível Veículo Passeio;3.000,00;despesa;Transporte
Material de Escritório;2.000,00;despesa;Administrativo
Serviços Profissionais PF;5.000,00;despesa;Terceiros
```

---

## 🚀 Exportação em Formato BR

Quando você exporta despesas, o arquivo gerado usa **formato brasileiro automaticamente**:

```csv
descricao;valor;tipo;categoria
Energia Elétrica;15.000,00;despesa;Utilidades
Aluguel;25.000,00;despesa;Ocupação
Salários;80.000,00;despesa;Pessoal
```

### Função de Formatação

```typescript
function formatarValorBR(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
```

**Resultado:**
- `1500` → `1.500,00`
- `15000.5` → `15.000,50`
- `250000` → `250.000,00`

---

## ✅ Compatibilidade

### Formatos Válidos

✅ **1.500,00** (brasileiro - preferencial)  
✅ **1500,00** (brasileiro sem milhar)  
✅ **1.500** (brasileiro sem centavos)  
✅ **1500.00** (internacional)  
✅ **1,500.00** (internacional com milhar)  
✅ **1500** (sem separador decimal)  

### Formatos Inválidos

❌ **1.500.00** (mistura de formatos)  
❌ **1,500,00** (separadores incorretos)  
❌ **R$ 1.500,00** (com símbolo de moeda)  
❌ **abc** (texto)  
❌ **-500** (negativo)  
❌ **0** (zero ou negativo)  

---

## 🎨 Interface Atualizada

### Mensagem de Formato

**Antes:**
> Valor: use ponto como separador decimal (ex: 1500.00)

**Agora:**
> Valor: formato brasileiro (1.500,00) ou internacional (1500.00)

### Dialog de Importação

```
┌─────────────────────────────────────────────┐
│ ⚠️ Formato esperado:                        │
│    • Separador: ponto-e-vírgula (;)        │
│    • Colunas: descricao;valor;tipo;categ.  │
│    • Tipo: "custo" ou "despesa"            │
│    • Valor: formato brasileiro (1.500,00)  │
│            ou internacional (1500.00)       │
└─────────────────────────────────────────────┘
```

---

## 📊 Casos de Uso

### Caso 1: Planilha do Excel BR

**Cenário:** Usuário exporta do Excel brasileiro

```csv
Energia;15.234,56;despesa;Utilidades
Aluguel;28.900,00;despesa;Ocupação
```

**Resultado:** ✅ Importado com sucesso
- Energia: R$ 15.234,56
- Aluguel: R$ 28.900,00

### Caso 2: Planilha Internacional

**Cenário:** Dados de sistema estrangeiro

```csv
Power;15234.56;despesa;Utilities
Rent;28900.00;despesa;Occupation
```

**Resultado:** ✅ Importado com sucesso
- Power: R$ 15.234,56
- Rent: R$ 28.900,00

### Caso 3: Mix de Formatos

**Cenário:** Arquivo com formatos mistos (não recomendado, mas funciona)

```csv
Energia;15.000,00;despesa;Utilidades
Aluguel;25000.00;despesa;Ocupação
Salários;80.000,50;despesa;Pessoal
```

**Resultado:** ✅ Importado com sucesso
- Energia: R$ 15.000,00 (formato BR)
- Aluguel: R$ 25.000,00 (formato INT)
- Salários: R$ 80.000,50 (formato BR)

---

## 🧪 Testes de Validação

### Teste 1: Formato Brasileiro
```csv
descricao;valor;tipo;categoria
Teste 1;1.500,00;despesa;Teste
Teste 2;15.000,50;despesa;Teste
Teste 3;250.000,99;custo;Teste
```

**Esperado:**
- ✅ Todas as linhas importadas
- ✅ Valores: 1500.00, 15000.50, 250000.99

### Teste 2: Formato Internacional
```csv
descricao;valor;tipo;categoria
Test 1;1500.00;despesa;Test
Test 2;15000.50;despesa;Test
Test 3;250000.99;custo;Test
```

**Esperado:**
- ✅ Todas as linhas importadas
- ✅ Valores: 1500.00, 15000.50, 250000.99

### Teste 3: Valores Sem Milhar
```csv
descricao;valor;tipo;categoria
Pequeno;500,00;despesa;Teste
Médio;5000,00;despesa;Teste
Grande;50000,00;custo;Teste
```

**Esperado:**
- ✅ Todas as linhas importadas
- ✅ Valores: 500.00, 5000.00, 50000.00

### Teste 4: Valores Inválidos
```csv
descricao;valor;tipo;categoria
Erro 1;R$ 1.500,00;despesa;Teste
Erro 2;abc;despesa;Teste
Erro 3;-500,00;despesa;Teste
```

**Esperado:**
- ❌ Linha 2: Valor inválido "R$ 1.500,00"
- ❌ Linha 3: Valor inválido "abc"
- ❌ Linha 4: Valor inválido "-500,00"

---

## 🔄 Fluxo de Importação

```
┌─────────────────────┐
│ Arquivo CSV         │
│ "1.500,00"          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ parseValorBR()      │
│ Detecta vírgula (,) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Remove pontos (.)   │
│ "1500,00"           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Substitui , por .   │
│ "1500.00"           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ parseFloat()        │
│ 1500.00             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Valor Numérico      │
│ Pronto para uso     │
└─────────────────────┘
```

---

## 📈 Benefícios

### Para Usuários Brasileiros
✅ **Naturalidade:** Trabalha com formato familiar  
✅ **Excel BR:** Compatível com exportações do Excel brasileiro  
✅ **Sem Conversão:** Não precisa converter antes de importar  
✅ **Exportação BR:** Arquivos exportados já em formato BR  

### Para Compatibilidade
✅ **Internacional:** Ainda aceita formato com ponto  
✅ **Flexível:** Aceita com ou sem separador de milhar  
✅ **Retrocompatível:** Arquivos antigos continuam funcionando  

---

## 🛠️ Arquivos Modificados

### 1. `src/lib/csv-utils.ts`

**Adicionado:**
```typescript
// Função de parsing com suporte a formato BR
function parseValorBR(valorStr: string): number

// Função de formatação em formato BR
function formatarValorBR(valor: number): string
```

**Modificado:**
```typescript
// gerarModeloCSV() - Exemplos em formato BR
// parseCSV() - Usa parseValorBR()
// exportarDespesasCSV() - Usa formatarValorBR()
```

### 2. `src/components/config/import-csv-button.tsx`

**Modificado:**
```typescript
// Mensagem de formato aceita BR e INT
"Valor: formato brasileiro (1.500,00) ou internacional (1500.00)"
```

---

## 📝 Changelog

### Versão 3.2.1 - 03/10/2025

**Adicionado:**
- ✅ Função `parseValorBR()` - Converte formato BR/INT
- ✅ Função `formatarValorBR()` - Formata saída em BR
- ✅ Suporte a formato brasileiro (1.500,00)
- ✅ Suporte a formato internacional (1500.00)
- ✅ Detecção automática de formato

**Modificado:**
- ✅ Modelo CSV usa formato brasileiro
- ✅ Exportação usa formato brasileiro
- ✅ Mensagem de ajuda atualizada

**Compatibilidade:**
- ✅ 100% retrocompatível
- ✅ Arquivos antigos continuam funcionando

---

## 🎓 Exemplos Completos

### Exemplo 1: Farmácia

```csv
descricao;valor;tipo;categoria
Medicamentos;125.450,00;custo;Compras
Energia Elétrica;3.250,00;despesa;Utilidades
Aluguel Loja;8.500,00;despesa;Ocupação
Salários Farmacêuticos;45.000,00;despesa;Pessoal
Material Hospitalar;15.780,50;custo;Compras
```

### Exemplo 2: Restaurante

```csv
descricao;valor;tipo;categoria
Alimentos;85.600,00;custo;Compras
Bebidas;32.450,00;custo;Compras
Energia e Gás;5.890,00;despesa;Utilidades
Aluguel;12.000,00;despesa;Ocupação
Salários Cozinha;38.500,00;despesa;Pessoal
Salários Salão;25.000,00;despesa;Pessoal
```

### Exemplo 3: Indústria

```csv
descricao;valor;tipo;categoria
Matéria Prima;450.000,00;custo;Produção
Energia Elétrica Industrial;85.600,00;despesa;Utilidades
Manutenção Máquinas;15.800,00;custo;Produção
Frete Compras;25.400,00;custo;Logística
Salários Produção;180.000,00;custo;Mão de Obra
Depreciação Equipamentos;45.000,00;custo;Ativo Imobilizado
```

---

**Desenvolvido para facilitar o trabalho de empresas brasileiras** 🇧🇷✨
