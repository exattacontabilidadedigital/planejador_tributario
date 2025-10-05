-- ===============================================
-- VERIFICAR ESTRUTURA ATUAL DA TABELA CENARIOS
-- ===============================================

-- Mostrar todas as colunas da tabela cenarios
SELECT 'ESTRUTURA COMPLETA CENARIOS' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cenarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados de uma linha específica
SELECT 'DADOS EXEMPLO CENARIOS' as info;
SELECT * FROM cenarios LIMIT 1;