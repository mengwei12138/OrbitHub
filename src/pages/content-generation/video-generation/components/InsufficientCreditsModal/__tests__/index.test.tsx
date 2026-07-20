import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InsufficientCreditsModal } from '../index';

describe('InsufficientCreditsModal', () => {
  const mockCreditInfo = {
    current: 20,
    cost: 100,
    shortage: 80,
  };

  it('visible 为 false 时不渲染', () => {
    const { container } = render(
      <InsufficientCreditsModal visible={false} creditInfo={mockCreditInfo} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('visible 为 true 时渲染', () => {
    render(<InsufficientCreditsModal visible creditInfo={mockCreditInfo} />);
    expect(screen.getByText('积分不足')).toBeTruthy();
  });

  it('显示积分信息', () => {
    render(<InsufficientCreditsModal visible creditInfo={mockCreditInfo} />);
    expect(screen.getByText('当前积分')).toBeTruthy();
    expect(screen.getByText('本次消耗')).toBeTruthy();
    expect(screen.getByText('不足积分')).toBeTruthy();
  });

  it('显示积分不足数值', () => {
    render(<InsufficientCreditsModal visible creditInfo={mockCreditInfo} />);
    expect(screen.getByText('80')).toBeTruthy();
  });

  it('渲染联系提示', () => {
    render(<InsufficientCreditsModal visible creditInfo={mockCreditInfo} />);
    expect(screen.getByText(/如需充值，请联系销售或超级管理员/u)).toBeTruthy();
  });

  it('关闭按钮可点击', () => {
    const onClose = vi.fn();
    render(
      <InsufficientCreditsModal
        visible
        creditInfo={mockCreditInfo}
        onClose={onClose}
      />,
    );
    screen.getByText('✕').click();
    expect(onClose).toHaveBeenCalled();
  });

  it('我知道了按钮可点击', () => {
    const onClose = vi.fn();
    render(
      <InsufficientCreditsModal
        visible
        creditInfo={mockCreditInfo}
        onClose={onClose}
      />,
    );
    screen.getByText('我知道了').click();
    expect(onClose).toHaveBeenCalled();
  });
});
