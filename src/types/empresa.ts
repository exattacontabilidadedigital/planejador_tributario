/**
 * Tipos relacionados a Empresa
 */

export type RegimeTributario = 'lucro-real' | 'lucro-presumido' | 'simples'
export type SetorEmpresa = 'comercio' | 'industria' | 'servicos'

export interface Empresa {
  id: string
  nome: string
  cnpj: string
  razaoSocial: string
  regimeTributario: RegimeTributario
  setor: SetorEmpresa
  uf: string
  municipio: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  
  // Metadados
  criadoEm: string // ISO date string
  atualizadoEm: string // ISO date string
  
  // Logo/Imagem (opcional)
  logoUrl?: string
}

export interface EmpresaFormData {
  nome: string
  cnpj: string
  razaoSocial: string
  regimeTributario: RegimeTributario
  setor: SetorEmpresa
  uf: string
  municipio: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
}
