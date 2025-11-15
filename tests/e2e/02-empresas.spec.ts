import { test, expect } from '@playwright/test';

/**
 * Testes de Gestão de Empresas
 * 
 * Valida:
 * - Listagem de empresas
 * - Criação de nova empresa
 * - Visualização de detalhes
 * - Filtros e busca
 */

test.describe('Gestão de Empresas', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para página de empresas antes de cada teste
    await page.goto('/empresas');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir título da página', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toContainText(/empresas/i);
  });

  test('deve ter botão para adicionar nova empresa', async ({ page }) => {
    // Procura botão com texto "Nova Empresa", "Adicionar", etc
    const addButton = page.getByRole('button', { 
      name: /nova empresa|adicionar empresa|criar empresa|novo/i 
    });
    
    await expect(addButton).toBeVisible();
  });

  test('deve abrir modal ao clicar em nova empresa', async ({ page }) => {
    const addButton = page.getByRole('button', { 
      name: /nova empresa|adicionar empresa|criar empresa|novo/i 
    });
    
    await addButton.click();
    
    // Aguarda modal aparecer
    await page.waitForTimeout(500);
    
    // Verifica se modal está visível
    const modal = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]');
    await expect(modal).toBeVisible();
    
    // Verifica se há campos de formulário
    const form = page.locator('form, [role="form"]');
    await expect(form).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    const addButton = page.getByRole('button', { 
      name: /nova empresa|adicionar empresa|criar empresa|novo/i 
    });
    
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Tenta submeter formulário vazio
    const submitButton = page.getByRole('button', { 
      name: /salvar|criar|adicionar|confirmar/i 
    });
    
    await submitButton.click();
    
    // Aguarda validação
    await page.waitForTimeout(500);
    
    // Verifica se há mensagens de erro ou validação HTML5
    const errorMessages = page.locator('[class*="error"], [class*="invalid"], [role="alert"]');
    const count = await errorMessages.count();
    
    // Deve ter pelo menos 1 mensagem de erro
    expect(count).toBeGreaterThan(0);
  });

  test('deve ter campo de busca ou filtro', async ({ page }) => {
    // Procura input de busca
    const searchInput = page.getByRole('textbox', { 
      name: /buscar|pesquisar|filtrar|search/i 
    }).or(page.locator('input[type="search"], input[placeholder*="buscar" i]'));
    
    const isVisible = await searchInput.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(searchInput).toBeVisible();
    } else {
      // Se não há busca, deve ter tabela ou lista de empresas
      const table = page.locator('table, [role="table"]');
      const list = page.locator('ul, ol, [role="list"]');
      
      const hasTable = await table.isVisible().catch(() => false);
      const hasList = await list.isVisible().catch(() => false);
      
      expect(hasTable || hasList).toBe(true);
    }
  });

  test('deve exibir lista ou mensagem de empresas vazias', async ({ page }) => {
    // Verifica se há tabela com dados
    const table = page.locator('table, [role="table"]');
    const hasTable = await table.isVisible().catch(() => false);
    
    if (hasTable) {
      // Se há tabela, deve ter pelo menos cabeçalho
      const headers = table.locator('th, [role="columnheader"]');
      const count = await headers.count();
      expect(count).toBeGreaterThan(0);
    } else {
      // Se não há tabela, deve ter mensagem de lista vazia
      const emptyMessage = page.locator('text=/nenhuma empresa|lista vazia|sem empresas|não há empresas/i');
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('deve ter ações nas empresas listadas', async ({ page }) => {
    // Verifica se há tabela
    const table = page.locator('table, [role="table"]');
    const hasTable = await table.isVisible().catch(() => false);
    
    if (hasTable) {
      // Verifica se há botões de ação (editar, excluir, visualizar)
      const actionButtons = page.locator('button[title], button[aria-label], a[title], a[aria-label]');
      const count = await actionButtons.count();
      
      if (count > 0) {
        // Verifica se há tooltips ou labels descritivos
        const firstButton = actionButtons.first();
        const title = await firstButton.getAttribute('title');
        const ariaLabel = await firstButton.getAttribute('aria-label');
        
        expect(title || ariaLabel).toBeTruthy();
      }
    }
  });

  test('deve carregar página sem erros', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/empresas');
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = errors.filter(
      (error) => !error.includes('Hydration') && !error.includes('Warning')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
