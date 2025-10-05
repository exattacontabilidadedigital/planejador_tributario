-- ===============================================
-- PASSO 1F: CORRIGIR VALORES DE REGIME_TRIBUTARIO
-- (Execute APÓS remover constraints temporariamente)
-- ===============================================

-- Mostrar valores atuais de regime_tributario
SELECT 'VALORES REGIME_TRIBUTARIO ANTES CORREÇÃO' as info;
SELECT regime_tributario, COUNT(*) as quantidade
FROM empresas 
GROUP BY regime_tributario
ORDER BY quantidade DESC;

-- Mostrar linha específica que está causando problema
SELECT 'LINHA PROBLEMÁTICA' as info;
SELECT id, nome, regime_tributario, setor
FROM empresas 
WHERE id = 'c79c5101-06fb-48d8-b6ed-99dad984918b';

-- Corrigir valores de regime_tributario inválidos
UPDATE empresas SET regime_tributario = CASE 
    WHEN regime_tributario = 'pequena' THEN 'simples'
    WHEN regime_tributario = 'Lucro Real' THEN 'lucro-real'
    WHEN regime_tributario = 'Lucro Presumido' THEN 'lucro-presumido'
    WHEN regime_tributario = 'Simples' THEN 'simples'
    WHEN regime_tributario = 'SIMPLES' THEN 'simples'
    WHEN regime_tributario NOT IN ('lucro-real', 'lucro-presumido', 'simples') OR regime_tributario IS NULL THEN 'lucro-presumido'
    ELSE regime_tributario
END;

-- Verificar após correção
SELECT 'VALORES REGIME_TRIBUTARIO APÓS CORREÇÃO' as info;
SELECT regime_tributario, COUNT(*) as quantidade
FROM empresas 
GROUP BY regime_tributario
ORDER BY quantidade DESC;

-- Verificar linha específica após correção
SELECT 'LINHA PROBLEMÁTICA APÓS CORREÇÃO' as info;
SELECT id, nome, regime_tributario, setor
FROM empresas 
WHERE id = 'c79c5101-06fb-48d8-b6ed-99dad984918b';