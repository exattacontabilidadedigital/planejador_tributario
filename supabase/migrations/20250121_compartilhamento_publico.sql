-- Migration: Enable public sharing for comparativos_analise
-- Created: 2025-01-21
-- Purpose: Allow anonymous access to shared comparative reports via token

-- ============================================
-- 1. RLS Policy for Public Access
-- ============================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow public read for shared comparatives" ON comparativos_analise;

-- Create policy to allow anonymous users to read shared comparatives
CREATE POLICY "Allow public read for shared comparatives"
ON comparativos_analise
FOR SELECT
TO anon
USING (
  compartilhado = true 
  AND token_compartilhamento IS NOT NULL
  AND (
    token_expira_em IS NULL 
    OR token_expira_em > NOW()
  )
);

-- ============================================
-- 2. RPC Function: Activate Public Sharing
-- ============================================

CREATE OR REPLACE FUNCTION ativar_compartilhamento_publico(
  p_comparativo_id UUID,
  p_dias_validade INTEGER DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_expira_em TIMESTAMP WITH TIME ZONE;
  v_result json;
BEGIN
  -- Generate random token (32 characters)
  v_token := encode(gen_random_bytes(24), 'hex');
  
  -- Calculate expiration date
  IF p_dias_validade > 0 THEN
    v_expira_em := NOW() + (p_dias_validade || ' days')::INTERVAL;
  ELSE
    v_expira_em := NULL;
  END IF;
  
  -- Update comparative record
  UPDATE comparativos_analise
  SET 
    compartilhado = true,
    token_compartilhamento = v_token,
    token_expira_em = v_expira_em,
    updated_at = NOW()
  WHERE id = p_comparativo_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comparativo não encontrado: %', p_comparativo_id;
  END IF;
  
  -- Return result
  v_result := json_build_object(
    'token', v_token,
    'expiraEm', v_expira_em,
    'url', '/comparativos/compartilhado/' || v_token
  );
  
  RETURN v_result;
END;
$$;

-- ============================================
-- 3. RPC Function: Deactivate Public Sharing
-- ============================================

CREATE OR REPLACE FUNCTION desativar_compartilhamento_publico(
  p_comparativo_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear sharing settings
  UPDATE comparativos_analise
  SET 
    compartilhado = false,
    token_compartilhamento = NULL,
    token_expira_em = NULL,
    updated_at = NOW()
  WHERE id = p_comparativo_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comparativo não encontrado: %', p_comparativo_id;
  END IF;
END;
$$;

-- ============================================
-- 4. RPC Function: Fetch Public Comparative
-- ============================================

CREATE OR REPLACE FUNCTION buscar_comparativo_publico(
  p_token TEXT
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  empresa_id UUID,
  empresa_nome TEXT,
  configuracao JSONB,
  resultados JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  visualizacoes_publicas INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment view counter
  UPDATE comparativos_analise
  SET visualizacoes_publicas = COALESCE(visualizacoes_publicas, 0) + 1
  WHERE 
    token_compartilhamento = p_token
    AND compartilhado = true
    AND (token_expira_em IS NULL OR token_expira_em > NOW());
  
  -- Return comparative data
  RETURN QUERY
  SELECT 
    ca.id,
    ca.nome,
    ca.empresa_id,
    e.nome_fantasia AS empresa_nome,
    ca.configuracao,
    ca.resultados,
    ca.created_at,
    ca.visualizacoes_publicas
  FROM comparativos_analise ca
  LEFT JOIN empresas e ON e.id = ca.empresa_id
  WHERE 
    ca.token_compartilhamento = p_token
    AND ca.compartilhado = true
    AND (ca.token_expira_em IS NULL OR ca.token_expira_em > NOW());
END;
$$;

-- ============================================
-- 5. Grant Execute Permissions
-- ============================================

-- Allow anonymous users to execute RPC functions
GRANT EXECUTE ON FUNCTION ativar_compartilhamento_publico(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION desativar_compartilhamento_publico(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION buscar_comparativo_publico(TEXT) TO anon, authenticated;

-- ============================================
-- 6. Comments for Documentation
-- ============================================

COMMENT ON POLICY "Allow public read for shared comparatives" ON comparativos_analise IS 
'Allows anonymous users to read comparative reports that have been publicly shared via token';

COMMENT ON FUNCTION ativar_compartilhamento_publico IS 
'Activates public sharing for a comparative report by generating a unique token';

COMMENT ON FUNCTION desativar_compartilhamento_publico IS 
'Deactivates public sharing for a comparative report by clearing the token';

COMMENT ON FUNCTION buscar_comparativo_publico IS 
'Fetches a publicly shared comparative report using its token, increments view counter';
