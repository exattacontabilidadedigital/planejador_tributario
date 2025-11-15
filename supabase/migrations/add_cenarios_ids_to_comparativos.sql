-- Migration: Criar tabela comparativos com coluna cenarios_ids
-- ============================================================================
-- Esta migration cria a tabela comparativos se não existir
-- e adiciona a coluna cenarios_ids que armazena os IDs dos cenários
-- ============================================================================

-- 1. CRIAR TABELA COMPARATIVOS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.comparativos (
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
  
  -- IDs dos cenários usados na análise
  cenarios_ids UUID[] NOT NULL DEFAULT '{}',
  
  -- Configuração de fontes de dados (JSON)
  fonte_dados JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Resultados calculados (JSON)
  resultados JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT comparativos_periodo_valido CHECK (periodo_inicio <= periodo_fim),
  CONSTRAINT comparativos_regimes_min CHECK (array_length(regimes_incluidos, 1) >= 2)
);

-- 2. ADICIONAR COLUNA cenarios_ids SE NÃO EXISTIR (para tabelas já criadas)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'comparativos' 
    AND column_name = 'cenarios_ids'
  ) THEN
    ALTER TABLE comparativos 
    ADD COLUMN cenarios_ids UUID[] NOT NULL DEFAULT '{}';
    
    RAISE NOTICE 'Coluna cenarios_ids adicionada à tabela comparativos';
  ELSE
    RAISE NOTICE 'Coluna cenarios_ids já existe na tabela comparativos';
  END IF;
END $$;

-- 3. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_comparativos_empresa_id ON comparativos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_comparativos_ano ON comparativos(ano);
CREATE INDEX IF NOT EXISTS idx_comparativos_criado_em ON comparativos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_comparativos_empresa_ano ON comparativos(empresa_id, ano);
CREATE INDEX IF NOT EXISTS idx_comparativos_regimes ON comparativos USING GIN (regimes_incluidos);
CREATE INDEX IF NOT EXISTS idx_comparativos_fonte_dados ON comparativos USING GIN (fonte_dados);
CREATE INDEX IF NOT EXISTS idx_comparativos_resultados ON comparativos USING GIN (resultados);
CREATE INDEX IF NOT EXISTS idx_comparativos_cenarios_ids ON comparativos USING GIN(cenarios_ids);

-- 4. CRIAR FUNÇÃO DE TRIGGER PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION atualizar_timestamp_comparativos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
DROP TRIGGER IF EXISTS trigger_atualizar_timestamp_comparativos ON comparativos;
CREATE TRIGGER trigger_atualizar_timestamp_comparativos
  BEFORE UPDATE ON comparativos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_comparativos();

-- 6. CRIAR FUNÇÃO DE VALIDAÇÃO DE CENÁRIOS
CREATE OR REPLACE FUNCTION validar_cenarios_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Permitir array vazio (para casos onde não há cenários ainda)
  IF array_length(NEW.cenarios_ids, 1) IS NULL OR array_length(NEW.cenarios_ids, 1) = 0 THEN
    RETURN NEW;
  END IF;
  
  -- Validar que todos os cenários existem
  IF NOT (
    SELECT COUNT(*) = array_length(NEW.cenarios_ids, 1)
    FROM cenarios
    WHERE id = ANY(NEW.cenarios_ids)
  ) THEN
    RAISE EXCEPTION 'Um ou mais IDs de cenários são inválidos';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR TRIGGER PARA VALIDAR CENÁRIOS
DROP TRIGGER IF EXISTS trigger_validar_cenarios_ids ON comparativos;
CREATE TRIGGER trigger_validar_cenarios_ids
  BEFORE INSERT OR UPDATE ON comparativos
  FOR EACH ROW
  EXECUTE FUNCTION validar_cenarios_ids();

-- 8. HABILITAR RLS (Row Level Security)
ALTER TABLE comparativos ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS RLS
DROP POLICY IF EXISTS comparativos_select_policy ON comparativos;
CREATE POLICY comparativos_select_policy ON comparativos
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS comparativos_insert_policy ON comparativos;
CREATE POLICY comparativos_insert_policy ON comparativos
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS comparativos_update_policy ON comparativos;
CREATE POLICY comparativos_update_policy ON comparativos
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS comparativos_delete_policy ON comparativos;
CREATE POLICY comparativos_delete_policy ON comparativos
  FOR DELETE
  USING (true);

-- 10. COMENTÁRIOS
COMMENT ON TABLE comparativos IS 'Armazena análises comparativas entre regimes tributários';
COMMENT ON COLUMN comparativos.cenarios_ids IS 'Array de UUIDs dos cenários incluídos na análise comparativa';
