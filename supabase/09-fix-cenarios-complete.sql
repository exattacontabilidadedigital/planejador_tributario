-- ===============================================
-- PASSO 2: CORRIGIR TABELA CENARIOS
-- ===============================================

-- Adicionar campos faltantes na tabela cenários
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tipo_periodo TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_fim DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS mes INTEGER;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS trimestre INTEGER;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS criado_por TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Verificar estrutura após adicionar colunas
SELECT 'ESTRUTURA CENARIOS APÓS ADICIONAR COLUNAS' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cenarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados existentes antes da correção
SELECT 'DADOS CENARIOS ANTES CORREÇÃO' as info;
SELECT id, nome, ano, status, tipo_periodo
FROM cenarios 
LIMIT 5;

-- Preencher dados para registros existentes
UPDATE cenarios SET 
    tipo_periodo = 'anual',
    data_inicio = (ano::text || '-01-01')::DATE,
    data_fim = (ano::text || '-12-31')::DATE,
    status = 'rascunho',
    tags = '{}'::TEXT[]
WHERE tipo_periodo IS NULL OR status IS NULL;

-- Verificar dados após correção
SELECT 'DADOS CENARIOS APÓS CORREÇÃO' as info;
SELECT id, nome, ano, status, tipo_periodo, data_inicio, data_fim
FROM cenarios 
LIMIT 5;

-- Definir campos obrigatórios
ALTER TABLE cenarios ALTER COLUMN tipo_periodo SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN data_inicio SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN data_fim SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN status SET NOT NULL;

-- Verificar estrutura final
SELECT 'ESTRUTURA FINAL CENARIOS' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cenarios' AND table_schema = 'public'
ORDER BY ordinal_position;