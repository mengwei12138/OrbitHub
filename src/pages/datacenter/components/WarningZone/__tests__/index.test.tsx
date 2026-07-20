import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import WarningZone from '../index';

describe('WarningZone 组件', () => {
  const mockStats = {
    total: 12,
    unread: 5,
    abnormal: 4,
  };

  const mockAlerts = [
    {
      id: '1',
      level: 'HIGH' as const,
      status: 'unread' as const,
      platform: 'douyin' as const,
      account: '账号A',
      accountId: 'acc-001',
      contentId: 'content-001',
      reason: '播放量过低 (1.2K<5K)',
      time: '04-15 09:30',
      eventType: 'LOW_PLAY_COUNT',
      handleType: 'content' as const,
    },
    {
      id: '2',
      level: 'MEDIUM' as const,
      status: 'read' as const,
      platform: 'xiaohongshu' as const,
      account: '账号B',
      accountId: 'acc-002',
      reason: '登录失效',
      time: '04-15 10:15',
      eventType: 'LOGIN_EXPIRED',
      handleType: 'login' as const,
    },
  ];

  it('正确渲染统计数据', () => {
    render(<WarningZone alerts={mockAlerts} stats={mockStats} />);

    expect(screen.getByText('数据预警')).toBeInTheDocument();
    expect(screen.getByText('总预警')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('异常账号')).toBeInTheDocument();
  });

  it('正确渲染预警卡片列表', () => {
    render(<WarningZone alerts={mockAlerts} stats={mockStats} />);

    expect(screen.getByText('账号A')).toBeInTheDocument();
    expect(screen.getByText('账号B')).toBeInTheDocument();
    expect(screen.getByText('播放量过低 (1.2K<5K)')).toBeInTheDocument();
    expect(screen.getByText('登录失效')).toBeInTheDocument();
  });

  it('正确渲染平台图标', () => {
    render(<WarningZone alerts={mockAlerts} stats={mockStats} />);

    const platformIcons = screen.getAllByRole('img');
    expect(platformIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('正确渲染时间信息', () => {
    render(<WarningZone alerts={mockAlerts} stats={mockStats} />);

    expect(screen.getByText('04-15 09:30')).toBeInTheDocument();
    expect(screen.getByText('04-15 10:15')).toBeInTheDocument();
  });

  it('点击「去处理」时把含 contentId 的内容类预警对象透传给 onHandle 回调', () => {
    const onHandle = vi.fn();
    const contentAlerts = [
      {
        id: '99',
        level: 'HIGH' as const,
        status: 'unread' as const,
        platform: 'douyin' as const,
        account: '内容号',
        accountId: 'acc-content',
        contentId: 'content-001',
        reason: '登录失效',
        time: '04-22 09:30',
        eventType: 'LOGIN_EXPIRED',
        handleType: 'login' as const,
      },
    ];
    render(
      <WarningZone
        alerts={contentAlerts}
        stats={mockStats}
        onHandle={onHandle}
      />,
    );

    fireEvent.click(screen.getByText('去处理'));

    expect(onHandle).toHaveBeenCalledTimes(1);
    expect(onHandle).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'LOGIN_EXPIRED',
        contentId: 'content-001',
        accountId: 'acc-content',
      }),
    );
  });
});
