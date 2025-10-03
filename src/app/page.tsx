"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmpresasStore } from "@/stores/empresas-store";

export default function Home() {
  const router = useRouter();
  const { empresas, empresaAtual } = useEmpresasStore();

  useEffect(() => {
    // Se tem empresa atual, vai para o dashboard dela
    if (empresaAtual) {
      router.push(`/empresas/${empresaAtual}`);
    } 
    // Se tem empresas mas nenhuma selecionada, vai para lista
    else if (empresas.length > 0) {
      router.push("/empresas");
    }
    // Se não tem empresas, vai para lista (que mostrará tela vazia)
    else {
      router.push("/empresas");
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </main>
  );
}
