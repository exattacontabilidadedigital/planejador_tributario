# 🧪 GUIA DE TESTE: Estrutura DRE no Comparativo

**Data:** 06/10/2025  
**Objetivo:** Validar que o comparativo está usando a estrutura completa da DRE

---

## 📋 Passo a Passo do Teste

### 1️⃣ **Abrir Cenário Janeiro**
- Navegue até: **Empresas > EMA Material de Construções > Cenários**
- Abra o cenário **"Janeiro"**
- Verifique a **aba DRE** e anote os valores:

```
✅ Valores Esperados da DRE:

Receita Bruta:              R$ 1.000.000,00
(-) Deduções:               R$    99.047,50
(=) Receita Líquida:        R$   900.952,50
(-) CMV:                    R$   500.000,00
(=) Lucro Bruto:            R$   400.952,50
(-) Despesas Operacionais:  R$   213.270,00
(=) LAIR:                   R$   187.682,50
(-) IRPJ:                   R$    47.682,50
(-) CSLL:                   R$    25.805,70
(=) Lucro Líquido:          R$   114.194,30
```

---

### 2️⃣ **Criar Novo Comparativo**
- Vá para: **Comparativos > Análise de Regimes**
- Clique em **"Novo Comparativo"**
- Configure:
  - **Nome:** "Teste DRE - Janeiro"
  - **Ano:** 2025
  - **Meses:** Selecione apenas "01 - Janeiro"
  - **Lucro Real:** Marque e selecione o cenário "Janeiro"
  - (Opcional) Adicione Lucro Presumido ou Simples para comparar

---

### 3️⃣ **Gerar e Validar Resultados**
- Clique em **"Gerar Análise"**
- Aguarde o processamento
- Abra o console do navegador (F12) para ver os logs detalhados

**Logs esperados no console:**
```
📊 [DRE] Processando cenário: Janeiro
   ✅ Receita Bruta: R$ 1.000.000,00
   ❌ Deduções (ICMS+PIS+COFINS+ISS): R$ 99.047,50
   = Receita Líquida: R$ 900.952,50
   ❌ CMV: R$ 500.000,00
   = Lucro Bruto: R$ 400.952,50
   ❌ Despesas Operacionais: R$ 213.270,00
   = LAIR (Lucro Antes IRPJ/CSLL): R$ 187.682,50
   ➕ Adições: R$ 0,00
   ➖ Exclusões: R$ 0,00
   = LUCRO REAL (Base IRPJ/CSLL): R$ 187.682,50
   💰 IRPJ: R$ 47.682,50
   💰 CSLL: R$ 25.805,70
   ✅ LUCRO LÍQUIDO: R$ 114.194,30
```

---

### 4️⃣ **Verificar Valores na Interface**
Na tela de resultados do comparativo, verifique:

**Seção: Lucro Real - Janeiro**
- ✅ **Total de Impostos:** R$ 166.805,70 (ICMS + PIS + COFINS + ISS + IRPJ + CSLL)
- ✅ **Carga Tributária:** ~16,68%
- ✅ **Lucro Líquido:** R$ 114.194,30

**Gráficos:**
- ✅ Gráfico de barras mostrando impostos detalhados
- ✅ Gráfico de linhas mostrando evolução (se tiver mais meses)
- ✅ Valores consistentes com a DRE

---

## ✅ Checklist de Validação

Marque cada item conforme valida:

### Cálculos Básicos
- [ ] Receita Líquida = Receita Bruta - Deduções
- [ ] Lucro Bruto = Receita Líquida - CMV
- [ ] LAIR = Lucro Bruto - Despesas Operacionais
- [ ] Lucro Real = LAIR + Adições - Exclusões
- [ ] Lucro Líquido = LAIR - IRPJ - CSLL

### Valores Específicos (Janeiro)
- [ ] LAIR = R$ 187.682,50
- [ ] Base IRPJ/CSLL = R$ 187.682,50
- [ ] IRPJ = R$ 47.682,50
- [ ] CSLL = R$ 25.805,70
- [ ] Lucro Líquido = R$ 114.194,30

### Créditos PIS/COFINS
- [ ] Despesas COM crédito identificadas (11 itens = R$ 213.000)
- [ ] Crédito PIS calculado (1,65% = R$ 3.514,50)
- [ ] Crédito COFINS calculado (7,6% = R$ 16.188,00)
- [ ] PIS deduzido no total de impostos
- [ ] COFINS deduzido no total de impostos

### Consistência
- [ ] Valores da DRE = Valores do Comparativo
- [ ] Console sem erros
- [ ] Gráficos renderizando corretamente
- [ ] Exportação para PDF funcionando

---

## 🐛 Possíveis Problemas

### **Problema 1: Valores Divergentes**
**Sintoma:** Lucro Líquido diferente entre DRE e Comparativo

**Diagnóstico:**
```javascript
// No console do navegador:
// Verifique se os valores intermediários estão corretos
console.log('Receita Líquida:', receitaLiquida)
console.log('Lucro Bruto:', lucroBruto)
console.log('LAIR:', lair)
```

**Solução:** Recarregar página e gerar novamente o comparativo

---

### **Problema 2: Créditos PIS/COFINS não Aplicados**
**Sintoma:** PIS e COFINS muito altos

**Diagnóstico:**
```javascript
// Verificar no console:
💳 [CRÉDITOS] Despesas COM crédito: R$ 213.000,00
   • Crédito PIS: R$ 3.514,50
   • Crédito COFINS: R$ 16.188,00
```

**Solução:** Verificar se despesas dinâmicas estão marcadas como "COM crédito"

---

### **Problema 3: Despesas Operacionais Duplicadas**
**Sintoma:** LAIR muito baixo ou negativo

**Diagnóstico:**
```javascript
// Deve mostrar APENAS despesas dinâmicas:
❌ Despesas Operacionais: R$ 213.270,00
// Se mostrar R$ 424.270,00 = ERRO (duplicação)
```

**Solução:** Já foi corrigido nos arquivos `use-memoria-irpj-csll.ts` e `calcular-impostos.ts`

---

## 📊 Dados de Referência (Janeiro)

### Estrutura Completa
```
┌─────────────────────────────────────────────────────────┐
│ RECEITA BRUTA                   R$ 1.000.000,00         │
├─────────────────────────────────────────────────────────┤
│ (-) ICMS                        R$    91.000,00         │
│ (-) PIS (após crédito)          R$     1.435,50         │
│ (-) COFINS (após crédito)       R$     6.612,00         │
│ (-) ISS                         R$         0,00         │
├─────────────────────────────────────────────────────────┤
│ (=) RECEITA LÍQUIDA             R$   900.952,50   ✅    │
├─────────────────────────────────────────────────────────┤
│ (-) CMV                         R$   500.000,00         │
├─────────────────────────────────────────────────────────┤
│ (=) LUCRO BRUTO                 R$   400.952,50   ✅    │
├─────────────────────────────────────────────────────────┤
│ (-) Despesas Operacionais       R$   213.270,00         │
├─────────────────────────────────────────────────────────┤
│ (=) LAIR                        R$   187.682,50   ✅    │
├─────────────────────────────────────────────────────────┤
│ (+) Adições                     R$         0,00         │
│ (-) Exclusões                   R$         0,00         │
├─────────────────────────────────────────────────────────┤
│ (=) LUCRO REAL (Base)           R$   187.682,50   ✅    │
├─────────────────────────────────────────────────────────┤
│ (-) IRPJ                        R$    47.682,50         │
│ (-) CSLL                        R$    25.805,70         │
├─────────────────────────────────────────────────────────┤
│ (=) LUCRO LÍQUIDO               R$   114.194,30   ✅    │
└─────────────────────────────────────────────────────────┘

Total de Impostos:                R$   166.805,70
Carga Tributária:                 16,68%
```

---

## 🎯 Resultado Esperado

Após o teste, você deve confirmar:

✅ **Todos os valores do comparativo batem com a DRE**  
✅ **Console mostra logs detalhados de cada etapa**  
✅ **Créditos PIS/COFINS aplicados corretamente**  
✅ **Gráficos e tabelas exibem dados consistentes**  
✅ **Exportação PDF funciona corretamente**

---

## 📝 Relatório de Teste

Preencha após executar o teste:

**Data/Hora:** ___/___/_____ às _____:_____  
**Navegador:** Chrome / Firefox / Edge / Safari  
**Status Geral:** ✅ Passou / ⚠️ Com ressalvas / ❌ Falhou  

**Valores Validados:**
- LAIR: R$ _______________
- Lucro Real (Base): R$ _______________
- Lucro Líquido: R$ _______________

**Observações:**
_________________________________________________________
_________________________________________________________
_________________________________________________________

**Testes Realizados por:** _____________________________

---

## ✅ Conclusão

Se todos os valores baterem com a DRE e o console mostrar os logs corretos, a correção está **100% funcional**! 🎉

Caso encontre alguma divergência, copie os logs do console e me envie para análise.
