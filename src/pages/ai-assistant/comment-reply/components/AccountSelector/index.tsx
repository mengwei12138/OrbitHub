import type { ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import type { FC, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PaginationParams } from '@/api/types';
import { CustomProTable } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import { PLACEHOLDER } from '@/constants';
import type { AccountSnapshot } from '@/services/ai-assistant/types';
import SearchIcon from '../../images/search-icon.svg';
import { platformLabel } from '../../utils/mapRecords';
import styles from './style.module.css';

type Props = {
  queryOptions: (params: PaginationParams) => {
    queryKey: unknown[];
    queryFn: () => Promise<{
      list: AccountSnapshot[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  footer?: ReactNode;
};

const AccountSelector: FC<Props> = ({
  queryOptions,
  selectedIds = [],
  onSelectionChange,
  footer,
}) => {
  const [keyword, setKeyword] = useState('');
  const [platformFilter, setPlatformFilter] = useState<
    'all' | 'douyin' | 'xiaohongshu'
  >('all');
  const tableRef = useRef<CustomProTableRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 需要在 platformFilter 变化时触发刷新
  useEffect(() => {
    tableRef.current?.reload();
  }, [platformFilter]);

  const onlineFilteredQueryOptions = useMemo(
    () => (params: PaginationParams) => {
      const baseOptions = queryOptions({
        page: params.page,
        pageSize: params.pageSize,
        keyword: keyword || undefined,
        platform: platformFilter === 'all' ? undefined : platformFilter,
        status: 'online',
      });
      return {
        ...baseOptions,
        queryFn: async () => {
          const res = await baseOptions.queryFn();
          return {
            ...res,
            list: res.list.filter((a: AccountSnapshot) => a.isOnline),
          };
        },
      };
    },
    [queryOptions, keyword, platformFilter],
  );

  const columns: ProColumns<AccountSnapshot>[] = [
    {
      title: '账号',
      dataIndex: 'nickname',
      render: (_, record) => (
        <div className={styles.accountCell}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>
              {(record.nickname ?? record.phoneNumber)?.charAt(0) ??
                PLACEHOLDER}
            </span>
          </div>
          <div className={styles.accountInfo}>
            <span className={styles.accountName}>
              {record.nickname ?? record.phoneNumber}
            </span>
            <span className={styles.accountPlatform}>
              （{platformLabel(record.platform)}）
            </span>
          </div>
          <span
            className={
              record.isOnline ? styles.statusTagOnline : styles.statusTagOffline
            }
          >
            {record.isOnline ? '在线' : '离线'}
          </span>
        </div>
      ),
    },
    {
      title: '最近抓取',
      dataIndex: 'lastFetchCount',
      render: () => (
        <span className={styles.fetchInfo}>最近抓取：—（待抓取接口字段）</span>
      ),
    },
  ];

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.title}>账号选择</span>
          <span className={styles.subTitle}>（当前仅展示在线账号）</span>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <img src={SearchIcon} alt="" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="搜索账号..."
              className={styles.searchInput}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className={styles.platformTags}>
            <Tag
              className={`${styles.tag} ${platformFilter === 'all' ? styles.tagActive : ''}`}
              onClick={() => {
                setPlatformFilter('all');
              }}
            >
              全部
            </Tag>
            <Tag
              className={`${styles.tag} ${platformFilter === 'douyin' ? styles.tagActive : ''}`}
              onClick={() => {
                setPlatformFilter('douyin');
              }}
            >
              抖音
            </Tag>
            <Tag
              className={`${styles.tag} ${platformFilter === 'xiaohongshu' ? styles.tagActive : ''}`}
              onClick={() => {
                setPlatformFilter('xiaohongshu');
              }}
            >
              小红书
            </Tag>
          </div>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <CustomProTable<AccountSnapshot>
          ref={tableRef}
          queryOptions={onlineFilteredQueryOptions}
          columns={columns}
          rowKey="accountId"
          rowSelection={{
            selectedRowKeys: selectedIds,
            onChange: (keys) => onSelectionChange?.(keys as string[]),
          }}
          footer={footer ? () => footer : undefined}
          options={false}
          search={false}
          pagination={{
            onChange: () => {
              wrapperRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            },
          }}
        />
      </div>
    </div>
  );
};

export default AccountSelector;
