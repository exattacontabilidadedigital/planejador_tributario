"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEmpresasStore } from "@/stores/empresas-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Building2, Save } from "lucide-react"
import type { EmpresaFormData } from "@/types/empresa"
import { useToast } from "@/hooks/use-toast"

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { addEmpresa } = useEmpresasStore()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<EmpresaFormData>({
    nome: "",
    cnpj: "",
    razaoSocial: "",
    regimeTributario: "lucro-real",
    setor: "comercio",
    uf: "SP",
    municipio: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (!formData.nome || !formData.cnpj || !formData.razaoSocial) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }
    
    const novaEmpresa = addEmpresa(formData)
    
    toast({
      title: "Empresa criada!",
      description: `${novaEmpresa.nome} foi cadastrada com sucesso.`,
    })
    
    router.push(`/empresas/${novaEmpresa.id}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Nova Empresa
          </CardTitle>
          <CardDescription>
            Cadastre uma nova empresa para iniciar o planejamento tributário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome Fantasia */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Fantasia *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Empresa ABC"
                required
              />
            </div>

            {/* Razão Social */}
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input
                id="razaoSocial"
                value={formData.razaoSocial}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                placeholder="Ex: Empresa ABC Ltda"
                required
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            {/* Regime Tributário */}
            <div className="space-y-2">
              <Label htmlFor="regime">Regime Tributário *</Label>
              <Select
                value={formData.regimeTributario}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, regimeTributario: value })
                }
              >
                <SelectTrigger id="regime">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lucro-real">Lucro Real</SelectItem>
                  <SelectItem value="lucro-presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="simples">Simples Nacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Setor */}
            <div className="space-y-2">
              <Label htmlFor="setor">Setor de Atuação *</Label>
              <Select
                value={formData.setor}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, setor: value })
                }
              >
                <SelectTrigger id="setor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comercio">Comércio</SelectItem>
                  <SelectItem value="industria">Indústria</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* UF e Município */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="uf">UF *</Label>
                <Select
                  value={formData.uf}
                  onValueChange={(value) =>
                    setFormData({ ...formData, uf: value })
                  }
                >
                  <SelectTrigger id="uf">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipio">Município *</Label>
                <Input
                  id="municipio"
                  value={formData.municipio}
                  onChange={(e) =>
                    setFormData({ ...formData, municipio: e.target.value })
                  }
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>
            </div>

            {/* Inscrições (opcionais) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ie">Inscrição Estadual</Label>
                <Input
                  id="ie"
                  value={formData.inscricaoEstadual || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, inscricaoEstadual: e.target.value })
                  }
                  placeholder="000.000.000.000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="im">Inscrição Municipal</Label>
                <Input
                  id="im"
                  value={formData.inscricaoMunicipal || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, inscricaoMunicipal: e.target.value })
                  }
                  placeholder="00000000-0"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Criar Empresa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
