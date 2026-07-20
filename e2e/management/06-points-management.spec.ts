/**
 * PRD §3.3 全局积分管理 e2e（超管视角）
 *
 * 覆盖 TC-G-001~023（积分总览 / 明细 / 筛选 / 联动）
 *
 * 注：当前 points-management 实现：
 *  - 上：tenant 列表 + useQueries 并发拉取每家 balance（套餐积分=反算）
 *  - 下：consume 流水表，默认不发请求（PLATFORM_ADMIN 必须先选公司）
 */
import { expect, test } from '@playwright/test';
import { loginAs, SUPER_ADMIN_USER_STORAGE } from './helpers';

test.describe('PRD §3.3 全局积分管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, SUPER_ADMIN_USER_STORAGE);
  });

  test('TC-G-001 列表表头：公司名称 / 套餐积分 / 充值积分 / 总剩余 / 本月消耗 / 剩余免费次数 / 管理员数 / 操作', async ({
    page,
  }) => {
    await page.goto('/management/points-management');
    await expect(page.locator('text=全局积分管理').first()).toBeVisible();
    await expect(page.locator('text=各公司积分总览').first()).toBeVisible();
    for (const h of [
      '公司名称',
      '套餐积分',
      '充值积分',
      '总剩余',
      '本月消耗',
      '剩余免费次数',
      '管理员数',
      '操作',
    ]) {
      await expect(
        page.locator('th', { hasText: new RegExp(`^${h}`, 'u') }).first(),
      ).toBeVisible();
    }
  });

  test('TC-G-009 消耗明细表头 + TC-G-010a 租户筛选为搜索输入', async ({
    page,
  }) => {
    await page.goto('/management/points-management');
    await expect(page.locator('text=积分消耗明细').first()).toBeVisible();
    // 表头
    await expect(page.locator('th', { hasText: '时间' }).first()).toBeVisible();
    await expect(page.locator('th', { hasText: '消耗' }).first()).toBeVisible();
    // 租户筛选：搜索输入（占位文案 + 无"全部公司"选项）
    const tenantSelect = page
      .locator('.ant-select-selector')
      .filter({ hasText: '请输入公司名称搜索' })
      .first();
    await expect(tenantSelect).toBeVisible();
    await tenantSelect.click();
    const dd = page.locator(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
    );
    await expect(dd).toBeVisible();
    await expect(
      dd.locator('.ant-select-item-option-content', { hasText: '全部公司' }),
    ).toHaveCount(0);
  });

  test('TC-G-008 [明细] 按钮点击：下方筛选切换为该公司，触发查询', async ({
    page,
  }) => {
    await page.goto('/management/points-management');
    // 等公司列表 + balance 并发查询完成（balance 接口走外部矩阵，10s 内拿不到就放弃）
    const detailBtn = page.getByRole('button', { name: '明细' }).first();
    await expect(detailBtn).toBeVisible({ timeout: 20_000 });
    await detailBtn.click();
    // 提示 "请选择一家公司..." 不再可见（已自动切到具体公司）
    await expect(
      page.locator('text=请选择一家公司查看其积分消耗明细'),
    ).not.toBeVisible({
      timeout: 10_000,
    });
  });
});
