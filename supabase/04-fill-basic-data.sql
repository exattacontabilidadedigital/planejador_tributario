-- ===============================================
-- PASSO 1D: CORRIGIR DADOS DA TABELA EMPRESAS
-- ===============================================

-- Preencher dados básicos para registros existentes
UPDATE empresas SET 
    razao_social = nome,
    uf = 'SP',
    municipio = 'São Paulo'
WHERE razao_social IS NULL OR uf IS NULL OR municipio IS NULL;

-- Verificar dados após preenchimento básico
SELECT 'DADOS APÓS PREENCHIMENTO BÁSICO' as info;
SELECT id, nome, razao_social, uf, municipio
FROM empresas 
LIMIT 5;