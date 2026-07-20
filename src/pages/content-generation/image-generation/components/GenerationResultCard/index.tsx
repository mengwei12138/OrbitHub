import type React from 'react';
import type { GenerationResult } from '../../types';
import styles from './style.module.css';

export interface GenerationResultCardProps {
  visible: boolean;
  result?: GenerationResult;
  onClose?: () => void;
  onGoWorks?: () => void;
  onRegenerate?: () => void;
  onPublish?: () => void;
  onCopy?: () => void;
}

export const GenerationResultCard: React.FC<GenerationResultCardProps> = ({
  visible,
  result,
  onClose,
  onGoWorks,
  onRegenerate,
  onPublish,
  onCopy,
}) => {
  if (!visible) return null;

  const defaultResult: GenerationResult = {
    id: '1',
    title: '救命！这套也太温柔了吧～奶油白+雾霾蓝真的显白',
    content:
      '姐妹们听我劝！这个春天一定要试试奶油白+雾霾蓝的搭配，真的显白到发光！温柔色系 yyds，黄皮也能轻松驾驭～推荐这个搭配给所有姐妹，真的谁穿谁好看！',
    tags: ['#春日穿搭', '#温柔色系', '#显白穿搭', '#奶油白', '#雾霾蓝'],
    images: [],
    createdAt: new Date(),
  };

  const displayResult = result || defaultResult;

  return (
    <div className={styles.cardOverlay}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>图文生成完成</span>
          <span className={styles.closeButton} onClick={onClose}>
            ✕
          </span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.resultsArea}>
            <div className={styles.resultsTitle}>AI 生成结果</div>
            <div className={styles.section}>
              <div className={styles.sectionTag}>标题</div>
              <div className={styles.sectionContent}>{displayResult.title}</div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTag}>正文</div>
              <div className={styles.contentText}>{displayResult.content}</div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTag}>标签</div>
              <div className={styles.tagsFlow}>
                {displayResult.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <button className={styles.button} onClick={onGoWorks}>
            去作品管理
          </button>
          <button className={styles.button} onClick={onRegenerate}>
            重新生成
          </button>
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={onPublish}
          >
            去发布
          </button>
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={onCopy}
          >
            复制内容
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerationResultCard;
