import { test, expect } from '@grafana/plugin-e2e';

test('should display "No data" in case panel data is empty', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  await expect(panelEditPage.panel.locator).toContainText('No data');
});

test('should display the custom time series toolbar', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

  await expect(panelEditPage.panel.locator.getByRole('button', { name: 'Table View' })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('button', { name: 'Enlarge' })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('button', { name: 'Export' })).toBeVisible();
});
