-- Adicionar coluna status na tabela cenarios
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar a coluna status com valor padrão
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'rascunho';

-- 2. Atualizar cenários existentes que não têm status
UPDATE cenarios SET status = 'rascunho' WHERE status IS NULL;

-- 3. Verificar se a coluna foi adicionada
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'cenarios' 
ORDER BY ordinal_position;

-- 4. Mostrar alguns cenários com o novo campo
SELECT id, nome, status, created_at 
FROM cenarios 
LIMIT 5;