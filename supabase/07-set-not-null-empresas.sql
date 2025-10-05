-- ===============================================
-- PASSO 1G: DEFINIR CAMPOS OBRIGATÓRIOS EMPRESAS
-- ===============================================

-- Definir campos obrigatórios (só após garantir que não há NULLs)
ALTER TABLE empresas ALTER COLUMN razao_social SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN uf SET NOT NULL;
ALTER TABLE empresas ALTER COLUMN municipio SET NOT NULL;

-- Verificar estrutura final
SELECT 'ESTRUTURA FINAL EMPRESAS' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' AND table_schema = 'public'
ORDER BY ordinal_position;