import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useRefreshQrCode, useSubmitVerifyCode } from '@/services/content';
import styles from './style.module.css';
import type { PublishRecord } from './types';

interface VerifyPanelProps {
  records: PublishRecord[];
}

/**
 * 二次验证子态面板（content-publish-verify-flow）。
 * 渲染条件：records 中存在 verifyType 非空者。
 * - sms: 6 位数字输入框 + 提交按钮 + verifyErrorCode 错误提示
 * - qr:  二维码图片 + 刷新按钮（点击后 disabled 30s）
 */
const VerifyPanel: React.FC<VerifyPanelProps> = ({ records }) => {
  const verifyRecords = records.filter((r) => !!r.verifyType);
  if (verifyRecords.length === 0) return null;

  return (
    <div
      className={styles.verifyPanel}
      data-testid="verify-panel"
      role="region"
      aria-label="二次验证"
    >
      {verifyRecords.map((record) =>
        record.verifyType === 'sms' ? (
          <SmsCard key={record.id} record={record} />
        ) : (
          <QrCard key={record.id} record={record} />
        ),
      )}
    </div>
  );
};

export default VerifyPanel;

// ────────── SMS Card ──────────

interface CardProps {
  record: PublishRecord;
}

const SmsCard: React.FC<CardProps> = ({ record }) => {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useSubmitVerifyCode();
  const inputRef = useRef<HTMLInputElement>(null);
  const prevVerifyErrorCodeRef = useRef<string | null>(null);

  // 当 backend 通过轮询透出 SMS_CODE_ERROR 时清空输入并提示
  useEffect(() => {
    const current = record.verifyErrorCode ?? null;
    if (
      current === 'SMS_CODE_ERROR' &&
      current !== prevVerifyErrorCodeRef.current
    ) {
      setCode('');
      setLocalError('验证码错误，请重新输入');
      inputRef.current?.focus();
    }
    prevVerifyErrorCodeRef.current = current;
  }, [record.verifyErrorCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/gu, '').slice(0, 6);
    setCode(sanitized);
    if (localError) setLocalError(null);
  };

  const handleSubmit = async () => {
    if (code.length !== 6 || isPending) return;
    try {
      await mutateAsync({ recordId: record.id, data: { code } });
      // 保持 UI 等下次 publishJob 轮询推进（5s 加速）
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : '提交失败，请重试';
      setLocalError(msg);
    }
  };

  const disabled = code.length !== 6 || isPending;

  return (
    <div
      className={styles.verifyCard}
      data-testid={`verify-card-sms-${record.id}`}
      data-verify-type="sms"
    >
      <div className={styles.verifyCardHeader}>
        <span className={styles.verifyCardIcon} aria-hidden="true">
          📱
        </span>
        <span>
          账号 <strong>{record.accountName}</strong> 需要短信验证码
        </span>
      </div>
      <div className={styles.verifyCardBody}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="请输入 6 位验证码"
          value={code}
          onChange={handleChange}
          disabled={isPending}
          className={styles.verifyInput}
          data-testid={`verify-input-${record.id}`}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className={styles.verifySubmitBtn}
          data-testid={`verify-submit-${record.id}`}
        >
          {isPending ? '提交中...' : '提交'}
        </button>
      </div>
      {localError && (
        <div
          className={styles.verifyError}
          data-testid={`verify-error-${record.id}`}
        >
          {localError}
        </div>
      )}
    </div>
  );
};

// ────────── QR Card ──────────

const QR_REFRESH_COOLDOWN_SECONDS = 30;

const QrCard: React.FC<CardProps> = ({ record }) => {
  const [cooldown, setCooldown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useRefreshQrCode();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(
      () => setCooldown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleRefresh = async () => {
    if (cooldown > 0 || isPending) return;
    setCooldown(QR_REFRESH_COOLDOWN_SECONDS);
    setLocalError(null);
    try {
      await mutateAsync({ recordId: record.id });
      // SUCCEEDED 时 publishJob 下次轮询会移除 verifyType，UI 自动切回普通态
      // QR_VERIFY_REQUIRED 时 backend 已更新 Redis，下次 publishJob 轮询拿到新 src
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : '刷新失败，请稍后重试';
      setLocalError(
        msg.includes('QR_REFRESH_TIMEOUT')
          ? '刷新超时，请稍后重试'
          : '刷新失败，请稍后重试',
      );
    }
  };

  const buttonDisabled = cooldown > 0 || isPending;
  const buttonLabel =
    cooldown > 0
      ? `刷新中... ${cooldown}s`
      : isPending
        ? '刷新中...'
        : '刷新二维码';

  return (
    <div
      className={styles.verifyCard}
      data-testid={`verify-card-qr-${record.id}`}
      data-verify-type="qr"
    >
      <div className={styles.verifyCardHeader}>
        <span className={styles.verifyCardIcon} aria-hidden="true">
          📷
        </span>
        <span>
          账号 <strong>{record.accountName}</strong> 需要扫码验证
        </span>
      </div>
      <div className={styles.verifyCardBody}>
        {record.qrCodeSrc ? (
          <img
            src={record.qrCodeSrc}
            alt="扫码验证二维码"
            className={styles.verifyQrImage}
            data-testid={`verify-qr-image-${record.id}`}
          />
        ) : (
          <div className={styles.verifyQrPlaceholder}>二维码加载中...</div>
        )}
        <div className={styles.verifyQrSide}>
          <p className={styles.verifyQrHint}>请使用抖音 APP 扫码完成验证</p>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={buttonDisabled}
            className={styles.verifySubmitBtn}
            data-testid={`verify-qr-refresh-${record.id}`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
      {localError && (
        <div
          className={styles.verifyError}
          data-testid={`verify-error-${record.id}`}
        >
          {localError}
        </div>
      )}
    </div>
  );
};
