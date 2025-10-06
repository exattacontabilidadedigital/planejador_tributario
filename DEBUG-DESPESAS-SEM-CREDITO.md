# 🔍 DEBUG: Despesas SEM Crédito Não Sendo Salvas

## ❌ Problema Reportado:
Despesas SEM crédito PIS/COFINS:
- ✅ Estão sendo salvas no JSON `configuracao.despesasDinamicas`
- ❌ **NÃO** estão sendo salvas na tabela `despesas_dinamicas`

Exemplo:
- Internet Loja - R$ 150,00 (sem-credito) ❌ NÃO aparece na tabela
- Internet Oficina - R$ 120,00 (sem-credito) ❌ NÃO aparece na tabela

---

## 🔧 Correção Aplicada:

Adicionei logs detalhados para identificar o problema:

```typescript
// Logs no console ao salvar:
console.log('📋 Lista de despesas:')
console.log('   • COM crédito: X')
console.log('   • SEM crédito: Y')  ← Verifica se as SEM crédito estão no array

// Antes de inserir:
console.log('📤 Dados que serão inseridos:')
console.log('   • Total a inserir: Z')
console.log('   • COM crédito: X')
console.log('   • SEM crédito: Y')  ← Verifica se estão indo para o banco

// Se houver SEM crédito:
console.log('🔴 DESPESAS SEM CRÉDITO que serão inseridas:')
// Lista cada uma individualmente
```

---

## 🧪 TESTE AGORA:

1. **Recarregue a página do cenário** (F5)
2. **Abra o console** (F12) e limpe (Ctrl+L)
3. **Adicione uma despesa SEM crédito:**
   - Descrição: **TESTE SEM CREDITO**
   - Valor: **R$ 999,00**
   - Tipo: Despesa Operacional
   - **IMPORTANTE**: Adicione na aba **"Despesas SEM Crédito"** (X vermelho)
4. **Clique em "Salvar Rascunho"**

---

## 📊 O que você DEVE ver no console:

```
📋 Lista de despesas:
   • COM crédito: 13
   • SEM crédito: 3  ← DEVE aparecer!
   1. ✅ Energia - R$ 15000 (com-credito)
   ...
   14. ❌ Internet Loja - R$ 150 (sem-credito)
   15. ❌ Internet Oficina - R$ 120 (sem-credito)
   16. ❌ TESTE SEM CREDITO - R$ 999 (sem-credito)  ← SUA NOVA!

💾 PASSO 2: Inserindo despesas atualizadas...
📤 Dados que serão inseridos:
   • Total a inserir: 16
   • COM crédito: 13
   • SEM crédito: 3  ← DEVE ter 3!

🔴 DESPESAS SEM CRÉDITO que serão inseridas:
   1. Internet Loja - R$ 150
   2. Internet Oficina - R$ 120
   3. TESTE SEM CREDITO - R$ 999  ← DEVE aparecer!

✅ SUCESSO! 16 despesas inseridas na tabela despesas_dinamicas
```

---

## ❓ Possíveis Cenários:

### Cenário 1: SEM crédito aparece na lista mas NÃO é inserida
**Logs esperados:**
```
📋 Lista de despesas:
   • SEM crédito: 3  ✅

📤 Dados que serão inseridos:
   • SEM crédito: 3  ✅

🔴 DESPESAS SEM CRÉDITO que serão inseridas:
   1. Internet Loja...  ✅

❌ ERRO ao inserir despesas!  ← PROBLEMA NO INSERT
```

**Causa:** Erro no Supabase (constraint, tipo de coluna, etc.)

---

### Cenário 2: SEM crédito NÃO aparece na lista
**Logs esperados:**
```
📋 Lista de despesas:
   • SEM crédito: 0  ❌  PROBLEMA AQUI!

📤 Dados que serão inseridos:
   • SEM crédito: 0  ❌
```

**Causa:** Despesas SEM crédito não estão no `config.despesasDinamicas`

---

### Cenário 3: SEM crédito aparece mas quantidade errada
**Logs esperados:**
```
📋 Lista de despesas:
   • SEM crédito: 1  ← Deveria ser 3!
```

**Causa:** Algumas despesas SEM crédito não estão sendo salvas no `updateConfig`

---

## 🎯 FAÇA O TESTE E ME MOSTRE:

1. **Print completo do console** após clicar em "Salvar"
2. **Especialmente estas linhas:**
   - `• SEM crédito: X` (quantas foram encontradas)
   - `🔴 DESPESAS SEM CRÉDITO que serão inseridas:` (lista)
   - Se apareceu `✅ SUCESSO!` ou `❌ ERRO!`

Com essas informações vou identificar EXATAMENTE onde está o problema! 🔍
