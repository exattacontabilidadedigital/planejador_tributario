-- ===============================================
-- PASSO 1H: ADICIONAR CONSTRAINTS EMPRESAS
-- ===============================================

-- Adicionar constraints para empresas (após dados limpos)
DO $$
BEGIN
    -- Check para regime_tributario
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_regime_tributario_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_regime_tributario_check 
        CHECK (regime_tributario IN ('lucro-real', 'lucro-presumido', 'simples'));
        RAISE NOTICE 'Constraint empresas_regime_tributario_check adicionada';
    ELSE
        RAISE NOTICE 'Constraint empresas_regime_tributario_check já existe';
    END IF;
    
    -- Check para setor
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_setor_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT empresas_setor_check 
        CHECK (setor IN ('comercio', 'industria', 'servicos'));
        RAISE NOTICE 'Constraint empresas_setor_check adicionada';
    ELSE
        RAISE NOTICE 'Constraint empresas_setor_check já existe';
    END IF;
END $$;

-- Verificar constraints criadas
SELECT 'CONSTRAINTS EMPRESAS' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'empresas'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;