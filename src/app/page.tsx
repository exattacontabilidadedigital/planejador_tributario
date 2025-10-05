"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmpresas } from "@/hooks/use-empresas";
import { ThemeToggle } from "@/components/theme-toggle";
import { MigracaoInicial } from "@/components/migracao-inicial";

export default function Home() {
  const router = useRouter();
  const { empresas, empresaAtualData, empresaAtualId, isLoading, error } = useEmpresas();
  const [mostrarMigracao, setMostrarMigracao] = useState(false);

  useEffect(() => {
    // Se está carregando, aguarda
    if (isLoading) {
      return;
    }

    // Se tem empresa atual, vai para o dashboard dela
    if (empresaAtualId) {
      router.push(`/empresas/${empresaAtualId}`);
    } 
    // Se tem empresas mas nenhuma selecionada, vai para lista
    else if (empresas.length > 0) {
      router.push("/empresas");
    }
    // Se não tem empresas, mostra tela de migração
    else {
      setMostrarMigracao(true);
    }
  }, [empresas.length, empresaAtualId, router, isLoading]);

  // Se há erro, mostra na tela de migração
  if (error || mostrarMigracao) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Sistema de Planejamento Tributário
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao sistema v2.0 com suporte multi-empresa
            </p>
            {error && (
              <p className="text-destructive mt-2">
                Erro ao carregar dados: {error}
              </p>
            )}
          </div>
          <MigracaoInicial />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </main>
  );
}
