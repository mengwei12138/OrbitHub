/**
 * PRD §3.2 公司管理 e2e
 *
 * 覆盖 TC-C-001 / 005 / 009 / 010~012 / 017~023 / 028~033 / 041 / 044 / 050 / 057
 * （UI 可见性 + 弹窗字段 + 表单校验 + 真后端联调）
 *
 * 前置：backend local profile dev-roles=PLATFORM_ADMIN + override-api-key 已就绪。
 */
import { expect, test } from '@playwright/test';
import {
  loginAs,
  SUPER_ADMIN_USER_STORAGE,
  seedTenantAdminViaApi,
  seedTenantViaApi,
  uniquePhone,
  uniqueSuffix,
} from './helpers';

test.describe('PRD §3.2 公司管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, SUPER_ADMIN_USER_STORAGE);
  });

  test('TC-C-001 列表默认加载，表头含 公司名称/套餐/管理员数/社交账号池/状态/操作', async ({
    page,
  }) => {
    await page.goto('/management/company-management');
    // PageHeader 渲染为 <div> 而非 <hX>，用文本匹配
    await expect(page.locator('text=公司管理').first()).toBeVisible();
    // 表头校验
    const headers = [
      '公司名称',
      '套餐',
      '管理员数',
      '社交账号池',
      '状态',
      '操作',
    ];
    for (const h of headers) {
      await expect(
        page.locator('th', { hasText: new RegExp(`^${h}`, 'u') }).first(),
      ).toBeVisible();
    }
  });

  test('TC-C-009 +TC-C-010 入口可见 + 新增公司弹窗字段完整（含初始积分）', async ({
    page,
  }) => {
    await page.goto('/management/company-management');
    const btn = page.getByRole('button', { name: /新增公司/u });
    await expect(btn).toBeVisible();
    await btn.click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新增公司' })
      .first();
    await expect(dlg).toBeVisible();
    await expect(dlg).toBeVisible();
    // 6 个字段：公司名称 / 手机号 / 姓名 / 选择套餐 / 初始积分（含说明文字）
    for (const label of [
      '公司名称',
      '手机号',
      '姓名',
      '选择套餐',
      '初始积分',
    ]) {
      await expect(dlg.locator(`text=${label}`).first()).toBeVisible();
    }
    // 初始积分输入框是 readOnly+disabled（PRD §3.2 / figma）
    await expect(dlg.locator('[data-testid="initial-points"]')).toBeDisabled();
  });

  test('TC-C-012a/b/c 初始积分按套餐自动填充（标准版=0 / 专业版=20,000 / 企业版=100,000）', async ({
    page,
  }) => {
    await page.goto('/management/company-management');
    await page.getByRole('button', { name: /新增公司/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新增公司' })
      .first();
    await expect(dlg).toBeVisible();
    const ip = dlg.locator('[data-testid="initial-points"]');
    const pickPackage = async (text: string) => {
      await dlg.locator('.ant-select-selector').first().click();
      await page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .locator('.ant-select-item-option-content', { hasText: text })
        .click();
    };
    await pickPackage('标准版');
    await expect(ip).toHaveValue('0');
    await pickPackage('专业版');
    await expect(ip).toHaveValue('20,000');
    await pickPackage('企业版');
    await expect(ip).toHaveValue('100,000');
  });

  test('TC-C-011 套餐下拉显示 3 个选项（标准版 / 专业版 / 企业版）', async ({
    page,
  }) => {
    await page.goto('/management/company-management');
    await page.getByRole('button', { name: /新增公司/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新增公司' })
      .first();
    await expect(dlg).toBeVisible();
    await dlg.locator('.ant-select-selector').first().click();
    const dropdown = page.locator(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
    );
    await expect(dropdown).toBeVisible();
    await expect(
      dropdown.locator('.ant-select-item-option-content', {
        hasText: '标准版',
      }),
    ).toBeVisible();
    await expect(
      dropdown.locator('.ant-select-item-option-content', {
        hasText: '专业版',
      }),
    ).toBeVisible();
    await expect(
      dropdown.locator('.ant-select-item-option-content', {
        hasText: '企业版',
      }),
    ).toBeVisible();
  });

  test('TC-C-021 + TC-C-022 + TC-C-023 成功创建公司 → 弹窗回显 8 位密码 → 列表新增', async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const phone = uniquePhone('138');
    const name = `E2E公司-${suffix}`;
    await page.goto('/management/company-management');
    await page.getByRole('button', { name: /新增公司/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新增公司' })
      .first();
    await expect(dlg).toBeVisible();
    // 等弹窗动画结束（CustomModal 用了 antd Modal 的过渡）
    await page.waitForTimeout(500);
    // 字段顺序：公司名称(0) / 手机号(1) / 姓名(2)
    // 用 placeholder 精确定位
    await dlg.locator('input[placeholder*="公司名称"]').fill(name);
    await dlg.locator('input[placeholder^="13"]').fill(phone);
    await dlg.locator('input[placeholder*="姓名"]').fill(`经理${suffix}`);
    // 选套餐：专业版
    await dlg.locator('.ant-select-selector').first().click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .locator('.ant-select-item-option-content', { hasText: '专业版' })
      .click();
    await dlg.getByRole('button', { name: /确认创建/u }).click();

    // TC-C-022 创建成功弹窗带 8 位密码
    const successDlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '创建成功' })
      .first();
    await expect(successDlg).toBeVisible({ timeout: 15_000 });
    const text = await successDlg.textContent();
    expect(text).toMatch(/[A-Za-z0-9]{8}/u);

    await successDlg.getByRole('button', { name: /我知道了|确定/iu }).click();
    await expect(successDlg).not.toBeVisible({ timeout: 5_000 });

    // TC-C-023 列表回显新公司（强制刷新避免 React Query 缓存）
    await page.reload();
    await expect(page.locator(`tr:has-text("${name}")`)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('TC-C-018 公司名为空 → 校验拦截', async ({ page }) => {
    await page.goto('/management/company-management');
    await page.getByRole('button', { name: /新增公司/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新增公司' })
      .first();
    await expect(dlg).toBeVisible();
    await page.waitForTimeout(500);
    // 公司名为空，其他字段填合法值
    await dlg.locator('input[placeholder^="13"]').fill(uniquePhone('139'));
    await dlg.locator('input[placeholder*="姓名"]').fill('张三');
    await dlg.locator('.ant-select-selector').first().click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .locator('.ant-select-item-option-content', { hasText: '标准版' })
      .click();
    await dlg.getByRole('button', { name: /确认创建/u }).click();
    await expect(dlg.locator('text=请输入公司名称')).toBeVisible();
  });

  test('TC-C-015 手机号格式校验（10 位被拒）', async ({ page }) => {
    await page.goto('/management/company-management');
    await page.getByRole('button', { name: /新增公司/u }).click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: '新增公司' })
      .first();
    await expect(dlg).toBeVisible();
    await page.waitForTimeout(500);
    await dlg.locator('input[placeholder*="公司名称"]').fill('XYZ');
    await dlg.locator('input[placeholder^="13"]').fill('1381234567'); // 10 位
    await dlg.locator('input[placeholder*="姓名"]').fill('张三');
    await dlg.locator('.ant-select-selector').first().click();
    await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .locator('.ant-select-item-option-content', { hasText: '标准版' })
      .click();
    await dlg.getByRole('button', { name: /确认创建/u }).click();
    await expect(dlg.locator('text=/请输入有效|手机号格式/')).toBeVisible();
  });

  test('TC-C-025 编辑公司弹窗字段（公司名/姓名/手机号 可编辑，状态只读，无套餐字段）', async ({
    page,
    request,
  }) => {
    const suffix = uniqueSuffix();
    const phone = uniquePhone('137');
    const tenantId = await seedTenantViaApi(request, {
      name: `编辑测试-${suffix}`,
      code: `co-edit-${suffix}`,
      packageId: '1',
      contactName: 'EditMgr',
      contactPhone: phone,
    });
    await seedTenantAdminViaApi(request, {
      username: `EditMgr-${suffix}`,
      phoneNumber: phone,
      password: 'Abc12345',
      tenantId,
    });

    await page.goto('/management/company-management');
    await page
      .locator('tr', { hasText: `编辑测试-${suffix}` })
      .getByRole('button', { name: '编辑' })
      .click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: /编辑公司/u })
      .first();
    await expect(dlg).toBeVisible();
    await page.waitForTimeout(500);
    // 用 ant-form-item by label 精确定位（避开 modal 内可能的隐藏输入）
    const nameInput = dlg
      .locator('.ant-form-item:has(label:has-text("公司名称")) input')
      .first();
    await expect(nameInput).toHaveValue(`编辑测试-${suffix}`);
    await expect(dlg.locator('text=/状态/').first()).toBeVisible();
    // 不应有 "套餐" 字段（PRD §3.2: 套餐不可改）
    await expect(dlg.locator('text=/选择套餐/')).toHaveCount(0);
  });

  test('TC-C-044 禁用公司确认弹窗 + 状态更新', async ({ page, request }) => {
    const suffix = uniqueSuffix();
    const phone = uniquePhone('136');
    const tenantId = await seedTenantViaApi(request, {
      name: `禁用测试-${suffix}`,
      code: `co-dis-${suffix}`,
      packageId: '1',
      contactName: 'DisMgr',
      contactPhone: phone,
    });
    await seedTenantAdminViaApi(request, {
      username: `DisMgr-${suffix}`,
      phoneNumber: phone,
      password: 'Abc12345',
      tenantId,
    });
    await page.goto('/management/company-management');
    await page
      .locator('tr', { hasText: `禁用测试-${suffix}` })
      .getByRole('button', { name: '禁用' })
      .click();
    const dlg = page
      .locator('.ant-modal-content')
      .filter({ hasText: /确认禁用|确定要禁用/u })
      .first();
    await expect(dlg).toBeVisible();
    await dlg.getByRole('button', { name: /确认禁用/u }).click();
    // 等弹窗消失（mutateAsync 完成）
    await expect(dlg).not.toBeVisible({ timeout: 10_000 });
    // 强制刷新一次以避免 React Query 命中陈旧缓存
    await page.reload();
    await expect(
      page
        .locator('tr', { hasText: `禁用测试-${suffix}` })
        .getByRole('button', { name: '启用' }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
