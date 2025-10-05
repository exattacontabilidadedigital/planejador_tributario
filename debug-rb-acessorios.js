// Script para debugar dados específicos da RB Acessórios
// Execute no console do browser na página da RB Acessórios

console.log('🔍 [DEBUG RB ACESSÓRIOS] Iniciando debug...')

// Verificar dados do store
const storeData = JSON.parse(localStorage.getItem('cenarios-store') || '{}')
const cenarios = storeData.state?.cenarios || []

console.log('📊 [DEBUG] Total de cenários no localStorage:', cenarios.length)

// Encontrar empresa RB Acessórios
const rbEmpresa = cenarios.find(c => c.empresaId && (c.empresaId.includes('rb') || c.empresaId.includes('RB')))
console.log('🎯 [DEBUG] Primeiro cenário encontrado (para identificar empresa):', rbEmpresa)

if (rbEmpresa) {
  const empresaId = rbEmpresa.empresaId
  console.log('🏢 [DEBUG] ID da empresa RB:', empresaId)
  
  const cenariosDaEmpresa = cenarios.filter(c => c.empresaId === empresaId)
  console.log('📈 [DEBUG] Cenários da RB Acessórios:', cenariosDaEmpresa.length)
  
  cenariosDaEmpresa.forEach((cenario, index) => {
    console.log(`📋 [DEBUG] Cenário ${index + 1}:`, {
      id: cenario.id,
      nome: cenario.nome,
      mes: cenario.mes,
      periodo: cenario.periodo,
      configuracao: {
        presente: !!cenario.configuracao,
        receitaBruta: cenario.configuracao?.receitaBruta,
        tipo: typeof cenario.configuracao
      }
    })
  })
  
  // Verificar dados calculados
  console.log('🧮 [DEBUG] Calculando dados do gráfico...')
  const dadosCalculados = cenariosDaEmpresa.map((cenario, index) => {
    const config = cenario.configuracao || {}
    const receita = config.receitaBruta || 0
    
    return {
      mes: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index % 12],
      receita: receita,
      lucro: receita * 0.3, // Exemplo de cálculo
      cenarioNome: cenario.nome,
      mesOriginal: cenario.mes
    }
  })
  
  console.log('📊 [DEBUG] Dados calculados para o gráfico:', dadosCalculados)
  
  // Verificar se há valores iguais (que causariam tooltip fixo)
  const receitasUnicas = [...new Set(dadosCalculados.map(d => d.receita))]
  const lucrosUnicos = [...new Set(dadosCalculados.map(d => d.lucro))]
  
  console.log('⚠️ [DEBUG] Análise de valores únicos:', {
    totalPontos: dadosCalculados.length,
    receitasUnicas: receitasUnicas.length,
    lucrosUnicos: lucrosUnicos.length,
    valoresTodosIguais: receitasUnicas.length === 1 && lucrosUnicos.length === 1
  })
  
  if (receitasUnicas.length === 1) {
    console.log('🚨 [DEBUG] PROBLEMA ENCONTRADO: Todas as receitas são iguais!', receitasUnicas[0])
  }
  
} else {
  console.log('❌ [DEBUG] Não foi possível encontrar cenários da RB Acessórios')
}

console.log('✅ [DEBUG] Análise concluída')