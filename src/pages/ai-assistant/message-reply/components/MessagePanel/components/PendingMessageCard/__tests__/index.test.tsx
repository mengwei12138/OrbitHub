import { render } from '@testing-library/react';

import PendingMessageCard from '../index';

const mockQueryOptions = () => ({
  queryKey: ['test'] as unknown[],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

describe('PendingMessageCard', () => {
  it('正确渲染组件', () => {
    const { container } = render(
      <PendingMessageCard queryOptions={mockQueryOptions} />,
    );
    expect(container.querySelector('.ant-pro-table')).toBeInTheDocument();
  });
});
