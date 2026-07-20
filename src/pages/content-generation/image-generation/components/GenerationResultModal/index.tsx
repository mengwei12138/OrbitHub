import { Modal, message } from 'antd';
import type React from 'react';
import { copyToClipboard } from '@/utils';
import type { GenerationResult, ImageCount } from '../../types';
import styles from './style.module.css';

export interface GenerationResultModalProps {
  visible: boolean;
  result?: GenerationResult;
  /** 决定渲染含图布局 (1) 还是纯文案布局 (0)。 */
  imageCount: ImageCount;
  onClose?: () => void;
  onGoWorks?: () => void;
  onRegenerate?: () => void;
  onPublish?: () => void;
}

const PLACEHOLDER_RESULT: GenerationResult = {
  id: 'placeholder',
  title: '',
  content: '',
  tags: [],
  images: [],
  createdAt: new Date(),
};

export const GenerationResultModal: React.FC<GenerationResultModalProps> = ({
  visible,
  result,
  imageCount,
  onClose,
  onGoWorks,
  onRegenerate,
  onPublish,
}) => {
  const displayResult = result ?? PLACEHOLDER_RESULT;
  const hasImage = imageCount === 1 && (displayResult.images?.length ?? 0) > 0;
  const firstImage = hasImage ? displayResult.images[0] : undefined;

  const handleCopy = async () => {
    const text = displayResult.content || '';
    if (!text) {
      message.warning('暂无可复制的文本');
      return;
    }
    if (await copyToClipboard(text)) {
      message.success('已复制');
    } else {
      message.error('复制失败，请手动选择文本');
    }
  };

  const handleDownloadImage = () => {
    if (!firstImage) return;
    window.open(firstImage, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={hasImage ? 920 : 720}
      centered
      className={styles.modal}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>图文生成完成</span>
      </div>
      <div className={styles.cardBody}>
        <div className={hasImage ? styles.layoutWithImage : ''}>
          {hasImage && (
            <div className={styles.imageColumn}>
              <div className={styles.imagePreview}>
                <img
                  src={firstImage}
                  alt="生成配图"
                  className={styles.imageEl}
                />
              </div>
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton} ${styles.imageDownloadBtn}`}
                onClick={handleDownloadImage}
              >
                下载图片
              </button>
            </div>
          )}
          <div className={styles.resultsArea}>
            <div className={styles.resultsTitle}>AI 生成结果</div>
            {displayResult.title && (
              <div className={styles.section}>
                <div className={styles.sectionTag}>标题</div>
                <div className={styles.sectionContent}>
                  {displayResult.title}
                </div>
              </div>
            )}
            <div className={styles.section}>
              <div className={styles.sectionTag}>正文</div>
              <div className={styles.contentText}>{displayResult.content}</div>
            </div>
            {displayResult.tags.length > 0 && (
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
            )}
          </div>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <button type="button" className={styles.button} onClick={handleCopy}>
          复制文本
        </button>
        {hasImage && (
          <button
            type="button"
            className={styles.button}
            onClick={handleDownloadImage}
          >
            下载图片
          </button>
        )}
        <button
          type="button"
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={onPublish}
        >
          去发布
        </button>
        <button type="button" className={styles.button} onClick={onRegenerate}>
          重新生成
        </button>
        <button type="button" className={styles.button} onClick={onGoWorks}>
          去作品管理
        </button>
      </div>
    </Modal>
  );
};

export default GenerationResultModal;
