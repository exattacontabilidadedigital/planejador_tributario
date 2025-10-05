/**
 * Script para testar a extração de mês do nome do cenário
 */

function extrairMesDoNome(nomeCenario) {
  const mesesCompletos = [
    { nomes: ['janeiro', 'jan'], mes: 'Jan', numero: 1 },
    { nomes: ['fevereiro', 'fev'], mes: 'Fev', numero: 2 },
    { nomes: ['março', 'mar'], mes: 'Mar', numero: 3 },
    { nomes: ['abril', 'abr'], mes: 'Abr', numero: 4 },
    { nomes: ['maio', 'mai'], mes: 'Mai', numero: 5 },
    { nomes: ['junho', 'jun'], mes: 'Jun', numero: 6 },
    { nomes: ['julho', 'jul'], mes: 'Jul', numero: 7 },
    { nomes: ['agosto', 'ago'], mes: 'Ago', numero: 8 },
    { nomes: ['setembro', 'set'], mes: 'Set', numero: 9 },
    { nomes: ['outubro', 'out'], mes: 'Out', numero: 10 },
    { nomes: ['novembro', 'nov'], mes: 'Nov', numero: 11 },
    { nomes: ['dezembro', 'dez'], mes: 'Dez', numero: 12 },
  ]
  
  const nomeNormalizado = nomeCenario.toLowerCase()
  
  for (const mesInfo of mesesCompletos) {
    for (const nomeVariacao of mesInfo.nomes) {
      if (nomeNormalizado.includes(nomeVariacao)) {
        return { mes: mesInfo.mes, numero: mesInfo.numero }
      }
    }
  }
  
  return null
}

// Testes
console.log('🧪 TESTANDO EXTRAÇÃO DE MÊS DO NOME:\n')

const cenariosTeste = [
  'Janeiro 2025',
  'Fevereiro - Cenário Otimista', 
  'Março (Cópia)',
  'Abril 2025 - Revisado',
  'Maio - Nova Projeção',
  'junho/2025',
  'Julho Especial',
  'agosto modificado',
  'Setembro Final',
  'out 2025',
  'novembro alterado',
  'dez/25',
  'Cenário Especial' // Sem mês
]

cenariosTeste.forEach(nome => {
  const resultado = extrairMesDoNome(nome)
  if (resultado) {
    console.log(`✅ "${nome}" → ${resultado.mes} (${resultado.numero})`)
  } else {
    console.log(`❌ "${nome}" → Mês não identificado`)
  }
})

console.log('\n💡 COMPORTAMENTO ESPERADO:')
console.log('• Quando o usuário duplica "Março" e renomeia para "Abril"')
console.log('• O gráfico deve mostrar "Abr" no eixo X, não "Mar"')
console.log('• A ordenação deve seguir: Jan, Fev, Mar, Abr, Mai...')