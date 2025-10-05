// Script interno para debugar gráficos - colocar no console do browser
console.log('🔍 Iniciando debug de gráficos...')

// Verificar estado do store de cenários
if (window.__debugCenarios) {
  console.log('📊 Debug de cenários disponível')
  window.__debugCenarios.inspecionar()
} else {
  console.log('⚠️ Debug de cenários não encontrado')
}

// Verificar dados do localStorage
console.log('💾 LocalStorage cenarios-store:', JSON.parse(localStorage.getItem('cenarios-store') || '{}'))

// Verificar dados dos cenários no estado global
console.log('🏗️ Estado dos cenários (se disponível):', window.store?.getState?.())

// Função para verificar dados específicos de uma empresa
function debugEmpresa(empresaId) {
  console.log(`🎯 Debug da empresa ${empresaId}:`)
  
  const storeData = JSON.parse(localStorage.getItem('cenarios-store') || '{}')
  const cenarios = storeData.state?.cenarios || []
  
  console.log('Total de cenários no store:', cenarios.length)
  
  const cenariosDaEmpresa = cenarios.filter(c => c.empresaId === empresaId)
  console.log(`Cenários da empresa ${empresaId}:`, cenariosDaEmpresa.length)
  
  cenariosDaEmpresa.forEach(cenario => {
    console.log(`- ${cenario.nome}:`, {
      mes: cenario.mes,
      trimestre: cenario.trimestre,
      periodo: cenario.periodo,
      configuracao: !!cenario.configuracao
    })
  })
  
  return cenariosDaEmpresa
}

// Usar: debugEmpresa('ID_DA_EMPRESA')
window.debugEmpresa = debugEmpresa

console.log('✅ Debug scripts carregados. Use debugEmpresa("ID_DA_EMPRESA") para verificar dados específicos')