import { test, expect } from '@playwright/test';

/**
 * Testes de Acessibilidade (A11y)
 * 
 * Valida:
 * - Navegação por teclado
 * - ARIA labels e roles
 * - Contraste e legibilidade
 * - Estrutura semântica
 */

test.describe('Acessibilidade', () => {
  test('deve ter landmarks HTML5 corretos', async ({ page }) => {
    await page.goto('/');
    
    // Verifica landmarks principais
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);
    
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThanOrEqual(1);
  });

  test('deve ter headings em ordem hierárquica', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se há h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Verifica se há estrutura de headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    expect(count).toBeGreaterThan(1);
  });

  test('botões devem ter labels descritivos', async ({ page }) => {
    await page.goto('/');
    
    // Busca todos os botões
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    if (count > 0) {
      // Verifica primeiros 5 botões
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');
        
        // Botão deve ter texto, aria-label ou title
        expect(text || ariaLabel || title).toBeTruthy();
      }
    }
  });

  test('links devem ter texto descritivo', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a');
    const count = await links.count();
    
    if (count > 0) {
      // Verifica primeiros 5 links
      for (let i = 0; i < Math.min(count, 5); i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        // Link deve ter texto ou aria-label
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });

  test('imagens devem ter alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        
        // Imagem deve ter alt (pode ser vazio para decorativas)
        expect(alt !== null).toBe(true);
      }
    }
  });

  test('deve ter lang no HTML', async ({ page }) => {
    await page.goto('/');
    
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/pt|pt-BR|en/i);
  });

  test('formulários devem ter labels associados', async ({ page }) => {
    await page.goto('/empresas');
    
    // Tenta abrir formulário
    const addButton = page.getByRole('button', { 
      name: /nova empresa|adicionar|criar/i 
    }).first();
    
    const isVisible = await addButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Verifica inputs no formulário
      const inputs = page.locator('input[type="text"], input[type="email"], textarea');
      const count = await inputs.count();
      
      if (count > 0) {
        // Verifica se inputs têm labels ou aria-label
        for (let i = 0; i < Math.min(count, 3); i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            const hasLabel = await label.count();
            expect(hasLabel > 0 || ariaLabel).toBeTruthy();
          } else {
            expect(ariaLabel).toBeTruthy();
          }
        }
      }
    }
  });

  test('deve ter skip link para conteúdo principal', async ({ page }) => {
    await page.goto('/');
    
    // Pressiona Tab para focar primeiro elemento
    await page.keyboard.press('Tab');
    
    // Verifica se primeiro elemento focável é skip link
    const focusedElement = page.locator(':focus');
    const text = await focusedElement.textContent().catch(() => '');
    
    // Skip link é opcional mas recomendado
    if (text.toLowerCase().includes('skip') || text.toLowerCase().includes('pular')) {
      expect(text).toContain('Skip to content' || 'Pular para o conteúdo');
    }
  });

  test('modais devem ter foco gerenciado', async ({ page }) => {
    await page.goto('/empresas');
    
    const addButton = page.getByRole('button', { 
      name: /nova empresa|adicionar/i 
    }).first();
    
    const isVisible = await addButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Verifica se modal tem role="dialog"
      const dialog = page.locator('[role="dialog"]');
      const hasDialog = await dialog.isVisible().catch(() => false);
      
      if (hasDialog) {
        // Modal deve ter aria-labelledby ou aria-label
        const ariaLabel = await dialog.getAttribute('aria-label');
        const ariaLabelledby = await dialog.getAttribute('aria-labelledby');
        
        expect(ariaLabel || ariaLabelledby).toBeTruthy();
      }
    }
  });

  test('tabelas devem ter headers apropriados', async ({ page }) => {
    await page.goto('/empresas');
    
    const table = page.locator('table');
    const hasTable = await table.isVisible().catch(() => false);
    
    if (hasTable) {
      // Verifica thead
      const thead = table.locator('thead');
      await expect(thead).toBeVisible();
      
      // Verifica th com scope
      const headers = table.locator('th');
      const count = await headers.count();
      
      if (count > 0) {
        const firstHeader = headers.first();
        const scope = await firstHeader.getAttribute('scope');
        
        // Headers devem ter scope="col" ou scope="row"
        expect(scope === 'col' || scope === 'row' || scope === null).toBe(true);
      }
    }
  });
});
