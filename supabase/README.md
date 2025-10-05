# 🗄️ Schema Supabase - Tax Planner React

Schema completo dividido em arquivos organizados para facilitar manutenção e execução.

## 📁 Estrutura dos Arquivos

| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| `01-tables.sql` | **10 tabelas principais** (empresas, cenários, cálculos, etc.) | ~300 linhas |
| `02-indexes.sql` | **Índices otimizados** para performance | ~35 linhas |
| `03-functions.sql` | **Funções auxiliares** e validações | ~180 linhas |
| `04-triggers.sql` | **Triggers automáticos** para updated_at | ~70 linhas |
| `05-views.sql` | **Views úteis** para consultas complexas | ~100 linhas |
| `06-data.sql` | **Dados iniciais** e configurações | ~80 linhas |
| `setup.sql` | **Script principal** com verificações | ~60 linhas |

## 🚀 Como Executar

### Opção 1: Execução Individual (Recomendado)
No Supabase Dashboard → SQL Editor, execute **SEMPRE NA ORDEM**:

```sql
-- 1. Criar tabelas PRIMEIRO
-- Execute: 01-tables.sql

-- 2. Criar índices (protegido contra erros)
-- Execute: 02-indexes.sql

-- 3. Criar funções e validações
-- Execute: 03-functions.sql

-- 4. Criar triggers (protegido)
-- Execute: 04-triggers.sql

-- 5. Criar views (protegido)
-- Execute: 05-views.sql

-- 6. Inserir dados iniciais
-- Execute: 06-data.sql
```

### Opção 2: Verificação Rápida
Execute `setup.sql` para verificar se tudo foi criado corretamente.

## ⚠️ **IMPORTANTE - Ordem de Execução**

**SEMPRE execute `01-tables.sql` PRIMEIRO!** Os outros arquivos dependem das tabelas existirem.

Se você receber erro `column "status" does not exist`:
1. Execute `01-tables.sql` primeiro
2. Aguarde a conclusão
3. Execute os demais arquivos

## ✅ Verificação Pós-Execução

Após executar todos os scripts, você deve ter:

- ✅ **10 tabelas** criadas
- ✅ **30+ índices** para performance  
- ✅ **5 funções** auxiliares
- ✅ **10 triggers** automáticos
- ✅ **3 views** otimizadas
- ✅ **Dados de exemplo** inseridos

## 🔧 Vantagens da Divisão

1. **📝 Manutenção**: Fácil localizar e editar componentes específicos
2. **🐛 Debug**: Executar partes individuais para identificar problemas
3. **⚡ Performance**: Executar apenas o que precisa ser atualizado
4. **👥 Colaboração**: Múltiplos desenvolvedores podem trabalhar em paralelo
5. **📚 Organização**: Código mais limpo e documentado

## 🚨 Importante

- Execute **sempre na ordem** indicada (dependências entre arquivos)
- Verifique **logs de erro** após cada execução
- Use `setup.sql` para **verificar** se tudo foi criado
- Todos os scripts são **idempotentes** (podem ser executados múltiplas vezes)

## 📊 Tabelas Criadas

| Tabela | Função |
|--------|--------|
| `empresas` | Dados das empresas |
| `cenarios` | Cenários tributários |
| `comparativos` | Comparações entre cenários |
| `despesas_dinamicas` | Despesas variáveis |
| `calculos_icms` | Memória de cálculo ICMS |
| `calculos_pis_cofins` | Memória de cálculo PIS/COFINS |
| `calculos_irpj_csll` | Memória de cálculo IRPJ/CSLL |
| `calculos_dre` | Demonstração do Resultado |
| `relatorios_consolidados` | Cache de relatórios |
| `configuracoes_sistema` | Configurações globais |