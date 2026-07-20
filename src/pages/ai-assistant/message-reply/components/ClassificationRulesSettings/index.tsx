import type { FC } from 'react';

import styles from './style.module.css';

export type ClassificationType =
  | 'cooperation'
  | 'complaint'
  | 'product'
  | 'spam';

export type KeywordRule = {
  keywords: string[];
};

export type ReplyRule = {
  id: string;
  type: ClassificationType;
  label: string;
  keywords: string[];
  template: string;
  createdByName?: string | null;
  editable?: boolean;
};

export type Props = {
  title?: string;
  autoReplyEnabled?: boolean;
  rules?: ReplyRule[];
  importantTypes?: ClassificationType[];
  notificationMethods?: string[];
  canEditRules?: boolean;
  onAutoReplyToggle?: (enabled: boolean) => void;
  onRuleEdit?: (ruleId: string) => void;
  onAddRule?: () => void;
  onImportantTypesChange?: (types: ClassificationType[]) => void;
  onNotificationMethodsChange?: (methods: string[]) => void;
};

const TYPE_CONFIG: Record<
  ClassificationType,
  { label: string; bgColor: string; textColor: string; icon: string }
> = {
  cooperation: {
    label: '合作咨询',
    bgColor: '#E6FBFB',
    textColor: '#13C2C2',
    icon: '🤝',
  },
  complaint: {
    label: '投诉建议',
    bgColor: '#FFF2F0',
    textColor: '#FF4D4F',
    icon: '⚠️',
  },
  product: {
    label: '产品咨询',
    bgColor: '#F6F0FC',
    textColor: '#722ED1',
    icon: '💬',
  },
  spam: {
    label: '垃圾信息',
    bgColor: '#F5F5F5',
    textColor: '#8C8C8C',
    icon: '🚫',
  },
};

const ClassificationRulesSettings: FC<Props> = ({
  title = '分类与回复规则',
  autoReplyEnabled = true,
  rules = [],
  importantTypes = [],
  notificationMethods = ['站内通知'],
  canEditRules = true,
  onAutoReplyToggle,
  onRuleEdit,
  onAddRule,
  onImportantTypesChange,
  onNotificationMethodsChange,
}) => {
  const handleToggle = () => {
    onAutoReplyToggle?.(!autoReplyEnabled);
  };

  const handleImportantTypeToggle = (type: ClassificationType) => {
    if (importantTypes.includes(type)) {
      onImportantTypesChange?.(importantTypes.filter((t) => t !== type));
    } else {
      onImportantTypesChange?.([...importantTypes, type]);
    }
  };

  const handleNotificationToggle = (method: string) => {
    if (notificationMethods.includes(method)) {
      onNotificationMethodsChange?.(
        notificationMethods.filter((m) => m !== method),
      );
    } else {
      onNotificationMethodsChange?.([...notificationMethods, method]);
    }
  };

  const IMPORTANT_TYPES: ClassificationType[] = ['cooperation', 'complaint'];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.toggleArea}>
          <span className={styles.toggleLabel}>自动回复开关</span>
          <button
            className={autoReplyEnabled ? styles.toggleActive : styles.toggle}
            onClick={handleToggle}
          >
            <span className={styles.toggleDot} />
          </button>
          <span
            className={autoReplyEnabled ? styles.statusActive : styles.status}
          >
            {autoReplyEnabled ? '已开启' : '已关闭'}
          </span>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span className={styles.colClassification}>分类</span>
          <span className={styles.colKeywords}>关键词匹配</span>
          <span className={styles.colTemplate}>回复模板</span>
          {canEditRules ? <span className={styles.colAction}>操作</span> : null}
        </div>

        {rules.map((rule) => {
          const config = TYPE_CONFIG[rule.type];
          const displayLabel = rule.label ?? config.label;
          return (
            <div key={rule.id} className={styles.tableRow}>
              <span className={styles.colClassification}>
                <span
                  className={styles.classificationTag}
                  style={{
                    backgroundColor: config.bgColor,
                    color: config.textColor,
                  }}
                >
                  <span className={styles.tagIcon}>{config.icon}</span>
                  {displayLabel}
                </span>
              </span>
              <span className={styles.colKeywords}>
                {rule.keywords.map((kw) => (
                  <span key={kw} className={styles.keyword}>
                    {kw}
                  </span>
                ))}
              </span>
              <span className={styles.colTemplate}>
                <span className={styles.templateBox}>{rule.template}</span>
              </span>
              {canEditRules ? (
                <span className={styles.colAction}>
                  <button
                    className={styles.editBtn}
                    onClick={() => onRuleEdit?.(rule.id)}
                  >
                    <span className={styles.editIcon}>✎</span>
                    编辑
                  </button>
                </span>
              ) : null}
            </div>
          );
        })}

        {canEditRules ? (
          <button className={styles.addBtn} onClick={onAddRule}>
            <span className={styles.addIcon}>+</span>
            添加分类
          </button>
        ) : null}
      </div>

      <div className={styles.importantSection}>
        <span className={styles.sectionLabel}>重要私信标记：</span>
        <div className={styles.importantOptions}>
          {IMPORTANT_TYPES.map((type) => (
            <label key={type} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={importantTypes.includes(type)}
                onChange={() => handleImportantTypeToggle(type)}
              />
              <span className={styles.checkmark} />
              {TYPE_CONFIG[type].label}类私信标记为重要
            </label>
          ))}
        </div>
      </div>

      <div className={styles.notificationSection}>
        <div className={styles.notificationLabel}>
          <span className={styles.notificationIcon}>🔔</span>
          <span className={styles.sectionLabel}>通知方式：</span>
        </div>
        <div className={styles.notificationOptions}>
          {['站内通知', '短信', '邮件'].map((method) => (
            <button
              key={method}
              className={
                notificationMethods.includes(method)
                  ? styles.optionActive
                  : styles.option
              }
              onClick={() => handleNotificationToggle(method)}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassificationRulesSettings;
