-- ===============================================
-- TABELAS - TAX PLANNER REACT
-- Criação das 10 tabelas principais do sistema
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