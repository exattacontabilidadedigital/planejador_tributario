# ✅ CORREÇÃO: Despesas Dinâmicas Agora São Salvas no Banco de Dados

## 🔴 Problema Identificado

Quando você editava uma despesa no modal "Editar Despesa COM/SEM Crédito" e clicava em "Salvar Alterações":

1. ✅ A despesa era atualizada no `localStorage` (via `useTaxStore`)
2. ✅ Ao clicar em "Salvar" na página do cenário, a coluna `configuracao` (JSONB) era atualizada
3. ❌ **A tabela `despesas_dinamicas` NUNCA era sincronizada!**

### Fluxo Anterior (QUEBRADO)

```
Editar Despesa → updateConfig() → localStorage atualizado ✅
                                                ↓
Clicar em "Salvar" → updateCenario() → cenarios.configuracao atualizado ✅
                                                ↓
                                       despesas_dinamicas ❌ NÃO ATUALIZADA!
```

**Resultado**: A consulta no `comparativos-analise-service-completo.ts` buscava da tabela vazia!

---

## ✅ Solução Implementada

Modifiquei o arquivo `src/stores/cenarios-store.ts` para **sincronizar automaticamente** a tabela `despesas_dinamicas`:

### 1️⃣ **Ao CRIAR novo cenário** (`addCenario`)

```typescript
// ✅ NOVO: Após inserir cenário, inserir despesas na tabela normalizada
const despesasDinamicas = config.despesasDinamicas || []
if (despesasDinamicas.length > 0) {
  const despesasParaInserir = despesasDinamicas.map(d => ({
    cenario_id: result.id,
    descricao: d.descricao,
    valor: d.valor,
    tipo: d.tipo,
    credito: d.credito,
    categoria: d.categoria || null
  }))
  
  await supabase.from('despesas_dinamicas').insert(despesasParaInserir)
}
```

### 2️⃣ **Ao ATUALIZAR cenário existente** (`updateCenario`)

```typescript
// ✅ NOVO: Ao atualizar configuração, sincronizar despesas_dinamicas
if (data.configuracao !== undefined) {
  const despesasDinamicas = data.configuracao.despesasDinamicas || []
  
  // 1. Deletar despesas antigas
  await supabase
    .from('despesas_dinamicas')
    .delete()
    .eq('cenario_id', id)
  
  // 2. Inserir despesas atualizadas
  if (despesasDinamicas.length > 0) {
    const despesasParaInserir = despesasDinamicas.map(d => ({
      cenario_id: id,
      descricao: d.descricao,
      valor: d.valor,
      tipo: d.tipo,
      credito: d.credito,
      categoria: d.categoria || null
    }))
    
    await supabase.from('despesas_dinamicas').insert(despesasParaInserir)
  }
}
```

---

## 🔄 Fluxo Atual (CORRIGIDO)

```
Editar Despesa → updateConfig() → localStorage atualizado ✅
                                                ↓
Clicar em "Salvar" → updateCenario() → cenarios.configuracao atualizado ✅
                                                ↓
                                       DELETE despesas_dinamicas antigas ✅
                                                ↓
                                       INSERT despesas_dinamicas novas ✅
```

---

## 📊 Impacto nos Comparativos

Agora quando você:

1. **Cadastra/Edita despesas** em um cenário de Lucro Real
2. **Marca como "COM crédito"** (gera crédito PIS/COFINS)
3. **Salva o cenário**

O serviço `comparativos-analise-service-completo.ts` vai:

```typescript
// Buscar despesas da tabela normalizada ✅
const { data: despesas } = await supabase
  .from('despesas_dinamicas')
  .select('*')
  .in('cenario_id', cenarioIds)

// Calcular créditos ✅
const despesasComCredito = despesas.filter(d => d.credito === 'com-credito')
const totalComCredito = despesasComCredito.reduce((sum, d) => sum + d.valor, 0)
const creditoPIS = totalComCredito * 0.0165  // 1,65%
const creditoCOFINS = totalComCredito * 0.076 // 7,6%

// Deduzir dos impostos ✅
impostos.pis = Math.max(0, impostos.pis - creditoPIS)
impostos.cofins = Math.max(0, impostos.cofins - creditoCOFINS)
```

---

## 🧪 Como Testar

### Teste 1: Criar Novo Cenário com Despesas

1. Vá em **Configurações** → Aba **PIS/COFINS**
2. Adicione despesa COM crédito: "Energia Elétrica - R$ 15.000"
3. Clique em **"Salvar Cenário"** (modal verde)
4. Preencha nome e salve

**Resultado Esperado:**
- ✅ Cenário criado na tabela `cenarios`
- ✅ Despesa inserida na tabela `despesas_dinamicas`

### Teste 2: Editar Despesa Existente

1. Abra um cenário existente
2. Vá em **Configurações** → Aba **PIS/COFINS**
3. Clique em ✏️ (editar) em uma despesa
4. Altere valor: R$ 15.000 → R$ 18.000
5. Clique em **"Salvar Alterações"** (modal azul)
6. Clique em **"Salvar"** (botão principal da página)

**Resultado Esperado:**
- ✅ Despesas antigas deletadas
- ✅ Despesas atualizadas inseridas
- ✅ Valor refletido nos comparativos

### Teste 3: Verificar Comparativo

1. Vá em **Análise Comparativa**
2. Selecione empresa e meses
3. Gere o comparativo
4. Veja o gráfico

**Resultado Esperado:**
- ✅ Lucro Real mostra impostos **LÍQUIDOS** (com créditos deduzidos)
- ✅ Console mostra logs: `💳 [CRÉDITOS] Despesas com crédito: R$ 18.000`

---

## 📝 Logs no Console

Quando salvar/atualizar cenário, você verá:

```
💼 [CENÁRIOS] Inserindo 3 despesas dinâmicas na tabela normalizada
✅ [CENÁRIOS] 3 despesas dinâmicas inseridas com sucesso
```

Ao atualizar:

```
💼 [CENÁRIOS] Sincronizando 3 despesas dinâmicas na tabela normalizada
🗑️ [CENÁRIOS] Despesas antigas deletadas
✅ [CENÁRIOS] 3 despesas dinâmicas sincronizadas
```

No comparativo:

```
💼 [DESPESAS] Cenário Janeiro:
   • Total de despesas: 3
   • COM crédito: 2
   • SEM crédito: 1
💳 [CRÉDITOS] Cenário Janeiro:
   • Despesas com crédito: R$ 33.000,00
   • Crédito PIS (1,65%): R$ 544,50
   • Crédito COFINS (7,6%): R$ 2.508,00
   • Total créditos: R$ 3.052,50
```

---

## ✅ Arquivos Modificados

1. **`src/stores/cenarios-store.ts`**
   - Função `addCenario`: Insere despesas após criar cenário
   - Função `updateCenario`: Sincroniza despesas ao atualizar

2. **`src/services/comparativos-analise-service-completo.ts`**
   - Função `buscarDadosLucroReal`: Busca despesas e calcula créditos

---

## 🎯 Resultado Final

Agora quando você **editar qualquer despesa** e **salvar o cenário**:

- ✅ Despesas são salvas no banco (`despesas_dinamicas`)
- ✅ Créditos de PIS/COFINS são calculados automaticamente
- ✅ Impostos líquidos aparecem no comparativo
- ✅ Você pode comparar Lucro Real vs Lucro Presumido corretamente

**A edição de despesas agora persiste no banco de dados!** 🎉
