import { render } from '@testing-library/react';

import MessageHistoryCard from '../index';

const mockQueryOptions = () => ({
  queryKey: ['test'] as unknown[],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

describe('MessageHistoryCard', () => {
  it('正确渲染组件', () => {
    const { container } = render(
      <MessageHistoryCard queryOptions={mockQueryOptions} />,
    );
    expect(container.querySelector('.ant-pro-table')).toBeInTheDocument();
  });
});
