import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Empresa, EmpresaFormData } from '@/types/empresa'

interface EmpresasState {
  empresas: Empresa[]
  empresaAtual: string | null // ID da empresa selecionada
  
  // Actions
  addEmpresa: (data: EmpresaFormData) => Empresa
  updateEmpresa: (id: string, data: Partial<EmpresaFormData>) => void
  deleteEmpresa: (id: string) => void
  setEmpresaAtual: (id: string | null) => void
  getEmpresa: (id: string) => Empresa | undefined
}

export const useEmpresasStore = create<EmpresasState>()(
  persist(
    (set, get) => ({
      empresas: [],
      empresaAtual: null,
      
      addEmpresa: (data) => {
        const novaEmpresa: Empresa = {
          ...data,
          id: `empresa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        }
        
        set((state) => ({
          empresas: [...state.empresas, novaEmpresa],
          // Se for a primeira empresa, define como atual
          empresaAtual: state.empresas.length === 0 ? novaEmpresa.id : state.empresaAtual,
        }))
        
        return novaEmpresa
      },
      
      updateEmpresa: (id, data) => {
        set((state) => ({
          empresas: state.empresas.map((empresa) =>
            empresa.id === id
              ? {
                  ...empresa,
                  ...data,
                  atualizadoEm: new Date().toISOString(),
                }
              : empresa
          ),
        }))
      },
      
      deleteEmpresa: (id) => {
        set((state) => ({
          empresas: state.empresas.filter((empresa) => empresa.id !== id),
          empresaAtual: state.empresaAtual === id ? null : state.empresaAtual,
        }))
      },
      
      setEmpresaAtual: (id) => {
        set({ empresaAtual: id })
      },
      
      getEmpresa: (id) => {
        return get().empresas.find((empresa) => empresa.id === id)
      },
    }),
    {
      name: 'empresas-storage',
    }
  )
)
