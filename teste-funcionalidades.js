// Script para testar funcionalidades na página de comparativos
// Cole este código no console do navegador

console.log('🔍 Testando funcionalidades de editar, duplicar e excluir...');

// 1. Verificar dados existentes
function verificarDadosExistentes() {
  console.log('\n📊 1. Verificando dados existentes...');
  
  try {
    const data = localStorage.getItem('regimes-tributarios-storage');
    if (!data) {
      console.log('❌ Nenhum dado encontrado no localStorage');
      return false;
    }
    
    const parsed = JSON.parse(data);
    const dados = parsed.state?.dadosComparativos || [];
    
    console.log(`✅ Encontrados ${dados.length} registros`);
    
    if (dados.length === 0) {
      console.log('💡 Dica: Adicione alguns dados primeiro na aba "Adicionar Dados"');
      return false;
    }
    
    // Mostrar resumo dos dados
    dados.forEach((dado, index) => {
      console.log(`   ${index + 1}. ${dado.regime} - ${dado.mes}/${dado.ano} - R$ ${dado.receita?.toLocaleString('pt-BR')}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
    return false;
  }
}

// 2. Testar navegação para aba "Dados Cadastrados"
function irParaDadosCadastrados() {
  console.log('\n🧭 2. Navegando para aba "Dados Cadastrados"...');
  
  const tab = document.querySelector('[value="listagem"]');
  if (tab) {
    tab.click();
    console.log('✅ Navegação realizada');
    
    // Aguardar um pouco e verificar se os botões estão visíveis
    setTimeout(() => {
      const botoesEditar = document.querySelectorAll('button[title="Editar dados"]');
      const botoesDuplicar = document.querySelectorAll('button[title="Duplicar dados"]');
      const botoesRemover = document.querySelectorAll('button[title="Remover dados"]');
      
      console.log(`   - Botões de editar encontrados: ${botoesEditar.length}`);
      console.log(`   - Botões de duplicar encontrados: ${botoesDuplicar.length}`);
      console.log(`   - Botões de remover encontrados: ${botoesRemover.length}`);
      
      if (botoesEditar.length > 0) {
        console.log('✅ Interface de ações carregada corretamente');
      } else {
        console.log('❌ Botões de ação não encontrados');
      }
    }, 1000);
    
  } else {
    console.log('❌ Aba "Dados Cadastrados" não encontrada');
  }
}

// 3. Criar dados de teste se necessário
function criarDadosDeTeste() {
  console.log('\n🛠️ 3. Criando dados de teste...');
  
  // Navegar para aba adicionar
  const tabAdicionar = document.querySelector('[value="adicionar"]');
  if (tabAdicionar) {
    tabAdicionar.click();
    console.log('✅ Navegado para aba "Adicionar Dados"');
    console.log('💡 Preencha o formulário manualmente para criar dados de teste');
  } else {
    console.log('❌ Aba "Adicionar Dados" não encontrada');
  }
}

// Executar verificações
console.log('🚀 Iniciando testes...');

const temDados = verificarDadosExistentes();

if (temDados) {
  irParaDadosCadastrados();
} else {
  console.log('\n💡 Criando dados de teste primeiro...');
  criarDadosDeTeste();
}

console.log('\n📝 Instruções para teste manual:');
console.log('1. Se não há dados, adicione alguns na aba "Adicionar Dados"');
console.log('2. Vá para a aba "Dados Cadastrados"');
console.log('3. Teste os botões: ✏️ (azul - editar), 📋 (verde - duplicar), 🗑️ (vermelho - excluir)');
console.log('4. Verifique se as ações funcionam corretamente');