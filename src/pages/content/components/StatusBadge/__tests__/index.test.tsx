import { render, screen } from '@testing-library/react';

import StatusBadge from '../index';

describe('StatusBadge', () => {
  it('渲染在线状态', () => {
    render(<StatusBadge status="online" />);
    expect(screen.getByText('在线')).toBeInTheDocument();
    const dot = document.querySelector('[class*="dot"]');
    expect(dot).toBeInTheDocument();
  });

  it('渲染已停止状态', () => {
    render(<StatusBadge status="stopped" />);
    expect(screen.getByText('已停止')).toBeInTheDocument();
  });
});
