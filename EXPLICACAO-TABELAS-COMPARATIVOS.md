# 📊 EXPLICAÇÃO DAS TABELAS - SISTEMA DE COMPARATIVOS

## 🎯 VISÃO GERAL

O sistema tem **2 tipos de comparações diferentes**:

1. **Comparação entre CENÁRIOS** (Lucro Real) → Tabela `comparativos`
2. **Comparação entre REGIMES** (Lucro Real vs Presumido vs Simples) → Tabela `dados_comparativos_mensais`

---

## 📋 TABELA 1: `dados_comparativos_mensais`

### Objetivo
Armazenar **dados manuais** de impostos para **Lucro Presumido** e **Simples Nacional** (mês a mês).

### Por que existe?
- Cenários de Lucro Real são calculados automaticamente pelo sistema
- Lucro Presumido e Simples precisam ser inseridos manualmente
- Permite comparar Lucro Real (calculado) com outros regimes (manual)

### Estrutura
```sql
{
  id: uuid,
  empresa_id: uuid,           -- Qual empresa
  mes: '01' até '12',         -- Qual mês
  ano: 2025,                  -- Qual ano
  regime: 'lucro_presumido',  -- Qual regime (lucro_presumido ou simples_nacional)
  receita: 1800000,           -- Receita do mês
  icms: 4140,                 -- Valor de ICMS
  pis: 990,                   -- Valor de PIS
  cofins: 1368,               -- Valor de COFINS
  irpj: 354,                  -- Valor de IRPJ
  csll: 148,                  -- Valor de CSLL
  iss: 0,                     -- Valor de ISS
  outros: 0,                  -- Outros impostos
  observacoes: 'texto'        -- Observações opcionais
}
```

### Como usar na interface
1. Acesse: **Empresas** → **RB ACESSÓRIOS** → **Comparativos**
2. Clique na aba: **"Adicionar Dados"**
3. Preencha o formulário:
   - Regime: Lucro Presumido ou Simples Nacional
   - Mês: Janeiro, Fevereiro, etc.
   - Ano: 2025
   - Valores dos impostos
4. Clique em **"Salvar"**

### Status atual (RB ACESSÓRIOS)
✅ **TEM DADOS:**
- Janeiro/2025: R$ 7.000,00
- Fevereiro/2025: R$ 3.500,00
- Março/2025: R$ 4.200,00
- Abril/2025: R$ 8.600,00 (teste)

### Onde é usado
- **Gráfico de comparação entre regimes** na página Comparativos
- Mostra linha azul (Lucro Presumido) vs linha vermelha (Lucro Real)

---

## 📋 TABELA 2: `comparativos`

### Objetivo
Salvar **análises comparativas entre múltiplos cenários** de Lucro Real (não entre regimes!).

### Por que existe?
- Permite comparar diferentes cenários de Lucro Real
- Exemplo: Comparar "Janeiro Conservador" vs "Janeiro Otimista" vs "Janeiro Real"
- Salva análises para revisitar depois

### Estrutura
```sql
{
  id: uuid,
  nome: 'Comparação Q1 2025',                    -- Nome da análise
  descricao: 'Comparar cenários do trimestre',   -- Descrição opcional
  cenario_ids: [                                  -- Array de 2 a 4 cenários
    'uuid-cenario-janeiro',
    'uuid-cenario-fevereiro',
    'uuid-cenario-marco'
  ],
  created_at: timestamp,
  updated_at: timestamp
}
```

### Como usar na interface
1. Acesse: **Empresas** → **RB ACESSÓRIOS** → **Comparativos**
2. Clique em: **"Nova Análise Comparativa"**
3. Modal abre com:
   - Campo "Nome da Análise"
   - Campo "Descrição" (opcional)
   - Seleção de 2 a 4 cenários para comparar
4. Clique em **"Criar Análise"**

### Status atual (RB ACESSÓRIOS)
⚠️  **VAZIA** - Nenhuma análise comparativa salva ainda

### Onde é usado
- Lista de análises salvas na aba **"Comparação"**
- Permite revisar análises antigas
- Cada análise mostra gráficos e tabelas comparando os cenários selecionados

---

## 📋 VIEW: `comparativos_detalhados`

### O que é
Uma **VIEW** (consulta SQL virtual) que junta dados de 3 tabelas:
- `comparativos` (análises salvas)
- `cenarios` (cenários de Lucro Real)
- `empresas` (dados das empresas)

### Para que serve
Facilitar consultas mostrando informações completas:
```json
{
  "id": "uuid-comparativo",
  "nome": "Análise Q1",
  "descricao": "...",
  "total_cenarios": 3,
  "cenarios_info": [
    {
      "id": "uuid-1",
      "nome": "Janeiro",
      "empresa": "RB Acessórios",
      "ano": 2025
    },
    {
      "id": "uuid-2",
      "nome": "Fevereiro",
      "empresa": "RB Acessórios",
      "ano": 2025
    }
  ]
}
```

### Status atual
⚠️  **VAZIA** - Porque `comparativos` está vazia

---

## 🔄 FLUXO COMPLETO DO SISTEMA

### 1️⃣  Criar Cenários de Lucro Real
```
Empresas → RB ACESSÓRIOS → Cenários → Novo Cenário
↓
Preencher dados (receita, CMV, despesas, etc.)
↓
Sistema calcula impostos automaticamente
↓
Salvar cenário (gera resultados no campo `resultados`)
```

### 2️⃣  Adicionar Dados de Outros Regimes
```
Empresas → RB ACESSÓRIOS → Comparativos → Aba "Adicionar Dados"
↓
Selecionar: Lucro Presumido ou Simples Nacional
↓
Informar valores dos impostos manualmente
↓
Salvar (vai para tabela `dados_comparativos_mensais`)
```

### 3️⃣  Visualizar Gráfico Comparativo
```
Empresas → RB ACESSÓRIOS → Comparativos → Aba "Comparação"
↓
Sistema busca:
  - Cenários de Lucro Real (campo `resultados`)
  - Dados de Lucro Presumido (tabela `dados_comparativos_mensais`)
↓
Gera gráfico com 2 linhas:
  - Linha vermelha: Lucro Real (calculado)
  - Linha azul: Lucro Presumido (manual)
```

### 4️⃣  Salvar Análise Comparativa (OPCIONAL)
```
Empresas → RB ACESSÓRIOS → Comparativos → "Nova Análise Comparativa"
↓
Selecionar 2-4 cenários de Lucro Real
↓
Dar nome e salvar
↓
Vai para tabela `comparativos`
↓
Pode ser revisitada depois na lista de análises
```

---

## ❓ POR QUE ALGUMAS TABELAS ESTÃO VAZIAS?

### `dados_comparativos_mensais` - ✅ TEM DADOS
- Janeiro, Fevereiro, Março já foram inseridos
- Sistema funcionando corretamente

### `comparativos` - ⚠️  VAZIA
**Motivo:** Você ainda não criou nenhuma análise comparativa salva

**É problema?** NÃO! Essa tabela é **opcional**
- Serve apenas para salvar análises que você quer revisar depois
- O gráfico de comparação entre regimes funciona sem ela
- Só precisa dela se quiser salvar análises para consultar no futuro

### `comparativos_detalhados` - ⚠️  VAZIA
**Motivo:** É uma VIEW que depende de `comparativos`
**É problema?** NÃO! É automática e só mostra dados quando `comparativos` tiver registros

---

## 🎯 RESUMO FINAL

### Tabela `dados_comparativos_mensais`
- ✅ **Funcionando** - 17 registros no banco
- ✅ **Necessária** - Sem ela não há comparação entre regimes
- ✅ **Já tem dados** de RB ACESSÓRIOS

### Tabela `comparativos`
- ⚠️  **Vazia** mas isso é normal
- ❌ **Não é obrigatória** - Sistema funciona sem ela
- 💡 **Use quando quiser** salvar análises entre cenários

### VIEW `comparativos_detalhados`
- ⚠️  **Vazia** porque `comparativos` está vazia
- 🤖 **Automática** - Não precisa inserir dados manualmente
- ✅ **Funcionará** quando criar análises em `comparativos`

---

## 🚀 PRÓXIMAS AÇÕES

### Para o gráfico funcionar (PRIORIDADE):
1. ✅ Dados de Lucro Presumido → **JÁ TEM** (Janeiro, Fevereiro, Março)
2. ❌ Dados de Lucro Real → **FALTA** (cenários sem `resultados`)

### Solução:
**Opção A:** Calcular os cenários na interface
- Abrir cada cenário (Janeiro, Fevereiro, Março)
- Clicar em "Salvar e Aprovar"
- Sistema calcula e salva no campo `resultados`

**Opção B:** Inserir valores via script (mais rápido)
- Me passar os valores de Lucro Real
- Criar script para inserir diretamente

### Para salvar análises comparativas (OPCIONAL):
- Criar cenários variados (ex: Janeiro Conservador, Janeiro Otimista)
- Clicar em "Nova Análise Comparativa"
- Selecionar cenários e salvar

---

## 📞 PERGUNTAS FREQUENTES

**Q: Por que `comparativos` está vazia?**
A: Porque você ainda não salvou nenhuma análise comparativa. É opcional!

**Q: O gráfico precisa de dados em `comparativos`?**
A: NÃO! O gráfico usa `dados_comparativos_mensais` (Lucro Presumido) + `cenarios.resultados` (Lucro Real)

**Q: Quando devo usar `comparativos`?**
A: Quando quiser comparar múltiplos cenários de Lucro Real e salvar essa análise para depois

**Q: Por que tem dados em `dados_comparativos_mensais` mas não em `comparativos`?**
A: São coisas diferentes! Uma é para dados de regimes, outra é para análises salvas

---

## ✅ CONCLUSÃO

**Status do sistema:**
- ✅ Tabelas criadas corretamente
- ✅ `dados_comparativos_mensais` funcionando (com dados)
- ✅ `comparativos` funcionando (vazia é normal)
- ✅ `comparativos_detalhados` funcionando (VIEW automática)

**Problema atual:**
- ❌ Gráfico não mostra Lucro Real porque cenários não têm `resultados`
- ✅ Gráfico PODE mostrar Lucro Presumido (dados já existem)

**Próximo passo:**
Calcular os cenários de Lucro Real para preencher o campo `resultados`
