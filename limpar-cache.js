#!/usr/bin/env node

/**
 * Script para forçar rebuild do Next.js e limpar cache
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('\n╔══════════════════════════════════════════════════════════════╗')
console.log('║  FORÇAR REBUILD - Limpar Cache e Reconstruir               ║')
console.log('╚══════════════════════════════════════════════════════════════╝\n')

try {
  // 1. Limpar pasta .next
  console.log('🗑️  [1/4] Limpando pasta .next...')
  const nextDir = path.join(__dirname, '.next')
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true })
    console.log('✅ Pasta .next removida')
  } else {
    console.log('⚠️  Pasta .next não existe')
  }

  // 2. Limpar cache do TypeScript
  console.log('\n🗑️  [2/4] Limpando cache do TypeScript...')
  const tsBuildInfo = path.join(__dirname, 'tsconfig.tsbuildinfo')
  if (fs.existsSync(tsBuildInfo)) {
    fs.unlinkSync(tsBuildInfo)
    console.log('✅ tsconfig.tsbuildinfo removido')
  }

  // 3. Limpar node_modules/.cache (se existir)
  console.log('\n🗑️  [3/4] Limpando node_modules/.cache...')
  const cacheDir = path.join(__dirname, 'node_modules', '.cache')
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true })
    console.log('✅ Cache do node_modules limpo')
  }

  // 4. Reconstruir
  console.log('\n🔨 [4/4] Reconstruindo aplicação...')
  console.log('⏳ Isso pode levar alguns segundos...\n')
  
  // Apenas mostrar mensagem, não executar (usuário deve fazer manualmente)
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║  PRÓXIMO PASSO: Reiniciar o servidor de desenvolvimento    ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  console.log('Execute o comando:')
  console.log('   npm run dev\n')
  console.log('Ou se já estiver rodando, pare (Ctrl+C) e inicie novamente.\n')

  console.log('═══════════════════════════════════════════════════════════════')
  console.log('✅ Cache limpo com sucesso!')
  console.log('═══════════════════════════════════════════════════════════════\n')

} catch (error) {
  console.error('\n❌ Erro ao limpar cache:', error.message)
  process.exit(1)
}
