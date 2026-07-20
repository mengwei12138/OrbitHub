import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BaseInfoSection } from '../index';

describe('BaseInfoSection', () => {
  const mockProps = {
    referenceLink: '',
    productName: '',
    onReferenceLinkChange: vi.fn(),
    onProductNameChange: vi.fn(),
  };

  it('渲染卡片标题', () => {
    render(<BaseInfoSection {...mockProps} />);
    expect(screen.getByText('基础信息')).toBeTruthy();
  });

  it('渲染参考链接标签', () => {
    render(<BaseInfoSection {...mockProps} />);
    expect(screen.getByText('参考链接')).toBeTruthy();
  });

  it('渲染产品名称标签', () => {
    render(<BaseInfoSection {...mockProps} />);
    expect(screen.getByText('产品 / 服务名称')).toBeTruthy();
  });

  it('渲染输入框', () => {
    render(<BaseInfoSection {...mockProps} />);
    const inputs = document.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
  });

  it('输入参考链接触发回调', () => {
    render(<BaseInfoSection {...mockProps} />);
    const inputs = document.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: 'https://example.com' } });
    expect(mockProps.onReferenceLinkChange).toHaveBeenCalledWith(
      'https://example.com',
    );
  });

  it('输入产品名称触发回调', () => {
    render(<BaseInfoSection {...mockProps} />);
    const inputs = document.querySelectorAll('input');
    fireEvent.change(inputs[1], { target: { value: '智能保温杯' } });
    expect(mockProps.onProductNameChange).toHaveBeenCalledWith('智能保温杯');
  });
});
