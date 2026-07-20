import { useCallback, useEffect, useRef, useState } from 'react';
import { PLATFORM_CONFIG, PlatformIcon } from '@/components';
import { useAccountList } from '@/services/account';
import type { AccountResponse } from '@/services/account/types';

import StatusBadge from '../StatusBadge';
import styles from './style.module.css';

type AccountSelectorModalProps = {
  open: boolean;
  selectedId?: string;
  onConfirm: (account: AccountResponse) => void;
};

const PAGE_SIZE = 20;

const AccountSelectorModal: React.FC<AccountSelectorModalProps> = ({
  open,
  selectedId,
  onConfirm,
}) => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useAccountList({
    page,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (open) {
      setAccounts([]);
      setPage(1);
      setHasMore(true);
    }
  }, [open]);

  useEffect(() => {
    if (data?.list) {
      if (page === 1) {
        setAccounts(data.list);
      } else {
        setAccounts((prev) => [...prev, ...data.list]);
      }
      setHasMore(data.hasNext);
    }
  }, [data, page]);

  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching]);

  const handleScroll = useCallback(() => {
    if (!listRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setPage((p) => p + 1);
    }
  }, [loading, hasMore]);

  const handleSelect = useCallback(
    (account: AccountResponse) => {
      onConfirm(account);
    },
    [onConfirm],
  );

  return (
    <div
      className={styles.accountSelectorList}
      ref={listRef}
      onScroll={handleScroll}
    >
      {accounts.map((account) => {
        const isDisabled = account.status !== 'ONLINE';
        const isSelected = account.id === selectedId;
        return (
          <div
            key={account.id}
            className={`${styles.accountOptionItem} ${isDisabled ? styles.accountOptionItemDisabled : ''} ${isSelected ? styles.accountOptionItemSelected : ''}`}
            onClick={() => !isDisabled && handleSelect(account)}
          >
            <div className={styles.accountOptionInfo}>
              <PlatformIcon platform={account.platform} size={22} />
              <span className={styles.platformBadge}>
                {
                  PLATFORM_CONFIG[
                    account.platform as keyof typeof PLATFORM_CONFIG
                  ]?.label
                }
              </span>
              <div className={styles.accountNamePhone}>
                <span className={styles.accountName}>{account.nickname}</span>
                <span className={styles.accountPhone}>
                  {account.phoneNumber
                    ? account.phoneNumber.replace(
                        /(?<first>\d{3})\d{4}(?<last>\d{4})/u,
                        '$<first>****$<last>',
                      )
                    : ''}
                </span>
              </div>
            </div>
            <StatusBadge status={account.status} />
          </div>
        );
      })}
      {loading && <div className={styles.loadingMore}>加载中...</div>}
      {!hasMore && accounts.length > 0 && (
        <div className={styles.noMore}>没有更多账号了</div>
      )}
    </div>
  );
};

export default AccountSelectorModal;
