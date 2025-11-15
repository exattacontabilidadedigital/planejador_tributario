# 🔴 ALERTA CRÍTICO DE SEGURANÇA - RLS

## ⚠️ ATENÇÃO: POLÍTICAS RLS INSEGURAS

**Status Atual:** 🔴 **MODO DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO**

### Problema Identificado

As políticas de Row Level Security (RLS) atuais permitem acesso total sem autenticação:

```sql
-- ❌ INSEGURO - Atual
CREATE POLICY "Permitir tudo para empresas" ON empresas FOR ALL USING (true);
CREATE POLICY "Permitir tudo para cenarios" ON cenarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo para comparativos" ON comparativos FOR ALL USING (true);
```

### Riscos

- ✅ Qualquer pessoa pode acessar TODOS os dados
- ✅ Não há isolamento entre usuários/empresas
- ✅ Vulnerável a ataques e vazamento de dados
- ✅ Violação de LGPD e boas práticas

---

## 🛠️ SOLUÇÃO OBRIGATÓRIA ANTES DE PRODUÇÃO

### 1. Implementar Autenticação Supabase

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Adicionar Auth Provider
// src/app/layout.tsx
import { AuthProvider } from '@/components/auth/auth-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. Adicionar Coluna user_id nas Tabelas

```sql
-- Migração necessária
ALTER TABLE empresas ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE cenarios ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE comparativos ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE dados_comparativos_mensais ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Criar índices
CREATE INDEX idx_empresas_user_id ON empresas(user_id);
CREATE INDEX idx_cenarios_user_id ON cenarios(user_id);
CREATE INDEX idx_comparativos_user_id ON comparativos(user_id);
CREATE INDEX idx_dados_user_id ON dados_comparativos_mensais(user_id);
```

### 3. Implementar Políticas RLS Seguras

```sql
-- EMPRESAS
DROP POLICY IF EXISTS "Permitir tudo para empresas" ON empresas;

CREATE POLICY "Users can view own empresas"
  ON empresas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own empresas"
  ON empresas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own empresas"
  ON empresas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own empresas"
  ON empresas FOR DELETE
  USING (auth.uid() = user_id);

-- CENARIOS
DROP POLICY IF EXISTS "Permitir tudo para cenarios" ON cenarios;

CREATE POLICY "Users can view own cenarios"
  ON cenarios FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    auth.uid() IN (
      SELECT user_id FROM empresas WHERE id = cenarios.empresa_id
    )
  );

CREATE POLICY "Users can manage own cenarios"
  ON cenarios FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM empresas WHERE id = cenarios.empresa_id
    )
  );

-- COMPARATIVOS
DROP POLICY IF EXISTS "Permitir tudo para comparativos" ON comparativos;

CREATE POLICY "Users can view own comparativos"
  ON comparativos FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM empresas WHERE id = comparativos.empresa_id
    )
  );

CREATE POLICY "Users can manage own comparativos"
  ON comparativos FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM empresas WHERE id = comparativos.empresa_id
    )
  );

-- DADOS COMPARATIVOS MENSAIS
ALTER TABLE dados_comparativos_mensais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dados"
  ON dados_comparativos_mensais FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM empresas WHERE id = dados_comparativos_mensais.empresa_id
    )
  );

CREATE POLICY "Users can manage own dados"
  ON dados_comparativos_mensais FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM empresas WHERE id = dados_comparativos_mensais.empresa_id
    )
  );
```

### 4. Atualizar Stores para Incluir user_id

```typescript
// src/stores/empresas-store.ts
export const useEmpresasStore = create<EmpresasState>((set, get) => ({
  addEmpresa: async (data) => {
    // Obter user_id do Supabase Auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: result, error } = await supabase
      .from('empresas')
      .insert({
        ...data,
        user_id: user.id // ✅ Adicionar user_id
      })
      .select()
      .single()
    
    // ... resto da lógica
  }
}))
```

### 5. Implementar Middleware de Autenticação

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirecionar para login se não autenticado
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|auth).*)',
  ],
}
```

---

## 📋 CHECKLIST DE IMPLANTAÇÃO

### Antes de Deploy em Produção

- [ ] Implementar autenticação Supabase Auth
- [ ] Adicionar coluna `user_id` em todas as tabelas
- [ ] Aplicar políticas RLS seguras
- [ ] Remover políticas permissivas atuais
- [ ] Atualizar todos os stores para incluir `user_id`
- [ ] Implementar middleware de autenticação
- [ ] Criar páginas de login/registro
- [ ] Testar isolamento de dados entre usuários
- [ ] Auditar logs de acesso
- [ ] Configurar rate limiting
- [ ] Implementar 2FA (recomendado)

---

## 🚨 AÇÃO IMEDIATA NECESSÁRIA

**NÃO FAÇA DEPLOY EM PRODUÇÃO ATÉ:**
1. Implementar autenticação completa
2. Aplicar políticas RLS seguras
3. Validar isolamento de dados em ambiente de staging
4. Realizar audit de segurança

**Responsável:** Time de Desenvolvimento  
**Prazo:** Antes de qualquer deploy em produção  
**Prioridade:** 🔴 CRÍTICA

---

**Documento criado em:** 2025-11-14  
**Última atualização:** 2025-11-14  
**Status:** ⚠️ ALERTA ATIVO
