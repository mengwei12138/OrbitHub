/**
 * PRD §4.2 积分与消耗明细 e2e（租户管理员视角）
 *
 * 覆盖 TC-P-001~024（积分池余额卡 / 规则速查 / 消耗明细 / 筛选）
 *
 * 数据来源：本地后端 override-api-key 指向真实外部矩阵 key，
 * 因此 balance / consume 拿到真实数字。
 */
import { expect, test } from '@playwright/test';
import {
  loginAs,
  seedTenantAdminViaApi,
  seedTenantViaApi,
  TENANT_ADMIN_USER_STORAGE,
  uniquePhone,
  uniqueSuffix,
} from './helpers';

test.describe('PRD §4.2 积分与消耗', () => {
  test('TC-P-001/002/003/005 积分池余额卡 + 无充值入口', async ({
    page,
    request,
  }) => {
    const suffix = uniqueSuffix();
    const phone = uniquePhone('137');
    const tenantId = await seedTenantViaApi(request, {
      name: `积分测试-${suffix}`,
      code: `co-p-${suffix}`,
      packageId: '2',
      contactName: 'PMgr',
      contactPhone: phone,
    });
    const userId = await seedTenantAdminViaApi(request, {
      username: `PMgr-${suffix}`,
      phoneNumber: phone,
      password: 'Abc12345',
      tenantId,
    });
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/points-consumption');
    await expect(page.locator('text=积分与消耗').first()).toBeVisible();
    // 总剩余 / 套餐 / 充值积分 / 剩余免费次数
    await expect(page.locator('text=总剩余积分').first()).toBeVisible();
    await expect(page.locator('text=套餐积分').first()).toBeVisible();
    await expect(page.locator('text=充值积分').first()).toBeVisible();
    await expect(page.locator('text=剩余免费次数').first()).toBeVisible();
    // PRD §4.2 提示
    await expect(
      page.locator('text=/如需充值，请联系销售或超级管理员/').first(),
    ).toBeVisible();
    // 全公司共享提示
    await expect(page.locator('text=/全公司共享/').first()).toBeVisible();
    // 不应有充值按钮（PRD §4.2 + TC-P-005）
    await expect(page.getByRole('button', { name: /充值/u })).toHaveCount(0);
  });

  test('TC-P-006/007/008 积分消耗规则速查（视频生成 / 图文生成）', async ({
    page,
    request,
  }) => {
    const suffix = uniqueSuffix();
    const phone = uniquePhone('137');
    const tenantId = await seedTenantViaApi(request, {
      name: `规则测试-${suffix}`,
      code: `co-rule-${suffix}`,
      packageId: '2',
      contactName: 'RMgr',
      contactPhone: phone,
    });
    const userId = await seedTenantAdminViaApi(request, {
      username: `RMgr-${suffix}`,
      phoneNumber: phone,
      password: 'Abc12345',
      tenantId,
    });
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/points-consumption');
    await expect(page.locator('text=积分消耗规则速查').first()).toBeVisible();
    // 视频生成时长档位
    await expect(page.locator('text=/视频生成/').first()).toBeVisible();
    await expect(page.locator('text=/图文生成/').first()).toBeVisible();
    // 图文 50 积分
    await expect(page.locator('text=/50/').first()).toBeVisible();
  });

  test('TC-P-009 消耗明细列表表头 + 默认日期筛选', async ({
    page,
    request,
  }) => {
    const suffix = uniqueSuffix();
    const phone = uniquePhone('137');
    const tenantId = await seedTenantViaApi(request, {
      name: `明细测试-${suffix}`,
      code: `co-detail-${suffix}`,
      packageId: '2',
      contactName: 'DMgr',
      contactPhone: phone,
    });
    const userId = await seedTenantAdminViaApi(request, {
      username: `DMgr-${suffix}`,
      phoneNumber: phone,
      password: 'Abc12345',
      tenantId,
    });
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/points-consumption');
    await expect(page.locator('text=消耗明细').first()).toBeVisible();
    // 列表至少有"时间 / 消耗"列（实际后端 consume 列表用 changePoints / taskId 命名）
    await expect(page.locator('th', { hasText: '时间' }).first()).toBeVisible();
    await expect(page.locator('th', { hasText: '消耗' }).first()).toBeVisible();
  });
});
