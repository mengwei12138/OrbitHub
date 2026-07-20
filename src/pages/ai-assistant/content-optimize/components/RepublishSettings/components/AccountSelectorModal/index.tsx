import { SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { CustomModal } from '@/components';

import styles from './style.module.css';

type Account = {
  id: string;
  name: string;
  platform: string;
  fans?: string;
  isOriginal?: boolean;
};

type AccountSelectorModalProps = {
  open: boolean;
  accounts: Account[];
  selectedIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  onCancel: () => void;
};

const AccountSelectorModal = ({
  open,
  accounts,
  selectedIds,
  onConfirm,
  onCancel,
}: AccountSelectorModalProps) => {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<'all' | 'douyin' | 'xiaohongshu'>(
    'all',
  );
  const [selected, setSelected] = useState<string[]>(selectedIds);

  const filteredAccounts = accounts.filter((account) => {
    const matchSearch = account.name.includes(search);
    const matchPlatform =
      platform === 'all' ||
      (platform === 'douyin' && account.platform === '抖音') ||
      (platform === 'xiaohongshu' && account.platform === '小红书');
    return matchSearch && matchPlatform;
  });

  const handleToggle = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      const otherPlatformSelected = selected.filter((selectedId) => {
        const selectedAccount = accounts.find((a) => a.id === selectedId);
        return selectedAccount?.platform !== account.platform;
      });
      setSelected([...otherPlatformSelected, id]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
  };

  return (
    <CustomModal
      open={open}
      title="选择目标账号"
      footer={null}
      modalProps={{
        onCancel: onCancel,
        width: 600,
      }}
    >
      <div className={styles.modal}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索账号"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.platformTabs}>
            <button
              type="button"
              className={`${styles.tab} ${platform === 'all' ? styles.tabActive : ''}`}
              onClick={() => setPlatform('all')}
            >
              全部
            </button>
            <button
              type="button"
              className={`${styles.tab} ${platform === 'douyin' ? styles.tabActive : ''}`}
              onClick={() => setPlatform('douyin')}
            >
              抖音
            </button>
            <button
              type="button"
              className={`${styles.tab} ${platform === 'xiaohongshu' ? styles.tabActive : ''}`}
              onClick={() => setPlatform('xiaohongshu')}
            >
              小红书
            </button>
          </div>
        </div>

        <div className={styles.selectedInfo}>
          <span>
            已选 <strong>{selected.length}</strong> / 共 {accounts.length}{' '}
            个在线账号
          </span>
          <button type="button" className={styles.selectAllBtn}>
            全选当前页
          </button>
        </div>

        <div className={styles.accountList}>
          {filteredAccounts.map((account, index) => (
            <div key={account.id}>
              {index > 0 && <div className={styles.divider} />}
              <div
                className={`${styles.accountRow} ${selected.includes(account.id) ? styles.accountRowSelected : ''}`}
                onClick={() => handleToggle(account.id)}
              >
                <div
                  className={`${styles.checkbox} ${selected.includes(account.id) ? styles.checkboxChecked : ''}`}
                >
                  {selected.includes(account.id) && <span>✓</span>}
                </div>
                <div className={styles.avatar} />
                <div className={styles.accountInfo}>
                  <span className={styles.accountName}>{account.name}</span>
                  <span className={styles.accountMeta}>
                    粉丝 {account.fans} · {account.platform}
                  </span>
                </div>
                {account.isOriginal && (
                  <span className={styles.originalTag}>原账号</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <span>
            已选 <strong>{selected.length}</strong> 个账号
          </span>
          <div className={styles.footerBtns}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
            >
              取消
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleConfirm}
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default AccountSelectorModal;
