-- ============================================================================
-- MIGRAÇÃO: Adicionar suporte para compartilhamento público de relatórios
-- ============================================================================
-- Descrição: Adiciona colunas para token de compartilhamento e data de expiração
-- Data: 2025-11-15
-- ============================================================================

-- Adicionar coluna para token de compartilhamento (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='comparativos_analise' 
        AND column_name='token_compartilhamento'
    ) THEN
        ALTER TABLE comparativos_analise 
        ADD COLUMN token_compartilhamento VARCHAR(64) UNIQUE;
        
        CREATE INDEX IF NOT EXISTS idx_comparativos_token 
        ON comparativos_analise(token_compartilhamento) 
        WHERE token_compartilhamento IS NOT NULL;
    END IF;
END $$;

-- Adicionar coluna para data de expiração do compartilhamento
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='comparativos_analise' 
        AND column_name='token_expira_em'
    ) THEN
        ALTER TABLE comparativos_analise 
        ADD COLUMN token_expira_em TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Adicionar coluna para rastrear visualizações públicas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='comparativos_analise' 
        AND column_name='visualizacoes_publicas'
    ) THEN
        ALTER TABLE comparativos_analise 
        ADD COLUMN visualizacoes_publicas INTEGER DEFAULT 0;
    END IF;
END $$;

-- Função para gerar token único
CREATE OR REPLACE FUNCTION gerar_token_compartilhamento()
RETURNS VARCHAR AS $$
DECLARE
    caracteres TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    token TEXT := '';
    i INTEGER;
BEGIN
    -- Gerar token de 32 caracteres
    FOR i IN 1..32 LOOP
        token := token || substr(caracteres, floor(random() * length(caracteres) + 1)::integer, 1);
    END LOOP;
    
    RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para ativar compartilhamento público
CREATE OR REPLACE FUNCTION ativar_compartilhamento_publico(
    p_comparativo_id UUID,
    p_dias_validade INTEGER DEFAULT 30
)
RETURNS TABLE (
    token VARCHAR,
    expira_em TIMESTAMP WITH TIME ZONE,
    url_publica TEXT
) AS $$
DECLARE
    v_token VARCHAR(64);
    v_expira_em TIMESTAMP WITH TIME ZONE;
    v_tentativas INTEGER := 0;
    v_max_tentativas INTEGER := 10;
BEGIN
    -- Gerar token único (com retry se houver colisão)
    LOOP
        v_token := gerar_token_compartilhamento();
        v_tentativas := v_tentativas + 1;
        
        -- Verificar se token já existe
        IF NOT EXISTS (
            SELECT 1 FROM comparativos_analise 
            WHERE token_compartilhamento = v_token
        ) THEN
            EXIT;
        END IF;
        
        -- Evitar loop infinito
        IF v_tentativas >= v_max_tentativas THEN
            RAISE EXCEPTION 'Não foi possível gerar token único após % tentativas', v_max_tentativas;
        END IF;
    END LOOP;
    
    -- Calcular data de expiração
    v_expira_em := CURRENT_TIMESTAMP + (p_dias_validade || ' days')::interval;
    
    -- Atualizar comparativo
    UPDATE comparativos_analise
    SET 
        compartilhado = TRUE,
        token_compartilhamento = v_token,
        token_expira_em = v_expira_em,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_comparativo_id;
    
    -- Retornar informações
    RETURN QUERY SELECT 
        v_token,
        v_expira_em,
        '/comparativos/compartilhado/' || v_token AS url_publica;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para desativar compartilhamento público
CREATE OR REPLACE FUNCTION desativar_compartilhamento_publico(
    p_comparativo_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE comparativos_analise
    SET 
        compartilhado = FALSE,
        token_compartilhamento = NULL,
        token_expira_em = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_comparativo_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar comparativo por token (sem autenticação)
CREATE OR REPLACE FUNCTION buscar_comparativo_publico(
    p_token VARCHAR
)
RETURNS TABLE (
    id UUID,
    nome VARCHAR,
    descricao TEXT,
    tipo VARCHAR,
    configuracao JSONB,
    resultados JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    empresa_nome VARCHAR
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
        c.nome,
        c.descricao,
        c.tipo,
        c.configuracao,
        c.resultados,
        c.created_at,
        e.nome as empresa_nome
    FROM comparativos_analise c
    LEFT JOIN empresas e ON c.empresa_id = e.id
    WHERE c.token_compartilhamento = p_token
      AND c.compartilhado = TRUE
      AND (c.token_expira_em IS NULL OR c.token_expira_em > CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política RLS para permitir acesso público a relatórios compartilhados
-- (sem precisar de autenticação)
ALTER TABLE comparativos_analise ENABLE ROW LEVEL SECURITY;

-- Política para acesso público via token
CREATE POLICY "Acesso público a comparativos compartilhados"
ON comparativos_analise
FOR SELECT
TO anon, authenticated
USING (
    compartilhado = TRUE 
    AND token_compartilhamento IS NOT NULL
    AND (token_expira_em IS NULL OR token_expira_em > CURRENT_TIMESTAMP)
);

-- Comentários para documentação
COMMENT ON COLUMN comparativos_analise.token_compartilhamento IS 'Token único para acesso público ao relatório';
COMMENT ON COLUMN comparativos_analise.token_expira_em IS 'Data de expiração do token de compartilhamento';
COMMENT ON COLUMN comparativos_analise.visualizacoes_publicas IS 'Contador de visualizações via link público';
COMMENT ON FUNCTION ativar_compartilhamento_publico IS 'Gera token único e ativa compartilhamento público do relatório';
COMMENT ON FUNCTION desativar_compartilhamento_publico IS 'Remove token e desativa compartilhamento público do relatório';
COMMENT ON FUNCTION buscar_comparativo_publico IS 'Busca relatório compartilhado por token (acesso público)';
