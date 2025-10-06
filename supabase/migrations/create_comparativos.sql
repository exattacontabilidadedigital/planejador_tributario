-- Migration: Criar tabela de comparativos de regimes tributários
-- ============================================================================
-- Esta tabela armazena análises comparativas entre diferentes regimes
-- tributários para ajudar empresas a identificar o regime mais vantajoso
-- ============================================================================

-- Criar tabela principal
CREATE TABLE IF NOT EXISTS comparativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Informações básicas
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Período de análise
  periodo_inicio TEXT NOT NULL CHECK (periodo_inicio IN ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12')),
  periodo_fim TEXT NOT NULL CHECK (periodo_fim IN ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12')),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2030),
  
  -- Regimes incluídos na comparação
  regimes_incluidos TEXT[] NOT NULL,
  
  -- Configuração de fontes de dados (JSON)
  -- Estrutura: { lucroReal: {...}, lucroPresumido: {...}, simplesNacional: {...} }
  fonte_dados JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Resultados calculados (JSON)
  -- Estrutura: { lucroReal: {...}, lucroPresumido: {...}, simplesNacional: {...}, analise: {...} }
  resultados JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT comparativos_periodo_valido CHECK (periodo_inicio <= periodo_fim),
  CONSTRAINT comparativos_regimes_min CHECK (array_length(regimes_incluidos, 1) >= 2)
);

-- Índices para melhorar performance
CREATE INDEX idx_comparativos_empresa_id ON comparativos(empresa_id);
CREATE INDEX idx_comparativos_ano ON comparativos(ano);
CREATE INDEX idx_comparativos_criado_em ON comparativos(criado_em DESC);
CREATE INDEX idx_comparativos_empresa_ano ON comparativos(empresa_id, ano);

-- Índice GIN para busca em arrays e JSON
CREATE INDEX idx_comparativos_regimes ON comparativos USING GIN (regimes_incluidos);
CREATE INDEX idx_comparativos_fonte_dados ON comparativos USING GIN (fonte_dados);
CREATE INDEX idx_comparativos_resultados ON comparativos USING GIN (resultados);

-- Trigger para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp_comparativos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_timestamp_comparativos
  BEFORE UPDATE ON comparativos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_comparativos();

-- RLS (Row Level Security)
ALTER TABLE comparativos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas comparativos de suas empresas
CREATE POLICY comparativos_select_policy ON comparativos
  FOR SELECT
  USING (true); -- Por enquanto permitir todos, ajustar conforme autenticação

-- Política: Usuários podem inserir comparativos
CREATE POLICY comparativos_insert_policy ON comparativos
  FOR INSERT
  WITH CHECK (true);

-- Política: Usuários podem atualizar apenas seus comparativos
CREATE POLICY comparativos_update_policy ON comparativos
  FOR UPDATE
  USING (true);

-- Política: Usuários podem deletar apenas seus comparativos
CREATE POLICY comparativos_delete_policy ON comparativos
  FOR DELETE
  USING (true);

-- Comentários para documentação
COMMENT ON TABLE comparativos IS 'Armazena análises comparativas entre regimes tributários';
COMMENT ON COLUMN comparativos.id IS 'Identificador único do comparativo';
COMMENT ON COLUMN comparativos.empresa_id IS 'Referência à empresa analisada';
COMMENT ON COLUMN comparativos.nome IS 'Nome descritivo do comparativo';
COMMENT ON COLUMN comparativos.periodo_inicio IS 'Mês inicial da análise (01-12)';
COMMENT ON COLUMN comparativos.periodo_fim IS 'Mês final da análise (01-12)';
COMMENT ON COLUMN comparativos.ano IS 'Ano de referência da análise';
COMMENT ON COLUMN comparativos.regimes_incluidos IS 'Array com regimes incluídos na comparação';
COMMENT ON COLUMN comparativos.fonte_dados IS 'Configuração de onde vêm os dados de cada regime (JSON)';
COMMENT ON COLUMN comparativos.resultados IS 'Resultados calculados da análise comparativa (JSON)';
