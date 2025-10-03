# 🚀 Implementação do Blueprint v2.0 - Planejador Tributário

## ✅ Progresso Atual

### Fase 1: Refatoração de Rotas e Empresas (EM PROGRESSO)

#### ✅ Completado:

1. **Tipos TypeScript**
   - ✅ `src/types/empresa.ts` - Interface Empresa e EmpresaFormData
   - ✅ `src/types/cenario.ts` - Interface Cenario refatorada com período
   - ✅ `src/types/relatorio.ts` - Interfaces para relatórios consolidados

2. **Stores Zustand**
   - ✅ `src/stores/empresas-store.ts` - Gerenciamento de empresas
   - ✅ `src/stores/cenarios-store.ts` - Gerenciamento de cenários por empresa

3. **Dependências Instaladas**
   - ✅ `recharts` - Gráficos React
   - ✅ `@tanstack/react-table` - Tabelas avançadas
   - ✅ `xlsx` - Exportação Excel
   - ✅ `date-fns` - Manipulação de datas

4. **Páginas Criadas**
   - ✅ `/app/empresas/page.tsx` - Lista de empresas
   - ✅ `/app/empresas/nova/page.tsx` - Formulário criar empresa
   - ✅ `/app/empresas/[id]/page.tsx` - Dashboard da empresa

---

## 📋 Próximos Passos

### Fase 1 (Continuação):
- [ ] Página de configurações da empresa (`/empresas/[id]/configuracoes`)
- [ ] Componente EmpresaCard
- [ ] Hooks personalizados (`use-empresa`, `use-cenarios`)

### Fase 2: Cenários
- [ ] Página lista de cenários (`/empresas/[id]/cenarios/page.tsx`)
- [ ] Página criar cenário (`/empresas/[id]/cenarios/novo/page.tsx`)
- [ ] Página editar cenário (`/empresas/[id]/cenarios/[cenarioId]/page.tsx`)
- [ ] Componente Timeline de cenários
- [ ] Componente CenarioCard

### Fase 3: Dashboard
- [ ] Implementar KPIs reais (cálculos agregados)
- [ ] Gráfico de evolução últimos 12 meses
- [ ] Resumo financeiro

### Fase 4: Relatórios ⭐ (PRIORITÁRIO)
- [ ] Página `/empresas/[id]/relatorios`
- [ ] 5 tipos de gráficos:
  - [ ] Evolução temporal (LineChart)
  - [ ] Composição tributária (PieChart)
  - [ ] Margem de lucro (GaugeChart)
  - [ ] Comparativo mensal (BarChart)
  - [ ] Carga tributária (AreaChart)
- [ ] Tabela consolidada
- [ ] Exportação Excel/PDF

### Fase 5: Comparativos
- [ ] Página `/empresas/[id]/comparativos`
- [ ] Seletor múltiplos cenários
- [ ] Gráficos comparativos
- [ ] Tabela de variações
- [ ] Insights automáticos

---

## 🗄️ Estrutura de Dados

### Empresa
```typescript
interface Empresa {
  id: string
  nome: string
  cnpj: string
  razaoSocial: string
  regimeTributario: 'lucro-real' | 'lucro-presumido' | 'simples'
  setor: 'comercio' | 'industria' | 'servicos'
  uf: string
  municipio: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  criadoEm: string
  atualizadoEm: string
}
```

### Cenário
```typescript
interface Cenario {
  id: string
  empresaId: string // ⭐ Novo relacionamento
  nome: string
  descricao?: string
  periodo: PeriodoCenario
  config: TaxConfig
  status: 'rascunho' | 'aprovado' | 'arquivado'
  criadoEm: string
  atualizadoEm: string
  tags?: string[]
}
```

---

## 📦 Rotas Implementadas

- ✅ `/empresas` - Lista de empresas
- ✅ `/empresas/nova` - Criar empresa
- ✅ `/empresas/[id]` - Dashboard empresa
- ⏳ `/empresas/[id]/cenarios` - Lista cenários
- ⏳ `/empresas/[id]/cenarios/novo` - Criar cenário
- ⏳ `/empresas/[id]/cenarios/[cenarioId]` - Editar cenário
- ⏳ `/empresas/[id]/relatorios` - Relatórios e gráficos
- ⏳ `/empresas/[id]/comparativos` - Comparar cenários
- ⏳ `/empresas/[id]/configuracoes` - Config empresa

---

## 🔧 Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Estado**: Zustand + Persist
- **UI**: Shadcn/ui + Tailwind CSS
- **Gráficos**: Recharts
- **Tabelas**: TanStack Table
- **Exportação**: jsPDF + xlsx
- **Datas**: date-fns
- **Validação**: Zod + React Hook Form

---

## 🚦 Status do Projeto

**Fase 1**: 🟡 40% Completo  
**Fase 2**: ⚪ 0% Completo  
**Fase 3**: ⚪ 0% Completo  
**Fase 4**: ⚪ 0% Completo  
**Fase 5**: ⚪ 0% Completo  

**Total Geral**: 🟡 8% Completo

---

## 📝 Notas de Implementação

### Decisões de Design:
1. **Zustand Persist**: Dados salvos no localStorage para MVP
2. **Rotas Separadas**: Cada funcionalidade em rota própria (permite abas múltiplas)
3. **Relacionamento**: Cenário ↔ Empresa via `empresaId`
4. **Status de Cenário**: Rascunho → Aprovado → Arquivado

### Melhorias Futuras:
- [ ] Backend (Supabase/Firebase) para sincronização
- [ ] Autenticação de usuários
- [ ] Colaboração em equipe
- [ ] Versionamento de cenários
- [ ] Export automático para contabilidade

---

## 🎯 Objetivos do Blueprint

- ✅ Organização por empresa
- ✅ Contexto temporal (mês/trimestre/ano)
- ⏳ Análises visuais (gráficos)
- ⏳ Comparações entre cenários
- ⏳ Insights automáticos
- ✅ Rotas separadas (múltiplas abas)

---

**Última Atualização**: 03/10/2025
