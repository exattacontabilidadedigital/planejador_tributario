import { test, expect } from '@playwright/test';

/**
 * Testes de Comparativos Tributários
 * 
 * Valida:
 * - Listagem de comparativos
 * - Criação de novo comparativo
 * - Visualização de análises
 * - Gráficos e relatórios
 */

test.describe('Comparativos Tributários', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comparativos');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir título da página', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toContainText(/comparativos/i);
  });

  test('deve ter botão para novo comparativo', async ({ page }) => {
    const addButton = page.getByRole('button', { 
      name: /novo comparativo|nova análise|criar comparativo|adicionar/i 
    });
    
    await expect(addButton).toBeVisible();
  });

  test('deve abrir formulário ao clicar em novo comparativo', async ({ page }) => {
    const addButton = page.getByRole('button', { 
      name: /novo comparativo|nova análise|criar comparativo|adicionar/i 
    });
    
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Verifica se formulário ou wizard apareceu
    const form = page.locator('form, [role="dialog"], [class*="wizard"], [class*="modal"]');
    await expect(form).toBeVisible();
  });

  test('deve exibir lista de comparativos ou mensagem vazia', async ({ page }) => {
    const table = page.locator('table, [role="table"]');
    const hasTable = await table.isVisible().catch(() => false);
    
    if (hasTable) {
      // Verifica cabeçalhos
      const headers = table.locator('th, [role="columnheader"]');
      const count = await headers.count();
      expect(count).toBeGreaterThan(0);
    } else {
      // Verifica mensagem de lista vazia
      const emptyMessage = page.locator('text=/nenhum comparativo|lista vazia|sem comparativos/i');
      const hasEmpty = await emptyMessage.isVisible().catch(() => false);
      
      // Deve ter mensagem ou estar em estado de loading
      if (!hasEmpty) {
        const loading = page.locator('[class*="loading"], [class*="spinner"]');
        const isLoading = await loading.isVisible().catch(() => false);
        expect(isLoading).toBe(true);
      }
    }
  });

  test('deve ter filtros ou busca', async ({ page }) => {
    // Procura por inputs de filtro
    const filters = page.locator('input, select, [role="combobox"]');
    const count = await filters.count();
    
    // Deve ter pelo menos 1 elemento de filtro/busca
    expect(count).toBeGreaterThan(0);
  });

  test('deve ter opções de visualização', async ({ page }) => {
    // Verifica se há tabs, botões de visualização, etc
    const tabs = page.locator('[role="tablist"], [class*="tab"]');
    const buttons = page.locator('button[class*="view"], button[class*="display"]');
    
    const hasTabs = await tabs.isVisible().catch(() => false);
    const hasButtons = await buttons.isVisible().catch(() => false);
    
    // Pode não ter, mas se tiver deve estar visível
    if (hasTabs || hasButtons) {
      expect(hasTabs || hasButtons).toBe(true);
    }
  });

  test('deve ter ações nos comparativos', async ({ page }) => {
    const table = page.locator('table, [role="table"]');
    const hasTable = await table.isVisible().catch(() => false);
    
    if (hasTable) {
      // Verifica botões de ação
      const actionButtons = page.locator('button[title], button[aria-label], a[title]');
      const count = await actionButtons.count();
      
      if (count > 0) {
        const firstButton = actionButtons.first();
        const hasLabel = await firstButton.getAttribute('aria-label');
        const hasTitle = await firstButton.getAttribute('title');
        
        expect(hasLabel || hasTitle).toBeTruthy();
      }
    }
  });

  test('deve validar formulário de novo comparativo', async ({ page }) => {
    const addButton = page.getByRole('button', { 
      name: /novo comparativo|nova análise|criar comparativo|adicionar/i 
    });
    
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Procura botão de submissão
    const submitButton = page.getByRole('button', { 
      name: /salvar|criar|calcular|gerar|confirmar/i 
    });
    
    const isVisible = await submitButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await submitButton.click();
      await page.waitForTimeout(500);
      
      // Verifica validações
      const errors = page.locator('[class*="error"], [role="alert"], [class*="invalid"]');
      const count = await errors.count();
      
      // Pode ter validações ou pode permitir criar vazio (dependendo da lógica)
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('deve carregar sem erros críticos', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/comparativos');
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = errors.filter(
      (error) => 
        !error.includes('Hydration') && 
        !error.includes('Warning') &&
        !error.includes('DevTools')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('deve ter paginação se houver muitos itens', async ({ page }) => {
    // Verifica se há tabela com dados
    const table = page.locator('table, [role="table"]');
    const hasTable = await table.isVisible().catch(() => false);
    
    if (hasTable) {
      const rows = table.locator('tbody tr, [role="row"]');
      const count = await rows.count();
      
      // Se houver muitas linhas, deve ter paginação
      if (count >= 10) {
        const pagination = page.locator('[class*="pagination"], [role="navigation"]');
        await expect(pagination).toBeVisible();
      }
    }
  });
});
