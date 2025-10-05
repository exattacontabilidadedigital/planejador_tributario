-- ========================================
-- SCHEMA UPDATE - TABELA CENARIOS
-- Atualização para sincronizar com TypeScript
-- ========================================

-- Verificar estrutura atual da tabela cenarios
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'cenarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- ADICIONAR COLUNAS FALTANTES
-- ========================================

-- Tipo do período (anual, mensal, trimestral)
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS tipo_periodo TEXT 
DEFAULT 'anual' 
CHECK (tipo_periodo IN ('anual', 'mensal', 'trimestral'));

-- Datas de início e fim do período
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS data_inicio DATE;

ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS data_fim DATE;

-- Mês específico para cenários mensais
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS mes INTEGER 
CHECK (mes >= 1 AND mes <= 12);

-- Trimestre específico para cenários trimestrais
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS trimestre INTEGER 
CHECK (trimestre >= 1 AND trimestre <= 4);

-- Usuário que criou o cenário
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS criado_por TEXT;

-- Tags para categorização
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS tags TEXT[] 
DEFAULT '{}';

-- ========================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- ========================================

COMMENT ON COLUMN cenarios.tipo_periodo IS 'Tipo do período: anual, mensal, trimestral';
COMMENT ON COLUMN cenarios.data_inicio IS 'Data de início do período do cenário';
COMMENT ON COLUMN cenarios.data_fim IS 'Data de fim do período do cenário';
COMMENT ON COLUMN cenarios.mes IS 'Mês específico para cenários mensais (1-12)';
COMMENT ON COLUMN cenarios.trimestre IS 'Trimestre específico para cenários trimestrais (1-4)';
COMMENT ON COLUMN cenarios.criado_por IS 'ID ou email do usuário que criou o cenário';
COMMENT ON COLUMN cenarios.tags IS 'Array de tags para categorização e busca';
COMMENT ON COLUMN cenarios.configuracao IS 'JSON com toda a configuração fiscal do cenário';

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice para consultas por tipo de período
CREATE INDEX IF NOT EXISTS idx_cenarios_tipo_periodo 
ON cenarios(tipo_periodo);

-- Índice para consultas por data de início
CREATE INDEX IF NOT EXISTS idx_cenarios_data_inicio 
ON cenarios(data_inicio);

-- Índice para consultas por mês
CREATE INDEX IF NOT EXISTS idx_cenarios_mes 
ON cenarios(mes) WHERE mes IS NOT NULL;

-- Índice para consultas por trimestre
CREATE INDEX IF NOT EXISTS idx_cenarios_trimestre 
ON cenarios(trimestre) WHERE trimestre IS NOT NULL;

-- Índice para consultas por criador
CREATE INDEX IF NOT EXISTS idx_cenarios_criado_por 
ON cenarios(criado_por) WHERE criado_por IS NOT NULL;

-- Índice GIN para busca em tags
CREATE INDEX IF NOT EXISTS idx_cenarios_tags 
ON cenarios USING GIN(tags);

-- Índice para configuração JSON (campos mais consultados)
CREATE INDEX IF NOT EXISTS idx_cenarios_config_receita 
ON cenarios USING GIN((configuracao->'receitaBruta'));

-- ========================================
-- MIGRAÇÃO DE DADOS EXISTENTES
-- ========================================

-- Atualizar cenários existentes com dados extraídos da configuração
UPDATE cenarios 
SET 
    -- Extrair tipo de período da configuração JSON
    tipo_periodo = CASE 
        WHEN configuracao->'periodo'->>'tipo' IS NOT NULL 
        THEN configuracao->'periodo'->>'tipo'
        ELSE 'mensal' 
    END,
    
    -- Extrair data de início
    data_inicio = CASE 
        WHEN configuracao->'periodo'->>'inicio' IS NOT NULL 
        THEN (configuracao->'periodo'->>'inicio')::DATE
        ELSE MAKE_DATE(COALESCE((configuracao->>'ano')::INTEGER, ano, 2025), 1, 1)
    END,
    
    -- Extrair data de fim
    data_fim = CASE 
        WHEN configuracao->'periodo'->>'fim' IS NOT NULL 
        THEN (configuracao->'periodo'->>'fim')::DATE
        ELSE MAKE_DATE(COALESCE((configuracao->>'ano')::INTEGER, ano, 2025), 12, 31)
    END,
    
    -- Extrair mês se existir
    mes = CASE 
        WHEN configuracao->'periodo'->>'mes' IS NOT NULL 
        THEN (configuracao->'periodo'->>'mes')::INTEGER
        ELSE NULL
    END,
    
    -- Extrair trimestre se existir
    trimestre = CASE 
        WHEN configuracao->'periodo'->>'trimestre' IS NOT NULL 
        THEN (configuracao->'periodo'->>'trimestre')::INTEGER
        ELSE NULL
    END,
    
    -- Inicializar tags como array vazio
    tags = COALESCE(tags, '{}')
    
WHERE tipo_periodo IS NULL;

-- ========================================
-- VALIDAÇÕES ADICIONAIS
-- ========================================

-- Garantir consistência de datas
UPDATE cenarios 
SET data_fim = data_inicio + INTERVAL '11 months' + INTERVAL '30 days'
WHERE data_fim < data_inicio;

-- Garantir que cenários mensais têm mês definido
UPDATE cenarios 
SET mes = EXTRACT(MONTH FROM data_inicio)
WHERE tipo_periodo = 'mensal' AND mes IS NULL AND data_inicio IS NOT NULL;

-- Garantir que cenários trimestrais têm trimestre definido
UPDATE cenarios 
SET trimestre = CASE 
    WHEN EXTRACT(MONTH FROM data_inicio) BETWEEN 1 AND 3 THEN 1
    WHEN EXTRACT(MONTH FROM data_inicio) BETWEEN 4 AND 6 THEN 2
    WHEN EXTRACT(MONTH FROM data_inicio) BETWEEN 7 AND 9 THEN 3
    WHEN EXTRACT(MONTH FROM data_inicio) BETWEEN 10 AND 12 THEN 4
END
WHERE tipo_periodo = 'trimestral' AND trimestre IS NULL AND data_inicio IS NOT NULL;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar estrutura atualizada
-- Verificando estrutura atualizada da tabela cenarios:
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'cenarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados migrados
-- Verificando primeiros 5 cenários após migração:
SELECT 
    id, 
    nome, 
    tipo_periodo, 
    data_inicio, 
    data_fim, 
    mes, 
    trimestre, 
    array_length(tags, 1) as total_tags,
    configuracao->'receitaBruta' as receita_configurada
FROM cenarios 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar estatísticas
-- Estatísticas da migração:
SELECT 
    COUNT(*) as total_cenarios,
    COUNT(CASE WHEN tipo_periodo = 'anual' THEN 1 END) as anuais,
    COUNT(CASE WHEN tipo_periodo = 'mensal' THEN 1 END) as mensais,
    COUNT(CASE WHEN tipo_periodo = 'trimestral' THEN 1 END) as trimestrais,
    COUNT(CASE WHEN data_inicio IS NOT NULL THEN 1 END) as com_data_inicio,
    COUNT(CASE WHEN mes IS NOT NULL THEN 1 END) as com_mes,
    COUNT(CASE WHEN trimestre IS NOT NULL THEN 1 END) as com_trimestre
FROM cenarios;

-- Schema atualizado com sucesso! ✅
-- Agora o banco está sincronizado com o código TypeScript.