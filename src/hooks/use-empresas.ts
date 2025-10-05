import { useEffect } from 'react'
import { useEmpresasStore } from '@/stores/empresas-store'
import type { EmpresaFormData } from '@/types/empresa'

/**
 * Hook customizado para gerenciar empresas com Supabase
 * Carrega automaticamente as empresas na primeira montagem
 */
export function useEmpresas() {
  const {
    empresas,
    empresaAtual,
    isLoading,
    error,
    fetchEmpresas,
    addEmpresa,
    updateEmpresa,
    deleteEmpresa,
    setEmpresaAtual,
    getEmpresa,
    clearError,
  } = useEmpresasStore()

  // Carregar empresas automaticamente na primeira montagem
  useEffect(() => {
    if (empresas.length === 0 && !isLoading && !error) {
      fetchEmpresas()
    }
  }, [empresas.length, isLoading, error, fetchEmpresas])

  // Handlers com tratamento de erro
  const handleAddEmpresa = async (data: EmpresaFormData) => {
    try {
      return await addEmpresa(data)
    } catch (error) {
      // Erro já está no state, apenas re-throw para o componente tratar se necessário
      throw error
    }
  }

  const handleUpdateEmpresa = async (id: string, data: Partial<EmpresaFormData>) => {
    try {
      await updateEmpresa(id, data)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteEmpresa = async (id: string) => {
    try {
      await deleteEmpresa(id)
    } catch (error) {
      throw error
    }
  }

  const handleRefresh = () => {
    fetchEmpresas()
  }

  return {
    // Estado
    empresas,
    empresaAtual,
    empresaAtualId: empresaAtual,
    empresaAtualData: empresaAtual ? getEmpresa(empresaAtual) : undefined,
    isLoading,
    error,
    hasEmpresas: empresas.length > 0,
    
    // Actions
    addEmpresa: handleAddEmpresa,
    updateEmpresa: handleUpdateEmpresa,
    deleteEmpresa: handleDeleteEmpresa,
    setEmpresaAtual,
    getEmpresa,
    refresh: handleRefresh,
    clearError,
  }
}

/**
 * Hook para usar apenas a empresa atual
 * Útil quando não precisamos da lista completa
 */
export function useEmpresaAtual() {
  const { empresaAtual, getEmpresa, setEmpresaAtual } = useEmpresasStore()
  
  return {
    empresaAtual: empresaAtual ? getEmpresa(empresaAtual) : undefined,
    empresaAtualId: empresaAtual,
    setEmpresaAtual,
  }
}