# 📦 Configuração do CMV - Guia Completo

## 🎯 Localização no Sistema

**Caminho:** Dashboard → Configurações → Aba "Geral" → Card "CMV - Custo da Mercadoria Vendida"

O campo do CMV agora está em um **card dedicado** com destaque visual (borda vermelha) e informações contextuais completas.

---

## 📋 O Que É o CMV?

**CMV (Custo da Mercadoria Vendida)** é o valor total dos custos das mercadorias que foram efetivamente vendidas no período.

### Fórmula Básica:
```
CMV = Estoque Inicial + Compras - Estoque Final
```

### Exemplo Prático:
```
Estoque Inicial (01/01): R$ 100.000
+ Compras do Mês:        R$ 300.000
= Mercadorias Disponíveis: R$ 400.000
- Estoque Final (31/01): R$ 150.000
= CMV do Período:        R$ 250.000
```

---

## 💼 Impacto Tributário do CMV

### 1. **PIS/COFINS Não Cumulativo** ✅
- **Gera crédito de 9,25%** (1,65% PIS + 7,6% COFINS)
- Base de cálculo principal para créditos
- Reduz significativamente a carga tributária

**Exemplo:**
```
CMV: R$ 500.000
Crédito PIS:    R$ 500.000 × 1,65% = R$ 8.250
Crédito COFINS: R$ 500.000 × 7,60% = R$ 38.000
Total Créditos: R$ 46.250
```

### 2. **IRPJ e CSLL** ✅
- **Totalmente dedutível** da base de cálculo
- Reduz o lucro tributável
- Impacta diretamente o valor do imposto

**Exemplo:**
```
Receita Bruta:      R$ 1.000.000
(-) CMV:            R$ 500.000
= Lucro Bruto:      R$ 500.000

IRPJ (15%):         R$ 75.000 (ao invés de R$ 150.000)
CSLL (9%):          R$ 45.000 (ao invés de R$ 90.000)
Economia Total:     R$ 120.000
```

### 3. **DRE (Demonstração do Resultado)** ✅
- Primeira dedução após a receita líquida
- Forma o **Lucro Bruto**
- Base para análise de margem

---

## 🔧 Como Configurar no Sistema

### Passo 1: Acesse o Campo
1. Abra o **Planejador Tributário**
2. Clique na aba **Configurações**
3. Certifique-se de estar na aba **Geral**
4. Localize o card **"CMV - Custo da Mercadoria Vendida"**

### Passo 2: Insira o Valor
```tsx
// Campo com validação automática
<CurrencyInput
  label="CMV Total do Período"
  value={500000}  // Exemplo: R$ 500.000,00
  required        // Campo obrigatório
/>
```

### Passo 3: Veja as Informações Contextuais
O card exibe:
- ℹ️ **Explicação da fórmula**
- 💡 **Dicas importantes**
- ⚠️ **Diferença entre CMV e Compras**

---

## ⚠️ Erros Comuns

### ❌ Erro 1: Confundir CMV com Total de Compras
```
ERRADO: CMV = Compras do mês (R$ 300.000)
CERTO:  CMV = EI + Compras - EF (R$ 250.000)
```

**Por quê?** As compras incluem mercadorias ainda em estoque.

### ❌ Erro 2: Incluir Despesas Operacionais
```
ERRADO: CMV = Custos + Salários + Aluguel
CERTO:  CMV = Apenas custo das mercadorias vendidas
```

**Por quê?** Despesas operacionais são deduzidas separadamente.

### ❌ Erro 3: Usar Valores sem Impostos
```
ERRADO: CMV = Valor com ICMS incluso
CERTO:  CMV = Valor líquido (sem impostos recuperáveis)
```

**Por quê?** ICMS já é creditado separadamente.

---

## 📊 Verificação de Consistência

### Checklist de Validação:
- [ ] CMV ≤ Receita Bruta (não pode vender com prejuízo total)
- [ ] CMV > 0 (sempre há custo de mercadoria)
- [ ] CMV + Estoque Final = Estoque Inicial + Compras
- [ ] Margem Bruta razoável: (Receita - CMV) / Receita > 20%

### Alertas do Sistema:
O sistema pode exibir avisos se:
- CMV > 90% da Receita Bruta (margem muito baixa)
- CMV = 0 (campo obrigatório não preenchido)
- Compras totais ≠ CMV + Variação de Estoque

---

## 🎨 Visual do Campo no Sistema

```
┌─────────────────────────────────────────────────────┐
│ 📦 CMV - Custo da Mercadoria Vendida               │ ← Título destacado
│ Base de cálculo para PIS/COFINS não cumulativo    │ ← Descrição
├─────────────────────────────────────────────────────┤
│                                                     │
│ CMV Total do Período *                             │
│ ┌─────────────────────────────────────────────┐   │
│ │ R$ 500.000,00                                │   │ ← Input formatado
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ╔═══════════════════════════════════════════════╗ │
│ ║ ℹ️ Como calcular o CMV:                      ║ │
│ ║ • CMV = Estoque Inicial + Compras - Estoque  ║ │
│ ║ • Gera crédito de PIS/COFINS (9,25%)        ║ │
│ ║ • Essencial para cálculo do Lucro Real      ║ │
│ ║ • Dedutível do IRPJ e CSLL                  ║ │
│ ╚═══════════════════════════════════════════════╝ │
│                                                     │
│ ╔═══════════════════════════════════════════════╗ │
│ ║ 💡 Dica Importante:                          ║ │
│ ║ O CMV deve incluir APENAS o custo das        ║ │
│ ║ mercadorias efetivamente vendidas no         ║ │
│ ║ período, não as compras totais.              ║ │
│ ╚═══════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────┘
        ↑ Borda vermelha (destaque visual)
```

---

## 🔗 Relação com Outros Campos

### Campos que Usam o CMV:

1. **PIS/COFINS (Aba PIS/COFINS)**
   - Calcula crédito automático: CMV × 9,25%
   - Reduz PIS/COFINS a pagar

2. **IRPJ/CSLL (Aba IRPJ/CSLL)**
   - Deduz do lucro antes dos impostos
   - Base para Lucro Real

3. **DRE (Aba DRE)**
   - Linha 2: (-) CMV
   - Resulta em Lucro Bruto

4. **Dashboard**
   - Usado no cálculo de Lucro Líquido
   - Impacta Carga Tributária %

---

## 📈 Exemplo Completo de Fluxo

### Cenário: Empresa Comercial

**Dados do Mês:**
```
Estoque Inicial:     R$ 200.000
Compras Internas:    R$ 400.000
Compras Interstate:  R$ 100.000
Estoque Final:       R$ 200.000
```

**Cálculo do CMV:**
```
CMV = 200.000 + (400.000 + 100.000) - 200.000
CMV = 200.000 + 500.000 - 200.000
CMV = R$ 500.000
```

**Impacto Tributário:**
```
1. Crédito PIS/COFINS:
   - PIS:    500.000 × 1,65% = R$ 8.250
   - COFINS: 500.000 × 7,60% = R$ 38.000
   - Total:  R$ 46.250

2. Redução IRPJ/CSLL:
   - Receita:        R$ 1.000.000
   - CMV:            R$ 500.000
   - Lucro Bruto:    R$ 500.000
   
   Se CMV fosse zero:
   - IRPJ: 1.000.000 × 15% = R$ 150.000
   - CSLL: 1.000.000 × 9%  = R$ 90.000
   
   Com CMV deduzido:
   - IRPJ: 500.000 × 15% = R$ 75.000
   - CSLL: 500.000 × 9%  = R$ 45.000
   
   Economia: R$ 120.000

3. Total de Benefício Fiscal:
   - Créditos PIS/COFINS:  R$ 46.250
   - Redução IRPJ/CSLL:    R$ 120.000
   - Total:                R$ 166.250 (33% do CMV!)
```

---

## 🚀 Boas Práticas

### ✅ Recomendações:
1. **Apure o CMV mensalmente** (controle de estoque rigoroso)
2. **Separe CMV de despesas** (não misture custos e despesas)
3. **Documente o cálculo** (facilita auditoria fiscal)
4. **Use sistema de inventário** (perpétuo ou periódico)
5. **Revise margem de lucro** (CMV/Receita < 70% ideal)

### ⚠️ Cuidados:
1. Não incluir impostos recuperáveis no CMV
2. Separar mercadorias para revenda de ativo imobilizado
3. Ajustar perdas e quebras corretamente
4. Manter documentação fiscal completa

---

## 📞 Dúvidas Frequentes

### 1. "Posso deixar o CMV em branco?"
❌ **Não.** O campo é obrigatório (marcado com *). O sistema não calcula corretamente sem ele.

### 2. "Qual a diferença entre CMV e Compras?"
- **Compras**: Total adquirido no mês (R$ 500.000)
- **CMV**: Apenas o que foi vendido (R$ 400.000)
- **Diferença**: Ficou em estoque (R$ 100.000)

### 3. "Como saber se meu CMV está correto?"
Verifique se:
```
CMV + Estoque Final = Estoque Inicial + Compras
```

### 4. "O CMV inclui frete das compras?"
✅ **Sim!** Todos os custos para trazer a mercadoria até o estoque:
- Frete
- Seguro
- Manuseio
- (Exceto ICMS recuperável)

### 5. "Devo usar CMV contábil ou fiscal?"
📋 **Fiscal**, pois o sistema calcula impostos. Geralmente são iguais, mas em caso de divergência, use o fiscal.

---

## 🎯 Resumo Executivo

| Aspecto | Descrição |
|---------|-----------|
| **Localização** | Configurações → Geral → Card "CMV" |
| **Obrigatório** | ✅ Sim (campo com *) |
| **Formato** | R$ 0,00 (moeda brasileira) |
| **Validação** | Deve ser > 0 e < Receita Bruta |
| **Impacto PIS/COFINS** | Gera 9,25% de crédito |
| **Impacto IRPJ/CSLL** | Dedutível 100% |
| **Cálculo** | EI + Compras - EF |
| **Atualização** | Mensal (conforme apuração) |

---

**📅 Última atualização:** 02/10/2025  
**🔖 Versão do sistema:** 3.0  
**👨‍💼 Responsável:** Planejador Tributário React/Next.js
