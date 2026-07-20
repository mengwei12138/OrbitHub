import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ClassificationRulesSettings, { type ReplyRule } from '../index';

describe('ClassificationRulesSettings', () => {
  const defaultRules: ReplyRule[] = [
    {
      id: '1',
      type: 'cooperation',
      label: '合作咨询',
      keywords: ['合作', '商务', '推广'],
      template: '感谢您的合作意向，请稍等联系方式...',
    },
    {
      id: '2',
      type: 'complaint',
      label: '投诉建议',
      keywords: ['投诉', '差评', '失望'],
      template: '非常抱歉给您带来困扰，我们会尽快...',
    },
  ];

  const defaultProps = {
    rules: defaultRules,
    autoReplyEnabled: true,
    importantTypes: ['cooperation'] as (
      | 'cooperation'
      | 'complaint'
      | 'product'
      | 'spam'
    )[],
    notificationMethods: ['站内通知'] as string[],
    onAutoReplyToggle: vi.fn(),
    onRuleEdit: vi.fn(),
    onAddRule: vi.fn(),
    onImportantTypesChange: vi.fn(),
    onNotificationMethodsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title', () => {
    render(<ClassificationRulesSettings {...defaultProps} />);
    expect(screen.getByText('分类与回复规则')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<ClassificationRulesSettings {...defaultProps} />);
    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('关键词匹配')).toBeInTheDocument();
    expect(screen.getByText('回复模板')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('should render rules', () => {
    render(<ClassificationRulesSettings {...defaultProps} />);
    expect(screen.getByText('合作咨询')).toBeInTheDocument();
    expect(screen.getByText('投诉建议')).toBeInTheDocument();
  });

  it('should render keywords', () => {
    render(<ClassificationRulesSettings {...defaultProps} />);
    expect(screen.getByText('合作')).toBeInTheDocument();
    expect(screen.getByText('商务')).toBeInTheDocument();
    expect(screen.getByText('推广')).toBeInTheDocument();
  });

  it('should call onAutoReplyToggle when toggle clicked', async () => {
    const user = userEvent.setup();
    render(<ClassificationRulesSettings {...defaultProps} />);

    const toggleButtons = screen.getAllByRole('button');
    const toggleBtn = toggleButtons.find((btn) =>
      btn.className.includes('toggleActive'),
    );
    expect(toggleBtn).not.toBeUndefined();
    await user.click(toggleBtn as HTMLButtonElement);

    expect(defaultProps.onAutoReplyToggle).toHaveBeenCalledWith(false);
  });

  it('should call onRuleEdit when edit button clicked', async () => {
    const user = userEvent.setup();
    render(<ClassificationRulesSettings {...defaultProps} />);

    await user.click(screen.getAllByText('编辑')[0]);

    expect(defaultProps.onRuleEdit).toHaveBeenCalledWith('1');
  });

  it('should call onAddRule when add button clicked', async () => {
    const user = userEvent.setup();
    render(<ClassificationRulesSettings {...defaultProps} />);

    await user.click(screen.getByText('添加分类'));

    expect(defaultProps.onAddRule).toHaveBeenCalled();
  });

  it('should render important section', () => {
    render(<ClassificationRulesSettings {...defaultProps} />);
    expect(screen.getByText('重要私信标记：')).toBeInTheDocument();
    expect(screen.getByText('合作咨询类私信标记为重要')).toBeInTheDocument();
  });

  it('should render notification section', () => {
    render(<ClassificationRulesSettings {...defaultProps} />);
    expect(screen.getByText('通知方式：')).toBeInTheDocument();
    expect(screen.getByText('站内通知')).toBeInTheDocument();
    expect(screen.getByText('短信')).toBeInTheDocument();
    expect(screen.getByText('邮件')).toBeInTheDocument();
  });

  it('should use custom title', () => {
    render(
      <ClassificationRulesSettings {...defaultProps} title="自定义标题" />,
    );
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });
});
