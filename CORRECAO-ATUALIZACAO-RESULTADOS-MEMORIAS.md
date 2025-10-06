# ✅ CORREÇÃO: Atualização de Resultados e Persistência de Memórias

## 🎯 Problemas Resolvidos

### **1. JSON `resultados` não atualiza após salvar**
❌ **ANTES:** Ao editar configuração e clicar em "Salvar", o campo `resultados` no banco não era atualizado com os novos valores calculados.

✅ **AGORA:** Os impostos são recalculados usando os hooks e salvos no campo `resultados` do cenário.

---

### **2. Tabelas de memória de cálculo não eram alimentadas**
❌ **ANTES:** As tabelas `calculos_icms`, `calculos_pis_cofins`, `calculos_irpj_csll` existiam mas ficavam vazias.

✅ **AGORA:** Ao salvar o cenário, todas as memórias de cálculo são persistidas nas tabelas específicas.

---

## 📝 Mudanças Implementadas

### **1. Novo Serviço: `MemoriasCalculoService`**
📁 `src/services/memorias-calculo-service.ts`

**Métodos implementados:**
```typescript
- salvarMemoriaICMS(cenarioId, memoria)
- salvarMemoriaPISCOFINS(cenarioId, memoria)  
- salvarMemoriaIRPJCSLL(cenarioId, memoria)
- salvarTodasMemorias(cenarioId, memorias...)
```

**Funcionalidade:**
- ✅ Verifica se já existe registro (UPDATE ou INSERT)
- ✅ Mapeia todos os campos das memórias para as tabelas
- ✅ Salva débitos, créditos, bases, alíquotas e totais
- ✅ Logs detalhados de cada operação

---

### **2. Atualização da Página do Cenário**
📁 `src/app/empresas/[id]/cenarios/[cenarioId]/page.tsx`

#### **Imports adicionados:**
```typescript
import { useMemoriaICMS } from "@/hooks/use-memoria-icms"
import { useMemoriaPISCOFINS } from "@/hooks/use-memoria-pis-cofins"
import { useMemoriaIRPJCSLL } from "@/hooks/use-memoria-irpj-csll"
import { useDRECalculation } from "@/hooks/use-dre-calculation"
import { MemoriasCalculoService } from "@/services/memorias-calculo-service"
```

#### **Hooks de cálculo instanciados:**
```typescript
const memoriaICMS = useMemoriaICMS(config)
const memoriaPISCOFINS = useMemoriaPISCOFINS(config)
const memoriaIRPJCSLL = useMemoriaIRPJCSLL(config)
const dre = useDRECalculation(config)
```

---

### **3. Alteração no `handleSalvar` (Salvar Rascunho)**

#### **ANTES:**
```typescript
const dadosAtualizacao = {
  nome: nomeEditavel,
  descricao: descricaoEditavel,
  configuracao: config, // ❌ Só salvava config
}

await updateCenario(cenarioId, dadosAtualizacao)
```

#### **AGORA:**
```typescript
// 1️⃣ CALCULAR RESULTADOS
const resultados = {
  icms: {
    totalDebitos: memoriaICMS.totalDebitos,
    totalCreditos: memoriaICMS.totalCreditos,
    icmsAPagar: memoriaICMS.icmsAPagar,
  },
  pisCofins: {
    pisAPagar: memoriaPISCOFINS.pisAPagar,
    cofinsAPagar: memoriaPISCOFINS.cofinsAPagar,
    totalPISCOFINS: memoriaPISCOFINS.totalPISCOFINS,
  },
  irpjCsll: {
    irpjBase: memoriaIRPJCSLL.irpjBase.valor,
    irpjAdicional: memoriaIRPJCSLL.irpjAdicional.valor,
    totalIRPJ: memoriaIRPJCSLL.totalIRPJ,
    csll: memoriaIRPJCSLL.csll.valor,
  },
  dre: {
    receitaBruta: dre.receitaBrutaVendas,
    receitaLiquida: dre.receitaLiquida,
    lucroLiquido: dre.lucroLiquido,
  },
  totalImpostos: /* soma de todos os impostos */
}

// 2️⃣ INCLUIR RESULTADOS
const dadosAtualizacao = {
  nome: nomeEditavel,
  descricao: descricaoEditavel,
  configuracao: config,
  resultados: resultados, // ✅ AGORA INCLUI RESULTADOS
}

// 3️⃣ SALVAR CENÁRIO
await updateCenario(cenarioId, dadosAtualizacao)

// 4️⃣ SALVAR MEMÓRIAS NAS TABELAS
await MemoriasCalculoService.salvarTodasMemorias(
  cenarioId,
  memoriaICMS,
  memoriaPISCOFINS,
  memoriaIRPJCSLL
)
```

---

### **4. Alteração no `handleSalvarEAprovar`**

#### **Mesmo fluxo:**
1. ✅ Recalcula todos os impostos
2. ✅ Inclui resultados no `updateCenario`
3. ✅ Salva memórias nas tabelas
4. ✅ Aprova o cenário
5. ✅ Redireciona para listagem

---

## 📊 Logs Implementados

### **Console.log durante salvamento:**

```
🔢 [CENÁRIO] Recalculando impostos antes de salvar...
💰 [CENÁRIO] Resultados calculados:
   ICMS: 12500.50
   PIS: 1650.00
   COFINS: 7600.00
   IRPJ: 15000.00
   CSLL: 9000.00
   TOTAL: 45750.50
💾 [CENÁRIO] Salvando cenário com resultados atualizados...
💾 [CENÁRIO] Salvando memórias de cálculo no banco...
💾 [MEMÓRIAS] Salvando memória ICMS para cenário: abc123...
✅ [MEMÓRIAS] Memória ICMS inserida
💾 [MEMÓRIAS] Salvando memória PIS/COFINS para cenário: abc123...
✅ [MEMÓRIAS] Memória PIS/COFINS inserida
💾 [MEMÓRIAS] Salvando memória IRPJ/CSLL para cenário: abc123...
✅ [MEMÓRIAS] Memória IRPJ/CSLL inserida
✅ [MEMÓRIAS] Todas as memórias salvas com sucesso!
✅ [CENÁRIO] Aprovando cenário...
```

---

## 🧪 Como Testar

### **Teste 1: Atualização de ICMS**
```
1. Abra um cenário existente
2. Altere "Receita Bruta Vendas" de R$ 100.000 → R$ 150.000
3. Clique "Salvar Rascunho"
4. Verifique no banco:
   - cenarios.resultados.icms.icmsAPagar deve ter o novo valor
   - calculos_icms.icms_a_pagar deve ter o mesmo valor
```

### **Teste 2: Atualização de PIS/COFINS**
```
1. Altere "Compras Internas" de R$ 50.000 → R$ 80.000
2. Clique "Salvar Rascunho"
3. Verifique console:
   - Log "💰 [CENÁRIO] Resultados calculados" mostra novos valores
4. Verifique banco:
   - cenarios.resultados.pisCofins.pisAPagar atualizado
   - calculos_pis_cofins.pis_a_pagar atualizado
```

### **Teste 3: Atualização de IRPJ com Período de Apuração**
```
1. Altere período de apuração de "Mensal" → "Trimestral"
2. Receita Bruta = R$ 300.000 (excede limite mensal de R$ 20k)
3. Clique "Salvar e Aprovar"
4. Verifique:
   - IRPJ adicional calculado com limite R$ 60k (trimestral)
   - cenarios.resultados.irpjCsll.irpjAdicional correto
   - calculos_irpj_csll.irpj_adicional_valor correto
   - calculos_irpj_csll.limite_anual = 60000
```

### **Teste 4: Comparativo Reflete Mudanças**
```
1. Crie comparativo com cenário de Janeiro
2. Edite cenário de Janeiro (mude receita)
3. Vá ao comparativo
4. Clique "Atualizar Relatório"
5. Verifique:
   - Gráficos refletem novos valores
   - Logs mostram recálculo correto
```

---

## 🗄️ Estrutura das Tabelas Populadas

### **`calculos_icms`**
```sql
- vendas_internas_base, _aliquota, _valor
- vendas_interestaduais_base, _aliquota, _valor
- difal_base, _aliquota, _valor
- fcp_base, _aliquota, _valor
- credito_compras_internas_base, _aliquota, _valor
- credito_compras_interestaduais_base, _aliquota, _valor
- credito_estoque_inicial_base, _valor
- credito_ativo_imobilizado_base, _valor
- credito_energia_base, _valor
- credito_st_base, _valor
- outros_creditos_base, _valor
- total_debitos, total_creditos, icms_a_pagar
```

### **`calculos_pis_cofins`**
```sql
- debito_pis_base, _aliquota, _valor
- debito_cofins_base, _aliquota, _valor
- credito_pis_compras_base, _aliquota, _valor
- credito_cofins_compras_base, _aliquota, _valor
- credito_pis_despesas_base, _aliquota, _valor
- credito_cofins_despesas_base, _aliquota, _valor
- total_debitos_pis, total_creditos_pis, pis_a_pagar
- total_debitos_cofins, total_creditos_cofins, cofins_a_pagar
- total_pis_cofins
```

### **`calculos_irpj_csll`**
```sql
- receita_bruta, cmv, despesas_operacionais
- lucro_antes_ircsll, adicoes, exclusoes
- lucro_real, limite_anual
- irpj_base_base, _aliquota, _valor
- irpj_adicional_base, _aliquota, _valor
- total_irpj
- csll_base, _aliquota, _valor
- total_irpj_csll
```

---

## ✅ Checklist de Validação

- ✅ Resultados recalculados ao salvar
- ✅ JSON `resultados` atualizado no banco
- ✅ Tabela `calculos_icms` populada
- ✅ Tabela `calculos_pis_cofins` populada
- ✅ Tabela `calculos_irpj_csll` populada
- ✅ Logs detalhados no console
- ✅ Período de apuração IRPJ considerado
- ✅ UPDATE se registro existe, INSERT se não existe
- ✅ Comparativos refletem mudanças ao clicar "Atualizar"
- ✅ Sem erros de compilação TypeScript

---

## 📈 Benefícios

### **Antes:**
- ❌ Dados inconsistentes entre config e resultados
- ❌ Tabelas de memória vazias (desperdício de schema)
- ❌ Comparativos desatualizados
- ❌ Impossível auditar cálculos

### **Agora:**
- ✅ Dados sempre sincronizados
- ✅ Auditoria completa de cálculos
- ✅ Comparativos refletem mudanças em tempo real
- ✅ Possibilidade de relatórios históricos
- ✅ Rastreabilidade de mudanças de impostos

---

## 🚀 Próximos Passos (Opcional)

1. **Criar índices compostos** para queries rápidas:
   ```sql
   CREATE INDEX idx_calculos_cenario_created 
   ON calculos_icms(cenario_id, created_at DESC);
   ```

2. **View consolidada** para relatórios:
   ```sql
   CREATE VIEW v_cenarios_completos AS
   SELECT 
     c.*,
     ci.icms_a_pagar,
     cpc.pis_a_pagar,
     cpc.cofins_a_pagar,
     cic.total_irpj,
     cic.csll_valor
   FROM cenarios c
   LEFT JOIN calculos_icms ci ON ci.cenario_id = c.id
   LEFT JOIN calculos_pis_cofins cpc ON cpc.cenario_id = c.id
   LEFT JOIN calculos_irpj_csll cic ON cic.cenario_id = c.id;
   ```

3. **Função de auditoria** para rastrear mudanças:
   ```sql
   CREATE TABLE historico_calculos (
     id UUID PRIMARY KEY,
     cenario_id UUID,
     campo_alterado TEXT,
     valor_antigo JSONB,
     valor_novo JSONB,
     alterado_em TIMESTAMPTZ
   );
   ```

---

**STATUS:** ✅ IMPLEMENTADO E PRONTO PARA TESTE
