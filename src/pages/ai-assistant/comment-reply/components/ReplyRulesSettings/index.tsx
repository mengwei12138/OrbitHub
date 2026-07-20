import { Button, Checkbox, Input, Modal, Switch } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';

import AddIcon from '../../images/add-icon.svg';
import CloseIcon from '../../images/close-icon.svg';
import DeleteIcon from '../../images/delete-icon.svg';
import EditIcon from '../../images/edit-icon.svg';
import IconNegative from '../../images/icon-negative.svg';
import IconNeutral from '../../images/icon-neutral.svg';
import IconPositive from '../../images/icon-positive.svg';
import IconQuestion from '../../images/icon-question.svg';
import styles from './style.module.css';

type ReplyRule = {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'question';
  template: string;
  keywords?: string[];
  createdByName?: string | null;
  editable?: boolean;
};

type ToneOption = {
  code: string;
  displayName: string;
};

type KeywordRow = {
  keywordId: string;
  keyword: string;
};

type Props = {
  loading?: boolean;
  enabled?: boolean;
  rules?: ReplyRule[];
  tone?: string;
  toneOptions?: ToneOption[];
  needReviewForQuestion?: boolean;
  needReviewForNegative?: boolean;
  blockedKeywords?: KeywordRow[];
  autoDeleteBlocked?: boolean;
  canEditRules?: boolean;
  onToggle?: (enabled: boolean) => void;
  onRuleEdit?: (rule: ReplyRule) => void;
  onRuleDelete?: (rule: ReplyRule) => void;
  onAddRule?: () => void;
  onToneChange?: (tone: string) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onNeedReviewChange?: (
    type: 'question' | 'negative',
    checked: boolean,
  ) => void;
  onAutoDeleteChange?: (checked: boolean) => void;
};

const typeIcons = {
  positive: IconPositive,
  negative: IconNegative,
  neutral: IconNeutral,
  question: IconQuestion,
};

const typeLabels = {
  positive: '正面',
  negative: '负面',
  neutral: '中性',
  question: '提问',
};

const ReplyRulesSettings: FC<Props> = ({
  loading,
  enabled = true,
  rules = [],
  tone = 'friendly',
  toneOptions = [],
  needReviewForQuestion = true,
  needReviewForNegative = true,
  blockedKeywords = [],
  autoDeleteBlocked = true,
  canEditRules = true,
  onToggle,
  onRuleEdit,
  onRuleDelete,
  onAddRule,
  onToneChange,
  onKeywordAdd,
  onKeywordRemove,
  onNeedReviewChange,
  onAutoDeleteChange,
}) => {
  const [keywordModalOpen, setKeywordModalOpen] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState('');

  const handleKeywordSubmit = () => {
    const k = keywordDraft.trim();
    if (!k) return;
    onKeywordAdd?.(k);
    setKeywordDraft('');
    setKeywordModalOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>回复规则设置</span>
        <div className={styles.switchArea}>
          <span className={styles.switchLabel}>自动回复开关</span>
          <Switch
            checked={enabled}
            loading={loading}
            disabled={loading}
            onChange={onToggle}
          />
          <span className={styles.switchStatus}>
            {enabled ? '已开启' : '已关闭'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingHint}>加载规则与关键词…</div>
      ) : null}

      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span className={styles.colType}>评论类型</span>
          <span className={styles.colKeywords}>关键词</span>
          <span className={styles.colTemplate}>回复模板</span>
          {canEditRules ? <span className={styles.colAction}>操作</span> : null}
        </div>
        {rules.map((rule) => {
          const Icon = typeIcons[rule.type];
          const typeClass =
            `type${(rule.type?.charAt(0)?.toUpperCase() ?? '') + (rule.type?.slice(1) ?? '')}` as const;
          return (
            <div key={rule.id} className={styles.tableRow}>
              <div className={styles.colType}>
                <span className={`${styles.typeTag} ${styles[typeClass]}`}>
                  <img src={Icon} alt="" className={styles.typeIcon} />
                  {typeLabels[rule.type]}
                </span>
              </div>
              <div className={styles.colKeywords}>
                {rule.keywords?.map((kw) => (
                  <span key={kw} className={styles.keyword}>
                    {kw}
                  </span>
                ))}
              </div>
              <div className={styles.colTemplate}>
                <span className={styles.templateBox}>{rule.template}</span>
              </div>
              {canEditRules ? (
                <div className={styles.colAction}>
                  <span
                    className={styles.editBtn}
                    onClick={() => {
                      onRuleEdit?.(rule);
                    }}
                  >
                    <img src={EditIcon} alt="" className={styles.editIcon} />
                    编辑
                  </span>
                  {!rule.id.startsWith('rule-') && (
                    <span
                      className={styles.deleteBtn}
                      onClick={() => {
                        onRuleDelete?.(rule);
                      }}
                    >
                      <img
                        src={DeleteIcon}
                        alt=""
                        className={styles.deleteIcon}
                      />
                      删除
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
        {canEditRules ? (
          <span className={styles.addBtn} onClick={onAddRule}>
            <img src={AddIcon} alt="" className={styles.addIcon} />
            添加回复规则
          </span>
        ) : null}
      </div>

      <div className={styles.toneSection}>
        <span className={styles.sectionLabel}>回复语气：</span>
        <div className={styles.toneOptions}>
          {toneOptions.map((opt) => (
            <span
              key={opt.code}
              className={`${styles.toneOpt} ${tone === opt.code ? styles.toneOptActive : ''}`}
              onClick={() => onToneChange?.(opt.code)}
            >
              {opt.displayName}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.interventionSection}>
        <div className={styles.interventionHeader}>人工干预设置：</div>
        <div className={styles.interventionOptions}>
          <Checkbox
            checked={needReviewForQuestion}
            onChange={(e) => onNeedReviewChange?.('question', e.target.checked)}
          >
            提问类评论需人工审核后发送
          </Checkbox>
          <Checkbox
            checked={needReviewForNegative}
            onChange={(e) => onNeedReviewChange?.('negative', e.target.checked)}
          >
            负面评论需人工审核后发送
          </Checkbox>
        </div>
        <span className={styles.hint}>（默认勾选）</span>
      </div>

      <div className={styles.keywordSection}>
        <span className={styles.sectionLabel}>关键词屏蔽：</span>
        <div className={styles.keywordTags}>
          {blockedKeywords.map((kw) => (
            <span key={kw.keywordId} className={styles.keywordTag}>
              {kw.keyword}
              <img
                src={CloseIcon}
                alt=""
                className={styles.closeIcon}
                onClick={() => onKeywordRemove?.(kw.keywordId)}
              />
            </span>
          ))}
          <Button
            type="dashed"
            className={styles.addKeywordBtn}
            onClick={() => setKeywordModalOpen(true)}
          >
            <img src={AddIcon} alt="" className={styles.addIcon} />
            添加
          </Button>
        </div>
        <Checkbox
          checked={autoDeleteBlocked}
          onChange={(e) => onAutoDeleteChange?.(e.target.checked)}
        >
          自动删除命中屏蔽词的评论（无需人工确认）
        </Checkbox>
      </div>

      <Modal
        title="添加屏蔽词"
        open={keywordModalOpen}
        okText="确定"
        cancelText="取消"
        onOk={handleKeywordSubmit}
        onCancel={() => {
          setKeywordModalOpen(false);
          setKeywordDraft('');
        }}
      >
        <Input
          placeholder="输入关键词"
          value={keywordDraft}
          onChange={(e) => setKeywordDraft(e.target.value)}
          maxLength={32}
          onPressEnter={handleKeywordSubmit}
        />
      </Modal>
    </div>
  );
};

export default ReplyRulesSettings;
