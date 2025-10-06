# 🔄 SOLUÇÃO: Valores Antigos na Aba IRPJ/CSLL

**Data:** 06/10/2025  
**Problema:** Aba IRPJ/CSLL do cenário Janeiro ainda mostra valores antigos (R$ 424.270 em vez de R$ 213.270)

---

## 🎯 Causa do Problema

O código foi corrigido, mas o **navegador está usando versão em cache** ou o **servidor Next.js não recarregou**.

---

## ✅ Solução Rápida (3 passos)

### **OPÇÃO 1: Hard Refresh no Navegador** (Mais Rápido)

1. **Abra a página** do cenário Janeiro
2. **Pressione as teclas:**
   - **Chrome/Edge:** `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
   - **Firefox:** `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)
3. **Aguarde** a página recarregar completamente
4. **Verifique** a aba IRPJ/CSLL:
   - ✅ Despesas Operacionais: R$ **213.270,00**

---

### **OPÇÃO 2: Limpar Cache + Reiniciar Servidor** (Mais Completo)

#### Passo 1: Limpar Cache do Next.js
```powershell
# No terminal PowerShell
node limpar-cache.js
```

Ou manualmente:
```powershell
# Parar o servidor (Ctrl+C se estiver rodando)

# Limpar pasta .next
Remove-Item -Recurse -Force .next

# Limpar cache do TypeScript
Remove-Item -Force tsconfig.tsbuildinfo

# Limpar cache do node_modules (opcional)
Remove-Item -Recurse -Force node_modules\.cache
```

#### Passo 2: Reiniciar Servidor
```powershell
npm run dev
```

#### Passo 3: Abrir Nova Aba no Navegador
- Não use a aba antiga (pode ter cache)
- Abra **nova aba anônima** (Ctrl + Shift + N)
- Navegue até: `http://localhost:3000`
- Abra o cenário Janeiro
- Verifique a aba **IRPJ/CSLL**

---

### **OPÇÃO 3: Limpar Cache do Navegador** (Se as anteriores não funcionarem)

#### Chrome/Edge:
1. Abra DevTools (F12)
2. Clique com botão direito no ícone **Atualizar** (ao lado da URL)
3. Selecione **"Limpar cache e atualizar forçado"**

#### Firefox:
1. `Ctrl + Shift + Del`
2. Selecione **"Cache"**
3. Clique em **"Limpar agora"**
4. Recarregue a página (F5)

---

## 🧪 Como Verificar se Funcionou

### **Valores Esperados (Janeiro):**

**Aba: IRPJ/CSLL - Memória de Cálculo**

```
┌─────────────────────────────────────────────────────────┐
│ Receita Bruta                   R$ 1.000.000,00         │
├─────────────────────────────────────────────────────────┤
│ (-) CMV                         R$   500.000,00         │
├─────────────────────────────────────────────────────────┤
│ (-) Despesas Operacionais       R$   213.270,00   ✅    │
├─────────────────────────────────────────────────────────┤
│ (=) Lucro Antes IRPJ/CSLL       R$   286.730,00   ✅    │
├─────────────────────────────────────────────────────────┤
│ (+) Adições                     R$         0,00         │
│ (-) Exclusões                   R$         0,00         │
├─────────────────────────────────────────────────────────┤
│ (=) LUCRO REAL                  R$   286.730,00   ✅    │
├─────────────────────────────────────────────────────────┤
│ IRPJ Base (15%)                 R$    43.009,50         │
│ IRPJ Adicional (10%)            R$     4.673,00         │
│ Total IRPJ                      R$    47.682,50   ✅    │
├─────────────────────────────────────────────────────────┤
│ CSLL (9%)                       R$    25.805,70   ✅    │
├─────────────────────────────────────────────────────────┤
│ TOTAL IRPJ + CSLL               R$    73.488,20   ✅    │
└─────────────────────────────────────────────────────────┘
```

### **❌ Se ainda mostrar valores ERRADOS:**
```
(-) Despesas Operacionais       R$   424.270,00   ❌ ERRADO
(=) Lucro Antes IRPJ/CSLL       R$    75.730,00   ❌ ERRADO
(=) LUCRO REAL                  R$    75.730,00   ❌ ERRADO
```

---

## 🔍 Debug Detalhado

Se ainda não funcionar, vamos verificar:

### **1. Verificar se o arquivo foi salvo:**
```powershell
# Verificar data de modificação
Get-Item src\hooks\use-memoria-irpj-csll.ts | Select-Object LastWriteTime
```

Deve mostrar data/hora recente (hoje, 06/10/2025).

### **2. Verificar conteúdo do arquivo:**
```powershell
# Mostrar linhas 14-18 (onde está a correção)
Get-Content src\hooks\use-memoria-irpj-csll.ts | Select-Object -Skip 13 -First 5
```

Deve mostrar:
```typescript
    // Somatório das despesas dinâmicas (somente tipo "despesa")
    // ✅ USAR APENAS DESPESAS DINÂMICAS (as despesas da config são valores de teste)
    const despesasOperacionais = (config.despesasDinamicas || [])
      .filter(d => d.tipo === 'despesa')
      .reduce((total, despesa) => total + despesa.valor, 0);
```

### **3. Verificar logs do console do navegador:**
```javascript
// Abrir DevTools (F12) → Console
// Procurar por:
"💼 [DESPESAS]"  // Deve mostrar 13 despesas
```

---

## 🎯 Checklist de Resolução

Marque conforme executa:

### **Tentativa 1: Hard Refresh**
- [ ] Abri a página do cenário Janeiro
- [ ] Pressionei Ctrl + Shift + R
- [ ] Página recarregou completamente
- [ ] Resultado: ✅ Funcionou / ❌ Não funcionou

### **Tentativa 2: Limpar Cache Next.js**
- [ ] Parei o servidor (Ctrl+C)
- [ ] Executei `node limpar-cache.js`
- [ ] Reiniciei com `npm run dev`
- [ ] Abri nova aba anônima
- [ ] Resultado: ✅ Funcionou / ❌ Não funcionou

### **Tentativa 3: Limpar Cache do Navegador**
- [ ] Limpei cache do navegador
- [ ] Fechei e abri novo navegador
- [ ] Acessei localhost:3000
- [ ] Resultado: ✅ Funcionou / ❌ Não funcionou

---

## 💡 Dica Extra

Se ainda não funcionar, verifique se o **arquivo correto** está sendo usado:

```typescript
// Adicione esta linha TEMPORÁRIA no início do hook:
export function useMemoriaIRPJCSLL(config: TaxConfig): MemoriaIRPJCSLL {
  console.log('🔍 [DEBUG] Hook IRPJ/CSLL carregado - VERSÃO CORRIGIDA ✅')
  console.log('💼 Despesas dinâmicas:', config.despesasDinamicas?.length || 0)
  
  return useMemo(() => {
    // ... resto do código
```

Se **NÃO** aparecer esse log no console, o arquivo não está sendo carregado.

---

## ✅ Confirmação Final

Após limpar cache e recarregar, você deve ver:

**Na aba IRPJ/CSLL:**
- ✅ Despesas Operacionais: R$ 213.270,00
- ✅ Lucro Antes IRPJ/CSLL: R$ 286.730,00
- ✅ Lucro Real: R$ 286.730,00
- ✅ Total IRPJ+CSLL: R$ 73.488,20

**No console do navegador:**
- ✅ Nenhum erro
- ✅ Logs mostrando 13 despesas dinâmicas

---

## 📞 Se Nada Funcionar

Execute este comando e me mostre o resultado:

```powershell
# Verificar hash do arquivo (confirmar se foi modificado)
Get-FileHash src\hooks\use-memoria-irpj-csll.ts -Algorithm MD5
```

E tire um screenshot da aba IRPJ/CSLL mostrando os valores atuais.

---

## 🎉 Sucesso!

Se funcionou, você deve ver os valores corretos:
- Diferença de **R$ 211.000** nas despesas (de 424k para 213k)
- LAIR aumentou de **R$ 75.730** para **R$ 286.730**
- Base IRPJ/CSLL correta agora!
