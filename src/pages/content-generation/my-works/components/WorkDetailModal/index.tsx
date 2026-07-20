import { Modal } from 'antd';
import type { FC } from 'react';
import type { WorkItem } from '../../types';
import { canDownloadWork, isWorkActionDisabled } from '../../utils/workActions';
import WorkDetailContent from '../WorkDetailContent';
import styles from './style.module.css';

type WorkDetailModalProps = {
  open: boolean;
  work: WorkItem | undefined;
  onClose: () => void;
  onRegenerate: () => void;
  onPublish: () => void;
  onDownload: () => void;
};

const WorkDetailModal: FC<WorkDetailModalProps> = ({
  open,
  work,
  onClose,
  onRegenerate,
  onPublish,
  onDownload,
}) => {
  if (!work) return null;

  const actionsDisabled = isWorkActionDisabled(work);
  const canDownload = canDownloadWork(work);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      className={styles.modal}
    >
      <div className={styles.header}>
        <span className={styles.title}>作品详情</span>
        <span className={styles.closeBtn} onClick={onClose}>
          ✕
        </span>
      </div>

      <div className={styles.body}>
        <WorkDetailContent
          work={work}
          onDownload={onDownload}
          onPublish={onPublish}
          onRegenerate={onRegenerate}
          onClose={onClose}
          downloadDisabled={!canDownload}
          publishDisabled={actionsDisabled}
          regenerateDisabled={actionsDisabled}
        />
      </div>
    </Modal>
  );
};

export default WorkDetailModal;
