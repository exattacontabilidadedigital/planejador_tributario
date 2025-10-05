-- ===============================================
-- PASSO 1C: VERIFICAR DADOS ANTES DA CORREÇÃO
-- ===============================================

-- Verificar dados atuais
SELECT 'DADOS EMPRESAS ANTES CORREÇÃO' as info;
SELECT id, nome, regime_tributario, setor, razao_social, uf, municipio
FROM empresas 
ORDER BY nome;

-- Verificar valores únicos de setor
SELECT 'VALORES SETOR EXISTENTES' as info;
SELECT setor, COUNT(*) as quantidade
FROM empresas 
GROUP BY setor
ORDER BY quantidade DESC;

-- Verificar valores únicos de regime_tributario
SELECT 'VALORES REGIME_TRIBUTARIO EXISTENTES' as info;
SELECT regime_tributario, COUNT(*) as quantidade
FROM empresas 
GROUP BY regime_tributario
ORDER BY quantidade DESC;