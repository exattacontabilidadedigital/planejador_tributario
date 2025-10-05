-- Script de correção URGENTE do schema
-- Execute PASSO A PASSO no Supabase SQL Editor

-- ===============================================
-- PASSO 1: CORRIGIR TABELA EMPRESAS
-- ===============================================
-- Verificar e adicionar campos faltantes
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS uf TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Remover coluna porte se existir (com CASCADE para remover dependências)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' 
        AND column_name = 'porte' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE empresas DROP COLUMN porte CASCADE;
        RAISE NOTICE 'Coluna porte removida com CASCADE (dependências também removidas)';
    ELSE
        RAISE NOTICE 'Coluna porte não existe';
    END IF;
END $$;

-- Preencher dados para registros existentes
UPDATE empresas SET 
    razao_social = nome,
    uf = 'SP',
    municipio = 'São Paulo'
WHERE razao_social IS NULL OR uf IS NULL OR municipio IS NULL;

-- Corrigir valores de setor inválidos antes de aplicar constraints
-- Incluindo 'consultoria' que aparece nos dados
UPDATE empresas SET setor = CASE 
    WHEN setor = 'consultoria' THEN 'servicos'
    WHEN setor NOT IN ('comercio', 'industria', 'servicos') OR setor IS NULL THEN 'comercio'
    ELSE setor
END;

-- Corrigir valores de regime_tributario inválidos antes de aplicar constraints  
-- Incluindo 'pequena' que aparece nos dados
UPDATE empresas SET regime_tributario = CASE 
    WHEN regime_tributario = 'pequena' THEN 'simples'
    WHEN regime_tributario NOT IN ('lucro-real', 'lucro-presumido', 'simples') OR regime_tributario IS NULL THEN 'lucro-presumido'
    ELSE regime_tributario
END;

-- Definir campos obrigatórios
ALTER TABLE empresas ALTER COLUMN razao_social SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN uf SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN municipio SET NOT NULL;

-- ===============================================
-- PASSO 2: CORRIGIR TABELA CENARIOS  
-- ===============================================
-- Adicionar campos faltantes
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tipo_periodo TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_fim DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS mes INTEGER;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS trimestre INTEGER;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS criado_por TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Preencher dados para registros existentes
UPDATE cenarios SET 
    tipo_periodo = 'anual',
    data_inicio = (ano::text || '-01-01')::DATE,
    data_fim = (ano::text || '-12-31')::DATE,
    status = 'rascunho',
    tags = '{}'::TEXT[]
WHERE tipo_periodo IS NULL;

-- Definir campos obrigatórios
ALTER TABLE cenarios ALTER COLUMN tipo_periodo SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN data_inicio SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN data_fim SET NOT NULL;
ALTER TABLE cenarios ALTER COLUMN status SET NOT NULL;

-- ===============================================
-- PASSO 3: ADICIONAR CONSTRAINTS
-- ===============================================
-- Constraints para cenarios (usando DO block para verificar se já existem)
DO $$
BEGIN
    -- Check para tipo_periodo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'cenarios_tipo_periodo_check' 
        AND t.relname = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_tipo_periodo_check 
        CHECK (tipo_periodo IN ('mensal', 'trimestral', 'semestral', 'anual'));
    END IF;
    
    -- Check para status
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'cenarios_status_check' 
        AND t.relname = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_status_check 
        CHECK (status IN ('rascunho', 'aprovado', 'arquivado'));
    END IF;
    
    -- Check para mes
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'cenarios_mes_check' 
        AND t.relname = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_mes_check 
        CHECK (mes IS NULL OR (mes >= 1 AND mes <= 12));
    END IF;
    
    -- Check para trimestre
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'cenarios_trimestre_check' 
        AND t.relname = 'cenarios'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT cenarios_trimestre_check 
        CHECK (trimestre IS NULL OR (trimestre >= 1 AND trimestre <= 4));
    END IF;
    
    -- Check para empresas - regime_tributario
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_regime_tributario_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_regime_tributario_check 
        CHECK (regime_tributario IN ('lucro-real', 'lucro-presumido', 'simples'));
    END IF;
    
    -- Check para empresas - setor
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_setor_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_setor_check 
        CHECK (setor IN ('comercio', 'industria', 'servicos'));
    END IF;
END $$;

-- ===============================================
-- PASSO 4: VERIFICAR RESULTADOS
-- ===============================================
-- Mostrar estrutura das tabelas
SELECT 'EMPRESAS' as tabela, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'CENARIOS' as tabela, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cenarios' AND table_schema = 'public'
ORDER BY ordinal_position;