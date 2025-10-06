# 🧪 TESTE: Edição de Despesas Dinâmicas

## 📋 Passo a Passo

### 1. Abra o Console do Navegador
- Pressione **F12** ou **Ctrl+Shift+I**
- Vá na aba **Console**
- Limpe o console (ícone 🚫 ou Ctrl+L)

### 2. Abra um Cenário Existente
- Acesse: `http://localhost:3000/empresas/{empresa_id}/cenarios/{cenario_id}`
- Exemplo: `http://localhost:3000/empresas/123/cenarios/abc`

### 3. Edite uma Despesa
1. Clique na aba **"Configurações"**
2. Vá na aba **"PIS/COFINS"**
3. Procure uma despesa existente (ex: "Energia Elétrica")
4. Clique no ícone ✏️ (Editar)
5. Altere o valor (ex: de R$ 15.000 para R$ 18.000)
6. Clique em **"Salvar Alterações"** (modal azul)

### 4. Salve o Cenário
- Clique no botão **"Salvar"** (botão principal da página, com ícone 💾)

### 5. Verifique os Logs

Você **DEVE** ver no console:

```
═══════════════════════════════════════════════════════════
🚀 [UPDATE CENÁRIO] INÍCIO DA FUNÇÃO
═══════════════════════════════════════════════════════════
🔑 ID do cenário: abc-123-def
📦 Dados recebidos: {
  "nome": "Janeiro",
  "descricao": "Cenário de janeiro",
  "configuracao": {
    "receitaBruta": 1000000,
    "despesasDinamicas": [
      {
        "id": "despesa-123",
        "descricao": "Energia Elétrica",
        "valor": 18000,
        "tipo": "despesa",
        "credito": "com-credito"
      }
    ]
  }
}
🔍 Tem configuracao? true
🔍 Tem despesasDinamicas? true
🔍 Quantidade de despesas: 1

╔════════════════════════════════════════════════════════════╗
║  SINCRONIZAÇÃO DE DESPESAS DINÂMICAS                      ║
╚════════════════════════════════════════════════════════════╝
✅ Configuração foi alterada! Iniciando sincronização...
💼 Despesas encontradas na configuração: 1
📋 Lista de despesas:
   1. Energia Elétrica - R$ 18000 (com-credito)

🗑️  PASSO 1: Deletando despesas antigas...
   Cenário ID: abc-123-def
✅ Despesas antigas deletadas com sucesso!

💾 PASSO 2: Inserindo despesas atualizadas...
📤 Dados que serão inseridos:
[
  {
    "cenario_id": "abc-123-def",
    "descricao": "Energia Elétrica",
    "valor": 18000,
    "tipo": "despesa",
    "credito": "com-credito",
    "categoria": null
  }
]
✅ SUCESSO! 1 despesas inseridas na tabela despesas_dinamicas
═══════════════════════════════════════════════════════════
```

---

## ❌ Se NÃO aparecer os logs

### Problema 1: Função não está sendo chamada
**Verifique:**
- O botão "Salvar" está funcionando?
- Aparece algum erro no console?
- A página está conectada ao Supabase?

### Problema 2: Configuração não está sendo enviada
**Logs esperados:**
```
🔍 Tem configuracao? false  ❌ PROBLEMA AQUI!
```

**Causa:** O `useTaxStore` não está retornando a configuração correta

**Solução:** Verificar se `config` está sendo passado corretamente em `page.tsx`

### Problema 3: despesasDinamicas está vazio
**Logs esperados:**
```
💼 Despesas encontradas na configuração: 0  ❌ PROBLEMA AQUI!
```

**Causa:** As despesas não estão no objeto `config.despesasDinamicas`

**Solução:** Verificar se `handleEditDespesa` está atualizando corretamente

---

## ✅ Como Confirmar que Funcionou

### 1. Verificar no Supabase (opcional)
Vá em: https://supabase.com/dashboard/project/lxuqcscagoxgpowovxnz/editor

Execute:
```sql
SELECT * FROM despesas_dinamicas 
WHERE cenario_id = 'SEU_CENARIO_ID'
ORDER BY created_at DESC;
```

Você deve ver suas despesas atualizadas!

### 2. Verificar no Comparativo
1. Vá em **"Análise Comparativa"**
2. Selecione a empresa e os meses
3. Gere o comparativo
4. Veja os logs no console:

```
💳 [CRÉDITOS] Cenário Janeiro:
   • Despesas com crédito: R$ 18.000,00
   • Crédito PIS (1,65%): R$ 297,00
   • Crédito COFINS (7,6%): R$ 1.368,00
   • Total créditos: R$ 2.665,00
```

---

## 📸 Me envie um print do console!

Se os logs não aparecerem, tire um print do console e me mostre para eu ajudar a debugar.
