import { Checkbox, Skeleton } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type React from 'react';
import { PLATFORM_CONFIG, PlatformIcon } from '@/components';
import { PLACEHOLDER } from '@/constants';
import type { AccountResponse } from '@/services/account/types';

import StatusBadge from '../StatusBadge';
import styles from './style.module.css';

type TargetAccountCardProps = {
  selectedAccounts: AccountResponse[];
  onSelectAccounts: (accounts: AccountResponse[]) => void;
  onSelectOther: () => void;
  loading?: boolean;
};

const TargetAccountCard: React.FC<TargetAccountCardProps> = ({
  selectedAccounts,
  onSelectAccounts,
  onSelectOther,
  loading,
}) => {
  const selectedAccount = selectedAccounts[0];

  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked && selectedAccount) {
      onSelectAccounts([selectedAccount]);
    } else if (!e.target.checked) {
      onSelectAccounts([]);
    }
  };

  const platformLabel =
    selectedAccount &&
    PLATFORM_CONFIG[selectedAccount.platform as keyof typeof PLATFORM_CONFIG]
      ?.label;

  const accountStatus = selectedAccount?.status ?? 'ONLINE';

  return (
    <div className={styles.card}>
      <div className={styles.title}>重发配置</div>

      <div className={styles.targetLabel}>目标账号：</div>

      <div className={styles.accountRowWrapper}>
        {loading ? (
          <Skeleton.Input active size="small" />
        ) : (
          <div className={styles.accountRow}>
            <div className={styles.accountInfo}>
              <Checkbox
                checked={!!selectedAccount}
                onChange={handleCheckboxChange}
                disabled={loading}
              />
              <div className={styles.accountDetails}>
                <PlatformIcon
                  platform={selectedAccount?.platform ?? PLACEHOLDER}
                  size={22}
                />
                <span className={styles.platformBadge}>{platformLabel}</span>
              </div>
              <div className={styles.accountNamePhone}>
                <span className={styles.accountName}>
                  {selectedAccount?.nickname ?? '账号名称'}
                </span>
                <span className={styles.accountPhone}>
                  {selectedAccount?.phoneNumber
                    ? selectedAccount.phoneNumber.replace(
                        /(?<first>\d{3})\d{4}(?<last>\d{4})/u,
                        '$<first>****$<last>',
                      )
                    : '手机号'}
                </span>
              </div>
            </div>
            <StatusBadge status={accountStatus} />
          </div>
        )}
        {!loading && (
          <span className={styles.selectOther} onClick={onSelectOther}>
            + 选择其他账号
          </span>
        )}
      </div>

      <div className={styles.tip}>同一平台仅可选择一个账号</div>
    </div>
  );
};

export default TargetAccountCard;
