-- ============================================================================
-- CORREÇÃO: Função buscar_comparativo_publico
-- ============================================================================
-- Descrição: Corrige tipos de retorno e nome da coluna empresa
-- Data: 2025-01-21
-- ============================================================================

-- Drop da função existente
DROP FUNCTION IF EXISTS buscar_comparativo_publico(VARCHAR);

-- Recriar função com tipos corretos
CREATE OR REPLACE FUNCTION buscar_comparativo_publico(
    p_token TEXT
)
RETURNS TABLE (
    id UUID,
    nome TEXT,
    descricao TEXT,
    tipo TEXT,
    configuracao JSONB,
    resultados JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    empresa_nome TEXT
) AS $$
BEGIN
    -- Incrementar contador de visualizações
    UPDATE comparativos_analise
    SET visualizacoes_publicas = COALESCE(visualizacoes_publicas, 0) + 1
    WHERE token_compartilhamento = p_token
      AND compartilhado = TRUE
      AND (token_expira_em IS NULL OR token_expira_em > CURRENT_TIMESTAMP);
    
    -- Retornar dados do comparativo
    RETURN QUERY
    SELECT 
        c.id,
        c.nome::TEXT,
        c.descricao::TEXT,
        c.tipo::TEXT,
        c.configuracao,
        c.resultados,
        c.created_at,
        COALESCE(e.nome_fantasia, e.razao_social, e.nome)::TEXT as empresa_nome
    FROM comparativos_analise c
    LEFT JOIN empresas e ON c.empresa_id = e.id
    WHERE c.token_compartilhamento = p_token
      AND c.compartilhado = TRUE
      AND (c.token_expira_em IS NULL OR c.token_expira_em > CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION buscar_comparativo_publico(TEXT) TO anon, authenticated;

-- Comentário
COMMENT ON FUNCTION buscar_comparativo_publico IS 
'Busca um comparativo público via token, incrementa contador de visualizações. Retorna empresa_nome (usando nome_fantasia, razao_social ou nome da empresa)';
