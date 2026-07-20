import { Button, Empty, Modal, Upload } from 'antd';
import type { UploadProps } from 'antd';

import type { AiAssistantKnowledgeFile } from '@/services/ai-assistant';

import styles from '../../style.module.css';

type KnowledgeBaseModalProps = {
  open: boolean;
  uploading: boolean;
  files: AiAssistantKnowledgeFile[];
  deletingFileId?: string;
  onCancel: () => void;
  onUpload: (file: File) => void;
  onDelete: (fileId: string) => void;
};

const accept =
  '.doc,.docx,.pdf,.txt,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const KnowledgeBaseModal = ({
  open,
  uploading,
  files,
  deletingFileId,
  onCancel,
  onUpload,
  onDelete,
}: KnowledgeBaseModalProps) => {
  const uploadProps: UploadProps = {
    accept,
    beforeUpload: (file) => {
      onUpload(file as File);
      return false;
    },
    showUploadList: false,
  };

  return (
    <Modal
      destroyOnHidden
      centered
      width={720}
      open={open}
      title="管理知识库"
      footer={null}
      onCancel={onCancel}
    >
      <div className={styles.uploadActions}>
        <div className={styles.modalTip}>
          支持导入 Word、PDF、TXT 文件。上传后，OrbitHub AI 会按当前分组知识库口径进行回复。
        </div>
        <Upload {...uploadProps}>
          <Button type="primary" loading={uploading}>
            上传知识库文件
          </Button>
        </Upload>
      </div>
      <div className={styles.uploadList}>
        {files.length === 0 ? (
          <Empty description="当前分组还没有知识库文件" />
        ) : (
          files.map((file) => (
            <div key={file.id} className={styles.uploadItem}>
              <div className={styles.uploadItemMain}>
                <div className={styles.uploadItemName}>{file.fileName}</div>
                <div className={styles.uploadItemSummary}>
                  {file.summary}
                  <br />
                  {file.createdAt} · {Math.max(1, Math.round(file.fileSizeBytes / 1024))} KB
                </div>
              </div>
              <Button
                danger
                type="link"
                loading={deletingFileId === file.id}
                onClick={() => {
                  onDelete(file.id);
                }}
              >
                删除
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default KnowledgeBaseModal;
