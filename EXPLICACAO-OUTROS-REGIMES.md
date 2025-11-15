# 📊 De onde vem "dadosOutrosRegimes"?

## 🗄️ **TABELA E COLUNAS**

### **Tabela:** `dados_comparativos_mensais`

### **Colunas principais:**
```sql
- id
- empresa_id          ← Filtro: busca pela empresa
- mes                 ← Ex: '01', '02', '03'...
- ano                 ← Ex: 2025, 2026
- regime              ← COLUNA CHAVE: 'lucro_real', 'lucro_presumido', 'simples_nacional'
- receita
- icms
- pis
- cofins
- irpj
- csll
- iss
- outros
- observacoes
- criado_em
- atualizado_em
```

---

## 🔄 **FLUXO DE DADOS**

### 1️⃣ **Supabase Service** (`src/services/comparativos-supabase.ts`)
```typescript
async obterDadosPorEmpresa(empresaId: string) {
  const { data } = await this.supabase
    .from('dados_comparativos_mensais')  // ← TABELA
    .select('*')
    .eq('empresa_id', empresaId)         // ← Filtro por empresa
    .order('ano', { ascending: false })
    .order('mes', { ascending: false })

  return data?.map(item => this.fromSupabaseFormat(item)) || []
}
```

**Resultado:** Retorna TODOS os dados da empresa (Lucro Real + Lucro Presumido + Simples Nacional)

---

### 2️⃣ **Store** (`src/stores/regimes-tributarios-store.ts`)
```typescript
obterDadosPorEmpresa: (empresaId) => {
  return state.dadosComparativos
    .filter((dado) => {
      return dado.empresaId === empresaId
    })
}
```

**Resultado:** Retorna dados filtrados da store

---

### 3️⃣ **Hook** (`src/hooks/use-comparativos-integrados.ts`)
```typescript
const dadosOutrosRegimes = useMemo(() => {
  return obterDadosPorEmpresa(empresaId).filter(
    dado => dado.ano === ano && dado.regime !== 'lucro_real'  // ← FILTRO CHAVE
  )
}, [empresaId, ano, obterDadosPorEmpresa])
```

**Resultado:** 
- ❌ Remove `regime = 'lucro_real'`
- ✅ Mantém `regime = 'lucro_presumido'`
- ✅ Mantém `regime = 'simples_nacional'`

---

### 4️⃣ **Page Component** (`page.tsx`)
```typescript
const obterInfoRegimeInserido = () => {
  // Agrupar por regime (lê da coluna 'regime' da tabela)
  const dadosPorRegime = dadosOutrosRegimes.reduce((acc, dado) => {
    if (!acc[dado.regime]) acc[dado.regime] = []
    acc[dado.regime].push(dado)
    return acc
  }, {})
  
  // Mapear nomes
  const nomeRegimes = {
    'lucro_presumido': 'Lucro Presumido',   // ← Da coluna 'regime'
    'simples_nacional': 'Simples Nacional'  // ← Da coluna 'regime'
  }
  
  // Retorna o regime com mais dados
  return { nome: nomeRegime, descricao: totalImpostos }
}
```

**Resultado no Card:**
```tsx
<CardTitle>{infoRegimeInserido.nome}</CardTitle>
<!-- Mostra "Lucro Presumido" ou "Simples Nacional" baseado na coluna 'regime' -->
```

---

## 📝 **RESUMO**

| Origem | Dados |
|--------|-------|
| **Tabela** | `dados_comparativos_mensais` |
| **Coluna chave** | `regime` |
| **Valores possíveis** | `'lucro_real'`, `'lucro_presumido'`, `'simples_nacional'` |
| **O que é "Outros Regimes"?** | Todos os regimes **EXCETO** `'lucro_real'` |
| **Portanto inclui:** | `'lucro_presumido'` + `'simples_nacional'` |

---

## ✅ **CONCLUSÃO**

**"dadosOutrosRegimes"** NÃO é um valor da coluna `regime`!

É apenas o nome da variável que significa:
- "Dados de regimes que não são Lucro Real"
- = Lucro Presumido + Simples Nacional
- Lidos diretamente da coluna `regime` da tabela `dados_comparativos_mensais`

**O card mostra dinamicamente:**
- Se inseriu `regime = 'lucro_presumido'` → mostra **"Lucro Presumido"**
- Se inseriu `regime = 'simples_nacional'` → mostra **"Simples Nacional"**
- Se inseriu ambos → mostra o que tem mais dados
