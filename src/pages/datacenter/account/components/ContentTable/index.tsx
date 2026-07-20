import type { ProColumns } from '@ant-design/pro-components';

import { CustomProTable } from '@/components';
import { formatCompactCount } from '@/pages/datacenter/utils/format-compact-count';
import { contentsQueryOptions } from '@/services/statistics';
import type { ContentItem } from '@/services/statistics/queryOptions';
import type {
  ContentPerformanceItem,
  TimeRange,
} from '@/services/statistics/types';
import iconContent from '../../images/icon-content.svg';
import styles from './style.module.css';

type ContentTableProps = {
  accountId: string;
  timeRange?: TimeRange;
};

const calculateInteractionRate = (item: ContentItem): string => {
  if (item.playCount === 0) return '-';
  const rate =
    ((item.likeCount + item.commentCount + item.shareCount) / item.playCount) *
    100;
  if (rate > 999.99) return '>999.99%';
  return `${rate.toFixed(2)}%`;
};

const transformContentItem = (item: ContentPerformanceItem): ContentItem => ({
  id: item.contentId,
  cover: item.coverUrl ?? '',
  title: item.title,
  playCount: parseInt(item.playCount || '0', 10),
  likeCount: parseInt(item.likeCount || '0', 10),
  commentCount: parseInt(item.commentCount || '0', 10),
  shareCount: parseInt(item.shareCount || '0', 10),
});

const ContentTable: React.FC<ContentTableProps> = ({
  accountId,
  timeRange = 'last7days',
}) => {
  const queryOptions = ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    const baseOptions = contentsQueryOptions({
      accountId,
      timeRange,
      page,
      pageSize,
    });
    return {
      queryKey: baseOptions.queryKey,
      queryFn: async () => {
        const res = await baseOptions.queryFn();
        return {
          list: res.list.map(transformContentItem),
          total: res.total,
        };
      },
    };
  };

  const columns: ProColumns<ContentItem>[] = [
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 88,
      render: (_dom, record) =>
        record.cover ? (
          <img src={record.cover} alt="" className={styles.coverImage} />
        ) : (
          <div className={styles.coverPlaceholder} aria-label="暂无封面" />
        ),
    },
    {
      title: '标题/文案',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '播放量',
      dataIndex: 'playCount',
      key: 'playCount',
      width: 140,
      render: (_dom, record) =>
        record.playCount === 0 ? '-' : formatCompactCount(record.playCount),
    },
    {
      title: '点赞量',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 140,
      render: (_dom, record) =>
        record.likeCount === 0 ? '-' : formatCompactCount(record.likeCount),
    },
    {
      title: '评论量',
      dataIndex: 'commentCount',
      key: 'commentCount',
      width: 140,
      render: (_dom, record) =>
        record.commentCount === 0
          ? '-'
          : formatCompactCount(record.commentCount),
    },
    {
      title: '互动率',
      dataIndex: 'interactionRate',
      key: 'interactionRate',
      width: 140,
      render: (_dom, record) => {
        const rate = calculateInteractionRate(record);
        const isHighRate = rate.startsWith('>') || parseFloat(rate) >= 9;
        const displayRate = rate.length > 6 ? `${rate.slice(0, 6)}...` : rate;
        return (
          <span
            className={styles.interactionRate}
            style={{ color: isHighRate ? '#52C41A' : '#FA8C16' }}
            title={rate}
          >
            {displayRate}
          </span>
        );
      },
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src={iconContent} alt="" className={styles.headerIcon} />
        <span className={styles.title}>近期内容列表</span>
        <span className={styles.subtitle}>该账号最近发布的内容</span>
      </div>

      <CustomProTable
        columns={columns}
        queryOptions={queryOptions}
        rowKey="id"
        search={false}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default ContentTable;
