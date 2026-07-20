import { CloseOutlined, StarFilled } from '@ant-design/icons';

import styles from './style.module.css';

type HeaderProps = {
  title: string;
  onClose: () => void;
};

const Header = ({ title, onClose }: HeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <StarFilled className={styles.icon} />
        <span className={styles.title}>AI 优化建议</span>
        <span className={styles.refTag}>针对：{title}</span>
      </div>
      <button type="button" className={styles.closeBtn} onClick={onClose}>
        <CloseOutlined />
      </button>
    </div>
  );
};

export default Header;
