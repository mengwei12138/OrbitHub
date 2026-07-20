import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import LoadingSkeleton from '../index';

describe('LoadingSkeleton', () => {
  it('渲染加载骨架屏', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByText('AI 正在为您生成优化建议…')).toBeInTheDocument();
  });
});
