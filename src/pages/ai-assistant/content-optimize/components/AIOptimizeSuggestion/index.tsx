import { useEffect, useMemo, useState } from 'react';

import ActionsSection from './components/ActionsSection';
import Header from './components/Header';
import LoadingSkeleton from './components/LoadingSkeleton';
import ProblemSection from './components/ProblemSection';
import SensitiveBanner from './components/SensitiveBanner';
import SuggestionTagsSection from './components/SuggestionTagsSection';
import SuggestionTitleSection from './components/SuggestionTitleSection';
import styles from './style.module.css';

type ApplyData = {
  title: string;
  tags: string[];
  contentId: string;
};

type CardStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'timeout'
  | 'sensitive';

type PlatformCode = 'douyin' | 'xiaohongshu';

type AIOptimizeSuggestionProps = {
  contentId: string;
  originalTitle: string;
  platform?: PlatformCode;
  problemAnalysis?: string;
  suggestedTitle?: string;
  suggestedTags?: string[];
  status?: CardStatus;
  applyLoading?: boolean;
  onApply: (data: ApplyData) => void;
  onClose: () => void;
  onRetry?: () => void;
};

const AIOptimizeSuggestion = ({
  contentId,
  originalTitle,
  platform,
  problemAnalysis,
  suggestedTitle,
  suggestedTags,
  status: externalStatus,
  applyLoading = false,
  onApply,
  onClose,
  onRetry,
}: AIOptimizeSuggestionProps) => {
  const [editedTitle, setEditedTitle] = useState(suggestedTitle ?? '');
  const [editedTags, setEditedTags] = useState<string[]>(suggestedTags ?? []);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (suggestedTags && suggestedTags.length > 0) {
      setEditedTags(suggestedTags);
    }
  }, [suggestedTags]);

  const status = externalStatus ?? 'success';

  const maxTags = useMemo(() => {
    return platform === 'xiaohongshu' ? 10 : 5;
  }, [platform]);

  const handleRestoreTitle = () => {
    setEditedTitle(originalTitle);
    setIsEditing(false);
  };

  const handleEditTitle = (value: string) => {
    setEditedTitle(value);
    setIsEditing(true);
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...editedTags];
    newTags.splice(index, 1);
    setEditedTags(newTags);
  };

  const handleAddTag = (tag: string) => {
    if (editedTags.length < maxTags) {
      setEditedTags([...editedTags, tag]);
    }
  };

  const handleEditTag = (index: number, newTag: string) => {
    const newTags = [...editedTags];
    newTags[index] = newTag;
    setEditedTags(newTags);
  };

  const handleApply = () => {
    const finalTitle = editedTitle || suggestedTitle || '';
    const finalTags = editedTags.length > 0 ? editedTags : suggestedTags || [];
    onApply({
      title: finalTitle,
      tags: finalTags,
      contentId,
    });
  };

  const isSensitive = status === 'sensitive';
  const showSkeleton = status === 'loading';
  const showContent = status === 'success' || status === 'sensitive';

  return (
    <div
      className={`${styles.card} ${isSensitive ? styles.cardSensitive : ''}`}
    >
      {showSkeleton && <LoadingSkeleton />}

      {showContent && (
        <>
          {isSensitive && <SensitiveBanner />}
          <Header title={originalTitle} onClose={onClose} />
          <ProblemSection content={problemAnalysis || ''} />
          <SuggestionTitleSection
            title={editedTitle || suggestedTitle || ''}
            originalTitle={originalTitle}
            onEdit={handleEditTitle}
            onRestore={handleRestoreTitle}
          />
          <SuggestionTagsSection
            tags={editedTags}
            isEditing={isEditing}
            platform={platform}
            maxTags={maxTags}
            onRemove={handleRemoveTag}
            onAdd={handleAddTag}
            onEdit={handleEditTag}
          />
          <ActionsSection
            isSensitive={isSensitive}
            applyLoading={applyLoading}
            onApply={handleApply}
          />
        </>
      )}

      {status === 'error' && (
        <>
          <Header title={originalTitle} onClose={onClose} />
          <button
            type="button"
            className={styles.errorMessage}
            onClick={onRetry}
          >
            生成失败，点击重试
          </button>
        </>
      )}

      {status === 'timeout' && (
        <>
          <Header title={originalTitle} onClose={onClose} />
          <button
            type="button"
            className={styles.timeoutMessage}
            onClick={onRetry}
          >
            生成超时，点击重试
          </button>
        </>
      )}
    </div>
  );
};

export default AIOptimizeSuggestion;
