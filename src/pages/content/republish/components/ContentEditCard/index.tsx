import { Button, Input, Space } from 'antd';
import type React from 'react';
import { useState } from 'react';

import styles from './style.module.css';

const { TextArea } = Input;

type ContentEditCardProps = {
  title: string;
  content: string;
  tags: string[];
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onAIGenerate: () => void;
  aiLoading?: boolean;
};

const ContentEditCard: React.FC<ContentEditCardProps> = ({
  title,
  content,
  tags,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onAIGenerate,
  aiLoading = false,
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>内容修改</span>
        <Space>
          <Button
            className={styles.aiButton}
            onClick={onAIGenerate}
            loading={aiLoading}
          >
            AI生成内容
          </Button>
        </Space>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>编辑标题：</span>
        <Input
          className={styles.input}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="请输入内容"
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>编辑文案：</span>
        <TextArea
          className={styles.textarea}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="请输入内容"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>编辑标签：</span>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
              <span
                className={styles.tagRemove}
                onClick={() => handleRemoveTag(tag)}
              >
                ×
              </span>
            </span>
          ))}
        </div>
        <Input
          className={styles.tagInput}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="输入标签后按回车添加"
        />
      </div>
    </div>
  );
};

export default ContentEditCard;
