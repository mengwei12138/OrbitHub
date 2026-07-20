import { BulbFilled } from '@ant-design/icons';

import styles from './style.module.css';

type SuggestionTitleSectionProps = {
  title: string;
  originalTitle: string;
  onEdit: (value: string) => void;
  onRestore: () => void;
};

const SuggestionTitleSection = ({
  title,
  originalTitle,
  onEdit,
  onRestore,
}: SuggestionTitleSectionProps) => {
  return (
    <div className={styles.suggestionTitleSection}>
      <div className={styles.header}>
        <div className={styles.labelRow}>
          <BulbFilled className={styles.icon} />
          <span className={styles.label}>建议标题</span>
          <span className={styles.hint}>（AI 已生成，可直接编辑）</span>
        </div>
      </div>
      <div className={styles.content}>
        <input
          type="text"
          className={styles.input}
          value={title}
          onChange={(e) => onEdit(e.target.value)}
          placeholder="请输入标题"
        />
        <button
          type="button"
          className={styles.restoreBtn}
          onClick={onRestore}
          disabled={title === originalTitle}
        >
          恢复原标题
        </button>
      </div>
    </div>
  );
};

export default SuggestionTitleSection;
