import { WarningFilled } from '@ant-design/icons';

import styles from './style.module.css';

type ProblemSectionProps = {
  content: string;
};

const ProblemSection = ({ content }: ProblemSectionProps) => {
  return (
    <div className={styles.problemSection}>
      <WarningFilled className={styles.icon} />
      <div className={styles.right}>
        <span className={styles.label}>问题分析</span>
        <span className={styles.content}>{content}</span>
      </div>
    </div>
  );
};

export default ProblemSection;
