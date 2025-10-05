-- ===============================================
-- EXECUTAR SCHEMA COMPLETO - TAX PLANNER REACT
-- Executa todos os scripts em ordem correta
-- ===============================================

-- INSTRUÇÕES:
-- Execute este arquivo no Supabase Dashboard > SQL Editor
-- Ou execute cada arquivo individualmente na seguinte ordem:
--
-- 1. 01-tables.sql     → Criar tabelas
-- 2. 02-indexes.sql    → Criar índices
-- 3. 03-functions.sql  → Criar funções e constraints
-- 4. 04-triggers.sql   → Criar triggers
-- 5. 05-views.sql      → Criar views
-- 6. 06-data.sql       → Inserir dados iniciais

-- ===============================================
-- EXECUÇÃO AUTOMÁTICA (DESCOMENTE PARA USAR)
-- ===============================================

-- Se preferir executar automaticamente, descomente as linhas abaixo:

-- \i 01-tables.sql
-- \i 02-indexes.sql  
-- \i 03-functions.sql
-- \i 04-triggers.sql
-- \i 05-views.sql
-- \i 06-data.sql

-- ===============================================
-- EXECUTAR SCHEMA COMPLETO - TAX PLANNER REACT
-- Executa todos os scripts em ordem correta
-- ===============================================

-- INSTRUÇÕES:
-- Execute este arquivo no Supabase Dashboard > SQL Editor
-- Ou execute cada arquivo individualmente na seguinte ordem:
--
-- 1. 01-tables.sql     → Criar tabelas
-- 2. 02-indexes.sql    → Criar índices (protegido)
-- 3. 03-functions.sql  → Criar funções e constraints
-- 4. 04-triggers.sql   → Criar triggers (protegido)
-- 5. 05-views.sql      → Criar views (protegido)
-- 6. 06-data.sql       → Inserir dados iniciais

-- ===============================================
-- VERIFICAÇÃO FINAL DETALHADA
-- ===============================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    tabela_count INTEGER;
    tabelas_esperadas TEXT[] := ARRAY[
        'empresas',
        'cenarios', 
        'comparativos',
        'despesas_dinamicas',
        'calculos_icms',
        'calculos_pis_cofins', 
        'calculos_irpj_csll',
        'calculos_dre',
        'relatorios_consolidados',
        'configuracoes_sistema'
    ];
    tabela TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DO SCHEMA TAX PLANNER';
    RAISE NOTICE '========================================';
    
    -- Contar tabelas criadas
    SELECT COUNT(*)
    INTO tabela_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename = ANY(tabelas_esperadas);
    
    RAISE NOTICE 'Tabelas encontradas: % de %', tabela_count, array_length(tabelas_esperadas, 1);
    
    -- Listar tabelas criadas
    FOREACH tabela IN ARRAY tabelas_esperadas
    LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tabela) THEN
            RAISE NOTICE '✅ Tabela criada: %', tabela;
        ELSE
            RAISE NOTICE '❌ Tabela faltando: %', tabela;
        END IF;
    END LOOP;
    
    -- Verificar índices
    SELECT COUNT(*)
    INTO tabela_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%';
    
    RAISE NOTICE 'Índices criados: %', tabela_count;
    
    -- Verificar funções
    SELECT COUNT(*)
    INTO tabela_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
        AND routine_name IN ('is_valid_cnpj', 'get_cenarios_filtered', 'calcular_totais_relatorio', 'duplicar_cenario_completo');
    
    RAISE NOTICE 'Funções criadas: %', tabela_count;
    
    -- Verificar views
    SELECT COUNT(*)
    INTO tabela_count
    FROM pg_views 
    WHERE schemaname = 'public'
        AND viewname IN ('empresas_estatisticas', 'cenarios_detalhados', 'comparativos_expandidos');
    
    RAISE NOTICE 'Views criadas: %', tabela_count;
    
    RAISE NOTICE '========================================';
    
    IF tabela_count >= 3 THEN
        RAISE NOTICE '✅ SCHEMA CRIADO COM SUCESSO!';
    ELSE
        RAISE NOTICE '⚠️  VERIFIQUE OS ARQUIVOS SQL';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;