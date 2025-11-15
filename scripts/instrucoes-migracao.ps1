## ============================================================================
## INSTRUÇÕES: Migração de Compartilhamento Público
## ============================================================================

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "  MIGRAÇÃO: Compartilhamento Público de Relatórios" -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan

Write-Host "`n📋 PASSO 1: Copiar SQL para Área de Transferência" -ForegroundColor Green
Write-Host "------------------------------------------------`n"

$sqlPath = "supabase\migrations\add_compartilhamento_publico.sql"

if (Test-Path $sqlPath) {
    Get-Content $sqlPath | Set-Clipboard
    Write-Host "✅ SQL copiado para área de transferência!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo não encontrado: $sqlPath`n" -ForegroundColor Red
    exit 1
}

Write-Host "📋 PASSO 2: Executar no Supabase" -ForegroundColor Green
Write-Host "------------------------------------------------`n"

Write-Host "1. Acesse: " -NoNewline
Write-Host "https://supabase.com/dashboard" -ForegroundColor Cyan

Write-Host "`n2. Selecione seu projeto: " -NoNewline
Write-Host "planejador_tributario" -ForegroundColor Cyan

Write-Host "`n3. Clique em: " -NoNewline
Write-Host "SQL Editor" -ForegroundColor Cyan -NoNewline
Write-Host " (menu lateral esquerdo)"

Write-Host "`n4. Clique em: " -NoNewline
Write-Host "New Query" -ForegroundColor Cyan

Write-Host "`n5. Cole o SQL (Ctrl+V) e clique em: " -NoNewline
Write-Host "Run" -ForegroundColor Yellow

Write-Host "`n`n📊 O QUE SERÁ CRIADO:" -ForegroundColor Green
Write-Host "------------------------------------------------`n"

Write-Host "✓ Coluna: " -NoNewline -ForegroundColor Green
Write-Host "token_compartilhamento" -ForegroundColor White -NoNewline
Write-Host " (VARCHAR 64)"

Write-Host "`n✓ Coluna: " -NoNewline -ForegroundColor Green
Write-Host "token_expira_em" -ForegroundColor White -NoNewline
Write-Host " (TIMESTAMP)"

Write-Host "`n✓ Coluna: " -NoNewline -ForegroundColor Green
Write-Host "visualizacoes_publicas" -ForegroundColor White -NoNewline
Write-Host " (INTEGER)"

Write-Host "`n✓ Função: " -NoNewline -ForegroundColor Green
Write-Host "gerar_token_compartilhamento()" -ForegroundColor White

Write-Host "`n✓ Função: " -NoNewline -ForegroundColor Green
Write-Host "ativar_compartilhamento_publico()" -ForegroundColor White

Write-Host "`n✓ Função: " -NoNewline -ForegroundColor Green
Write-Host "desativar_compartilhamento_publico()" -ForegroundColor White

Write-Host "`n✓ Função: " -NoNewline -ForegroundColor Green
Write-Host "buscar_comparativo_publico()" -ForegroundColor White

Write-Host "`n✓ Política RLS para acesso público aos links compartilhados" -ForegroundColor Green

Write-Host "`n`n⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "------------------------------------------------`n"

Write-Host "• A migração é " -NoNewline
Write-Host "SEGURA" -ForegroundColor Green -NoNewline
Write-Host " e não altera dados existentes"

Write-Host "`n• Usa " -NoNewline
Write-Host "IF NOT EXISTS" -ForegroundColor Cyan -NoNewline
Write-Host " para evitar erros se já executada"

Write-Host "`n• Adiciona apenas novas colunas e funções auxiliares"

Write-Host "`n`n🎉 APÓS A MIGRAÇÃO:" -ForegroundColor Green
Write-Host "------------------------------------------------`n"

Write-Host "1. Recarregue a aplicação (F5)"
Write-Host "2. Abra um relatório comparativo"
Write-Host "3. Clique em 'Compartilhar Relatório'"
Write-Host "4. Link público será gerado automaticamente!"

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "  Pressione qualquer tecla para continuar..." -ForegroundColor Gray
Write-Host "===========================================================" -ForegroundColor Cyan

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
