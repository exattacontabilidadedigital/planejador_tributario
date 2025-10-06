// Debug script para identificar e limpar dados corrompidos no localStorage
// Cole este código no console do navegador na página dos comparativos

(function debugLocalStorage() {
  console.log('🔍 Iniciando debug do localStorage para comparativos...');
  
  try {
    const storageKey = 'regimes-tributarios-storage';
    const data = localStorage.getItem(storageKey);
    
    if (!data) {
      console.log('✅ Nenhum dado encontrado no localStorage');
      return;
    }
    
    const parsed = JSON.parse(data);
    console.log('📊 Dados encontrados:', parsed);
    
    if (!parsed.state?.dadosComparativos) {
      console.log('✅ Nenhum dado comparativo encontrado');
      return;
    }
    
    const dados = parsed.state.dadosComparativos;
    console.log(`📈 Total de registros: ${dados.length}`);
    
    // Verificar dados inválidos
    const dadosInvalidos = dados.filter(item => {
      try {
        if (!item || typeof item !== 'object') return true;
        if (!item.id || !item.empresaId || !item.mes || !item.ano) return true;
        
        const date = new Date(item.criadoEm);
        if (isNaN(date.getTime())) return true;
        
        return false;
      } catch {
        return true;
      }
    });
    
    console.log(`❌ Registros inválidos encontrados: ${dadosInvalidos.length}`);
    
    if (dadosInvalidos.length > 0) {
      console.log('🧹 Dados inválidos:', dadosInvalidos);
      
      // Filtrar apenas dados válidos
      const dadosValidos = dados.filter(item => {
        try {
          if (!item || typeof item !== 'object') return false;
          if (!item.id || !item.empresaId || !item.mes || !item.ano) return false;
          
          const date = new Date(item.criadoEm);
          if (isNaN(date.getTime())) return false;
          
          return true;
        } catch {
          return false;
        }
      });
      
      // Atualizar localStorage com dados limpos
      const novosDados = {
        ...parsed,
        state: {
          ...parsed.state,
          dadosComparativos: dadosValidos
        }
      };
      
      localStorage.setItem(storageKey, JSON.stringify(novosDados));
      console.log(`✅ LocalStorage limpo! Removidos ${dadosInvalidos.length} registros inválidos`);
      console.log(`📊 Registros válidos mantidos: ${dadosValidos.length}`);
      
      // Recarregar a página para aplicar as mudanças
      console.log('🔄 Recarregando a página para aplicar as mudanças...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.log('✅ Todos os dados estão válidos!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
    
    // Em caso de erro crítico, limpar completamente o localStorage
    const resposta = confirm('Erro crítico detectado. Deseja limpar completamente os dados dos comparativos?');
    if (resposta) {
      localStorage.removeItem('regimes-tributarios-storage');
      console.log('🗑️ Dados limpos completamente. Recarregando...');
      window.location.reload();
    }
  }
})();