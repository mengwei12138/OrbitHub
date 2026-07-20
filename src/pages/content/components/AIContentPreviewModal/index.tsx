import { PlusOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomModal } from '@/components';
import styles from './style.module.css';
import type {
  AIContentPreviewModalProps,
  PlatformCount,
  PlatformCountItem,
  PlatformCountValue,
} from './types';

const isUnavailable = (
  count: PlatformCountValue,
): count is { available: false } => {
  return 'available' in count && !count.available;
};

const formatCount = (
  count: PlatformCountValue,
): { text: string; overLimit: boolean } => {
  if (isUnavailable(count)) {
    return { text: '无正文字段', overLimit: false };
  }
  const { current, limit } = count;
  return {
    text: `${current}/${limit}`,
    overLimit: current > limit,
  };
};

const PlatformCounter: React.FC<{ count: PlatformCount }> = ({ count }) => {
  const xhs = formatCount(count.xiaohongshu);
  const dy = formatCount(count.douyin);

  return (
    <div className={styles.counter}>
      <span className={styles.counterItem} data-overlimit={xhs.overLimit}>
        小红书 {xhs.text}
      </span>
      <span className={styles.counterSep}>·</span>
      <span className={styles.counterItem} data-overlimit={dy.overLimit}>
        抖音 {dy.text}
      </span>
    </div>
  );
};

const AIContentPreviewModal: React.FC<AIContentPreviewModalProps> = ({
  open,
  contentType,
  title,
  titleCount,
  body,
  bodyCount,
  topics,
  topicCount,
  onTitleChange,
  onBodyChange,
  onTopicsChange,
  onCancel,
  onApply,
}) => {
  const bodyLabel = contentType === 'IMAGE' ? '图文描述' : '视频文案';
  const bodyPlaceholder = `请输入${bodyLabel}`;
  const [inputValue, setInputValue] = useState('');
  const topicsRef = useRef(topics);

  useEffect(() => {
    topicsRef.current = topics;
  }, [topics]);

  const getTopicLimit = useMemo(() => {
    const xhs = topicCount.xiaohongshu;
    const dy = topicCount.douyin;
    if (isUnavailable(xhs)) {
      return (dy as PlatformCountItem).limit;
    }
    if (isUnavailable(dy)) {
      return (xhs as PlatformCountItem).limit;
    }
    return Math.min(
      (xhs as PlatformCountItem).limit,
      (dy as PlatformCountItem).limit,
    );
  }, [topicCount]);

  const isTopicsOverLimit = useMemo(() => {
    const xhs = topicCount.xiaohongshu;
    const dy = topicCount.douyin;
    if (isUnavailable(xhs)) {
      return (
        (dy as PlatformCountItem).current > (dy as PlatformCountItem).limit
      );
    }
    if (isUnavailable(dy)) {
      return (
        (xhs as PlatformCountItem).current > (xhs as PlatformCountItem).limit
      );
    }
    return (
      (xhs as PlatformCountItem).current > (xhs as PlatformCountItem).limit ||
      (dy as PlatformCountItem).current > (dy as PlatformCountItem).limit
    );
  }, [topicCount]);

  const isBodyOverLimit = useMemo(() => {
    const xhs = bodyCount.xiaohongshu;
    const dy = bodyCount.douyin;
    if (isUnavailable(xhs)) {
      return (
        (dy as PlatformCountItem).current > (dy as PlatformCountItem).limit
      );
    }
    if (isUnavailable(dy)) {
      return false;
    }
    return (
      (xhs as PlatformCountItem).current > (xhs as PlatformCountItem).limit ||
      (dy as PlatformCountItem).current > (dy as PlatformCountItem).limit
    );
  }, [bodyCount]);

  const isTitleOverLimit = useMemo(() => {
    const xhs = titleCount.xiaohongshu;
    const dy = titleCount.douyin;
    if (isUnavailable(xhs)) {
      return (
        (dy as PlatformCountItem).current > (dy as PlatformCountItem).limit
      );
    }
    if (isUnavailable(dy)) {
      return false;
    }
    return (
      (xhs as PlatformCountItem).current > (xhs as PlatformCountItem).limit ||
      (dy as PlatformCountItem).current > (dy as PlatformCountItem).limit
    );
  }, [titleCount]);

  const canAddTopic = useMemo(() => {
    return topics.length < getTopicLimit;
  }, [topics.length, getTopicLimit]);

  const handleAddTopic = () => {
    if (inputValue.trim() && canAddTopic) {
      const newTopic = inputValue.startsWith('#')
        ? inputValue.trim()
        : `#${inputValue.trim()}`;
      onTopicsChange([...topicsRef.current, newTopic]);
      setInputValue('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    onTopicsChange(topics.filter((t) => t !== topicToRemove));
  };

  return (
    <CustomModal
      open={open}
      title="AI 内容预览与编辑"
      footer={null}
      modalProps={{
        onCancel: onCancel,
      }}
      width={560}
    >
      <div className={styles.content}>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <span className={styles.label}>标题</span>
            <span className={styles.hint}>（可编辑）</span>
          </div>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="请输入标题（必填，20字以内）"
            data-testid="ai-preview-title-input"
            className={styles.input}
          />
          <PlatformCounter count={titleCount} />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <span className={styles.label}>{bodyLabel}</span>
            <span className={styles.hint}>（可编辑）</span>
          </div>
          <Input.TextArea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder={bodyPlaceholder}
            className={styles.textarea}
            autoSize={{ minRows: 5, maxRows: 10 }}
          />
          <PlatformCounter count={bodyCount} />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <span className={styles.label}>话题 / 标签</span>
            <span className={styles.hint}>（可编辑）</span>
          </div>
          <div className={styles.topicsWrapper}>
            {topics.map((topic) => (
              <Tag
                key={topic}
                className={styles.topicTag}
                closable
                onClose={() => handleRemoveTopic(topic)}
              >
                {topic}
              </Tag>
            ))}
            {canAddTopic && (
              <>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入话题"
                  className={styles.topicInput}
                />
                <PlusOutlined
                  className={styles.addTopicIcon}
                  onClick={handleAddTopic}
                />
              </>
            )}
          </div>
          <PlatformCounter count={topicCount} />
        </div>

        <div className={styles.tipBanner}>
          <span className={styles.tipText}>
            提示：您可以直接编辑以上内容，应用后将替换您修改前的版本
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onCancel}>
          取消
        </button>
        <button
          className={styles.btnApply}
          onClick={onApply}
          disabled={isTopicsOverLimit || isBodyOverLimit || isTitleOverLimit}
        >
          应用
        </button>
      </div>
    </CustomModal>
  );
};

export default AIContentPreviewModal;

export type { AIContentPreviewModalProps, PlatformCount, PlatformCountValue };
