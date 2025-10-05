# 🔍 INVESTIGAÇÃO: DADOS NA DASHBOARD SEM CENÁRIOS

## 🚨 **PROBLEMA IDENTIFICADO**

### **📊 Situação:**
- Empresa nova criada sem cenários no banco
- Dashboard mostra dados mesmo sem cenários salvos
- Botão "Atualizar Dados" traz informações que não deveriam existir

---

## 🔧 **LOGS DE DEBUG IMPLEMENTADOS**

### **1. 📝 Hook useRelatoriosSimples**
```typescript
console.log('🔍 [useRelatoriosSimples] Hook executado com cenários:', {
  quantidade: cenarios.length,
  cenarios: cenarios.map(c => ({ id: c.id, nome: c.nome, empresaId: c.empresaId }))
})
```

### **2. 📊 Store de Cenários**
```typescript
console.log('📊 [CENÁRIOS STORE] Resposta do Supabase:', {
  sucesso: !error,
  quantidadeResultados: data?.length || 0,
  dados: data?.map(d => ({ id: d.id, nome: d.nome, empresa_id: d.empresa_id }))
})
```

### **3. 🎯 Dashboard Principal**
```typescript
console.log('📊 [DASHBOARD] Dados do useRelatoriosSimples:', {
  loading: relatoriosLoading,
  resumoGeral,
  totalCenarios,
  melhorCenario
})
```

---

## 🕵️ **POSSÍVEIS CAUSAS IDENTIFICADAS**

### **1. 🗄️ Cache Persistido (Zustand)**
- **Store persistindo** cenários no localStorage
- **Configuração**: `name: 'cenarios-storage'`
- **Risco**: Dados antigos sendo carregados mesmo após limpar banco

### **2. 📦 Estado Inicial Incorreto**
- **Hook** pode estar retornando dados de fallback
- **Cálculos** podem estar sendo feitos com dados vazios/padrão
- **Loading states** podem estar mostrando dados temporários

### **3. 🔄 Timing de Carregamento**
- **Hydration** pode estar causando discrepâncias
- **useEffect** executando antes da limpeza do estado
- **Race conditions** entre localStorage e API

---

## 🛠️ **FERRAMENTAS DE DEBUG CRIADAS**

### **💻 Console Debug Tools:**
```javascript
// Inspecionar cache atual
debugCenarios.inspecionar()

// Limpar cache completamente
debugCenarios.limparCache()
```

### **📋 Como Usar:**
1. Abra as Ferramentas de Desenvolvedor (F12)
2. Execute `debugCenarios.inspecionar()` para ver cache
3. Se houver dados antigos, execute `debugCenarios.limparCache()`
4. Recarregue a página e teste novamente

---

## 🎯 **PRÓXIMOS PASSOS DE INVESTIGAÇÃO**

### **1. ✅ Verificar Console Logs**
```bash
# No navegador (F12 > Console):
- 🔍 [useRelatoriosSimples] Hook executado...
- 📊 [CENÁRIOS STORE] Resposta do Supabase...
- 📊 [DASHBOARD] Dados do useRelatoriosSimples...
- 🏗️ [CENÁRIOS STORE] Store inicializado...
```

### **2. 🧹 Testar Cache**
1. Abrir empresa nova
2. Executar `debugCenarios.inspecionar()`
3. Verificar se há dados persistidos
4. Limpar cache se necessário
5. Recarregar e testar

### **3. 📊 Validar Fluxo de Dados**
- Verificar se `fetchCenarios` retorna array vazio
- Confirmar se `useRelatoriosSimples` recebe dados vazios
- Validar se dashboard renderiza estado correto

---

## 🔧 **CORREÇÕES PLANEJADAS**

### **1. 📦 Se for problema de Cache:**
```typescript
// Limpar cache automaticamente quando não há cenários
if (data.length === 0 && empresaId) {
  localStorage.removeItem('cenarios-storage')
}
```

### **2. 🛡️ Se for problema de Validação:**
```typescript
// Melhorar validação no hook
if (!cenarios.length || cenarios.every(c => c.empresaId !== empresaId)) {
  return dadosVazios
}
```

### **3. ⚡ Se for problema de Timing:**
```typescript
// Aguardar carregamento completo antes de calcular
if (isLoading || !mounted) {
  return dadosVazios
}
```

---

## 📱 **INSTRUÇÕES PARA REPRODUZIR E DEBUGAR**

### **🔄 Passos para Investigação:**
1. **Abrir** http://localhost:3000
2. **Navegar** para uma empresa recém-criada
3. **Abrir** Ferramentas de Desenvolvedor (F12)
4. **Executar** `debugCenarios.inspecionar()` no console
5. **Clicar** em "Atualizar Dados"
6. **Observar** logs detalhados no console
7. **Analisar** de onde vêm os dados

### **🧹 Limpeza para Teste:**
```javascript
// Limpar tudo e recomeçar
debugCenarios.limparCache()
location.reload()
```

---

## 📊 **STATUS ATUAL**

### **✅ Implementado:**
- ✅ Logs detalhados em todos os pontos críticos
- ✅ Ferramentas de debug para cache
- ✅ Rastreamento completo do fluxo de dados
- ✅ Validação de estado do store

### **🔄 Em Investigação:**
- 🔍 Origem exata dos dados fantasma
- 🗄️ Cache persistido como fonte provável
- ⏱️ Timing de carregamento e hydration

### **📋 Próximo Passo:**
**Abrir o navegador, executar os comandos de debug e analisar os logs para identificar a fonte exata dos dados.**

---

*Debug implementado em: ${new Date().toISOString()}*  
*Ferramentas: Console logs + Cache inspection*  
*Status: 🔍 Pronto para investigação detalhada*