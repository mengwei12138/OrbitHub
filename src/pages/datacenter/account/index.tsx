import { useQuery } from '@tanstack/react-query';
import { Alert, Button, message } from 'antd';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components';
import { accountDetailQueryOptions } from '@/services/statistics';
import type {
  AccountDetailResponse,
  KpiMetric,
  TrendPoint,
} from '@/services/statistics/types';

import {
  BasicInfo,
  ContentTable,
  TodayMetrics,
  TrendChart,
} from './components';
import type { BasicInfoData } from './components/BasicInfo/types';
import type { TodayMetricsData } from './components/TodayMetrics/types';
import type { TrendChartDataItem } from './components/TrendChart/types';
import styles from './style.module.css';

const kpiMetricToMap = (metrics: KpiMetric[]): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const m of metrics) {
    result[m.name] = m.currentValue;
  }
  return result;
};

const parseBasicInfo = (data: AccountDetailResponse): BasicInfoData => ({
  nickname: data.account.nickname,
  platform: data.account.platform,
  fansCount: parseInt(data.account.followers || '0', 10),
  status: data.account.status === 'ONLINE' ? 'online' : 'offline',
  lastSyncTime: data.account.lastSyncTime,
});

const parseTodayMetrics = (data: AccountDetailResponse): TodayMetricsData => {
  const map = kpiMetricToMap(data.todayMetrics);
  return {
    playCount: parseInt(map.playCount || '0', 10),
    likeCount: parseInt(map.likeCount || '0', 10),
    commentCount: parseInt(map.commentCount || '0', 10),
    shareCount: parseInt(map.shareCount || '0', 10),
  };
};

const parseTrendData = (data: AccountDetailResponse): TrendChartDataItem[] =>
  data.last7DayPlayTrend.map((p: TrendPoint) => ({
    date: p.bucket,
    playCount: p.playCount ? parseInt(p.playCount, 10) : null,
  }));

const AccountPage: React.FC = () => {
  const { id: accountId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const shouldShowBannedAlert =
    searchParams.get('alertType') === 'ACCOUNT_BANNED';
  const shouldShowRemoteLoginAlert =
    searchParams.get('from') === 'datacenter' &&
    searchParams.get('tab') === 'security';

  const { data, isLoading, error } = useQuery({
    ...accountDetailQueryOptions(accountId),
    enabled: !!accountId,
  });

  useEffect(() => {
    if (error) {
      const err = error as Error;
      // PRD §1.4.4：账号详情越权 / 已删除均返回 404；前端统一文案"账号不存在或已被删除"
      // 并引导返回数据中心主页。错误码层面前后端不区分两种 404 子类，文案以最低共识为准。
      if (err.message.includes('404')) {
        message.error('账号不存在或已被删除');
        navigate('/datacenter', { replace: true });
      } else {
        message.error(err.message || '加载失败');
      }
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!accountId) {
      navigate('/datacenter', { replace: true });
    }
  }, [accountId, navigate]);

  const handleBack = useCallback(() => {
    navigate('/datacenter');
  }, [navigate]);

  if (!accountId) return null;

  return (
    <div className={styles.container}>
      <PageHeader
        title={data ? `账号详情 - ${data.account.nickname}` : '账号详情'}
        toolbar={<Button onClick={handleBack}>返回数据中心</Button>}
      />

      {shouldShowBannedAlert && (
        <Alert
          message="您的账号已被禁言，请前往对应平台手动解除"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {shouldShowRemoteLoginAlert && (
        <Alert
          message="检测到异地登录，请前往平台修改密码以保障账号安全"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {data && <BasicInfo {...parseBasicInfo(data)} />}

      {data && <TodayMetrics {...parseTodayMetrics(data)} />}

      <TrendChart data={data ? parseTrendData(data) : []} loading={isLoading} />

      <ContentTable accountId={accountId} />
    </div>
  );
};

export default AccountPage;
