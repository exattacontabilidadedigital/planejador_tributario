# Correção dos Inputs de Moeda no Formulário Comparativos

## Data: 2025-06-01

## Problema Identificado

Os campos de entrada de valores monetários (ICMS, PIS, COFINS, IRPJ, CSLL, etc.) apresentavam problemas durante a digitação:

1. **Formatação agressiva**: A função `formatarMoeda()` aplicava formatação imediata a cada tecla, dificultando a digitação
2. **Retorno de '0,00'**: Quando o campo estava vazio, retornava '0,00' ao invés de permitir campo vazio
3. **Impossibilidade de apagar**: Usuário não conseguia limpar completamente os campos
4. **Saltos de cursor**: O cursor pulava para posições inesperadas durante a digitação

## Correções Implementadas

### 1. Função `formatarMoeda()`

**Antes:**
```typescript
const formatarMoeda = (valor: string): string => {
  if (!valor || valor.trim() === '') return '0,00'  // ❌ Forçava zero
  const apenasNumeros = valor.replace(/\D/g, '')
  if (!apenasNumeros) return '0,00'  // ❌ Forçava zero
  const numero = parseInt(apenasNumeros) / 100
  
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
```

**Depois:**
```typescript
const formatarMoeda = (valor: string): string => {
  // Se vazio, retorna vazio para permitir digitação livre
  if (!valor || valor.trim() === '') return ''  // ✅ Permite campo vazio
  
  // Remove tudo que não é número
  const apenasNumeros = valor.replace(/\D/g, '')
  
  // Se só tem zeros ou vazio após limpar, retorna vazio
  if (!apenasNumeros || parseInt(apenasNumeros) === 0) return ''  // ✅ Limpa zeros
  
  // Converte para número dividindo por 100 (centavos)
  const numero = parseInt(apenasNumeros) / 100
  
  // Formata com vírgula e ponto brasileiro
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
```

### 2. Função `handleMoedaChange()`

**Antes:**
```typescript
const handleMoedaChange = (campo: keyof FormularioDadosComparativos, valor: string) => {
  const valorFormatado = formatarMoeda(valor)
  handleInputChange(campo, valorFormatado)
}
```

**Depois:**
```typescript
const handleMoedaChange = (campo: keyof FormularioDadosComparativos, valor: string) => {
  // Permite que o usuário apague completamente o campo
  if (valor === '' || valor.trim() === '') {
    handleInputChange(campo, '')  // ✅ Respeita campo vazio
    return
  }
  
  const valorFormatado = formatarMoeda(valor)
  handleInputChange(campo, valorFormatado)
}
```

### 3. Função `converterMoedaParaNumero()`

**Antes:**
```typescript
const converterMoedaParaNumero = (valorFormatado: string): number => {
  if (!valorFormatado || valorFormatado.trim() === '') return 0
  return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.')) || 0
}
```

**Depois:**
```typescript
const converterMoedaParaNumero = (valorFormatado: string): number => {
  // Retorna 0 para valores vazios ou inválidos
  if (!valorFormatado || valorFormatado.trim() === '') return 0
  
  // Remove pontos de milhar e substitui vírgula por ponto
  const valorLimpo = valorFormatado.replace(/\./g, '').replace(',', '.')
  
  // Converte para número
  const numero = parseFloat(valorLimpo)
  
  // Retorna 0 se não for um número válido
  return isNaN(numero) ? 0 : numero
}
```

### 4. Melhorias no Componente `MoedaInputComDiff`

**Melhorias aplicadas:**
- ✅ Placeholder mais informativo: `"Digite o valor (ex: 1000,00)"`
- ✅ Classe `font-mono` para melhor alinhamento dos números
- ✅ Atributo `inputMode="numeric"` para teclado numérico em mobile
- ✅ Mantém classe `text-right` para alinhamento à direita

```typescript
<Input
  id={id}
  placeholder="Digite o valor (ex: 1000,00)"
  value={(formulario as any)[campo]}
  onChange={(e) => handleMoedaChange(campo, e.target.value)}
  className="text-right font-mono"  // ✅ Fonte monoespaçada
  inputMode="numeric"               // ✅ Teclado numérico mobile
/>
```

## Comportamento Esperado Após Correções

### Digitação Normal
1. Usuário digita: `1` → Campo mostra: `0,01`
2. Usuário digita: `0` → Campo mostra: `0,10`
3. Usuário digita: `0` → Campo mostra: `1,00`
4. Usuário digita: `0` → Campo mostra: `10,00`

### Campo Vazio
- Usuário pode apagar completamente (Ctrl+A + Delete)
- Campo fica vazio (sem '0,00' forçado)
- Validação só acontece ao salvar

### Formatação Automática
- Números são formatados com ponto de milhar: `1.000,00`
- Sempre 2 casas decimais quando houver valor
- Sem zeros à esquerda desnecessários

## Validações Mantidas

As seguintes validações continuam funcionando corretamente:

1. ✅ Receita obrigatória e > 0
2. ✅ Receita < R$ 1 trilhão (proteção contra valores irreais)
3. ✅ Total de impostos não pode exceder receita
4. ⚠️ Alerta para carga tributária > 80%
5. ✅ Verificação de duplicatas (mês/ano/regime)

## Testes Recomendados

### Teste 1: Digitação Fluida
- [ ] Abrir formulário de comparativos
- [ ] Digitar valores em sequência sem interrupções
- [ ] Verificar que cursor não pula
- [ ] Confirmar formatação automática

### Teste 2: Campo Vazio
- [ ] Selecionar todo o texto (Ctrl+A)
- [ ] Pressionar Delete
- [ ] Verificar que campo fica vazio (não retorna para '0,00')

### Teste 3: Valores Grandes
- [ ] Digitar: `1234567890`
- [ ] Verificar resultado: `12.345.678,90`
- [ ] Confirmar alinhamento à direita

### Teste 4: Mobile
- [ ] Testar em dispositivo móvel/simulador
- [ ] Verificar que teclado numérico abre automaticamente
- [ ] Testar digitação com teclado numérico

### Teste 5: Edição
- [ ] Editar registro existente
- [ ] Verificar que valores carregam corretamente formatados
- [ ] Testar edição parcial (mudando poucos dígitos)

## Impacto nas Funcionalidades Existentes

### ✅ Mantidas
- Formatação brasileira (ponto milhar, vírgula decimal)
- Validações de negócio
- Cálculo de diferenças no modo edição
- Badges de variação percentual

### ⚠️ Comportamento Alterado
- Campo vazio agora é realmente vazio (antes era '0,00')
- Usuário pode apagar tudo e deixar vazio
- Validação de campo obrigatório só acontece ao salvar

## Próximos Passos

1. ✅ Testar formulário em navegador
2. ⏳ Testar em dispositivos móveis
3. ⏳ Validar UX com usuários
4. ⏳ Considerar adicionar máscara de input (biblioteca externa?)

## Observações Finais

- Formatação de moeda mantém padrão brasileiro (pt-BR)
- Fonte monoespaçada melhora alinhamento visual
- `inputMode="numeric"` melhora experiência mobile
- Placeholder mais descritivo ajuda novos usuários

## Arquivo Modificado

- `src/components/comparativos/formulario-comparativos.tsx`

## Linhas Alteradas

- Linha 119-145: Funções `formatarMoeda()` e `handleMoedaChange()`
- Linha 147-161: Função `converterMoedaParaNumero()`
- Linha 163-195: Componente `MoedaInputComDiff`
