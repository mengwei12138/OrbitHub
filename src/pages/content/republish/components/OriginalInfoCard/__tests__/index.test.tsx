import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER } from '@/constants';
import {
  PUBLISH_STATUS_CODE,
  type PublishRecordDetailData,
} from '@/services/content/types';

import OriginalInfoCard from '../index';

const mockData: PublishRecordDetailData = {
  recordId: '123',
  title: '日常穿搭指南，温柔色系搭配技巧',
  caption: '春天就要穿温柔色系呀～分享几个搭配技巧，显白又有气质...',
  topicTags: ['#日常穿搭', '#温柔色系', '#搭配技巧'],
  contentMode: 'VIDEO',
  status: PUBLISH_STATUS_CODE.PUBLISH_SUCCESS,
  platform: 'xiaohongshu',
  accountId: 'acc-1',
  stage: 'PUBLISHED',
  publishedAt: '2026-04-07 10:30:00',
  canRepublish: true,
};

describe('OriginalInfoCard 组件', () => {
  it('应正确渲染标题', () => {
    render(<OriginalInfoCard data={mockData} />);
    expect(
      screen.getByText('日常穿搭指南，温柔色系搭配技巧'),
    ).toBeInTheDocument();
  });

  it('应正确渲染文案', () => {
    render(<OriginalInfoCard data={mockData} />);
    expect(
      screen.getByText(
        '春天就要穿温柔色系呀～分享几个搭配技巧，显白又有气质...',
      ),
    ).toBeInTheDocument();
  });

  it('应正确渲染标签', () => {
    render(<OriginalInfoCard data={mockData} />);
    expect(
      screen.getByText(/#日常穿搭.*#温柔色系.*#搭配技巧/u),
    ).toBeInTheDocument();
  });

  it('数据为空时应显示占位符', () => {
    render(<OriginalInfoCard />);
    expect(screen.getAllByText(PLACEHOLDER).length).toBeGreaterThan(0);
  });
});
