import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OfflineWarning from '../index';

const mockAccounts = [
  { name: '账号A', platform: '抖音', reason: '登录失效' },
  { name: '账号B', platform: '小红书', reason: '登录失效' },
];

describe('OfflineWarning', () => {
  describe('渲染', () => {
    it('账号列表为空时不应渲染', () => {
      render(<OfflineWarning accounts={[]} />);

      const wrapper = document.querySelector('[class*="_wrapper_"]');
      expect(wrapper).toBeNull();
    });

    it('账号列表不为空时应渲染', () => {
      render(<OfflineWarning accounts={mockAccounts} />);

      const wrapper = document.querySelector('[class*="_wrapper_"]');
      expect(wrapper).toBeTruthy();
    });

    it('应显示标题', () => {
      render(<OfflineWarning accounts={mockAccounts} />);

      const title = document.querySelector('[class*="_title_"]');
      expect(title?.textContent).toContain('以下账号已离线');
    });

    it('应显示所有离线账号', () => {
      render(<OfflineWarning accounts={mockAccounts} />);

      const accountItems = document.querySelectorAll(
        '[class*="_accountItem_"]',
      );
      expect(accountItems.length).toBe(2);
    });

    it('应显示账号名称和平台', () => {
      render(<OfflineWarning accounts={mockAccounts} />);

      const content = document.body.textContent;
      expect(content).toContain('账号A');
      expect(content).toContain('抖音');
    });

    it('应显示离线原因', () => {
      render(<OfflineWarning accounts={mockAccounts} />);

      const reasons = document.querySelectorAll('[class*="_status_"]');
      expect(reasons[0]?.textContent).toBe('登录失效');
    });
  });

  describe('操作', () => {
    it('点击关闭按钮应触发 onClose 回调', () => {
      const onClose = vi.fn();
      render(<OfflineWarning accounts={mockAccounts} onClose={onClose} />);

      const closeBtn = document.querySelector('button');
      expect(closeBtn).not.toBeNull();
      fireEvent.click(closeBtn as HTMLButtonElement);

      expect(onClose).toHaveBeenCalled();
    });
  });
});
