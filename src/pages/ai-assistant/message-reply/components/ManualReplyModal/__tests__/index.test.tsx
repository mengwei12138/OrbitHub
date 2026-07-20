import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ManualReplyModal from '../index';

describe('ManualReplyModal', () => {
  const defaultProps = {
    open: true,
    message: {
      id: '1',
      userName: '用户张三',
      accountName: '账号A',
      platform: '抖音',
      content: '你好，请问可以合作推广吗？',
    },
    classification: {
      type: 'cooperation',
      label: '合作咨询',
      emoji: '🤝',
    },
    suggestedReply: '感谢您的合作意向，请稍等联系方式...',
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('should render modal when open', () => {
    render(<ManualReplyModal {...defaultProps} />);

    expect(screen.getByText('手动回复私信')).toBeInTheDocument();
    expect(screen.getByText('用户张三')).toBeInTheDocument();
    expect(screen.getByText('账号A')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
    expect(screen.getByText('你好，请问可以合作推广吗？')).toBeInTheDocument();
  });

  it('should render AI classification tag', () => {
    render(<ManualReplyModal {...defaultProps} />);

    expect(screen.getByText('🤝 合作咨询')).toBeInTheDocument();
  });

  it('should render suggested reply in textarea', () => {
    render(<ManualReplyModal {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('感谢您的合作意向，请稍等联系方式...');
  });

  it('should call onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(<ManualReplyModal {...defaultProps} />);

    await user.click(screen.getByText('取消'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onSubmit with message id and content when confirm button clicked', async () => {
    const user = userEvent.setup();
    render(<ManualReplyModal {...defaultProps} />);

    await user.click(screen.getByText('确认发送'));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      '1',
      '感谢您的合作意向，请稍等联系方式...',
    );
  });

  it('should disable confirm button when platformNotSupported is true', () => {
    render(<ManualReplyModal {...defaultProps} platformNotSupported />);

    expect(screen.getByText('确认发送')).toBeDisabled();
  });

  it('should not render classification when not provided', () => {
    render(<ManualReplyModal {...defaultProps} classification={undefined} />);

    expect(screen.queryByText(/合作咨询/u)).not.toBeInTheDocument();
  });
});
