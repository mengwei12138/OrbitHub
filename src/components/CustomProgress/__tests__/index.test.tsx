import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CustomProgress from '../index';

describe('CustomProgress', () => {
  it('默认属性渲染', () => {
    render(<CustomProgress />);
    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('渲染百分比', () => {
    render(<CustomProgress percent={50} />);
    expect(screen.getByRole('progressbar')).toBeDefined();
  });
});
