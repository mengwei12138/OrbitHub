import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CustomEmpty from '../index';

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

describe('CustomEmpty', () => {
  it('渲染空状态组件', () => {
    const { container } = render(<CustomEmpty />);
    expect(container.querySelector('.ant-empty')).toBeInTheDocument();
  });

  it('自定义 description', () => {
    render(<CustomEmpty description="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('description 为空时不显示描述文字', () => {
    render(<CustomEmpty description="" />);
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
  });
});
