-- ===============================================
-- VIEWS ÚTEIS - TAX PLANNER REACT
-- Views para consultas otimizadas
-- ===============================================

-- View com estatísticas de empresas
DO $$
BEGIN
    DROP VIEW IF EXISTS empresas_estatisticas CASCADE;
    
    -- Verifica se as tabelas e colunas necessárias existem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'empresa_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'status')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comparativos' AND column_name = 'empresa_id')
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
        RAISE NOTICE 'View empresas_estatisticas criada';
    ELSE
        RAISE NOTICE 'Colunas necessárias não existem - view empresas_estatisticas não criada';
    END IF;
END $$;

-- View com cenários expandidos
DO $$
BEGIN
    DROP VIEW IF EXISTS cenarios_detalhados CASCADE;
    
    -- Verifica se todas as tabelas e colunas necessárias existem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'empresa_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'status')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'despesas_dinamicas' AND column_name = 'cenario_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_icms' AND column_name = 'cenario_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_pis_cofins' AND column_name = 'cenario_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_irpj_csll' AND column_name = 'cenario_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calculos_dre' AND column_name = 'cenario_id')
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
        RAISE NOTICE 'View cenarios_detalhados criada';
    ELSE
        RAISE NOTICE 'Colunas necessárias não existem - view cenarios_detalhados não criada';
    END IF;
END $$;

-- View para comparativos com informações dos cenários
DO $$
BEGIN
    DROP VIEW IF EXISTS comparativos_expandidos CASCADE;
    
    -- Verifica se as tabelas e colunas necessárias existem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comparativos' AND column_name = 'empresa_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comparativos' AND column_name = 'cenario_ids')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'status')
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
        RAISE NOTICE 'View comparativos_expandidos criada';
    ELSE
        RAISE NOTICE 'Colunas necessárias não existem - view comparativos_expandidos não criada';
    END IF;
END $$;