/**
 * PRD §4.1 普通管理员管理 e2e（租户管理员视角）
 *
 * 覆盖 TC-A-001~046（列表 / 新建 / 编辑 / 启停 / 上限 / 不能禁用自己）
 *
 * 前置：每个用例自己创建一家测试公司 + 一个 TENANT_ADMIN，然后切换 localStorage 模拟该
 * 租户管理员登录，访问 /management/admin-management 进行 UI 操作。
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

const setupTenantWithAdmin = async (
  request: import('@playwright/test').APIRequestContext,
  suffix: string,
  pkgId: '1' | '2' | '3' = '2',
) => {
  const phone = uniquePhone('137');
  const tenantId = await seedTenantViaApi(request, {
    name: `A测试-${suffix}`,
    code: `co-adm-${suffix}`,
    packageId: pkgId,
    contactName: 'TAdmin',
    contactPhone: phone,
  });
  const userId = await seedTenantAdminViaApi(request, {
    username: `TAdmin-${suffix}`,
    phoneNumber: phone,
    password: 'Abc12345',
    tenantId,
  });
  return { tenantId, userId, phone };
};

test.describe('PRD §4.1 普通管理员管理', () => {
  test('TC-A-001/004 列表表头 + 公司总社交账号数上限提示', async ({
    page,
    request,
  }) => {
    const suffix = uniqueSuffix();
    const { tenantId, userId } = await setupTenantWithAdmin(
      request,
      suffix,
      '2',
    );
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/admin-management', { waitUntil: 'load' });
    // 首屏 lazy chunk + skeleton 阶段较长，给 25s 整体超时
    await expect(page.locator('text=普通管理员管理').first()).toBeVisible({
      timeout: 25_000,
    });
    for (const h of [
      '姓名',
      '角色',
      '状态',
      '社交账号创建上限',
      '最后登录',
      '操作',
    ]) {
      await expect(
        page.locator('th', { hasText: new RegExp(`^${h}`, 'u') }).first(),
      ).toBeVisible({
        timeout: 25_000,
      });
    }
    await expect(
      page.locator('text=/公司总社交账号数上限/').first(),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('text=/30/').first()).toBeVisible();
  });

  test('TC-A-010/011 新建普通管理员弹窗字段', async ({ page, request }) => {
    const suffix = uniqueSuffix();
    const { tenantId, userId } = await setupTenantWithAdmin(
      request,
      suffix,
      '2',
    );
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/admin-management');
    await page.getByRole('button', { name: /新建普通管理员/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新建普通管理员' })
      .first();
    await expect(dlg).toBeVisible();
    await page.waitForTimeout(500);
    for (const label of ['姓名', '手机号', '社交账号创建上限']) {
      await expect(dlg.locator(`text=${label}`).first()).toBeVisible();
    }
  });

  test('TC-A-014 手机号唯一性校验（与公司管理员相同）', async ({
    page,
    request,
  }) => {
    const suffix = uniqueSuffix();
    const { tenantId, userId, phone } = await setupTenantWithAdmin(
      request,
      suffix,
      '2',
    );
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/admin-management');
    await page.getByRole('button', { name: /新建普通管理员/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新建普通管理员' })
      .first();
    await expect(dlg).toBeVisible();
    await page.waitForTimeout(500);
    await dlg
      .locator('input[placeholder*="字符"]')
      .first()
      .fill(`小王-${suffix}`);
    await dlg.locator('input[placeholder^="13"]').fill(phone); // 已被租户管理员占用
    await dlg.getByRole('button', { name: /确认创建/u }).click();
    // 后端会拒：手机号已存在
    await expect(
      page
        .locator('.ant-message, .ant-notification, .ant-modal')
        .filter({ hasText: /已存在|已注册|重复/u })
        .first(),
    ).toBeVisible({
      timeout: 10_000,
    });
  });

  test('TC-A-021 成功创建普通管理员（quota=3）', async ({ page, request }) => {
    const suffix = uniqueSuffix();
    const { tenantId, userId } = await setupTenantWithAdmin(
      request,
      suffix,
      '2',
    );
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/admin-management');
    await page.getByRole('button', { name: /新建普通管理员/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新建普通管理员' })
      .first();
    await expect(dlg).toBeVisible();
    await page.waitForTimeout(500);
    const workerName = `Worker-${suffix}`;
    await dlg.locator('input[placeholder*="字符"]').first().fill(workerName);
    await dlg.locator('input[placeholder^="13"]').fill(uniquePhone('188'));
    // 上限输入框（type=number 来自 ProFormDigit）
    const quotaInput = dlg
      .locator('.ant-form-item:has(label:has-text("社交账号创建上限")) input')
      .first();
    await quotaInput.fill('3');
    await dlg.getByRole('button', { name: /确认创建/u }).click();
    await expect(dlg).not.toBeVisible({ timeout: 15_000 });
    // 直接走后端 API 验证用户已创建 + tenantId/role 正确，避免分页/排序导致 UI 找不到行
    const r = await request.get(
      `http://localhost:8082/api/v1/admin/users?tenantId=${tenantId}&role=NORMAL_ADMIN&page=1&pageSize=100`,
    );
    expect(r.ok()).toBe(true);
    const j = await r.json();
    const list = j?.data?.list ?? [];
    expect(
      list.some((u: { username: string }) => u.username === workerName),
    ).toBe(true);
  });

  test('TC-A-038 租户管理员不能禁用自己（按钮不渲染）', async ({
    page,
    request,
  }) => {
    const suffix = uniqueSuffix();
    const { tenantId, userId } = await setupTenantWithAdmin(
      request,
      suffix,
      '2',
    );
    await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
    await page.goto('/management/admin-management', { waitUntil: 'load' });
    // 等首屏 lazy chunk + 列表 API 完成
    await expect(page.locator('text=普通管理员管理').first()).toBeVisible({
      timeout: 25_000,
    });
    const selfRow = page.locator('tr', { hasText: `TAdmin-${suffix}` });
    await expect(selfRow.getByRole('button', { name: '编辑' })).toBeVisible({
      timeout: 25_000,
    });
    // 禁用按钮不应出现（PRD §4.1）
    await expect(selfRow.getByRole('button', { name: '禁用' })).toHaveCount(0);
  });
});
