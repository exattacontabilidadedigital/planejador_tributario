-- ============================================================================
-- MIGRAÇÃO: Sistema Completo de Análise Comparativa de Regimes Tributários
-- ============================================================================
-- Descrição: Cria tabela para armazenar análises comparativas completas
--           com insights, recomendações, alertas e simulações
-- Autor: Sistema de Planejamento Tributário
-- Data: 2025-10-05
-- ============================================================================

-- Criar extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA PRINCIPAL: comparativos_analise
-- ============================================================================

CREATE TABLE IF NOT EXISTS comparativos_analise (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL,
    
    -- Informações básicas
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('simples', 'multiplo', 'temporal', 'por_imposto', 'cenarios')),
    
    -- Configuração (JSONB)
    configuracao JSONB NOT NULL,
    
    -- Resultados da análise (JSONB)
    resultados JSONB NOT NULL,
    
    -- Simulações realizadas (JSONB array)
    simulacoes JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    favorito BOOLEAN DEFAULT FALSE,
    compartilhado BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    ultima_visualizacao TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT comparativos_analise_nome_check CHECK (char_length(nome) >= 3),
    CONSTRAINT comparativos_analise_configuracao_check CHECK (jsonb_typeof(configuracao) = 'object'),
    CONSTRAINT comparativos_analise_resultados_check CHECK (jsonb_typeof(resultados) = 'object'),
    CONSTRAINT comparativos_analise_simulacoes_check CHECK (jsonb_typeof(simulacoes) = 'array')
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índice principal por empresa
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_empresa 
ON comparativos_analise(empresa_id);

-- Índice para buscar comparativos recentes
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_created 
ON comparativos_analise(created_at DESC);

-- Índice para favoritos
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_favoritos 
ON comparativos_analise(empresa_id, favorito) 
WHERE favorito = TRUE;

-- Índice por tipo
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_tipo 
ON comparativos_analise(tipo);

-- Índice GIN para pesquisa em configuracao
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_config_gin 
ON comparativos_analise USING GIN (configuracao);

-- Índice GIN para pesquisa em resultados
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_resultados_gin 
ON comparativos_analise USING GIN (resultados);

-- Índice GIN para tags
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_tags 
ON comparativos_analise USING GIN (tags);

-- Índices para queries específicas em JSONB
CREATE INDEX IF NOT EXISTS idx_comparativos_analise_ano 
ON comparativos_analise ((configuracao->>'ano'));

CREATE INDEX IF NOT EXISTS idx_comparativos_analise_vencedor 
ON comparativos_analise ((resultados->'vencedor'->>'regime'));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_comparativos_analise_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comparativos_analise_updated_at
    BEFORE UPDATE ON comparativos_analise
    FOR EACH ROW
    EXECUTE FUNCTION update_comparativos_analise_updated_at();

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View para resumo de comparativos
CREATE OR REPLACE VIEW vw_comparativos_resumo AS
SELECT 
    id,
    empresa_id,
    nome,
    descricao,
    tipo,
    configuracao->>'ano' AS ano,
    jsonb_array_length(configuracao->'mesesSelecionados') AS total_meses,
    resultados->'vencedor'->>'regime' AS regime_vencedor,
    (resultados->'vencedor'->>'economia')::numeric AS economia,
    (resultados->'vencedor'->>'economiaPercentual')::numeric AS economia_percentual,
    jsonb_array_length(resultados->'insights') AS total_insights,
    jsonb_array_length(resultados->'recomendacoes') AS total_recomendacoes,
    jsonb_array_length(resultados->'alertas') AS total_alertas,
    favorito,
    ultima_visualizacao,
    created_at,
    updated_at
FROM comparativos_analise;

-- View para comparativos com insights de alta prioridade
CREATE OR REPLACE VIEW vw_comparativos_insights_importantes AS
SELECT 
    c.id,
    c.empresa_id,
    c.nome,
    insight->>'tipo' AS tipo_insight,
    insight->>'titulo' AS titulo_insight,
    insight->>'descricao' AS descricao_insight,
    (insight->>'destaque')::boolean AS destaque,
    c.created_at
FROM comparativos_analise c,
jsonb_array_elements(c.resultados->'insights') AS insight
WHERE (insight->>'destaque')::boolean = true
ORDER BY c.created_at DESC;

-- View para recomendações de alta prioridade
CREATE OR REPLACE VIEW vw_comparativos_recomendacoes_prioritarias AS
SELECT 
    c.id,
    c.empresa_id,
    c.nome,
    rec->>'tipo' AS tipo_recomendacao,
    rec->>'titulo' AS titulo,
    rec->>'descricao' AS descricao,
    rec->>'prioridade' AS prioridade,
    (rec->>'impactoFinanceiro')::numeric AS impacto_financeiro,
    c.created_at
FROM comparativos_analise c,
jsonb_array_elements(c.resultados->'recomendacoes') AS rec
WHERE rec->>'prioridade' = 'alta'
ORDER BY (rec->>'impactoFinanceiro')::numeric DESC;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE comparativos_analise ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas comparativos de suas empresas
CREATE POLICY comparativos_analise_select_policy ON comparativos_analise
    FOR SELECT
    USING (true); -- Ajustar conforme autenticação

-- Policy: Usuários podem inserir comparativos
CREATE POLICY comparativos_analise_insert_policy ON comparativos_analise
    FOR INSERT
    WITH CHECK (true); -- Ajustar conforme autenticação

-- Policy: Usuários podem atualizar seus próprios comparativos
CREATE POLICY comparativos_analise_update_policy ON comparativos_analise
    FOR UPDATE
    USING (true); -- Ajustar conforme autenticação

-- Policy: Usuários podem deletar seus próprios comparativos
CREATE POLICY comparativos_analise_delete_policy ON comparativos_analise
    FOR DELETE
    USING (true); -- Ajustar conforme autenticação

-- ============================================================================
-- FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para obter comparativos recentes de uma empresa
CREATE OR REPLACE FUNCTION get_comparativos_recentes(
    p_empresa_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    nome VARCHAR,
    tipo VARCHAR,
    regime_vencedor TEXT,
    economia NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nome,
        c.tipo,
        c.resultados->'vencedor'->>'regime' AS regime_vencedor,
        (c.resultados->'vencedor'->>'economia')::numeric AS economia,
        c.created_at
    FROM comparativos_analise c
    WHERE c.empresa_id = p_empresa_id
    ORDER BY c.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar comparativo como visualizado
CREATE OR REPLACE FUNCTION marcar_comparativo_visualizado(
    p_comparativo_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE comparativos_analise
    SET ultima_visualizacao = CURRENT_TIMESTAMP
    WHERE id = p_comparativo_id;
END;
$$ LANGUAGE plpgsql;

-- Função para toggle favorito
CREATE OR REPLACE FUNCTION toggle_favorito_comparativo(
    p_comparativo_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_novo_estado BOOLEAN;
BEGIN
    UPDATE comparativos_analise
    SET favorito = NOT favorito
    WHERE id = p_comparativo_id
    RETURNING favorito INTO v_novo_estado;
    
    RETURN v_novo_estado;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DADOS DE EXEMPLO (Opcional - remover em produção)
-- ============================================================================

-- Comentar ou remover em produção
/*
INSERT INTO comparativos_analise (empresa_id, nome, tipo, configuracao, resultados)
VALUES (
    uuid_generate_v4(),
    'Análise Fiscal Q1 2025',
    'multiplo',
    '{"empresaId": "123", "nome": "Teste", "tipo": "multiplo", "mesesSelecionados": ["01","02","03"], "ano": 2025, "lucroReal": {"incluir": true, "cenarioIds": [], "tipo": "todos"}, "dadosManuais": {"lucroPresumido": {"incluir": true}, "simplesNacional": {"incluir": true}}}'::jsonb,
    '{"vencedor": {"regime": "simples_nacional", "economia": 50000, "economiaPercentual": 23.4, "justificativa": "Menor carga tributária"}, "comparacao": {"regimes": {}, "diferencaMaxima": 0, "diferencaMinima": 0}, "analisePorImposto": {}, "cobertura": {"mesesSelecionados": ["01","02","03"], "mesesComDados": ["01","02","03"], "mesesSemDados": [], "percentualCobertura": 100, "regimesIncompletos": []}, "insights": [], "recomendacoes": [], "alertas": [], "breakEvenPoints": [], "tendencias": []}'::jsonb
);
*/

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE comparativos_analise IS 'Armazena análises comparativas completas de regimes tributários com insights e recomendações automáticas';
COMMENT ON COLUMN comparativos_analise.configuracao IS 'Configuração original do comparativo (JSON): meses, regimes, cenários, etc';
COMMENT ON COLUMN comparativos_analise.resultados IS 'Resultados processados da análise (JSON): vencedor, comparações, insights, recomendações';
COMMENT ON COLUMN comparativos_analise.simulacoes IS 'Array JSON de simulações "E se..." realizadas';
COMMENT ON COLUMN comparativos_analise.tipo IS 'Tipo de comparativo: simples, multiplo, temporal, por_imposto, cenarios';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

COMMIT;
