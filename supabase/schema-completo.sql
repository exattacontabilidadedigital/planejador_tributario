-- ===============================================
-- SCHEMA COMPLETO SUPABASE - TAX PLANNER REACT
-- Migração completa do sistema - Outubro 2024
-- ===============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- TABELA: empresas
-- ===============================================
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  razao_social TEXT NOT NULL,
  regime_tributario TEXT NOT NULL CHECK (regime_tributario IN ('lucro-real', 'lucro-presumido', 'simples')),
  setor TEXT NOT NULL CHECK (setor IN ('comercio', 'industria', 'servicos')),
  uf TEXT NOT NULL,
  municipio TEXT NOT NULL,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: cenarios
-- ===============================================
CREATE TABLE IF NOT EXISTS cenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Período do cenário
  tipo_periodo TEXT NOT NULL CHECK (tipo_periodo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER CHECK (mes >= 1 AND mes <= 12),
  trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),
  
  -- Status e controle
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aprovado', 'arquivado')),
  criado_por TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Configurações tributárias (JSONB para flexibilidade)
  configuracao JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: comparativos
-- ===============================================
CREATE TABLE IF NOT EXISTS comparativos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cenario_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: despesas_dinamicas
-- ===============================================
CREATE TABLE IF NOT EXISTS despesas_dinamicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cenario_id UUID NOT NULL REFERENCES cenarios(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL CHECK (tipo IN ('custo', 'despesa')),
  credito TEXT NOT NULL CHECK (credito IN ('com-credito', 'sem-credito')),
  categoria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: calculos_icms (Memória de Cálculo ICMS)
-- ===============================================
CREATE TABLE IF NOT EXISTS calculos_icms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cenario_id UUID NOT NULL REFERENCES cenarios(id) ON DELETE CASCADE,
  
  -- Débitos ICMS
  vendas_internas_base DECIMAL(15,2) DEFAULT 0,
  vendas_internas_aliquota DECIMAL(5,4) DEFAULT 0,
  vendas_internas_valor DECIMAL(15,2) DEFAULT 0,
  
  vendas_interestaduais_base DECIMAL(15,2) DEFAULT 0,
  vendas_interestaduais_aliquota DECIMAL(5,4) DEFAULT 0,
  vendas_interestaduais_valor DECIMAL(15,2) DEFAULT 0,
  
  difal_base DECIMAL(15,2) DEFAULT 0,
  difal_aliquota DECIMAL(5,4) DEFAULT 0,
  difal_valor DECIMAL(15,2) DEFAULT 0,
  
  fcp_base DECIMAL(15,2) DEFAULT 0,
  fcp_aliquota DECIMAL(5,4) DEFAULT 0,
  fcp_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Créditos ICMS
  credito_compras_internas_base DECIMAL(15,2) DEFAULT 0,
  credito_compras_internas_aliquota DECIMAL(5,4) DEFAULT 0,
  credito_compras_internas_valor DECIMAL(15,2) DEFAULT 0,
  
  credito_compras_interestaduais_base DECIMAL(15,2) DEFAULT 0,
  credito_compras_interestaduais_aliquota DECIMAL(5,4) DEFAULT 0,
  credito_compras_interestaduais_valor DECIMAL(15,2) DEFAULT 0,
  
  credito_estoque_inicial_base DECIMAL(15,2) DEFAULT 0,
  credito_estoque_inicial_valor DECIMAL(15,2) DEFAULT 0,
  
  credito_ativo_imobilizado_base DECIMAL(15,2) DEFAULT 0,
  credito_ativo_imobilizado_valor DECIMAL(15,2) DEFAULT 0,
  
  credito_energia_base DECIMAL(15,2) DEFAULT 0,
  credito_energia_valor DECIMAL(15,2) DEFAULT 0,
  
  credito_st_base DECIMAL(15,2) DEFAULT 0,
  credito_st_valor DECIMAL(15,2) DEFAULT 0,
  
  outros_creditos_base DECIMAL(15,2) DEFAULT 0,
  outros_creditos_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Totais
  total_debitos DECIMAL(15,2) DEFAULT 0,
  total_creditos DECIMAL(15,2) DEFAULT 0,
  icms_a_pagar DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: calculos_pis_cofins (Memória de Cálculo PIS/COFINS)
-- ===============================================
CREATE TABLE IF NOT EXISTS calculos_pis_cofins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cenario_id UUID NOT NULL REFERENCES cenarios(id) ON DELETE CASCADE,
  
  -- Débitos
  debito_pis_base DECIMAL(15,2) DEFAULT 0,
  debito_pis_aliquota DECIMAL(5,4) DEFAULT 0,
  debito_pis_valor DECIMAL(15,2) DEFAULT 0,
  
  debito_cofins_base DECIMAL(15,2) DEFAULT 0,
  debito_cofins_aliquota DECIMAL(5,4) DEFAULT 0,
  debito_cofins_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Créditos sobre compras
  credito_pis_compras_base DECIMAL(15,2) DEFAULT 0,
  credito_pis_compras_aliquota DECIMAL(5,4) DEFAULT 0,
  credito_pis_compras_valor DECIMAL(15,2) DEFAULT 0,
  
  credito_cofins_compras_base DECIMAL(15,2) DEFAULT 0,
  credito_cofins_compras_aliquota DECIMAL(5,4) DEFAULT 0,
  credito_cofins_compras_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Créditos sobre despesas
  credito_pis_despesas_base DECIMAL(15,2) DEFAULT 0,
  credito_pis_despesas_aliquota DECIMAL(5,4) DEFAULT 0,
  credito_pis_despesas_valor DECIMAL(15,2) DEFAULT 0,
  
  credito_cofins_despesas_base DECIMAL(15,2) DEFAULT 0,
  credito_cofins_despesas_aliquota DECIMAL(5,4) DEFAULT 0,
  credito_cofins_despesas_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Totais
  total_debitos_pis DECIMAL(15,2) DEFAULT 0,
  total_creditos_pis DECIMAL(15,2) DEFAULT 0,
  pis_a_pagar DECIMAL(15,2) DEFAULT 0,
  
  total_debitos_cofins DECIMAL(15,2) DEFAULT 0,
  total_creditos_cofins DECIMAL(15,2) DEFAULT 0,
  cofins_a_pagar DECIMAL(15,2) DEFAULT 0,
  
  total_pis_cofins DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: calculos_irpj_csll (Memória de Cálculo IRPJ/CSLL)
-- ===============================================
CREATE TABLE IF NOT EXISTS calculos_irpj_csll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cenario_id UUID NOT NULL REFERENCES cenarios(id) ON DELETE CASCADE,
  
  -- Base de cálculo
  receita_bruta DECIMAL(15,2) DEFAULT 0,
  cmv DECIMAL(15,2) DEFAULT 0,
  despesas_operacionais DECIMAL(15,2) DEFAULT 0,
  lucro_antes_ircsll DECIMAL(15,2) DEFAULT 0,
  adicoes DECIMAL(15,2) DEFAULT 0,
  exclusoes DECIMAL(15,2) DEFAULT 0,
  lucro_real DECIMAL(15,2) DEFAULT 0,
  limite_anual DECIMAL(15,2) DEFAULT 0,
  
  -- IRPJ
  irpj_base_base DECIMAL(15,2) DEFAULT 0,
  irpj_base_aliquota DECIMAL(5,4) DEFAULT 0,
  irpj_base_valor DECIMAL(15,2) DEFAULT 0,
  
  irpj_adicional_base DECIMAL(15,2) DEFAULT 0,
  irpj_adicional_aliquota DECIMAL(5,4) DEFAULT 0,
  irpj_adicional_valor DECIMAL(15,2) DEFAULT 0,
  
  total_irpj DECIMAL(15,2) DEFAULT 0,
  
  -- CSLL
  csll_base DECIMAL(15,2) DEFAULT 0,
  csll_aliquota DECIMAL(5,4) DEFAULT 0,
  csll_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Total
  total_irpj_csll DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: calculos_dre (Demonstração do Resultado do Exercício)
-- ===============================================
CREATE TABLE IF NOT EXISTS calculos_dre (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cenario_id UUID NOT NULL REFERENCES cenarios(id) ON DELETE CASCADE,
  
  -- Receitas
  receita_bruta_vendas DECIMAL(15,2) DEFAULT 0,
  
  -- Deduções
  deducoes_icms DECIMAL(15,2) DEFAULT 0,
  deducoes_pis DECIMAL(15,2) DEFAULT 0,
  deducoes_cofins DECIMAL(15,2) DEFAULT 0,
  deducoes_pis_cofins DECIMAL(15,2) DEFAULT 0,
  deducoes_iss DECIMAL(15,2) DEFAULT 0,
  deducoes_total DECIMAL(15,2) DEFAULT 0,
  
  -- Receita líquida
  receita_liquida DECIMAL(15,2) DEFAULT 0,
  
  -- Custos
  cmv DECIMAL(15,2) DEFAULT 0,
  lucro_bruto DECIMAL(15,2) DEFAULT 0,
  
  -- Despesas operacionais
  despesas_operacionais_dinamicas DECIMAL(15,2) DEFAULT 0,
  despesas_operacionais_total DECIMAL(15,2) DEFAULT 0,
  
  -- Lucro antes dos impostos
  lucro_antes_ircsll DECIMAL(15,2) DEFAULT 0,
  
  -- Impostos
  impostos_irpj DECIMAL(15,2) DEFAULT 0,
  impostos_csll DECIMAL(15,2) DEFAULT 0,
  impostos_total DECIMAL(15,2) DEFAULT 0,
  
  -- Resultado final
  lucro_liquido DECIMAL(15,2) DEFAULT 0,
  margem_bruta DECIMAL(5,4) DEFAULT 0,
  margem_liquida DECIMAL(5,4) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: relatorios_consolidados (Cache de relatórios)
-- ===============================================
CREATE TABLE IF NOT EXISTS relatorios_consolidados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER CHECK (mes >= 1 AND mes <= 12),
  
  -- Dados agregados por período
  receita_total DECIMAL(15,2) DEFAULT 0,
  impostos_total DECIMAL(15,2) DEFAULT 0,
  lucro_total DECIMAL(15,2) DEFAULT 0,
  margem_total DECIMAL(5,4) DEFAULT 0,
  carga_tributaria DECIMAL(5,4) DEFAULT 0,
  
  -- Composição de impostos
  icms_total DECIMAL(15,2) DEFAULT 0,
  pis_total DECIMAL(15,2) DEFAULT 0,
  cofins_total DECIMAL(15,2) DEFAULT 0,
  irpj_total DECIMAL(15,2) DEFAULT 0,
  csll_total DECIMAL(15,2) DEFAULT 0,
  iss_total DECIMAL(15,2) DEFAULT 0,
  
  -- Metadados
  cenarios_aprovados INTEGER DEFAULT 0,
  ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- TABELA: configuracoes_sistema (Configurações globais)
-- ===============================================
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL DEFAULT '{}',
  descricao TEXT,
  categoria TEXT DEFAULT 'geral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- ÍNDICES PARA PERFORMANCE
-- ===============================================

-- Empresas
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_regime ON empresas(regime_tributario);
CREATE INDEX IF NOT EXISTS idx_empresas_setor ON empresas(setor);
CREATE INDEX IF NOT EXISTS idx_empresas_created_at ON empresas(created_at DESC);

-- Cenários
CREATE INDEX IF NOT EXISTS idx_cenarios_empresa_id ON cenarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cenarios_ano ON cenarios(ano);
CREATE INDEX IF NOT EXISTS idx_cenarios_status ON cenarios(status);
CREATE INDEX IF NOT EXISTS idx_cenarios_tipo_periodo ON cenarios(tipo_periodo);
CREATE INDEX IF NOT EXISTS idx_cenarios_created_at ON cenarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cenarios_configuracao ON cenarios USING GIN(configuracao);
CREATE INDEX IF NOT EXISTS idx_cenarios_tags ON cenarios USING GIN(tags);

-- Comparativos
CREATE INDEX IF NOT EXISTS idx_comparativos_empresa_id ON comparativos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_comparativos_cenario_ids ON comparativos USING GIN(cenario_ids);
CREATE INDEX IF NOT EXISTS idx_comparativos_created_at ON comparativos(created_at DESC);

-- Despesas dinâmicas
CREATE INDEX IF NOT EXISTS idx_despesas_dinamicas_cenario_id ON despesas_dinamicas(cenario_id);
CREATE INDEX IF NOT EXISTS idx_despesas_dinamicas_tipo ON despesas_dinamicas(tipo);
CREATE INDEX IF NOT EXISTS idx_despesas_dinamicas_credito ON despesas_dinamicas(credito);

-- Cálculos
CREATE INDEX IF NOT EXISTS idx_calculos_icms_cenario_id ON calculos_icms(cenario_id);
CREATE INDEX IF NOT EXISTS idx_calculos_pis_cofins_cenario_id ON calculos_pis_cofins(cenario_id);
CREATE INDEX IF NOT EXISTS idx_calculos_irpj_csll_cenario_id ON calculos_irpj_csll(cenario_id);
CREATE INDEX IF NOT EXISTS idx_calculos_dre_cenario_id ON calculos_dre(cenario_id);

-- Relatórios
CREATE INDEX IF NOT EXISTS idx_relatorios_empresa_ano ON relatorios_consolidados(empresa_id, ano);
CREATE INDEX IF NOT EXISTS idx_relatorios_ano_mes ON relatorios_consolidados(ano, mes);

-- Configurações
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes_sistema(chave);
CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria ON configuracoes_sistema(categoria);

-- ===============================================
-- TRIGGERS PARA UPDATED_AT
-- ===============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas (protegidos contra execução dupla)
DO $$
BEGIN
    -- Trigger para empresas
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_empresas_updated_at') THEN
        CREATE TRIGGER update_empresas_updated_at 
            BEFORE UPDATE ON empresas 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para cenarios
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cenarios_updated_at') THEN
        CREATE TRIGGER update_cenarios_updated_at 
            BEFORE UPDATE ON cenarios 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para comparativos
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_comparativos_updated_at') THEN
        CREATE TRIGGER update_comparativos_updated_at 
            BEFORE UPDATE ON comparativos 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para despesas_dinamicas
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_despesas_dinamicas_updated_at') THEN
        CREATE TRIGGER update_despesas_dinamicas_updated_at 
            BEFORE UPDATE ON despesas_dinamicas 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para calculos_icms
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_calculos_icms_updated_at') THEN
        CREATE TRIGGER update_calculos_icms_updated_at 
            BEFORE UPDATE ON calculos_icms 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para calculos_pis_cofins
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_calculos_pis_cofins_updated_at') THEN
        CREATE TRIGGER update_calculos_pis_cofins_updated_at 
            BEFORE UPDATE ON calculos_pis_cofins 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para calculos_irpj_csll
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_calculos_irpj_csll_updated_at') THEN
        CREATE TRIGGER update_calculos_irpj_csll_updated_at 
            BEFORE UPDATE ON calculos_irpj_csll 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para calculos_dre
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_calculos_dre_updated_at') THEN
        CREATE TRIGGER update_calculos_dre_updated_at 
            BEFORE UPDATE ON calculos_dre 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para relatorios_consolidados
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_relatorios_consolidados_updated_at') THEN
        CREATE TRIGGER update_relatorios_consolidados_updated_at 
            BEFORE UPDATE ON relatorios_consolidados 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para configuracoes_sistema
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_configuracoes_sistema_updated_at') THEN
        CREATE TRIGGER update_configuracoes_sistema_updated_at 
            BEFORE UPDATE ON configuracoes_sistema 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ===============================================
-- FUNÇÕES AUXILIARES
-- ===============================================

-- Função para validar CNPJ (básica)
CREATE OR REPLACE FUNCTION is_valid_cnpj(cnpj_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF cnpj_input IS NULL THEN
        RETURN TRUE; -- CNPJ é opcional
    END IF;
    
    -- Remove caracteres não numéricos
    cnpj_input := REGEXP_REPLACE(cnpj_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 14 dígitos
    IF LENGTH(cnpj_input) != 14 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se não são todos números iguais
    IF cnpj_input ~ '^(.)\1*$' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar cenários por empresa com filtros
CREATE OR REPLACE FUNCTION get_cenarios_filtered(
    empresa_uuid UUID,
    status_filter TEXT DEFAULT NULL,
    ano_filter INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    nome TEXT,
    descricao TEXT,
    tipo_periodo TEXT,
    ano INTEGER,
    status TEXT,
    configuracao JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nome, c.descricao, c.tipo_periodo, c.ano, c.status, c.configuracao, c.created_at, c.updated_at
    FROM cenarios c
    WHERE c.empresa_id = empresa_uuid
      AND (status_filter IS NULL OR c.status = status_filter)
      AND (ano_filter IS NULL OR c.ano = ano_filter)
    ORDER BY c.created_at DESC
    LIMIT COALESCE(limit_count, 1000);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular totais de relatório por empresa/ano
CREATE OR REPLACE FUNCTION calcular_totais_relatorio(
    empresa_uuid UUID,
    ano_param INTEGER
)
RETURNS TABLE(
    receita_total DECIMAL(15,2),
    impostos_total DECIMAL(15,2),
    lucro_total DECIMAL(15,2),
    margem_media DECIMAL(5,4),
    carga_tributaria_media DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(dre.receita_bruta_vendas), 0) as receita_total,
        COALESCE(SUM(dre.deducoes_total + dre.impostos_total), 0) as impostos_total,
        COALESCE(SUM(dre.lucro_liquido), 0) as lucro_total,
        COALESCE(AVG(dre.margem_liquida), 0) as margem_media,
        COALESCE(AVG(
            CASE 
                WHEN dre.receita_bruta_vendas > 0 
                THEN (dre.deducoes_total + dre.impostos_total) / dre.receita_bruta_vendas 
                ELSE 0 
            END
        ), 0) as carga_tributaria_media
    FROM calculos_dre dre
    JOIN cenarios c ON c.id = dre.cenario_id
    WHERE c.empresa_id = empresa_uuid 
      AND c.ano = ano_param
      AND c.status = 'aprovado';
END;
$$ LANGUAGE plpgsql;

-- Função para duplicar cenário com todos os cálculos
CREATE OR REPLACE FUNCTION duplicar_cenario_completo(
    cenario_original_id UUID,
    novo_nome TEXT,
    nova_descricao TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    novo_cenario_id UUID;
    cenario_original RECORD;
BEGIN
    -- Buscar cenário original
    SELECT * INTO cenario_original FROM cenarios WHERE id = cenario_original_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cenário não encontrado: %', cenario_original_id;
    END IF;
    
    -- Criar novo cenário
    INSERT INTO cenarios (
        empresa_id, nome, descricao, tipo_periodo, data_inicio, data_fim, 
        ano, mes, trimestre, status, configuracao
    ) VALUES (
        cenario_original.empresa_id,
        novo_nome,
        COALESCE(nova_descricao, cenario_original.descricao),
        cenario_original.tipo_periodo,
        cenario_original.data_inicio,
        cenario_original.data_fim,
        cenario_original.ano,
        cenario_original.mes,
        cenario_original.trimestre,
        'rascunho', -- Sempre criar como rascunho
        cenario_original.configuracao
    ) RETURNING id INTO novo_cenario_id;
    
    -- Duplicar despesas dinâmicas
    INSERT INTO despesas_dinamicas (cenario_id, descricao, valor, tipo, credito, categoria)
    SELECT novo_cenario_id, descricao, valor, tipo, credito, categoria
    FROM despesas_dinamicas WHERE cenario_id = cenario_original_id;
    
    -- Duplicar cálculos (apenas se existirem)
    -- ICMS
    INSERT INTO calculos_icms (cenario_id, vendas_internas_base, vendas_internas_aliquota, vendas_internas_valor)
    SELECT novo_cenario_id, vendas_internas_base, vendas_internas_aliquota, vendas_internas_valor
    FROM calculos_icms WHERE cenario_id = cenario_original_id;
    
    -- PIS/COFINS 
    INSERT INTO calculos_pis_cofins (cenario_id, debito_pis_base, debito_pis_aliquota, debito_pis_valor)
    SELECT novo_cenario_id, debito_pis_base, debito_pis_aliquota, debito_pis_valor
    FROM calculos_pis_cofins WHERE cenario_id = cenario_original_id;
    
    -- IRPJ/CSLL
    INSERT INTO calculos_irpj_csll (cenario_id, receita_bruta, cmv, despesas_operacionais)
    SELECT novo_cenario_id, receita_bruta, cmv, despesas_operacionais
    FROM calculos_irpj_csll WHERE cenario_id = cenario_original_id;
    
    -- DRE
    INSERT INTO calculos_dre (cenario_id, receita_bruta_vendas, receita_liquida, lucro_liquido)
    SELECT novo_cenario_id, receita_bruta_vendas, receita_liquida, lucro_liquido
    FROM calculos_dre WHERE cenario_id = cenario_original_id;
    
    RETURN novo_cenario_id;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- VALIDAÇÕES E CONSTRAINTS
-- ===============================================

-- Validação de CNPJ (tentar adicionar apenas se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'empresas' AND constraint_name = 'valid_cnpj'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT valid_cnpj 
            CHECK (is_valid_cnpj(cnpj));
    END IF;
END $$;

-- Validação de ano do cenário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cenarios' AND constraint_name = 'valid_ano'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT valid_ano 
            CHECK (ano >= 2020 AND ano <= 2030);
    END IF;
END $$;

-- Validação de período
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cenarios' AND constraint_name = 'valid_periodo'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT valid_periodo 
            CHECK (data_inicio <= data_fim);
    END IF;
END $$;

-- Validação de mes/trimestre baseado no tipo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cenarios' AND constraint_name = 'valid_mes_tipo'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT valid_mes_tipo 
            CHECK (
                (tipo_periodo = 'mensal' AND mes IS NOT NULL) OR
                (tipo_periodo = 'trimestral' AND trimestre IS NOT NULL) OR
                (tipo_periodo IN ('semestral', 'anual'))
            );
    END IF;
END $$;

-- Validação de valores monetários não negativos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'despesas_dinamicas' AND constraint_name = 'valid_valor_positivo'
    ) THEN
        ALTER TABLE despesas_dinamicas ADD CONSTRAINT valid_valor_positivo 
            CHECK (valor >= 0);
    END IF;
END $$;

-- ===============================================
-- VIEWS ÚTEIS
-- ===============================================

-- View com estatísticas de empresas
DO $$
BEGIN
    DROP VIEW IF EXISTS empresas_estatisticas CASCADE;
    
    -- Verifica se as tabelas necessárias existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cenarios')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comparativos')
    THEN
        CREATE VIEW empresas_estatisticas AS
        SELECT 
            e.*,
            COUNT(c.id) as total_cenarios,
            COUNT(CASE WHEN c.status = 'aprovado' THEN 1 END) as cenarios_aprovados,
            COUNT(CASE WHEN c.status = 'rascunho' THEN 1 END) as cenarios_rascunho,
            MAX(c.created_at) as ultimo_cenario,
            COUNT(DISTINCT comp.id) as total_comparativos
        FROM empresas e
        LEFT JOIN cenarios c ON e.id = c.empresa_id
        LEFT JOIN comparativos comp ON e.id = comp.empresa_id
        GROUP BY e.id, e.nome, e.cnpj, e.razao_social, e.regime_tributario, 
                 e.setor, e.uf, e.municipio, e.inscricao_estadual, e.inscricao_municipal, 
                 e.logo_url, e.created_at, e.updated_at;
    END IF;
END $$;

-- View com cenários expandidos
DO $$
BEGIN
    DROP VIEW IF EXISTS cenarios_detalhados CASCADE;
    
    -- Verifica se todas as tabelas necessárias existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cenarios')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'despesas_dinamicas')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_icms')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_pis_cofins')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_irpj_csll')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_dre')
    THEN
        CREATE VIEW cenarios_detalhados AS
        SELECT 
            c.*,
            e.nome as empresa_nome,
            e.regime_tributario as empresa_regime,
            COUNT(dd.id) as total_despesas_dinamicas,
            CASE 
                WHEN ci.id IS NOT NULL THEN true 
                ELSE false 
            END as tem_calculo_icms,
            CASE 
                WHEN cpc.id IS NOT NULL THEN true 
                ELSE false 
            END as tem_calculo_pis_cofins,
            CASE 
                WHEN cic.id IS NOT NULL THEN true 
                ELSE false 
            END as tem_calculo_irpj_csll,
            CASE 
                WHEN dre.id IS NOT NULL THEN true 
                ELSE false 
            END as tem_dre
        FROM cenarios c
        JOIN empresas e ON e.id = c.empresa_id
        LEFT JOIN despesas_dinamicas dd ON dd.cenario_id = c.id
        LEFT JOIN calculos_icms ci ON ci.cenario_id = c.id
        LEFT JOIN calculos_pis_cofins cpc ON cpc.cenario_id = c.id
        LEFT JOIN calculos_irpj_csll cic ON cic.cenario_id = c.id
        LEFT JOIN calculos_dre dre ON dre.cenario_id = c.id
        GROUP BY c.id, c.empresa_id, c.nome, c.descricao, c.tipo_periodo, c.data_inicio, 
                 c.data_fim, c.ano, c.mes, c.trimestre, c.status, c.criado_por, c.tags, 
                 c.configuracao, c.created_at, c.updated_at, e.nome, e.regime_tributario, 
                 ci.id, cpc.id, cic.id, dre.id;
    END IF;
END $$;

-- View para comparativos com informações dos cenários
DO $$
BEGIN
    DROP VIEW IF EXISTS comparativos_expandidos CASCADE;
    
    -- Verifica se as tabelas necessárias existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comparativos')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cenarios')
    THEN
        CREATE VIEW comparativos_expandidos AS
        SELECT 
            comp.*,
            e.nome as empresa_nome,
            array_length(comp.cenario_ids, 1) as total_cenarios,
            (
                SELECT json_agg(
                    json_build_object(
                        'id', cenario.id,
                        'nome', cenario.nome,
                        'ano', cenario.ano,
                        'status', cenario.status
                    )
                )
                FROM unnest(comp.cenario_ids) as cenario_id
                JOIN cenarios cenario ON cenario.id = cenario_id::uuid
            ) as cenarios_info
        FROM comparativos comp
        JOIN empresas e ON e.id = comp.empresa_id
        GROUP BY comp.id, comp.empresa_id, comp.nome, comp.descricao, 
                 comp.cenario_ids, comp.created_at, comp.updated_at, e.nome;
    END IF;
END $$;

-- ===============================================
-- CONFIGURAÇÕES INICIAIS
-- ===============================================

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave, valor, descricao, categoria) VALUES
('app_version', '"1.0.0"', 'Versão atual da aplicação', 'sistema'),
('max_cenarios_por_empresa', '100', 'Limite máximo de cenários por empresa', 'limite'),
('backup_retention_days', '90', 'Dias para retenção de backups', 'backup'),
('export_formats', '["pdf", "excel", "json"]', 'Formatos de exportação disponíveis', 'exportacao')
ON CONFLICT (chave) DO NOTHING;

-- ===============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ===============================================

-- Inserir algumas empresas de exemplo
INSERT INTO empresas (nome, cnpj, razao_social, regime_tributario, setor, uf, municipio) VALUES
('Tech Solutions Ltda', '12.345.678/0001-90', 'Tech Solutions Ltda', 'simples', 'servicos', 'SP', 'São Paulo'),
('Consultoria Fiscal S/A', '98.765.432/0001-10', 'Consultoria Fiscal Sociedade Anônima', 'lucro-presumido', 'servicos', 'RJ', 'Rio de Janeiro'),
('Indústria Brasil S/A', '11.222.333/0001-44', 'Indústria Brasil Sociedade Anônima', 'lucro-real', 'industria', 'MG', 'Belo Horizonte')
ON CONFLICT (cnpj) DO NOTHING;

-- ===============================================
-- POLÍTICAS DE SEGURANÇA (RLS) - PREPARADO PARA FUTURO
-- ===============================================

-- Habilita RLS (comentado por enquanto - para quando implementar autenticação)
-- ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cenarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comparativos ENABLE ROW LEVEL SECURITY;

-- Exemplo de políticas (para futuro)
-- CREATE POLICY "Usuários podem ver suas próprias empresas" ON empresas
--     FOR ALL USING (auth.uid() = user_id);

-- ===============================================
-- FINALIZAÇÃO
-- ===============================================

-- Análise das tabelas criadas (protegida)
DO $$
BEGIN
    -- Analisa apenas tabelas que existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
        ANALYZE empresas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cenarios') THEN
        ANALYZE cenarios;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comparativos') THEN
        ANALYZE comparativos;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'despesas_dinamicas') THEN
        ANALYZE despesas_dinamicas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_icms') THEN
        ANALYZE calculos_icms;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_pis_cofins') THEN
        ANALYZE calculos_pis_cofins;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_irpj_csll') THEN
        ANALYZE calculos_irpj_csll;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_dre') THEN
        ANALYZE calculos_dre;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'relatorios_consolidados') THEN
        ANALYZE relatorios_consolidados;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes_sistema') THEN
        ANALYZE configuracoes_sistema;
    END IF;
END $$;

-- Log de criação
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEMA TAX PLANNER CRIADO COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabelas principais: empresas, cenarios, comparativos';
    RAISE NOTICE 'Tabelas auxiliares: despesas_dinamicas';
    RAISE NOTICE 'Tabelas de cálculos: calculos_icms, calculos_pis_cofins, calculos_irpj_csll, calculos_dre';
    RAISE NOTICE 'Tabelas de cache: relatorios_consolidados';
    RAISE NOTICE 'Configurações: configuracoes_sistema';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total de tabelas: 10';
    RAISE NOTICE 'Índices, triggers, funções e views configurados';
    RAISE NOTICE 'PRONTO PARA MIGRAÇÃO DOS DADOS!';
    RAISE NOTICE '========================================';
END
$$;