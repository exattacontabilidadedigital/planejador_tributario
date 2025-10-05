-- ===============================================
-- SCRIPT DE DIAGNÓSTICO DO SCHEMA ATUAL
-- Execute no Supabase SQL Editor para verificar estrutura
-- ===============================================

-- 1. VERIFICAR ESTRUTURA DA TABELA EMPRESAS
SELECT 'ESTRUTURA EMPRESAS' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS ATUAIS DA TABELA EMPRESAS (primeiros 5 registros)
SELECT 'DADOS EMPRESAS (SAMPLE)' as info;
SELECT * FROM empresas LIMIT 5;

-- 3. VERIFICAR VALORES ÚNICOS DE SETOR
SELECT 'VALORES SETOR' as info;
SELECT setor, COUNT(*) as quantidade
FROM empresas 
GROUP BY setor
ORDER BY quantidade DESC;

-- 4. VERIFICAR VALORES ÚNICOS DE REGIME_TRIBUTARIO
SELECT 'VALORES REGIME_TRIBUTARIO' as info;
SELECT regime_tributario, COUNT(*) as quantidade
FROM empresas 
GROUP BY regime_tributario
ORDER BY quantidade DESC;

-- 5. VERIFICAR ESTRUTURA DA TABELA CENARIOS
SELECT 'ESTRUTURA CENARIOS' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cenarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. VERIFICAR DADOS ATUAIS DA TABELA CENARIOS (primeiros 5 registros)
SELECT 'DADOS CENARIOS (SAMPLE)' as info;
SELECT * FROM cenarios LIMIT 5;

-- 7. VERIFICAR CONSTRAINTS EXISTENTES
SELECT 'CONSTRAINTS EXISTENTES' as info;
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
ORDER BY tc.table_name, tc.constraint_name;

-- 8. VERIFICAR ÍNDICES EXISTENTES
SELECT 'ÍNDICES EXISTENTES' as info;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename IN ('empresas', 'cenarios')
ORDER BY tablename, indexname;

-- 9. VERIFICAR TOTAL DE REGISTROS
SELECT 'CONTAGEM REGISTROS' as info;
SELECT 
    'empresas' as tabela, 
    COUNT(*) as total_registros
FROM empresas
UNION ALL
SELECT 
    'cenarios' as tabela, 
    COUNT(*) as total_registros
FROM cenarios;