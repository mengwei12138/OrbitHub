import { CloseOutlined, TagFilled } from '@ant-design/icons';
import { Input } from 'antd';
import { useRef, useState } from 'react';

import styles from './style.module.css';

type PlatformCode = 'douyin' | 'xiaohongshu';

type SuggestionTagsSectionProps = {
  tags: string[];
  isEditing: boolean;
  platform?: PlatformCode;
  maxTags?: number;
  onRemove: (index: number) => void;
  onAdd: (tag: string) => void;
  onEdit?: (index: number, newTag: string) => void;
};

const SuggestionTagsSection = ({
  tags,
  isEditing,
  platform,
  maxTags = 10,
  onRemove,
  onAdd,
  onEdit,
}: SuggestionTagsSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const hintText =
    platform === 'douyin'
      ? `抖音最多 ${maxTags} 个，可点击删除/添加`
      : `小红书最多 ${maxTags} 个，可点击删除/添加`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const value = e.currentTarget.value.trim();
      const tag = value.startsWith('#') ? value : `#${value}`;
      onAdd(tag);
      e.currentTarget.value = '';
    }
  };

  const handleStartEdit = (tag: string, index: number) => {
    if (!isEditing || !onEdit) return;
    setEditingIndex(index);
    setEditValue(tag);
  };

  const handleCommitEdit = (index: number) => {
    if (editValue.trim() && onEdit) {
      const value = editValue.trim();
      const tag = value.startsWith('#') ? value : `#${value}`;
      onEdit(index, tag);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  return (
    <div className={styles.suggestionTagsSection}>
      <div className={styles.header}>
        <div className={styles.labelRow}>
          <TagFilled className={styles.icon} />
          <span className={styles.label}>建议标签</span>
          <span className={styles.hint}>（{hintText}）</span>
        </div>
      </div>
      <div className={styles.tagWrapper}>
        <div className={styles.tagList}>
          {tags.map((tag, i) => {
            const firstIndex = tags.indexOf(tag);
            const key = firstIndex === i ? tag : `${tag}-${firstIndex}`;
            if (editingIndex === i) {
              return (
                <Input
                  key={`edit-${key}`}
                  size="small"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleCommitEdit(i)}
                  onPressEnter={() => handleCommitEdit(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingIndex(null);
                      setEditValue('');
                    }
                  }}
                  className={styles.tagInput}
                  style={{ maxWidth: 100 }}
                />
              );
            }
            return (
              <span
                key={key}
                className={styles.tag}
                onClick={() => handleStartEdit(tag, i)}
                style={{ cursor: 'pointer' }}
              >
                {tag}
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(i);
                  }}
                >
                  <CloseOutlined />
                </button>
              </span>
            );
          })}
          {editingIndex === null && tags.length < maxTags && (
            <input
              ref={inputRef}
              type="text"
              data-testid="tag-input"
              className={styles.addInput}
              placeholder="输入后按回车添加"
              onKeyDown={handleKeyDown}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionTagsSection;
