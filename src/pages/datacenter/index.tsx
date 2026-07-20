import { ReloadOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import { PLACEHOLDER } from '@/constants';
import {
  ignoreWarning,
  invalidateWarningRelated,
  warningListQueryOptions,
} from '@/services/alert';
import {
  accountOptionsQueryOptions,
  overviewQueryOptions,
  playTrendQueryOptions,
} from '@/services/statistics';
import type { KpiMetric, PlayTrendResponse } from '@/services/statistics/types';
import { useDataCenterStore } from '@/store';
import { formatShortDateTime, formatTime } from '@/utils/date';
import ContentTable from './components/ContentTable';
import FilterBar from './components/FilterBar';
import type { Platform, TimeRange } from './components/FilterBar/types';
import MetricsGrid from './components/MetricsGrid';
import PlayTrendChart from './components/PlayTrendChart';
import type {
  Granularity,
  TrendDataPoint,
} from './components/PlayTrendChart/types';
import WarningZone from './components/WarningZone';
import type { Alert } from './components/WarningZone/types';
import IconComment from './images/icon-comment.svg';
import IconDm from './images/icon-dm.svg';
import IconFollower from './images/icon-follower.svg';
import IconLike from './images/icon-like.svg';
import IconPlay from './images/icon-play.svg';
import IconShare from './images/icon-share.svg';
import styles from './style.module.css';
import { formatCompactCount } from './utils/format-compact-count';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

const STORAGE_KEY_TREND_ACCOUNT = 'datacenter_trend_account_id';

const DEFAULT_METRICS = [
  {
    key: 'playCount',
    title: '总播放量',
    value: PLACEHOLDER,
    delta: undefined,
    deltaType: 'up' as const,
    icon: IconPlay,
    iconBgColor: '#E6F4FF',
  },
  {
    key: 'likeCount',
    title: '总点赞量',
    value: PLACEHOLDER,
    delta: undefined,
    deltaType: 'up' as const,
    icon: IconLike,
    iconBgColor: '#FFF1F0',
  },
  {
    key: 'commentCount',
    title: '总评论量',
    value: PLACEHOLDER,
    delta: undefined,
    deltaType: 'up' as const,
    icon: IconComment,
    iconBgColor: '#F6FFED',
  },
  {
    key: 'shareCount',
    title: '总转发量',
    value: PLACEHOLDER,
    delta: undefined,
    deltaType: 'up' as const,
    icon: IconShare,
    iconBgColor: '#F9F0FF',
  },
  {
    key: 'followerDelta',
    title: '新增粉丝',
    value: PLACEHOLDER,
    delta: undefined,
    deltaType: 'up' as const,
    icon: IconFollower,
    iconBgColor: '#FFF7E6',
  },
  {
    key: 'dmCount',
    title: '私信量',
    value: PLACEHOLDER,
    delta: undefined,
    deltaType: 'up' as const,
    icon: IconDm,
    iconBgColor: '#E6FFFB',
  },
];

function formatNumber(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return PLACEHOLDER;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (Number.isNaN(num)) return PLACEHOLDER;
  if (num === 0) return PLACEHOLDER;
  return formatCompactCount(num);
}

function calculateDelta(
  current: string,
  baseline: string,
): { delta: string; deltaType: 'up' | 'down' } {
  const curr = parseInt(current, 10) || 0;
  const base = parseInt(baseline, 10) || 0;

  if (base === 0 && curr > 0) return { delta: '+100%', deltaType: 'up' };
  if (base === 0 && curr === 0) return { delta: '-', deltaType: 'up' };
  if (curr === 0 && base > 0) return { delta: '-100%', deltaType: 'down' };

  const ratio = (curr - base) / base;
  const sign = ratio >= 0 ? '+' : '';
  return {
    delta: `${sign}${(ratio * 100).toFixed(1)}%`,
    deltaType: ratio >= 0 ? 'up' : 'down',
  };
}

function mapKpiToMetrics(metrics: KpiMetric[]) {
  const metricMap: Record<string, KpiMetric> = {};
  metrics.forEach((m) => {
    metricMap[m.name] = m;
  });

  return DEFAULT_METRICS.map((defaultMetric) => {
    const kpi = metricMap[defaultMetric.key];
    if (!kpi) return defaultMetric;

    const { delta, deltaType } = calculateDelta(
      kpi.currentValue,
      kpi.baselineValue,
    );
    return {
      ...defaultMetric,
      value: formatNumber(kpi.currentValue),
      delta,
      deltaType,
    };
  });
}

function transformTrendData(response: PlayTrendResponse): TrendDataPoint[] {
  return response.points.map((point) => ({
    date: point.bucket,
    value: point.playCount ? parseInt(point.playCount, 10) : null,
  }));
}

function transformAlertData(
  list: Array<{
    warningId: string;
    accountId: string;
    contentId?: string;
    accountName: string;
    platform: 'douyin' | 'xiaohongshu';
    level: 'HIGH' | 'MEDIUM' | 'NORMAL';
    eventType: string;
    message: string;
    createdAt: string;
    state: 'PENDING_UNREAD' | 'PENDING_READ' | 'IGNORED' | 'RESOLVED';
  }>,
): Alert[] {
  return list.map((item) => {
    let handleType: 'login' | 'content' | 'account' | 'security' | undefined;
    if (item.eventType === 'LOGIN_EXPIRED') {
      handleType = 'login';
    } else if (item.eventType === 'ACCOUNT_BANNED') {
      handleType = 'account';
    } else if (item.eventType === 'REMOTE_LOGIN') {
      handleType = 'security';
    } else if (
      item.eventType === 'LOW_PLAY_COUNT' ||
      item.eventType === 'LOW_LIKE_RATE'
    ) {
      handleType = 'content';
    } else if (item.eventType === 'FOLLOWER_DECLINE') {
      handleType = 'account';
    }

    let status: 'unread' | 'read' | 'ignored' | 'processed';
    if (item.state === 'PENDING_UNREAD') {
      status = 'unread';
    } else if (item.state === 'PENDING_READ') {
      status = 'read';
    } else if (item.state === 'IGNORED') {
      status = 'ignored';
    } else {
      status = 'processed';
    }

    return {
      id: item.warningId,
      level: item.level,
      status,
      platform: item.platform,
      account: item.accountName,
      accountId: item.accountId,
      contentId: item.contentId,
      reason: item.message,
      time: formatShortDateTime(item.createdAt),
      eventType: item.eventType,
      handleType,
    };
  });
}

const DataCentre: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    contentTable,
    playTrend,
    setTimeRange: setStoreTimeRange,
    setPlatform: setStorePlatform,
    setGranularity: setStoreGranularity,
  } = useDataCenterStore();
  const { timeRange, platform } = contentTable;
  const { granularity } = playTrend;

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);

  const autoRefreshTimerRef = useRef<number | null>(null);
  const isManual操作Ref = useRef(false);
  const contentTableRef = useRef<CustomProTableRef>(null);

  // Load saved account from localStorage
  useEffect(() => {
    const savedAccountId = localStorage.getItem(STORAGE_KEY_TREND_ACCOUNT);
    // 历史脏数据可能存了 '0'（旧版本回退值），后端会判定为无权访问，过滤掉
    if (savedAccountId && savedAccountId !== '0') {
      setSelectedAccountId(savedAccountId);
    }
  }, []);

  // Account list query — 数据中心专属候选池，按 scope + platform 过滤；与同主页其他接口同 SPI
  const { data: accountData } = useQuery(
    accountOptionsQueryOptions({ platform }),
  );

  const accountOptions = useMemo(() => {
    if (!accountData?.length) return [];
    return accountData.map((acc) => ({
      value: acc.id,
      label: acc.nickname,
    }));
  }, [accountData]);

  // Set default / fallback account
  // 三种情形：
  //   1. selectedAccountId 为空（首次进页面 / 切租户 / 切 platform 候选池变空）→ 选首项
  //   2. selectedAccountId 不在新候选池内（如 localStorage 兜底命中已不可见账号 / platform 切换后旧 id 失效）→ 回退首项
  //   3. selectedAccountId 在候选池内 → 保持不变
  useEffect(() => {
    if (accountOptions.length === 0) return;
    const stillVisible = accountOptions.some(
      (opt) => opt.value === selectedAccountId,
    );
    if (!stillVisible) {
      setSelectedAccountId(accountOptions[0].value);
    }
  }, [accountOptions, selectedAccountId]);

  // Overview query (六宫格 + 预警摘要)
  const overviewQuery = useQuery({
    ...overviewQueryOptions({ timeRange, platform }),
    enabled: !refreshing,
  });

  // Warning list query
  const warningQuery = useQuery({
    ...warningListQueryOptions({ page: 1, pageSize: 10 }),
    enabled: !refreshing,
  });

  // Trend query
  const trendQuery = useQuery({
    ...playTrendQueryOptions({
      accountId: selectedAccountId,
      timeRange,
      granularity,
    }),
    enabled: !refreshing && !!selectedAccountId,
  });

  // 趋势查询 40401：当前选中账号已不可见（被删 / 跨用户转移 / 候选池过时）。
  // 清掉 localStorage 并回退候选池第一项；候选池为空则保持空。
  useEffect(() => {
    const err = trendQuery.error as { code?: number } | null;
    if (err?.code !== 40401) return;
    localStorage.removeItem(STORAGE_KEY_TREND_ACCOUNT);
    if (accountOptions.length > 0) {
      const fallback = accountOptions[0].value;
      if (fallback !== selectedAccountId) {
        setSelectedAccountId(fallback);
      }
    } else {
      setSelectedAccountId('');
    }
  }, [trendQuery.error, accountOptions, selectedAccountId]);

  // Metrics data
  const metricsData = useMemo(() => {
    if (!overviewQuery.data?.metrics?.length) return DEFAULT_METRICS;
    return mapKpiToMetrics(overviewQuery.data.metrics);
  }, [overviewQuery.data]);

  // Warning stats
  const warningStats = useMemo(() => {
    const summary = overviewQuery.data?.warningSummary;
    if (!summary) return { total: 0, unread: 0, abnormal: 0 };
    return {
      total: parseInt(summary.totalPending, 10) || 0,
      unread: parseInt(summary.unreadPending, 10) || 0,
      abnormal: parseInt(summary.abnormalAccountCount, 10) || 0,
    };
  }, [overviewQuery.data]);

  // Warning alerts
  const alertData = useMemo(() => {
    if (!warningQuery.data?.pageData?.list?.length) return [];
    const allAlerts = transformAlertData(warningQuery.data.pageData.list);

    return allAlerts.slice(0, 3);
  }, [warningQuery.data]);

  // Trend data
  const trendData = useMemo(() => {
    if (!trendQuery.data?.points?.length) return [];
    return transformTrendData(trendQuery.data);
  }, [trendQuery.data]);

  // Handle time range change
  const handleTimeRangeChange = useCallback(
    (value: TimeRange) => {
      setStoreTimeRange(value);
    },
    [setStoreTimeRange],
  );

  // Handle platform change
  const handlePlatformChange = useCallback(
    (value: Platform) => {
      setStorePlatform(value);
    },
    [setStorePlatform],
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLastRefreshTime(formatTime());
    isManual操作Ref.current = true;

    // refetch() 会绕过 enabled 守卫；未选账号时不能拉趋势，否则后端会用 accountId=0 抛 40401
    const tasks: Promise<unknown>[] = [
      overviewQuery.refetch({ throwOnError: true }),
      warningQuery.refetch({ throwOnError: true }),
      Promise.resolve().then(() => contentTableRef.current?.reload()),
    ];
    if (selectedAccountId) {
      tasks.push(trendQuery.refetch({ throwOnError: true }));
    }

    Promise.all(tasks)
      .catch(() => {
        message.error('刷新失败，请稍后重试');
      })
      .finally(() => {
        setRefreshing(false);
        isManual操作Ref.current = false;
      });
  }, [overviewQuery, warningQuery, trendQuery, selectedAccountId]);

  // Handle account change
  const handleAccountChange = useCallback((accountId: string) => {
    setSelectedAccountId(accountId);
    localStorage.setItem(STORAGE_KEY_TREND_ACCOUNT, accountId);
  }, []);

  // Handle granularity change
  const handleGranularityChange = useCallback(
    (value: Granularity) => {
      if (timeRange === 'today' && value === 'day') {
        message.info('当前粒度仅显示1个数据点，建议切换到按小时查看');
      }
      setStoreGranularity(value);
    },
    [timeRange, setStoreGranularity],
  );

  // Handle ignore warning
  const handleIgnoreWarning = useCallback(
    async (warningId: string) => {
      try {
        await ignoreWarning(warningId);
        message.success('已忽略预警');
        invalidateWarningRelated(queryClient);
      } catch {
        message.error('忽略失败，请稍后重试');
      }
    },
    [queryClient],
  );

  // Handle view detail
  const handleViewDetail = useCallback(
    (alert: Alert) => {
      navigate(`/datacenter/account/${alert.accountId}?from=datacenter`);
    },
    [navigate],
  );

  // Handle go to handle page
  const handleGoToHandle = useCallback(
    (alert: Alert) => {
      const handleType = alert.handleType || 'account';
      switch (handleType) {
        case 'login':
          // 与账号列表「重新登录」按钮一致：mode=reactivate 触发账号失效重新登录流程，
          // 而非默认的「添加账号」表单（缺 mode 时 add 页判定 isReactivate=false 会回退）
          navigate(
            `/account/add?mode=reactivate&accountId=${alert.accountId}&from=datacenter`,
          );
          break;
        case 'content':
          if (alert.contentId) {
            navigate(
              `/content/republish?recordId=${alert.contentId}&from=datacenter`,
            );
          } else {
            // 历史预警 / 异常路径无 contentId 时优雅降级：跳账号详情，避免点击无反应
            navigate(`/datacenter/account/${alert.accountId}?from=datacenter`);
          }
          break;
        case 'security':
          navigate(
            `/datacenter/account/${alert.accountId}?from=datacenter&tab=security`,
          );
          break;
        default:
          navigate(`/datacenter/account/${alert.accountId}?from=datacenter`);
          break;
      }
    },
    [navigate],
  );

  // Handle view all warnings
  const handleViewAllWarnings = useCallback(() => {
    navigate(
      `/datacenter/warnings?timeRange=${timeRange}&platform=${platform}`,
    );
  }, [navigate, timeRange, platform]);

  // Auto refresh setup
  useEffect(() => {
    const startAutoRefresh = () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
      autoRefreshTimerRef.current = window.setInterval(() => {
        if (!document.hidden && !isManual操作Ref.current) {
          overviewQuery.refetch();
          warningQuery.refetch();
        }
      }, AUTO_REFRESH_INTERVAL);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (autoRefreshTimerRef.current) {
          clearInterval(autoRefreshTimerRef.current);
          autoRefreshTimerRef.current = null;
        }
      } else {
        startAutoRefresh();
        overviewQuery.refetch();
        warningQuery.refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startAutoRefresh();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [overviewQuery, warningQuery]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="数据中心"
        toolbar={
          <>
            {lastRefreshTime && (
              <span className={styles.lastRefresh}>
                上次刷新 {lastRefreshTime}
              </span>
            )}
            <Button
              icon={<ReloadOutlined />}
              loading={refreshing}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </>
        }
      />

      <FilterBar
        timeRange={timeRange}
        platform={platform}
        onTimeRangeChange={handleTimeRangeChange}
        onPlatformChange={handlePlatformChange}
      />

      <WarningZone
        alerts={alertData}
        stats={warningStats}
        onViewDetail={handleViewDetail}
        onIgnore={handleIgnoreWarning}
        onHandle={handleGoToHandle}
        onViewAll={handleViewAllWarnings}
      />

      <MetricsGrid metrics={metricsData} timeRange={timeRange} />

      <PlayTrendChart
        data={trendData}
        account={selectedAccountId}
        granularity={granularity}
        timeRange={timeRange}
        loading={trendQuery.isFetching}
        accountOptions={accountOptions}
        onAccountChange={handleAccountChange}
        onGranularityChange={handleGranularityChange}
      />

      <ContentTable
        ref={contentTableRef}
        timeRange={timeRange}
        platform={platform}
      />
    </div>
  );
};

export default DataCentre;
