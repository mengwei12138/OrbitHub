import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PUBLISH_STATUS_CODE } from '@/services/content/types';

import StatusBadge from '../index';

describe('StatusBadge 组件', () => {
  it('应正确显示审核中状态', () => {
    render(<StatusBadge status={PUBLISH_STATUS_CODE.UNDER_REVIEW} />);
    expect(screen.getByText('审核中')).toBeInTheDocument();
  });

  it('应正确显示发布成功状态', () => {
    render(<StatusBadge status={PUBLISH_STATUS_CODE.PUBLISH_SUCCESS} />);
    expect(screen.getByText('发布成功')).toBeInTheDocument();
  });

  it('应正确显示发布失败状态', () => {
    render(<StatusBadge status={PUBLISH_STATUS_CODE.PUBLISH_FAILED} />);
    expect(screen.getByText('发布失败')).toBeInTheDocument();
  });

  it('应正确处理空状态', () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText('未知')).toBeInTheDocument();
  });
});
