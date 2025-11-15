// Glossário de Termos Tributários

export interface TermoGlossario {
  termo: string
  sigla?: string
  definicao: string
  exemplo?: string
  formula?: string
  observacao?: string
}

export const glossarioTributario: Record<string, TermoGlossario> = {
  // Impostos Federais
  irpj: {
    termo: "Imposto de Renda Pessoa Jurídica",
    sigla: "IRPJ",
    definicao: "Tributo federal que incide sobre o lucro das empresas. Calculado sobre o lucro contábil ajustado (Lucro Real) ou sobre uma base presumida da receita (Lucro Presumido).",
    formula: "Lucro Real: 15% sobre lucro até R$ 20.000/mês + 10% adicional sobre valor excedente\nLucro Presumido: 15% sobre base de cálculo presumida",
    exemplo: "Empresa com lucro de R$ 30.000: (R$ 20.000 × 15%) + (R$ 10.000 × 25%) = R$ 5.500",
    observacao: "No Simples Nacional, o IRPJ está incluído na guia DAS única."
  },
  csll: {
    termo: "Contribuição Social sobre o Lucro Líquido",
    sigla: "CSLL",
    definicao: "Contribuição federal destinada à seguridade social, calculada sobre o lucro da empresa de forma similar ao IRPJ.",
    formula: "Lucro Real: 9% sobre o lucro líquido ajustado\nLucro Presumido: 9% sobre base de cálculo presumida",
    exemplo: "Empresa com lucro de R$ 100.000: R$ 100.000 × 9% = R$ 9.000",
    observacao: "Base de cálculo similar ao IRPJ, mas com alíquota menor."
  },
  pis: {
    termo: "Programa de Integração Social",
    sigla: "PIS",
    definicao: "Contribuição federal que financia o seguro-desemprego e abono salarial. Pode ser cumulativo (sobre faturamento) ou não-cumulativo (com direito a créditos).",
    formula: "Regime Cumulativo: 0,65% sobre receita bruta\nRegime Não-Cumulativo: 1,65% sobre receita, com direito a créditos",
    exemplo: "Faturamento R$ 100.000 (cumulativo): R$ 100.000 × 0,65% = R$ 650",
    observacao: "Lucro Presumido e Simples: regime cumulativo. Lucro Real: não-cumulativo com créditos."
  },
  cofins: {
    termo: "Contribuição para Financiamento da Seguridade Social",
    sigla: "COFINS",
    definicao: "Contribuição federal que financia a seguridade social (saúde, previdência e assistência social). Funciona de forma similar ao PIS.",
    formula: "Regime Cumulativo: 3% sobre receita bruta\nRegime Não-Cumulativo: 7,6% sobre receita, com direito a créditos",
    exemplo: "Faturamento R$ 100.000 (cumulativo): R$ 100.000 × 3% = R$ 3.000",
    observacao: "Alíquota é proporcionalmente maior que o PIS (cerca de 4,6x)."
  },
  
  // Impostos Estaduais
  icms: {
    termo: "Imposto sobre Circulação de Mercadorias e Serviços",
    sigla: "ICMS",
    definicao: "Imposto estadual que incide sobre a circulação de mercadorias e serviços de transporte e comunicação. Alíquota varia por estado e produto.",
    formula: "Valor da operação × Alíquota do estado (geralmente entre 7% e 18%)",
    exemplo: "Venda de R$ 10.000 com ICMS 18%: R$ 10.000 × 18% = R$ 1.800",
    observacao: "No Lucro Real, empresa pode usar sistema de débito e crédito (não-cumulativo)."
  },
  
  // Impostos Municipais
  iss: {
    termo: "Imposto sobre Serviços",
    sigla: "ISS/ISSQN",
    definicao: "Imposto municipal cobrado sobre a prestação de serviços. Alíquota varia por município (2% a 5%) e tipo de serviço.",
    formula: "Valor do serviço × Alíquota municipal (2% a 5%)",
    exemplo: "Serviço de R$ 50.000 com ISS 5%: R$ 50.000 × 5% = R$ 2.500",
    observacao: "Empresas do Simples Nacional têm ISS incluído na guia DAS, com alíquota progressiva."
  },
  
  // Contribuições Previdenciárias
  inss: {
    termo: "Instituto Nacional do Seguro Social",
    sigla: "INSS",
    definicao: "Contribuição previdenciária sobre a folha de pagamento. Empresa paga parte patronal (20%) mais outras contribuições (RAT, terceiros).",
    formula: "Parte Patronal: 20% sobre folha de pagamento\nRAT: 1% a 3% (risco da atividade)\nTerceiros: até 5,8%",
    exemplo: "Folha de R$ 30.000: R$ 30.000 × 20% = R$ 6.000 (apenas parte patronal)",
    observacao: "No Simples Nacional, há redução da carga previdenciária (CPP)."
  },
  cpp: {
    termo: "Contribuição Previdenciária Patronal",
    sigla: "CPP",
    definicao: "Contribuição da empresa para a previdência social dos empregados. Calculada sobre a folha de pagamento.",
    formula: "20% sobre a folha de pagamento + RAT (1% a 3%) + Terceiros (até 5,8%)",
    exemplo: "Folha de R$ 50.000 com alíquota total de 28%: R$ 50.000 × 28% = R$ 14.000",
    observacao: "Simples Nacional tem CPP reduzido, calculado sobre receita e não sobre folha."
  },
  
  // Simples Nacional
  das: {
    termo: "Documento de Arrecadação do Simples Nacional",
    sigla: "DAS",
    definicao: "Guia única de pagamento do Simples Nacional que unifica 8 tributos: IRPJ, CSLL, PIS, COFINS, IPI, ICMS, ISS e CPP.",
    formula: "Receita Bruta dos últimos 12 meses × Alíquota da faixa × Fator R (quando aplicável)",
    exemplo: "Receita R$ 180.000/ano (Anexo III, faixa 1): R$ 15.000/mês × 6% = R$ 900",
    observacao: "Alíquota progressiva por faixa de faturamento (R$ 180k a R$ 4,8 milhões/ano)."
  },
  
  // Regimes Tributários
  lucro_real: {
    termo: "Lucro Real",
    definicao: "Regime tributário onde IRPJ e CSLL são calculados sobre o lucro contábil efetivo da empresa, ajustado por adições e exclusões previstas em lei.",
    formula: "IRPJ: 15% + 10% adicional sobre lucro > R$ 20.000/mês\nCSLL: 9% sobre o lucro",
    exemplo: "Lucro de R$ 100.000: IRPJ = R$ 23.000 + CSLL = R$ 9.000 = R$ 32.000",
    observacao: "Obrigatório para empresas com faturamento > R$ 78 milhões/ano ou atividades específicas."
  },
  lucro_presumido: {
    termo: "Lucro Presumido",
    definicao: "Regime simplificado onde a base de cálculo do IRPJ e CSLL é uma presunção (%) sobre a receita bruta, não o lucro real.",
    formula: "Base: 8% a 32% da receita (conforme atividade)\nIRPJ: 15% sobre base presumida\nCSLL: 9% sobre base presumida",
    exemplo: "Comércio com receita R$ 100.000: Base = R$ 8.000 (8%)\nIRPJ = R$ 1.200 + CSLL = R$ 720",
    observacao: "Mais vantajoso quando margem de lucro real é maior que a presunção legal."
  },
  simples_nacional: {
    termo: "Simples Nacional",
    definicao: "Regime simplificado para micro e pequenas empresas com faturamento até R$ 4,8 milhões/ano. Tributos unificados em guia única (DAS).",
    formula: "Receita × Alíquota progressiva do anexo (I a V) × Fator R",
    exemplo: "Empresa faturamento R$ 360k/ano: Alíquota varia de 4% a 15,5% conforme anexo e faixa",
    observacao: "Anexos: I (Comércio), II (Indústria), III (Serviços), IV (Serviços), V (Serviços com grande folha)."
  },
  
  // Métricas
  carga_tributaria: {
    termo: "Carga Tributária",
    definicao: "Percentual da receita bruta que é destinado ao pagamento de impostos e contribuições. Indicador de eficiência tributária.",
    formula: "(Total de Impostos ÷ Receita Bruta) × 100",
    exemplo: "Impostos R$ 80.000 / Receita R$ 500.000 = 16% de carga tributária",
    observacao: "Quanto menor a carga, mais eficiente é o regime tributário para aquela empresa."
  },
  economia_tributaria: {
    termo: "Economia Tributária",
    definicao: "Valor economizado ao escolher o regime tributário mais vantajoso em comparação com outras opções.",
    formula: "Total Impostos (Regime Mais Caro) - Total Impostos (Regime Escolhido)",
    exemplo: "Lucro Presumido R$ 120.000 - Simples R$ 95.000 = Economia de R$ 25.000/ano",
    observacao: "Economia pode variar conforme faturamento, margem de lucro e tipo de atividade."
  },
  lucro_liquido: {
    termo: "Lucro Líquido",
    definicao: "Resultado final da empresa após deduzir todos os custos, despesas e impostos da receita bruta.",
    formula: "Receita Bruta - Custos - Despesas - Impostos",
    exemplo: "Receita R$ 500.000 - Custos R$ 250.000 - Despesas R$ 100.000 - Impostos R$ 80.000 = R$ 70.000",
    observacao: "Métrica fundamental para avaliar a viabilidade e rentabilidade do negócio."
  },
  
  // Conceitos Adicionais
  fator_r: {
    termo: "Fator R",
    sigla: "Fator R",
    definicao: "Índice usado no Simples Nacional para empresas de serviços. Determina se a empresa será tributada pelo Anexo III (Fator R ≥ 28%) ou Anexo V (Fator R < 28%).",
    formula: "(Folha de Pagamento últimos 12 meses ÷ Receita Bruta últimos 12 meses) × 100",
    exemplo: "Folha R$ 180.000 / Receita R$ 600.000 = 30% → Anexo III (menor tributação)",
    observacao: "Quanto maior a folha em relação à receita, menor será a tributação (Anexo III vs V)."
  },
  aliquota_efetiva: {
    termo: "Alíquota Efetiva",
    definicao: "Percentual real de tributos pagos sobre a receita, considerando todos os impostos e contribuições.",
    formula: "(Total de Tributos Pagos ÷ Receita Bruta) × 100",
    exemplo: "Tributos R$ 45.000 / Receita R$ 300.000 = 15% de alíquota efetiva",
    observacao: "Diferente da alíquota nominal, pois considera o efeito combinado de todos os tributos."
  }
}

export function getTermoGlossario(chave: string): TermoGlossario | undefined {
  return glossarioTributario[chave.toLowerCase().replace(/\s+/g, '_')]
}

export function buscarTermos(termo: string): TermoGlossario[] {
  const termoBusca = termo.toLowerCase()
  return Object.values(glossarioTributario).filter(
    item => 
      item.termo.toLowerCase().includes(termoBusca) ||
      item.sigla?.toLowerCase().includes(termoBusca) ||
      item.definicao.toLowerCase().includes(termoBusca)
  )
}

export const categoriasGlossario = {
  impostos_federais: ['irpj', 'csll', 'pis', 'cofins'],
  impostos_estaduais: ['icms'],
  impostos_municipais: ['iss'],
  contribuicoes_previdenciarias: ['inss', 'cpp'],
  regimes_tributarios: ['lucro_real', 'lucro_presumido', 'simples_nacional', 'das'],
  metricas: ['carga_tributaria', 'economia_tributaria', 'lucro_liquido', 'aliquota_efetiva'],
  conceitos: ['fator_r']
}
