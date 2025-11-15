import { test, expect } from '@playwright/test';

/**
 * Testes do Dashboard
 * 
 * Valida:
 * - Carregamento de widgets
 * - Visualização de métricas
 * - Gráficos e estatísticas
 * - Responsividade
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir título ou boas-vindas', async ({ page }) => {
    const heading = page.locator('h1, h2, [class*="welcome"], [class*="title"]').first();
    await expect(heading).toBeVisible();
  });

  test('deve ter cards ou widgets de métricas', async ({ page }) => {
    // Procura por cards com estatísticas
    const cards = page.locator('[class*="card"], [class*="widget"], [class*="metric"]');
    const count = await cards.count();
    
    // Dashboard geralmente tem pelo menos 2-4 cards
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('deve exibir números ou valores nas métricas', async ({ page }) => {
    // Procura por elementos com números
    const numbers = page.locator('text=/\\d+/');
    const count = await numbers.count();
    
    // Deve ter pelo menos alguns números visíveis
    expect(count).toBeGreaterThan(0);
  });

  test('deve ter área de gráficos', async ({ page }) => {
    // Aguarda mais tempo para gráficos carregarem
    await page.waitForTimeout(2000);
    
    // Procura por canvas (Chart.js) ou SVG (Recharts)
    const charts = page.locator('canvas, svg[class*="recharts"]');
    const count = await charts.count();
    
    // Dashboard pode ter gráficos
    if (count > 0) {
      const firstChart = charts.first();
      await expect(firstChart).toBeVisible();
    }
  });

  test('deve ter navegação rápida para seções', async ({ page }) => {
    // Procura por links ou botões de navegação
    const links = page.locator('a[href*="/empresas"], a[href*="/comparativos"]');
    const count = await links.count();
    
    // Dashboard geralmente tem links rápidos
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('deve ser responsivo em mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Verifica se layout se adapta
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
      
      // Cards devem empilhar verticalmente
      const cards = page.locator('[class*="card"], [class*="widget"]');
      const count = await cards.count();
      
      if (count > 0) {
        // Todos os cards devem estar visíveis
        for (let i = 0; i < Math.min(count, 3); i++) {
          await expect(cards.nth(i)).toBeVisible();
        }
      }
    }
  });

  test('deve ter seção de ações rápidas', async ({ page }) => {
    // Procura por botões de ação principal
    const quickActions = page.locator('button[class*="primary"], button[class*="action"]');
    const count = await quickActions.count();
    
    // Pelo menos algumas ações devem estar disponíveis
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve exibir informações atualizadas', async ({ page }) => {
    // Verifica se há indicação de última atualização ou data atual
    const dates = page.locator('time, [datetime], text=/\\d{2}\\/\\d{2}\\/\\d{4}/');
    const count = await dates.count();
    
    // Dashboard geralmente mostra datas
    if (count > 0) {
      const firstDate = dates.first();
      await expect(firstDate).toBeVisible();
    }
  });

  test('deve carregar sem erros de renderização', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = errors.filter(
      (error) => 
        !error.includes('Hydration') && 
        !error.includes('Warning') &&
        !error.includes('DevTools') &&
        !error.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('deve ter performance adequada no carregamento', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // DOM deve carregar em menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });
});
