-- Adicionar colunas para armazenar resultados calculados e dados mensais
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna 'resultados' (JSONB) para armazenar impostos calculados
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS resultados JSONB DEFAULT NULL;

-- 2. Adicionar coluna 'dados_mensais' (JSONB) para armazenar dados mês a mês
ALTER TABLE cenarios 
ADD COLUMN IF NOT EXISTS dados_mensais JSONB DEFAULT NULL;

-- 3. Comentários para documentação
COMMENT ON COLUMN cenarios.resultados IS 'Resultados calculados dos impostos: ICMS, PIS, COFINS, IRPJ, CSLL, etc';
COMMENT ON COLUMN cenarios.dados_mensais IS 'Array com dados mensais (receita, impostos, lucro) para cada mês do ano';

-- 4. Criar índice GIN para consultas em JSONB (opcional, mas melhora performance)
CREATE INDEX IF NOT EXISTS idx_cenarios_resultados ON cenarios USING GIN(resultados);
CREATE INDEX IF NOT EXISTS idx_cenarios_dados_mensais ON cenarios USING GIN(dados_mensais);

-- Verificação
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'cenarios'
  AND column_name IN ('resultados', 'dados_mensais');
