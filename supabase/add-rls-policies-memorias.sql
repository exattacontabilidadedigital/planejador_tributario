-- ===============================================
-- POLÍTICAS RLS PARA TABELAS DE MEMÓRIAS DE CÁLCULO
-- ===============================================
-- Este arquivo adiciona as políticas de Row Level Security
-- necessárias para permitir acesso às tabelas de memórias.

-- ===============================================
-- TABELA: calculos_icms
-- ===============================================

-- Habilitar RLS
ALTER TABLE calculos_icms ENABLE ROW LEVEL SECURITY;

-- Política de SELECT (todos autenticados)
CREATE POLICY "Usuários autenticados podem visualizar calculos_icms"
  ON calculos_icms
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de INSERT (todos autenticados)
CREATE POLICY "Usuários autenticados podem inserir calculos_icms"
  ON calculos_icms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de UPDATE (todos autenticados)
CREATE POLICY "Usuários autenticados podem atualizar calculos_icms"
  ON calculos_icms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de DELETE (todos autenticados)
CREATE POLICY "Usuários autenticados podem deletar calculos_icms"
  ON calculos_icms
  FOR DELETE
  TO authenticated
  USING (true);

-- ===============================================
-- TABELA: calculos_pis_cofins
-- ===============================================

-- Habilitar RLS
ALTER TABLE calculos_pis_cofins ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "Usuários autenticados podem visualizar calculos_pis_cofins"
  ON calculos_pis_cofins
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de INSERT
CREATE POLICY "Usuários autenticados podem inserir calculos_pis_cofins"
  ON calculos_pis_cofins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de UPDATE
CREATE POLICY "Usuários autenticados podem atualizar calculos_pis_cofins"
  ON calculos_pis_cofins
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de DELETE
CREATE POLICY "Usuários autenticados podem deletar calculos_pis_cofins"
  ON calculos_pis_cofins
  FOR DELETE
  TO authenticated
  USING (true);

-- ===============================================
-- TABELA: calculos_irpj_csll
-- ===============================================

-- Habilitar RLS
ALTER TABLE calculos_irpj_csll ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "Usuários autenticados podem visualizar calculos_irpj_csll"
  ON calculos_irpj_csll
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de INSERT
CREATE POLICY "Usuários autenticados podem inserir calculos_irpj_csll"
  ON calculos_irpj_csll
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de UPDATE
CREATE POLICY "Usuários autenticados podem atualizar calculos_irpj_csll"
  ON calculos_irpj_csll
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de DELETE
CREATE POLICY "Usuários autenticados podem deletar calculos_irpj_csll"
  ON calculos_irpj_csll
  FOR DELETE
  TO authenticated
  USING (true);

-- ===============================================
-- VERIFICAÇÃO
-- ===============================================

-- Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('calculos_icms', 'calculos_pis_cofins', 'calculos_irpj_csll')
ORDER BY tablename, policyname;
