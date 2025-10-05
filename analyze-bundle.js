#!/usr/bin/env node

/**
 * 📊 BUNDLE ANALYZER - SCRIPT DE ANÁLISE RÁPIDA
 * 
 * Executa análise do bundle e abre relatórios automaticamente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO ANÁLISE DO BUNDLE...\n');

// Definir ambiente
process.env.ANALYZE = 'true';

try {
  console.log('📦 Executando build com análise...');
  
  // Executar build com análise
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, ANALYZE: 'true' }
  });
  
  console.log('\n✅ Build completado com sucesso!');
  
  // Verificar relatórios gerados
  const analyzeDir = path.join(process.cwd(), '.next', 'analyze');
  
  if (fs.existsSync(analyzeDir)) {
    console.log('\n📈 RELATÓRIOS GERADOS:');
    
    const files = fs.readdirSync(analyzeDir);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const filePath = path.join(analyzeDir, file);
        console.log(`   • ${file} (${(fs.statSync(filePath).size / 1024).toFixed(1)}KB)`);
      }
    });
    
    // Abrir relatórios no Windows
    if (process.platform === 'win32') {
      console.log('\n🌐 Abrindo relatórios no navegador...');
      
      files.forEach(file => {
        if (file.endsWith('.html')) {
          const filePath = path.join(analyzeDir, file);
          try {
            execSync(`start ${filePath}`, { stdio: 'ignore' });
          } catch (error) {
            console.log(`   ⚠️ Erro ao abrir ${file}`);
          }
        }
      });
    } else {
      console.log('\n📁 Relatórios disponíveis em: .next/analyze/');
    }
    
  } else {
    console.log('\n⚠️ Diretório de análise não encontrado');
  }
  
} catch (error) {
  console.error('\n❌ ERRO DURANTE A ANÁLISE:');
  console.error(error.message);
  
  // Verificar se há relatórios parciais
  const analyzeDir = path.join(process.cwd(), '.next', 'analyze');
  if (fs.existsSync(analyzeDir)) {
    console.log('\n📊 Relatórios parciais disponíveis:');
    const files = fs.readdirSync(analyzeDir);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        console.log(`   • .next/analyze/${file}`);
      }
    });
    
    console.log('\n💡 Execute: npm run analyze-view para ver relatórios');
  }
}

console.log('\n📋 COMANDOS ÚTEIS:');
console.log('   npm run analyze          - Nova análise completa');
console.log('   npm run analyze-view     - Ver relatórios existentes');
console.log('   node analyze-bundle.js   - Este script');

console.log('\n🔍 Para análise manual:');
console.log('   1. Abra .next/analyze/nodejs.html');
console.log('   2. Procure chunks > 200kB');
console.log('   3. Identifique bibliotecas não utilizadas');
console.log('   4. Verifique duplicações de código\n');