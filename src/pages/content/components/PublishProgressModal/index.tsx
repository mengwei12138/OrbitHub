import { message } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { CustomModal, CustomProgress } from '@/components';
import { usePublishJob } from '@/services/content';
import type { PublishJobProgressData } from '@/services/content/types';
import styles from './style.module.css';
import type {
  PublishProgressModalProps,
  PublishRecord,
  UIStatus,
} from './types';
import { buildPublishRecord, type mapStageToUIStatus } from './types';
import VerifyPanel from './VerifyPanel';

const STATUS_TEXT: Record<UIStatus, string> = {
  success: '成功',
  publishing: '发布中',
  queued: '排队中',
  failed: '失败',
};

const getStatusClass = (status: UIStatus) => {
  const classMap: Record<UIStatus, string> = {
    success: styles.statusSuccess,
    publishing: styles.statusPublishing,
    queued: styles.statusQueued,
    failed: styles.statusFailed,
  };
  return classMap[status];
};

type TableRowProps = {
  record: PublishRecord;
};

const TableRow: React.FC<TableRowProps> = ({ record }) => {
  return (
    <div className={styles.tableRow}>
      <div className={`${styles.tableCell} ${styles.tableCellAccount}`}>
        {record.accountName}
      </div>
      <div
        className={`${styles.tableCell} ${styles.tableCellStatus} ${getStatusClass(record.status)}`}
      >
        <span className={styles.statusDot} />
        {STATUS_TEXT[record.status]}
      </div>
      <div className={`${styles.tableCell} ${styles.tableCellExtension}`}>
        {record.extensionStatus ?? '无商品信息'}
        {record.extensionDetail && (
          <span className={styles.extensionDetail}>
            {record.extensionDetail}
          </span>
        )}
      </div>
      <div className={`${styles.tableCell} ${styles.tableCellDetail}`}>
        {record.detail}
      </div>
    </div>
  );
};

const isJobComplete = (data: PublishJobProgressData) =>
  data.jobStatus === 'COMPLETED' ||
  (data.succeededCount + data.failedCount === data.totalCount &&
    data.totalCount > 0);

const PublishProgressModal: React.FC<PublishProgressModalProps> = (props) => {
  const {
    open,
    jobId,
    onClose,
    onBackgroundRun,
    onVerifyRequired,
    onComplete,
    demoRecords,
  } = props;

  const [records, setRecords] = useState<PublishRecord[]>([]);

  const { data, isLoading } = usePublishJob(jobId ?? '');

  const needsVerify =
    data?.records.some((record) => !!record.verifyType) ?? false;

  useEffect(() => {
    if (demoRecords) {
      setRecords(demoRecords);
      return;
    }
    if (!data || !jobId) return;

    const mappedRecords: PublishRecord[] = data.records.map((record) =>
      buildPublishRecord(record),
    );
    setRecords(mappedRecords);
  }, [data, jobId, demoRecords]);

  useEffect(() => {
    if (!needsVerify || open) return;
    onVerifyRequired?.();
  }, [needsVerify, open, onVerifyRequired]);

  useEffect(() => {
    if (demoRecords) return;
    if (!open || !jobId || !data) return;

    if (isJobComplete(data)) {
      onComplete?.(data);
    }
  }, [open, jobId, onComplete, data, demoRecords]);

  const handleBackgroundRun = () => {
    if (records.some((record) => !!record.verifyType)) {
      message.warning(
        '当前需要二次验证，请先在弹窗内完成扫码或验证码后再后台运行',
      );
      return;
    }
    onBackgroundRun();
  };

  const total = records.length;
  const completed = records.filter(
    (r) => r.status === 'success' || r.status === 'failed',
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const renderHeader = () => (
    <div className={styles.header}>
      <h3 className={styles.title}>发布进度</h3>
      <button className={styles.backgroundBtn} onClick={handleBackgroundRun}>
        后台运行
      </button>
    </div>
  );

  if (!open) return null;

  return (
    <CustomModal
      open={open}
      title={renderHeader()}
      footer={null}
      modalProps={{
        onCancel: onClose,
      }}
      width={640}
      className={styles.modal}
      data-testid="publish-progress-modal"
    >
      <div className={styles.divider} />
      <VerifyPanel records={records} />
      <div className={styles.progressSection}>
        <span className={styles.progressLabel}>整体进度：</span>
        <CustomProgress
          type="line"
          percent={percent}
          strokeColor="var(--color-primary)"
          trailColor="var(--figma-color-gray-2)"
          showInfo={false}
          style={{ flex: 1 }}
          data-testid="progress-bar"
        />
        <span className={styles.progressCount}>
          {completed}/{total} 完成
        </span>
      </div>

      <div className={styles.tableHeader}>
        <div
          className={`${styles.tableHeaderCell} ${styles.tableHeaderAccount}`}
        >
          账号
        </div>
        <div
          className={`${styles.tableHeaderCell} ${styles.tableHeaderStatus}`}
        >
          状态
        </div>
        <div
          className={`${styles.tableHeaderCell} ${styles.tableHeaderExtension}`}
        >
          商品信息
        </div>
        <div
          className={`${styles.tableHeaderCell} ${styles.tableHeaderDetail}`}
        >
          详情/失败原因
        </div>
      </div>

      <div className={styles.tableBody} data-testid="status-list">
        {isLoading && records.length === 0 ? (
          <div className={styles.tableRow}>
            <div className={`${styles.tableCell} ${styles.tableCellDetail}`}>
              加载中...
            </div>
          </div>
        ) : (
          records.map((record) => <TableRow key={record.id} record={record} />)
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.hint}>
          请勿关闭弹窗，关闭之后弹窗将无法再次打开。
        </p>
      </div>
    </CustomModal>
  );
};

export default PublishProgressModal;

export type {
  buildPublishRecord,
  mapStageToUIStatus,
  PublishProgressModalProps,
  PublishRecord,
  UIStatus,
};
