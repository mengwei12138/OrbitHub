import { expect, test } from '@playwright/test';

import { mockPublishJobResponse } from './fixtures/publish-job-qr.mock';

test.describe('发布进度弹窗 - 二维码二次验证', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/content/publish/jobs/**', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPublishJobResponse),
      });
    });
  });

  test('mock 数据下应展示 VerifyPanel 与二维码图片', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(
      () => document.body.dataset.e2eReady === 'true',
      undefined,
      { timeout: 30_000 },
    );

    const modal = page.getByTestId('publish-progress-modal');
    await expect(modal).toBeVisible();

    const verifyPanel = page.getByTestId('verify-panel');
    await expect(verifyPanel).toBeVisible({ timeout: 10_000 });

    const qrCard = page.getByTestId('verify-card-qr-121');
    await expect(qrCard).toBeVisible();
    await expect(qrCard).toHaveAttribute('data-verify-type', 'qr');

    const qrImage = page.getByTestId('verify-qr-image-121');
    await expect(qrImage).toBeVisible();
    await expect(qrImage).toHaveAttribute('src', /^data:image\//u);

    await expect(page.getByText('需要扫码验证')).toBeVisible();
    await expect(page.getByText('请使用原设备扫码验证')).toBeVisible();

    await page.screenshot({
      path: 'e2e/artifacts/publish-qr-verify-panel.png',
      fullPage: true,
    });
  });
});
