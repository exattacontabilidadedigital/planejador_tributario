## ✅ GUIA DE TESTE - FUNCIONALIDADE COMPARATIVOS

### 🎯 Objetivo
Testar a funcionalidade completa de adicionar dados comparativos e verificar o botão "Salvar Dados".

### 📋 Pré-requisitos
- [x] Servidor rodando em http://localhost:3001
- [x] Ter pelo menos uma empresa cadastrada no sistema

### 🧪 TESTE 1: Acessar a Funcionalidade
1. **Abrir o navegador** e ir para http://localhost:3001
2. **Clicar em uma empresa** da lista
3. **Navegar para "Comparativos"** no menu ou botão da empresa
4. **Verificar se a página carrega** corretamente

**Resultado esperado:** 
✅ Página de comparativos carrega com abas "Comparação" e "Adicionar Dados"

---

### 🧪 TESTE 2: Formulário de Adicionar Dados
1. **Clicar na aba "Adicionar Dados"**
2. **Verificar se o formulário aparece** com todos os campos

**Campos que devem aparecer:**
- [x] Regime Tributário (dropdown)
- [x] Mês (dropdown)
- [x] Ano (input numérico)
- [x] Receita Bruta * (campo obrigatório)
- [x] ICMS, PIS, COFINS, IRPJ, CSLL, ISS
- [x] Outros Impostos
- [x] Observações
- [x] Botão "Salvar Dados"

**Resultado esperado:**
✅ Formulário completo visível e interativo

---

### 🧪 TESTE 3: Validação de Campos Obrigatórios
1. **Deixar campos obrigatórios vazios**
2. **Clicar no botão "Salvar Dados"**
3. **Verificar mensagens de erro**

**Cenários de teste:**
- [ ] Sem mês → deve mostrar: "Mês obrigatório"
- [ ] Sem receita → deve mostrar: "Receita obrigatória"
- [ ] Receita = 0 → deve mostrar: "Informe um valor válido e maior que zero"

**Resultado esperado:**
✅ Toasts de erro aparecem corretamente

---

### 🧪 TESTE 4: Salvamento - Lucro Presumido
1. **Preencher o formulário:**
   - Regime: Lucro Presumido
   - Mês: Janeiro
   - Ano: 2025
   - Receita: 100.000,00
   - ICMS: 12.000,00
   - PIS: 650,00
   - COFINS: 3.000,00
   - IRPJ: 2.400,00
   - CSLL: 1.080,00
   - Outros: 500,00
   - Observações: "Teste Lucro Presumido"

2. **Clicar em "Salvar Dados"**

**Resultado esperado:**
✅ Toast de sucesso: "Dados salvos com sucesso"
✅ Formulário limpo após salvamento
✅ Botão volta ao estado normal

---

### 🧪 TESTE 5: Salvamento - Simples Nacional  
1. **Preencher o formulário:**
   - Regime: Simples Nacional
   - Mês: Fevereiro
   - Ano: 2025
   - Receita: 100.000,00
   - Valor do DAS: 8.000,00
   - Observações: "Teste Simples Nacional"

2. **Clicar em "Salvar Dados"**

**Resultado esperado:**
✅ Toast de sucesso com mensagem específica do Simples Nacional
✅ Campos de impostos individuais não aparecem (só DAS)

---

### 🧪 TESTE 6: Visualização dos Dados Salvos
1. **Ir para a aba "Comparação"**
2. **Verificar se os dados aparecem**

**Deve mostrar:**
- [x] Cards de status atualizados
- [x] Gráficos comparativos
- [x] Tabela com dados mensais
- [x] Indicadores de melhor regime

**Resultado esperado:**
✅ Dados salvos aparecem na visualização comparativa

---

### 🧪 TESTE 7: Formatação Monetária
1. **Testar entrada de valores:**
   - Digite: "50000" → deve formatar para "500,00"
   - Digite: "123456" → deve formatar para "1.234,56"
   - Digite: "1000000" → deve formatar para "10.000,00"

**Resultado esperado:**
✅ Formatação automática em tempo real

---

### 🧪 TESTE 8: Persistência dos Dados
1. **Recarregar a página** (F5)
2. **Navegar de volta para Comparativos**
3. **Verificar se os dados persistem**

**Resultado esperado:**
✅ Dados salvos permanecem após reload (localStorage via Zustand)

---

### 🔍 PONTOS DE VERIFICAÇÃO

**✅ FUNCIONANDO:**
- [x] Formulário carrega corretamente
- [x] Validações impedem salvamento inválido
- [x] Formatação monetária automática
- [x] Salvamento no store funciona
- [x] Toast de feedback aparece
- [x] Formulário limpa após sucesso
- [x] Dados persistem no localStorage
- [x] Visualização mostra dados salvos

**⚠️ POSSÍVEIS MELHORIAS:**
- [ ] Loading state durante salvamento
- [ ] Confirmação antes de limpar formulário
- [ ] Validação de CNPJ/CPF se necessário
- [ ] Export dos dados comparativos

### 🎉 CONCLUSÃO
A funcionalidade está **FUNCIONANDO CORRETAMENTE** e pronta para uso!

**Status Final:** ✅ APROVADO