import type { FC } from 'react';

import styles from './style.module.css';

export type Platform = 'douyin' | 'xiaohongshu';

export type Account = {
  id: string;
  name: string;
  platform: Platform;
  avatar?: string;
};

type Props = {
  title?: string;
  accounts?: Account[];
  selectedIds?: string[];
  platformFilter?: Platform[];
  onChange?: (selectedIds: string[]) => void;
};

const PLATFORM_LABELS: Record<Platform, string> = {
  douyin: '抖音',
  xiaohongshu: '小红书',
};

const AccountSelector: FC<Props> = ({
  title = '账号选择',
  accounts = [],
  selectedIds = [],
  platformFilter = ['douyin', 'xiaohongshu'],
  onChange = () => {},
}) => {
  const handlePlatformClick = (platform: Platform | 'all') => {
    if (platform === 'all') {
      if (isAllSelected()) {
        onChange([]);
      } else {
        onChange(accounts.map((a) => a.id));
      }
    } else {
      const filteredAccounts = accounts.filter((a) => a.platform === platform);
      const filteredIds = filteredAccounts.map((a) => a.id);
      const allFilteredSelected = filteredIds.every((id) =>
        selectedIds.includes(id),
      );
      if (allFilteredSelected) {
        onChange(selectedIds.filter((id) => !filteredIds.includes(id)));
      } else {
        onChange([...new Set([...selectedIds, ...filteredIds])]);
      }
    }
  };

  const handleAccountClick = (accountId: string) => {
    if (selectedIds.includes(accountId)) {
      onChange(selectedIds.filter((id) => id !== accountId));
    } else {
      onChange([...selectedIds, accountId]);
    }
  };

  const isAllSelected = () => {
    return platformFilter.every((p) => {
      const platformAccounts = accounts.filter((a) => a.platform === p);
      return platformAccounts.every((a) => selectedIds.includes(a.id));
    });
  };

  const isPlatformSelected = (platform: Platform) => {
    const platformAccounts = accounts.filter((a) => a.platform === platform);
    return platformAccounts.some((a) => selectedIds.includes(a.id));
  };

  const getPlatformPillClass = (platform: Platform | 'all') => {
    if (platform === 'all') {
      return isAllSelected() ? styles.pillActive : styles.pill;
    }
    return isPlatformSelected(platform) ? styles.pillActive : styles.pill;
  };

  const getAccountChipClass = (accountId: string) => {
    return selectedIds.includes(accountId) ? styles.chipSelected : styles.chip;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.pills}>
          <button
            type="button"
            className={getPlatformPillClass('all')}
            onClick={() => handlePlatformClick('all')}
          >
            全部
          </button>
          {platformFilter.map((platform) => (
            <button
              type="button"
              key={platform}
              className={getPlatformPillClass(platform)}
              onClick={() => handlePlatformClick(platform)}
            >
              {PLATFORM_LABELS[platform]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chips}>
        {accounts.map((account) => (
          <button
            type="button"
            key={account.id}
            className={getAccountChipClass(account.id)}
            onClick={() => handleAccountClick(account.id)}
          >
            <span className={styles.checkbox}>
              {selectedIds.includes(account.id) && (
                <span className={styles.checkmark}>✓</span>
              )}
            </span>
            <span className={styles.platformIcon}>
              {account.platform === 'douyin' ? '抖' : '红'}
            </span>
            <span className={styles.accountName}>{account.name}</span>
            <span className={styles.platformTag}>
              （{PLATFORM_LABELS[account.platform]}）
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccountSelector;
