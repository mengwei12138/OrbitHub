import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PageHeader from '../index';

describe('PageHeader', () => {
  it('正确渲染标题', () => {
    render(<PageHeader title="测试标题" />);
    expect(screen.getByText('测试标题')).toBeTruthy();
  });

  it('没有 toolbar 和 children 时渲染 wrapper、title 和 center', () => {
    const { container } = render(<PageHeader title="测试标题" />);
    expect(container.querySelectorAll('[class]')).toHaveLength(3);
    expect(container.querySelector('[class*="wrapper"]')).toBeTruthy();
    expect(container.querySelector('[class*="title"]')).toBeTruthy();
    expect(container.querySelector('[class*="center"]')).toBeTruthy();
  });

  it('正确渲染 toolbar', () => {
    const onClick = vi.fn();
    render(
      <PageHeader
        title="测试标题"
        toolbar={
          <button type="button" onClick={onClick}>
            操作
          </button>
        }
      />,
    );

    const button = screen.getByText('操作');
    expect(button).toBeTruthy();
  });

  it('正确渲染 children 作为 center', () => {
    render(
      <PageHeader title="测试标题">
        <input placeholder="搜索..." />
      </PageHeader>,
    );

    const input = screen.getByPlaceholderText('搜索...');
    expect(input).toBeTruthy();
  });

  it('同时渲染 title、children 和 toolbar', () => {
    render(
      <PageHeader
        title="页面标题"
        toolbar={<button type="button">按钮</button>}
      >
        <span>中间内容</span>
      </PageHeader>,
    );

    expect(screen.getByText('页面标题')).toBeTruthy();
    expect(screen.getByText('中间内容')).toBeTruthy();
    expect(screen.getByText('按钮')).toBeTruthy();
  });

  it('title 区域 flex 为 0 0 auto', () => {
    const { container } = render(<PageHeader title="测试" />);
    const titleEl = container.querySelector('[class*="title"]');
    expect(titleEl).toBeTruthy();
  });

  it('center 区域 flex 为 1', () => {
    const { container } = render(
      <PageHeader title="测试" toolbar={<button type="button">按钮</button>}>
        <span>中间</span>
      </PageHeader>,
    );
    const centerEl = container.querySelector('[class*="center"]');
    expect(centerEl).toBeTruthy();
  });
});
