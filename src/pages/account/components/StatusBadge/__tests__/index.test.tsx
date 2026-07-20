import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AccountStatusBadge from '../index';

describe('AccountStatusBadge 组件', () => {
  describe('状态渲染', () => {
    it('应正确渲染 ONLINE 状态', () => {
      render(<AccountStatusBadge status="ONLINE" />);

      const badge = document.querySelector('[class*="badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('在线');
    });

    it('应正确渲染 STOPPED 状态', () => {
      render(<AccountStatusBadge status="STOPPED" />);

      const badge = document.querySelector('[class*="badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('已停止');
    });

    it('应正确渲染 INVALID 状态', () => {
      render(<AccountStatusBadge status="INVALID" />);

      const badge = document.querySelector('[class*="badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('失效');
    });

    it('未知状态应回退到 STOPPED 状态样式', () => {
      render(<AccountStatusBadge status="UNKNOWN" />);

      const badge = document.querySelector('[class*="badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('已停止');
    });

    it('空状态应回退到 STOPPED 状态样式', () => {
      render(<AccountStatusBadge status="" />);

      const badge = document.querySelector('[class*="badge"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('已停止');
    });
  });

  describe('Dot 元素', () => {
    it('ONLINE 状态应有对应的 dot 元素', () => {
      render(<AccountStatusBadge status="ONLINE" />);

      const dot = document.querySelector('[class*="dot"]');
      expect(dot).toBeInTheDocument();
    });

    it('STOPPED 状态应有对应的 dot 元素', () => {
      render(<AccountStatusBadge status="STOPPED" />);

      const dot = document.querySelector('[class*="dot"]');
      expect(dot).toBeInTheDocument();
    });

    it('INVALID 状态应有对应的 dot 元素', () => {
      render(<AccountStatusBadge status="INVALID" />);

      const dot = document.querySelector('[class*="dot"]');
      expect(dot).toBeInTheDocument();
    });
  });
});
