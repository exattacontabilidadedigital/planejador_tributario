-- ============================================
-- SCHEMA COMPLETO - Tax Planner
-- Supabase PostgreSQL
-- ============================================

-- ============================================
-- 1. TABELA: empresas
-- ============================================

CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  regime_tributario TEXT NOT NULL CHECK (regime_tributario IN ('lucro-real', 'lucro-presumido', 'simples')),
  setor TEXT NOT NULL CHECK (setor IN ('comercio', 'industria', 'servicos')),
  uf TEXT NOT NULL,
  municipio TEXT NOT NULL,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  logo_url TEXT,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX idx_empresas_nome ON empresas(nome);
CREATE INDEX idx_empresas_criado_por ON empresas(criado_por);

-- ============================================
-- 2. TABELA: cenarios
-- ============================================

CREATE TABLE cenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Período
  periodo_tipo TEXT NOT NULL CHECK (periodo_tipo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  periodo_mes INTEGER CHECK (periodo_mes BETWEEN 1 AND 12),
  periodo_ano INTEGER NOT NULL,
  periodo_trimestre INTEGER CHECK (periodo_trimestre BETWEEN 1 AND 4),
  
  -- Configuração tributária (JSONB para flexibilidade)
  config JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aprovado', 'arquivado')),
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Tags (array)
  tags TEXT[] DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT periodo_valido CHECK (periodo_fim >= periodo_inicio)
);

-- Índices
CREATE INDEX idx_cenarios_empresa_id ON cenarios(empresa_id);
CREATE INDEX idx_cenarios_status ON cenarios(status);
CREATE INDEX idx_cenarios_periodo_ano ON cenarios(periodo_ano);
CREATE INDEX idx_cenarios_tags ON cenarios USING GIN(tags);
CREATE INDEX idx_cenarios_config ON cenarios USING GIN(config);

-- ============================================
-- 3. TABELA: comparativos
-- ============================================

CREATE TABLE comparativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Cenários comparados (array de UUIDs)
  cenarios_ids UUID[] NOT NULL,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT min_cenarios CHECK (array_length(cenarios_ids, 1) >= 2),
  CONSTRAINT max_cenarios CHECK (array_length(cenarios_ids, 1) <= 4)
);

-- Índices
CREATE INDEX idx_comparativos_empresa_id ON comparativos(empresa_id);
CREATE INDEX idx_comparativos_cenarios_ids ON comparativos USING GIN(cenarios_ids);

-- ============================================
-- 4. FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabela
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cenarios_updated_at
  BEFORE UPDATE ON cenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparativos_updated_at
  BEFORE UPDATE ON comparativos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para validar cenários em comparativo
CREATE OR REPLACE FUNCTION validate_comparativo_cenarios()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se todos os cenários existem e pertencem à empresa
  IF NOT (
    SELECT COUNT(*) = array_length(NEW.cenarios_ids, 1)
    FROM cenarios
    WHERE id = ANY(NEW.cenarios_ids)
    AND empresa_id = NEW.empresa_id
  ) THEN
    RAISE EXCEPTION 'Todos os cenários devem pertencer à empresa';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_comparativo_cenarios_trigger
  BEFORE INSERT OR UPDATE ON comparativos
  FOR EACH ROW
  EXECUTE FUNCTION validate_comparativo_cenarios();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparativos ENABLE ROW LEVEL SECURITY;

-- Políticas para modo SINGLE-USER (sem auth) - MVP
-- ATENÇÃO: Isso permite acesso total. Adequado apenas para MVP/testes.
CREATE POLICY "Permitir tudo para empresas" ON empresas FOR ALL USING (true);
CREATE POLICY "Permitir tudo para cenarios" ON cenarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo para comparativos" ON comparativos FOR ALL USING (true);

-- ============================================
-- POLÍTICAS FUTURAS MULTI-USER (comentadas)
-- Descomente quando implementar autenticação
-- ============================================

/*
-- Empresas
DROP POLICY IF EXISTS "Permitir tudo para empresas" ON empresas;

CREATE POLICY "Usuários veem suas empresas" ON empresas
  FOR SELECT USING (auth.uid() = criado_por);

CREATE POLICY "Usuários criam suas empresas" ON empresas
  FOR INSERT WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Usuários atualizam suas empresas" ON empresas
  FOR UPDATE USING (auth.uid() = criado_por);

CREATE POLICY "Usuários deletam suas empresas" ON empresas
  FOR DELETE USING (auth.uid() = criado_por);

-- Cenários
DROP POLICY IF EXISTS "Permitir tudo para cenarios" ON cenarios;

CREATE POLICY "Usuários veem cenários de suas empresas" ON cenarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = cenarios.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );

CREATE POLICY "Usuários criam cenários" ON cenarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = cenarios.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );

CREATE POLICY "Usuários atualizam cenários de suas empresas" ON cenarios
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = cenarios.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );

CREATE POLICY "Usuários deletam cenários de suas empresas" ON cenarios
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = cenarios.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );

-- Comparativos (similar aos cenários)
DROP POLICY IF EXISTS "Permitir tudo para comparativos" ON comparativos;

CREATE POLICY "Usuários veem comparativos de suas empresas" ON comparativos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = comparativos.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );

CREATE POLICY "Usuários criam comparativos" ON comparativos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = comparativos.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );

CREATE POLICY "Usuários atualizam comparativos de suas empresas" ON comparativos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = comparativos.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );

CREATE POLICY "Usuários deletam comparativos de suas empresas" ON comparativos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = comparativos.empresa_id
      AND empresas.criado_por = auth.uid()
    )
  );
*/

-- ============================================
-- 6. FUNÇÕES AUXILIARES
-- ============================================

-- Buscar cenários por empresa
CREATE OR REPLACE FUNCTION get_cenarios_by_empresa(empresa_uuid UUID)
RETURNS SETOF cenarios AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM cenarios
  WHERE empresa_id = empresa_uuid
  ORDER BY atualizado_em DESC;
END;
$$ LANGUAGE plpgsql;

-- Estatísticas da empresa
CREATE OR REPLACE FUNCTION get_empresa_stats(empresa_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_cenarios', (SELECT COUNT(*) FROM cenarios WHERE empresa_id = empresa_uuid),
    'cenarios_aprovados', (SELECT COUNT(*) FROM cenarios WHERE empresa_id = empresa_uuid AND status = 'aprovado'),
    'cenarios_rascunho', (SELECT COUNT(*) FROM cenarios WHERE empresa_id = empresa_uuid AND status = 'rascunho'),
    'cenarios_arquivados', (SELECT COUNT(*) FROM cenarios WHERE empresa_id = empresa_uuid AND status = 'arquivado'),
    'total_comparativos', (SELECT COUNT(*) FROM comparativos WHERE empresa_id = empresa_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. DADOS DE EXEMPLO (opcional)
-- ============================================

-- Inserir empresa de exemplo
/*
INSERT INTO empresas (nome, cnpj, razao_social, regime_tributario, setor, uf, municipio)
VALUES ('Empresa Exemplo', '12.345.678/0001-90', 'Empresa Exemplo LTDA', 'lucro-real', 'comercio', 'SP', 'São Paulo');
*/

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Para verificar as tabelas criadas:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Para verificar os índices:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Para verificar as políticas RLS:
-- SELECT * FROM pg_policies;
