/**
 * Script de Teste de Persistência
 * 
 * Execute no console do navegador para testar a persistência de dados
 */

// ========================================
// TESTES DE PERSISTÊNCIA
// ========================================

console.log('🧪 Iniciando Testes de Persistência...\n')

// Função auxiliar para verificar localStorage
function checkStorage(key) {
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      console.log(`✅ ${key}:`, parsed)
      return parsed
    } catch (e) {
      console.error(`❌ Erro ao parsear ${key}:`, e)
      return null
    }
  } else {
    console.log(`⚠️ ${key}: Não encontrado`)
    return null
  }
}

// ========================================
// 1. VERIFICAR STORES EXISTENTES
// ========================================

console.log('\n📦 1. VERIFICANDO STORES EXISTENTES\n')

const empresasData = checkStorage('empresas-storage')
const cenariosData = checkStorage('cenarios-storage')
const comparativosData = checkStorage('comparativos-storage')
const taxPlannerData = checkStorage('tax-planner-storage')

// ========================================
// 2. ESTATÍSTICAS
// ========================================

console.log('\n📊 2. ESTATÍSTICAS DE DADOS\n')

if (empresasData?.state?.empresas) {
  console.log(`✅ Empresas cadastradas: ${empresasData.state.empresas.length}`)
  empresasData.state.empresas.forEach((emp, idx) => {
    console.log(`   ${idx + 1}. ${emp.nome} (${emp.cnpj}) - ${emp.regimeTributario}`)
  })
} else {
  console.log('⚠️ Nenhuma empresa cadastrada')
}

if (cenariosData?.state?.cenarios) {
  console.log(`\n✅ Cenários cadastrados: ${cenariosData.state.cenarios.length}`)
  
  // Agrupar por empresa
  const cenariosPorEmpresa = {}
  cenariosData.state.cenarios.forEach(cen => {
    if (!cenariosPorEmpresa[cen.empresaId]) {
      cenariosPorEmpresa[cen.empresaId] = []
    }
    cenariosPorEmpresa[cen.empresaId].push(cen)
  })
  
  Object.entries(cenariosPorEmpresa).forEach(([empresaId, cenarios]) => {
    const empresa = empresasData?.state?.empresas?.find(e => e.id === empresaId)
    console.log(`   ${empresa?.nome || 'Empresa não encontrada'}:`)
    cenarios.forEach(cen => {
      console.log(`      - ${cen.nome} (${cen.status}) - ${cen.periodo.tipo} ${cen.periodo.ano}`)
    })
  })
} else {
  console.log('\n⚠️ Nenhum cenário cadastrado')
}

if (comparativosData?.state?.comparativos) {
  console.log(`\n✅ Comparativos salvos: ${comparativosData.state.comparativos.length}`)
  comparativosData.state.comparativos.forEach((comp, idx) => {
    console.log(`   ${idx + 1}. ${comp.nome} (${comp.cenariosIds.length} cenários)`)
  })
} else {
  console.log('\n⚠️ Nenhum comparativo salvo')
}

// ========================================
// 3. VERIFICAR INTEGRIDADE
// ========================================

console.log('\n🔍 3. VERIFICANDO INTEGRIDADE\n')

// Verificar cenários órfãos
if (cenariosData?.state?.cenarios && empresasData?.state?.empresas) {
  const cenariosOrfaos = cenariosData.state.cenarios.filter(cen => {
    return !empresasData.state.empresas.find(emp => emp.id === cen.empresaId)
  })
  
  if (cenariosOrfaos.length > 0) {
    console.log(`⚠️ Cenários órfãos encontrados: ${cenariosOrfaos.length}`)
    cenariosOrfaos.forEach(cen => {
      console.log(`   - ${cen.nome} (empresaId: ${cen.empresaId})`)
    })
  } else {
    console.log('✅ Nenhum cenário órfão')
  }
}

// Verificar comparativos órfãos
if (comparativosData?.state?.comparativos && empresasData?.state?.empresas) {
  const comparativosOrfaos = comparativosData.state.comparativos.filter(comp => {
    return !empresasData.state.empresas.find(emp => emp.id === comp.empresaId)
  })
  
  if (comparativosOrfaos.length > 0) {
    console.log(`⚠️ Comparativos órfãos encontrados: ${comparativosOrfaos.length}`)
  } else {
    console.log('✅ Nenhum comparativo órfão')
  }
}

// Verificar referências de comparativos
if (comparativosData?.state?.comparativos && cenariosData?.state?.cenarios) {
  const comparativosInvalidos = comparativosData.state.comparativos.filter(comp => {
    const cenariosValidos = comp.cenariosIds.filter(id => {
      return cenariosData.state.cenarios.find(cen => cen.id === id)
    })
    return cenariosValidos.length !== comp.cenariosIds.length
  })
  
  if (comparativosInvalidos.length > 0) {
    console.log(`⚠️ Comparativos com referências inválidas: ${comparativosInvalidos.length}`)
  } else {
    console.log('✅ Todas as referências de comparativos válidas')
  }
}

// ========================================
// 4. TAMANHO DOS DADOS
// ========================================

console.log('\n💾 4. TAMANHO DOS DADOS\n')

function getStorageSize(key) {
  const data = localStorage.getItem(key)
  if (data) {
    const bytes = new Blob([data]).size
    const kb = (bytes / 1024).toFixed(2)
    return { bytes, kb }
  }
  return { bytes: 0, kb: '0.00' }
}

const empresasSize = getStorageSize('empresas-storage')
const cenariosSize = getStorageSize('cenarios-storage')
const comparativosSize = getStorageSize('comparativos-storage')
const taxPlannerSize = getStorageSize('tax-planner-storage')

console.log(`empresas-storage: ${empresasSize.kb} KB (${empresasSize.bytes} bytes)`)
console.log(`cenarios-storage: ${cenariosSize.kb} KB (${cenariosSize.bytes} bytes)`)
console.log(`comparativos-storage: ${comparativosSize.kb} KB (${comparativosSize.bytes} bytes)`)
console.log(`tax-planner-storage: ${taxPlannerSize.kb} KB (${taxPlannerSize.bytes} bytes)`)

const totalBytes = empresasSize.bytes + cenariosSize.bytes + comparativosSize.bytes + taxPlannerSize.bytes
const totalKB = (totalBytes / 1024).toFixed(2)
const totalMB = (totalBytes / (1024 * 1024)).toFixed(2)

console.log(`\n📊 Total: ${totalKB} KB (${totalMB} MB)`)

const maxStorage = 5 * 1024 * 1024 // 5 MB (estimativa conservadora)
const percentUsed = ((totalBytes / maxStorage) * 100).toFixed(2)

console.log(`📈 Uso estimado: ${percentUsed}% do limite (assumindo ~5 MB)`)

if (percentUsed > 80) {
  console.log('⚠️ ATENÇÃO: Uso de storage acima de 80%!')
} else if (percentUsed > 50) {
  console.log('💡 Uso moderado de storage')
} else {
  console.log('✅ Uso de storage saudável')
}

// ========================================
// 5. CAMPOS OBRIGATÓRIOS
// ========================================

console.log('\n🔑 5. VERIFICANDO CAMPOS OBRIGATÓRIOS\n')

// Verificar empresas
if (empresasData?.state?.empresas) {
  const empresasIncompletas = empresasData.state.empresas.filter(emp => {
    return !emp.id || !emp.nome || !emp.cnpj || !emp.razaoSocial || 
           !emp.regimeTributario || !emp.setor || !emp.uf || !emp.municipio
  })
  
  if (empresasIncompletas.length > 0) {
    console.log(`❌ Empresas com campos obrigatórios faltando: ${empresasIncompletas.length}`)
  } else {
    console.log('✅ Todas as empresas possuem campos obrigatórios')
  }
}

// Verificar cenários
if (cenariosData?.state?.cenarios) {
  const cenariosIncompletos = cenariosData.state.cenarios.filter(cen => {
    return !cen.id || !cen.empresaId || !cen.nome || !cen.periodo || 
           !cen.config || !cen.status
  })
  
  if (cenariosIncompletos.length > 0) {
    console.log(`❌ Cenários com campos obrigatórios faltando: ${cenariosIncompletos.length}`)
  } else {
    console.log('✅ Todos os cenários possuem campos obrigatórios')
  }
  
  // Verificar TaxConfig completo
  const cenariosConfigIncompleta = cenariosData.state.cenarios.filter(cen => {
    const config = cen.config
    const camposObrigatorios = [
      'icmsInterno', 'icmsSul', 'icmsNorte', 'pisAliq', 'cofinsAliq',
      'irpjBase', 'csllAliq', 'receitaBruta', 'vendasInternas',
      'vendasInterestaduais', 'cmvTotal'
    ]
    return camposObrigatorios.some(campo => config[campo] === undefined)
  })
  
  if (cenariosConfigIncompleta.length > 0) {
    console.log(`⚠️ Cenários com TaxConfig incompleto: ${cenariosConfigIncompleta.length}`)
  } else {
    console.log('✅ Todos os cenários possuem TaxConfig completo')
  }
}

// ========================================
// RESUMO FINAL
// ========================================

console.log('\n' + '='.repeat(50))
console.log('🎯 RESUMO DA AUDITORIA')
console.log('='.repeat(50) + '\n')

const totalEmpresas = empresasData?.state?.empresas?.length || 0
const totalCenarios = cenariosData?.state?.cenarios?.length || 0
const totalComparativos = comparativosData?.state?.comparativos?.length || 0

console.log(`📊 Total de Empresas: ${totalEmpresas}`)
console.log(`📊 Total de Cenários: ${totalCenarios}`)
console.log(`📊 Total de Comparativos: ${totalComparativos}`)
console.log(`💾 Espaço Usado: ${totalKB} KB (${percentUsed}%)`)

if (totalEmpresas > 0 && totalCenarios > 0) {
  console.log('\n✅ Sistema com dados! Persistência funcionando.')
} else if (totalEmpresas === 0) {
  console.log('\n⚠️ Nenhuma empresa cadastrada. Crie sua primeira empresa!')
} else {
  console.log('\n⚠️ Empresas cadastradas mas sem cenários. Crie um cenário!')
}

console.log('\n🎉 Auditoria concluída!\n')

// Exportar dados para análise
window.persistenceAudit = {
  empresas: empresasData?.state?.empresas || [],
  cenarios: cenariosData?.state?.cenarios || [],
  comparativos: comparativosData?.state?.comparativos || [],
  stats: {
    totalEmpresas,
    totalCenarios,
    totalComparativos,
    totalBytes,
    totalKB,
    percentUsed
  }
}

console.log('💡 Dados exportados para: window.persistenceAudit')
