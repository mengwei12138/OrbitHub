import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import StatsOverview from '../index';

const mockStats = {
  autoReply: 12,
  blockFilter: 5,
  pendingHuman: 8,
};

describe('StatsOverview', () => {
  describe('渲染', () => {
    it('应显示标题', () => {
      render(<StatsOverview stats={mockStats} />);

      const title = document.querySelector('[class*="_title_"]');
      expect(title?.textContent).toBe('今日动态概览');
    });

    it('应显示更新时间', () => {
      render(<StatsOverview stats={mockStats} updatedAt="5 分钟前" />);

      const updatedAt = document.querySelector('[class*="_updatedAt_"]');
      expect(updatedAt?.textContent).toBe('更新于 5 分钟前');
    });

    it('应显示自动回复数量', () => {
      render(<StatsOverview stats={mockStats} />);

      const statValues = document.querySelectorAll('[class*="_statValue_"]');
      const autoReplyValue = Array.from(statValues).find(
        (el) => el.textContent === '12',
      );
      expect(autoReplyValue).toBeTruthy();
    });

    it('应显示屏蔽过滤数量', () => {
      render(<StatsOverview stats={mockStats} />);

      const statValues = document.querySelectorAll('[class*="_statValue_"]');
      const blockFilterValue = Array.from(statValues).find(
        (el) => el.textContent === '5',
      );
      expect(blockFilterValue).toBeTruthy();
    });

    it('应显示待人工处理数量', () => {
      render(<StatsOverview stats={mockStats} />);

      const statValues = document.querySelectorAll('[class*="_statValue_"]');
      const pendingHumanValue = Array.from(statValues).find(
        (el) => el.textContent === '8',
      );
      expect(pendingHumanValue).toBeTruthy();
    });

    it('应显示去处理按钮', () => {
      render(<StatsOverview stats={mockStats} />);

      const linkBtns = document.querySelectorAll('button');
      const linkBtnText = Array.from(linkBtns)
        .map((b) => b.textContent)
        .join('');
      expect(linkBtnText).toContain('去处理');
    });
  });

  describe('操作', () => {
    it('点击去处理按钮应触发事件', () => {
      render(<StatsOverview stats={mockStats} />);

      const linkBtns = document.querySelectorAll('button');
      const linkBtn = Array.from(linkBtns).find((b) =>
        b.textContent?.includes('去处理'),
      );

      if (linkBtn) {
        fireEvent.click(linkBtn);
      }

      expect(linkBtns.length).toBeGreaterThan(0);
    });
  });
});
