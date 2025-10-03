# 🧮 Planejador Tributário DRE

Sistema completo de planejamento tributário com cálculos automáticos de ICMS, PIS/COFINS, IRPJ/CSLL e integração de despesas operacionais dinâmicas.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)

## ✨ Características

- ✅ **Cálculo Automático de Tributos**: ICMS, PIS/COFINS, IRPJ/CSLL
- ✅ **DRE Dinâmica**: Demonstração do Resultado do Exercício com despesas configuráveis
- ✅ **Substituição Tributária**: Suporte completo para ICMS-ST
- ✅ **Regimes Especiais**: Monofásico PIS/COFINS
- ✅ **Despesas Dinâmicas**: Gerenciamento de despesas COM e SEM crédito
- ✅ **Importação CSV**: Importação em massa de despesas via arquivo CSV
- ✅ **Cenários**: Criação e gerenciamento de múltiplos cenários de planejamento
- ✅ **Exportação PDF**: Geração de relatórios em PDF
- ✅ **Formato Brasileiro**: R$ e % formatados corretamente
- ✅ **Tema Dark/Light**: Modo escuro/claro completo
- ✅ **Persistência Local**: Dados salvos automaticamente no navegador

## 🚀 Tecnologias

- **Next.js 15.5.4**: Framework React
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes UI
- **Zustand**: Gerenciamento de estado
- **Recharts**: Gráficos
- **jsPDF**: Geração de PDF
- **Lucide React**: Ícones

## 📦 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/tax-planner-react.git

# Entre na pasta do projeto
cd tax-planner-react

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

Acesse: `http://localhost:3000`

## 📖 Como Usar

### 1. **Configure os Parâmetros Básicos**

Na aba **Configurações**, defina:
- Receita Bruta Mensal
- Alíquotas de ICMS, PIS, COFINS, IRPJ, CSLL
- CMV (Custo das Mercadorias Vendidas)

### 2. **Adicione Despesas Operacionais**

Em **PIS/COFINS** → **Despesas COM Crédito**:
- Adicione despesas que geram crédito fiscal
- Ou importe via CSV (modelo disponível)

Em **PIS/COFINS** → **Despesas SEM Crédito**:
- Adicione despesas sem direito a crédito

### 3. **Visualize os Resultados**

- **Dashboard**: Composição tributária em gráfico
- **DRE**: Demonstração detalhada do resultado
- **Memória de Cálculo**: ICMS, PIS/COFINS, IRPJ/CSLL detalhados

### 4. **Salve Cenários**

Crie múltiplos cenários para comparar diferentes estratégias tributárias.

### 5. **Exporte Relatórios**

Gere PDFs para apresentação ou arquivo.

## 🎯 Funcionalidades

### **Cálculos Tributários**

#### ICMS
- Cálculo com e sem Substituição Tributária (ST)
- Débito e Crédito automáticos
- Cards de resumo: Faturamento, Débito, Crédito, A Pagar

#### PIS/COFINS
- Regime cumulativo e não-cumulativo
- Monofásico com ajuste automático
- Créditos sobre despesas operacionais
- 8 cards de resumo (4 PIS + 4 COFINS)

#### IRPJ/CSLL
- Lucro Real
- Despesas dedutíveis
- 4 cards: Lucro Antes, Lucro Real, IRPJ, CSLL

### **DRE (Demonstração do Resultado do Exercício)**

```
(+) Receita Bruta
(-) CMV
(=) LUCRO BRUTO
(-) Despesas Operacionais
  • Energia (COM crédito)
  • Salários (SEM crédito)
  • Aluguel (SEM crédito)
  • Frete (COM crédito)
  ... [dinâmicas cadastradas]
  (-) Depreciação
  (-) Desp. Administrativas
  (-) Desp. Comerciais
(=) LUCRO OPERACIONAL
(-) ICMS
(-) PIS
(-) COFINS
(-) IRPJ
(-) CSLL
(=) LUCRO LÍQUIDO
```

### **Despesas Dinâmicas**

**CRUD Completo:**
- ➕ Adicionar despesa
- ✏️ Editar despesa
- 🗑️ Deletar despesa
- 📤 Importar via CSV
- 💾 Exportar para CSV

**Tipos:**
- **Custo**: Vai para CMV
- **Despesa**: Vai para Despesas Operacionais

**Crédito PIS/COFINS:**
- **COM crédito**: Gera crédito fiscal
- **SEM crédito**: Não gera crédito

### **Importação CSV**

Formato esperado:
```csv
descricao;valor;tipo;credito
Energia Elétrica;15000.00;despesa;com-credito
Salários;80000.00;despesa;sem-credito
```

- Separador: `;` (ponto e vírgula)
- Valor: formato BR (1.500,00) ou internacional (1500.00)
- Tipo: `custo` ou `despesa`
- Crédito: `com-credito` ou `sem-credito`

## 📁 Estrutura do Projeto

```
tax-planner-react/
├── src/
│   ├── app/                      # Next.js App Router
│   ├── components/
│   │   ├── common/               # Inputs de moeda e %
│   │   ├── config/               # Painel de configuração
│   │   ├── dashboard/            # Gráficos
│   │   ├── dre/                  # DRE Table
│   │   ├── memoria/              # Memórias de cálculo
│   │   ├── scenarios/            # Gerenciamento de cenários
│   │   └── ui/                   # Componentes shadcn/ui
│   ├── hooks/                    # Custom hooks
│   │   ├── use-dre-calculation.ts
│   │   ├── use-memoria-icms.ts
│   │   ├── use-memoria-pis-cofins.ts
│   │   ├── use-memoria-irpj-csll.ts
│   │   ├── use-tax-store.ts
│   │   └── use-pdf-export.ts
│   ├── lib/                      # Utilitários
│   │   ├── constants.ts
│   │   ├── csv-utils.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   └── types/                    # TypeScript types
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 📚 Documentação

Documentos disponíveis na raiz do projeto:

- `INTEGRACAO-DESPESAS-DRE.md`: Guia de integração de despesas
- `REVISAO-INTEGRACAO-DESPESAS.md`: Revisão completa da integração
- `IMPORTACAO-CSV-DESPESAS.md`: Guia de importação CSV
- `REGIMES-ESPECIAIS-IMPLEMENTACAO.md`: Monofásico e ST
- `FORMATO-MOEDA-BRASILEIRO.md`: Formatação R$ e %
- `GUIA-CMV.md`: Cálculo do CMV

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

Desenvolvido com ❤️ por [Seu Nome]

## 🙏 Agradecimentos

- shadcn/ui pelos componentes
- Vercel pelo Next.js
- Recharts pelos gráficos

---

⭐ **Se este projeto foi útil, considere dar uma estrela!**
