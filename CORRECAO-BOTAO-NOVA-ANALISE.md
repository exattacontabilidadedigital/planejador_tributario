# 🔧 Correção: Botão "Nova Análise Comparativa"

## 📋 Problema Identificado

O botão "Nova Análise Comparativa" não estava funcionando corretamente porque:

1. ❌ O modal não estava passando as props `aberto` e `onFechar` para o wizard
2. ❌ O wizard não estava resetando o estado quando o modal abria
3. ❌ Faltavam logs de debug para identificar problemas

## ✅ Correções Aplicadas

### 1. **Modal Atualizado** (`modal-criar-comparativo.tsx`)
```tsx
// ANTES
<WizardCriarComparativoCompleto
  empresaId={empresaId}
  onConcluir={handleConcluir}
/>

// DEPOIS
<WizardCriarComparativoCompleto
  empresaId={empresaId}
  aberto={aberto}           // ✅ Adicionado
  onFechar={onFechar}       // ✅ Adicionado
  onConcluir={handleConcluir}
/>
```

### 2. **Wizard com Reset Automático** (`wizard-criar-comparativo-completo.tsx`)

**Adicionado novo useEffect para resetar estado:**
```tsx
// Resetar wizard quando abrir
useEffect(() => {
  if (aberto) {
    console.log('Modal aberto - resetando wizard', { empresaId, ano })
    // Resetar para etapa 1
    setEtapa(1)
    // Limpar seleções
    setCenariosDisponiveis([])
    setDadosLP([])
    setDadosSN([])
  }
}, [aberto])
```

**Adicionados logs de debug:**
```tsx
// Console logs para debug
console.log('📊 Buscando cenários do Supabase:', { empresaId, ano })
console.log('✅ Cenários encontrados:', cenarios?.length || 0)
console.log('Carregando dados manuais...', { empresaId, ano })
```

## 🧪 Como Testar

### Passo 1: Abrir a aplicação
```bash
npm run dev
```

### Passo 2: Navegar até Comparativos
1. Acessar qualquer empresa
2. Ir para a página "Comparativos"

### Passo 3: Clicar no botão "Nova Análise Comparativa"
- O modal deve abrir
- Deve aparecer a **Etapa 1** (Informações Básicas)
- No console do navegador devem aparecer os logs:
  ```
  Modal aberto - resetando wizard {empresaId: "...", ano: 2025}
  ```

### Passo 4: Preencher Etapa 1 e avançar
- Preencher nome (mínimo 3 caracteres)
- Selecionar pelo menos 1 mês
- Clicar em "Próxima"

### Passo 5: Verificar Etapa 2 (Cenários)
- Deve aparecer loading
- No console:
  ```
  Carregando cenários... {empresaId: "...", ano: 2025}
  📊 Buscando cenários do Supabase: {empresaId: "...", ano: 2025}
  ✅ Cenários encontrados: X
  ```
- Deve listar cenários aprovados (se existirem)

### Passo 6: Avançar para Etapa 3 (Dados Manuais)
- No console:
  ```
  Carregando dados manuais... {empresaId: "...", ano: 2025}
  ```
- Deve listar dados de LP e SN (se existirem)

### Passo 7: Completar criação
- Revisar na Etapa 4
- Clicar em "Criar Análise Comparativa"
- Deve criar o comparativo no banco
- Deve redirecionar para a página de visualização

## 🐛 Debug - Se ainda não funcionar

### Verificar Console do Navegador (F12)
1. Abrir DevTools (F12)
2. Ir para aba "Console"
3. Clicar no botão "Nova Análise Comparativa"
4. Verificar logs:
   - ✅ "Modal aberto - resetando wizard" → Modal abriu
   - ❌ Erros em vermelho → Problema de conexão ou permissões

### Verificar Rede (Network)
1. Ir para aba "Network" no DevTools
2. Filtrar por "cenarios"
3. Clicar no botão
4. Verificar requisição para Supabase
5. Ver se retornou 200 OK ou erro

### Verificar Dados no Supabase
```sql
-- Verificar se existem cenários aprovados
SELECT * FROM cenarios 
WHERE empresa_id = 'SEU_EMPRESA_ID' 
  AND periodo_ano = 2025 
  AND status = 'aprovado';

-- Verificar dados manuais
SELECT * FROM dados_comparativos_mensais
WHERE empresa_id = 'SEU_EMPRESA_ID'
  AND ano = 2025;
```

## 📌 Validações Implementadas

### Etapa 1:
- ✅ Nome: 3-100 caracteres
- ✅ Pelo menos 1 mês selecionado
- ✅ Máximo 12 meses
- ✅ Ano válido (2020-2027)
- ✅ Alerta para períodos futuros

### Etapa 2:
- ✅ Verifica disponibilidade de cenários
- ✅ Mínimo 1 cenário selecionado
- ✅ Alerta se mais de 5 cenários
- ✅ Verifica cobertura de meses
- ✅ Alerta se cenários não cobrem todos os meses

### Etapa 3:
- ✅ Mínimo 2 regimes diferentes
- ✅ Alerta se poucos dados (< 50% dos meses)
- ✅ Verifica sobreposição de meses entre regimes
- ✅ Verifica qualidade dos dados (receita/impostos zerados)

## 🎯 Próximos Passos (se necessário)

### Se não houver cenários:
1. Criar cenários primeiro na página de Cenários
2. Aprovar os cenários
3. Voltar para Comparativos

### Se não houver dados manuais:
1. Ir para aba "Adicionar Dados" em Comparativos
2. Adicionar dados de Lucro Presumido
3. Adicionar dados de Simples Nacional
4. Voltar e tentar criar comparativo

## ✨ Funcionalidades Adicionais Disponíveis

Após criar o comparativo, você terá acesso a:
- 📊 **7 Gráficos diferentes**
- 📄 **Exportação em PDF**
- 🔄 **Duplicação**
- ⭐ **Favoritar**
- 🔔 **Notificações**
- 🔍 **Filtros avançados**
- 📋 **Templates predefinidos**

---

## 🆘 Suporte

Se ainda assim não funcionar, verifique:
1. ✅ Servidor dev rodando (`npm run dev`)
2. ✅ Supabase conectado (check variáveis de ambiente)
3. ✅ Permissões RLS no Supabase
4. ✅ Console do navegador (erros em vermelho)
5. ✅ Dados existem no banco (cenários + dados manuais)
