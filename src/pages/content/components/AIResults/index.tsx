import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import cx from 'classnames';
import { useEffect, useRef, useState } from 'react';
import styles from './style.module.css';
import type { AIResultsProps, CaptionResult, Hashtag } from './types';

/** 规范化话题：去掉所有空白；空串回退为 `#话题`；强制 `#` 前缀。 */
const normalizeHashtag = (raw: string): string => {
  const trimmed = raw.replace(/\s+/gu, '');
  if (!trimmed || trimmed === '#') return '#话题';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const AIResults = ({
  className,
  captionResults = [],
  selectedCaptionId,
  onCaptionSelect,
  hashtags = [],
  onHashtagAdd,
  onHashtagRemove,
  onHashtagChange,
  maxHashtags = 5,
  isCaptionExpanded = false,
  onCaptionToggleExpand,
}: AIResultsProps) => {
  const displayedCaptions = isCaptionExpanded
    ? captionResults
    : captionResults.slice(0, 3);

  const handleCaptionClick = (result: CaptionResult) => {
    onCaptionSelect?.(result);
  };

  const handleHashtagClose = (hashtag: Hashtag) => {
    if (editingId === hashtag.id) setEditingId(null);
    onHashtagRemove?.(hashtag);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const prevHashtagCountRef = useRef(hashtags.length);

  // 检测到新增（长度增加）时，让最后一个标签自动进入编辑态。
  useEffect(() => {
    if (hashtags.length > prevHashtagCountRef.current) {
      const last = hashtags[hashtags.length - 1];
      if (last) {
        setEditingId(last.id);
        setEditValue(last.name);
      }
    }
    prevHashtagCountRef.current = hashtags.length;
  }, [hashtags]);

  const startEdit = (tag: Hashtag) => {
    setEditingId(tag.id);
    setEditValue(tag.name);
  };

  const commitEdit = (tag: Hashtag) => {
    const normalized = normalizeHashtag(editValue);
    if (normalized !== tag.name) {
      onHashtagChange?.(tag, normalized);
    }
    setEditingId(null);
  };

  const canAddMore = hashtags.length < maxHashtags;

  return (
    <div className={cx(styles.container, className)}>
      {/* 完整内容包结果 */}
      {captionResults.length > 0 && (
        <div className={styles.aiResultsCard} data-testid="caption-results">
          <div className={styles.header}>
            <span className={styles.title}>
              AI生成内容（完整内容包，点击一键填充）
            </span>
          </div>

          <div className={styles.resultsList}>
            {displayedCaptions.map((result) => (
              <div
                key={result.id}
                className={cx(styles.resultItem, {
                  [styles.resultItemSelected]: selectedCaptionId === result.id,
                })}
                onClick={() => handleCaptionClick(result)}
                data-testid={`caption-result-${result.id}`}
              >
                <div
                  className={styles.captionTitle}
                >{`${result.id} ${result.title}`}</div>
                <div className={styles.captionText}>{result.caption}</div>
                <div className={styles.captionTags}>
                  {result.topicTags.map((tag, i) => {
                    const firstIndex = result.topicTags.indexOf(tag);
                    const key = firstIndex === i ? tag : `${tag}-${firstIndex}`;
                    return (
                      <span
                        key={`${result.id}-${key}`}
                        className={styles.captionTag}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {captionResults.length > 3 && (
            <div className={styles.expandBtn} onClick={onCaptionToggleExpand}>
              <span>{isCaptionExpanded ? '收起' : '展开'}</span>
              <DownOutlined
                className={styles.expandIcon}
                style={{
                  transform: isCaptionExpanded ? 'rotate(180deg)' : 'none',
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className={styles.hashtagSection} data-testid="hashtags">
        <span className={styles.hashtagLabel}>#话题：</span>
        <div className={styles.hashtagTags}>
          {hashtags.map((tag) =>
            editingId === tag.id ? (
              <Input
                key={tag.id}
                size="small"
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(tag)}
                onPressEnter={() => commitEdit(tag)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditingId(null);
                  }
                }}
                style={{ width: 120 }}
                data-testid="hashtag-input"
              />
            ) : (
              <Tag
                key={tag.id}
                className={styles.hashtagTag}
                closable
                onClose={() => handleHashtagClose(tag)}
                onClick={() => startEdit(tag)}
                style={{ cursor: 'pointer' }}
              >
                {tag.name}
              </Tag>
            ),
          )}
          {canAddMore && (
            <span className={styles.addHashtag} onClick={onHashtagAdd}>
              <PlusOutlined /> 添加
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResults;
