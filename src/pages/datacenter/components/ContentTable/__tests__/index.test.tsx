import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ContentTable from '../index';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ContentTable 组件', () => {
  it('正确渲染标题', () => {
    renderWithRouter(<ContentTable timeRange="today" platform="all" />);

    expect(screen.getByText('内容表现')).toBeInTheDocument();
  });

  it('正确渲染 TabBar', () => {
    renderWithRouter(<ContentTable timeRange="today" platform="all" />);

    expect(screen.getByText('视频')).toBeInTheDocument();
    expect(screen.getByText('图文')).toBeInTheDocument();
  });

  it('正确渲染排序选项', () => {
    renderWithRouter(<ContentTable timeRange="today" platform="all" />);

    expect(screen.getByText('排序')).toBeInTheDocument();
  });

  it('正确渲染表格外层结构', () => {
    renderWithRouter(<ContentTable timeRange="today" platform="all" />);

    const container = document.querySelector('[class*="_container"]');
    expect(container).toBeInTheDocument();
  });
});
