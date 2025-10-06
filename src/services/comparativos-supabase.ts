import { createClient } from '@/lib/supabase/client'
import type { DadosComparativoMensal } from '@/types/comparativo'

export interface DadosComparativoSupabase {
  id: string
  empresa_id: string
  mes: string
  ano: number
  regime: string
  receita: number
  icms: number
  pis: number
  cofins: number
  irpj: number
  csll: number
  iss: number
  outros?: number
  observacoes?: string
  criado_em: string
  atualizado_em: string
}

export class ComparativosSupabaseService {
  private supabase = createClient()

  // Converter dados do tipo local para Supabase
  private toSupabaseFormat(dados: Omit<DadosComparativoMensal, 'id' | 'criadoEm' | 'atualizadoEm'>): Omit<DadosComparativoSupabase, 'id' | 'criado_em' | 'atualizado_em'> {
    // Validações básicas
    if (!dados.empresaId) {
      throw new Error('empresaId é obrigatório')
    }
    if (!dados.mes) {
      throw new Error('mes é obrigatório')
    }
    if (!dados.ano) {
      throw new Error('ano é obrigatório')
    }
    if (!dados.regime) {
      throw new Error('regime é obrigatório')
    }

    // Converter mês de nome para número (se necessário)
    const mesNumero = this.converterMesParaNumero(dados.mes)

    return {
      empresa_id: dados.empresaId,
      mes: mesNumero,
      ano: dados.ano,
      regime: dados.regime,
      receita: dados.receita || 0,
      icms: dados.icms || 0,
      pis: dados.pis || 0,
      cofins: dados.cofins || 0,
      irpj: dados.irpj || 0,
      csll: dados.csll || 0,
      iss: dados.iss || 0,
      outros: dados.outros || 0,
      observacoes: dados.observacoes || undefined
    }
  }

  // Converter nome do mês para número com zero à esquerda
  private converterMesParaNumero(mes: string): string {
    const meses: Record<string, string> = {
      'jan': '01', 'janeiro': '01',
      'fev': '02', 'fevereiro': '02',
      'mar': '03', 'março': '03',
      'abr': '04', 'abril': '04',
      'mai': '05', 'maio': '05',
      'jun': '06', 'junho': '06',
      'jul': '07', 'julho': '07',
      'ago': '08', 'agosto': '08',
      'set': '09', 'setembro': '09',
      'out': '10', 'outubro': '10',
      'nov': '11', 'novembro': '11',
      'dez': '12', 'dezembro': '12'
    }

    // Se já está no formato número, retornar com zero à esquerda
    const numeroMes = parseInt(mes)
    if (!isNaN(numeroMes) && numeroMes >= 1 && numeroMes <= 12) {
      return numeroMes.toString().padStart(2, '0')
    }

    // Se é nome do mês, converter
    const mesLower = mes.toLowerCase()
    if (meses[mesLower]) {
      return meses[mesLower]
    }

    // Se já está no formato correto (01, 02, etc.), retornar como está
    if (/^(0[1-9]|1[0-2])$/.test(mes)) {
      return mes
    }

    throw new Error(`Mês inválido: ${mes}`)
  }

  // Converter dados do Supabase para tipo local
  private fromSupabaseFormat(dados: DadosComparativoSupabase): DadosComparativoMensal {
    return {
      id: dados.id,
      empresaId: dados.empresa_id,
      mes: this.converterNumeroParaMes(dados.mes),
      ano: dados.ano,
      regime: dados.regime as any,
      receita: dados.receita,
      icms: dados.icms,
      pis: dados.pis,
      cofins: dados.cofins,
      irpj: dados.irpj,
      csll: dados.csll,
      iss: dados.iss,
      outros: dados.outros,
      observacoes: dados.observacoes,
      criadoEm: new Date(dados.criado_em),
      atualizadoEm: new Date(dados.atualizado_em)
    }
  }

  // Converter número do mês (01, 02, etc.) para nome
  private converterNumeroParaMes(mes: string): string {
    const meses: Record<string, string> = {
      '01': 'jan',
      '02': 'fev', 
      '03': 'mar',
      '04': 'abr',
      '05': 'mai',
      '06': 'jun',
      '07': 'jul',
      '08': 'ago',
      '09': 'set',
      '10': 'out',
      '11': 'nov',
      '12': 'dez'
    }

    return meses[mes] || mes
  }

  // Buscar todos os dados de uma empresa
  async obterDadosPorEmpresa(empresaId: string): Promise<DadosComparativoMensal[]> {
    try {
      const { data, error } = await this.supabase
        .from('dados_comparativos_mensais')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })

      if (error) {
        console.error('Erro ao buscar dados comparativos:', error)
        throw error
      }

      return data?.map(item => this.fromSupabaseFormat(item)) || []
    } catch (error) {
      console.error('Erro no serviço de dados comparativos:', error)
      return []
    }
  }

  // Adicionar novos dados
  async adicionarDados(dados: Omit<DadosComparativoMensal, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<DadosComparativoMensal | null> {
    try {
      console.log('🔍 [COMPARATIVOS-SERVICE] adicionarDados - Dados recebidos:', dados)
      console.log('🔍 [COMPARATIVOS-SERVICE] empresaId:', dados.empresaId)
      console.log('🔍 [COMPARATIVOS-SERVICE] mes:', dados.mes)
      console.log('🔍 [COMPARATIVOS-SERVICE] ano:', dados.ano)
      console.log('🔍 [COMPARATIVOS-SERVICE] regime:', dados.regime)
      console.log('🔍 [COMPARATIVOS-SERVICE] receita:', dados.receita)
      
      // Validar dados obrigatórios
      if (!dados.empresaId) {
        console.error('❌ [COMPARATIVOS-SERVICE] empresaId está vazio!')
        throw new Error('empresaId é obrigatório')
      }
      if (!dados.mes) {
        console.error('❌ [COMPARATIVOS-SERVICE] mes está vazio!')
        throw new Error('mes é obrigatório')
      }
      if (!dados.ano) {
        console.error('❌ [COMPARATIVOS-SERVICE] ano está vazio!')
        throw new Error('ano é obrigatório')
      }
      if (!dados.regime) {
        console.error('❌ [COMPARATIVOS-SERVICE] regime está vazio!')
        throw new Error('regime é obrigatório')
      }
      
      console.log('✅ [COMPARATIVOS-SERVICE] Dados validados com sucesso')
      
      const dadosSupabase = this.toSupabaseFormat(dados)
      console.log('🔄 [COMPARATIVOS-SERVICE] Dados convertidos para formato Supabase:', dadosSupabase)
      console.log('📤 [COMPARATIVOS-SERVICE] Enviando INSERT para Supabase...')
      
      const { data, error } = await this.supabase
        .from('dados_comparativos_mensais')
        .insert(dadosSupabase)
        .select()
        .single()

      console.log('📝 [COMPARATIVOS-SERVICE] Resposta do Supabase - data:', data)
      console.log('📝 [COMPARATIVOS-SERVICE] Resposta do Supabase - error:', error)

      if (error) {
        console.error('❌ Erro do Supabase ao inserir dados:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      const resultado = data ? this.fromSupabaseFormat(data) : null
      console.log('✅ Dados inseridos com sucesso:', resultado)
      return resultado
    } catch (error) {
      console.error('❌ Erro geral no serviço ao adicionar dados:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorStack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  // Atualizar dados existentes
  async atualizarDados(id: string, dados: Partial<Omit<DadosComparativoMensal, 'id' | 'criadoEm' | 'atualizadoEm'>>): Promise<DadosComparativoMensal | null> {
    try {
      console.log('🔄 [COMPARATIVOS-SERVICE] atualizarDados - ID:', id)
      console.log('🔄 [COMPARATIVOS-SERVICE] atualizarDados - Dados recebidos:', dados)
      
      // Construir objeto de atualização apenas com campos fornecidos
      const dadosSupabase: any = {}
      
      // Só adicionar campos que foram fornecidos
      if (dados.empresaId !== undefined) dadosSupabase.empresa_id = dados.empresaId
      if (dados.mes !== undefined) dadosSupabase.mes = this.converterMesParaNumero(dados.mes)
      if (dados.ano !== undefined) dadosSupabase.ano = dados.ano
      if (dados.regime !== undefined) dadosSupabase.regime = dados.regime
      if (dados.receita !== undefined) dadosSupabase.receita = dados.receita
      if (dados.icms !== undefined) dadosSupabase.icms = dados.icms
      if (dados.pis !== undefined) dadosSupabase.pis = dados.pis
      if (dados.cofins !== undefined) dadosSupabase.cofins = dados.cofins
      if (dados.irpj !== undefined) dadosSupabase.irpj = dados.irpj
      if (dados.csll !== undefined) dadosSupabase.csll = dados.csll
      if (dados.iss !== undefined) dadosSupabase.iss = dados.iss
      if (dados.outros !== undefined) dadosSupabase.outros = dados.outros
      if (dados.observacoes !== undefined) dadosSupabase.observacoes = dados.observacoes
      
      console.log('🔄 [COMPARATIVOS-SERVICE] Dados convertidos para Supabase:', dadosSupabase)
      console.log('📤 [COMPARATIVOS-SERVICE] Enviando UPDATE para Supabase...')
      
      const { data, error } = await this.supabase
        .from('dados_comparativos_mensais')
        .update(dadosSupabase)
        .eq('id', id)
        .select()
        .single()

      console.log('📝 [COMPARATIVOS-SERVICE] Resposta do UPDATE - data:', data)
      console.log('📝 [COMPARATIVOS-SERVICE] Resposta do UPDATE - error:', error)

      if (error) {
        console.error('❌ [COMPARATIVOS-SERVICE] Erro ao atualizar dados comparativos:', error)
        throw error
      }

      const resultado = data ? this.fromSupabaseFormat(data) : null
      console.log('✅ [COMPARATIVOS-SERVICE] Dados atualizados com sucesso:', resultado)
      return resultado
    } catch (error) {
      console.error('❌ [COMPARATIVOS-SERVICE] Erro geral no serviço ao atualizar dados:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorStack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  // Remover dados
  async removerDados(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('dados_comparativos_mensais')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao remover dados comparativos:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Erro no serviço ao remover dados:', error)
      return false
    }
  }

  // Buscar dados por mês/ano específico
  async obterDadosPorMesAno(empresaId: string, mes: string, ano: number): Promise<DadosComparativoMensal[]> {
    try {
      const { data, error } = await this.supabase
        .from('dados_comparativos_mensais')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('mes', mes)
        .eq('ano', ano)

      if (error) {
        console.error('Erro ao buscar dados por mês/ano:', error)
        throw error
      }

      return data?.map(item => this.fromSupabaseFormat(item)) || []
    } catch (error) {
      console.error('Erro no serviço ao buscar por mês/ano:', error)
      return []
    }
  }

  // Verificar se já existe dados para empresa/mês/ano/regime
  async verificarDuplicata(empresaId: string, mes: string, ano: number, regime: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('dados_comparativos_mensais')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('mes', mes)
        .eq('ano', ano)
        .eq('regime', regime)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao verificar duplicata:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Erro no serviço ao verificar duplicata:', error)
      return false
    }
  }
}

// Instância singleton do serviço
export const comparativosService = new ComparativosSupabaseService()