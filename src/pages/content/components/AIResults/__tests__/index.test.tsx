import { fireEvent, render, screen } from '@testing-library/react';

import AIResults from '../index';

describe('AIResults', () => {
  const defaultProps = {
    captionResults: [
      {
        id: '1',
        title: '① 救命！这套也太温柔了吧～奶油白+雾霾蓝真的显白',
        caption: '感谢观看，欢迎点赞关注～',
        topicTags: ['#分享', '#日常'],
      },
      {
        id: '2',
        title: '② 我真的会谢…穿上直接白两个度，姐妹们快去试试！',
        caption: '感谢观看，欢迎点赞关注～',
        topicTags: ['#分享', '#日常'],
      },
      {
        id: '3',
        title: '③ 今日份开心是这套给的，软软糯糯显白又舒服',
        caption: '感谢观看，欢迎点赞关注～',
        topicTags: ['#分享', '#日常'],
      },
      {
        id: '4',
        title: '④ 第四个结果测试展开功能',
        caption: '感谢观看，欢迎点赞关注～',
        topicTags: ['#分享', '#日常'],
      },
    ],
    selectedCaptionId: null,
    onCaptionSelect: vi.fn(),
    hashtags: [
      { id: '1', name: '#春日穿搭' },
      { id: '2', name: '#显白穿搭' },
    ],
    onHashtagAdd: vi.fn(),
    onHashtagRemove: vi.fn(),
    isCaptionExpanded: false,
    onCaptionToggleExpand: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染标题正确', () => {
    render(<AIResults {...defaultProps} />);
    expect(
      screen.getByText('AI生成内容（完整内容包，点击一键填充）'),
    ).toBeInTheDocument();
  });

  it('默认显示前3条结果', () => {
    render(<AIResults {...defaultProps} />);
    expect(screen.getByText(/① 救命/u)).toBeInTheDocument();
    expect(screen.getByText(/② 我真的会谢/u)).toBeInTheDocument();
    expect(screen.getByText(/③ 今日份开心/u)).toBeInTheDocument();
    expect(screen.queryByText(/④ 第四个结果/u)).not.toBeInTheDocument();
  });

  it('展开后显示所有结果', () => {
    render(<AIResults {...defaultProps} isCaptionExpanded />);
    expect(screen.getByText(/① 救命/u)).toBeInTheDocument();
    expect(screen.getByText(/④ 第四个结果/u)).toBeInTheDocument();
  });

  it('点击结果触发 onCaptionSelect', () => {
    render(<AIResults {...defaultProps} />);
    fireEvent.click(screen.getByText(/① 救命/u));
    expect(defaultProps.onCaptionSelect).toHaveBeenCalled();
  });

  it('选中状态显示', () => {
    render(<AIResults {...defaultProps} selectedCaptionId="1" />);
    const resultItem = screen.getByTestId('caption-result-1');
    expect(resultItem.className).toMatch(/resultItemSelected/u);
  });

  it('渲染话题标签', () => {
    render(<AIResults {...defaultProps} />);
    expect(screen.getByText('#春日穿搭')).toBeInTheDocument();
    expect(screen.getByText('#显白穿搭')).toBeInTheDocument();
  });

  it('点击添加话题触发 onHashtagAdd', () => {
    render(<AIResults {...defaultProps} />);
    fireEvent.click(screen.getByText(/添加/u));
    expect(defaultProps.onHashtagAdd).toHaveBeenCalled();
  });

  it('展开按钮显示"收起"', () => {
    render(<AIResults {...defaultProps} isCaptionExpanded />);
    expect(screen.getByText('收起')).toBeInTheDocument();
  });

  it('收起按钮显示"展开"', () => {
    render(<AIResults {...defaultProps} isCaptionExpanded={false} />);
    expect(screen.getByText('展开')).toBeInTheDocument();
  });

  it('点击展开/收起按钮触发 onCaptionToggleExpand', () => {
    render(<AIResults {...defaultProps} />);
    fireEvent.click(screen.getByText('展开'));
    expect(defaultProps.onCaptionToggleExpand).toHaveBeenCalled();
  });

  it('无结果时不渲染区域', () => {
    render(<AIResults {...defaultProps} captionResults={[]} />);
    expect(
      screen.queryByText('AI生成内容（完整内容包，点击一键填充）'),
    ).not.toBeInTheDocument();
  });
});
