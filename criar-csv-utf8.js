const fs = require('fs');
const path = require('path');

// Conteúdo CSV - caracteres acentuados em Unicode escape para garantir
const csvContent = `descricao;valor;tipo;categoria
Energia;15.000,00;despesa;
Sal\u00E1rios e Encargos (PF);80.000,00;despesa;
Energia El\u00E9trica;15.000,00;despesa;
Alugu\u00E9is;25.000,00;despesa;
Arrendamento Mercantil;10.000,00;despesa;
Frete e Armazenagem;8.000,00;despesa;
Deprecia\u00E7\u00E3o de M\u00E1quinas;12.000,00;despesa;
Combust\u00EDveis (Empresariais);5.000,00;despesa;
Vale Transporte;3.000,00;despesa;
Vale Alimenta\u00E7\u00E3o;15.000,00;despesa;
Combust\u00EDvel Passeio;3.000,00;despesa;
Outras Despesas;35.000,00;despesa;`;

// BOM UTF-8: EF BB BF em bytes
const BOM = Buffer.from([0xEF, 0xBB, 0xBF]);
const contentBuffer = Buffer.from(csvContent, 'utf8');
const finalBuffer = Buffer.concat([BOM, contentBuffer]);

// Salva arquivo
const filePath = path.join(__dirname, 'teste-importacao-despesas-utf8.csv');
fs.writeFileSync(filePath, finalBuffer);

console.log('✅ Arquivo CSV criado com sucesso!');
console.log('📁 Localização:', filePath);
console.log('🔤 Encoding: UTF-8 com BOM (EF BB BF)');
console.log('📊 Tamanho:', finalBuffer.length, 'bytes');
console.log('🔍 Primeiros 10 bytes:', Array.from(finalBuffer.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));

