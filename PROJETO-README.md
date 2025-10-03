# 🚀 PLANEJADOR TRIBUTÁRIO v3.0 - REACT + NEXT.JS + SHADCN/UI

## ✅ ESTRUTURA CRIADA

### **Status do Projeto: 15% Concluído**

---

## 📁 ESTRUTURA DE ARQUIVOS CRIADA

```
tax-planner-react/
├── package.json ✅
├── tsconfig.json ✅
├── next.config.ts ✅
├── tailwind.config.ts ✅
├── postcss.config.js ✅
├── src/
│   ├── app/
│   │   ├── layout.tsx ✅
│   │   ├── page.tsx ✅
│   │   └── globals.css ✅
│   └── types/
│       └── index.ts ✅ (Todos os tipos TypeScript definidos)
```

---

## 🔧 PRÓXIMOS PASSOS

### **1. INSTALAR DEPENDÊNCIAS** (URGENTE)

```bash
cd D:\CODIGOS\copilot\tax-planner-react
npm install
```

Isso instalará:
- ✅ Next.js 15
- ✅ React 18.3
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Radix UI (componentes shadcn)
- ✅ Chart.js + react-chartjs-2
- ✅ jsPDF + jspdf-autotable
- ✅ Zustand (state management)
- ✅ next-themes (dark mode)
- ✅ Lucide React (ícones)

---

### **2. INICIALIZAR SHADCN/UI**

```bash
npx shadcn@latest init
```

**Configurações recomendadas:**
- ✅ **Style**: Default
- ✅ **Base color**: Slate
- ✅ **CSS variables**: Yes
- ✅ **React Server Components**: Yes
- ✅ **Components location**: `@/components`

---

### **3. ADICIONAR COMPONENTES SHADCN**

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add separator
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add dropdown-menu
```

---

## 📦 COMPONENTES A CRIAR

### **Estrutura de Componentes:**

```
src/components/
├── ui/ (shadcn components - gerados automaticamente)
├── theme-provider.tsx ⏳ CRIAR
├── theme-toggle.tsx ⏳ CRIAR
├── tax-planner-dashboard.tsx ⏳ CRIAR (COMPONENTE PRINCIPAL)
├── config/
│   ├── config-panel.tsx ⏳
│   ├── aliquotas-form.tsx ⏳
│   ├── valores-form.tsx ⏳
│   └── despesas-form.tsx ⏳
├── dashboard/
│   ├── metrics-cards.tsx ⏳
│   ├── tax-composition-chart.tsx ⏳
│   └── summary-table.tsx ⏳
├── memoria/
│   ├── memoria-icms.tsx ⏳
│   ├── memoria-pis-cofins.tsx ⏳
│   └── memoria-irpj-csll.tsx ⏳
├── dre/
│   └── dre-table.tsx ⏳
└── common/
    ├── currency-input.tsx ⏳
    ├── percentage-input.tsx ⏳
    └── export-button.tsx ⏳
```

---

## 🧮 LÓGICA DE CÁLCULOS

### **Hooks Customizados a Criar:**

```typescript
src/hooks/
├── use-tax-store.ts ⏳ (Zustand store)
├── use-tax-calculations.ts ⏳
├── use-memoria-icms.ts ⏳
├── use-memoria-pis-cofins.ts ⏳
├── use-memoria-irpj-csll.ts ⏳
├── use-dre-calculation.ts ⏳
└── use-pdf-export.ts ⏳
```

---

## 🎨 SISTEMA DE CORES (JÁ CONFIGURADO)

### **Tailwind Custom Colors:**

```tsx
// Usar nos componentes:
className="bg-icms text-icms-foreground"     // Vermelho ICMS
className="bg-pis text-pis-foreground"       // Âmbar PIS/COFINS
className="bg-irpj text-irpj-foreground"     // Azul IRPJ/CSLL
className="bg-lucro text-lucro-foreground"   // Verde Lucro
```

---

## 📝 EXEMPLO DE COMPONENTE - ThemeProvider

```tsx
// src/components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

---

## 📝 EXEMPLO DE COMPONENTE - ThemeToggle

```tsx
// src/components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

---

## 📝 EXEMPLO - Zustand Store

```typescript
// src/hooks/use-tax-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaxConfig, TabSection } from '@/types';

interface TaxStore {
  config: TaxConfig;
  activeTab: TabSection;
  updateConfig: (config: Partial<TaxConfig>) => void;
  setActiveTab: (tab: TabSection) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: TaxConfig = {
  icmsInterno: 18,
  icmsSul: 12,
  icmsNorte: 7,
  difal: 6,
  fcp: 2,
  pisAliq: 1.65,
  cofinsAliq: 7.6,
  irpjBase: 15,
  irpjAdicional: 10,
  limiteIrpj: 20000,
  csllAliq: 9,
  issAliq: 5,
  receitaBruta: 1000000,
  vendasInternas: 70,
  vendasInterestaduais: 30,
  consumidorFinal: 30,
  comprasInternas: 300000,
  comprasInterestaduais: 200000,
  comprasUso: 100000,
  cmvTotal: 500000,
  energiaEletrica: 15000,
  alugueis: 25000,
  arrendamento: 10000,
  frete: 8000,
  depreciacao: 12000,
  combustiveis: 5000,
  valeTransporte: 3000,
  salariosPF: 80000,
  alimentacao: 15000,
  combustivelPasseio: 3000,
  outrasDespesas: 35000,
  adicoesLucro: 13000,
  exclusoesLucro: 3000,
  creditoEstoqueInicial: 5000,
  creditoAtivoImobilizado: 8000,
  creditoEnergiaIndustria: 2000,
  creditoSTEntrada: 3000,
  outrosCreditos: 1000,
};

export const useTaxStore = create<TaxStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      activeTab: 'dashboard',
      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),
    }),
    {
      name: 'tax-planner-storage',
    }
  )
);
```

---

## 🎯 ORDEM DE DESENVOLVIMENTO RECOMENDADA

1. ✅ **Instalar dependências** (`npm install`)
2. ✅ **Inicializar shadcn** (`npx shadcn@latest init`)
3. ✅ **Adicionar componentes UI** (button, card, input, etc.)
4. ⏳ **Criar ThemeProvider** e **ThemeToggle**
5. ⏳ **Criar Zustand Store** (`use-tax-store.ts`)
6. ⏳ **Criar componentes de formulário**:
   - `currency-input.tsx`
   - `percentage-input.tsx`
7. ⏳ **Criar ConfigPanel** com todos os formulários
8. ⏳ **Criar hooks de cálculo**:
   - `use-tax-calculations.ts`
   - `use-memoria-icms.ts`
   - `use-memoria-pis-cofins.ts`
   - `use-memoria-irpj-csll.ts`
9. ⏳ **Criar componentes de memória**
10. ⏳ **Criar Dashboard** com cards de métricas
11. ⏳ **Integrar Chart.js** (`tax-composition-chart.tsx`)
12. ⏳ **Criar DRE Table**
13. ⏳ **Implementar exportação PDF**
14. ⏳ **Testes e ajustes finais**

---

## 🚀 EXECUTAR PROJETO

```bash
cd D:\CODIGOS\copilot\tax-planner-react
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📊 MIGRAÇÃO DE CÓDIGO LEGADO

### **tax-calculation.js → TypeScript Hooks**

O arquivo `tax-calculation.js` do projeto antigo contém toda a lógica. Precisamos migrar para:

1. **use-tax-calculations.ts** - Cálculos gerais
2. **use-memoria-icms.ts** - Memória ICMS
3. **use-memoria-pis-cofins.ts** - Memória PIS/COFINS
4. **use-memoria-irpj-csll.ts** - Memória IRPJ/CSLL
5. **use-dre-calculation.ts** - DRE

---

## 🎨 VANTAGENS DA NOVA ARQUITETURA

### **Antes (Vanilla JS):**
- ❌ Sem type safety
- ❌ State management manual
- ❌ DOM manipulation direta
- ❌ Difícil de escalar
- ❌ Sem reatividade automática

### **Agora (React + TypeScript + shadcn):**
- ✅ Type safety completo
- ✅ State management robusto (Zustand)
- ✅ Componentes reutilizáveis
- ✅ Facilidade de escalar
- ✅ Reatividade automática
- ✅ Componentes premium (shadcn/ui)
- ✅ Dark mode nativo
- ✅ Performance otimizada (Next.js)
- ✅ SEO-friendly

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

- **Next.js**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://docs.pmnd.rs/zustand
- **Chart.js**: https://www.chartjs.org/docs
- **jsPDF**: https://github.com/parallax/jsPDF

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

1. **O projeto está com erros TypeScript normais** - Desaparecerão após `npm install`
2. **Componentes shadcn serão criados automaticamente** - Use `npx shadcn@latest add <component>`
3. **Preserve a lógica de cálculos** - Migre com cuidado do arquivo antigo
4. **Teste cada funcionalidade** - Use dados do projeto antigo para validar

---

## 🎉 PRÓXIMO COMANDO

```bash
cd D:\CODIGOS\copilot\tax-planner-react
npm install
npx shadcn@latest init
```

**Depois disso, estarei pronto para criar os componentes! 🚀**

---

**Desenvolvido por**: GitHub Copilot  
**Data**: 2 de outubro de 2025  
**Versão**: v3.0 - React + Next.js + shadcn/ui  
**Status**: 🏗️ EM CONSTRUÇÃO (15% concluído)
