-- ===============================================
-- TRIGGERS PARA UPDATED_AT - TAX PLANNER REACT
-- Configuração de triggers automáticos
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