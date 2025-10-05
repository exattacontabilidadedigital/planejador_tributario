-- ===============================================
-- ÍNDICES PARA PERFORMANCE - TAX PLANNER REACT
-- Criação de todos os índices otimizados (protegida)
-- ===============================================

DO $$
BEGIN
    -- Índices para EMPRESAS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'cnpj') THEN
        CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'regime_tributario') THEN
        CREATE INDEX IF NOT EXISTS idx_empresas_regime ON empresas(regime_tributario);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'setor') THEN
        CREATE INDEX IF NOT EXISTS idx_empresas_setor ON empresas(setor);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_empresas_created_at ON empresas(created_at DESC);
    END IF;

    -- Índices para CENÁRIOS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'empresa_id') THEN
        CREATE INDEX IF NOT EXISTS idx_cenarios_empresa_id ON cenarios(empresa_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'ano') THEN
        CREATE INDEX IF NOT EXISTS idx_cenarios_ano ON cenarios(ano);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_cenarios_status ON cenarios(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'tipo_periodo') THEN
        CREATE INDEX IF NOT EXISTS idx_cenarios_tipo_periodo ON cenarios(tipo_periodo);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_cenarios_created_at ON cenarios(created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'configuracao') THEN
        CREATE INDEX IF NOT EXISTS idx_cenarios_configuracao ON cenarios USING GIN(configuracao);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'tags') THEN
        CREATE INDEX IF NOT EXISTS idx_cenarios_tags ON cenarios USING GIN(tags);
    END IF;

    -- Índices para COMPARATIVOS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comparativos' AND column_name = 'empresa_id') THEN
        CREATE INDEX IF NOT EXISTS idx_comparativos_empresa_id ON comparativos(empresa_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comparativos' AND column_name = 'cenario_ids') THEN
        CREATE INDEX IF NOT EXISTS idx_comparativos_cenario_ids ON comparativos USING GIN(cenario_ids);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comparativos' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_comparativos_created_at ON comparativos(created_at DESC);
    END IF;

    -- Índices para DESPESAS DINÂMICAS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'despesas_dinamicas' AND column_name = 'cenario_id') THEN
        CREATE INDEX IF NOT EXISTS idx_despesas_dinamicas_cenario_id ON despesas_dinamicas(cenario_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'despesas_dinamicas' AND column_name = 'tipo') THEN
        CREATE INDEX IF NOT EXISTS idx_despesas_dinamicas_tipo ON despesas_dinamicas(tipo);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'despesas_dinamicas' AND column_name = 'credito') THEN
        CREATE INDEX IF NOT EXISTS idx_despesas_dinamicas_credito ON despesas_dinamicas(credito);
    END IF;

    -- Índices para CÁLCULOS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_icms' AND column_name = 'cenario_id') THEN
        CREATE INDEX IF NOT EXISTS idx_calculos_icms_cenario_id ON calculos_icms(cenario_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_pis_cofins' AND column_name = 'cenario_id') THEN
        CREATE INDEX IF NOT EXISTS idx_calculos_pis_cofins_cenario_id ON calculos_pis_cofins(cenario_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_irpj_csll' AND column_name = 'cenario_id') THEN
        CREATE INDEX IF NOT EXISTS idx_calculos_irpj_csll_cenario_id ON calculos_irpj_csll(cenario_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_dre' AND column_name = 'cenario_id') THEN
        CREATE INDEX IF NOT EXISTS idx_calculos_dre_cenario_id ON calculos_dre(cenario_id);
    END IF;

    -- Índices para RELATÓRIOS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relatorios_consolidados' AND column_name = 'empresa_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relatorios_consolidados' AND column_name = 'ano') THEN
        CREATE INDEX IF NOT EXISTS idx_relatorios_empresa_ano ON relatorios_consolidados(empresa_id, ano);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relatorios_consolidados' AND column_name = 'ano') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relatorios_consolidados' AND column_name = 'mes') THEN
        CREATE INDEX IF NOT EXISTS idx_relatorios_ano_mes ON relatorios_consolidados(ano, mes);
    END IF;

    -- Índices para CONFIGURAÇÕES
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_sistema' AND column_name = 'chave') THEN
        CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes_sistema(chave);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_sistema' AND column_name = 'categoria') THEN
        CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria ON configuracoes_sistema(categoria);
    END IF;

    RAISE NOTICE 'Índices criados com sucesso!';
END $$;