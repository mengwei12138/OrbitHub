import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Empty, Input, InputNumber } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { queryClient } from '@/api';
import type { CustomProTableRef } from '@/components';
import { CustomProTable } from '@/components';
import type {
  LowDataContent as LowDataContentItem,
  PlatformCode,
} from '@/services/ai-assistant';
import { lowDataContentsQueryOptions } from '@/services/ai-assistant';

import styles from './style.module.css';

type LowDataContentStatus =
  | 'idle'
  | 'optimizing'
  | 'applied-pending'
  | 'publishing';

export type LowDataContentRow = LowDataContentItem & {
  status?: LowDataContentStatus;
};

type ThresholdValue = {
  viewMin: number;
  likeRateMinPercent: number;
};

const PLATFORM_LABEL: Record<PlatformCode, string> = {
  douyin: '抖音',
  xiaohongshu: '小红书',
};

const PLATFORM_BADGE: Record<PlatformCode, string> = {
  douyin: '抖',
  xiaohongshu: '小',
};

const VIEW_MIN_DEFAULT = 500;
const LIKE_RATE_DEFAULT = 2;
const VIEW_MIN_RANGE = { min: 100, max: 10000 } as const;
const LIKE_RATE_RANGE = { min: 0.5, max: 10 } as const;

type LowDataContentProps = {
  threshold?: ThresholdValue;
  defaultThreshold?: ThresholdValue;
  optimizingContentId?: string;
  appliedContentIds?: string[];
  publishingContentIds?: string[];
  onThresholdChange?: (threshold: ThresholdValue) => void;
  onReset?: () => void;
  onAIClick?: (content: LowDataContentItem) => void;
  onRepublishClick?: (contentId: string) => void;
};

const formatRatePercent = (value: number) =>
  `${(value ?? 0).toFixed(2).replace(/\.?0+$/u, '')}%`;

const LowDataContent = ({
  threshold,
  defaultThreshold = {
    viewMin: VIEW_MIN_DEFAULT,
    likeRateMinPercent: LIKE_RATE_DEFAULT,
  },
  optimizingContentId,
  appliedContentIds,
  publishingContentIds,
  onThresholdChange: _onThresholdChange,
  onReset,
  onAIClick,
  onRepublishClick: _onRepublishClick,
}: LowDataContentProps) => {
  const tableRef = useRef<CustomProTableRef>(null);

  const [viewMin, setViewMin] = useState<number>(
    threshold?.viewMin ?? defaultThreshold.viewMin,
  );
  const [likeRate, setLikeRate] = useState<number>(
    threshold?.likeRateMinPercent ?? defaultThreshold.likeRateMinPercent,
  );
  const [keyword, setKeyword] = useState<string>('');
  const [viewMinError, setViewMinError] = useState<string>('');
  const [likeRateError, setLikeRateError] = useState<string>('');

  const queryParams = useMemo(
    () => ({
      page: 1,
      pageSize: 10,
      viewMin,
      likeRateMinPercent: likeRate,
      keyword: keyword || undefined,
    }),
    [viewMin, likeRate, keyword],
  );

  const appliedSet = useMemo(
    () => new Set(appliedContentIds ?? []),
    [appliedContentIds],
  );

  const publishingSet = useMemo(
    () => new Set(publishingContentIds ?? []),
    [publishingContentIds],
  );

  const enrichRows = useCallback(
    (list: LowDataContentItem[]): LowDataContentRow[] =>
      list.map((item) => ({
        ...item,
        status: publishingSet.has(item.contentId)
          ? 'publishing'
          : appliedSet.has(item.contentId)
            ? 'applied-pending'
            : optimizingContentId === item.contentId
              ? 'optimizing'
              : 'idle',
      })),
    [appliedSet, publishingSet, optimizingContentId],
  );

  const queryOptions = useCallback(
    (pagination: { page: number; pageSize: number }) => {
      const baseOptions = lowDataContentsQueryOptions({
        ...queryParams,
        ...pagination,
      });
      return {
        queryKey: [...baseOptions.queryKey] as unknown[],
        queryFn: async () => {
          const result = await baseOptions.queryFn();
          return {
            ...result,
            list: enrichRows(result.list),
          };
        },
      };
    },
    [queryParams, enrichRows],
  );

  useEffect(() => {
    if (threshold) {
      setViewMin(threshold.viewMin);
      setLikeRate(threshold.likeRateMinPercent);
      tableRef.current?.reload();
    }
  }, [threshold]);

  const validateThreshold = () => {
    let viewErr = '';
    let rateErr = '';
    if (
      Number.isNaN(viewMin) ||
      viewMin < VIEW_MIN_RANGE.min ||
      viewMin > VIEW_MIN_RANGE.max
    ) {
      viewErr = `输入值超出有效范围（${VIEW_MIN_RANGE.min}-${VIEW_MIN_RANGE.max}）`;
    }
    if (
      Number.isNaN(likeRate) ||
      likeRate < LIKE_RATE_RANGE.min ||
      likeRate > LIKE_RATE_RANGE.max
    ) {
      rateErr = `输入值超出有效范围（${LIKE_RATE_RANGE.min}%-${LIKE_RATE_RANGE.max}%）`;
    }
    setViewMinError(viewErr);
    setLikeRateError(rateErr);
    return !viewErr && !rateErr;
  };

  const handleApplyFilter = () => {
    if (!validateThreshold()) return;
    void queryClient.invalidateQueries({
      queryKey: ['ai-assistant', 'content-optimize', 'low-data'],
    });
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setViewMin(defaultThreshold.viewMin);
    setLikeRate(defaultThreshold.likeRateMinPercent);
    setKeyword('');
    setViewMinError('');
    setLikeRateError('');
    onReset?.();
    tableRef.current?.reload();
  };

  const columns: ProColumns<LowDataContentRow>[] = [
    {
      title: '标题 / 摘要',
      dataIndex: 'title',
      width: 600,
      render: (_, record) => (
        <div className={styles.titleCell}>
          <span className={styles.titleText}>{record.title}</span>
          {record.publishedAt && (
            <span className={styles.time}>
              {dayjs(record.publishedAt).format('YYYY-MM-DD HH:mm')}
            </span>
          )}
        </div>
      ),
    },
    {
      title: '账号',
      dataIndex: 'accountNickname',
      width: 220,
      render: (_, record) => (
        <div className={styles.accountCell}>
          <span className={styles.accountName}>
            {record.accountNickname || record.accountId}
          </span>
        </div>
      ),
    },
    {
      title: '平台',
      dataIndex: 'platform',
      width: 120,
      render: (_, record) => (
        <div className={styles.platformCell}>
          <span className={`${styles.platformIcon} ${styles[record.platform]}`}>
            {PLATFORM_BADGE[record.platform]}
          </span>
          <span className={styles.platformName}>
            {PLATFORM_LABEL[record.platform]}
          </span>
        </div>
      ),
    },
    {
      title: '播放量',
      dataIndex: 'viewCount',
      width: 130,
      align: 'right',
      render: (_, record) => <span>{record.viewCount}</span>,
    },
    {
      title: '点赞率',
      dataIndex: 'likeRatePercent',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <span className={styles.likeRate}>
          {formatRatePercent(record.likeRatePercent)}
        </span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 200,
      render: (_, record) => {
        if (publishingSet.has(record.contentId)) {
          return (
            <Button
              icon={<ThunderboltOutlined />}
              disabled
              className={styles.aiButtonOptimizing}
            >
              发布中…
            </Button>
          );
        }
        if (appliedSet.has(record.contentId)) {
          return (
            <div className={styles.appliedCell}>
              <span className={styles.appliedTag}>✓ 已应用待发布</span>
            </div>
          );
        }
        if (optimizingContentId === record.contentId) {
          return (
            <Button
              icon={<ThunderboltOutlined />}
              disabled
              className={styles.aiButtonOptimizing}
            >
              AI 优化中…
            </Button>
          );
        }
        return (
          <Button
            icon={<ThunderboltOutlined />}
            className={styles.aiButton}
            data-testid={`ai-optimize-button-${record.contentId}`}
            onClick={() => onAIClick?.(record)}
          >
            AI 优化
          </Button>
        );
      },
    },
  ];

  return (
    <div className={styles.lowDataContent}>
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.filtersLeft}>
            <div className={styles.filterItem}>
              <span className={styles.filterLabel}>播放量低于</span>
              <InputNumber
                className={styles.select}
                min={VIEW_MIN_RANGE.min}
                max={VIEW_MIN_RANGE.max}
                value={viewMin}
                onChange={(v) => {
                  setViewMin(typeof v === 'number' ? v : Number.NaN);
                  setViewMinError('');
                }}
                addonAfter="次"
                aria-label="播放量阈值"
                status={viewMinError ? 'error' : undefined}
              />
            </div>
            <div className={styles.filterItem}>
              <span className={styles.filterLabel}>点赞率低于</span>
              <InputNumber
                className={styles.select}
                min={LIKE_RATE_RANGE.min}
                max={LIKE_RATE_RANGE.max}
                step={0.1}
                value={likeRate}
                onChange={(v) => {
                  setLikeRate(typeof v === 'number' ? v : Number.NaN);
                  setLikeRateError('');
                }}
                addonAfter="%"
                aria-label="点赞率阈值"
                status={likeRateError ? 'error' : undefined}
              />
            </div>
            <div className={styles.searchBox}>
              <SearchOutlined className={styles.searchIcon} />
              <Input
                className={styles.searchInput}
                placeholder="搜索标题/账号"
                bordered={false}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleApplyFilter}
              />
            </div>
          </div>
          <div className={styles.filtersRight}>
            <Button
              className={styles.resetButton}
              data-testid="filter-reset-button"
              onClick={handleReset}
            >
              重置
            </Button>
            <Button
              type="primary"
              className={styles.filterButton}
              data-testid="filter-apply-button"
              onClick={handleApplyFilter}
            >
              重新筛选
            </Button>
          </div>
        </div>
        {(viewMinError || likeRateError) && (
          <div className={styles.errorTip}>
            {viewMinError && <span>{viewMinError}</span>}
            {likeRateError && <span>{likeRateError}</span>}
          </div>
        )}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <div className={styles.titleBlock}>
            <span className={styles.tableTitle}>低数据内容</span>
          </div>
        </div>
        <CustomProTable
          ref={tableRef}
          queryOptions={queryOptions}
          columns={columns}
          rowKey="contentId"
          search={false}
          emptyContent={
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无低数据内容"
            />
          }
        />
      </div>
    </div>
  );
};

export default LowDataContent;
