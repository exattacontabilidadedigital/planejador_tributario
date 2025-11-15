# Relatório de Testes MCP Testsprite — Tax Planner React

## Metadados
- Projeto: tax-planner-react
- Endpoint local: http://localhost:3001/
- Data: 2025-11-13
- Ambiente: Next.js 15, Node >=18, Porta 3001
- Escopo: Frontend (App Router)

## Sumário Executivo
- Planejamento de testes gerado e ambiente verificado. Execução automatizada foi iniciada em produção, porém não há arquivo bruto `raw_report.md` disponível para anexar evidências. Este relatório classifica os casos por requisitos e consolida o plano para acompanhamento.

## Requisitos e Casos de Teste

### R1. Cálculos Tributários (ICMS, PIS/COFINS, IRPJ/CSLL)
- TC001 — ICMS: validar cálculos padrão, regimes especiais e ST
- TC002 — PIS/COFINS: múltiplos regimes e casos de borda
- TC003 — IRPJ/CSLL: bases tributáveis e alíquotas diversas
Status: Executado (sem evidência anexada); requer reexecução para coleta de evidências

### R2. Importação CSV e Memórias de Cálculo
- TC004 — Importar CSV com despesas com/sem crédito; erros em CSV inválido
Status: Executado (sem evidência anexada)

### R3. DRE Dinâmica e Indicadores
- TC005 — DRE dinâmica por cenário
Status: Executado (sem evidência anexada)

### R4. Gestão de Cenários (CRUD e Comparação)
- TC006 — Criar, renomear, salvar, comparar e excluir cenários
Status: Executado (sem evidência anexada)

### R5. Exportação PDF
- TC007 — Exportar relatório completo com gráficos e memórias
Status: Executado (sem evidência anexada)

### R6. Persistência Local
- TC008 — Persistência em localStorage entre sessões
Status: Executado (sem evidência anexada)

### R7. Tema (Dark/Light)
- TC009 — Alternância de tema e consistência visual
Status: Executado (sem evidência anexada)

### R8. Validações de Inputs Financeiros
- TC010 — Formatos de moeda/percentual, erros e campos obrigatórios
Status: Executado (sem evidência anexada)

### R9. Performance e Responsividade
- TC011 — Cenários grandes, debounce, memoização e lazy loading
Status: Executado (sem evidência anexada)

### R10. Tratamento de Erros na Importação
- TC012 — Rejeitar formatos não suportados e dados corrompidos
Status: Executado (sem evidência anexada)

### R11. Gráficos e Atualizações Dinâmicas
- TC013 — Carga tributária, comparação de impostos/lucros, composição e evolução
Status: Executado (sem evidência anexada)

### R12. Hooks e Memoização
- TC014 — Recalcular corretamente e evitar processamento redundante
Status: Executado (sem evidência anexada)

### R13. Integração Supabase
- TC015 — Sincronização bidirecional sem perdas e conflitos
Status: Executado (sem evidência anexada)

## Observações de Ambiente
- Dev: houve `SyntaxError: Invalid or unexpected token` e `GET /@vite/client 404`; não há referências a Vite no código e o erro não impacta produção.
- Produção: `npx next start -p 3001` rodou estável e pronto; o preview do IDE sinalizou `ERR_CONNECTION_REFUSED`, possivelmente restrição do webview.

## Execução Reexecutada (Evidências)
- Servidor produção ativo em `http://localhost:3001/` durante a coleta.
- Comando de execução `generateCodeAndExecute` finalizou com sucesso.
- A ferramenta não gerou `testsprite_tests/tmp/raw_report.md` nesta execução; evidências detalhadas pendentes de geração automática.
- Próxima ação: reexecutar coleta com o servidor ativo e garantir permissão de escrita no diretório `testsprite_tests/tmp/`.

## Ações Recomendadas
- Manter servidor em produção ativo (`npx next start -p 3001`) durante a coleta de evidências.
- Reexecutar `generateCodeAndExecute` para capturar `tmp/raw_report.md` e anexar resultados ao relatório.
- Validar cenários críticos: ICMS ST, regimes especiais, importação CSV malformada e exportação PDF com dados mínimos.

## Artefatos Relacionados
- Plano de testes: `testsprite_tests/testsprite_frontend_test_plan.json`
- Sumário de código: `testsprite_tests/tmp/code_summary.json`
- PRD padronizado: `testsprite_tests/standard_prd.json`
