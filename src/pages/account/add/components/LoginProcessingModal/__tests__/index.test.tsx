import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoginProcessingModal } from '../index';

describe('LoginProcessingModal', () => {
  it('visible 时展示正在登陆中文案', () => {
    render(<LoginProcessingModal visible />);
    expect(screen.getByTestId('login-processing-modal')).toBeTruthy();
    expect(screen.getByText('正在登陆中')).toBeTruthy();
    expect(screen.getByText('请稍候，验证通过后将自动进入下一步')).toBeTruthy();
  });

  it('不可见时不渲染内容', () => {
    render(<LoginProcessingModal visible={false} />);
    expect(screen.queryByText('正在登陆中')).toBeNull();
  });
});
