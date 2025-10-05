#!/usr/bin/env node

/**
 * 📊 ANÁLISE ESPECÍFICA - CHART.JS CHUNK ISOLADO
 * 
 * Script para verificar se Chart.js está corretamente isolado em chunk separado
 */

const fs = require('fs');
const path = require('path');

console.log('📊 VERIFICANDO ISOLAMENTO DO CHART.JS CHUNK...\n');

// Verifica se o bundle analyzer rodou
const analyzeDir = path.join(process.cwd(), '.next', 'analyze');

if (!fs.existsSync(analyzeDir)) {
  console.log('❌ Diretório de análise não encontrado!');
  console.log('💡 Execute: npm run analyze para gerar relatórios\n');
  process.exit(1);
}

let chartjsFound = false;
let lucideFound = false;
let documentsFound = false;

// Verifica arquivos de bundle
const buildDir = path.join(process.cwd(), '.next', 'static', 'chunks');

if (fs.existsSync(buildDir)) {
  console.log('📦 CHUNKS ENCONTRADOS:');
  
  const chunks = fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.js'))
    .sort();
  
  chunks.forEach(chunk => {
    const filePath = path.join(buildDir, chunk);
    const size = (fs.statSync(filePath).size / 1024).toFixed(1);
    
    // Verificar se contém Chart.js
    if (chunk.includes('chartjs') || chunk.includes('chart')) {
      console.log(`   📊 ${chunk} (${size}KB) - CHART.JS CHUNK ✅`);
      chartjsFound = true;
    }
    // Verificar outros chunks importantes
    else if (chunk.includes('lucide')) {
      console.log(`   🎨 ${chunk} (${size}KB) - LUCIDE ICONS`);
      lucideFound = true;
    }
    else if (chunk.includes('documents') || chunk.includes('pdf')) {
      console.log(`   📄 ${chunk} (${size}KB) - DOCUMENTS`);
      documentsFound = true;
    }
    else if (chunk.includes('recharts')) {
      console.log(`   📈 ${chunk} (${size}KB) - RECHARTS`);
    }
    else if (parseFloat(size) > 100) {
      console.log(`   📦 ${chunk} (${size}KB)`);
    }
  });
  
  console.log('\n🎯 VERIFICAÇÃO DE ISOLAMENTO:');
  console.log(`   Chart.js Chunk: ${chartjsFound ? '✅ ISOLADO' : '❌ NÃO ENCONTRADO'}`);
  console.log(`   Lucide Icons: ${lucideFound ? '✅ SEPARADO' : '⚠️ NO VENDOR'}`);
  console.log(`   Documents: ${documentsFound ? '✅ SEPARADO' : '⚠️ NO VENDOR'}`);
  
} else {
  console.log('⚠️ Diretório de chunks não encontrado - build não executado');
}

// Verifica configuração webpack
console.log('\n⚙️ VERIFICANDO CONFIGURAÇÃO WEBPACK:');

const configPath = path.join(process.cwd(), 'next.config.ts');
if (fs.existsSync(configPath)) {
  const config = fs.readFileSync(configPath, 'utf8');
  
  if (config.includes('chartjs')) {
    console.log('   ✅ Configuração Chart.js encontrada');
  } else {
    console.log('   ❌ Configuração Chart.js não encontrada');
  }
  
  if (config.includes('enforce: true')) {
    console.log('   ✅ Enforce: true configurado');
  } else {
    console.log('   ⚠️ Enforce: true recomendado para isolamento');
  }
  
  if (config.includes('priority: 40')) {
    console.log('   ✅ Alta prioridade para Chart.js chunk');
  } else {
    console.log('   ⚠️ Prioridade alta recomendada');
  }
}

// Análise dos relatórios HTML se disponíveis
console.log('\n📊 RELATÓRIOS BUNDLE ANALYZER:');

const reports = ['nodejs.html', 'edge.html'];
reports.forEach(report => {
  const reportPath = path.join(analyzeDir, report);
  if (fs.existsSync(reportPath)) {
    const size = (fs.statSync(reportPath).size / 1024).toFixed(1);
    console.log(`   📊 ${report} (${size}KB) - Disponível`);
  }
});

console.log('\n💡 PARA ANÁLISE DETALHADA:');
console.log('   1. Abra os relatórios HTML no navegador');
console.log('   2. Procure por "chartjs" nos chunks');
console.log('   3. Verifique se está separado do vendor bundle');
console.log('   4. Confirme o tamanho do chunk Chart.js');

console.log('\n📋 PRÓXIMOS PASSOS:');
if (!chartjsFound) {
  console.log('   🔧 Execute novo build para aplicar configurações');
  console.log('   📊 Verifique configuração webpack no next.config.ts');
} else {
  console.log('   ✅ Chart.js está isolado corretamente!');
  console.log('   📈 Monitor performance em produção');
}

console.log('\n🎯 STATUS CHART.JS CHUNK: ' + (chartjsFound ? '✅ ISOLADO' : '⚠️ PRECISA BUILD'));
