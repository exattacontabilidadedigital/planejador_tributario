/**
 * Serviço para gerenciar compartilhamento público de relatórios
 */

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface CompartilhamentoInfo {
  token: string
  expiraEm: string
  urlPublica: string
}

export interface ComparativoPublico {
  id: string
  nome: string
  descricao: string | null
  tipo: string
  configuracao: any
  resultados: any
  createdAt: string
  empresaNome: string | null
}

/**
 * Ativa compartilhamento público de um relatório
 */
export async function ativarCompartilhamentoPublico(
  comparativoId: string,
  diasValidade: number = 30
): Promise<CompartilhamentoInfo> {
  console.log('📤 [COMPARTILHAR] Ativando compartilhamento:', { comparativoId, diasValidade })

  try {
    // Verificar se a função RPC existe, se não, usar método alternativo
    const { data: rpcData, error: rpcError } = await supabase.rpc('ativar_compartilhamento_publico', {
      p_comparativo_id: comparativoId,
      p_dias_validade: diasValidade
    })

    if (!rpcError && rpcData && rpcData.length > 0) {
      // Função RPC funcionou
      const resultado = rpcData[0]
      
      const compartilhamento: CompartilhamentoInfo = {
        token: resultado.token,
        expiraEm: resultado.expira_em,
        urlPublica: `${window.location.origin}${resultado.url_publica}`
      }

      console.log('✅ [COMPARTILHAR] Compartilhamento ativado (via RPC):', compartilhamento)
      return compartilhamento
    }

    // Se RPC falhou, usar método alternativo (UPDATE direto)
    console.log('⚠️ [COMPARTILHAR] RPC não disponível, usando método alternativo')
    
    // Gerar token único
    const token = generateUniqueToken()
    
    // Calcular data de expiração
    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + diasValidade)
    
    // Atualizar comparativo
    const { data: updateData, error: updateError } = await supabase
      .from('comparativos_analise')
      .update({
        compartilhado: true,
        token_compartilhamento: token,
        token_expira_em: expiraEm.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', comparativoId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [COMPARTILHAR] Erro ao atualizar comparativo:', updateError)
      throw new Error(`Erro ao ativar compartilhamento: ${updateError.message}`)
    }

    const compartilhamento: CompartilhamentoInfo = {
      token,
      expiraEm: expiraEm.toISOString(),
      urlPublica: `${window.location.origin}/comparativos/compartilhado/${token}`
    }

    console.log('✅ [COMPARTILHAR] Compartilhamento ativado (via UPDATE):', compartilhamento)
    return compartilhamento

  } catch (error: any) {
    console.error('❌ [COMPARTILHAR] Erro ao ativar compartilhamento:', error)
    throw new Error(`Erro ao ativar compartilhamento: ${error.message || 'Erro desconhecido'}`)
  }
}

/**
 * Gera token único para compartilhamento
 */
function generateUniqueToken(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return token
}

/**
 * Desativa compartilhamento público de um relatório
 */
export async function desativarCompartilhamentoPublico(
  comparativoId: string
): Promise<boolean> {
  console.log('🔒 [COMPARTILHAR] Desativando compartilhamento:', { comparativoId })

  try {
    // Tentar usar RPC primeiro
    const { data: rpcData, error: rpcError } = await supabase.rpc('desativar_compartilhamento_publico', {
      p_comparativo_id: comparativoId
    })

    if (!rpcError) {
      console.log('✅ [COMPARTILHAR] Compartilhamento desativado (via RPC)')
      return rpcData === true
    }

    // Se RPC falhou, usar UPDATE direto
    console.log('⚠️ [COMPARTILHAR] RPC não disponível, usando método alternativo')
    
    const { error: updateError } = await supabase
      .from('comparativos_analise')
      .update({
        compartilhado: false,
        token_compartilhamento: null,
        token_expira_em: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', comparativoId)

    if (updateError) {
      console.error('❌ [COMPARTILHAR] Erro ao desativar compartilhamento:', updateError)
      throw new Error(`Erro ao desativar compartilhamento: ${updateError.message}`)
    }

    console.log('✅ [COMPARTILHAR] Compartilhamento desativado (via UPDATE)')
    return true
    
  } catch (error: any) {
    console.error('❌ [COMPARTILHAR] Erro ao desativar compartilhamento:', error)
    throw new Error(`Erro ao desativar compartilhamento: ${error.message || 'Erro desconhecido'}`)
  }
}

/**
 * Busca relatório compartilhado por token (acesso público, sem autenticação)
 */
export async function buscarComparativoPublico(
  token: string
): Promise<ComparativoPublico | null> {
  console.log('🔍 [COMPARTILHAR] Buscando comparativo público:', { token })

  try {
    // Tentar usar RPC primeiro
    const { data: rpcData, error: rpcError } = await supabase.rpc('buscar_comparativo_publico', {
      p_token: token
    })

    if (!rpcError && rpcData && rpcData.length > 0) {
      const resultado = rpcData[0]
      
      const comparativo: ComparativoPublico = {
        id: resultado.id,
        nome: resultado.nome,
        descricao: resultado.descricao,
        tipo: resultado.tipo,
        configuracao: resultado.configuracao,
        resultados: resultado.resultados,
        createdAt: resultado.created_at,
        empresaNome: resultado.empresa_nome
      }

      console.log('✅ [COMPARTILHAR] Comparativo público encontrado (via RPC):', {
        id: comparativo.id,
        nome: comparativo.nome
      })
      
      return comparativo
    }

    // Se RPC falhou, usar SELECT direto
    console.log('⚠️ [COMPARTILHAR] RPC não disponível ou retornou erro:', rpcError?.message || 'sem erro mas sem dados')
    console.log('⚠️ [COMPARTILHAR] Usando método alternativo (SELECT direto)')
    
    // Buscar dados do comparativo e empresa separadamente
    const { data: selectData, error: selectError } = await supabase
      .from('comparativos_analise')
      .select(`
        id,
        nome,
        descricao,
        tipo,
        configuracao,
        resultados,
        created_at,
        visualizacoes_publicas,
        empresa_id
      `)
      .eq('token_compartilhamento', token)
      .eq('compartilhado', true)
      .or(`token_expira_em.is.null,token_expira_em.gt.${new Date().toISOString()}`)
      .single()

    if (selectError) {
      console.error('❌ [COMPARTILHAR] Erro no SELECT direto:', selectError)
      console.log('⚠️ [COMPARTILHAR] Comparativo não encontrado ou expirado')
      return null
    }

    if (!selectData) {
      console.log('⚠️ [COMPARTILHAR] Nenhum dado retornado')
      return null
    }

    // Buscar nome da empresa separadamente (se houver empresa_id)
    let empresaNome: string | null = null
    if (selectData.empresa_id) {
      const { data: empresaData } = await supabase
        .from('empresas')
        .select('nome_fantasia, razao_social, nome')
        .eq('id', selectData.empresa_id)
        .single()
      
      if (empresaData) {
        empresaNome = empresaData.nome_fantasia || empresaData.razao_social || empresaData.nome || null
      }
    }

    // Incrementar contador de visualizações
    await supabase
      .from('comparativos_analise')
      .update({
        visualizacoes_publicas: (selectData as any).visualizacoes_publicas ? (selectData as any).visualizacoes_publicas + 1 : 1
      })
      .eq('id', selectData.id)

    const comparativo: ComparativoPublico = {
      id: selectData.id,
      nome: selectData.nome,
      descricao: selectData.descricao,
      tipo: selectData.tipo,
      configuracao: selectData.configuracao,
      resultados: selectData.resultados,
      createdAt: selectData.created_at,
      empresaNome
    }

    console.log('✅ [COMPARTILHAR] Comparativo público encontrado (via SELECT):', {
      id: comparativo.id,
      nome: comparativo.nome,
      empresaNome
    })
    
    return comparativo
    
  } catch (error: any) {
    console.error('❌ [COMPARTILHAR] Erro ao buscar comparativo público:', error)
    return null
  }
}

/**
 * Verifica se um comparativo está compartilhado
 */
export async function verificarCompartilhamento(
  comparativoId: string
): Promise<{ compartilhado: boolean; token?: string; expiraEm?: string } | null> {
  console.log('🔍 [COMPARTILHAR] Verificando status de compartilhamento:', { comparativoId })

  const { data, error } = await supabase
    .from('comparativos_analise')
    .select('compartilhado, token_compartilhamento, token_expira_em')
    .eq('id', comparativoId)
    .single()

  if (error) {
    console.error('❌ [COMPARTILHAR] Erro ao verificar compartilhamento:', error)
    return null
  }

  if (!data) {
    return null
  }

  return {
    compartilhado: data.compartilhado || false,
    token: data.token_compartilhamento || undefined,
    expiraEm: data.token_expira_em || undefined
  }
}

/**
 * Copia link público para área de transferência
 */
export async function copiarLinkPublico(urlPublica: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(urlPublica)
    console.log('📋 [COMPARTILHAR] Link copiado para área de transferência')
    return true
  } catch (error) {
    console.error('❌ [COMPARTILHAR] Erro ao copiar link:', error)
    return false
  }
}
