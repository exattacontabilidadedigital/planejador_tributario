# 🚨 ATENÇÃO: Como Limpar Duplicatas e Caracteres Corrompidos

## ⚠️ Problema que Você Está Vendo

Sua **DRE** está mostrando:
- ✅ Despesas com acentos corretos: "Salários", "Energia Elétrica"  
- ❌ **E TAMBÉM** despesas corrompidas: "Sal�rios", "Energia El�trica"
- 📊 **Resultado:** Valores dobrados, cálculos errados!

---

## 🎯 Solução Rápida (3 Passos)

### 1️⃣ **Acesse Configurações**
- Clique na aba **"⚙️ Configurações"**
- Role até a seção **"PIS/COFINS"**

### 2️⃣ **Procure o Alerta Amarelo**
Você verá um **box amarelo** assim:

```
┌────────────────────────────────────────────────────┐
│ ⚠️ Caracteres Corrompidos Detectados               │
│                                                    │
│ Encontramos despesas com caracteres corrompidos   │
│ (�). Isso acontece quando o CSV não foi importado │
│ com UTF-8.                                        │
│                                                    │
│ [ Limpar Corrompidas ]                            │
└────────────────────────────────────────────────────┘
```

### 3️⃣ **Clique no Botão "Limpar"**
- Sistema remove **automaticamente** todas as despesas com `�`
- Mantém apenas as versões corretas (com UTF-8)
- **DRE atualiza instantaneamente** ✅

---

## 🔍 O Que o Sistema Faz

### Detecta Automaticamente:
- ❌ Despesas com caracteres `�` (corrompidas)
- ❌ Despesas duplicadas (mesma descrição + valor)

### Remove Inteligentemente:
- 🗑️ **Todas** as despesas com `�`
- 🔄 **Duplicatas**: mantém apenas a mais recente

### Preserva:
- ✅ Despesas únicas e corretas
- ✅ Acentuação perfeita (UTF-8)
- ✅ Valores corretos

---

## 📊 Exemplo Visual

### Antes da Limpeza:
```
DRE - Despesas Operacionais:
(-) Sal�rios e Encargos (PF)      - R$ 80.000,00  ← Corrompida
(-) Salários e Encargos (PF)      - R$ 80.000,00  ← Correta
(-) Energia El�trica              - R$ 15.000,00  ← Corrompida
(-) Energia Elétrica              - R$ 15.000,00  ← Correta
(-) Alugu�is                      - R$ 25.000,00  ← Corrompida
(-) Aluguéis                      - R$ 25.000,00  ← Correta

Total: R$ 240.000,00  ❌ DOBRADO!
```

### Depois da Limpeza:
```
DRE - Despesas Operacionais:
(-) Salários e Encargos (PF)      - R$ 80.000,00  ✅
(-) Energia Elétrica              - R$ 15.000,00  ✅
(-) Aluguéis                      - R$ 25.000,00  ✅

Total: R$ 120.000,00  ✅ CORRETO!
```

---

## ❓ FAQ - Perguntas Frequentes

### **P: Por que isso aconteceu?**
**R:** Você importou o CSV antes da correção UTF-8. Os caracteres foram salvos corrompidos no navegador (localStorage). Depois da correção, importou novamente e agora tem 2 versões (corrompida + correta).

### **P: Vou perder dados ao limpar?**
**R:** NÃO! O sistema:
- Remove apenas despesas com `�`
- Em duplicatas, mantém a mais recente (correta)
- Preserva todas as despesas únicas

### **P: E se eu tiver despesas legítimas duplicadas?**
**R:** Se você realmente tem 2 despesas iguais (ex: 2 faturas de energia no mesmo mês), adicione algo na descrição para diferenciar:
- "Energia Elétrica - Janeiro"
- "Energia Elétrica - Fevereiro"

### **P: Preciso fazer backup?**
**R:** Não é necessário. Você pode exportar para CSV antes de limpar se quiser segurança extra:
- Botão **"⬇️"** (Download) ao lado de "Importar CSV"

### **P: Posso desfazer a limpeza?**
**R:** Sim! Use o botão **"↻ Resetar"** no topo da página de Configurações (mas isso apaga TUDO e volta ao padrão).

### **P: O alerta amarelo não aparece. O que fazer?**
**R:** Significa que você NÃO tem duplicatas ou caracteres corrompidos. Está tudo ok! ✅

---

## 🎓 Prevenção para o Futuro

Para evitar esse problema novamente:

### ✅ **Sempre use o template UTF-8**
1. Baixe o modelo clicando em **"Baixar Modelo"**
2. Esse arquivo já vem com UTF-8 BOM correto
3. Edite no Excel normalmente

### ✅ **Verifique antes de importar**
- Abra o CSV no Bloco de Notas
- Veja se os acentos estão corretos
- Se aparecer `�`, o arquivo está corrompido

### ✅ **Salve corretamente no Excel**
Se criar CSV manualmente no Excel:
1. File → Save As
2. Formato: **"CSV UTF-8 (Comma delimited)"**
3. ✅ Isso adiciona BOM automaticamente

---

## 🆘 Ainda com Problemas?

### 1. **Tente recarregar a página**
   - Ctrl + F5 (força reload)

### 2. **Limpe o cache do navegador**
   - Ctrl + Shift + Delete
   - Marque "Cached images and files"
   - Clique em "Clear data"

### 3. **Última opção: Reset completo**
   - Botão "↻ Resetar" (topo da página Configurações)
   - **ATENÇÃO:** Isso apaga TUDO e volta ao padrão
   - Exporte seus dados antes!

---

## 📞 Suporte

Se o problema persistir após seguir este guia:
1. Tire um **screenshot** da DRE e do alerta
2. Exporte as despesas para CSV
3. Entre em contato com o suporte

---

## ✅ Checklist Rápido

- [ ] Acessei **Configurações** → **PIS/COFINS**
- [ ] Vi o **alerta amarelo** no topo
- [ ] Cliquei em **"Limpar Corrompidas"** ou **"Limpar Duplicatas"**
- [ ] DRE atualizou automaticamente
- [ ] Valores estão corretos agora
- [ ] Não aparecem mais caracteres `�`

**Se marcou todos ✅, problema resolvido!** 🎉

---

**Criado em:** 3 de outubro de 2025  
**Versão:** 1.0  
**Aplicativo:** Planejador Tributário DRE
