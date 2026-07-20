import { Select } from 'antd';
import styles from './style.module.css';
import type { FilterBarProps } from './types';

const FilterBar: React.FC<FilterBarProps> = ({
  timeRange,
  platform,
  onTimeRangeChange,
  onPlatformChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.filterRow}>
        <span className={styles.label}>时间</span>
        <Select
          className={styles.select}
          value={timeRange}
          onChange={onTimeRangeChange}
          options={[
            { value: 'today', label: '今日' },
            { value: 'last7days', label: '近7天' },
            { value: 'last30days', label: '近30天' },
            { value: 'thisYear', label: '今年' },
          ]}
        />
        <span className={styles.label}>平台</span>
        <Select
          className={styles.select}
          value={platform}
          onChange={onPlatformChange}
          options={[
            { value: 'all', label: '全部平台' },
            { value: 'douyin', label: '抖音' },
            { value: 'xiaohongshu', label: '小红书' },
          ]}
        />
      </div>
    </div>
  );
};

export default FilterBar;
