import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ContentConfigSection } from '../index';

describe('ContentConfigSection', () => {
  const mockProps = {
    coreSellingPoint: '',
    targetAudience: '',
    onCoreSellingPointChange: vi.fn(),
    onTargetAudienceChange: vi.fn(),
  };

  it('渲染卡片标题', () => {
    render(<ContentConfigSection {...mockProps} />);
    expect(screen.getByText('内容配置')).toBeTruthy();
  });

  it('渲染核心卖点标签', () => {
    render(<ContentConfigSection {...mockProps} />);
    expect(screen.getByText('核心卖点')).toBeTruthy();
  });

  it('渲染目标受众标签', () => {
    render(<ContentConfigSection {...mockProps} />);
    expect(screen.getByText('目标受众')).toBeTruthy();
  });

  it('渲染输入框', () => {
    render(<ContentConfigSection {...mockProps} />);
    const inputs = document.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
  });

  it('输入核心卖点触发回调', () => {
    render(<ContentConfigSection {...mockProps} />);
    const inputs = document.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: '长效保温' } });
    expect(mockProps.onCoreSellingPointChange).toHaveBeenCalledWith('长效保温');
  });

  it('输入目标受众触发回调', () => {
    render(<ContentConfigSection {...mockProps} />);
    const inputs = document.querySelectorAll('input');
    fireEvent.change(inputs[1], { target: { value: '25-35 岁上班族' } });
    expect(mockProps.onTargetAudienceChange).toHaveBeenCalledWith(
      '25-35 岁上班族',
    );
  });
});
