import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AccountResponse } from '@/services/account/types';

import TargetAccountCard from '../index';

const mockAccount: AccountResponse = {
  id: '1',
  accountNo: 'ACC001',
  nickname: '收到私信哦',
  phoneNumber: '13812345678',
  platform: 'xiaohongshu',
  avatar: 'https://example.com/avatar.jpg',
  status: 'ONLINE',
  followers: '10000',
  posts: '50',
  likes: '5000',
  tokenExpireAt: '2027-01-01 00:00:00',
  createdAt: '2025-01-01 00:00:00',
  loginRegion: 'CQ',
  loginRegionName: '重庆',
};

describe('TargetAccountCard 组件', () => {
  it('应正确渲染账号名称', () => {
    render(
      <TargetAccountCard
        selectedAccounts={[mockAccount]}
        onSelectAccounts={vi.fn()}
        onSelectOther={vi.fn()}
      />,
    );
    expect(screen.getByText('收到私信哦')).toBeInTheDocument();
  });

  it('应正确渲染手机号', () => {
    render(
      <TargetAccountCard
        selectedAccounts={[mockAccount]}
        onSelectAccounts={vi.fn()}
        onSelectOther={vi.fn()}
      />,
    );
    expect(screen.getByText('138****5678')).toBeInTheDocument();
  });

  it('应渲染选择其他账号链接', () => {
    render(
      <TargetAccountCard
        selectedAccounts={[mockAccount]}
        onSelectAccounts={vi.fn()}
        onSelectOther={vi.fn()}
      />,
    );
    expect(screen.getByText('+ 选择其他账号')).toBeInTheDocument();
  });

  it('应渲染提示文字', () => {
    render(
      <TargetAccountCard
        selectedAccounts={[mockAccount]}
        onSelectAccounts={vi.fn()}
        onSelectOther={vi.fn()}
      />,
    );
    expect(screen.getByText('同一平台仅可选择一个账号')).toBeInTheDocument();
  });

  it('未选中账号时应显示默认文字', () => {
    render(
      <TargetAccountCard
        selectedAccounts={[]}
        onSelectAccounts={vi.fn()}
        onSelectOther={vi.fn()}
      />,
    );
    expect(screen.getByText('账号名称')).toBeInTheDocument();
    expect(screen.getByText('手机号')).toBeInTheDocument();
  });
});
