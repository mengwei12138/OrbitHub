import styles from './style.module.css';
import type { PageHeaderProps } from './types';

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  toolbar,
  children,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{title}</div>
      <div className={styles.center}>{children}</div>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
    </div>
  );
};

export default PageHeader;

export type { PageHeaderProps };
