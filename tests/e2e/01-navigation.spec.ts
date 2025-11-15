import { test, expect } from '@playwright/test';

/**
 * Testes de Navegação
 * 
 * Valida:
 * - Carregamento da página inicial
 * - Navegação entre rotas principais
 * - Títulos e elementos críticos
 */

test.describe('Navegação da Aplicação', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');
    
    // Verifica título da página
    await expect(page).toHaveTitle(/Tax Planner/i);
    
    // Verifica presença do logo ou título principal
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('deve navegar para página de empresas', async ({ page }) => {
    await page.goto('/');
    
    // Procura link ou botão para Empresas
    const empresasLink = page.getByRole('link', { name: /empresas/i });
    await empresasLink.click();
    
    // Verifica se navegou corretamente
    await expect(page).toHaveURL(/\/empresas/);
    
    // Verifica se a página carregou
    await expect(page.locator('h1, h2')).toContainText(/empresas/i);
  });

  test('deve navegar para página de comparativos', async ({ page }) => {
    await page.goto('/');
    
    // Procura link ou botão para Comparativos
    const comparativosLink = page.getByRole('link', { name: /comparativos/i });
    await comparativosLink.click();
    
    // Verifica se navegou corretamente
    await expect(page).toHaveURL(/\/comparativos/);
    
    // Verifica se a página carregou
    await expect(page.locator('h1, h2')).toContainText(/comparativos/i);
  });

  test('deve ter menu de navegação responsivo', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se existe navegação principal
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
    
    // Verifica se existem links principais
    const links = nav.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve exibir logo da aplicação', async ({ page }) => {
    await page.goto('/');
    
    // Procura por imagem do logo ou texto do título
    const logo = page.locator('img[alt*="logo" i], [class*="logo"]').first();
    
    // Verifica se está visível (se existir)
    const isVisible = await logo.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(logo).toBeVisible();
    } else {
      // Se não há logo, deve ter título principal
      const title = page.locator('h1, [class*="title"]').first();
      await expect(title).toBeVisible();
    }
  });

  test('deve carregar sem erros de console críticos', async ({ page }) => {
    const errors: string[] = [];
    
    // Captura erros do console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Aguarda carregamento completo
    await page.waitForLoadState('networkidle');
    
    // Verifica se não há erros críticos (ignorar avisos de hidratação do Next.js)
    const criticalErrors = errors.filter(
      (error) => !error.includes('Hydration') && !error.includes('Warning')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('deve ter meta tags básicas de SEO', async ({ page }) => {
    await page.goto('/');
    
    // Verifica meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveCount(1);
    
    // Verifica viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });

  test('deve responder em tempo adequado', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Página deve carregar em menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
  });
});
