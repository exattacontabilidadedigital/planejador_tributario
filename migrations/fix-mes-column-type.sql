-- Migration: Corrigir tipo do campo mes de INTEGER para VARCHAR(2)
-- Data: 2025-11-15
-- Descrição: O campo mes deve ser string no formato "01"-"12" para manter consistência com o schema Zod

BEGIN;

-- 1. Adicionar nova coluna temporária como VARCHAR
ALTER TABLE cenarios 
ADD COLUMN mes_new VARCHAR(2);

-- 2. Copiar dados existentes convertendo número para string com zero padding
UPDATE cenarios 
SET mes_new = LPAD(mes::TEXT, 2, '0')
WHERE mes IS NOT NULL;

-- 3. Remover coluna antiga
ALTER TABLE cenarios 
DROP COLUMN mes;

-- 4. Renomear coluna nova
ALTER TABLE cenarios 
RENAME COLUMN mes_new TO mes;

-- 5. Adicionar constraint de validação
ALTER TABLE cenarios
ADD CONSTRAINT check_mes_format 
CHECK (mes IS NULL OR mes ~ '^(0[1-9]|1[0-2])$');

-- 6. Adicionar comentário
COMMENT ON COLUMN cenarios.mes IS 'Mês no formato "01" a "12" para períodos mensais';

COMMIT;

-- Verificação
SELECT 
  id, 
  nome, 
  mes, 
  pg_typeof(mes) as tipo_mes
FROM cenarios 
WHERE mes IS NOT NULL
LIMIT 5;
