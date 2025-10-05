-- ===============================================
-- PASSO 3: RECRIAR CONSTRAINTS (FINAL)
-- ===============================================

-- Recriar constraints para cenarios
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
        RAISE NOTICE 'Constraint cenarios_tipo_periodo_check adicionada';
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
        RAISE NOTICE 'Constraint cenarios_status_check adicionada';
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
        RAISE NOTICE 'Constraint cenarios_mes_check adicionada';
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
        RAISE NOTICE 'Constraint cenarios_trimestre_check adicionada';
    END IF;
    
    -- Check para empresas - regime_tributario (recriar)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_regime_tributario_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_regime_tributario_check 
        CHECK (regime_tributario IN ('lucro-real', 'lucro-presumido', 'simples'));
        RAISE NOTICE 'Constraint empresas_regime_tributario_check recriada';
    END IF;
    
    -- Check para empresas - setor (recriar)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_setor_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_setor_check 
        CHECK (setor IN ('comercio', 'industria', 'servicos'));
        RAISE NOTICE 'Constraint empresas_setor_check recriada';
    END IF;
END $$;

-- Verificar todas as constraints finais
SELECT 'CONSTRAINTS FINAIS' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name IN ('empresas', 'cenarios')
AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;