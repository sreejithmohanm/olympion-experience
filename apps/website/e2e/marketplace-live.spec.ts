import { expect, test } from '@playwright/test';

test('publishing and unpublishing a listing updates a signed-in marketplace live', async ({
  browser
}) => {
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await admin.addInitScript(() => {
    window.addEventListener('olympion:marketplace-stream', (event) => {
      const metricsWindow = window as Window & {
        __marketplaceStreamMetrics?: unknown[];
      };
      metricsWindow.__marketplaceStreamMetrics ??= [];
      metricsWindow.__marketplaceStreamMetrics.push(
        (event as CustomEvent).detail
      );
    });
  });

  await admin.goto('http://127.0.0.1:3001');
  await admin.getByLabel('API key').fill('test-admin-key');
  await admin.getByRole('button', { name: 'Access Console' }).click();
  await expect(admin).toHaveURL(/employees/);
  await admin.goto('http://127.0.0.1:3001/admin/listings');
  await expect(
    admin.getByRole('button', { name: /Ari Architect/ })
  ).toBeVisible();
  await expect(
    admin.getByText('Live marketplace updates connected')
  ).toBeVisible();

  const customerContext = await browser.newContext();
  const customer = await customerContext.newPage();
  await customer.addInitScript(() => {
    window.addEventListener('olympion:marketplace-stream', (event) => {
      const metricsWindow = window as Window & {
        __marketplaceStreamMetrics?: unknown[];
      };
      metricsWindow.__marketplaceStreamMetrics ??= [];
      metricsWindow.__marketplaceStreamMetrics.push(
        (event as CustomEvent).detail
      );
    });
  });
  await customer.goto('http://127.0.0.1:3000/login');
  await customer.getByLabel('Email').fill('customer@example.test');
  await customer.getByLabel('Password').fill('customer-password');
  await customer.getByRole('button', { name: 'Sign in' }).click();
  await expect(customer).toHaveURL(/marketplace/);
  await expect(
    customer.getByText('Live marketplace updates connected')
  ).toBeVisible();
  await expect
    .poll(() =>
      customer.evaluate(() =>
        (
          window as Window & {
            __marketplaceStreamMetrics?: { event: string }[];
          }
        ).__marketplaceStreamMetrics?.some(
          (metric) => metric.event === 'connected'
        )
      )
    )
    .toBe(true);
  await expect
    .poll(() =>
      admin.evaluate(() =>
        (
          window as Window & {
            __marketplaceStreamMetrics?: { event: string }[];
          }
        ).__marketplaceStreamMetrics?.some(
          (metric) => metric.event === 'connected'
        )
      )
    )
    .toBe(true);
  await expect(
    customer.getByRole('heading', { name: 'Ari Architect' })
  ).toHaveCount(0);

  await admin.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(
    customer.getByRole('heading', { name: 'Ari Architect' })
  ).toBeVisible();

  await admin.getByRole('button', { name: 'Unpublish', exact: true }).click();
  await expect(
    customer.getByRole('heading', { name: 'Ari Architect' })
  ).toHaveCount(0);

  await customer.evaluate(() =>
    fetch('http://127.0.0.1:4000/__test/disable-stream', { method: 'POST' })
  );
  await expect(
    customer.getByRole('alert').filter({
      hasText: 'Live marketplace updates are unavailable'
    })
  ).toBeVisible();
  await expect(
    admin.getByRole('alert').filter({
      hasText: 'Live marketplace updates are unavailable'
    })
  ).toBeVisible();
  await expect
    .poll(() =>
      customer.evaluate(() =>
        (
          window as Window & {
            __marketplaceStreamMetrics?: { event: string }[];
          }
        ).__marketplaceStreamMetrics?.some(
          (metric) => metric.event === 'connection_error'
        )
      )
    )
    .toBe(true);
  await expect
    .poll(() =>
      admin.evaluate(() =>
        (
          window as Window & {
            __marketplaceStreamMetrics?: { event: string }[];
          }
        ).__marketplaceStreamMetrics?.some(
          (metric) => metric.event === 'connection_error'
        )
      )
    )
    .toBe(true);

  await adminContext.close();
  await customerContext.close();
});
