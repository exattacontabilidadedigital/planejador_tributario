-- ===============================================
-- VERIFICAR SE CONSTRAINTS AINDA EXISTEM
-- ===============================================

-- Verificar se a constraint ainda existe
SELECT 'STATUS DAS CONSTRAINTS' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'empresas'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;

-- Se a query acima mostrar constraints, execute os comandos abaixo:

-- FORÇAR REMOÇÃO DA CONSTRAINT DE REGIME_TRIBUTARIO
ALTER TABLE empresas DROP CONSTRAINT IF EXISTS empresas_regime_tributario_check;

-- FORÇAR REMOÇÃO DA CONSTRAINT DE SETOR  
ALTER TABLE empresas DROP CONSTRAINT IF EXISTS empresas_setor_check;

-- Verificar novamente após remoção
SELECT 'CONSTRAINTS APÓS REMOÇÃO FORÇADA' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'empresas'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;