import styles from '../../style.module.css';

export type WorkspaceGroupTab = {
  id: string;
  name: string;
  accountCount: number;
  unreadCount: number;
  hasUrgent?: boolean;
  isUngrouped?: boolean;
};

type GroupTabsProps = {
  groups: WorkspaceGroupTab[];
  activeGroupId?: string;
  onChange: (groupId: string) => void;
};

const GroupTabs = ({ groups, activeGroupId, onChange }: GroupTabsProps) => (
  <div className={styles.groupStrip}>
    {groups.map((group) => {
      const active = group.id === activeGroupId;
      return (
        <button
          key={group.id}
          type="button"
          className={`${styles.groupCard} ${active ? styles.groupCardActive : ''}`}
          onClick={() => {
            onChange(group.id);
          }}
        >
          <div className={styles.groupCardHeader}>
            <div>
              <p className={styles.groupCardTitle}>{group.name}</p>
              <div className={styles.groupCardMeta}>
                {group.isUngrouped ? '待整理账号视图' : `已归组账号 ${group.accountCount} 个`}
              </div>
            </div>
          </div>
          <div className={styles.cardIndicators}>
            {group.hasUrgent ? (
              <span className={styles.urgentIndicator}>紧急</span>
            ) : null}
            {group.unreadCount > 0 ? (
              <span className={styles.unreadIndicator}>未读 {group.unreadCount}</span>
            ) : null}
          </div>
        </button>
      );
    })}
  </div>
);

export default GroupTabs;
