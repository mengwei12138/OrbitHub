import { Input, Select, Space } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style.module.css';
import type { WarningFilterProps, WarningFilterType } from './types';

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'account', label: '账号异常' },
  { value: 'content', label: '内容异常' },
  { value: 'fans', label: '粉丝异常' },
];

const DEBOUNCE_DELAY = 300;

const WarningFilter: React.FC<WarningFilterProps> = ({ value, onChange }) => {
  const [keyword, setKeyword] = useState(value.keyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTypeChange = useCallback(
    (warningType: WarningFilterType) => {
      onChange({ ...value, warningType });
    },
    [onChange, value],
  );

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newKeyword = e.target.value;
      setKeyword(newKeyword);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange({ ...value, keyword: newKeyword });
      }, DEBOUNCE_DELAY);
    },
    [onChange, value],
  );

  useEffect(() => {
    setKeyword(value.keyword);
  }, [value.keyword]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Space size={16}>
        <Select
          value={value.warningType}
          onChange={handleTypeChange}
          options={TYPE_OPTIONS}
          className={styles.typeSelect}
        />
        <Input.Search
          placeholder="搜索账号名称..."
          value={keyword}
          onChange={handleKeywordChange}
          className={styles.searchInput}
          enterButton
        />
      </Space>
    </div>
  );
};

export default WarningFilter;
