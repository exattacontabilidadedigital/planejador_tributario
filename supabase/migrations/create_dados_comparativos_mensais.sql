-- Criação da tabela para dados comparativos mensais de regimes tributários
-- ============================================================================

-- Tabela para armazenar dados mensais de impostos por regime tributário
CREATE TABLE dados_comparativos_mensais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Informações temporais
  mes TEXT NOT NULL CHECK (mes IN ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12')),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2030),
  
  -- Regime tributário
  regime TEXT NOT NULL CHECK (regime IN ('lucro_real', 'lucro_presumido', 'simples_nacional')),
  
  -- Dados financeiros
  receita DECIMAL(15,2) NOT NULL DEFAULT 0,
  icms DECIMAL(15,2) NOT NULL DEFAULT 0,
  pis DECIMAL(15,2) NOT NULL DEFAULT 0,
  cofins DECIMAL(15,2) NOT NULL DEFAULT 0,
  irpj DECIMAL(15,2) NOT NULL DEFAULT 0,
  csll DECIMAL(15,2) NOT NULL DEFAULT 0,
  iss DECIMAL(15,2) NOT NULL DEFAULT 0,
  outros DECIMAL(15,2) DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas (empresa + mes + ano + regime)
  UNIQUE(empresa_id, mes, ano, regime)
);

-- Índices para performance
CREATE INDEX idx_dados_comparativos_empresa_id ON dados_comparativos_mensais(empresa_id);
CREATE INDEX idx_dados_comparativos_mes_ano ON dados_comparativos_mensais(mes, ano);
CREATE INDEX idx_dados_comparativos_regime ON dados_comparativos_mensais(regime);
CREATE INDEX idx_dados_comparativos_empresa_ano ON dados_comparativos_mensais(empresa_id, ano);

-- Trigger para atualizar a data de modificação
CREATE OR REPLACE FUNCTION update_dados_comparativos_mensais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dados_comparativos_mensais_updated_at
  BEFORE UPDATE ON dados_comparativos_mensais
  FOR EACH ROW
  EXECUTE FUNCTION update_dados_comparativos_mensais_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE dados_comparativos_mensais ENABLE ROW LEVEL SECURITY;

-- Política de segurança (permite tudo por enquanto, pode ser refinada depois)
CREATE POLICY "Permitir tudo para dados_comparativos_mensais" 
ON dados_comparativos_mensais 
FOR ALL 
USING (true);

-- Comentários para documentação
COMMENT ON TABLE dados_comparativos_mensais IS 'Armazena dados mensais de impostos por regime tributário para comparações';
COMMENT ON COLUMN dados_comparativos_mensais.regime IS 'Regime tributário: lucro_real, lucro_presumido, simples_nacional';
COMMENT ON COLUMN dados_comparativos_mensais.mes IS 'Mês no formato MM (01-12)';
COMMENT ON COLUMN dados_comparativos_mensais.ano IS 'Ano de referência dos dados';
COMMENT ON COLUMN dados_comparativos_mensais.receita IS 'Receita bruta do mês';
COMMENT ON COLUMN dados_comparativos_mensais.outros IS 'Outros impostos não categorizados';