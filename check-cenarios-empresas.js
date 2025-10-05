/**
 * Script para verificar os cenários existentes e suas empresas
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function checkCenariosEmpresas() {
  console.log('🔧 [CHECK] Configurações:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltando')
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltando')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [CHECK] Configurações de Supabase não encontradas')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔄 [CHECK] Verificando cenários e empresas...')

  try {
    // 1. Buscar todos os cenários com JOIN das empresas
    console.log('1️⃣ [CHECK] Buscando cenários com empresas...')
    const { data: cenariosComEmpresas, error: joinError } = await supabase
      .from('cenarios')
      .select(`
        id,
        nome,
        empresa_id,
        status,
        ano,
        created_at,
        empresas!inner (
          id,
          nome
        )
      `)
      .order('created_at', { ascending: false })

    if (joinError) {
      console.error('❌ [CHECK] Erro no JOIN:', joinError)
      
      // Buscar separadamente se JOIN falhar
      console.log('2️⃣ [CHECK] Buscando cenários separadamente...')
      const { data: cenarios, error: cenariosError } = await supabase
        .from('cenarios')
        .select('*')
        .order('created_at', { ascending: false })

      if (cenariosError) {
        console.error('❌ [CHECK] Erro ao buscar cenários:', cenariosError)
        return
      }

      console.log('📊 [CHECK] Cenários encontrados:', cenarios.length)
      
      for (const cenario of cenarios) {
        console.log(`\n📄 [CHECK] Cenário: ${cenario.nome}`)
        console.log(`   ID: ${cenario.id}`)
        console.log(`   Empresa ID: ${cenario.empresa_id}`)
        console.log(`   Status: ${cenario.status}`)
        console.log(`   Ano: ${cenario.ano}`)
        console.log(`   Criado em: ${cenario.created_at}`)
        
        // Buscar empresa separadamente
        const { data: empresa, error: empresaError } = await supabase
          .from('empresas')
          .select('nome')
          .eq('id', cenario.empresa_id)
          .single()

        if (empresaError) {
          console.log(`   ⚠️ Empresa não encontrada ou erro: ${empresaError.message}`)
        } else {
          console.log(`   🏢 Empresa: ${empresa.nome}`)
        }
      }
      
      return
    }

    console.log('✅ [CHECK] Cenários com empresas:', cenariosComEmpresas.length)
    
    cenariosComEmpresas.forEach(item => {
      console.log(`\n📄 [CHECK] ${item.nome}`)
      console.log(`   🏢 Empresa: ${item.empresas.nome}`)
      console.log(`   📊 Status: ${item.status}`)
      console.log(`   📅 Ano: ${item.ano}`)
      console.log(`   🆔 IDs: cenario=${item.id}, empresa=${item.empresa_id}`)
    })

    // 3. Listar todas as empresas para referência
    console.log('\n3️⃣ [CHECK] Todas as empresas disponíveis:')
    const { data: todasEmpresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome')
      .order('nome')

    if (!empresasError && todasEmpresas) {
      todasEmpresas.forEach(emp => {
        const temCenarios = cenariosComEmpresas.some(c => c.empresa_id === emp.id)
        console.log(`   ${temCenarios ? '✅' : '⚪'} ${emp.nome} (${emp.id})`)
      })
    }

  } catch (error) {
    console.error('💥 [CHECK] Erro inesperado:', error)
  }

  console.log('\n🏁 [CHECK] Verificação finalizada')
}

checkCenariosEmpresas()