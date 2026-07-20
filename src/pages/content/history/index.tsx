import type { ProColumns } from '@ant-design/pro-components';
import { Button, Image, Space, Tag, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomProTable, PageHeader, PlatformIcon } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import { PLATFORM_CONFIG } from '@/components/PlatformIcon';
import { PLACEHOLDER } from '@/constants';
import { historyRecordsQueryOptions } from '@/services/content';
import type {
  ContentModeCode,
  PublishExtensionFinalStatusCode,
  PlatformCode,
  PublishRecordListItem,
  PublishStatusCode,
} from '@/services/content/types';
import { PUBLISH_STATUS_CODE } from '@/services/content/types';
import { useUserStore } from '@/store/modules/userStore';
import { formatDateEnd, formatDateStart } from '@/utils';

import HistoryStatusBadge from './components/StatusBadge';
import styles from './style.module.css';
import { buildTitleCell } from './utils/titleCell';

type QueryParams = {
  page?: number;
  pageSize?: number;
  dateRange?: [Dayjs, Dayjs];
  platform?: PlatformCode;
  status?: PublishStatusCode;
  extensionStatus?: PublishExtensionFinalStatusCode;
};

const CONTENT_MODE_LABEL: Record<ContentModeCode, string> = {
  VIDEO: '视频',
  IMAGE: '图文',
};

const PLATFORM_VALUE_ENUM: Record<string, { text: string }> = {
  douyin: { text: '抖音' },
  xiaohongshu: { text: '小红书' },
};

const STATUS_VALUE_ENUM: Record<string, { text: string }> = {
  [PUBLISH_STATUS_CODE.UNDER_REVIEW]: { text: '审核中' },
  [PUBLISH_STATUS_CODE.PUBLISH_SUCCESS]: { text: '发布成功' },
  [PUBLISH_STATUS_CODE.PUBLISH_FAILED]: { text: '发布失败' },
};

const EXTENSION_STATUS_VALUE_ENUM: Record<string, { text: string }> = {
  NONE: { text: '无商品信息' },
  MOUNTED: { text: '已挂载' },
  MOUNT_FAILED: { text: '挂载失败' },
};

const EXTENSION_TYPE_LABEL = {
  location: '位置',
  deal: '团购',
} as const;

const EXTENSION_STATUS_LABEL = {
  NONE: '无商品信息',
  MOUNTED: '已挂载',
  MOUNT_FAILED: '挂载失败',
} as const;

const EXTENSION_STATUS_COLOR = {
  NONE: 'default',
  MOUNTED: 'green',
  MOUNT_FAILED: 'red',
} as const;

const History: React.FC = () => {
  const navigate = useNavigate();
  const tableRef = useRef<CustomProTableRef>(null);
  // PRD §1.4.5：TENANT_ADMIN 视角下列表标注创建人（"发布人：xxx"）；NORMAL_ADMIN 视角下所有 record 都是本人，无需展示该列
  // 注：重发按钮不做客户端 scope 网关——TENANT_ADMIN 按 PRD §1.4.4-2 可重发任意记录，权限在后端兜底
  const roles = useUserStore((s) => s.roles);
  const isTenantAdmin = roles.includes('TENANT_ADMIN');

  const columns = useMemo(
    (): ProColumns<PublishRecordListItem>[] => [
      {
        title: '时间范围',
        dataIndex: 'dateRange',
        valueType: 'dateRange',
        hideInTable: true,
      },
      {
        title: '平台',
        dataIndex: 'platform',
        valueType: 'select',
        valueEnum: PLATFORM_VALUE_ENUM,
        hideInTable: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: STATUS_VALUE_ENUM,
        hideInTable: true,
      },
      {
        title: '商品信息',
        dataIndex: 'extensionStatus',
        valueType: 'select',
        valueEnum: EXTENSION_STATUS_VALUE_ENUM,
        hideInTable: true,
      },
      {
        title: '封面',
        dataIndex: 'coverUrl',
        hideInSearch: true,
        width: 80,
        render: (_, record) =>
          record.coverUrl ? (
            <Image
              src={record.coverUrl}
              width={64}
              height={48}
              className={styles.coverImage}
              preview={false}
            />
          ) : (
            <div className={styles.coverPlaceholder}>无封面</div>
          ),
      },
      {
        title: '标题/文案',
        dataIndex: 'title',
        hideInSearch: true,
        width: 280,
        render: (_, record) => {
          const cell = buildTitleCell(record);
          if (!cell) {
            return <div className={styles.titleText}>{PLACEHOLDER}</div>;
          }
          return (
            <Tooltip title={cell.fullText} placement="topLeft">
              <div className={styles.titleText}>{cell.display}</div>
            </Tooltip>
          );
        },
      },
      {
        title: '发布账号',
        dataIndex: 'accountNickname',
        hideInSearch: true,
        width: 150,
      },
      ...(isTenantAdmin
        ? ([
            {
              title: '发布人',
              dataIndex: 'ownerName',
              hideInSearch: true,
              width: 120,
              render: (_, record) => record.ownerName ?? PLACEHOLDER,
            },
          ] as ProColumns<PublishRecordListItem>[])
        : []),
      {
        title: '平台',
        dataIndex: 'platform',
        hideInSearch: true,
        width: 100,
        render: (_, record) => (
          <Space size={4}>
            <PlatformIcon platform={record.platform} size={22} />
            <span>
              {PLATFORM_CONFIG[record.platform as keyof typeof PLATFORM_CONFIG]
                ?.label ?? record.platform}
            </span>
          </Space>
        ),
      },
      {
        title: '类型',
        dataIndex: 'contentMode',
        hideInSearch: true,
        width: 70,
        render: (_, record) => (
          <Tag color={record.contentMode === 'VIDEO' ? 'blue' : 'green'}>
            {CONTENT_MODE_LABEL[record.contentMode] ?? record.contentMode}
          </Tag>
        ),
      },
      {
        title: '发布时间',
        dataIndex: 'publishedAt',
        hideInSearch: true,
        width: 120,
        valueType: 'dateTime',
      },
      {
        title: '状态',
        dataIndex: 'status',
        hideInSearch: true,
        width: 100,
        render: (_, record) => <HistoryStatusBadge status={record.status} />,
      },
      {
        title: '商品信息',
        dataIndex: 'extensionInfo',
        hideInSearch: true,
        width: 140,
        render: (_, record) => {
          const extension = record.extensionInfo;
          if (!extension || extension.finalStatus === 'NONE') {
            return <Tag>无商品信息</Tag>;
          }
          const label = extension.type
            ? EXTENSION_TYPE_LABEL[extension.type]
            : '商品';
          return (
            <Tooltip
              title={
                extension.failureReason ??
                extension.targetName ??
                EXTENSION_STATUS_LABEL[extension.finalStatus]
              }
            >
              <Tag color={EXTENSION_STATUS_COLOR[extension.finalStatus]}>
                {label}｜{EXTENSION_STATUS_LABEL[extension.finalStatus]}
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: '操作',
        key: 'actions',
        hideInSearch: true,
        width: 120,
        render: (_, record) => (
          <Space size={12}>
            <Button
              type="link"
              size="small"
              onClick={() =>
                navigate(
                  `/content/detail?recordId=${record.recordId}&from=/content/history`,
                )
              }
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() =>
                navigate(
                  `/content/republish?recordId=${record.recordId}&from=/content/history`,
                )
              }
            >
              重发
            </Button>
          </Space>
        ),
      },
    ],
    [navigate, isTenantAdmin],
  );

  return (
    <div className={styles.container}>
      <PageHeader title="历史发布记录" />

      <CustomProTable<PublishRecordListItem>
        ref={tableRef}
        queryOptions={(params) => {
          const typedParams = params as QueryParams;
          const queryParams = {
            page: typedParams.page,
            pageSize: typedParams.pageSize,
            startAt: typedParams.dateRange?.[0]
              ? formatDateStart(typedParams.dateRange[0])
              : undefined,
            endAt: typedParams.dateRange?.[1]
              ? formatDateEnd(typedParams.dateRange[1])
              : undefined,
            platform: typedParams.platform,
            status: typedParams.status,
            extensionStatus: typedParams.extensionStatus,
          };
          return historyRecordsQueryOptions(queryParams);
        }}
        columns={columns}
        rowKey="recordId"
      />
    </div>
  );
};

export default History;
