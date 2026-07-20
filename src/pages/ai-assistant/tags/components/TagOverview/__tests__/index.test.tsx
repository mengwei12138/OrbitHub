import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER } from '@/constants';

import TagOverview from '../index';

describe('TagOverview', () => {
  it('should render stats correctly', () => {
    render(
      <TagOverview stats={{ hot: 8, content: 12, emotion: 3, disabled: 1 }} />,
    );

    expect(screen.getByText('热门推荐')).toBeDefined();
    expect(screen.getByText('内容分类')).toBeDefined();
    expect(screen.getByText('情感标签')).toBeDefined();
    expect(screen.getByText('已停用')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
  });

  it('should show loading state', () => {
    render(
      <TagOverview
        stats={{ hot: 0, content: 0, emotion: 0, disabled: 0 }}
        loading
      />,
    );

    const values = screen.getAllByText(PLACEHOLDER);
    expect(values.length).toBe(4);
  });
});
