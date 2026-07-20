import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import cx from 'classnames';
import { useCallback, useRef } from 'react';
import { PlatformIcon } from '@/components';
import StatusBadge from '../StatusBadge';
import styles from './style.module.css';
import type { Account, Platform, PublishConfigProps } from './types';

const getPlatformLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    douyin: '抖音',
    xiaohongshu: '小红书',
  };
  return labels[platform] || platform;
};

const getAccountNameColor = (
  status: 'online' | 'stopped',
  isSelected: boolean,
): string => {
  if (isSelected) return '#434343';
  return status === 'stopped' ? '#bfbfbf' : '#434343';
};

const getAccountPhoneColor = (
  status: 'online' | 'stopped',
  isSelected: boolean,
): string => {
  if (isSelected) return '#8c8c8c';
  return status === 'stopped' ? '#bfbfbf' : '#8c8c8c';
};

const SCROLL_THRESHOLD = 50;

const PublishConfig = ({
  className,
  selectedPlatform,
  onPlatformChange,
  accounts,
  selectedAccountIds,
  onAccountChange,
  hasMore = false,
  isExpanded = false,
  onToggleExpand,
  isLoadingMore = false,
  onLoadMore,
}: PublishConfigProps) => {
  const isSelected = (accountId: string) =>
    selectedAccountIds.includes(accountId);

  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!listRef.current || !onLoadMore || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight <= SCROLL_THRESHOLD) {
      onLoadMore();
    }
  }, [onLoadMore, isLoadingMore, hasMore]);

  const handleAccountChange = (account: Account, checked: boolean) => {
    if (checked) {
      onAccountChange([...selectedAccountIds, account.id]);
    } else {
      onAccountChange(selectedAccountIds.filter((id) => id !== account.id));
    }
  };

  const isAccountDisabled = (account: Account) => {
    if (selectedAccountIds.includes(account.id)) {
      return false;
    }

    const selectedAccounts = accounts.filter((a) =>
      selectedAccountIds.includes(a.id),
    );
    const selectedPlatforms = selectedAccounts.map((a) => a.platform);

    return selectedPlatforms.includes(account.platform);
  };

  const handlePlatformTagClick = (
    value: PublishConfigProps['selectedPlatform'],
  ) => {
    onPlatformChange(value);
  };

  const getRowClassName = (account: Account) => {
    return cx(styles.accountRow, {
      [styles.accountRowDisabled]: account.status === 'stopped',
      [styles.accountRowSelected]:
        account.status !== 'stopped' && isSelected(account.id),
      [styles.accountRowNormal]:
        account.status !== 'stopped' && !isSelected(account.id),
    });
  };

  const getFilterTagClassName = (
    value: PublishConfigProps['selectedPlatform'],
  ) => {
    return cx(styles.filterTag, {
      [styles.filterTagActive]: selectedPlatform === value,
      [styles.filterTagDefault]: selectedPlatform !== value,
    });
  };

  const platformFilterOptions: Array<{
    value: Platform | 'all';
    label: string;
  }> = [
    { value: 'all', label: '全部' },
    { value: 'douyin', label: '抖音' },
    { value: 'xiaohongshu', label: '小红书' },
  ];

  return (
    <div
      className={cx(styles.container, className)}
      data-testid="publish-config"
    >
      <div className={styles.header}>
        <span className={styles.sectionTitle}>发布配置</span>
      </div>

      <div className={styles.filterSection} data-testid="platform-filter">
        <span className={styles.platformLabel}>选择账号：</span>
        <div className={styles.filterTags}>
          {platformFilterOptions.map((option) => (
            <span
              key={option.value}
              className={getFilterTagClassName(option.value)}
              onClick={() => handlePlatformTagClick(option.value)}
              data-testid={`platform-${option.value}`}
            >
              {option.label}
            </span>
          ))}
        </div>
      </div>

      <span className={styles.limitTip}>同平台仅可选择 1 个账号</span>

      <div
        className={styles.accountList}
        data-testid="account-list"
        ref={listRef}
        onScroll={handleScroll}
      >
        {accounts.map((account) => (
          <div
            key={account.id}
            className={getRowClassName(account)}
            data-testid={`account-item-${account.id}`}
          >
            <div className={styles.accountInfo}>
              <Checkbox
                className={styles.checkbox}
                checked={isSelected(account.id)}
                disabled={
                  account.status === 'stopped' || isAccountDisabled(account)
                }
                onChange={(e: CheckboxChangeEvent) =>
                  handleAccountChange(account, e.target.checked)
                }
                data-testid={`account-checkbox-${account.id}`}
              />
              <div className={styles.accountDetails}>
                <PlatformIcon platform={account.platform} size={22} />
                <span className={styles.platformBadge}>
                  {getPlatformLabel(account.platform)}
                </span>
              </div>
              <div className={styles.accountNamePhone}>
                <span
                  className={styles.accountName}
                  style={{
                    color: getAccountNameColor(
                      account.status,
                      isSelected(account.id),
                    ),
                  }}
                >
                  {account.name}
                </span>
                <span
                  className={styles.accountPhone}
                  style={{
                    color: getAccountPhoneColor(
                      account.status,
                      isSelected(account.id),
                    ),
                  }}
                >
                  {account.phone}
                </span>
              </div>
            </div>
            <StatusBadge status={account.status} />
          </div>
        ))}

        {isLoadingMore && (
          <div className={styles.loadingMore}>
            <LoadingOutlined />
            <span>加载中...</span>
          </div>
        )}

        {hasMore && !isLoadingMore && (
          <div className={styles.moreButton} onClick={onToggleExpand}>
            <span>{isExpanded ? '收起' : '更多'}</span>
            <DownOutlined
              className={styles.moreIcon}
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishConfig;
