import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER } from '@/constants';
import type {
  PublishRecordStage,
  PublishStatusCode,
} from '@/services/content/types';

import PublishInfoCard from '../index';

const mockPublishInfo = {
  accountNickname: '收到私信哦',
  platform: 'xiaohongshu' as const,
  publishedAt: '2026-04-07 10:30',
  status: 'UNDER_REVIEW' as PublishStatusCode,
  stage: 'UNDER_REVIEW' as PublishRecordStage,
};

describe('PublishInfoCard 组件', () => {
  it('应正确渲染发布账号', () => {
    render(<PublishInfoCard data={mockPublishInfo} />);
    expect(screen.getByText(/收到私信哦/u)).toBeInTheDocument();
  });

  it('应正确渲染发布时间', () => {
    render(<PublishInfoCard data={mockPublishInfo} />);
    expect(screen.getByText('2026-04-07 10:30')).toBeInTheDocument();
  });

  it('应正确渲染审核中状态', () => {
    render(<PublishInfoCard data={mockPublishInfo} />);
    expect(screen.getByText('审核中')).toBeInTheDocument();
  });

  it('数据为空时应显示占位符', () => {
    render(<PublishInfoCard data={undefined} />);
    expect(screen.getByText('发布信息')).toBeInTheDocument();
    expect(screen.getAllByText(PLACEHOLDER).length).toBeGreaterThan(0);
  });
});
