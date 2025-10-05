#!/usr/bin/env node

/**
 * 🌐 BUNDLE ANALYZER - VISUALIZADOR DE RELATÓRIOS
 * 
 * Abre relatórios existentes sem executar novo build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📈 VISUALIZADOR DE RELATÓRIOS DO BUNDLE\n');

const analyzeDir = path.join(process.cwd(), '.next', 'analyze');

if (!fs.existsSync(analyzeDir)) {
  console.log('❌ Nenhum relatório encontrado!');
  console.log('💡 Execute primeiro: npm run analyze\n');
  process.exit(1);
}

const files = fs.readdirSync(analyzeDir).filter(file => file.endsWith('.html'));

if (files.length === 0) {
  console.log('❌ Nenhum relatório HTML encontrado!');
  console.log('💡 Execute: npm run analyze para gerar relatórios\n');
  process.exit(1);
}

console.log('📊 RELATÓRIOS DISPONÍVEIS:');
files.forEach((file, index) => {
  const filePath = path.join(analyzeDir, file);
  const size = (fs.statSync(filePath).size / 1024).toFixed(1);
  console.log(`   ${index + 1}. ${file} (${size}KB)`);
});

// No Windows, abrir automaticamente
if (process.platform === 'win32') {
  console.log('\n🌐 Abrindo relatórios no navegador...');
  
  files.forEach(file => {
    const filePath = path.join(analyzeDir, file);
    try {
      execSync(`start "${filePath}"`, { stdio: 'ignore' });
      console.log(`   ✅ Aberto: ${file}`);
    } catch (error) {
      console.log(`   ❌ Erro ao abrir: ${file}`);
    }
  });
  
} else {
  console.log('\n📁 Caminho dos relatórios:');
  files.forEach(file => {
    console.log(`   ${path.join(analyzeDir, file)}`);
  });
}

console.log('\n🔍 COMO ANALISAR:');
console.log('   • Procure chunks > 200kB (vermelho/laranja)');
console.log('   • Identifique bibliotecas duplicadas');
console.log('   • Verifique vendor chunks muito grandes');
console.log('   • Analise page chunks específicos');

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('   1. Identificar os maiores problemas');
console.log('   2. Implementar lazy loading específico');
console.log('   3. Otimizar imports (tree shaking)');
console.log('   4. Configurar webpack splits');