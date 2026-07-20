import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FetchSettings from '../index';

describe('FetchSettings', () => {
  const defaultProps = {
    frequency: '5min' as const,
    messageType: 'all' as const,
    onFrequencyChange: vi.fn(),
    onMessageTypeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title', () => {
    render(<FetchSettings {...defaultProps} />);
    expect(screen.getByText('抓取设置')).toBeInTheDocument();
  });

  it('should render frequency options', () => {
    render(<FetchSettings {...defaultProps} />);
    expect(screen.getByText('抓取频率：')).toBeInTheDocument();
    expect(screen.getByDisplayValue('每 5 分钟')).toBeInTheDocument();
  });

  it('should render message type options', () => {
    render(<FetchSettings {...defaultProps} />);
    expect(screen.getByText('私信类型：')).toBeInTheDocument();
    expect(screen.getByDisplayValue('全部')).toBeInTheDocument();
  });

  it('should call onFrequencyChange when frequency changes', async () => {
    const user = userEvent.setup();
    render(<FetchSettings {...defaultProps} />);

    const select = screen.getByDisplayValue('每 5 分钟');
    await user.selectOptions(select, '10min');

    expect(defaultProps.onFrequencyChange).toHaveBeenCalledWith('10min');
  });

  it('should call onMessageTypeChange when selecting from dropdown', async () => {
    const user = userEvent.setup();
    render(<FetchSettings {...defaultProps} />);

    const select = screen.getByDisplayValue('全部');
    await user.selectOptions(select, 'unread');

    expect(defaultProps.onMessageTypeChange).toHaveBeenCalledWith('unread');
  });

  it('should use custom title', () => {
    render(<FetchSettings {...defaultProps} title="自定义标题" />);
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });

  it('should render hint text', () => {
    render(<FetchSettings {...defaultProps} />);
    expect(screen.getByText('自动抓取新私信')).toBeInTheDocument();
  });
});
