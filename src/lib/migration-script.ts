/**
 * Script de migração de dados do localStorage para Supabase
 * Este script deve ser executado apenas uma vez para migrar dados existentes
 */

import { createClient } from '@/lib/supabase/client'
import type { Empresa } from '@/types/empresa'
import type { Cenario } from '@/types/cenario'
import type { ComparativoSalvo } from '@/types/comparativo'

// Cliente Supabase
const supabase = createClient()

interface MigrationResult {
  success: boolean
  empresasMigradas: number
  cenariosMigrados: number
  comparativosMigrados: number
  errors: string[]
}

/**
 * Função principal de migração
 */
export async function migrarDadosLocalStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    empresasMigradas: 0,
    cenariosMigrados: 0,
    comparativosMigrados: 0,
    errors: []
  }

  try {
    console.log('🚀 Iniciando migração de dados do localStorage para Supabase...')

    // 1. Migrar empresas
    const empresasResult = await migrarEmpresas()
    result.empresasMigradas = empresasResult.migradas
    result.errors.push(...empresasResult.errors)

    // 2. Migrar cenários
    const cenariosResult = await migrarCenarios()
    result.cenariosMigrados = cenariosResult.migradas
    result.errors.push(...cenariosResult.errors)

    // 3. Migrar comparativos
    const comparativosResult = await migrarComparativos()
    result.comparativosMigrados = comparativosResult.migradas
    result.errors.push(...comparativosResult.errors)

    result.success = result.errors.length === 0

    console.log('✅ Migração concluída:', result)
    return result

  } catch (error) {
    console.error('❌ Erro na migração:', error)
    result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido')
    return result
  }
}

/**
 * Migrar empresas do localStorage
 */
async function migrarEmpresas(): Promise<{ migradas: number; errors: string[] }> {
  const result: { migradas: number; errors: string[] } = { migradas: 0, errors: [] }

  try {
    // Buscar dados do localStorage
    const empresasStorage = localStorage.getItem('empresas-storage')
    if (!empresasStorage) {
      console.log('ℹ️ Nenhum dado de empresas encontrado no localStorage')
      return result
    }

    const { state } = JSON.parse(empresasStorage)
    const empresas: Empresa[] = state?.empresas || []

    if (empresas.length === 0) {
      console.log('ℹ️ Nenhuma empresa para migrar')
      return result
    }

    console.log(`📊 Migrando ${empresas.length} empresas...`)

    // Verificar se já existem empresas no Supabase
    const { data: existingEmpresas } = await supabase
      .from('empresas')
      .select('nome, cnpj')

    const empresasExistentes = new Set(
      (existingEmpresas || []).map(e => `${e.nome}-${e.cnpj}`)
    )

    for (const empresa of empresas) {
      try {
        const chaveEmpresa = `${empresa.nome}-${empresa.cnpj}`
        
        if (empresasExistentes.has(chaveEmpresa)) {
          console.log(`⏭️ Empresa ${empresa.nome} já existe, pulando...`)
          continue
        }

        const { error } = await supabase
          .from('empresas')
          .insert({
            nome: empresa.nome,
            cnpj: empresa.cnpj || null,
            razao_social: empresa.razaoSocial,
            regime_tributario: empresa.regimeTributario,
            setor: empresa.setor,
            uf: empresa.uf,
            municipio: empresa.municipio,
            inscricao_estadual: empresa.inscricaoEstadual || null,
            inscricao_municipal: empresa.inscricaoMunicipal || null,
          })

        if (error) {
          result.errors.push(`Erro ao migrar empresa ${empresa.nome}: ${error.message}`)
        } else {
          result.migradas++
          console.log(`✅ Empresa migrada: ${empresa.nome}`)
        }
      } catch (error) {
        result.errors.push(`Erro inesperado ao migrar empresa ${empresa.nome}: ${error}`)
      }
    }

  } catch (error) {
    result.errors.push(`Erro ao processar empresas: ${error}`)
  }

  return result
}

/**
 * Migrar cenários do localStorage
 */
async function migrarCenarios(): Promise<{ migradas: number; errors: string[] }> {
  const result: { migradas: number; errors: string[] } = { migradas: 0, errors: [] }

  try {
    // Buscar dados do localStorage
    const cenariosStorage = localStorage.getItem('cenarios-storage')
    if (!cenariosStorage) {
      console.log('ℹ️ Nenhum dado de cenários encontrado no localStorage')
      return result
    }

    const { state } = JSON.parse(cenariosStorage)
    const cenarios: Cenario[] = state?.cenarios || []

    if (cenarios.length === 0) {
      console.log('ℹ️ Nenhum cenário para migrar')
      return result
    }

    console.log(`📊 Migrando ${cenarios.length} cenários...`)

    // Buscar mapeamento de empresas (localStorage ID -> Supabase ID)
    const { data: empresas } = await supabase
      .from('empresas')
      .select('id, nome, cnpj')

    const mapeamentoEmpresas = new Map<string, string>()
    
    // Como os IDs do localStorage são diferentes, vamos mapear por nome+cnpj
    for (const cenario of cenarios) {
      const empresaEncontrada = empresas?.find(e => 
        // Tentativa de match por dados únicos
        e.nome === cenario.empresaId || // Se por acaso salvou o nome
        cenario.empresaId.includes(e.nome) // Se o ID contém o nome
      )
      
      if (empresaEncontrada) {
        mapeamentoEmpresas.set(cenario.empresaId, empresaEncontrada.id)
      }
    }

    for (const cenario of cenarios) {
      try {
        const empresaId = mapeamentoEmpresas.get(cenario.empresaId)
        
        if (!empresaId) {
          result.errors.push(`Empresa não encontrada para cenário ${cenario.nome}`)
          continue
        }

        const { error } = await supabase
          .from('cenarios')
          .insert({
            empresa_id: empresaId,
            nome: cenario.nome,
            descricao: cenario.descricao,
            periodo: cenario.periodo,
            config: cenario.configuracao,
            status: cenario.status,
            tags: cenario.tags || [],
          })

        if (error) {
          result.errors.push(`Erro ao migrar cenário ${cenario.nome}: ${error.message}`)
        } else {
          result.migradas++
          console.log(`✅ Cenário migrado: ${cenario.nome}`)
        }
      } catch (error) {
        result.errors.push(`Erro inesperado ao migrar cenário ${cenario.nome}: ${error}`)
      }
    }

  } catch (error) {
    result.errors.push(`Erro ao processar cenários: ${error}`)
  }

  return result
}

/**
 * Migrar comparativos do localStorage
 */
async function migrarComparativos(): Promise<{ migradas: number; errors: string[] }> {
  const result: { migradas: number; errors: string[] } = { migradas: 0, errors: [] }

  try {
    // Buscar dados do localStorage
    const comparativosStorage = localStorage.getItem('comparativos-storage')
    if (!comparativosStorage) {
      console.log('ℹ️ Nenhum dado de comparativos encontrado no localStorage')
      return result
    }

    const { state } = JSON.parse(comparativosStorage)
    const comparativos: ComparativoSalvo[] = state?.comparativos || []

    if (comparativos.length === 0) {
      console.log('ℹ️ Nenhum comparativo para migrar')
      return result
    }

    console.log(`📊 Migrando ${comparativos.length} comparativos...`)

    // Buscar mapeamento de empresas e cenários
    const { data: empresas } = await supabase
      .from('empresas')
      .select('id, nome, cnpj')

    const { data: cenarios } = await supabase
      .from('cenarios')
      .select('id, nome, empresa_id')

    for (const comparativo of comparativos) {
      try {
        // Encontrar empresa correspondente
        const empresaEncontrada = empresas?.find(e => 
          e.nome === comparativo.empresaId || 
          comparativo.empresaId.includes(e.nome)
        )
        
        if (!empresaEncontrada) {
          result.errors.push(`Empresa não encontrada para comparativo ${comparativo.nome}`)
          continue
        }

        // Mapear IDs de cenários
        const cenariosIds = comparativo.cenariosIds
          .map(oldId => {
            // Tentar encontrar cenário correspondente
            const cenarioEncontrado = cenarios?.find(c => 
              c.nome.includes(oldId) || oldId.includes(c.nome)
            )
            return cenarioEncontrado?.id
          })
          .filter(Boolean) as string[]

        if (cenariosIds.length === 0) {
          result.errors.push(`Nenhum cenário válido encontrado para comparativo ${comparativo.nome}`)
          continue
        }

        const { error } = await supabase
          .from('comparativos')
          .insert({
            empresa_id: empresaEncontrada.id,
            nome: comparativo.nome,
            descricao: comparativo.descricao,
            cenarios_ids: cenariosIds,
          })

        if (error) {
          result.errors.push(`Erro ao migrar comparativo ${comparativo.nome}: ${error.message}`)
        } else {
          result.migradas++
          console.log(`✅ Comparativo migrado: ${comparativo.nome}`)
        }
      } catch (error) {
        result.errors.push(`Erro inesperado ao migrar comparativo ${comparativo.nome}: ${error}`)
      }
    }

  } catch (error) {
    result.errors.push(`Erro ao processar comparativos: ${error}`)
  }

  return result
}

/**
 * Função para limpar dados do localStorage após migração bem-sucedida
 */
export function limparLocalStorageAposMigracao() {
  const confirmacao = confirm(
    'Tem certeza de que deseja limpar os dados do localStorage? ' +
    'Esta ação é irreversível e deve ser feita apenas após confirmar que a migração foi bem-sucedida.'
  )

  if (confirmacao) {
    localStorage.removeItem('empresas-storage')
    localStorage.removeItem('cenarios-storage')
    localStorage.removeItem('comparativos-storage')
    console.log('🧹 Dados do localStorage removidos')
  }
}

/**
 * Função de verificação para comparar dados antes da migração
 */
export function verificarDadosParaMigracao() {
  const empresas = localStorage.getItem('empresas-storage')
  const cenarios = localStorage.getItem('cenarios-storage')
  const comparativos = localStorage.getItem('comparativos-storage')

  console.log('📋 Dados disponíveis para migração:')
  
  if (empresas) {
    const { state } = JSON.parse(empresas)
    console.log(`- Empresas: ${state?.empresas?.length || 0}`)
  }

  if (cenarios) {
    const { state } = JSON.parse(cenarios)
    console.log(`- Cenários: ${state?.cenarios?.length || 0}`)
  }

  if (comparativos) {
    const { state } = JSON.parse(comparativos)
    console.log(`- Comparativos: ${state?.comparativos?.length || 0}`)
  }
}