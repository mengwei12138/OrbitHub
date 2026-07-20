import {
  CheckOutlined,
  EditOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Input, Select, Space, Tooltip } from 'antd';
import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import type { PaginationParams } from '@/api/types';
import { CustomProTable, PlatformIcon } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import { tagsQueryOptions } from '@/services/ai-assistant';

import { getCategoryStyle, mapTagToRecord } from '../../utils/mapTag';
import styles from './style.module.css';
import type { TabTableProps, TagRecord } from './types';

const PLACEHOLDER = '—';

const TabTable: FC<TabTableProps> = ({
  queryOptions: queryOptionsProp,
  categoryOptions,
  onEdit,
  onDisable,
  onEnable,
}) => {
  const tableRef = useRef<CustomProTableRef>(null);
  const categoryOptionsRef = useRef(categoryOptions);
  categoryOptionsRef.current = categoryOptions;

  const [category, setCategory] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState('');

  const handleReset = () => {
    setCategory(undefined);
    setStatus(undefined);
    setKeyword('');
  };

  const defaultTagQueryOptions = useCallback((params: PaginationParams) => {
    const statusRaw = params.status as string | undefined;
    const apiStatus =
      statusRaw === 'ENABLED'
        ? 'enabled'
        : statusRaw === 'DISABLED'
          ? 'disabled'
          : undefined;
    const kw = (params.keyword as string | undefined)?.trim();
    const base = tagsQueryOptions({
      page: params.page,
      pageSize: params.pageSize,
      category: params.category as string | undefined,
      status: apiStatus,
      keyword: kw || undefined,
    });
    return {
      queryKey: [...base.queryKey],
      queryFn: async () => {
        const data = await base.queryFn();
        return {
          ...data,
          list: data.list.map((tag) =>
            mapTagToRecord(tag, categoryOptionsRef.current),
          ),
        };
      },
    };
  }, []);

  const queryOptions = queryOptionsProp ?? defaultTagQueryOptions;

  const columns: ProColumns<TagRecord>[] = [
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (_, record) => {
        const style = getCategoryStyle(record.categoryCode);
        if (!style) {
          return record.category || PLACEHOLDER;
        }
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 12,
              backgroundColor: style.backgroundColor,
              color: style.textColor,
              fontSize: 13,
            }}
          >
            {record.category}
          </span>
        );
      },
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      width: 200,
      render: (_, record) => (
        <span style={{ color: '#7c51d8' }}>#{record.name}</span>
      ),
    },
    {
      title: '适用平台',
      dataIndex: 'platform',
      width: 120,
      render: (_, record) => {
        const platformLabels: Record<TagRecord['platform'], string> = {
          ALL: '全部平台',
          DOUYIN: '仅抖音',
          XIAOHONGSHU: '仅小红书',
        };
        if (record.platform === 'ALL') {
          return platformLabels[record.platform];
        }
        return (
          <Space size={4} align="center">
            <PlatformIcon
              platform={
                record.platform.toLowerCase() as 'douyin' | 'xiaohongshu'
              }
              size={20}
            />
            <span>{platformLabels[record.platform]}</span>
          </Space>
        );
      },
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 100,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => {
        const isEnabled = record.status === 'ENABLED';
        return (
          <span
            className={styles.statusTag}
            style={{
              backgroundColor: isEnabled ? '#f0ffed' : '#f5f5f5',
              color: isEnabled ? '#52c41a' : '#8c8c8c',
            }}
          >
            <span
              className={styles.statusDot}
              style={{ backgroundColor: isEnabled ? '#52c41a' : '#8c8c8c' }}
            />
            {isEnabled ? '可用' : '停用'}
          </span>
        );
      },
    },
    {
      title: '最近使用',
      dataIndex: 'lastUsedAt',
      width: 180,
      valueType: 'dateTime',
      render: (value: unknown) => (value as string) ?? PLACEHOLDER,
    },
    {
      title: '创建人',
      dataIndex: 'createdByName',
      width: 110,
      render: (_, record) => record.createdByName ?? '系统',
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title={record.editable === false ? '仅创建者可编辑' : ''}>
            <Button
              size="small"
              className={styles.actionBtn}
              disabled={record.editable === false}
              onClick={() => onEdit?.(record)}
            >
              <EditOutlined />
              编辑
            </Button>
          </Tooltip>
          {record.status === 'ENABLED' ? (
            <Tooltip
              title={record.editable === false ? '仅创建者可停用' : ''}
            >
              <Button
                size="small"
                className={styles.actionBtn}
                disabled={record.editable === false}
                onClick={() => onDisable?.(record)}
              >
                <StopOutlined />
                停用
              </Button>
            </Tooltip>
          ) : (
            <Tooltip
              title={record.editable === false ? '仅创建者可启用' : ''}
            >
              <Button
                size="small"
                className={styles.actionBtn}
                type="primary"
                disabled={record.editable === false}
                onClick={() => onEnable?.(record)}
              >
                <CheckOutlined />
                启用
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterBar}>
        <Space size="middle" className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <span className={styles.label}>分类</span>
            <Select
              style={{ width: 120 }}
              allowClear
              placeholder="全部"
              value={category}
              onChange={setCategory}
              options={categoryOptions.map((opt) => ({
                label: opt.name,
                value: opt.code,
              }))}
            />
          </div>
          <div className={styles.filterItem}>
            <span className={styles.label}>状态</span>
            <Select
              style={{ width: 100 }}
              allowClear
              placeholder="全部"
              value={status}
              onChange={setStatus}
              options={[
                { label: '启用', value: 'ENABLED' },
                { label: '停用', value: 'DISABLED' },
              ]}
            />
          </div>
          <div className={styles.filterItem}>
            <Input
              placeholder="搜索标签名称或分类"
              style={{ width: 200 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            />
          </div>
        </Space>
        <Space size={4}>
          <Button onClick={handleReset}>重置</Button>
          <Button
            type="primary"
            onClick={() => {
              tableRef.current?.reload();
            }}
          >
            查询
          </Button>
        </Space>
      </div>
      <CustomProTable<TagRecord>
        ref={tableRef}
        headerTitle={<span className={styles.title}>标签列表</span>}
        params={{
          category,
          status,
          keyword,
        }}
        queryOptions={queryOptions}
        columns={columns}
        search={false}
        rowKey="id"
      />
    </div>
  );
};

export default TabTable;
