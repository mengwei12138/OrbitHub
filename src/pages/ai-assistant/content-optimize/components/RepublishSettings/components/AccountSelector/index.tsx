import { PlusOutlined } from '@ant-design/icons';

import styles from './style.module.css';

type AccountChip = {
  id: string;
  name: string;
  isOriginal?: boolean;
};

type AccountSelectorProps = {
  accounts: AccountChip[];
  onSelectMore: () => void;
};

const AccountSelector = ({ accounts, onSelectMore }: AccountSelectorProps) => {
  return (
    <div className={styles.accountSelector}>
      <span className={styles.label}>目标账号</span>
      <div className={styles.chips}>
        {accounts.map((account) => (
          <span
            key={account.id}
            className={`${styles.chip} ${account.isOriginal ? styles.chipOriginal : ''}`}
          >
            <span className={styles.avatar} />
            <span className={styles.name}>
              {account.name}
              {account.isOriginal && '（原账号）'}
            </span>
          </span>
        ))}
        <button
          type="button"
          className={styles.selectBtn}
          onClick={onSelectMore}
        >
          <PlusOutlined />
          <span>选择更多账号</span>
        </button>
      </div>
    </div>
  );
};

export default AccountSelector;
