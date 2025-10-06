"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, SlidersHorizontal, X, Star, Calendar, BarChart3, ArrowUpDown } from "lucide-react"
import type { TipoComparativo } from "@/types/comparativo-analise-completo"

export interface FiltrosComparativosState {
  busca: string
  tipo: TipoComparativo | 'todos'
  anoInicio: number | null
  anoFim: number | null
  favoritos: boolean
  ordenarPor: 'nome' | 'data_criacao' | 'data_atualizacao' | 'tipo'
  direcao: 'asc' | 'desc'
}

interface FiltrosComparativosProps {
  filtros: FiltrosComparativosState
  onFiltrosChange: (filtros: FiltrosComparativosState) => void
  totalResultados: number
  mostrarAvancados?: boolean
}

export function FiltrosComparativos({
  filtros,
  onFiltrosChange,
  totalResultados,
  mostrarAvancados = true
}: FiltrosComparativosProps) {
  const [expandido, setExpandido] = useState(false)

  const tiposComparativo: { value: TipoComparativo | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos os tipos' },
    { value: 'simples', label: 'Simples' },
    { value: 'multiplo', label: 'Múltiplo' },
    { value: 'temporal', label: 'Temporal' },
    { value: 'por_imposto', label: 'Por Imposto' },
    { value: 'cenarios', label: 'Entre Cenários' }
  ]

  const opcoesOrdenacao: { value: FiltrosComparativosState['ordenarPor']; label: string }[] = [
    { value: 'nome', label: 'Nome' },
    { value: 'data_criacao', label: 'Data de Criação' },
    { value: 'data_atualizacao', label: 'Última Atualização' },
    { value: 'tipo', label: 'Tipo' }
  ]

  const anosDisponiveis = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  )

  const handleLimparFiltros = () => {
    onFiltrosChange({
      busca: '',
      tipo: 'todos',
      anoInicio: null,
      anoFim: null,
      favoritos: false,
      ordenarPor: 'data_criacao',
      direcao: 'desc'
    })
  }

  const handleToggleDirecao = () => {
    onFiltrosChange({
      ...filtros,
      direcao: filtros.direcao === 'asc' ? 'desc' : 'asc'
    })
  }

  const filtrosAtivos = [
    filtros.busca !== '',
    filtros.tipo !== 'todos',
    filtros.anoInicio !== null,
    filtros.anoFim !== null,
    filtros.favoritos
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Filtros</CardTitle>
            {filtrosAtivos > 0 && (
              <Badge variant="secondary">
                {filtrosAtivos} {filtrosAtivos === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandido(!expandido)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {expandido ? 'Ocultar' : 'Expandir'}
            </Button>
            
            {filtrosAtivos > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLimparFiltros}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca - sempre visível */}
        <div className="space-y-2">
          <Label htmlFor="busca">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="busca"
              placeholder="Buscar por nome ou descrição..."
              value={filtros.busca}
              onChange={(e) => onFiltrosChange({ ...filtros, busca: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Ordenação - sempre visível */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ordenar">Ordenar por</Label>
            <Select
              value={filtros.ordenarPor}
              onValueChange={(value) => onFiltrosChange({ 
                ...filtros, 
                ordenarPor: value as FiltrosComparativosState['ordenarPor'] 
              })}
            >
              <SelectTrigger id="ordenar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opcoesOrdenacao.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Direção</Label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleToggleDirecao}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {filtros.direcao === 'asc' ? 'Crescente (A-Z, ↑)' : 'Decrescente (Z-A, ↓)'}
            </Button>
          </div>
        </div>

        {/* Filtros avançados - expansível */}
        {expandido && mostrarAvancados && (
          <>
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Tipo de Comparativo
                  </Label>
                  <Select
                    value={filtros.tipo}
                    onValueChange={(value) => onFiltrosChange({ 
                      ...filtros, 
                      tipo: value as TipoComparativo | 'todos' 
                    })}
                  >
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposComparativo.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Favoritos */}
                <div className="space-y-2">
                  <Label>
                    <Star className="w-4 h-4 inline mr-2" />
                    Favoritos
                  </Label>
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                    <Checkbox
                      id="favoritos"
                      checked={filtros.favoritos}
                      onCheckedChange={(checked) => 
                        onFiltrosChange({ ...filtros, favoritos: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="favoritos"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mostrar apenas favoritos
                    </label>
                  </div>
                </div>
              </div>

              {/* Período */}
              <div className="space-y-2">
                <Label>
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Período (Ano)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anoInicio" className="text-xs text-muted-foreground">
                      De
                    </Label>
                    <Select
                      value={filtros.anoInicio?.toString() || 'todos'}
                      onValueChange={(value) => onFiltrosChange({ 
                        ...filtros, 
                        anoInicio: value === 'todos' ? null : parseInt(value)
                      })}
                    >
                      <SelectTrigger id="anoInicio">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {anosDisponiveis.map(ano => (
                          <SelectItem key={ano} value={ano.toString()}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anoFim" className="text-xs text-muted-foreground">
                      Até
                    </Label>
                    <Select
                      value={filtros.anoFim?.toString() || 'todos'}
                      onValueChange={(value) => onFiltrosChange({ 
                        ...filtros, 
                        anoFim: value === 'todos' ? null : parseInt(value)
                      })}
                    >
                      <SelectTrigger id="anoFim">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {anosDisponiveis.map(ano => (
                          <SelectItem key={ano} value={ano.toString()}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Resultados */}
        <div className="text-sm text-muted-foreground pt-2 border-t">
          <strong>{totalResultados}</strong> {totalResultados === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>
      </CardContent>
    </Card>
  )
}
