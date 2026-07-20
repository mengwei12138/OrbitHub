import { AlertOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import type { FC } from 'react';
import styles from './style.module.css';

type FilterType = 'all' | 'video' | 'image';

type WorkFilterTabsProps = {
  activeTab: FilterType;
  onChange: (value: FilterType) => void;
};

const tabs: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部作品' },
  { value: 'video', label: '视频' },
  { value: 'image', label: '图文' },
];

const WorkFilterTabs: FC<WorkFilterTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className={styles.card}>
      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>类型筛选</span>
        <Segmented
          value={activeTab}
          onChange={(value) => onChange(value as FilterType)}
          options={tabs.map((t) => ({ value: t.value, label: t.label }))}
        />
      </div>
      <div className={styles.warningRow}>
        <AlertOutlined className={styles.warningIcon} />
        <span className={styles.warningText}>
          作品保存 24 小时后自动清理，请注意及时下载
        </span>
      </div>
    </div>
  );
};

export default WorkFilterTabs;
