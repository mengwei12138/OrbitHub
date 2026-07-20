import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message, Tag } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomModal, PageHeader } from '@/components';
import {
  clearIgnoredWarnings,
  ignoreWarning,
  invalidateWarningRelated,
  markAllRead,
  warningListQueryOptions,
} from '@/services/alert';
import type {
  WarningCategory,
  WarningItem,
  WarningPlatformFilter,
} from '@/services/alert/types';
import { WARNING_LEVEL_MAP } from '@/styles/datacenter/vars';

import type {
  Warning,
  WarningFilterValue,
  WarningLevel,
} from './components/types';

import WarningFilter from './components/WarningFilter';
import WarningList from './components/WarningList';
import WarningStats from './components/WarningStats';
import styles from './style.module.css';

const formatWarningReason = (eventType: string, message: string): string => {
  // 如果 message 已包含阈值格式（包含括号），直接返回
  if (message.includes('(') || message.includes(')')) {
    return message;
  }

  // 根据 eventType 添加阈值信息
  switch (eventType) {
    case 'LOW_PLAY_COUNT':
      return message.includes('低于') ? message : `播放量过低 (<5K)`;
    case 'LOW_LIKE_RATE':
      return message.includes('低于') ? message : `点赞率过低 (<2%)`;
    case 'FOLLOWER_DECLINE':
      return message.includes('下降') ? message : `粉丝负增长 (-5%)`;
    default:
      return message;
  }
};

const transformWarningItem = (item: WarningItem): Warning => {
  const statusMap: Record<string, Warning['status']> = {
    PENDING_UNREAD: 'unread',
    PENDING_READ: 'read',
    IGNORED: 'ignored',
    RESOLVED: 'processed',
  };

  const categoryMap: Record<string, Warning['warningType']> = {
    ACCOUNT_EXCEPTION: 'account',
    CONTENT_EXCEPTION: 'content',
    FOLLOWER_EXCEPTION: 'fans',
  };

  let handleType: Warning['handleType'];
  if (item.eventType === 'LOGIN_EXPIRED') {
    handleType = 'login';
  } else if (item.eventType === 'ACCOUNT_BANNED') {
    handleType = 'account';
  } else if (item.eventType === 'REMOTE_LOGIN') {
    handleType = 'security';
  }

  return {
    id: item.warningId,
    level: (WARNING_LEVEL_MAP[item.level] as WarningLevel) || 'gray',
    accountId: item.accountId,
    contentId: item.contentId,
    accountName: item.accountName,
    platform: item.platform,
    warningType: categoryMap[item.category] || 'account',
    reason: formatWarningReason(item.eventType, item.message),
    status: statusMap[item.state] || 'unread',
    createTime: item.createdAt,
    handleType,
  };
};

const mapFilterType = (
  type: WarningFilterValue['warningType'],
): WarningCategory => {
  const typeMap: Record<string, WarningCategory> = {
    all: 'all',
    account: 'ACCOUNT_EXCEPTION',
    content: 'CONTENT_EXCEPTION',
    fans: 'FOLLOWER_EXCEPTION',
  };
  return typeMap[type] || 'all';
};

/**
 * 把 URL 的 platform 参数归一化为 {@link WarningPlatformFilter}；
 * 非法值（手工拼 URL / 历史值）一律视作 'all'，避免抛错中断渲染。
 */
const parsePlatform = (raw: string | null): WarningPlatformFilter => {
  if (raw === 'douyin' || raw === 'xiaohongshu') return raw;
  return 'all';
};

const PLATFORM_LABEL: Record<WarningPlatformFilter, string> = {
  all: '',
  douyin: '抖音',
  xiaohongshu: '小红书',
};

const Warnings: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<WarningFilterValue>({
    warningType: 'all',
    keyword: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // platform 由数据中心首页 FilterBar 通过 URL `?platform=` 沿用过来；
  // 详情页内不可切换（产品决策：先沿用首页态，后续如需切换器再补）。
  // 端到端语义：list / summary / mark-all-read / clear-ignored 都受这个 platform 约束。
  const platform = useMemo<WarningPlatformFilter>(
    () => parsePlatform(searchParams.get('platform')),
    [searchParams],
  );

  const { data: warningData, isLoading } = useQuery({
    ...warningListQueryOptions({
      type: mapFilterType(filter.warningType),
      keyword: filter.keyword,
      platform,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }),
    select: (data) => ({
      ...data,
      pageData: {
        ...data.pageData,
        list: data.pageData.list.map(transformWarningItem),
      },
    }),
  });

  const totalCount = Number(warningData?.summary?.totalPending) || 0;
  const unreadCount = Number(warningData?.summary?.unreadPending) || 0;
  const abnormalAccountCount =
    Number(warningData?.summary?.abnormalAccountCount) || 0;
  const warnings = warningData?.pageData?.list || [];
  const total = Number(warningData?.pageData?.total) || 0;

  const markAllReadMutation = useMutation({
    // 「我看到的就是我能操作的」：当前 platform 过滤态透传给后端，仅影响该平台下的可见账号
    mutationFn: () => markAllRead(platform),
    onSuccess: () => {
      invalidateWarningRelated(queryClient);
      message.success('已全部标记为已读');
    },
    onError: (error: Error) => {
      message.error(error.message || '操作失败');
    },
  });

  const clearIgnoredMutation = useMutation({
    mutationFn: () => clearIgnoredWarnings(platform),
    onSuccess: () => {
      invalidateWarningRelated(queryClient);
      message.success('已清空已忽略项');
      if (pagination.current > 1 && warnings.length === 0) {
        setPagination((prev) => ({ ...prev, current: 1 }));
      }
    },
    onError: (error: Error) => {
      message.error(error.message || '操作失败');
    },
  });

  const ignoreWarningMutation = useMutation({
    mutationFn: ignoreWarning,
    onSuccess: () => {
      invalidateWarningRelated(queryClient);
      message.success('已忽略预警');
      if (pagination.current > 1 && warnings.length === 1) {
        setPagination((prev) => ({ ...prev, current: prev.current - 1 }));
      }
    },
    onError: (error: Error) => {
      message.error(error.message || '操作失败');
    },
  });

  const handleMarkAllRead = useCallback(() => {
    CustomModal.confirm({
      title: '确认标记已读',
      content: '确认将所有未读预警标记为已读吗？',
      onOk: () => {
        markAllReadMutation.mutate();
      },
    });
  }, [markAllReadMutation]);

  const handleClearIgnored = useCallback(() => {
    CustomModal.confirm({
      title: '危险操作',
      content: '确认永久删除所有已忽略的预警记录吗？此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      onOk: () => {
        clearIgnoredMutation.mutate();
      },
    });
  }, [clearIgnoredMutation]);

  const handleViewDetail = useCallback(
    (warning: Warning) => {
      navigate(`/datacenter/account/${warning.accountId}`);
    },
    [navigate],
  );

  const handleIgnore = useCallback(
    (warning: Warning) => {
      ignoreWarningMutation.mutate(warning.id);
    },
    [ignoreWarningMutation],
  );

  const handleGoToHandle = useCallback(
    (warning: Warning) => {
      const handleType = warning.handleType || 'account';
      switch (handleType) {
        case 'login':
          // 与账号列表「重新登录」按钮一致：mode=reactivate 直达失效重新登录流程，
          // 不再跳回 /account 让用户自己再点一次
          navigate(
            `/account/add?mode=reactivate&accountId=${warning.accountId}&from=datacenter`,
          );
          break;
        case 'content':
          if (warning.contentId) {
            navigate(
              `/content/republish?recordId=${warning.contentId}&from=datacenter`,
            );
          } else {
            // 历史预警 / 异常路径无 contentId 时优雅降级：跳账号详情，避免点击无反应
            navigate(
              `/datacenter/account/${warning.accountId}?from=datacenter`,
            );
          }
          break;
        case 'security':
          navigate(
            `/datacenter/account/${warning.accountId}?from=datacenter&tab=security`,
          );
          break;
        case 'account':
          navigate(
            `/datacenter/account/${warning.accountId}?from=datacenter&alertType=ACCOUNT_BANNED`,
          );
          break;
        default:
          navigate(`/datacenter/account/${warning.accountId}?from=datacenter`);
          break;
      }
    },
    [navigate],
  );

  const handleFilterChange = useCallback((value: WarningFilterValue) => {
    setFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  }, []);

  return (
    <div className={styles.container}>
      <PageHeader
        title="数据预警"
        toolbar={
          <>
            {platform !== 'all' && (
              <Tag color="blue" data-testid="platform-filter-tag">
                正在查看：{PLATFORM_LABEL[platform]}预警
              </Tag>
            )}
            <button
              type="button"
              onClick={() => {
                const timeRange = searchParams.get('timeRange') || 'today';
                navigate(
                  `/datacenter?timeRange=${timeRange}&platform=${platform}`,
                );
              }}
              className={styles.backButton}
            >
              返回数据中心
            </button>
          </>
        }
      />
      <WarningStats
        totalCount={totalCount}
        unreadCount={unreadCount}
        abnormalAccountCount={abnormalAccountCount}
        loading={isLoading}
        onMarkAllRead={handleMarkAllRead}
        onClearIgnored={handleClearIgnored}
      />
      <WarningFilter value={filter} onChange={handleFilterChange} />
      <WarningList
        data={warnings}
        loading={isLoading}
        pagination={{ ...pagination, total }}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
        onIgnore={handleIgnore}
        onHandle={handleGoToHandle}
      />
    </div>
  );
};

export default Warnings;
