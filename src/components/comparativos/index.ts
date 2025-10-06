// ============================================================================
// COMPONENTES DE ANÁLISE COMPARATIVA AVANÇADA
// ============================================================================

// Wizard de Criação
export { WizardCriarComparativoCompleto } from './wizard-criar-comparativo-completo'

// Dashboard Principal
export { DashboardComparativoCompleto } from './dashboard-comparativo-completo'

// Gráficos Avançados
export { GraficoEvolucaoMensal } from './graficos/grafico-evolucao-mensal'
export { GraficoComposicaoImpostos } from './graficos/grafico-composicao-impostos'
export { GraficoRadarImpostos } from './graficos/grafico-radar-impostos'
export { HeatmapCobertura } from './graficos/heatmap-cobertura'
export { GraficoWaterfallLucro } from './graficos/grafico-waterfall-lucro'

// Simulador
export { SimuladorESe } from './simulador-e-se'

// ============================================================================
// EXEMPLO DE USO
// ============================================================================

/**
 * PASSO 1: Criar um novo comparativo
 * 
 * import { WizardCriarComparativoCompleto } from '@/components/comparativos'
 * 
 * function PaginaComparativos() {
 *   const [modalAberto, setModalAberto] = useState(false)
 * 
 *   return (
 *     <>
 *       <Button onClick={() => setModalAberto(true)}>
 *         Criar Análise Comparativa
 *       </Button>
 * 
 *       <Dialog open={modalAberto} onOpenChange={setModalAberto}>
 *         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
 *           <WizardCriarComparativoCompleto
 *             empresaId="123"
 *             onConcluir={(comparativo) => {
 *               console.log('Comparativo criado:', comparativo)
 *               setModalAberto(false)
 *             }}
 *           />
 *         </DialogContent>
 *       </Dialog>
 *     </>
 *   )
 * }
 * 
 * PASSO 2: Exibir o dashboard com resultados
 * 
 * import { DashboardComparativoCompleto } from '@/components/comparativos'
 * 
 * function PaginaResultados({ comparativo }) {
 *   return (
 *     <DashboardComparativoCompleto
 *       comparativo={comparativo}
 *       onEdit={() => console.log('Editar')}
 *       onDelete={() => console.log('Deletar')}
 *       onShare={() => console.log('Compartilhar')}
 *       onToggleFavorito={() => console.log('Toggle favorito')}
 *     />
 *   )
 * }
 * 
 * PASSO 3: Adicionar gráficos avançados
 * 
 * import { 
 *   GraficoEvolucaoMensal,
 *   GraficoComposicaoImpostos,
 *   GraficoRadarImpostos,
 *   GraficoWaterfallLucro 
 * } from '@/components/comparativos'
 * 
 * function SecaoGraficos({ comparativo }) {
 *   return (
 *     <div className="space-y-6">
 *       <GraficoEvolucaoMensal 
 *         resultados={comparativo.resultados.comparacao.regimes}
 *         mesesSelecionados={[1, 2, 3, 4, 5, 6]}
 *       />
 *       <GraficoComposicaoImpostos 
 *         resultados={comparativo.resultados.comparacao.regimes}
 *       />
 *       <GraficoRadarImpostos 
 *         resultados={comparativo.resultados.comparacao.regimes}
 *       />
 *       <GraficoWaterfallLucro 
 *         resultado={comparativo.resultados.comparacao.regimes['lucro_real']}
 *       />
 *     </div>
 *   )
 * }
 * 
 * PASSO 4: Usar o simulador
 * 
 * import { SimuladorESe } from '@/components/comparativos'
 * 
 * function PaginaSimulador({ comparativo }) {
 *   const handleSalvarSimulacao = async (simulacao) => {
 *     // Salvar simulação no Supabase
 *     await supabase.from('comparativos_analise').update({
 *       simulacoes: [...comparativo.simulacoes, simulacao]
 *     }).eq('id', comparativo.id)
 *   }
 * 
 *   return (
 *     <SimuladorESe 
 *       comparativo={comparativo}
 *       onSalvarSimulacao={handleSalvarSimulacao}
 *     />
 *   )
 * }
 */
