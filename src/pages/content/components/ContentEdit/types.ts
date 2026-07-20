import type { InputRef } from 'antd';
import type { Ref } from 'react';
import type { PlatformCount } from '../AIContentPreviewModal/types';

export interface FilterTag {
  id: string;
  label: string;
  description?: string | null;
  defaultPromptByMode?: Record<string, string>;
}

export interface ContentEditProps {
  className?: string;
  templates?: FilterTag[];
  value?: string;
  onChange?: (value: string) => void;
  selectedTemplate?: FilterTag | null;
  onTemplateChange?: (template: FilterTag | null) => void;
  onGenerate?: (userPrompt: string, systemPrompt?: string) => void;
  onReset?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  systemPrompt?: string;
  onSystemPromptChange?: (value: string) => void;
  /** 主表单标题输入框值（必填，20字以内）。 */
  titleValue?: string;
  onTitleChange?: (value: string) => void;
  /** 标题字数提示，按所选账号涉及的平台展示。 */
  titleCount?: PlatformCount;
  titleInputRef?: Ref<InputRef>;
}
