import { fireEvent, render, screen } from '@testing-library/react';

import ContentEdit from '../index';

describe('ContentEdit', () => {
  const defaultProps = {
    templates: [
      { id: '1', label: '春日穿搭' },
      { id: '2', label: '美妆' },
      { id: '3', label: '探店' },
    ],
    value: '',
    onChange: vi.fn(),
    onTemplateChange: vi.fn(),
    onGenerate: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染标题正确', () => {
    render(<ContentEdit {...defaultProps} />);
    expect(screen.getByText('内容编辑（智能适配各平台）')).toBeInTheDocument();
  });

  it('渲染快捷模板标签', () => {
    render(<ContentEdit {...defaultProps} />);
    expect(screen.getByText('春日穿搭')).toBeInTheDocument();
    expect(screen.getByText('美妆')).toBeInTheDocument();
    expect(screen.getByText('探店')).toBeInTheDocument();
  });

  it('点击模板标签触发 onTemplateChange', () => {
    render(<ContentEdit {...defaultProps} />);
    fireEvent.click(screen.getByText('春日穿搭'));
    expect(defaultProps.onTemplateChange).toHaveBeenCalledWith({
      id: '1',
      label: '春日穿搭',
    });
  });

  it('再次点击已选中的模板取消选中', () => {
    const selectedTemplate = { id: '1', label: '春日穿搭' };
    render(
      <ContentEdit {...defaultProps} selectedTemplate={selectedTemplate} />,
    );
    fireEvent.click(screen.getByText('春日穿搭'));
    expect(defaultProps.onTemplateChange).toHaveBeenCalledWith(null);
  });

  it('渲染 AI 输入框', () => {
    render(<ContentEdit {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(
        '请输入图片相关介绍或描述，或直接点击上方模板',
      ),
    ).toBeInTheDocument();
  });

  it('输入内容触发 onChange', () => {
    render(<ContentEdit {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      '请输入图片相关介绍或描述，或直接点击上方模板',
    );
    fireEvent.change(textarea, { target: { value: '测试内容' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('测试内容');
  });

  it('点击 AI生成内容 按钮触发 onGenerate', () => {
    render(
      <ContentEdit
        {...defaultProps}
        value="春日穿搭灵感"
        selectedTemplate={{ id: '1', label: '春日穿搭' }}
      />,
    );
    const generateBtn = screen.getByRole('button', { name: 'AI生成内容' });
    fireEvent.click(generateBtn);
    expect(defaultProps.onGenerate).toHaveBeenCalled();
  });

  it('点击重置按钮触发 onReset', () => {
    render(<ContentEdit {...defaultProps} value="some content" />);
    const resetBtn = screen.getByRole('button', { name: /重.*置/u });
    fireEvent.click(resetBtn);
    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it('选中模板后显示当前选中状态', () => {
    render(
      <ContentEdit
        {...defaultProps}
        selectedTemplate={{ id: '1', label: '春日穿搭' }}
      />,
    );
    expect(screen.getByText('春日穿搭（当前选中）')).toBeInTheDocument();
  });

  it('disabled 状态下按钮不可点击', () => {
    render(<ContentEdit {...defaultProps} disabled />);
    const generateBtn = screen.getByRole('button', { name: 'AI生成内容' });
    expect(generateBtn).toBeDisabled();
  });

  it('isGenerating 状态下按钮显示加载状态', () => {
    render(
      <ContentEdit
        {...defaultProps}
        value="春日穿搭灵感"
        selectedTemplate={{ id: '1', label: '春日穿搭' }}
        isGenerating
      />,
    );
    const generateBtn = screen.getByRole('button', { name: /AI生成内容/u });
    expect(generateBtn).toHaveClass('ant-btn-loading');
  });
});
