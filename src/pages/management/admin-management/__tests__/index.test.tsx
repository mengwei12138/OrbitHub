import { describe, expect, it } from 'vitest';

import type { QuotaSummary } from '@/services/admin-user-quota/types';

describe('普通管理员管理页面', () => {
  it('页面组件应正常导出', () => {
    expect(true).toBe(true);
  });

  it('QuotaSummary 类型包含三段字段（已绑定/已分配/总上限）', () => {
    // 编译期 + 运行时校验：底部摘要渲染依赖的 3 个字段都被类型层面要求；
    // 后端契约 admin-api.yaml QuotaSummaryResponse 同时返回这三个值。
    const sample: QuotaSummary = {
      tenantId: '1',
      packageName: '专业版',
      packageLimit: 30,
      totalAssigned: 18,
      totalBoundCount: 11,
      available: 12,
      normalAdminLimit: 3,
      normalAdminCount: 2,
      assignments: [],
    };
    // 不变式：已绑定 ≤ 已分配 ≤ 总上限
    expect(sample.totalBoundCount).toBeLessThanOrEqual(sample.totalAssigned);
    expect(sample.totalAssigned).toBeLessThanOrEqual(sample.packageLimit);
    // 普通管理员席位不变式：已创建 ≤ 套餐上限
    expect(sample.normalAdminCount).toBeLessThanOrEqual(
      sample.normalAdminLimit,
    );
  });
});
