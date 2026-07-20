import { Button } from 'antd';
import type { FC } from 'react';

import WarningIcon from '../../images/offline-warning-icon.svg';
import styles from './style.module.css';

type OfflineAccount = {
  name: string;
  platform: string;
  reason: string;
};

type Props = {
  accounts: OfflineAccount[];
  onClose?: () => void;
};

const OfflineWarning: FC<Props> = ({ accounts, onClose }) => {
  if (accounts.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <img src={WarningIcon} alt="警告" className={styles.icon} />
      <div className={styles.content}>
        <div className={styles.title}>以下账号已离线，自动回复已暂停</div>
        <ul className={styles.accountList}>
          {accounts.map((account) => (
            <li
              key={`${account.name}-${account.platform}`}
              className={styles.accountItem}
            >
              <span>•</span>
              <span>
                {account.name}（{account.platform}）
              </span>
              <span>—</span>
              <span className={styles.status}>{account.reason}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        type="text"
        size="small"
        className={styles.closeBtn}
        onClick={onClose}
      >
        ✕
      </Button>
    </div>
  );
};

export default OfflineWarning;
