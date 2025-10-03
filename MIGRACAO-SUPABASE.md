# 🚀 MIGRAÇÃO PARA SUPABASE

**Data**: 03/10/2025  
**Status**: 📋 Planejamento  
**Versão**: 3.0.0 → 4.0.0

---

## 🎯 OBJETIVOS

### Por que Supabase?

✅ **Multi-device**: Sincronização automática entre dispositivos  
✅ **Backup automático**: Dados seguros na nuvem  
✅ **Multi-user** (futuro): Autenticação e controle de acesso  
✅ **PostgreSQL**: Banco robusto e confiável  
✅ **Real-time** (opcional): Atualizações em tempo real  
✅ **Free tier**: 500 MB + 50k usuários ativos/mês  
✅ **Type-safe**: Gera tipos TypeScript automaticamente

---

## 📋 PLANO DE MIGRAÇÃO (10 PASSOS)

### PASSO 1: Configurar Projeto Supabase

#### 1.1. Criar conta e projeto
```bash
# Acessar https://supabase.com
# Criar novo projeto: "tax-planner-react"
# Região: South America (São Paulo) ou US East
# Database Password: [senha segura]
```

#### 1.2. Obter credenciais
```
Project URL: https://[seu-projeto].supabase.co
Anon Key: [sua-chave-publica]
```

#### 1.3. Configurar variáveis de ambiente
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-publica]
```

---

### PASSO 2: Criar Schema do Banco de Dados

#### 2.1. Tabela `empresas`
```sql
-- Executar no SQL Editor do Supabase

CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  regime_tributario TEXT NOT NULL CHECK (regime_tributario IN ('lucro-real', 'lucro-presumido', 'simples')),
  setor TEXT NOT NULL CHECK (setor IN ('comercio', 'industria', 'servicos')),
  uf TEXT NOT NULL,
  municipio TEXT NOT NULL,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  logo_url TEXT,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auditoria (futuro)
  criado_por UUID REFERENCES auth.users(id),
  
  -- Índices
  CONSTRAINT cnpj_valido CHECK (cnpj ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
);

-- Índices para performance
CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX idx_empresas_nome ON empresas(nome);
CREATE INDEX idx_empresas_criado_por ON empresas(criado_por);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2.2. Tabela `cenarios`
```sql
CREATE TABLE cenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Período
  periodo_tipo TEXT NOT NULL CHECK (periodo_tipo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  periodo_mes INTEGER CHECK (periodo_mes BETWEEN 1 AND 12),
  periodo_ano INTEGER NOT NULL,
  periodo_trimestre INTEGER CHECK (periodo_trimestre BETWEEN 1 AND 4),
  
  -- Configuração tributária (JSONB para flexibilidade)
  config JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aprovado', 'arquivado')),
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Tags (array)
  tags TEXT[] DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT periodo_valido CHECK (periodo_fim >= periodo_inicio)
);

-- Índices
CREATE INDEX idx_cenarios_empresa_id ON cenarios(empresa_id);
CREATE INDEX idx_cenarios_status ON cenarios(status);
CREATE INDEX idx_cenarios_periodo_ano ON cenarios(periodo_ano);
CREATE INDEX idx_cenarios_tags ON cenarios USING GIN(tags);
CREATE INDEX idx_cenarios_config ON cenarios USING GIN(config);

-- Trigger
CREATE TRIGGER update_cenarios_updated_at
  BEFORE UPDATE ON cenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2.3. Tabela `comparativos`
```sql
CREATE TABLE comparativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Cenários comparados (array de UUIDs)
  cenarios_ids UUID[] NOT NULL,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT min_cenarios CHECK (array_length(cenarios_ids, 1) >= 2),
  CONSTRAINT max_cenarios CHECK (array_length(cenarios_ids, 1) <= 4)
);

-- Índices
CREATE INDEX idx_comparativos_empresa_id ON comparativos(empresa_id);
CREATE INDEX idx_comparativos_cenarios_ids ON comparativos USING GIN(cenarios_ids);

-- Trigger
CREATE TRIGGER update_comparativos_updated_at
  BEFORE UPDATE ON comparativos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2.4. Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparativos ENABLE ROW LEVEL SECURITY;

-- Políticas para modo SINGLE-USER (sem auth)
-- Todos podem fazer tudo (temporário, para MVP)
CREATE POLICY "Permitir tudo para empresas" ON empresas FOR ALL USING (true);
CREATE POLICY "Permitir tudo para cenarios" ON cenarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo para comparativos" ON comparativos FOR ALL USING (true);

-- FUTURO: Políticas para MULTI-USER (com auth)
/*
CREATE POLICY "Usuários veem suas empresas" ON empresas
  FOR SELECT USING (auth.uid() = criado_por);

CREATE POLICY "Usuários criam suas empresas" ON empresas
  FOR INSERT WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Usuários atualizam suas empresas" ON empresas
  FOR UPDATE USING (auth.uid() = criado_por);

CREATE POLICY "Usuários deletam suas empresas" ON empresas
  FOR DELETE USING (auth.uid() = criado_por);
*/
```

#### 2.5. Funções auxiliares (opcional)

```sql
-- Função para buscar cenários por empresa
CREATE OR REPLACE FUNCTION get_cenarios_by_empresa(empresa_uuid UUID)
RETURNS SETOF cenarios AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM cenarios
  WHERE empresa_id = empresa_uuid
  ORDER BY atualizado_em DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para validar cenários em comparativo
CREATE OR REPLACE FUNCTION validate_comparativo_cenarios()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se todos os cenários existem e pertencem à empresa
  IF NOT (
    SELECT COUNT(*) = array_length(NEW.cenarios_ids, 1)
    FROM cenarios
    WHERE id = ANY(NEW.cenarios_ids)
    AND empresa_id = NEW.empresa_id
  ) THEN
    RAISE EXCEPTION 'Todos os cenários devem pertencer à empresa';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_comparativo_cenarios_trigger
  BEFORE INSERT OR UPDATE ON comparativos
  FOR EACH ROW
  EXECUTE FUNCTION validate_comparativo_cenarios();
```

---

### PASSO 3: Instalar Dependências

```bash
cd d:\CODIGOS\copilot\tax-planner-react

# Instalar Supabase client
npm install @supabase/supabase-js @supabase/ssr

# Opcional: Gerador de tipos TypeScript
npm install --save-dev supabase
```

---

### PASSO 4: Configurar Cliente Supabase

#### 4.1. Criar `lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### 4.2. Criar `lib/supabase/server.ts` (para Server Components)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

#### 4.3. Gerar tipos TypeScript (opcional)
```bash
# Login no Supabase CLI
npx supabase login

# Gerar tipos
npx supabase gen types typescript --project-id [seu-projeto-id] > src/types/supabase.ts
```

---

### PASSO 5: Migrar `empresas-store`

#### 5.1. Criar `src/stores/empresas-store-supabase.ts`
```typescript
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Empresa, EmpresaFormData } from '@/types/empresa'

interface EmpresasState {
  empresas: Empresa[]
  empresaAtual: string | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchEmpresas: () => Promise<void>
  addEmpresa: (data: EmpresaFormData) => Promise<Empresa>
  updateEmpresa: (id: string, data: Partial<EmpresaFormData>) => Promise<void>
  deleteEmpresa: (id: string) => Promise<void>
  setEmpresaAtual: (id: string | null) => void
  getEmpresa: (id: string) => Empresa | undefined
}

export const useEmpresasStore = create<EmpresasState>()((set, get) => ({
  empresas: [],
  empresaAtual: null,
  loading: false,
  error: null,
  
  fetchEmpresas: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('criado_em', { ascending: false })
      
      if (error) throw error
      
      set({ 
        empresas: data || [],
        loading: false
      })
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false
      })
    }
  },
  
  addEmpresa: async (formData) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      
      // Converter formato
      const empresaData = {
        nome: formData.nome,
        cnpj: formData.cnpj,
        razao_social: formData.razaoSocial,
        regime_tributario: formData.regimeTributario,
        setor: formData.setor,
        uf: formData.uf,
        municipio: formData.municipio,
        inscricao_estadual: formData.inscricaoEstadual,
        inscricao_municipal: formData.inscricaoMunicipal,
      }
      
      const { data, error } = await supabase
        .from('empresas')
        .insert(empresaData)
        .select()
        .single()
      
      if (error) throw error
      
      // Converter de volta para camelCase
      const novaEmpresa: Empresa = {
        id: data.id,
        nome: data.nome,
        cnpj: data.cnpj,
        razaoSocial: data.razao_social,
        regimeTributario: data.regime_tributario as any,
        setor: data.setor as any,
        uf: data.uf,
        municipio: data.municipio,
        inscricaoEstadual: data.inscricao_estadual,
        inscricaoMunicipal: data.inscricao_municipal,
        criadoEm: data.criado_em,
        atualizadoEm: data.atualizado_em,
      }
      
      set((state) => ({
        empresas: [novaEmpresa, ...state.empresas],
        empresaAtual: state.empresas.length === 0 ? novaEmpresa.id : state.empresaAtual,
        loading: false
      }))
      
      return novaEmpresa
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false
      })
      throw error
    }
  },
  
  updateEmpresa: async (id, formData) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      
      const empresaData: any = {}
      if (formData.nome) empresaData.nome = formData.nome
      if (formData.cnpj) empresaData.cnpj = formData.cnpj
      if (formData.razaoSocial) empresaData.razao_social = formData.razaoSocial
      if (formData.regimeTributario) empresaData.regime_tributario = formData.regimeTributario
      if (formData.setor) empresaData.setor = formData.setor
      if (formData.uf) empresaData.uf = formData.uf
      if (formData.municipio) empresaData.municipio = formData.municipio
      if (formData.inscricaoEstadual !== undefined) empresaData.inscricao_estadual = formData.inscricaoEstadual
      if (formData.inscricaoMunicipal !== undefined) empresaData.inscricao_municipal = formData.inscricaoMunicipal
      
      const { error } = await supabase
        .from('empresas')
        .update(empresaData)
        .eq('id', id)
      
      if (error) throw error
      
      // Atualizar localmente
      await get().fetchEmpresas()
      
      set({ loading: false })
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false
      })
      throw error
    }
  },
  
  deleteEmpresa: async (id) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set((state) => ({
        empresas: state.empresas.filter((e) => e.id !== id),
        empresaAtual: state.empresaAtual === id ? null : state.empresaAtual,
        loading: false
      }))
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false
      })
      throw error
    }
  },
  
  setEmpresaAtual: (id) => {
    set({ empresaAtual: id })
  },
  
  getEmpresa: (id) => {
    return get().empresas.find((e) => e.id === id)
  },
}))
```

---

### PASSO 6: Migrar `cenarios-store`

```typescript
// Similar ao empresas-store, mas com handling especial para:
// - config (JSONB)
// - periodo (campos separados)

addCenario: async (empresaId, formData, config) => {
  const cenarioData = {
    empresa_id: empresaId,
    nome: formData.nome,
    descricao: formData.descricao,
    periodo_tipo: formData.periodo.tipo,
    periodo_inicio: formData.periodo.inicio,
    periodo_fim: formData.periodo.fim,
    periodo_mes: formData.periodo.mes,
    periodo_ano: formData.periodo.ano,
    periodo_trimestre: formData.periodo.trimestre,
    config: config, // JSONB automático
    status: formData.status || 'rascunho',
  }
  
  const { data, error } = await supabase
    .from('cenarios')
    .insert(cenarioData)
    .select()
    .single()
  
  // ... converter e retornar
}
```

---

### PASSO 7: Script de Migração de Dados

#### 7.1. Criar `scripts/migrate-to-supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

// Ler do localStorage
const empresasData = JSON.parse(localStorage.getItem('empresas-storage') || '{}')
const cenariosData = JSON.parse(localStorage.getItem('cenarios-storage') || '{}')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function migrate() {
  // 1. Migrar empresas
  const empresasMap = new Map()
  
  for (const empresa of empresasData.state.empresas) {
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        razao_social: empresa.razaoSocial,
        // ...
      })
      .select()
      .single()
    
    if (!error) {
      empresasMap.set(empresa.id, data.id)
    }
  }
  
  // 2. Migrar cenários com novos IDs de empresa
  // 3. Migrar comparativos
}

migrate()
```

---

### PASSO 8: Atualizar Componentes

```typescript
// app/empresas/page.tsx
"use client"

import { useEffect } from 'react'
import { useEmpresasStore } from '@/stores/empresas-store'

export default function EmpresasPage() {
  const { empresas, loading, fetchEmpresas } = useEmpresasStore()
  
  useEffect(() => {
    fetchEmpresas()
  }, [fetchEmpresas])
  
  if (loading) return <div>Carregando...</div>
  
  // ... resto do componente
}
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

| Aspecto | LocalStorage | Supabase |
|---------|--------------|----------|
| **Persistência** | Apenas local | Nuvem + Sync |
| **Multi-device** | ❌ | ✅ |
| **Backup** | Manual | Automático |
| **Limite de dados** | 5-10 MB | 500 MB (free) |
| **Queries complexas** | ⚠️ JavaScript | ✅ PostgreSQL |
| **Real-time** | ❌ | ✅ (opcional) |
| **Multi-user** | ❌ | ✅ (com auth) |
| **Custo** | Grátis | Free tier |
| **Complexidade** | Baixa | Média |

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### Semana 1: Setup e Schema
- [ ] Criar projeto Supabase
- [ ] Configurar schema (tabelas + RLS)
- [ ] Instalar dependências
- [ ] Configurar clientes

### Semana 2: Migração de Stores
- [ ] Migrar empresas-store
- [ ] Migrar cenarios-store
- [ ] Migrar comparativos-store
- [ ] Testes unitários

### Semana 3: Migração de UI
- [ ] Atualizar componentes
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications

### Semana 4: Dados e Testes
- [ ] Script de migração
- [ ] Migrar dados existentes
- [ ] Testes end-to-end
- [ ] Deploy

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Perda de dados na migração | 🔴 Alto | Backup completo antes, script testado |
| Latência de rede | 🟡 Médio | Cache local com Zustand |
| Free tier excedido | 🟢 Baixo | Monitorar uso, otimizar queries |
| Breaking changes | 🟡 Médio | Versionamento, testes |

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [ ] Backup completo do localStorage
- [ ] Schema validado no Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Stores migrados e testados
- [ ] UI atualizada com loading/error states
- [ ] Dados migrados e validados
- [ ] Testes E2E passando
- [ ] RLS configurado corretamente
- [ ] Documentação atualizada

---

## 🎉 PRÓXIMOS PASSOS APÓS MIGRAÇÃO

1. **Autenticação** (Supabase Auth)
2. **Real-time sync** (Subscriptions)
3. **Políticas RLS** refinadas por usuário
4. **Edge Functions** para lógica complexa
5. **Storage** para upload de logos
6. **Analytics** com Supabase Logs

---

**Quer que eu comece a implementação?** Podemos fazer passo a passo! 🚀
