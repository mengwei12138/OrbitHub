# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-admin-management.spec.ts >> PRD §4.1 普通管理员管理 >> TC-A-038 租户管理员不能禁用自己（按钮不渲染）
- Location: e2e\management\04-admin-management.spec.ts:132:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=普通管理员管理').first()
Expected: visible
Timeout: 25000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 25000ms
  - waiting for locator('text=普通管理员管理').first()

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - heading [level=3] [ref=e5]
  - list [ref=e6]:
    - listitem [ref=e7]
    - listitem [ref=e8]
    - listitem [ref=e9]
    - listitem [ref=e10]
    - listitem [ref=e11]
    - listitem [ref=e12]
    - listitem [ref=e13]
    - listitem [ref=e14]
```

# Test source

```ts
  38  |   return { tenantId, userId, phone };
  39  | };
  40  | 
  41  | test.describe('PRD §4.1 普通管理员管理', () => {
  42  |   test('TC-A-001/004 列表表头 + 公司总社交账号数上限提示', async ({
  43  |     page,
  44  |     request,
  45  |   }) => {
  46  |     const suffix = uniqueSuffix();
  47  |     const { tenantId, userId } = await setupTenantWithAdmin(request, suffix, '2');
  48  |     await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
  49  |     await page.goto('/management/admin-management', { waitUntil: 'load' });
  50  |     // 首屏 lazy chunk + skeleton 阶段较长，给 25s 整体超时
  51  |     await expect(page.locator('text=普通管理员管理').first()).toBeVisible({
  52  |       timeout: 25_000,
  53  |     });
  54  |     for (const h of ['姓名', '角色', '状态', '社交账号创建上限', '最后登录', '操作']) {
  55  |       await expect(page.locator('th', { hasText: new RegExp(`^${h}`) }).first()).toBeVisible({
  56  |         timeout: 25_000,
  57  |       });
  58  |     }
  59  |     await expect(page.locator('text=/公司总社交账号数上限/').first()).toBeVisible({
  60  |       timeout: 15_000,
  61  |     });
  62  |     await expect(page.locator('text=/30/').first()).toBeVisible();
  63  |   });
  64  | 
  65  |   test('TC-A-010/011 新建普通管理员弹窗字段', async ({ page, request }) => {
  66  |     const suffix = uniqueSuffix();
  67  |     const { tenantId, userId } = await setupTenantWithAdmin(request, suffix, '2');
  68  |     await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
  69  |     await page.goto('/management/admin-management');
  70  |     await page.getByRole('button', { name: /新建普通管理员/ }).click();
  71  |     const dlg = page.locator('.ant-modal-content').filter({ hasText: '新建普通管理员' }).first();
  72  |     await expect(dlg).toBeVisible();
  73  |     await page.waitForTimeout(500);
  74  |     for (const label of ['姓名', '手机号', '社交账号创建上限']) {
  75  |       await expect(dlg.locator(`text=${label}`).first()).toBeVisible();
  76  |     }
  77  |   });
  78  | 
  79  |   test('TC-A-014 手机号唯一性校验（与公司管理员相同）', async ({ page, request }) => {
  80  |     const suffix = uniqueSuffix();
  81  |     const { tenantId, userId, phone } = await setupTenantWithAdmin(
  82  |       request,
  83  |       suffix,
  84  |       '2',
  85  |     );
  86  |     await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
  87  |     await page.goto('/management/admin-management');
  88  |     await page.getByRole('button', { name: /新建普通管理员/ }).click();
  89  |     const dlg = page.locator('.ant-modal-content').filter({ hasText: '新建普通管理员' }).first();
  90  |     await expect(dlg).toBeVisible();
  91  |     await page.waitForTimeout(500);
  92  |     await dlg.locator('input[placeholder*="字符"]').first().fill(`小王-${suffix}`);
  93  |     await dlg.locator('input[placeholder^="13"]').fill(phone); // 已被租户管理员占用
  94  |     await dlg.getByRole('button', { name: /确认创建/ }).click();
  95  |     // 后端会拒：手机号已存在
  96  |     await expect(page.locator('.ant-message, .ant-notification, .ant-modal').filter({ hasText: /已存在|已注册|重复/ }).first()).toBeVisible({
  97  |       timeout: 10_000,
  98  |     });
  99  |   });
  100 | 
  101 |   test('TC-A-021 成功创建普通管理员（quota=3）', async ({ page, request }) => {
  102 |     const suffix = uniqueSuffix();
  103 |     const { tenantId, userId } = await setupTenantWithAdmin(request, suffix, '2');
  104 |     await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
  105 |     await page.goto('/management/admin-management');
  106 |     await page.getByRole('button', { name: /新建普通管理员/ }).click();
  107 |     const dlg = page.locator('.ant-modal-content').filter({ hasText: '新建普通管理员' }).first();
  108 |     await expect(dlg).toBeVisible();
  109 |     await page.waitForTimeout(500);
  110 |     const workerName = `Worker-${suffix}`;
  111 |     await dlg.locator('input[placeholder*="字符"]').first().fill(workerName);
  112 |     await dlg.locator('input[placeholder^="13"]').fill(uniquePhone('188'));
  113 |     // 上限输入框（type=number 来自 ProFormDigit）
  114 |     const quotaInput = dlg
  115 |       .locator('.ant-form-item:has(label:has-text("社交账号创建上限")) input')
  116 |       .first();
  117 |     await quotaInput.fill('3');
  118 |     await dlg.getByRole('button', { name: /确认创建/ }).click();
  119 |     await expect(dlg).not.toBeVisible({ timeout: 15_000 });
  120 |     // 直接走后端 API 验证用户已创建 + tenantId/role 正确，避免分页/排序导致 UI 找不到行
  121 |     const r = await request.get(
  122 |       `http://localhost:8082/api/v1/admin/users?tenantId=${tenantId}&role=NORMAL_ADMIN&page=1&pageSize=100`,
  123 |     );
  124 |     expect(r.ok()).toBe(true);
  125 |     const j = await r.json();
  126 |     const list = j?.data?.list ?? [];
  127 |     expect(
  128 |       list.some((u: { username: string }) => u.username === workerName),
  129 |     ).toBe(true);
  130 |   });
  131 | 
  132 |   test('TC-A-038 租户管理员不能禁用自己（按钮不渲染）', async ({ page, request }) => {
  133 |     const suffix = uniqueSuffix();
  134 |     const { tenantId, userId } = await setupTenantWithAdmin(request, suffix, '2');
  135 |     await loginAs(page, TENANT_ADMIN_USER_STORAGE(userId, tenantId));
  136 |     await page.goto('/management/admin-management', { waitUntil: 'load' });
  137 |     // 等首屏 lazy chunk + 列表 API 完成
> 138 |     await expect(page.locator('text=普通管理员管理').first()).toBeVisible({
      |                                                        ^ Error: expect(locator).toBeVisible() failed
  139 |       timeout: 25_000,
  140 |     });
  141 |     const selfRow = page.locator('tr', { hasText: `TAdmin-${suffix}` });
  142 |     await expect(selfRow.getByRole('button', { name: '编辑' })).toBeVisible({
  143 |       timeout: 25_000,
  144 |     });
  145 |     // 禁用按钮不应出现（PRD §4.1）
  146 |     await expect(selfRow.getByRole('button', { name: '禁用' })).toHaveCount(0);
  147 |   });
  148 | });
  149 | 
```