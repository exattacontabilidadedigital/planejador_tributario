-- ===============================================
-- PASSO 1E: CORRIGIR VALORES DE SETOR
-- ===============================================

-- Mostrar valores atuais de setor
SELECT 'VALORES SETOR ANTES CORREÇÃO' as info;
SELECT setor, COUNT(*) as quantidade
FROM empresas 
GROUP BY setor
ORDER BY quantidade DESC;

-- Corrigir valores de setor inválidos
UPDATE empresas SET setor = CASE 
    WHEN setor = 'consultoria' THEN 'servicos'
    WHEN setor = 'Consultoria' THEN 'servicos'
    WHEN setor = 'Serviços' THEN 'servicos'
    WHEN setor = 'Comércio' THEN 'comercio'
    WHEN setor = 'Indústria' THEN 'industria'
    WHEN setor NOT IN ('comercio', 'industria', 'servicos') OR setor IS NULL THEN 'comercio'
    ELSE setor
END;

-- Verificar após correção
SELECT 'VALORES SETOR APÓS CORREÇÃO' as info;
SELECT setor, COUNT(*) as quantidade
FROM empresas 
GROUP BY setor
ORDER BY quantidade DESC;