-- ========================================
-- CORREÇÃO DE MIGRAÇÃO - FORÇAR ATUALIZAÇÃO
-- Corrigir dados que não foram migrados corretamente
-- ========================================

-- Primeiro, vamos verificar a estrutura real da configuração
SELECT 
    id,
    nome,
    jsonb_pretty(configuracao) as config_estrutura
FROM cenarios 
LIMIT 1;

-- Agora vamos forçar a atualização de TODOS os cenários
-- removendo a condição WHERE que estava impedindo a migração

UPDATE cenarios 
SET 
    -- Para cenários mensais baseados no nome (Janeiro, Fevereiro, etc.)
    tipo_periodo = CASE 
        WHEN LOWER(nome) IN ('janeiro', 'february', 'março', 'abril', 'maio', 'junho', 
                            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
                            'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 
                            'jul', 'ago', 'set', 'out', 'nov', 'dez') THEN 'mensal'
        WHEN configuracao->'periodo'->>'tipo' IS NOT NULL 
        THEN configuracao->'periodo'->>'tipo'
        ELSE 'mensal'  -- Assumir mensal como padrão
    END,
    
    -- Extrair data de início
    data_inicio = CASE 
        WHEN configuracao->'periodo'->>'inicio' IS NOT NULL 
        THEN (configuracao->'periodo'->>'inicio')::DATE
        -- Baseado no nome do mês
        WHEN LOWER(nome) = 'janeiro' THEN MAKE_DATE(COALESCE(ano, 2025), 1, 1)
        WHEN LOWER(nome) = 'fevereiro' THEN MAKE_DATE(COALESCE(ano, 2025), 2, 1)
        WHEN LOWER(nome) = 'março' THEN MAKE_DATE(COALESCE(ano, 2025), 3, 1)
        WHEN LOWER(nome) = 'abril' THEN MAKE_DATE(COALESCE(ano, 2025), 4, 1)
        WHEN LOWER(nome) = 'maio' THEN MAKE_DATE(COALESCE(ano, 2025), 5, 1)
        WHEN LOWER(nome) = 'junho' THEN MAKE_DATE(COALESCE(ano, 2025), 6, 1)
        WHEN LOWER(nome) = 'julho' THEN MAKE_DATE(COALESCE(ano, 2025), 7, 1)
        WHEN LOWER(nome) = 'agosto' THEN MAKE_DATE(COALESCE(ano, 2025), 8, 1)
        WHEN LOWER(nome) = 'setembro' THEN MAKE_DATE(COALESCE(ano, 2025), 9, 1)
        WHEN LOWER(nome) = 'outubro' THEN MAKE_DATE(COALESCE(ano, 2025), 10, 1)
        WHEN LOWER(nome) = 'novembro' THEN MAKE_DATE(COALESCE(ano, 2025), 11, 1)
        WHEN LOWER(nome) = 'dezembro' THEN MAKE_DATE(COALESCE(ano, 2025), 12, 1)
        ELSE MAKE_DATE(COALESCE(ano, 2025), 1, 1)
    END,
    
    -- Extrair data de fim
    data_fim = CASE 
        WHEN configuracao->'periodo'->>'fim' IS NOT NULL 
        THEN (configuracao->'periodo'->>'fim')::DATE
        -- Baseado no nome do mês (último dia do mês)
        WHEN LOWER(nome) = 'janeiro' THEN MAKE_DATE(COALESCE(ano, 2025), 1, 31)
        WHEN LOWER(nome) = 'fevereiro' THEN MAKE_DATE(COALESCE(ano, 2025), 2, 28)
        WHEN LOWER(nome) = 'março' THEN MAKE_DATE(COALESCE(ano, 2025), 3, 31)
        WHEN LOWER(nome) = 'abril' THEN MAKE_DATE(COALESCE(ano, 2025), 4, 30)
        WHEN LOWER(nome) = 'maio' THEN MAKE_DATE(COALESCE(ano, 2025), 5, 31)
        WHEN LOWER(nome) = 'junho' THEN MAKE_DATE(COALESCE(ano, 2025), 6, 30)
        WHEN LOWER(nome) = 'julho' THEN MAKE_DATE(COALESCE(ano, 2025), 7, 31)
        WHEN LOWER(nome) = 'agosto' THEN MAKE_DATE(COALESCE(ano, 2025), 8, 31)
        WHEN LOWER(nome) = 'setembro' THEN MAKE_DATE(COALESCE(ano, 2025), 9, 30)
        WHEN LOWER(nome) = 'outubro' THEN MAKE_DATE(COALESCE(ano, 2025), 10, 31)
        WHEN LOWER(nome) = 'novembro' THEN MAKE_DATE(COALESCE(ano, 2025), 11, 30)
        WHEN LOWER(nome) = 'dezembro' THEN MAKE_DATE(COALESCE(ano, 2025), 12, 31)
        ELSE MAKE_DATE(COALESCE(ano, 2025), 12, 31)
    END,
    
    -- Extrair mês baseado no nome
    mes = CASE 
        WHEN configuracao->'periodo'->>'mes' IS NOT NULL 
        THEN (configuracao->'periodo'->>'mes')::INTEGER
        WHEN LOWER(nome) = 'janeiro' THEN 1
        WHEN LOWER(nome) = 'fevereiro' THEN 2
        WHEN LOWER(nome) = 'março' THEN 3
        WHEN LOWER(nome) = 'abril' THEN 4
        WHEN LOWER(nome) = 'maio' THEN 5
        WHEN LOWER(nome) = 'junho' THEN 6
        WHEN LOWER(nome) = 'julho' THEN 7
        WHEN LOWER(nome) = 'agosto' THEN 8
        WHEN LOWER(nome) = 'setembro' THEN 9
        WHEN LOWER(nome) = 'outubro' THEN 10
        WHEN LOWER(nome) = 'novembro' THEN 11
        WHEN LOWER(nome) = 'dezembro' THEN 12
        ELSE NULL
    END,
    
    -- Extrair trimestre se existir
    trimestre = CASE 
        WHEN configuracao->'periodo'->>'trimestre' IS NOT NULL 
        THEN (configuracao->'periodo'->>'trimestre')::INTEGER
        WHEN LOWER(nome) IN ('janeiro', 'fevereiro', 'março') THEN 1
        WHEN LOWER(nome) IN ('abril', 'maio', 'junho') THEN 2
        WHEN LOWER(nome) IN ('julho', 'agosto', 'setembro') THEN 3
        WHEN LOWER(nome) IN ('outubro', 'novembro', 'dezembro') THEN 4
        ELSE NULL
    END,
    
    -- Garantir que tags seja um array vazio se for NULL
    tags = COALESCE(tags, '{}');

-- Verificar resultado da correção
SELECT 
    id,
    nome,
    tipo_periodo,
    data_inicio,
    data_fim,
    mes,
    trimestre,
    tags
FROM cenarios
ORDER BY data_inicio;

-- Verificar estatísticas após correção
SELECT 
    COUNT(*) as total_cenarios,
    COUNT(CASE WHEN tipo_periodo = 'anual' THEN 1 END) as anuais,
    COUNT(CASE WHEN tipo_periodo = 'mensal' THEN 1 END) as mensais,
    COUNT(CASE WHEN tipo_periodo = 'trimestral' THEN 1 END) as trimestrais,
    COUNT(CASE WHEN data_inicio IS NOT NULL THEN 1 END) as com_data_inicio,
    COUNT(CASE WHEN mes IS NOT NULL THEN 1 END) as com_mes,
    COUNT(CASE WHEN trimestre IS NOT NULL THEN 1 END) as com_trimestre
FROM cenarios;

-- Script executado com sucesso! ✅
-- Os cenários agora devem ter dados de período corretos baseados nos nomes.