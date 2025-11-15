# Funcionalidade de Compartilhamento Público de Relatórios

## 📋 Visão Geral

Esta funcionalidade permite que usuários compartilhem relatórios de comparação tributária através de links públicos, sem necessidade de autenticação para visualização.

## 🎯 Objetivo

Criar URLs públicas para compartilhar relatórios com clientes, permitindo que eles vejam análises comparativas de regimes tributários sem precisar fazer login no sistema.

## 🏗️ Arquitetura

### 1. Database (Supabase/PostgreSQL)

**Migração:** `supabase/migrations/add_compartilhamento_publico.sql`

**Novas Colunas:**
- `token_compartilhamento` (VARCHAR) - Token único para acesso público
- `token_expira_em` (TIMESTAMP) - Data de expiração do link
- `visualizacoes_publicas` (INTEGER) - Contador de acessos

**Funções SQL:**
- `gerar_token_compartilhamento()` - Gera token aleatório de 32 caracteres
- `ativar_compartilhamento_publico(comparativo_id, dias_validade)` - Ativa compartilhamento
- `desativar_compartilhamento_publico(comparativo_id)` - Desativa compartilhamento
- `buscar_comparativo_publico(token)` - Busca relatório por token (acesso público)

**Row Level Security (RLS):**
- Política permite acesso anônimo a comparativos com token válido e não expirado

### 2. Serviço (TypeScript)

**Arquivo:** `src/services/compartilhamento-service.ts`

**Principais Funções:**
```typescript
ativarCompartilhamentoPublico(comparativoId, diasValidade)
// Retorna: { token, expiraEm, urlPublica }

desativarCompartilhamentoPublico(comparativoId)
// Retorna: boolean

buscarComparativoPublico(token)
// Retorna: ComparativoPublico | null

verificarCompartilhamento(comparativoId)
// Retorna: { compartilhado, token?, expiraEm? }

copiarLinkPublico(urlPublica)
// Retorna: boolean
```

### 3. Interface (React)

**Componente Atualizado:** `src/components/comparativos/visualizacao-comparativo.tsx`

**Novo Componente:** `src/app/comparativos/compartilhado/[token]/page.tsx`

## 🚀 Como Usar

### Para o Usuário Autenticado (Criar Compartilhamento)

1. **Abrir um Relatório Comparativo**
   - Navegue até a página de comparativos
   - Abra um relatório existente

2. **Gerar Link Público**
   - Clique no botão "Compartilhar Relatório"
   - O sistema gera um token único
   - Link é copiado automaticamente

3. **Gerenciar Compartilhamento**
   - Ver status do compartilhamento (ativo/inativo)
   - Ver data de expiração (30 dias por padrão)
   - Copiar link novamente
   - Desativar compartilhamento (ícone de cadeado)

### Para o Cliente (Visualizar Compartilhamento)

1. **Acessar Link Público**
   - Receber link do formato: `https://seu-dominio.com/comparativos/compartilhado/[TOKEN]`
   - Abrir no navegador (não precisa login)

2. **Visualizar Relatório**
   - Ver análise completa
   - Ver regime mais vantajoso
   - Ver gráficos interativos
   - Ver insights e recomendações

## 🔒 Segurança

### Tokens
- 32 caracteres aleatórios (charset: A-Z, a-z, 0-9)
- Únicos (verificação de colisão com retry)
- Armazenados com hash no banco

### Expiração
- Padrão: 30 dias
- Configurável por compartilhamento
- Links expirados retornam erro 404

### Controle de Acesso
- Usuário autenticado pode ativar/desativar
- Acesso público apenas para tokens válidos
- RLS garante isolamento de dados

### Privacidade
- Apenas dados do relatório são expostos
- Dados sensíveis da empresa não são revelados
- Contador de visualizações para auditoria

## 📊 Dados Expostos no Link Público

**Incluído:**
- Nome do relatório
- Descrição do relatório
- Nome da empresa (opcional)
- Regime mais vantajoso
- Economia anual e percentual
- Gráficos de comparação
- Insights e recomendações
- Data de geração

**Não Incluído:**
- Dados de autenticação
- Informações de usuários
- Dados bancários
- Configurações internas
- Cenários não incluídos no relatório

## 🔧 Instalação

### 1. Executar Migração

```sql
-- Executar no Supabase SQL Editor
\i supabase/migrations/add_compartilhamento_publico.sql
```

### 2. Verificar Instalação

```sql
-- Verificar se colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comparativos_analise' 
AND column_name IN ('token_compartilhamento', 'token_expira_em', 'visualizacoes_publicas');

-- Testar função de geração de token
SELECT gerar_token_compartilhamento();

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'comparativos_analise';
```

### 3. Testar Funcionalidade

```typescript
// 1. Ativar compartilhamento
const info = await ativarCompartilhamentoPublico('uuid-do-comparativo', 30)
console.log('URL Pública:', info.urlPublica)

// 2. Acessar link público (navegador)
window.open(info.urlPublica, '_blank')

// 3. Desativar compartilhamento
await desativarCompartilhamentoPublico('uuid-do-comparativo')
```

## 🐛 Troubleshooting

### Link retorna 404
- ✅ Verificar se token é válido
- ✅ Verificar se não expirou
- ✅ Verificar se compartilhamento está ativo
- ✅ Verificar políticas RLS no Supabase

### Erro ao gerar token
- ✅ Verificar permissões do usuário
- ✅ Verificar função SQL existe
- ✅ Verificar logs do Supabase

### Dados não aparecem no link público
- ✅ Verificar se resultados estão no banco
- ✅ Verificar console do navegador
- ✅ Verificar formato dos dados (JSON)

## 📈 Métricas e Monitoramento

### Rastrear Uso

```sql
-- Relatórios mais compartilhados
SELECT 
    c.nome,
    c.visualizacoes_publicas,
    c.token_expira_em,
    c.created_at
FROM comparativos_analise c
WHERE c.compartilhado = TRUE
ORDER BY c.visualizacoes_publicas DESC
LIMIT 10;

-- Links prestes a expirar
SELECT 
    c.nome,
    c.token_expira_em,
    c.visualizacoes_publicas,
    (c.token_expira_em - CURRENT_TIMESTAMP) as tempo_restante
FROM comparativos_analise c
WHERE c.compartilhado = TRUE
AND c.token_expira_em < CURRENT_TIMESTAMP + INTERVAL '7 days'
ORDER BY c.token_expira_em;
```

## 🔄 Futuras Melhorias

- [ ] Customizar período de expiração por link
- [ ] Proteção por senha opcional
- [ ] Limite de visualizações
- [ ] Analytics detalhado (IPs, devices, etc)
- [ ] Renovar link sem mudar token
- [ ] Notificações de expiração
- [ ] Branding personalizado na página pública
- [ ] Download em PDF do relatório público
- [ ] QR Code para compartilhar

## 📝 Notas de Desenvolvimento

- Usar sempre `createClient()` do Supabase para acesso anônimo
- Testar RLS policies em modo incognito
- Validar tokens no backend (nunca confiar apenas no frontend)
- Logs detalhados para auditoria
- Considerar rate limiting para APIs públicas
