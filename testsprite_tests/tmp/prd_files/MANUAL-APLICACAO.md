# 📖 Manual de Usuário - Planejador Tributário v3.0

## 🎯 Visão Geral

O **Planejador Tributário v3.0** é um sistema completo e moderno de planejamento tributário brasileiro desenvolvido com React + Next.js + shadcn/ui. Permite calcular automaticamente ICMS, PIS/COFINS, IRPJ/CSLL e gerar DRE detalhada com gestão inteligente de despesas operacionais.

### 🌟 Principais Características

- ✅ **Cálculo Automático de Tributos**: ICMS, PIS/COFINS, IRPJ/CSLL
- ✅ **DRE Dinâmica**: Demonstração do Resultado do Exercício completa
- ✅ **Substituição Tributária**: Suporte para ICMS-ST
- ✅ **Regimes Especiais**: Monofásico PIS/COFINS
- ✅ **Despesas Dinâmicas**: COM e SEM crédito fiscal
- ✅ **Importação CSV**: Upload em massa de despesas
- ✅ **Cenários Múltiplos**: Compare diferentes estratégias
- ✅ **Exportação PDF**: Relatórios profissionais
- ✅ **Tema Dark/Light**: Interface moderna
- ✅ **Persistência Local**: Dados salvos automaticamente

---

## 🚀 Como Começar

### 1. Acesso à Aplicação

- **URL Local**: `http://localhost:3000` (após instalação)
- **Navegadores Suportados**: Chrome, Firefox, Safari, Edge (versões recentes)

### 2. Interface Principal

A aplicação possui uma interface intuitiva com:

- **Header**: Logo, título e toggle tema dark/light
- **Dashboard**: Métricas principais e composição tributária
- **Abas Principais**: Configurações, Memórias, Cenários, DRE
- **Footer**: Informações da versão

---

## 🎛️ Configurações Básicas

### Aba "Configurações"

Esta é a primeira aba que você deve configurar antes de usar o sistema.

#### 📊 Valores Básicos

| Campo | Descrição | Formato |
|-------|-----------|---------|
| **Receita Bruta Mensal** | Faturamento mensal da empresa | R$ 0,00 |
| **CMV** | Custo das Mercadorias Vendidas | R$ 0,00 |

#### 🏛️ Alíquotas ICMS

| Campo | Descrição | Padrão |
|-------|-----------|---------|
| **ICMS Interno** | Alíquota para vendas dentro do estado | 18% |
| **ICMS Sul/Sudeste** | Alíquota para estados do Sul/Sudeste | 12% |
| **ICMS Norte/Nordeste** | Alíquota para estados do Norte/Nordeste | 7% |
| **DIFAL** | Diferencial de Alíquota | 6% |
| **FCP** | Fundo de Combate à Pobreza | 2% |

#### 💰 Alíquotas PIS/COFINS

| Campo | Descrição | Padrão |
|-------|-----------|---------|
| **PIS** | Programa de Integração Social | 1,65% |
| **COFINS** | Contribuição para Financiamento da Seguridade Social | 7,60% |

#### 🏢 Alíquotas IRPJ/CSLL

| Campo | Descrição | Padrão |
|-------|-----------|---------|
| **IRPJ Base** | Imposto de Renda Pessoa Jurídica | 15% |
| **IRPJ Adicional** | Adicional sobre lucro > R$ 20.000 | 10% |
| **CSLL** | Contribuição Social sobre Lucro Líquido | 9% |

#### ⚙️ Configurações Especiais

- **ICMS Substituição Tributária**: Ative para produtos com ST
- **PIS/COFINS Monofásico**: Para produtos com regime especial
- **ISS**: Para empresas que prestam serviços

---

## 📋 Memórias de Cálculo

### Aba "Memória ICMS"

Visualize detalhadamente o cálculo do ICMS:

- **ICMS a Recolher por Estado**
- **Base de Cálculo por Regime**
- **Créditos e Débitos**
- **Substituição Tributária**
- **DIFAL e FCP**

### Aba "Memória PIS/COFINS"

#### Despesas COM Crédito

Despesas que geram direito a crédito fiscal:

- **Como Adicionar**: Click em "Adicionar Despesa"
- **Campos**: Descrição, Valor, Categoria
- **Crédito Automático**: Sistema calcula 9,25% automaticamente

#### Despesas SEM Crédito

Despesas sem direito a crédito:

- **Exemplos**: Energia elétrica, telecomunicações, salários
- **Impacto**: Reduzem o lucro mas não geram crédito

#### Importação CSV

1. Click em "Importar CSV"
2. Baixe o modelo (se necessário)
3. Preencha com suas despesas
4. Faça upload do arquivo
5. Confirme a importação

**Formato do CSV:**
```csv
descricao,valor,categoria,tem_credito
Matéria Prima,10000.00,Materiais,true
Energia Elétrica,500.00,Utilities,false
```

### Aba "Memória IRPJ/CSLL"

- **Base de Cálculo**: Lucro Real apurado
- **Deduções**: Despesas dedutíveis
- **Adições**: Ajustes fiscais
- **Cálculo Final**: IRPJ + CSLL

---

## 🎯 Cenários

### Gerenciamento de Cenários

A funcionalidade de cenários permite:

- **Criar**: Diferentes simulações tributárias
- **Comparar**: Estratégias lado a lado
- **Salvar**: Múltiplas configurações
- **Renomear**: Identificação clara

#### Como Criar um Cenário

1. Configure todos os parâmetros desejados
2. Va para aba "Cenários"
3. Click em "Salvar Cenário Atual"
4. Digite um nome descritivo
5. Confirme a criação

#### Como Comparar Cenários

- Selecione 2 ou mais cenários salvos
- Visualize diferenças lado a lado
- Analise impacto tributário
- Exporte comparativo em PDF

---

## 📊 DRE (Demonstração do Resultado do Exercício)

### Estrutura da DRE

| Linha | Descrição |
|-------|-----------|
| **Receita Bruta** | Faturamento total |
| **(-) Deduções** | ICMS, PIS, COFINS |
| **= Receita Líquida** | Base para outros cálculos |
| **(-) CMV** | Custo das Mercadorias Vendidas |
| **= Lucro Bruto** | Margem bruta da operação |
| **(-) Despesas Operacionais** | Despesas COM e SEM crédito |
| **= LAIR** | Lucro Antes do Imposto de Renda |
| **(-) IRPJ/CSLL** | Impostos sobre o lucro |
| **= Lucro Líquido** | Resultado final |

### Indicadores Importantes

- **Margem Bruta**: (Lucro Bruto ÷ Receita Líquida) × 100
- **Margem Líquida**: (Lucro Líquido ÷ Receita Líquida) × 100
- **Carga Tributária**: (Total Impostos ÷ Receita Bruta) × 100

---

## 📄 Exportação de Relatórios

### PDF Export

1. Configure todos os dados
2. Va para a seção de export
3. Click em "Gerar PDF"
4. Aguarde o processamento
5. Download automático

### Conteúdo do PDF

- **Capa**: Logo e informações da empresa
- **Resumo Executivo**: Principais métricas
- **DRE Completa**: Demonstração detalhada
- **Memórias de Cálculo**: ICMS, PIS/COFINS, IRPJ/CSLL
- **Gráficos**: Composição tributária
- **Observações**: Notas e premissas

---

## ⚡ Funcionalidades Avançadas

### Temas (Dark/Light Mode)

- **Toggle**: Click no ícone sol/lua no header
- **Persistência**: Tema salvo automaticamente
- **Contraste**: Otimizado para ambos os modos

### Validações Automáticas

- **Campos Obrigatórios**: Destacados em vermelho
- **Formatos**: Moeda e percentual validados
- **Limites**: Valores dentro de ranges aceitáveis

### Persistência de Dados

- **Local Storage**: Dados salvos no navegador
- **Auto-save**: Salvamento automático a cada alteração
- **Backup**: Dados mantidos entre sessões

### Performance

- **Debounce**: Evita cálculos desnecessários
- **Memo**: Componentes otimizados
- **Lazy Loading**: Carregamento sob demanda

---

## 🛠️ Solução de Problemas

### Problemas Comuns

#### "Valores não aparecem"
- **Causa**: Configurações não salvas
- **Solução**: Verifique se clicou "Salvar" após alterações

#### "PDF não gera"
- **Causa**: Dados incompletos
- **Solução**: Preencha todos os campos obrigatórios

#### "Cálculos incorretos"
- **Causa**: Alíquotas erradas
- **Solução**: Revise as alíquotas na aba Configurações

#### "Tema não muda"
- **Causa**: JavaScript desabilitado
- **Solução**: Habilite JavaScript no navegador

### Performance Lenta

- **Limpe o cache** do navegador
- **Feche outras abas** desnecessárias
- **Atualize a página** (F5)
- **Use navegador atualizado**

### Dados Perdidos

- **Verificar Local Storage**: Dados podem estar salvos
- **Não usar modo privado**: Dados não persistem
- **Backup regular**: Exporte cenários importantes

---

## 🔧 Configuração Técnica

### Requisitos do Sistema

#### Navegador
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

#### Hardware
- **RAM**: 4GB mínimo
- **Processador**: Dual-core 2GHz+
- **Conexão**: Não necessária (após carregamento)

### Configuração de Desenvolvimento

```bash
# Pré-requisitos
Node.js 18+
npm 9+

# Instalação
npm install

# Execução
npm run dev

# Build
npm run build

# Análise de Bundle
npm run analyze
```

### Estrutura de Arquivos

```
tax-planner-react/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── config/            # Configuration panels
│   │   ├── memoria/           # Tax calculation memories
│   │   ├── dashboard/         # Charts and metrics
│   │   └── common/            # Reusable components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and constants
│   └── types/                 # TypeScript definitions
├── supabase/                  # Database schema
└── docs/                      # Documentation
```

---

## 📚 Referências Tributárias

### Legislação Base

- **Lei 12.741/2012**: Transparência de impostos
- **Lei Complementar 87/1996**: Lei Kandir (ICMS)
- **Lei 10.637/2002**: PIS não-cumulativo
- **Lei 10.833/2003**: COFINS não-cumulativo
- **RIR/2018**: Regulamento do Imposto de Renda

### Alíquotas Padrão (2024)

- **ICMS**: 7% a 18% (conforme estado/produto)
- **PIS**: 1,65% (não-cumulativo)
- **COFINS**: 7,60% (não-cumulativo)
- **IRPJ**: 15% + 10% adicional
- **CSLL**: 9% (maioria das empresas)

### Observações Importantes

- ⚠️ **Alíquotas podem variar** por estado/município
- ⚠️ **Regimes especiais** alteram cálculos
- ⚠️ **Consulte sempre** a legislação atual
- ⚠️ **Valide com contador** antes de decisões importantes

---

## 🆘 Suporte

### Canais de Ajuda

1. **Documentação**: Consulte este manual completo
2. **Comentários no Código**: Explicações técnicas detalhadas
3. **Issues GitHub**: Reporte bugs ou sugestões
4. **Email**: contato@empresa.com.br

### FAQ (Perguntas Frequentes)

**P: Posso usar para qualquer empresa?**
R: Sim, mas ajuste as alíquotas conforme o regime e localização.

**P: Os dados ficam seguros?**
R: Sim, tudo é processado localmente no seu navegador.

**P: Posso exportar os dados?**
R: Sim, através de PDF ou salvando cenários.

**P: Funciona offline?**
R: Sim, após o carregamento inicial.

**P: É gratuito?**
R: Verifique a licença do projeto.

---

## 📈 Roadmap Futuro

### Próximas Versões

#### v3.1 (Em Desenvolvimento)
- ✅ Melhor performance
- ✅ Novos validadores
- ✅ Error boundaries
- ✅ Loading states

#### v3.2 (Planejado)
- 🔄 Integração com Supabase
- 🔄 Multi-empresa
- 🔄 Histórico temporal
- 🔄 APIs REST

#### v4.0 (Futuro)
- 🔮 IA para otimização
- 🔮 Dashboard avançado
- 🔮 Mobile app
- 🔮 Integração contábil

---

## ✅ Checklist de Uso

### Primeira Configuração
- [ ] Acessar aplicação
- [ ] Configurar receita bruta
- [ ] Definir alíquotas ICMS
- [ ] Definir alíquotas PIS/COFINS
- [ ] Definir alíquotas IRPJ/CSLL
- [ ] Adicionar CMV

### Uso Regular
- [ ] Atualizar receita mensal
- [ ] Adicionar despesas operacionais
- [ ] Revisar memórias de cálculo
- [ ] Salvar cenários importantes
- [ ] Gerar relatórios PDF
- [ ] Fazer backup dos dados

### Manutenção
- [ ] Atualizar alíquotas (conforme legislação)
- [ ] Limpar cenários antigos
- [ ] Verificar performance
- [ ] Atualizar navegador

---

## 🎉 Conclusão

O **Planejador Tributário v3.0** é uma ferramenta poderosa e completa para planejamento tributário brasileiro. Com interface moderna, cálculos precisos e recursos avançados, oferece tudo que você precisa para:

- ✅ **Calcular impostos** com precisão
- ✅ **Planejar estratégias** tributárias
- ✅ **Comparar cenários** diferentes
- ✅ **Gerar relatórios** profissionais
- ✅ **Otimizar resultados** fiscais

### 🏆 Benefícios Principais

1. **⏱️ Economia de Tempo**: Cálculos automáticos
2. **📊 Precisão**: Baseado na legislação atual
3. **🎯 Estratégia**: Múltiplos cenários
4. **📄 Profissional**: Relatórios em PDF
5. **🔄 Flexibilidade**: Fácil de usar e configurar

---

**💡 Dica Final**: Use a função de cenários para testar diferentes estratégias antes de tomar decisões importantes. Sempre consulte um contador para validar os resultados em situações específicas.

**📧 Contato**: Para dúvidas técnicas ou sugestões de melhoria, abra uma issue no repositório GitHub ou entre em contato com a equipe de desenvolvimento.

---

*Manual atualizado em: Novembro 2024*  
*Versão do Sistema: 3.0*  
*Compatibilidade: Navegadores modernos*

---

**🚀 Desenvolvido com ❤️ usando React + Next.js + TypeScript + shadcn/ui**