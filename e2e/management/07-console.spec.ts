/**
 * PRD §3.1 控制台 e2e
 *
 * 覆盖 TC-K-001（默认看板）+ TC-K-004（刷新按钮）+ TC-K-006/007（最近动态）
 *
 * 注：当前 console 页用 mock 数据，未接真实 API。
 * 用例只验证页面结构 + 关键元素可见，不强校验数据来源。
 */
import { expect, test } from '@playwright/test';
import { loginAs, SUPER_ADMIN_USER_STORAGE } from './helpers';

test.describe('PRD §3.1 控制台', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, SUPER_ADMIN_USER_STORAGE);
  });

  test('TC-K-001 / TC-K-004 / TC-K-006 默认看板 + 刷新按钮 + 最近动态', async ({
    page,
  }) => {
    await page.goto('/management/console');
    await expect(page.locator('text=控制台').first()).toBeVisible();
    await expect(page.locator('text=运营看板').first()).toBeVisible();
    await expect(page.locator('text=总租户数').first()).toBeVisible();
    await expect(page.locator('text=最近动态').first()).toBeVisible();
    // 刷新按钮（TC-K-004）
    await expect(
      page.getByRole('button', { name: /^刷\s*新$/u }),
    ).toBeVisible();
  });

  test('TC-K-007 最近动态表头：时间 / 操作人 / 操作内容', async ({ page }) => {
    await page.goto('/management/console');
    // 给 React Query 1s 拉数据，避开 skeleton 阶段
    await page.waitForTimeout(1500);
    for (const h of ['时间', '操作人', '操作内容']) {
      await expect(
        page.locator('th', { hasText: new RegExp(`^${h}`, 'u') }).first(),
      ).toBeVisible({
        timeout: 15_000,
      });
    }
  });
});
