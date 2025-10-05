-- Script para corrigir schema completo das tabelas
-- Execute este script no Supabase SQL Editor

-- ===============================================
-- CORRIGIR TABELA: empresas
-- ===============================================
-- Adicionar campos que faltam
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS uf TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Remover coluna porte se existir (não está no schema atual)
ALTER TABLE empresas DROP COLUMN IF EXISTS porte;

-- Preencher campos obrigatórios para dados existentes
UPDATE empresas SET razao_social = nome WHERE razao_social IS NULL;
UPDATE empresas SET uf = 'SP' WHERE uf IS NULL;
UPDATE empresas SET municipio = 'São Paulo' WHERE municipio IS NULL;

-- Definir campos como NOT NULL
ALTER TABLE empresas ALTER COLUMN razao_social SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN uf SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN municipio SET NOT NULL;

-- ===============================================
-- CORRIGIR TABELA: cenarios
-- ===============================================
-- Adicionar campos que faltam
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tipo_periodo TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_fim DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS mes INTEGER;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS trimestre INTEGER;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS criado_por TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Preencher campos obrigatórios para dados existentes
UPDATE cenarios SET 
    tipo_periodo = 'anual',
    data_inicio = CONCAT(ano, '-01-01')::DATE,
    data_fim = CONCAT(ano, '-12-31')::DATE,
    status = 'rascunho',
    tags = ARRAY[]::TEXT[]
WHERE tipo_periodo IS NULL;

-- Definir campos como NOT NULL
ALTER TABLE cenarios ALTER COLUMN tipo_periodo SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN data_inicio SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN data_fim SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN status SET NOT NULL;

-- Adicionar constraints CHECK
DO $$
BEGIN
    -- Check para tipo_periodo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'cenarios_tipo_periodo_check' 
        AND table_name = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_tipo_periodo_check 
        CHECK (tipo_periodo IN ('mensal', 'trimestral', 'semestral', 'anual'));
    END IF;
    
    -- Check para status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'cenarios_status_check' 
        AND table_name = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_status_check 
        CHECK (status IN ('rascunho', 'aprovado', 'arquivado'));
    END IF;
    
    -- Check para mes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'cenarios_mes_check' 
        AND table_name = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_mes_check 
        CHECK (mes >= 1 AND mes <= 12);
    END IF;
    
    -- Check para trimestre
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'cenarios_trimestre_check' 
        AND table_name = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_trimestre_check 
        CHECK (trimestre >= 1 AND trimestre <= 4);
    END IF;
END $$;

-- ===============================================
-- VERIFICAR RESULTADOS
-- ===============================================
-- Mostrar estrutura final das tabelas
SELECT 'EMPRESAS' as tabela, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position

UNION ALL

SELECT 'CENARIOS' as tabela, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cenarios' 
ORDER BY ordinal_position;