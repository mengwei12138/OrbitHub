import { Badge } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type {
  RepublishParam,
  RepublishTaskDetail,
} from '@/services/ai-assistant';

import AccountSelector from './components/AccountSelector';
import AccountSelectorModal from './components/AccountSelectorModal';
import DeleteOriginalCheckbox from './components/DeleteOriginalCheckbox';
import RepublishActions from './components/RepublishActions';
import styles from './style.module.css';

type AccountOption = {
  id: string;
  name: string;
  platform: string;
  fans?: string;
  isOriginal?: boolean;
};

type RepublishSettingsProps = {
  contentId?: string;
  aiOptimizeApplied?: boolean;
  accounts?: AccountOption[];
  initialSelectedAccountIds?: string[];
  loading?: boolean;
  taskStatus?: RepublishTaskDetail | null;
  onSubmit?: (data: RepublishParam) => void;
  onCancel?: () => void;
  onDeleteOriginalChange?: (value: boolean) => void;
  onAccountChange?: (changed: boolean) => void;
};

const DEFAULT_ACCOUNTS: AccountOption[] = [
  {
    id: '1',
    name: '潮流玩家',
    platform: '抖音',
    fans: '18.2w',
    isOriginal: true,
  },
  { id: '2', name: '时尚穿搭号', platform: '抖音', fans: '32.5w' },
  { id: '3', name: '数码科技号', platform: '小红书', fans: '9.6w' },
  { id: '4', name: '美食探店号', platform: '小红书', fans: '15.8w' },
];

const RepublishSettings = ({
  contentId,
  aiOptimizeApplied = false,
  accounts = DEFAULT_ACCOUNTS,
  initialSelectedAccountIds,
  loading = false,
  taskStatus,
  onSubmit,
  onCancel = () => {},
  onDeleteOriginalChange,
  onAccountChange,
}: RepublishSettingsProps) => {
  const originalAccountId = useMemo(
    () => accounts.find((account) => account.isOriginal)?.id,
    [accounts],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(
    initialSelectedAccountIds ?? (originalAccountId ? [originalAccountId] : []),
  );
  const [deleteOriginal, setDeleteOriginal] = useState(false);

  // 当外部初始选中变化（例如重新进入应用流程）时同步
  useEffect(() => {
    if (initialSelectedAccountIds) {
      setSelected(initialSelectedAccountIds);
    }
  }, [initialSelectedAccountIds]);

  const handleSelectMore = () => setModalOpen(true);
  const handleModalConfirm = (ids: string[]) => {
    const initial =
      initialSelectedAccountIds ??
      (originalAccountId ? [originalAccountId] : []);
    const changed = !(
      ids.length === initial.length && ids.every((id) => initial.includes(id))
    );
    onAccountChange?.(changed);
    setSelected(ids);
    setModalOpen(false);
  };
  const handleModalCancel = () => setModalOpen(false);

  // 跨账号删除：仅当目标账号包含原账号时允许
  // 当 accounts 数据不完整（originalAccountId 为空）但 selected 中有 ID 在 accounts 中找不到对应记录时，也允许删除
  const canDeleteOriginal =
    Boolean(originalAccountId && selected.includes(originalAccountId)) ||
    selected.some((id) => !accounts.find((a) => a.id === id));

  // 取消勾选原账号时自动重置删除选项，避免脏状态进入提交
  useEffect(() => {
    if (!canDeleteOriginal && deleteOriginal) {
      setDeleteOriginal(false);
    }
  }, [canDeleteOriginal, deleteOriginal]);

  const selectedChips = useMemo(
    () =>
      accounts
        .filter((account) => selected.includes(account.id))
        .map((account) => ({
          id: account.id,
          name: account.name,
          isOriginal: account.isOriginal,
        })),
    [accounts, selected],
  ).concat(
    selected
      .filter((id) => !accounts.find((a) => a.id === id))
      .map((id) => ({
        id,
        name: '原账号',
        isOriginal: true,
      })),
  );

  const handleConfirm = () => {
    if (!contentId || selected.length === 0) return;
    onSubmit?.({
      contentId,
      targetAccountIds: selected,
      deleteOriginal: canDeleteOriginal ? deleteOriginal : false,
    });
  };

  const submitDisabled = !contentId || selected.length === 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>重新发布设置</h2>
        {aiOptimizeApplied && (
          <Badge status="success" text="✓ 已应用 AI 优化" />
        )}
        {taskStatus && (
          <span className={styles.taskStatus} data-status={taskStatus.status}>
            任务状态：{taskStatus.status}
            {typeof taskStatus.attempt === 'number' &&
              `（第 ${taskStatus.attempt} 次）`}
          </span>
        )}
      </div>

      <AccountSelector
        accounts={selectedChips}
        onSelectMore={handleSelectMore}
      />

      <DeleteOriginalCheckbox
        checked={deleteOriginal && canDeleteOriginal}
        disabled={!canDeleteOriginal}
        onChange={(val) => {
          setDeleteOriginal(val);
          onDeleteOriginalChange?.(val);
        }}
      />

      <RepublishActions
        loading={loading}
        disabled={submitDisabled}
        onCancel={onCancel}
        onConfirm={handleConfirm}
      />

      <AccountSelectorModal
        open={modalOpen}
        accounts={accounts}
        selectedIds={selected}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default RepublishSettings;
export type { AccountOption };
