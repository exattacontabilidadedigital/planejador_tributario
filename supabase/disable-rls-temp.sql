-- Script temporário para desabilitar RLS durante desenvolvimento
-- Execute no SQL Editor do Supabase

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE cenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparativos DISABLE ROW LEVEL SECURITY;
ALTER TABLE calculos_icms DISABLE ROW LEVEL SECURITY;
ALTER TABLE calculos_pis_cofins DISABLE ROW LEVEL SECURITY;
ALTER TABLE calculos_irpj_csll DISABLE ROW LEVEL SECURITY;
ALTER TABLE calculos_dre DISABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_dinamicas DISABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_consolidados DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_sistema DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('empresas', 'cenarios', 'comparativos');