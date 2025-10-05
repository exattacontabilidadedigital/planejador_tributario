-- ===============================================
-- FUNÇÕES AUXILIARES - TAX PLANNER REACT
-- Funções de validação e operações do sistema
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

-- Função para buscar cenários por empresa com filtros (protegida)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cenarios') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'status') THEN
        
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
        ) AS $func$
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
        $func$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Função get_cenarios_filtered criada';
    ELSE
        RAISE NOTICE 'Tabela cenarios não existe - função get_cenarios_filtered não criada';
    END IF;
END $$;

-- Função para calcular totais de relatório por empresa/ano (protegida)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_dre') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cenarios') THEN
        
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
        ) AS $func$
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
        $func$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Função calcular_totais_relatorio criada';
    ELSE
        RAISE NOTICE 'Tabelas necessárias não existem - função calcular_totais_relatorio não criada';
    END IF;
END $$;

-- Função para duplicar cenário com todos os cálculos (protegida)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cenarios') THEN
        
        CREATE OR REPLACE FUNCTION duplicar_cenario_completo(
            cenario_original_id UUID,
            novo_nome TEXT,
            nova_descricao TEXT DEFAULT NULL
        )
        RETURNS UUID AS $func$
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
            
            -- Duplicar despesas dinâmicas (se tabela existir)
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'despesas_dinamicas') THEN
                INSERT INTO despesas_dinamicas (cenario_id, descricao, valor, tipo, credito, categoria)
                SELECT novo_cenario_id, descricao, valor, tipo, credito, categoria
                FROM despesas_dinamicas WHERE cenario_id = cenario_original_id;
            END IF;
            
            -- Duplicar cálculos ICMS (se tabela existir)
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_icms') THEN
                INSERT INTO calculos_icms (cenario_id, vendas_internas_base, vendas_internas_aliquota, vendas_internas_valor)
                SELECT novo_cenario_id, vendas_internas_base, vendas_internas_aliquota, vendas_internas_valor
                FROM calculos_icms WHERE cenario_id = cenario_original_id;
            END IF;
            
            -- Duplicar cálculos PIS/COFINS (se tabela existir)
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_pis_cofins') THEN
                INSERT INTO calculos_pis_cofins (cenario_id, debito_pis_base, debito_pis_aliquota, debito_pis_valor)
                SELECT novo_cenario_id, debito_pis_base, debito_pis_aliquota, debito_pis_valor
                FROM calculos_pis_cofins WHERE cenario_id = cenario_original_id;
            END IF;
            
            -- Duplicar cálculos IRPJ/CSLL (se tabela existir)
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_irpj_csll') THEN
                INSERT INTO calculos_irpj_csll (cenario_id, receita_bruta, cmv, despesas_operacionais)
                SELECT novo_cenario_id, receita_bruta, cmv, despesas_operacionais
                FROM calculos_irpj_csll WHERE cenario_id = cenario_original_id;
            END IF;
            
            -- Duplicar DRE (se tabela existir)
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculos_dre') THEN
                INSERT INTO calculos_dre (cenario_id, receita_bruta_vendas, receita_liquida, lucro_liquido)
                SELECT novo_cenario_id, receita_bruta_vendas, receita_liquida, lucro_liquido
                FROM calculos_dre WHERE cenario_id = cenario_original_id;
            END IF;
            
            RETURN novo_cenario_id;
        END;
        $func$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Função duplicar_cenario_completo criada';
    ELSE
        RAISE NOTICE 'Tabela cenarios não existe - função duplicar_cenario_completo não criada';
    END IF;
END $$;

-- ===============================================
-- VALIDAÇÕES E CONSTRAINTS
-- ===============================================

-- Validação de CNPJ (verificar se tabela e coluna existem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'cnpj')
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'empresas' AND constraint_name = 'valid_cnpj'
    ) THEN
        ALTER TABLE empresas ADD CONSTRAINT valid_cnpj 
            CHECK (is_valid_cnpj(cnpj));
        RAISE NOTICE 'Constraint valid_cnpj criada';
    ELSE
        RAISE NOTICE 'Constraint valid_cnpj já existe ou tabela não encontrada';
    END IF;
END $$;

-- Validação de ano do cenário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'ano')
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cenarios' AND constraint_name = 'valid_ano'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT valid_ano 
            CHECK (ano >= 2020 AND ano <= 2030);
        RAISE NOTICE 'Constraint valid_ano criada';
    ELSE
        RAISE NOTICE 'Constraint valid_ano já existe ou tabela não encontrada';
    END IF;
END $$;

-- Validação de período
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'data_inicio')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'data_fim')
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cenarios' AND constraint_name = 'valid_periodo'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT valid_periodo 
            CHECK (data_inicio <= data_fim);
        RAISE NOTICE 'Constraint valid_periodo criada';
    ELSE
        RAISE NOTICE 'Constraint valid_periodo já existe ou colunas não encontradas';
    END IF;
END $$;

-- Validação de mes/trimestre baseado no tipo
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'tipo_periodo')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'mes')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cenarios' AND column_name = 'trimestre')
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cenarios' AND constraint_name = 'valid_mes_tipo'
    ) THEN
        ALTER TABLE cenarios ADD CONSTRAINT valid_mes_tipo 
            CHECK (
                (tipo_periodo = 'mensal' AND mes IS NOT NULL) OR
                (tipo_periodo = 'trimestral' AND trimestre IS NOT NULL) OR
                (tipo_periodo IN ('semestral', 'anual'))
            );
        RAISE NOTICE 'Constraint valid_mes_tipo criada';
    ELSE
        RAISE NOTICE 'Constraint valid_mes_tipo já existe ou colunas não encontradas';
    END IF;
END $$;

-- Validação de valores monetários não negativos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'despesas_dinamicas' AND column_name = 'valor')
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'despesas_dinamicas' AND constraint_name = 'valid_valor_positivo'
    ) THEN
        ALTER TABLE despesas_dinamicas ADD CONSTRAINT valid_valor_positivo 
            CHECK (valor >= 0);
        RAISE NOTICE 'Constraint valid_valor_positivo criada';
    ELSE
        RAISE NOTICE 'Constraint valid_valor_positivo já existe ou tabela não encontrada';
    END IF;
END $$;