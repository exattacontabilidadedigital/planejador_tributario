-- ===============================================
-- DADOS INICIAIS - TAX PLANNER REACT
-- Configurações e dados de exemplo
-- ===============================================

-- Configurações padrão do sistema (protegido)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_sistema' AND column_name = 'chave')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_sistema' AND column_name = 'valor') THEN
        
        INSERT INTO configuracoes_sistema (chave, valor, descricao, categoria) VALUES
        ('app_version', '"1.0.0"', 'Versão atual da aplicação', 'sistema'),
        ('max_cenarios_por_empresa', '100', 'Limite máximo de cenários por empresa', 'limite'),
        ('backup_retention_days', '90', 'Dias para retenção de backups', 'backup'),
        ('export_formats', '["pdf", "excel", "json"]', 'Formatos de exportação disponíveis', 'exportacao')
        ON CONFLICT (chave) DO NOTHING;
        
        RAISE NOTICE 'Configurações do sistema inseridas';
    ELSE
        RAISE NOTICE 'Tabela configuracoes_sistema não está pronta - dados não inseridos';
    END IF;
END $$;

-- ===============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ===============================================

-- Inserir algumas empresas de exemplo (protegido)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'nome')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'cnpj')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'razao_social')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'regime_tributario')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'setor')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'uf')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'municipio') THEN
        
        INSERT INTO empresas (nome, cnpj, razao_social, regime_tributario, setor, uf, municipio) VALUES
        ('Tech Solutions Ltda', '12.345.678/0001-90', 'Tech Solutions Ltda', 'simples', 'servicos', 'SP', 'São Paulo'),
        ('Consultoria Fiscal S/A', '98.765.432/0001-10', 'Consultoria Fiscal Sociedade Anônima', 'lucro-presumido', 'servicos', 'RJ', 'Rio de Janeiro'),
        ('Indústria Brasil S/A', '11.222.333/0001-44', 'Indústria Brasil Sociedade Anônima', 'lucro-real', 'industria', 'MG', 'Belo Horizonte')
        ON CONFLICT (cnpj) DO NOTHING;
        
        RAISE NOTICE 'Empresas de exemplo inseridas';
    ELSE
        RAISE NOTICE 'Tabela empresas não está pronta - dados de exemplo não inseridos';
    END IF;
END $$;

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