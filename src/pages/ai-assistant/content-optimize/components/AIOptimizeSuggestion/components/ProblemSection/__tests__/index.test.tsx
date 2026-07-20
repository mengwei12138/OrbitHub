import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import ProblemSection from '../index';

describe('ProblemSection', () => {
  it('渲染问题分析内容', () => {
    const mockContent = '标题平淡，缺少吸引力';
    render(<ProblemSection content={mockContent} />);
    expect(screen.getByText('问题分析')).toBeInTheDocument();
    expect(screen.getByText(mockContent)).toBeInTheDocument();
  });
});
