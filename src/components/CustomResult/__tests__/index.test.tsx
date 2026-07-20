import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CustomResult from '../index';

describe('CustomResult', () => {
  it('should render with status 404', () => {
    const { container } = render(<CustomResult status="404" />);
    expect(container.querySelector('.ant-result')).toBeTruthy();
  });

  it('should render with status 403', () => {
    const { container } = render(<CustomResult status="403" />);
    expect(container.querySelector('.ant-result')).toBeTruthy();
  });

  it('should render with status 500', () => {
    const { container } = render(<CustomResult status="500" />);
    expect(container.querySelector('.ant-result')).toBeTruthy();
  });
});
