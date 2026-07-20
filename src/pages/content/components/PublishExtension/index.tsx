import {
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import { PlatformIcon } from '@/components';
import {
  EXTENSION_TYPE_LABEL,
  getExtensionCandidates,
} from './mockData';
import styles from './style.module.css';
import type {
  PublishExtensionCandidate,
  PublishExtensionInfo,
  PublishExtensionProps,
  PublishExtensionSecondaryMode,
  PublishExtensionTertiaryMode,
  PublishExtensionType,
} from './types';

const PRE_MOUNT_TTL_MS = 10 * 60 * 1000;
const PRE_MOUNT_DELAY_MS = 500;

const SECONDARY_MODE_OPTIONS: Record<
  PublishExtensionType,
  { label: string; value: PublishExtensionSecondaryMode }[]
> = {
  location: [
    { label: '带货模式', value: 'sales' },
    { label: '打卡模式', value: 'checkin' },
  ],
  deal: [
    { label: '本地', value: 'local' },
    { label: '全国', value: 'national' },
  ],
};

const getDefaultSecondaryMode = (
  type?: PublishExtensionType,
): PublishExtensionSecondaryMode | undefined => {
  if (type === 'deal') return 'local';
  return undefined;
};

const getDefaultLocationMode = (hasSalesModeTag: boolean) =>
  hasSalesModeTag ? 'sales' : undefined;

const TERTIARY_MODE_OPTIONS: { label: string; value: PublishExtensionTertiaryMode }[] = [
  { label: '本地', value: 'local' },
  { label: '全国', value: 'national' },
];

const REVIEW_TAG_OPTIONS = ['团购', '带货模式'];

const getRandomReviewTags = () => {
  const tags = REVIEW_TAG_OPTIONS.filter(() => Math.random() > 0.5);
  if (tags.length > 0) return tags;
  return [REVIEW_TAG_OPTIONS[Math.floor(Math.random() * REVIEW_TAG_OPTIONS.length)]];
};

const buildPreMountInfo = (
  accountId: string,
  accountName: string,
  type: PublishExtensionType,
  secondaryMode: PublishExtensionSecondaryMode | undefined,
  tertiaryMode: PublishExtensionTertiaryMode | undefined,
  candidate: PublishExtensionCandidate,
): PublishExtensionInfo => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PRE_MOUNT_TTL_MS);
  return {
    accountId,
    accountName,
    type,
    secondaryMode,
    tertiaryMode,
    targetId: candidate.id,
    targetName: candidate.name,
    targetDescription: candidate.description,
    sourceLabel: candidate.sourceLabel,
    preMountId: `pm-${Date.now()}`,
    preMountedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'success',
  };
};

const isExpired = (value: PublishExtensionInfo | null) =>
  !!value && Date.now() > new Date(value.expiresAt).getTime();

const getSavedCandidate = (
  savedValue: PublishExtensionInfo,
): PublishExtensionCandidate => {
  const matchedCandidate = getExtensionCandidates(savedValue.type, '').find(
    (candidate) => candidate.id === savedValue.targetId,
  );
  if (matchedCandidate) return matchedCandidate;

  return {
    id: savedValue.targetId,
    type: savedValue.type,
    name: savedValue.targetName,
    description: savedValue.targetDescription,
    sourceLabel: savedValue.sourceLabel,
    meta: '上次保存的挂载对象',
  };
};

const PublishExtension = ({
  accounts,
  selectedAccountIds,
  hasMaterial,
  value,
  onChange,
  onReset,
}: PublishExtensionProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PublishExtensionType | undefined>(
    value?.type,
  );
  const [secondaryMode, setSecondaryMode] = useState<
    PublishExtensionSecondaryMode | undefined
  >(value?.secondaryMode ?? getDefaultSecondaryMode(value?.type));
  const [tertiaryMode, setTertiaryMode] = useState<
    PublishExtensionTertiaryMode | undefined
  >(value?.tertiaryMode ?? 'local');
  const [keyword, setKeyword] = useState('');
  const [selectedCandidate, setSelectedCandidate] =
    useState<PublishExtensionCandidate | null>(null);
  const [preMounting, setPreMounting] = useState(false);
  const [preMountValue, setPreMountValue] =
    useState<PublishExtensionInfo | null>(null);
  const [preMountError, setPreMountError] = useState('');
  const [visibleReviewTags, setVisibleReviewTags] =
    useState<string[]>(REVIEW_TAG_OPTIONS);

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => selectedAccountIds.includes(account.id)),
    [accounts, selectedAccountIds],
  );

  const douyinAccount = selectedAccounts.find(
    (account) => account.platform === 'douyin',
  );
  const xiaohongshuAccount = selectedAccounts.find(
    (account) => account.platform === 'xiaohongshu',
  );

  const canConfigure = !!douyinAccount && hasMaterial;
  const valueExpired = isExpired(value);
  const hasDealTag = visibleReviewTags.includes('团购');
  const hasSalesModeTag = visibleReviewTags.includes('带货模式');
  const availableExtensionTypes = useMemo<PublishExtensionType[]>(
    () => (hasDealTag ? ['location', 'deal'] : ['location']),
    [hasDealTag],
  );
  const crawledTagOptions = useMemo(
    () =>
      availableExtensionTypes.map((tag) => ({
        label: EXTENSION_TYPE_LABEL[tag],
        value: tag,
      })),
    [availableExtensionTypes],
  );
  const candidates = useMemo(() => {
    if (!type) return [];
    return getExtensionCandidates(type, keyword);
  }, [type, keyword]);

  const resetModalState = () => {
    const savedType =
      value?.type && availableExtensionTypes.includes(value.type)
        ? value.type
        : undefined;
    const nextLocationMode =
      savedType === 'location'
        ? hasSalesModeTag
          ? value?.secondaryMode ?? getDefaultLocationMode(hasSalesModeTag)
          : undefined
        : value?.secondaryMode ?? getDefaultSecondaryMode(savedType);

    setType(savedType);
    setSecondaryMode(nextLocationMode);
    setTertiaryMode(value?.tertiaryMode ?? 'local');
    setKeyword('');
    setPreMounting(false);

    if (!value || !savedType) {
      setSecondaryMode(undefined);
      setTertiaryMode('local');
      setSelectedCandidate(null);
      setPreMountValue(null);
      setPreMountError(
        value && !savedType
          ? '当前账号未返回该标签，请重新选择可用标签'
          : '',
      );
      return;
    }

    setSelectedCandidate(getSavedCandidate(value));

    if (isExpired(value) || value.status === 'expired') {
      setPreMountValue(null);
      setPreMountError('上次预挂载结果已过期，请重新选择挂载对象自动预挂载');
      return;
    }

    if (value.status === 'failed') {
      setPreMountValue(null);
      setPreMountError(value.failureReason ?? '上次预挂载失败，请重新选择挂载对象');
      return;
    }

    setPreMountValue(value);
    setPreMountError('');
  };

  const handleOpen = () => {
    if (!douyinAccount) {
      message.warning('请先选择抖音账号');
      return;
    }
    if (!hasMaterial) {
      message.warning('请先上传素材');
      return;
    }
    resetModalState();
    setOpen(true);
  };

  const handleTypeChange = (nextType?: PublishExtensionType) => {
    setType(nextType);
    setSecondaryMode(
      nextType === 'location'
        ? getDefaultLocationMode(hasSalesModeTag)
        : getDefaultSecondaryMode(nextType),
    );
    setTertiaryMode('local');
    setKeyword('');
    setSelectedCandidate(null);
    setPreMountValue(null);
    setPreMountError('');
  };

  const handleSecondaryModeChange = (
    nextMode: PublishExtensionSecondaryMode,
  ) => {
    setSecondaryMode(nextMode);
    setTertiaryMode('local');
    setSelectedCandidate(null);
    setPreMountValue(null);
    setPreMountError('');
  };

  const handleTertiaryModeChange = (
    nextMode: PublishExtensionTertiaryMode,
  ) => {
    setTertiaryMode(nextMode);
    setSelectedCandidate(null);
    setPreMountValue(null);
    setPreMountError('');
  };

  const handleCandidateSelect = async (
    candidate: PublishExtensionCandidate,
  ) => {
    setSelectedCandidate(candidate);
    const resolvedSecondaryMode =
      type === 'location'
        ? secondaryMode ?? getDefaultLocationMode(hasSalesModeTag)
        : secondaryMode ?? getDefaultSecondaryMode(type);
    if (!douyinAccount || !type) return;
    setPreMounting(true);
    setPreMountValue(null);
    setPreMountError('');
    await new Promise((resolve) => {
      window.setTimeout(resolve, PRE_MOUNT_DELAY_MS);
    });
    setPreMounting(false);

    if (candidate.shouldFail) {
      setPreMountError('挂载对象不可用或已下架，请重新选择');
      return;
    }

    setPreMountValue(
      buildPreMountInfo(
        douyinAccount.id,
        douyinAccount.name,
        type,
        resolvedSecondaryMode,
        type === 'location' ? tertiaryMode ?? 'local' : undefined,
        candidate,
      ),
    );
  };

  const handleConfirm = () => {
    if (!preMountValue) return;
    onChange(preMountValue);
    setOpen(false);
    message.success('商品信息已保存，发布时将尝试挂载');
  };

  const handleReviewTagsRefresh = () => {
    setVisibleReviewTags(getRandomReviewTags());
    message.success('标签已刷新');
  };

  const renderSummary = () => {
    if (!douyinAccount) {
      return (
        <div className={styles.disabledBox}>
          选择在线抖音账号后，可配置位置或团购商品信息。
        </div>
      );
    }
    if (!value) {
      if (!hasMaterial) {
        return (
          <div className={styles.disabledBox}>
            上传视频或图片素材后，可配置抖音商品信息。
          </div>
        );
      }
      return (
        <div className={styles.emptyState}>
          <span>未配置商品信息，发布时按普通抖音内容提交。</span>
          <Button size="small" type="primary" onClick={handleOpen}>
            配置商品信息
          </Button>
        </div>
      );
    }
    return (
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div className={styles.summaryContent}>
            <div className={styles.summaryMain}>
              <Tag color={value.type === 'location' ? 'blue' : 'gold'}>
                {EXTENSION_TYPE_LABEL[value.type]}
              </Tag>
              <span className={styles.summaryTitle}>{value.targetName}</span>
            </div>
            <div className={styles.summaryMeta}>
              {value.sourceLabel}｜预挂载
              {valueExpired ? '已过期' : '成功'}
            </div>
          </div>
          <Space size={8} className={styles.summaryActions}>
            <Button size="small" onClick={handleOpen}>
              编辑
            </Button>
            <Button size="small" onClick={onReset}>
              重置
            </Button>
          </Space>
        </div>
        {valueExpired && (
          <Alert
            type="warning"
            showIcon
            message="预挂载结果已过期，需重新配置后才能发布抖音商品信息。"
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.container} data-testid="publish-extension">
      <div className={styles.header}>
        <span className={styles.title}>商品信息</span>
      </div>

      <div className={styles.accountLine}>
        <PlatformIcon platform="douyin" size={18} />
        <span className={styles.accountText}>
          {douyinAccount ? douyinAccount.name : '未选择抖音账号'}
        </span>
        {douyinAccount && (
          <div className={styles.extensionTagRow}>
            {visibleReviewTags.map((tag) => (
              <span key={tag} className={styles.extensionTag}>
                {tag}
              </span>
            ))}
            <button
              type="button"
              className={styles.tagRefreshButton}
              aria-label="刷新标签"
              title="刷新标签"
              onClick={handleReviewTagsRefresh}
            >
              <ReloadOutlined />
            </button>
          </div>
        )}
      </div>
      {renderSummary()}

      {xiaohongshuAccount && (
        <div className={styles.unsupportedLine}>
          <PlatformIcon platform="xiaohongshu" size={18} />
          <span>小红书本期暂不支持商品信息，发布时按普通图文/视频提交。</span>
        </div>
      )}

      <Modal
        open={open}
        title="配置商品信息"
        width={720}
        className={styles.extensionModal}
        onCancel={() => setOpen(false)}
        onOk={handleConfirm}
        okText="确认保存"
        cancelText="取消"
        okButtonProps={{ disabled: !preMountValue }}
      >
        <div className={styles.modalBody}>
          <Alert
            type="info"
            showIcon
            message={`当前抖音账号：${douyinAccount?.name ?? '-'}`}
            description="选中挂载对象后系统会自动预挂载，成功后才能保存商品信息。"
          />

          <div className={styles.fieldBlock}>
            <div className={styles.fieldLabel}>添加标签</div>
            <div className={styles.selectRow}>
              <Select<PublishExtensionType>
                allowClear
                placeholder="请选择爬虫返回的标签"
                className={styles.tagSelect}
                value={type}
                options={crawledTagOptions}
                onChange={(nextType) => handleTypeChange(nextType)}
              />
              {type === 'deal' && (
                <Select<PublishExtensionSecondaryMode>
                  className={styles.secondarySelect}
                  value={secondaryMode ?? getDefaultSecondaryMode(type)}
                  options={SECONDARY_MODE_OPTIONS[type]}
                  onChange={handleSecondaryModeChange}
                />
              )}
              {type === 'location' && hasSalesModeTag && (
                <Select<PublishExtensionSecondaryMode>
                  className={styles.secondarySelect}
                  value={secondaryMode ?? getDefaultLocationMode(hasSalesModeTag)}
                  options={SECONDARY_MODE_OPTIONS.location}
                  onChange={handleSecondaryModeChange}
                />
              )}
              {type === 'location' && (
                <Select<PublishExtensionTertiaryMode>
                  className={styles.tertiarySelect}
                  value={tertiaryMode ?? 'local'}
                  options={TERTIARY_MODE_OPTIONS}
                  onChange={handleTertiaryModeChange}
                />
              )}
            </div>
          </div>

          <div className={styles.searchRow}>
            <Input.Search
              allowClear
              placeholder="输入门店、地址、团购名称搜索"
              value={keyword}
              disabled={!type}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSelectedCandidate(null);
                setPreMountValue(null);
                setPreMountError('');
              }}
              onSearch={(valueText) => {
                setKeyword(valueText);
              }}
            />
            <Button
              icon={<ReloadOutlined />}
              disabled={!type}
              onClick={() => {
                setKeyword('');
                setSelectedCandidate(null);
                setPreMountValue(null);
                setPreMountError('');
                message.success('候选列表已刷新');
              }}
            >
              刷新
            </Button>
          </div>

          <div className={styles.candidatePanel}>
            <div className={styles.candidateList}>
              {!type ? (
                <Empty description="请先添加标签" />
              ) : candidates.length === 0 ? (
                <Empty description="未找到匹配的挂载对象" />
              ) : (
                candidates.map((candidate) => {
                  const active = selectedCandidate?.id === candidate.id;
                  return (
                    <button
                      type="button"
                      key={candidate.id}
                      className={`${styles.candidateItem} ${
                        active ? styles.candidateItemActive : ''
                      }`}
                      onClick={() => void handleCandidateSelect(candidate)}
                    >
                      <div className={styles.candidateMain}>
                        <span className={styles.candidateName}>
                          {candidate.name}
                        </span>
                        <Tag>{candidate.sourceLabel}</Tag>
                      </div>
                      <div className={styles.candidateDesc}>
                        {candidate.description}
                      </div>
                      <div className={styles.candidateMeta}>
                        {candidate.meta}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.preMountRow}>
            {!selectedCandidate && (
              <span className={styles.preMountHint}>
                选中挂载对象后自动预挂载
              </span>
            )}
            {preMounting && (
              <span className={styles.preMountLoading}>
                正在自动预挂载...
              </span>
            )}
            {preMountValue && (
              <span className={styles.preMountSuccess}>
                <CheckCircleOutlined /> 预挂载成功
              </span>
            )}
            {preMountError && (
              <span className={styles.preMountError}>{preMountError}</span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PublishExtension;

export type { PublishExtensionInfo };
