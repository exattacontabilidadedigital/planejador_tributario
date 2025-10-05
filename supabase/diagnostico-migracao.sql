-- ========================================
-- DIAGNÓSTICO - ESTRUTURA DOS DADOS
-- Verificar como os dados estão armazenados
-- ========================================

-- 1. Verificar estrutura atual da configuração JSON
SELECT 
    id,
    nome,
    ano,
    jsonb_pretty(configuracao) as configuracao_formatada
FROM cenarios 
ORDER BY created_at DESC;

-- 2. Verificar se existe chave 'periodo' na configuração
SELECT 
    id,
    nome,
    configuracao ? 'periodo' as tem_periodo,
    configuracao->'periodo' as periodo_data,
    configuracao->>'ano' as config_ano
FROM cenarios;

-- 3. Verificar todas as chaves no nível raiz da configuração
SELECT 
    id,
    nome,
    jsonb_object_keys(configuracao) as chaves_config
FROM cenarios;

-- 4. Verificar valores específicos que tentamos migrar
SELECT 
    id,
    nome,
    configuracao->'periodo'->>'tipo' as periodo_tipo,
    configuracao->'periodo'->>'inicio' as periodo_inicio,
    configuracao->'periodo'->>'fim' as periodo_fim,
    configuracao->'periodo'->>'mes' as periodo_mes,
    configuracao->'periodo'->>'trimestre' as periodo_trimestre,
    configuracao->>'ano' as config_ano
FROM cenarios;

-- 5. Estado atual das novas colunas
SELECT 
    id,
    nome,
    tipo_periodo,
    data_inicio,
    data_fim,
    mes,
    trimestre,
    tags
FROM cenarios;