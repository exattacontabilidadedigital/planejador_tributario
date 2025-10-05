/**
 * 🧹 UTILITÁRIO DE DEBUG - LIMPAR CACHE DE CENÁRIOS
 * 
 * Script para limpar dados persistidos do localStorage quando necessário
 */

// Função para limpar cache de cenários
function limparCacheCenarios() {
  console.log('🧹 Limpando cache de cenários...')
  
  // Limpar localStorage do Zustand
  localStorage.removeItem('cenarios-storage')
  
  // Limpar outros possíveis caches relacionados
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('cenario') || key.includes('empresa'))) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('🗑️ Removendo cache:', key)
    localStorage.removeItem(key)
  })
  
  console.log('✅ Cache limpo! Recarregue a página.')
}

// Função para inspecionar cache atual
function inspecionarCache() {
  console.log('🔍 Inspecionando cache atual...')
  
  const cenariosCache = localStorage.getItem('cenarios-storage')
  if (cenariosCache) {
    try {
      const data = JSON.parse(cenariosCache)
      console.log('📊 Cache de cenários encontrado:', {
        state: data.state,
        cenarios: data.state?.cenarios?.length || 0,
        detalhes: data.state?.cenarios?.map((c: any) => ({ id: c.id, nome: c.nome, empresaId: c.empresaId }))
      })
    } catch (error) {
      console.error('❌ Erro ao parsear cache:', error)
    }
  } else {
    console.log('✅ Nenhum cache de cenários encontrado')
  }
  
  // Verificar outros caches
  console.log('📋 Todas as chaves do localStorage:', Object.keys(localStorage))
}

// Disponibilizar funções globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).debugCenarios = {
    limparCache: limparCacheCenarios,
    inspecionar: inspecionarCache
  }
  
  console.log(`
🐛 FERRAMENTAS DE DEBUG DISPONÍVEIS:

Para inspecionar o cache:
debugCenarios.inspecionar()

Para limpar o cache:
debugCenarios.limparCache()
  `)
}

export { limparCacheCenarios, inspecionarCache }