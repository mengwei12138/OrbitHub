import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import AccountSelector from '../index';

describe('AccountSelector', () => {
  const mockAccounts = [
    { id: '1', name: '美食探店号', platform: 'xiaohongshu' as const },
    { id: '2', name: '潮流玩家', platform: 'douyin' as const },
    { id: '3', name: '美妆达人', platform: 'xiaohongshu' as const },
  ];

  const defaultProps = {
    accounts: mockAccounts,
    selectedIds: ['1'],
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title and accounts', () => {
    render(<AccountSelector {...defaultProps} />);

    expect(screen.getByText('账号选择')).toBeInTheDocument();
    expect(screen.getByText('美食探店号')).toBeInTheDocument();
    expect(screen.getByText('潮流玩家')).toBeInTheDocument();
    expect(screen.getByText('美妆达人')).toBeInTheDocument();
  });

  it('should render platform pills', () => {
    render(<AccountSelector {...defaultProps} />);

    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
    expect(screen.getByText('小红书')).toBeInTheDocument();
  });

  it('should render platform tags', () => {
    render(<AccountSelector {...defaultProps} />);

    expect(screen.getAllByText('（小红书）')).toHaveLength(2);
    expect(screen.getByText('（抖音）')).toBeInTheDocument();
  });

  it('should show checkmark for selected account', () => {
    render(<AccountSelector {...defaultProps} />);

    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(1);
  });

  it('should call onChange when account is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountSelector {...defaultProps} />);

    await user.click(screen.getByText('潮流玩家'));

    expect(defaultProps.onChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('should call onChange when selected account is clicked to deselect', async () => {
    const user = userEvent.setup();
    render(<AccountSelector {...defaultProps} />);

    await user.click(screen.getByText('美食探店号'));

    expect(defaultProps.onChange).toHaveBeenCalledWith([]);
  });

  it('should select all accounts when clicking 全部 pill', async () => {
    const user = userEvent.setup();
    render(<AccountSelector {...defaultProps} selectedIds={[]} />);

    await user.click(screen.getByText('全部'));

    expect(defaultProps.onChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('should deselect all when clicking 全部 pill again', async () => {
    const user = userEvent.setup();
    render(<AccountSelector {...defaultProps} selectedIds={['1', '2', '3']} />);

    await user.click(screen.getByText('全部'));

    expect(defaultProps.onChange).toHaveBeenCalledWith([]);
  });

  it('should select all accounts of a platform when clicking platform pill', async () => {
    const user = userEvent.setup();
    render(<AccountSelector {...defaultProps} selectedIds={[]} />);

    await user.click(screen.getByText('小红书'));

    expect(defaultProps.onChange).toHaveBeenCalledWith(['1', '3']);
  });

  it('should use custom title', () => {
    render(<AccountSelector {...defaultProps} title="自定义标题" />);

    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });

  it('should render empty when no accounts', () => {
    render(
      <AccountSelector {...defaultProps} accounts={[]} selectedIds={[]} />,
    );

    expect(screen.queryByText('美食探店号')).not.toBeInTheDocument();
  });
});
