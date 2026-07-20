import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import MyWorks from '../index';

describe('MyWorks', () => {
  it('渲染我的作品标题', () => {
    render(<MyWorks />);
    expect(screen.getByText('我的作品')).toBeTruthy();
  });

  it('空列表时渲染空状态', () => {
    render(<MyWorks works={[]} />);
    expect(screen.getByText('暂无作品')).toBeTruthy();
    expect(screen.getByText('去首页发起一次生成吧')).toBeTruthy();
  });

  it('有作品时渲染作品列表', () => {
    const mockWorks = [
      { id: '1', type: '视频' as const, title: '测试视频', date: '2024-01-01' },
      { id: '2', type: '图文' as const, title: '测试图文', date: '2024-01-02' },
    ];
    render(<MyWorks works={mockWorks} />);
    expect(screen.getByText('测试视频')).toBeTruthy();
    expect(screen.getByText('测试图文')).toBeTruthy();
  });

  it('有作品时渲染查看全部', () => {
    const mockWorks = [
      { id: '1', type: '视频' as const, title: '测试视频', date: '2024-01-01' },
    ];
    render(<MyWorks works={mockWorks} />);
    expect(screen.getByText('查看全部 →')).toBeTruthy();
  });

  it('空列表时不渲染查看全部', () => {
    render(<MyWorks works={[]} />);
    expect(screen.queryByText('查看全部 →')).toBeNull();
  });

  it('点击查看全部触发回调', () => {
    const onViewAll = vi.fn();
    const mockWorks = [
      { id: '1', type: '视频' as const, title: '测试视频', date: '2024-01-01' },
    ];
    render(<MyWorks works={mockWorks} onViewAll={onViewAll} />);
    screen.getByText('查看全部 →').click();
    expect(onViewAll).toHaveBeenCalled();
  });

  // 数据隔离（PRD §1.4）：标题与 owner 行按 isTenantAdmin 切换
  // 由 OpenSpec change content-generation-my-works-data-isolation 引入
  it('title prop 切换为「团队作品」', () => {
    render(<MyWorks title="团队作品" />);
    expect(screen.getByText('团队作品')).toBeTruthy();
    expect(screen.queryByText('我的作品')).toBeNull();
  });

  it('NORMAL_ADMIN 视角不渲染 owner 行', () => {
    const works = [
      {
        id: '1',
        type: '视频' as const,
        title: '同事的视频',
        date: '2026-06-01',
        ownerName: '张三',
      },
    ];
    render(<MyWorks works={works} isTenantAdmin={false} />);
    expect(screen.queryByText(/由 张三 创建/u)).toBeNull();
    expect(screen.queryByTestId('mywork-card-owner-1')).toBeNull();
  });

  it('TENANT_ADMIN 视角渲染「由 XX 创建」', () => {
    const works = [
      {
        id: '1',
        type: '视频' as const,
        title: '同事的视频',
        date: '2026-06-01',
        ownerName: '张三',
      },
    ];
    render(<MyWorks works={works} isTenantAdmin={true} title="团队作品" />);
    expect(screen.getByTestId('mywork-card-owner-1')).toBeDefined();
    expect(screen.getByText(/由 张三 创建/u)).toBeDefined();
  });
});
