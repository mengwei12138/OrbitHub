import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import IconCommentReply from '../../../images/icon-comment-reply.svg';
import IconContentOpt from '../../../images/icon-content-opt.svg';
import FeatureCard from '../index';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const defaultProps = {
  title: '内容优化与重发布',
  description: '智能检测低数据内容，提供标题、标签优化建议，支持一键重发布。',
  badge: 'AI 智能优化',
  icon: <img src={IconContentOpt} alt="内容优化" />,
  path: '/ai-assistant/content-optimize',
  color: '#2e79ff',
  gradient:
    'linear-gradient(135deg, rgba(236, 243, 255, 1) 0%, rgba(219, 234, 255, 1) 100%)',
  shadow: '0px 6px 12px 0px rgba(46, 121, 255, 0.25)',
  badgeBg: 'rgba(46, 121, 255, 0.12)',
};

const renderComponent = (
  props: Partial<typeof defaultProps> & Record<string, unknown> = {},
) => {
  return render(
    <BrowserRouter>
      <FeatureCard {...defaultProps} {...props} />
    </BrowserRouter>,
  );
};

describe('FeatureCard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('渲染卡片标题', () => {
    renderComponent();
    expect(screen.getByText('内容优化与重发布')).toBeInTheDocument();
  });

  it('渲染卡片描述', () => {
    renderComponent();
    expect(
      screen.getByText(
        '智能检测低数据内容，提供标题、标签优化建议，支持一键重发布。',
      ),
    ).toBeInTheDocument();
  });

  it('渲染徽章文本', () => {
    renderComponent();
    expect(screen.getByText('AI 智能优化')).toBeInTheDocument();
  });

  it('启用状态显示「进入功能」', () => {
    renderComponent();
    expect(screen.getByText('进入功能')).toBeInTheDocument();
  });

  it('点击卡片触发导航', () => {
    renderComponent();
    fireEvent.click(screen.getByText('内容优化与重发布'));
    expect(mockNavigate).toHaveBeenCalledWith('/ai-assistant/content-optimize');
  });

  it('禁用状态点击不触发导航', () => {
    renderComponent({ disabled: true });
    fireEvent.click(screen.getByText('内容优化与重发布'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('禁用状态显示「即将开放」', () => {
    renderComponent({ disabled: true });
    expect(screen.getByText('即将开放')).toBeInTheDocument();
  });

  it('badgeCount > 0 时显示数字角标', () => {
    renderComponent({ badgeCount: 8, badgeCountLabel: '待人工处理' });
    expect(screen.getByLabelText('待人工处理')).toHaveTextContent('8');
  });

  it('badgeCount = 0 时不显示数字角标', () => {
    renderComponent({ badgeCount: 0 });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('badgeCount 超过 99 显示 99+', () => {
    renderComponent({ badgeCount: 100, badgeCountLabel: '待人工处理' });
    expect(screen.getByLabelText('待人工处理')).toHaveTextContent('99+');
  });

  it('回车键触发导航', () => {
    renderComponent();
    fireEvent.keyDown(screen.getByText('内容优化与重发布'), { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/ai-assistant/content-optimize');
  });

  it('禁用状态回车键不触发导航', () => {
    renderComponent({ disabled: true });
    fireEvent.keyDown(screen.getByText('内容优化与重发布'), { key: 'Enter' });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('不同卡片渲染不同样式', () => {
    renderComponent({
      title: '评论 AI 自动回复',
      description: '实时拉取平台评论，AI 自动识别情绪与类型。',
      badge: '实时互动',
      icon: <img src={IconCommentReply} alt="评论回复" />,
      path: '/ai-assistant/comment-reply',
      color: '#f59e0b',
      gradient:
        'linear-gradient(135deg, rgba(255, 247, 229, 1) 0%, rgba(255, 237, 201, 1) 100%)',
      shadow: '0px 6px 12px 0px rgba(245, 158, 11, 0.25)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
    });
    expect(screen.getByText('评论 AI 自动回复')).toBeInTheDocument();
  });
});
