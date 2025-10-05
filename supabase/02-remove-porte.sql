-- ===============================================
-- PASSO 1B: REMOVER COLUNA PORTE (SE EXISTIR)
-- ===============================================

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

-- Verificar estrutura após remoção
SELECT 'ESTRUTURA APÓS REMOÇÃO PORTE' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' AND table_schema = 'public'
ORDER BY ordinal_position;