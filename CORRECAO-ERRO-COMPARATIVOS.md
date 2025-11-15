# Correção: Erro "Could not find the table 'public.comparativos'"

## Problema
Ao tentar deletar um cenário, ocorre o erro:
```
❌ [CENÁRIOS] Erro ao verificar uso: "Could not find the table 'public.comparativos' in the schema cache"
```

## Causa
A tabela `comparativos` existe mas não tem a coluna `cenarios_ids` que o código está tentando acessar, ou a tabela não foi criada ainda no banco de dados.

## Solução Implementada

### 1. Código Defensivo (✅ Já Aplicado)
O código foi atualizado para tratar graciosamente quando a tabela ou coluna não existe:

```typescript
// src/stores/cenarios-store.ts - linha ~717
try {
  const { data: comparativos, error: checkError } = await supabase
    .from('comparativos')
    .select('id, nome')
    .contains('cenarios_ids', [id])
  
  if (checkError) {
    // Se a tabela não existe, apenas logamos e continuamos
    if (checkError.message.includes('could not find') || 
        checkError.message.includes('does not exist')) {
      console.warn('⚠️ [CENÁRIOS] Tabela comparativos não encontrada, pulando verificação')
    }
  }
} catch (error) {
  console.warn('⚠️ [CENÁRIOS] Não foi possível verificar uso em comparativos')
}
```

### 2. Migration SQL
Criamos uma migration para adicionar a coluna `cenarios_ids`:

**Arquivo:** `supabase/migrations/add_cenarios_ids_to_comparativos.sql`

## Como Aplicar a Correção

### Opção 1: Via Supabase Dashboard (Recomendado)
1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql/new
2. Cole o conteúdo do arquivo: `supabase/migrations/add_cenarios_ids_to_comparativos.sql`
3. Clique em "Run" para executar

### Opção 2: Via Script Node
```bash
node executar-migration-cenarios-ids.mjs
```

### Opção 3: Via Supabase CLI
```bash
supabase db push --include-all
```

## Verificação

Após aplicar a migration, você pode verificar se funcionou:

```sql
-- No SQL Editor do Supabase
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comparativos' 
AND column_name = 'cenarios_ids';
```

Deve retornar:
```
column_name   | data_type
--------------+-----------
cenarios_ids  | ARRAY
```

## Testando a Correção

1. Tente deletar um cenário
2. Se a tabela `comparativos` não existe, você verá:
   ```
   ⚠️ [CENÁRIOS] Tabela comparativos não encontrada, pulando verificação
   ✅ [CENÁRIOS] Prosseguindo com deleção...
   ```

3. Se a tabela existe e o cenário NÃO está em uso:
   ```
   🗑️ [CENÁRIOS] Verificando uso do cenário em comparativos...
   ✅ [CENÁRIOS] Prosseguindo com deleção...
   ```

4. Se o cenário ESTÁ em uso:
   ```
   ❌ Não é possível deletar este cenário pois ele está sendo usado nos seguintes comparativos: [nomes]. Remova o cenário destes comparativos antes de deletá-lo.
   ```

## Estrutura da Coluna

A coluna `cenarios_ids` tem as seguintes características:

- **Tipo:** `UUID[]` (array de UUIDs)
- **Not Null:** Sim (default `'{}'`)
- **Constraints:**
  - Mínimo de 2 cenários
  - Máximo de 4 cenários
  - Todos os IDs devem existir na tabela `cenarios`
- **Índice:** GIN index para buscas eficientes

## Próximos Passos

Se você ainda não criou a tabela `comparativos`, execute primeiro:
```sql
-- Execute: supabase/migrations/create_comparativos.sql
```

Depois execute:
```sql
-- Execute: supabase/migrations/add_cenarios_ids_to_comparativos.sql
```

## Resumo das Alterações

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `src/stores/cenarios-store.ts` | Tratamento de erro defensivo | ✅ Aplicado |
| `supabase/migrations/add_cenarios_ids_to_comparativos.sql` | Migration para adicionar coluna | ✅ Criado |
| `executar-migration-cenarios-ids.mjs` | Script helper | ✅ Criado |

## Notas Técnicas

- O código agora funciona mesmo se a tabela `comparativos` não existir
- Quando a tabela existir e tiver a coluna correta, a validação funcionará normalmente
- Isso permite desenvolvimento incremental sem dependências rígidas entre features
