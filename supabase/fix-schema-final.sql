-- Correção do schema da tabela cenarios
-- Adicionando colunas faltantes que são usadas no código

-- Verificar estrutura atual
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cenarios' 
ORDER BY ordinal_position;

-- Adicionar colunas faltantes
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tipo_periodo TEXT DEFAULT 'anual';
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS data_fim DATE;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS mes INTEGER CHECK (mes >= 1 AND mes <= 12);
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4);
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS criado_por TEXT;
ALTER TABLE cenarios ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Comentários para documentação
COMMENT ON COLUMN cenarios.tipo_periodo IS 'Tipo do período: anual, mensal, trimestral';
COMMENT ON COLUMN cenarios.data_inicio IS 'Data de início do período do cenário';
COMMENT ON COLUMN cenarios.data_fim IS 'Data de fim do período do cenário';
COMMENT ON COLUMN cenarios.mes IS 'Mês específico para cenários mensais (1-12)';
COMMENT ON COLUMN cenarios.trimestre IS 'Trimestre específico para cenários trimestrais (1-4)';
COMMENT ON COLUMN cenarios.criado_por IS 'ID do usuário que criou o cenário';
COMMENT ON COLUMN cenarios.tags IS 'Array de tags para categorização';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cenarios_tipo_periodo ON cenarios(tipo_periodo);
CREATE INDEX IF NOT EXISTS idx_cenarios_data_inicio ON cenarios(data_inicio);
CREATE INDEX IF NOT EXISTS idx_cenarios_mes ON cenarios(mes);
CREATE INDEX IF NOT EXISTS idx_cenarios_trimestre ON cenarios(trimestre);
CREATE INDEX IF NOT EXISTS idx_cenarios_criado_por ON cenarios(criado_por);
CREATE INDEX IF NOT EXISTS idx_cenarios_tags ON cenarios USING GIN(tags);

-- Atualizar cenários existentes com dados básicos
UPDATE cenarios 
SET 
  tipo_periodo = CASE 
    WHEN configuracao->>'periodo'->>'tipo' IS NOT NULL 
    THEN configuracao->>'periodo'->>'tipo'
    ELSE 'mensal' 
  END,
  data_inicio = CASE 
    WHEN configuracao->>'periodo'->>'inicio' IS NOT NULL 
    THEN (configuracao->>'periodo'->>'inicio')::DATE
    ELSE MAKE_DATE(COALESCE((configuracao->>'ano')::INTEGER, ano, 2025), 1, 1)
  END,
  data_fim = CASE 
    WHEN configuracao->>'periodo'->>'fim' IS NOT NULL 
    THEN (configuracao->>'periodo'->>'fim')::DATE
    ELSE MAKE_DATE(COALESCE((configuracao->>'ano')::INTEGER, ano, 2025), 12, 31)
  END,
  tags = '{}'
WHERE tipo_periodo IS NULL;

-- Verificar resultado
SELECT id, nome, tipo_periodo, data_inicio, data_fim, mes, trimestre, tags
FROM cenarios 
ORDER BY created_at DESC 
LIMIT 5;