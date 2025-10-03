"use client"

import { use, useState, useEffect } from "react"
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
import { ArrowLeft, Save, Trash2, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { RegimeTributario, SetorEmpresa } from "@/types/empresa"

const UF_LISTA = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function ConfiguracoesEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getEmpresa, updateEmpresa, deleteEmpresa } = useEmpresasStore()
  
  const empresa = getEmpresa(id)

  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    razaoSocial: "",
    regimeTributario: "lucro-real" as RegimeTributario,
    setor: "comercio" as SetorEmpresa,
    uf: "SP",
    municipio: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
  })

  // Inicializar form data quando empresa carregar
  useEffect(() => {
    if (empresa) {
      setFormData({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        razaoSocial: empresa.razaoSocial,
        regimeTributario: empresa.regimeTributario,
        setor: empresa.setor,
        uf: empresa.uf,
        municipio: empresa.municipio || "",
        inscricaoEstadual: empresa.inscricaoEstadual || "",
        inscricaoMunicipal: empresa.inscricaoMunicipal || "",
      })
    }
  }, [empresa])

  // Se empresa não existe, mostrar mensagem
  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">Empresa não encontrada</p>
            <Button onClick={() => router.push("/empresas")}>Voltar para Empresas</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validações básicas
    if (!formData.nome || !formData.cnpj || !formData.razaoSocial) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    updateEmpresa(id, formData)

    toast({
      title: "Empresa atualizada!",
      description: `${formData.nome} foi atualizada com sucesso.`,
    })

    router.push(`/empresas/${id}`)
  }

  const handleDelete = () => {
    deleteEmpresa(id)

    toast({
      title: "Empresa excluída",
      description: `${empresa.nome} foi removida do sistema.`,
    })

    router.push("/empresas")
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/empresas/${id}`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Dashboard
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Configurações da Empresa
            </h1>
            <p className="text-muted-foreground mt-1">
              Edite as informações cadastrais da empresa
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Nome Fantasia */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Fantasia *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome da empresa"
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
            </div>

            {/* Razão Social */}
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input
                id="razaoSocial"
                value={formData.razaoSocial}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                placeholder="Razão social completa"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Regime Tributário e Setor */}
        <Card>
          <CardHeader>
            <CardTitle>Regime Tributário</CardTitle>
            <CardDescription>
              Configurações fiscais da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Regime Tributário */}
              <div className="space-y-2">
                <Label htmlFor="regime">Regime Tributário *</Label>
                <Select
                  value={formData.regimeTributario}
                  onValueChange={(value: RegimeTributario) =>
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
                <Label htmlFor="setor">Setor de Atividade *</Label>
                <Select
                  value={formData.setor}
                  onValueChange={(value: SetorEmpresa) =>
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
            </div>
          </CardContent>
        </Card>

        {/* Endereço e Inscrições */}
        <Card>
          <CardHeader>
            <CardTitle>Localização e Inscrições</CardTitle>
            <CardDescription>
              Informações de localização e registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* UF */}
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
                    {UF_LISTA.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Município */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="municipio">Município *</Label>
                <Input
                  id="municipio"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  placeholder="Nome do município"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Inscrição Estadual */}
              <div className="space-y-2">
                <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                <Input
                  id="inscricaoEstadual"
                  value={formData.inscricaoEstadual}
                  onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                  placeholder="000.000.000.000 (opcional)"
                />
              </div>

              {/* Inscrição Municipal */}
              <div className="space-y-2">
                <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                <Input
                  id="inscricaoMunicipal"
                  value={formData.inscricaoMunicipal}
                  onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                  placeholder="000000 (opcional)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir Empresa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os cenários e dados
                  relacionados a esta empresa serão permanentemente excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/empresas/${id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
