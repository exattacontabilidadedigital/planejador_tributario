# 🧪 TESTE DE ATUALIZAÇÃO (EDIÇÃO) DE DADOS

## ✅ O QUE FOI CORRIGIDO:

1. **Serviço `comparativos-supabase.ts`**:
   - Corrigido `atualizarDados()` para aceitar campos parciais
   - Adicionados logs detalhados

2. **Store `regimes-tributarios-store.ts`**:
   - Adicionados logs em `atualizarDadoComparativo()`

3. **Formulário `formulario-comparativos.tsx`**:
   - Adicionados logs para rastrear modo edição

4. **Teste direto no banco**:
   - ✅ UPDATE funcionando perfeitamente
   - Janeiro atualizado de R$ 7.000 para R$ 8.650

---

## 📋 COMO TESTAR NA INTERFACE

### Passo 1: Abrir a aplicação
1. O servidor já está rodando em: http://localhost:3000
2. Abra o navegador nesta URL
3. **Pressione F12** para abrir o Console do DevTools

### Passo 2: Navegar até Comparativos
1. Clique em **"Empresas"**
2. Clique em **"RB ACESSÓRIOS"**
3. Clique em **"Comparativos"**
4. Clique na aba **"Listagem"**

### Passo 3: Editar um registro existente
1. Localize o registro de **Janeiro/2025** (ou qualquer mês)
2. Clique no botão **"Editar"** (ícone de lápis)
3. O formulário abrirá preenchido com os dados atuais
4. **Mude alguns valores**, por exemplo:
   - ICMS: de R$ 4.140,00 para R$ 6.000,00
   - PIS: de R$ 990,00 para R$ 1.500,00
   - Observações: "Teste de atualização via interface"
5. Clique em **"Salvar e Sair"**

### Passo 4: Verificar o Console
**Logs esperados de SUCESSO:**

```
📝 [FORMULARIO] useEffect disparado - modoEdicao: true
🔄 [FORMULARIO] Modo EDIÇÃO detectado!
🔄 [FORMULARIO] ID do registro: eb96a66a-5bdc-43f4-89e0-ae7a4563f50d
🔄 [FORMULARIO] Chamando atualizarDadoComparativo...
🏪 [STORE] Iniciando atualizarDadoComparativo
🏪 [STORE] ID recebido: eb96a66a-5bdc-43f4-89e0-ae7a4563f50d
🏪 [STORE] Chamando comparativosService.atualizarDados...
🔄 [COMPARATIVOS-SERVICE] atualizarDados - ID: eb96a66a-5bdc-43f4-89e0-ae7a4563f50d
🔄 [COMPARATIVOS-SERVICE] Dados convertidos para Supabase: {...}
📤 [COMPARATIVOS-SERVICE] Enviando UPDATE para Supabase...
📝 [COMPARATIVOS-SERVICE] Resposta do UPDATE - data: {...}
✅ [COMPARATIVOS-SERVICE] Dados atualizados com sucesso
✅ [STORE] Atualização concluída com sucesso!
✅ [FORMULARIO] atualizarDadoComparativo retornou com sucesso
```

**Se aparecer erro:**
Copie TODA a mensagem de erro e me envie

### Passo 5: Verificar se salvou
1. Volte para a aba **"Listagem"**
2. Verifique se os valores mudaram
3. Se quiser confirmar no banco, execute:

```bash
node verificar-dados-atualizados.js
```

---

## 🐛 POSSÍVEIS PROBLEMAS

### Problema 1: "Dados atualizados" mas valores não mudaram
**Causa:** Cache do navegador ou estado da store não atualizou
**Solução:** 
- Pressione Ctrl+Shift+R (hard refresh)
- Verifique o banco com o script

### Problema 2: Erro "id is undefined"
**Causa:** `dadosIniciais.id` não está sendo passado
**Solução:** Verificar componente que chama o formulário

### Problema 3: Erro 23505 (duplicate key)
**Causa:** Tentando mudar mês/ano/regime para combinação que já existe
**Solução:** Não mude esses campos durante a edição

### Problema 4: Nenhum log aparece
**Causa:** Console está filtrado ou aplicação não recarregou
**Solução:**
- Verifique se o console mostra logs (não está filtrado)
- Restart o servidor: Ctrl+C e depois `npm run dev`

---

## 📊 VERIFICAR NO BANCO

Após testar, execute este script para verificar:

```bash
node verificar-dados-atualizados.js
```

Ou verifique direto com SQL no Supabase Dashboard:

```sql
SELECT 
  mes, 
  regime, 
  receita, 
  icms, 
  pis, 
  observacoes,
  atualizado_em
FROM dados_comparativos_mensais
WHERE empresa_id = '825e24e2-ad3a-4111-91ad-d53f3dcb990a'
  AND regime = 'lucro_presumido'
  AND ano = 2025
ORDER BY mes;
```

---

## ✅ CHECKLIST

- [ ] Aplicação aberta no navegador
- [ ] Console DevTools aberto (F12)
- [ ] Navegou até Comparativos → Listagem
- [ ] Clicou em "Editar" em um registro
- [ ] Formulário abriu preenchido
- [ ] Mudou valores
- [ ] Clicou em "Salvar e Sair"
- [ ] Verificou logs no console
- [ ] Toast de sucesso apareceu
- [ ] Valores mudaram na listagem
- [ ] Executou script de verificação

---

## 📸 O QUE ENVIAR SE DER ERRO

1. **Print do console** com todos os logs
2. **Mensagem de erro completa** (copiar e colar)
3. **Valores que tentou salvar**
4. **Me dizer se**:
   - Toast de sucesso apareceu?
   - Valores mudaram na listagem?
   - Script de verificação mostrou valores antigos ou novos?

---

## 🎯 RESULTADO ESPERADO

✅ Toast: "Dados atualizados com sucesso"
✅ Valores mudaram na listagem
✅ Script mostra novos valores
✅ Campo `atualizado_em` com timestamp recente
