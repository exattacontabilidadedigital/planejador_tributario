-- ===============================================
-- PASSO 1A: ADICIONAR COLUNAS NA TABELA EMPRESAS
-- ===============================================

-- Verificar e adicionar campos faltantes
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS uf TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Verificar resultado
SELECT 'COLUNAS ADICIONADAS EMPRESAS' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' AND table_schema = 'public'
ORDER BY ordinal_position;