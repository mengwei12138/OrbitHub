import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER } from '@/constants';

import ContentInfoCard from '../index';

const mockContentInfo = {
  title: '日常穿搭指南，温柔色系搭配技巧',
  caption: '春天就要穿温柔色系呀～分享几个搭配技巧，显白又有气质...',
  topicTags: ['#日常穿搭', '#温柔色系', '#搭配技巧'],
  contentMode: 'VIDEO' as const,
};

describe('ContentInfoCard 组件', () => {
  it('应正确渲染标题', () => {
    render(<ContentInfoCard data={mockContentInfo} />);
    expect(
      screen.getByText('日常穿搭指南，温柔色系搭配技巧'),
    ).toBeInTheDocument();
  });

  it('应正确渲染文案', () => {
    render(<ContentInfoCard data={mockContentInfo} />);
    expect(
      screen.getByText(
        '春天就要穿温柔色系呀～分享几个搭配技巧，显白又有气质...',
      ),
    ).toBeInTheDocument();
  });

  it('应正确渲染标签', () => {
    render(<ContentInfoCard data={mockContentInfo} />);
    expect(
      screen.getByText(/#日常穿搭.*#温柔色系.*#搭配技巧/u),
    ).toBeInTheDocument();
  });

  it('应正确渲染视频内容形式', () => {
    render(<ContentInfoCard data={mockContentInfo} />);
    expect(screen.getByText('视频')).toBeInTheDocument();
  });

  it('应正确渲染图文内容形式', () => {
    const imageContentInfo = {
      ...mockContentInfo,
      contentMode: 'IMAGE' as const,
    };
    render(<ContentInfoCard data={imageContentInfo} />);
    expect(screen.getByText('图文')).toBeInTheDocument();
  });

  it('数据为空时应显示占位符', () => {
    render(<ContentInfoCard data={undefined} />);
    expect(screen.getByText('内容信息')).toBeInTheDocument();
    expect(screen.getAllByText(PLACEHOLDER).length).toBeGreaterThan(0);
  });

  it('标题为空字符串时显示 — 占位符（与其它字段的 -- 区分）', () => {
    render(
      <ContentInfoCard
        data={{
          contentMode: 'VIDEO' as const,
          title: '',
          caption: '正文内容',
        }}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('标题仅含空白字符时也显示 — 占位符', () => {
    render(
      <ContentInfoCard
        data={{
          contentMode: 'IMAGE' as const,
          title: '   ',
          caption: '正文',
        }}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
