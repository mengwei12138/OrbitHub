import {
  ReloadOutlined,
  SearchOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Input, Select, Space } from 'antd';
import { useRef, useState } from 'react';
import type { CustomProTableRef } from '@/components';
import { CustomProTable } from '@/components';
import AiIcon from '../../../../images/ai-icon.svg';
import IconComplaint from '../../../../images/icon-negative.svg';
import IconSpam from '../../../../images/icon-neutral.svg';
import IconCooperation from '../../../../images/icon-positive.svg';
import IconInquiry from '../../../../images/icon-question.svg';
import styles from './style.module.css';
import type { PendingMessage, PendingMessageCardProps } from './types';

const classificationConfig: Record<
  string,
  { bg: string; text: string; Icon: string }
> = {
  cooperation: {
    bg: '#E6FBFB',
    text: '#13C2C2',
    Icon: IconCooperation,
  },
  complaint: {
    bg: '#FFF1F0',
    text: '#FF4D4F',
    Icon: IconComplaint,
  },
  inquiry: {
    bg: '#F6FFED',
    text: '#52C41A',
    Icon: IconInquiry,
  },
  spam: {
    bg: '#F5F5F5',
    text: '#8C8C8C',
    Icon: IconSpam,
  },
};

const AccountIcon = () => <span className={styles.accountIcon} />;

const ClassificationTag = ({
  type,
  label,
}: {
  type: string;
  label: string;
}) => {
  const config = classificationConfig[type] || {
    bg: '#F5F5F5',
    text: '#8C8C8C',
    Icon: IconSpam,
  };
  return (
    <span
      className={styles.classificationTag}
      style={{ background: config.bg, color: config.text }}
    >
      <img src={config.Icon} alt="" className={styles.typeIcon} />
      <span className={styles.typeText}>{label}</span>
    </span>
  );
};

const ImportantMark = () => (
  <span className={styles.importantMark}>
    <StarOutlined />
    重要
  </span>
);

const DEFAULT_ACCOUNT_OPTIONS = [{ label: '全部', value: '' }];

const DEFAULT_CLASSIFICATION_OPTIONS = [
  { label: '全部', value: '' },
  { label: '合作咨询', value: 'cooperation' },
  { label: '投诉建议', value: 'complaint' },
  { label: '产品咨询', value: 'inquiry' },
  { label: '垃圾信息', value: 'spam' },
];

const PendingMessageCard = ({
  queryOptions,
  accountSelectOptions,
  classificationFilterOptions,
  onAutoReply,
  onManualReply,
}: PendingMessageCardProps) => {
  const accountOptions = accountSelectOptions ?? DEFAULT_ACCOUNT_OPTIONS;
  const classificationOptions =
    classificationFilterOptions ?? DEFAULT_CLASSIFICATION_OPTIONS;
  const tableRef = useRef<CustomProTableRef>(null);
  const [account, setAccount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');

  const wrappedQueryOptions = (params: {
    page: number;
    pageSize: number;
    [key: string]: any;
  }) => {
    return queryOptions({
      ...params,
      accountId: params.accountId,
      classification: category || undefined,
      status: status as 'all' | 'unread' | 'read',
      keyword,
    });
  };

  const columns: ProColumns<PendingMessage>[] = [
    {
      title: '账号',
      dataIndex: ['account', 'name'],
      width: 130,
      render: (_, record) => (
        <div className={styles.accountCell}>
          <AccountIcon />
          <span className={styles.accountName}>{record.account.name}</span>
        </div>
      ),
    },
    {
      title: '发送者',
      dataIndex: ['sender', 'name'],
      width: 160,
      render: (_, record) => (
        <div className={styles.senderCell}>
          <span className={styles.senderAvatar} />
          <span className={styles.senderName}>{record.sender.name}</span>
        </div>
      ),
    },
    {
      title: '私信内容',
      dataIndex: 'content',
      width: 540,
      render: (_, record) => (
        <div className={styles.contentCell}>
          <div className={styles.contentCard}>{record.content}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'classification',
      width: 180,
      render: (_, record) => (
        <div className={styles.classificationCell}>
          <ClassificationTag
            type={record.classification.type}
            label={record.classification.label}
          />
          {record.isImportant && <ImportantMark />}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <div className={styles.actionCell}>
          {record.aiSuggestion && (
            <div className={styles.aiSuggestion}>
              <div className={styles.aiBadge}>
                <img src={AiIcon} alt="" className={styles.aiIcon} />
                <span>AI 建议</span>
              </div>
              <span className={styles.aiText}>{record.aiSuggestion}</span>
            </div>
          )}
          <Space size={8} className={styles.buttonGroup}>
            <Button
              type="primary"
              size="small"
              className={styles.btnPrimary}
              onClick={() => onAutoReply?.(record.id)}
            >
              自动回复
            </Button>
            <Button
              size="small"
              className={styles.btnGhost}
              onClick={() => onManualReply?.(record)}
            >
              手动回复
            </Button>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <CustomProTable<PendingMessage>
        ref={tableRef}
        queryOptions={wrappedQueryOptions}
        columns={columns}
        rowKey="id"
        search={false}
        options={false}
        toolbar={{
          search: (
            <div className={styles.filterBar}>
              <div className={styles.filterInputs}>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>账号</span>
                  <Select
                    placeholder="全部"
                    value={account}
                    onChange={setAccount}
                    className={styles.filterSelect}
                    options={accountOptions}
                  />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>分类</span>
                  <Select
                    placeholder="全部"
                    value={category}
                    onChange={setCategory}
                    className={styles.filterSelect}
                    options={classificationOptions}
                  />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>状态</span>
                  <Select
                    placeholder="全部"
                    value={status}
                    onChange={setStatus}
                    className={styles.filterSelect}
                    options={[
                      { label: '全部', value: 'all' },
                      { label: '未读', value: 'unread' },
                      { label: '已读', value: 'read' },
                    ]}
                  />
                </div>
                <div className={styles.filterItem}>
                  <Input
                    placeholder="搜索发送者/内容"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className={styles.filterSearch}
                    prefix={<SearchOutlined />}
                  />
                </div>
              </div>
              <Space size={8} className={styles.filterActions}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setAccount('');
                    setCategory('');
                    setStatus('all');
                    setKeyword('');
                    tableRef.current?.reset();
                  }}
                >
                  重置
                </Button>
                <Button
                  type="primary"
                  onClick={() => tableRef.current?.reload()}
                >
                  查询
                </Button>
              </Space>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default PendingMessageCard;
