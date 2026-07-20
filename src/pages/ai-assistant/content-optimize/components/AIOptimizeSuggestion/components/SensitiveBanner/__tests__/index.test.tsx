import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import SensitiveBanner from '../index';

describe('SensitiveBanner', () => {
  it('渲染敏感词警告', () => {
    render(<SensitiveBanner />);
    expect(
      screen.getByText('生成内容含违规词，已自动拦截'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '已通过第三方内容安全服务检测，请人工审核或调整后再发布。',
      ),
    ).toBeInTheDocument();
  });
});
