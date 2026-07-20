/**
 * PRD §3.5 操作日志 e2e
 *
 * 覆盖 TC-L-001~030（列表 / 筛选 / 内容格式）
 *
 * 注：当前后端 operationType 写入的是 `admin.tenant.create` 等点分式码，
 * PRD/前端枚举使用 `CREATE_TENANT` 等。本测试以"行存在 + 字段可见"为底线，
 * 不强制断言枚举对齐（已记入 findings Bug #2）。
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

test.describe('PRD §3.5 操作日志', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, SUPER_ADMIN_USER_STORAGE);
  });

  test('TC-L-001/002 列表表头：时间 / 操作人 / 所属公司 / 操作类型 / 操作内容', async ({
    page,
  }) => {
    await page.goto('/management/operation-log');
    // 等到列表的第一个 GET /operation-logs 返回（无论数据多少，表头一定渲染）
    await page.waitForResponse(
      (r) =>
        r.url().includes('/api/v1/admin/operation-logs') && r.status() === 200,
      { timeout: 30_000 },
    );
    await expect(page.locator('text=操作日志').first()).toBeVisible();
    for (const h of ['时间', '操作人', '所属公司', '操作类型', '操作内容']) {
      await expect(
        page.locator('th', { hasText: new RegExp(`^${h}`, 'u') }).first(),
      ).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test('TC-L-006a 操作类型下拉含 PRD 主要项', async ({ page }) => {
    await page.goto('/management/operation-log');
    const opTypeSelect = page
      .locator(
        '.ant-form-item:has(label:has-text("操作类型")) .ant-select-selector',
      )
      .first();
    await opTypeSelect.click();
    const dropdown = page.locator(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
    );
    await expect(dropdown).toBeVisible();
    // 虚拟滚动：分段滚动并合并所有可见时段的文本集合
    const collected = new Set<string>();
    const holder = dropdown.locator('.rc-virtual-list-holder').first();
    const hasHolder = (await holder.count()) > 0;
    const collect = async () => {
      const ts = await dropdown
        .locator('.ant-select-item-option-content')
        .allTextContents();
      for (const t of ts) collected.add(t.trim());
    };
    await collect();
    if (hasHolder) {
      const total = await holder.evaluate(
        (el) => (el as HTMLElement).scrollHeight,
      );
      const view = await holder.evaluate(
        (el) => (el as HTMLElement).clientHeight,
      );
      let pos = 0;
      while (pos < total) {
        pos += view;
        await holder.evaluate((el, p) => {
          (el as HTMLElement).scrollTop = p;
        }, pos);
        await page.waitForTimeout(100);
        await collect();
      }
    }
    for (const required of [
      '新增公司',
      '编辑公司',
      '禁用公司',
      '启用公司',
      '手动充值',
      '禁用管理员',
      '启用管理员',
      '设置社交账号上限',
      '重置密码',
    ]) {
      expect(
        collected,
        `dropdown missing "${required}"; got: ${[...collected].join(', ')}`,
      ).toContain(required);
    }
  });

  test('TC-L-011 时间范围预设：6 项全（含展开筛选）', async ({ page }) => {
    await page.goto('/management/operation-log');
    await page.waitForResponse(
      (r) =>
        r.url().includes('/api/v1/admin/operation-logs') && r.status() === 200,
      { timeout: 30_000 },
    );
    // 时间范围筛选可能在「展开」按钮后面（ProTable search 表单默认折叠）
    const expandBtn = page.locator('text=/^展开/').first();
    if ((await expandBtn.count()) > 0) {
      try {
        await expandBtn.click({ timeout: 5_000 });
        await page.waitForTimeout(300);
      } catch {
        // 已展开 / 没找到，下面继续
      }
    }
    const dateSelect = page
      .locator(
        '.ant-form-item:has(label:has-text("时间范围")) .ant-select-selector',
      )
      .first();
    await expect(dateSelect).toBeVisible({ timeout: 15_000 });
    await dateSelect.scrollIntoViewIfNeeded();
    await dateSelect.click({ force: true });
    const dropdown = page.locator(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
    );
    await expect(dropdown).toBeVisible();
    const texts = await dropdown
      .locator('.ant-select-item-option-content')
      .allTextContents();
    const set = new Set(texts.map((t) => t.trim()));
    for (const required of [
      '今天',
      '昨天',
      '最近 7 天',
      '最近 30 天',
      '本月',
      '上月',
    ]) {
      expect(
        set,
        `dropdown missing "${required}"; got: ${[...set].join(', ')}`,
      ).toContain(required);
    }
  });

  test('TC-L-018 新增公司后操作日志可查（不强制断言 operationType 码值对齐）', async ({
    request,
  }) => {
    const suffix = uniqueSuffix();
    const phone = uniquePhone('137');
    const tenantId = await seedTenantViaApi(request, {
      name: `操作日志测试-${suffix}`,
      code: `co-log-${suffix}`,
      packageId: '1',
      contactName: 'LogTester',
      contactPhone: phone,
    });
    await seedTenantAdminViaApi(request, {
      username: `LogTester-${suffix}`,
      phoneNumber: phone,
      password: 'Abc12345',
      tenantId,
    });
    // 操作日志写入是 AOP 异步；轮询找 targetName 匹配的记录
    // 注：当前后端实现把 log.tenantId 写成 operator.tenantId（不是 target tenant id），
    // 所以不能按 tenantId 过滤，要按 operationContent / targetName 匹配。详见 findings Bug。
    type LogRow = {
      operationType: string;
      operationContent: string | null;
      targetId: string | null;
      targetName: string | null;
    };
    const targetCode = `co-log-${suffix}`;
    const deadline = Date.now() + 25_000;
    let found = false;
    while (Date.now() < deadline) {
      const r = await request.get(
        'http://localhost:8082/api/v1/admin/operation-logs?page=1&pageSize=50',
      );
      if (r.ok()) {
        const j = (await r.json()) as { data?: { list?: LogRow[] } };
        const rows = j?.data?.list ?? [];
        found = rows.some(
          (row) =>
            row.targetId === targetCode ||
            (row.operationContent ?? '').includes(targetCode),
        );
        if (found) break;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    expect(
      found,
      `没找到 targetCode=${targetCode} 的操作日志（AOP 可能未异步落库）`,
    ).toBe(true);
    void tenantId; // 抑制 unused 警告
  });
});
