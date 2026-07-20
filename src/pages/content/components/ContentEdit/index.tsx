import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import cx from 'classnames';
import type React from 'react';
import { useState } from 'react';
import type {
  PlatformCount,
  PlatformCountValue,
} from '../AIContentPreviewModal/types';
import styles from './style.module.css';
import type { ContentEditProps, FilterTag } from './types';

const { TextArea } = Input;

const isUnavailable = (
  count: PlatformCountValue,
): count is { available: false } => {
  return 'available' in count && !count.available;
};

const formatTitleCount = (
  count: PlatformCountValue,
): { text: string; overLimit: boolean; available: boolean } => {
  if (isUnavailable(count)) {
    return { text: '', overLimit: false, available: false };
  }
  const { current, limit } = count;
  return {
    text: `${current} / ${limit}`,
    overLimit: current > limit,
    available: true,
  };
};

const TitleCounter: React.FC<{ count: PlatformCount }> = ({ count }) => {
  const xhs = formatTitleCount(count.xiaohongshu);
  const dy = formatTitleCount(count.douyin);

  return (
    <div className={styles.titleCounter}>
      <span>字数：</span>
      {xhs.available && (
        <span
          className={styles.titleCounterItem}
          data-overlimit={xhs.overLimit}
        >
          {xhs.text}（小红书）
        </span>
      )}
      {xhs.available && dy.available && (
        <span className={styles.titleCounterSep}>·</span>
      )}
      {dy.available && (
        <span className={styles.titleCounterItem} data-overlimit={dy.overLimit}>
          {dy.text}（抖音）
        </span>
      )}
    </div>
  );
};

const ContentEdit = ({
  className,
  templates = [],
  value,
  onChange,
  selectedTemplate,
  onTemplateChange,
  onGenerate,
  onReset,
  disabled,
  isGenerating,
  systemPrompt,
  onSystemPromptChange,
  titleValue,
  onTitleChange,
  titleCount,
  titleInputRef,
}: ContentEditProps) => {
  const [isPromptDetailExpanded, setIsPromptDetailExpanded] = useState(true);

  const handleTemplateClick = (template: FilterTag) => {
    if (selectedTemplate?.id === template.id) {
      onTemplateChange?.(null);
    } else {
      onTemplateChange?.(template);
      if (template.label) {
        onChange?.(template.label);
      }
      onSystemPromptChange?.('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const getPromptText = (
    template: FilterTag | null,
    mode: string = 'IMAGE',
  ) => {
    if (!template) return '';
    if (template.defaultPromptByMode?.[mode]) {
      return template.defaultPromptByMode[mode];
    }
    if (template.description) {
      return template.description;
    }
    return '';
  };

  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.header}>
        <span className={styles.title}>内容编辑（智能适配各平台）</span>
      </div>

      <div className={styles.templatesSection} data-testid="template-area">
        <div className={styles.templatesWrapper}>
          <span className={styles.templateLabel}>快捷模板：</span>
          <div className={styles.filterTags}>
            {templates.map((template) => (
              <span
                key={template.id}
                className={cx(styles.filterTag, {
                  [styles.filterTagActive]:
                    selectedTemplate?.id === template.id,
                })}
                onClick={() => handleTemplateClick(template)}
              >
                {template.label}
              </span>
            ))}
          </div>
        </div>
        <span className={styles.templateHint}>
          ↓ 点击模板，自动填充提示词到下方输入框
        </span>
      </div>

      {onTitleChange && (
        <div className={styles.aiInputBox}>
          <span className={styles.inputLabel}>标题</span>
          <Input
            ref={titleInputRef}
            data-testid="title-input"
            value={titleValue}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="请输入标题（必填，20字以内）"
            disabled={disabled}
            className={styles.textArea}
          />
          {titleCount && <TitleCounter count={titleCount} />}
        </div>
      )}

      <div className={styles.aiInputBox}>
        <span className={styles.inputLabel}>内容描述 / 提示词：</span>
        <TextArea
          className={styles.textArea}
          value={value}
          onChange={handleInputChange}
          placeholder="请输入图片相关介绍或描述，或直接点击上方模板"
          disabled={disabled}
          autoSize={{ minRows: 2, maxRows: 4 }}
          data-testid="content-input"
        />
      </div>

      <div className={styles.promptDetail} data-testid="template-detail">
        <div className={styles.promptHeader}>
          <span className={styles.promptTitle}>
            {selectedTemplate
              ? `${selectedTemplate.label}（当前选中）`
              : '请选择模板'}
          </span>
          <span
            className={styles.collapseBtn}
            onClick={() => setIsPromptDetailExpanded(!isPromptDetailExpanded)}
          >
            {isPromptDetailExpanded ? '收起' : '展开'}
            {isPromptDetailExpanded ? (
              <UpOutlined className={styles.collapseIcon} />
            ) : (
              <DownOutlined className={styles.collapseIcon} />
            )}
          </span>
        </div>

        {isPromptDetailExpanded && (
          <>
            <div className={styles.promptContent}>
              {selectedTemplate ? (
                <span className={styles.promptText}>
                  {getPromptText(selectedTemplate, 'IMAGE')}
                </span>
              ) : (
                <span className={styles.promptPlaceholder}>
                  请选择一个模板查看详情
                </span>
              )}
            </div>

            <div className={styles.promptActions}>
              <TextArea
                className={styles.textArea}
                placeholder="编辑提示词..."
                value={systemPrompt}
                onChange={(e) => onSystemPromptChange?.(e.target.value)}
                data-testid="prompt-input"
              />
              <Button
                className={styles.resetBtn}
                onClick={onReset}
                disabled={disabled || !value}
              >
                重置
              </Button>
              <Button
                type="primary"
                className={styles.generateBtn}
                onClick={() => onGenerate?.(value ?? '', systemPrompt)}
                disabled={disabled || isGenerating || !value}
                loading={isGenerating}
              >
                AI生成内容
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentEdit;
