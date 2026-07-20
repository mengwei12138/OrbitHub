import type { FC } from 'react';

import styles from './style.module.css';

export type FetchFrequency = '5min' | '10min' | '30min' | '1hour';
export type MessageType = 'all' | 'unread' | 'read';

export type Props = {
  title?: string;
  frequency?: FetchFrequency;
  messageType?: MessageType;
  disabled?: boolean;
  onFrequencyChange?: (frequency: FetchFrequency) => void;
  onMessageTypeChange?: (messageType: MessageType) => void;
};

const FREQUENCY_OPTIONS: { value: FetchFrequency; label: string }[] = [
  { value: '5min', label: '每 5 分钟' },
  { value: '10min', label: '每 10 分钟' },
  { value: '30min', label: '每 30 分钟' },
  { value: '1hour', label: '每 1 小时' },
];

const MESSAGE_TYPE_OPTIONS: { value: MessageType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
  { value: 'read', label: '已读' },
];

const FetchSettings: FC<Props> = ({
  title = '抓取设置',
  frequency = '5min',
  messageType = 'all',
  disabled,
  onFrequencyChange,
  onMessageTypeChange,
}) => {
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFrequencyChange?.(e.target.value as FetchFrequency);
  };

  return (
    <div className={styles.card}>
      <span className={styles.title}>{title}</span>
      <div className={styles.row}>
        <div className={styles.group}>
          <span className={styles.label}>抓取频率：</span>
          <select
            className={styles.select}
            value={frequency}
            disabled={disabled}
            onChange={handleFrequencyChange}
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.hint}>自动抓取新私信</span>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>私信类型：</span>
          <select
            className={styles.select}
            value={messageType}
            disabled={disabled}
            onChange={(e) =>
              onMessageTypeChange?.(e.target.value as MessageType)
            }
          >
            {MESSAGE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FetchSettings;
