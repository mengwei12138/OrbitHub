import { Button, Empty, Tag } from 'antd';

import type {
  AiAssistantGroupAccountOption,
  AiAssistantKnowledgeFile,
} from '@/services/ai-assistant';

import styles from '../../style.module.css';

type GroupSidebarProps = {
  accounts: AiAssistantGroupAccountOption[];
  knowledgeFiles: AiAssistantKnowledgeFile[];
  isUngrouped: boolean;
  canManageGroup: boolean;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onManageKnowledgeBase: () => void;
};

const GroupSidebar = ({
  accounts,
  knowledgeFiles,
  isUngrouped,
  canManageGroup,
  onEditGroup,
  onDeleteGroup,
  onManageKnowledgeBase,
}: GroupSidebarProps) => (
  <div className={`${styles.panel} ${styles.groupSidebar}`}>
    <div className={styles.sidebarSection}>
      <div className={styles.sidebarSectionHeader}>
        <strong>知识库</strong>
        {!isUngrouped ? (
          <Button type="link" onClick={onManageKnowledgeBase}>
            管理知识库
          </Button>
        ) : null}
      </div>
      {isUngrouped ? (
        <div className={styles.sidebarHint}>未分组账号暂不支持配置知识库。</div>
      ) : (
        <div className={styles.knowledgeList}>
          {knowledgeFiles.length === 0 ? (
            <Empty
              description="当前分组还没有知识库文件"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            knowledgeFiles.slice(0, 3).map((file) => (
              <div key={file.id} className={styles.knowledgeItem}>
                <div className={styles.knowledgeItemTitle}>{file.fileName}</div>
                <div className={styles.knowledgeItemMeta}>{file.summary}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    <div className={styles.sidebarSection}>
      <div className={styles.sidebarSectionHeader}>
        <strong>账号列表</strong>
        {!isUngrouped && canManageGroup ? (
          <div className={styles.sidebarSectionActions}>
            <Button type="link" onClick={onEditGroup}>
              编辑分组
            </Button>
            <Button danger type="link" onClick={onDeleteGroup}>
              删除分组
            </Button>
          </div>
        ) : null}
      </div>
      {accounts.length === 0 ? (
        <div className={styles.sidebarHint}>当前没有可展示的账号。</div>
      ) : (
        <div className={styles.accountTags}>
          {accounts.map((account) => (
            <Tag key={account.accountId}>
              {account.nickname} · {account.platform === 'douyin' ? '抖音' : '小红书'}
            </Tag>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default GroupSidebar;
