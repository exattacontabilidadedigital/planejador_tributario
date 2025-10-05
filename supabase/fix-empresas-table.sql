-- Atualizar tabela empresas para incluir todas as colunas necessárias
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas que faltam
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS uf TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Remover coluna porte se existir (não está no nosso schema atual)
ALTER TABLE empresas DROP COLUMN IF EXISTS porte;

-- Definir constraints para campos obrigatórios
-- Nota: Se existem dados na tabela, pode ser necessário atualizar antes
UPDATE empresas SET razao_social = nome WHERE razao_social IS NULL;
UPDATE empresas SET uf = 'SP' WHERE uf IS NULL;
UPDATE empresas SET municipio = 'São Paulo' WHERE municipio IS NULL;

-- Adicionar constraints NOT NULL após preencher dados
ALTER TABLE empresas ALTER COLUMN razao_social SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN uf SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN municipio SET NOT NULL;

-- Verificar se os constraints CHECK existem
DO $$
BEGIN
    -- Check para regime_tributario
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'empresas_regime_tributario_check' 
        AND table_name = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_regime_tributario_check 
        CHECK (regime_tributario IN ('lucro-real', 'lucro-presumido', 'simples'));
    END IF;
    
    -- Check para setor
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'empresas_setor_check' 
        AND table_name = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_setor_check 
        CHECK (setor IN ('comercio', 'industria', 'servicos'));
    END IF;
END $$;

-- Mostrar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;