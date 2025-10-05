-- ===============================================
-- PASSO 0: REMOVER CONSTRAINTS EXISTENTES TEMPORARIAMENTE
-- ===============================================

-- Remover constraint de regime_tributario se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_regime_tributario_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas DROP CONSTRAINT empresas_regime_tributario_check;
        RAISE NOTICE 'Constraint empresas_regime_tributario_check removida temporariamente';
    ELSE
        RAISE NOTICE 'Constraint empresas_regime_tributario_check não existe';
    END IF;
END $$;

-- Remover constraint de setor se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'empresas_setor_check' 
        AND t.relname = 'empresas'
    ) THEN
        ALTER TABLE empresas DROP CONSTRAINT empresas_setor_check;
        RAISE NOTICE 'Constraint empresas_setor_check removida temporariamente';
    ELSE
        RAISE NOTICE 'Constraint empresas_setor_check não existe';
    END IF;
END $$;

-- Verificar constraints restantes
SELECT 'CONSTRAINTS EXISTENTES APÓS REMOÇÃO' as info;
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