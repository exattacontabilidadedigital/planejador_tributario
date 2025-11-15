import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para Tax Planner v3.0
 * 
 * Testes E2E para validar fluxos críticos:
 * - Navegação entre páginas
 * - Criação e gestão de empresas
 * - Criação e análise de comparativos
 * - Visualização de dados e gráficos
 */
export default defineConfig({
  // Diretório onde os testes estão localizados
  testDir: './tests/e2e',

  // Timeout máximo por teste (60 segundos)
  timeout: 60 * 1000,

  // Executar testes em paralelo
  fullyParallel: false, // Desabilitado para testes mais estáveis

  // Falhar o build se houver testes não utilizados
  forbidOnly: !!process.env.CI,

  // Número de tentativas em caso de falha
  retries: process.env.CI ? 2 : 1,

  // Número de workers (processos paralelos)
  workers: 1, // Um worker para evitar problemas de concorrência

  // Reporter: HTML para visualização local, GitHub Actions para CI
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  // Configurações compartilhadas entre todos os projetos
  use: {
    // URL base da aplicação
    baseURL: 'http://localhost:3000',

    // Trace: captura screenshots, vídeos e logs em caso de falha
    trace: 'on-first-retry',

    // Screenshot apenas em falhas
    screenshot: 'only-on-failure',

    // Vídeo apenas em falhas
    video: 'retain-on-failure',

    // Timeout para ações (click, fill, etc)
    actionTimeout: 10 * 1000,

    // Timeout para navegação
    navigationTimeout: 30 * 1000,
  },

  // Projetos: diferentes navegadores e dispositivos
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Testes Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
});
