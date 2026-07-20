import type { ProColumns } from '@ant-design/pro-components';
import { Select, Tooltip } from 'antd';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomProTable, PlatformIcon } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import ContentSvg from '@/pages/datacenter/images/content-header-icon.svg';
import { formatCompactCount } from '@/pages/datacenter/utils/format-compact-count';
import { contentsQueryOptions } from '@/services/statistics';
import type {
  ContentSortBy,
  ContentTypeFilter,
} from '@/services/statistics/types';
import { useDataCenterStore } from '@/store';
import styles from './style.module.css';
import type {
  ContentItem,
  ContentTableProps,
  ContentType,
  SortBy,
} from './types';

const CONTENT_TYPE_TABS = [
  { key: 'all', name: '全部' },
  { key: 'video', name: '视频' },
  { key: 'image_text', name: '图文' },
];

const PLATFORM_LABELS: Record<string, string> = {
  douyin: '抖音',
  xiaohongshu: '小红书',
};

const SORT_OPTIONS = [
  { value: 'playCount', label: '按播放量' },
  { value: 'likeCount', label: '按点赞量' },
  { value: 'commentCount', label: '按评论量' },
];

const ContentTab: React.FC<{
  tabs: { key: string; name: string }[];
  activeTab: string;
  onChange: (key: string) => void;
}> = ({ tabs, activeTab, onChange }) => (
  <div className={styles.contentTab}>
    {tabs.map((tab) => {
      const isActive = tab.key === activeTab;
      return (
        <div
          key={tab.key}
          className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className={styles.tabText}>{tab.name}</span>
          {isActive && <div className={styles.tabUnderline} />}
        </div>
      );
    })}
  </div>
);

const transformContentData = (
  list: Array<{
    contentId: string;
    title: string;
    accountId: string;
    accountName: string;
    platform: 'douyin' | 'xiaohongshu';
    playCount: string;
    likeCount: string;
    commentCount: string;
    shareCount: string;
    engagementRate: string | null;
    coverUrl?: string | null;
  }>,
): ContentItem[] => {
  return list.map((item) => ({
    id: item.contentId,
    cover: item.coverUrl || ContentSvg,
    titleOrText: item.title,
    account: item.accountName,
    accountId: item.accountId,
    platform: item.platform,
    play: parseInt(item.playCount, 10) || 0,
    like: parseInt(item.likeCount, 10) || 0,
    comment: parseInt(item.commentCount, 10) || 0,
    share: parseInt(item.shareCount, 10) || 0,
    interactionRate: item.engagementRate ? parseFloat(item.engagementRate) : 0,
  }));
};

const buildContentsQueryOptions = (params: {
  timeRange: string;
  platform?: string;
  contentType: string;
  sortBy: string;
  page: number;
  pageSize: number;
}) => {
  const baseOptions = contentsQueryOptions({
    timeRange: params.timeRange as
      | 'today'
      | 'last7days'
      | 'last30days'
      | 'thisYear',
    platform: params.platform as 'douyin' | 'xiaohongshu' | undefined,
    contentType: params.contentType as ContentTypeFilter,
    sortBy: params.sortBy as ContentSortBy,
    page: params.page,
    pageSize: params.pageSize,
  });

  return {
    queryKey: baseOptions.queryKey,
    queryFn: async () => {
      const res = await baseOptions.queryFn();
      return {
        ...res,
        list: transformContentData(
          res.list as Parameters<typeof transformContentData>[0],
        ),
      };
    },
  };
};

const ContentTable = forwardRef<CustomProTableRef, ContentTableProps>(
  ({ timeRange, platform }, _ref) => {
    const navigate = useNavigate();
    const contentTypeDebounceRef = useRef<number | null>(null);
    const sortByDebounceRef = useRef<number | null>(null);
    const pendingContentTypeRef = useRef<ContentType>('all');
    const pendingSortByRef = useRef<SortBy>('playCount');
    const tableRef = useRef<CustomProTableRef>(null);
    const prevFilterRef = useRef<{
      timeRange: string;
      platform: string;
    } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const isInitializedRef = useRef(false);

    const { contentTable, setContentType, setSortBy, setPage, setScrollTop } =
      useDataCenterStore();

    const { contentType, sortBy, scrollTop, page } = contentTable;

    useImperativeHandle(
      _ref,
      () => ({
        reload: () => tableRef.current?.reload(),
        reset: () => tableRef.current?.reset(),
      }),
      [],
    );

    const restoreScrollPosition = useCallback(() => {
      if (scrollContainerRef.current && scrollTop > 0) {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollTop;
          }
        });
      }
    }, [scrollTop]);

    const saveScrollPosition = useCallback(() => {
      if (scrollContainerRef.current) {
        const currentScrollTop = scrollContainerRef.current.scrollTop;
        setScrollTop(currentScrollTop);
      }
    }, [setScrollTop]);

    useEffect(() => {
      const container = document.querySelector('.ant-table-body');
      if (container) {
        scrollContainerRef.current = container as HTMLDivElement;
        if (scrollTop > 0) {
          restoreScrollPosition();
        }
        container.addEventListener('scroll', saveScrollPosition);
        return () => {
          container.removeEventListener('scroll', saveScrollPosition);
        };
      }
    }, [restoreScrollPosition, saveScrollPosition, scrollTop]);

    useEffect(() => {
      if (isInitializedRef.current) {
        if (
          prevFilterRef.current?.timeRange !== timeRange ||
          prevFilterRef.current?.platform !== platform
        ) {
          prevFilterRef.current = { timeRange, platform };
          setContentType('all');
          setSortBy('playCount');
          setScrollTop(0);
          tableRef.current?.reset();
        }
      } else {
        prevFilterRef.current = { timeRange, platform };
        isInitializedRef.current = true;
      }
    }, [timeRange, platform, setContentType, setSortBy, setScrollTop]);

    const queryOptions = useMemo(() => {
      return (params: { page: number; pageSize: number }) => {
        return buildContentsQueryOptions({
          timeRange,
          platform: platform === 'all' ? undefined : platform,
          contentType,
          sortBy,
          page: page > 1 ? page : params.page,
          pageSize: params.pageSize,
        });
      };
    }, [timeRange, platform, contentType, sortBy, page]);

    const handleContentTypeChange = useCallback(
      (key: string) => {
        const newType = key as ContentType;
        pendingContentTypeRef.current = newType;

        if (contentTypeDebounceRef.current) {
          clearTimeout(contentTypeDebounceRef.current);
        }

        contentTypeDebounceRef.current = window.setTimeout(() => {
          setContentType(pendingContentTypeRef.current);
          tableRef.current?.reload();
        }, 300);
      },
      [setContentType],
    );

    const handleSortChange = useCallback(
      (value: SortBy) => {
        pendingSortByRef.current = value;

        if (sortByDebounceRef.current) {
          clearTimeout(sortByDebounceRef.current);
        }

        sortByDebounceRef.current = window.setTimeout(() => {
          setSortBy(pendingSortByRef.current);
          tableRef.current?.reload();
        }, 300);
      },
      [setSortBy],
    );

    useEffect(() => {
      return () => {
        if (contentTypeDebounceRef.current) {
          clearTimeout(contentTypeDebounceRef.current);
        }
        if (sortByDebounceRef.current) {
          clearTimeout(sortByDebounceRef.current);
        }
      };
    }, []);

    const columns: ProColumns<ContentItem>[] = useMemo(
      () => [
        {
          title: '封面',
          dataIndex: 'cover',
          key: 'cover',
          width: 88,
          render: (_, record) => (
            <div className={styles.coverWrapper}>
              <img
                src={record.cover}
                alt="封面"
                className={styles.cover}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== ContentSvg) {
                    img.src = ContentSvg;
                  }
                }}
              />
            </div>
          ),
        },
        {
          title: '标题/文案',
          dataIndex: 'titleOrText',
          key: 'titleOrText',
          ellipsis: true,
        },
        {
          title: '账号',
          dataIndex: 'account',
          key: 'account',
          width: 160,
          render: (_, record) => {
            const to = `/datacenter/account/${record.accountId}?from=datacenter`;
            return (
              <a
                href={to}
                className={styles.accountLink}
                onClick={(e) => {
                  e.preventDefault();
                  if (contentTypeDebounceRef.current) {
                    clearTimeout(contentTypeDebounceRef.current);
                  }
                  if (sortByDebounceRef.current) {
                    clearTimeout(sortByDebounceRef.current);
                  }
                  navigate(to);
                }}
              >
                {record.account}
              </a>
            );
          },
        },
        {
          title: '平台',
          dataIndex: 'platform',
          key: 'platform',
          width: 100,
          render: (_, record) => (
            <div className={styles.platformCell}>
              <PlatformIcon platform={record.platform} size={22} />
              <span className={styles.platformLabel}>
                {PLATFORM_LABELS[record.platform]}
              </span>
            </div>
          ),
        },
        {
          title: '播放量',
          dataIndex: 'play',
          key: 'play',
          width: 120,
          render: (_, record) => formatCompactCount(record.play),
        },
        {
          title: '点赞量',
          dataIndex: 'like',
          key: 'like',
          width: 120,
          render: (_, record) => formatCompactCount(record.like),
        },
        {
          title: '评论量',
          dataIndex: 'comment',
          key: 'comment',
          width: 120,
          render: (_, record) => formatCompactCount(record.comment),
        },
        {
          title: '转发量',
          dataIndex: 'share',
          key: 'share',
          width: 120,
          render: (_, record) => formatCompactCount(record.share),
        },
        {
          title: '互动率',
          dataIndex: 'interactionRate',
          key: 'interactionRate',
          width: 112,
          render: (_, record) => {
            if (record.play === 0) return '-';
            const rate = record.interactionRate;
            const isGreen = rate >= 9;
            const fullText = `${rate.toFixed(2)}%`;
            const displayText =
              fullText.length > 6 ? `${fullText.slice(0, 6)}...` : fullText;
            return (
              <Tooltip title={fullText}>
                <span
                  className={isGreen ? styles.rateGreen : styles.rateOrange}
                >
                  {displayText}
                </span>
              </Tooltip>
            );
          },
        },
      ],
      [navigate],
    );

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <img src={ContentSvg} alt="内容" className={styles.icon} />
          <span className={styles.title}>内容表现</span>
          <div className={styles.tabBarWrapper}>
            <ContentTab
              tabs={CONTENT_TYPE_TABS}
              activeTab={contentType}
              onChange={handleContentTypeChange}
            />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>排序</span>
          <Select
            className={styles.sortSelect}
            value={sortBy}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
          />
        </div>

        <div className={styles.tableWrapper}>
          <CustomProTable<ContentItem>
            ref={tableRef}
            queryOptions={queryOptions}
            columns={columns}
            rowKey="id"
            search={false}
            pagination={{
              current: page,
              onChange: (page) => setPage(page),
            }}
          />
        </div>
      </div>
    );
  },
);

ContentTable.displayName = 'ContentTable';

export default ContentTable;
