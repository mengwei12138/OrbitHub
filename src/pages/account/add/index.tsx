import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Alert, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomSteps } from '@/components';
import {
  ACCOUNT_LOGIN_PLATFORM_OPTIONS,
  reactivateInitQueryOptions,
  useInitQrLogin,
  useLoginStatus,
  useRefreshQrCode,
  useSubmitLoginAuth,
} from '@/services/account';
import type {
  AccountLoginPlatformOption,
  LoginNextAuthStep,
  LoginSessionStatusCode,
} from '@/services/account/types';
import { myQuotaStatusQueryOptions } from '@/services/admin-user-quota';
import { formatDuration } from '@/utils/number';
import LoginProcessingModal from './components/LoginProcessingModal';
import styles from './style.module.css';

type FormData = {
  platform: string;
  authCode: string;
};

type AddAccountStep = 'PLATFORM' | 'LOGIN_AUTH';

const STEPS = [
  { title: '选择平台' },
  { title: '登录认证' },
];

const STEP_INDEX_MAP: Record<AddAccountStep, number> = {
  PLATFORM: 0,
  LOGIN_AUTH: 1,
};

const AccountAdd: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const mode = searchParams.get('mode');
  const reactivateAccountId = searchParams.get('accountId');
  const isReactivate = mode === 'reactivate' && !!reactivateAccountId;
  const [form] = ProForm.useForm<FormData>();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentStep, setCurrentStep] = useState<AddAccountStep>('PLATFORM');
  const [sessionId, setSessionId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [expireSeconds, setExpireSeconds] = useState(40);
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [nextAuthStep, setNextAuthStep] = useState<LoginNextAuthStep | null>(
    null,
  );
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authContextReady, setAuthContextReady] = useState(false);
  const [pendingAuthConfirmation, setPendingAuthConfirmation] = useState(false);
  const [reactivateNickname, setReactivateNickname] = useState('');
  const [loginProcessingVisible, setLoginProcessingVisible] = useState(false);
  const selectedPlatform = ProForm.useWatch('platform', form);

  const reactivateInitQuery = useQuery({
    ...reactivateInitQueryOptions(reactivateAccountId ?? ''),
    enabled: isReactivate,
  });
  const quotaStatusQuery = useQuery({
    ...myQuotaStatusQueryOptions(),
    enabled: !isReactivate,
  });

  const quotaExhausted =
    !isReactivate &&
    !!quotaStatusQuery.data &&
    !quotaStatusQuery.data.unlimited &&
    (quotaStatusQuery.data.available ?? 0) <= 0;
  const quotaStatusLoading = !isReactivate && quotaStatusQuery.isLoading;
  const quotaStatusErrorMessage = !isReactivate
    ? ((quotaStatusQuery.error as { message?: string } | null)?.message ?? null)
    : null;
  const selectedPlatformOption = ACCOUNT_LOGIN_PLATFORM_OPTIONS.find(
    (item) => item.value === selectedPlatform,
  );
  const selectedPlatformUnavailable =
    selectedPlatformOption?.availability === 'disabled';
  const selectedPlatformUnavailableMessage =
    selectedPlatformOption?.disabledReason ?? null;
  const platformCapabilityErrorMessage = isReactivate
    ? selectedPlatformUnavailableMessage
      ? `当前账号所属平台${selectedPlatformOption?.label ?? ''}${selectedPlatformUnavailableMessage}，暂不支持重新登录。`
      : null
    : selectedPlatformUnavailableMessage;

  const initQrLoginMutation = useInitQrLogin();
  const refreshQrCodeMutation = useRefreshQrCode();
  const submitLoginAuthMutation = useSubmitLoginAuth();
  const loginStatusQuery = useLoginStatus(sessionId, {
    enabled:
      !!sessionId &&
      currentStep === 'LOGIN_AUTH' &&
      !authContextReady &&
      !pendingAuthConfirmation &&
      expireSeconds > 0,
  });

  const assertQuotaBeforeAction = useCallback((): boolean => {
    if (isReactivate) return true;
    if (quotaStatusLoading) {
      messageApi.warning('正在加载配额信息，请稍后重试');
      return false;
    }
    if (quotaStatusErrorMessage) {
      messageApi.error(`配额信息加载失败：${quotaStatusErrorMessage}`);
      return false;
    }
    if (quotaExhausted) {
      const quota = quotaStatusQuery.data?.personalQuota ?? 0;
      const bound = quotaStatusQuery.data?.currentBoundCount ?? 0;
      messageApi.error(
        `社交账号配额已用尽（个人上限 ${quota}，已绑定 ${bound}），请联系租户管理员上调。`,
      );
      return false;
    }
    return true;
  }, [
    isReactivate,
    messageApi,
    quotaExhausted,
    quotaStatusErrorMessage,
    quotaStatusLoading,
    quotaStatusQuery.data,
  ]);

  const clearScanSession = useCallback(() => {
    setSessionId('');
    setQrCodeUrl('');
    setExpireSeconds(40);
    setNextAuthStep(null);
    setMaskedPhone(null);
    setAuthMessage(null);
    setAuthContextReady(false);
    setPendingAuthConfirmation(false);
  }, []);

  useEffect(() => {
    if (!isReactivate) return;
    const data = reactivateInitQuery.data;
    if (!data) return;
    setReactivateNickname(data.nickname || '');
    setCurrentPlatform(data.platform);
    form.setFieldsValue({
      platform: data.platform,
    });
  }, [form, isReactivate, reactivateInitQuery.data]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (
      currentStep === 'LOGIN_AUTH' &&
      qrCodeUrl &&
      expireSeconds > 0 &&
      !authContextReady &&
      !pendingAuthConfirmation
    ) {
      timer = setInterval(() => {
        setExpireSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            message.warning('二维码已过期，请刷新重试');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [
    authContextReady,
    currentStep,
    expireSeconds,
    pendingAuthConfirmation,
    qrCodeUrl,
  ]);

  useEffect(() => {
    const data = loginStatusQuery.data;
    if (!data) return;
    const status = data.status as LoginSessionStatusCode;
    if (status === 'SUCCESS') {
      messageApi.success(isReactivate ? '重新登录成功' : '账号添加成功');
      navigate(from === 'datacenter' ? '/datacenter' : '/account');
      return;
    }
    if (status === 'NEED_AUTH') {
      setPendingAuthConfirmation(true);
      setNextAuthStep(data.nextAuthStep ?? 'OTHER');
      setMaskedPhone(data.maskedPhone ?? null);
      setAuthMessage(data.authMessage ?? null);
      return;
    }
    if (status === 'EXPIRED') {
      messageApi.error('二维码已过期，请刷新重试');
      return;
    }
    if (status === 'FAILED') {
      messageApi.error('登录失败，请重新扫码');
    }
  }, [
    from,
    isReactivate,
    loginStatusQuery.data,
    messageApi,
    navigate,
  ]);

  const handleStartScan = useCallback(async () => {
    if (!assertQuotaBeforeAction()) return;
    const { platform } = form.getFieldsValue(['platform']);
    if (!platform) {
      messageApi.error('请选择平台');
      return;
    }
    const platformOption = ACCOUNT_LOGIN_PLATFORM_OPTIONS.find(
      (item) => item.value === platform,
    );
    if (platformOption?.availability === 'disabled') {
      messageApi.error(platformOption.disabledReason ?? '当前平台暂不可用');
      return;
    }
    try {
      const result = await initQrLoginMutation.mutateAsync({
        platform,
        accountId: isReactivate ? (reactivateAccountId ?? undefined) : undefined,
      });
      setCurrentPlatform(platform);
      setSessionId(result.sessionId);
      setQrCodeUrl(result.qrCodeUrl);
      setExpireSeconds(result.expireSeconds);
      setNextAuthStep(result.nextAuthStep);
      setAuthContextReady(false);
      setPendingAuthConfirmation(false);
      setCurrentStep('LOGIN_AUTH');
      messageApi.success('二维码已生成，请扫码继续');
    } catch (error) {
      const err = error as { message?: string };
      messageApi.error(err.message || '生成二维码失败，请重试');
    }
  }, [
    assertQuotaBeforeAction,
    form,
    initQrLoginMutation,
    isReactivate,
    messageApi,
    reactivateAccountId,
  ]);

  const handleRefreshQrCode = useCallback(async () => {
    if (!sessionId) return;
    try {
      const result = await refreshQrCodeMutation.mutateAsync({ sessionId });
      setQrCodeUrl(result.qrCodeUrl ?? '');
      setExpireSeconds(result.expireSeconds ?? 40);
      messageApi.success('二维码已刷新');
    } catch (error) {
      const err = error as { message?: string };
      messageApi.error(err.message || '刷新失败，请重试');
    }
  }, [messageApi, refreshQrCodeMutation, sessionId]);

  const handleConfirmContinue = useCallback(() => {
    if (!sessionId || !nextAuthStep) {
      messageApi.error('请先完成扫码登录');
      return;
    }
    if (nextAuthStep === 'NONE') {
      messageApi.success(isReactivate ? '重新登录成功' : '账号添加成功');
      navigate(from === 'datacenter' ? '/datacenter' : '/account');
      return;
    }
    setPendingAuthConfirmation(false);
    setAuthContextReady(true);
  }, [from, isReactivate, messageApi, navigate, nextAuthStep, sessionId]);

  const handleSubmitAuth = useCallback(async () => {
    if (!assertQuotaBeforeAction()) return false;
    if (!sessionId || !nextAuthStep || nextAuthStep === 'NONE') {
      messageApi.error('请先完成登录认证');
      return false;
    }
    if (nextAuthStep === 'OTHER') {
      messageApi.info('请先在手机端完成额外认证');
      return false;
    }
    const authCode = form.getFieldValue('authCode');
    if (!authCode) {
      messageApi.error('请输入验证码');
      return false;
    }
    setLoginProcessingVisible(true);
    try {
      await submitLoginAuthMutation.mutateAsync({
        sessionId,
        authType: 'SMS',
        code: authCode,
        accountId: isReactivate ? (reactivateAccountId ?? undefined) : undefined,
      });
      messageApi.success(isReactivate ? '重新登录成功' : '账号添加成功');
      navigate(from === 'datacenter' ? '/datacenter' : '/account');
      return true;
    } catch (error) {
      const err = error as { message?: string };
      messageApi.error(err.message || '认证失败，请重试');
      return false;
    } finally {
      setLoginProcessingVisible(false);
    }
  }, [
    assertQuotaBeforeAction,
    form,
    from,
    isReactivate,
    messageApi,
    navigate,
    nextAuthStep,
    reactivateAccountId,
    sessionId,
    submitLoginAuthMutation,
  ]);

  const handleCancel = useCallback(() => {
    navigate(from === 'datacenter' ? '/datacenter' : '/account');
  }, [from, navigate]);

  const reactivateInitError = isReactivate
    ? ((reactivateInitQuery.error as { message?: string } | null)?.message ??
      null)
    : null;

  const renderQrCodeContent = () => {
    if (initQrLoginMutation.isPending || refreshQrCodeMutation.isPending) {
      return (
        <div className={styles.qrCodePlaceholder}>
          <span>加载中...</span>
        </div>
      );
    }
    if (!qrCodeUrl) {
      return (
        <div className={styles.qrCodePlaceholder}>
          <span>二维码生成中</span>
          <span>请稍候...</span>
        </div>
      );
    }
    return <img src={qrCodeUrl} alt="二维码" className={styles.qrImage} />;
  };

  return (
    <div className={styles.container}>
      {contextHolder}
      <LoginProcessingModal visible={loginProcessingVisible} />
      <div className={styles.stepsWrapper}>
        <CustomSteps current={STEP_INDEX_MAP[currentStep]} items={STEPS} />
      </div>

      {currentStep === 'PLATFORM' && (
        <div className={styles.formCard}>
          <h2 className={styles.title}>选择平台</h2>
          <p className={styles.description}>
            先选择平台，再按平台要求完成登录认证
          </p>

          <Alert
            className={styles.alert}
            message={
              reactivateInitError
                ? `账号信息加载失败：${reactivateInitError}`
                : platformCapabilityErrorMessage
                  ? platformCapabilityErrorMessage
                  : isReactivate
                  ? `正在为账号「${reactivateNickname || ''}」重新登录，平台已锁定`
                  : quotaExhausted
                    ? `社交账号配额已用尽（个人上限 ${quotaStatusQuery.data?.personalQuota ?? 0}，已绑定 ${quotaStatusQuery.data?.currentBoundCount ?? 0}），请联系租户管理员上调。`
                    : '请选择可用平台，点击下一步后进入登录认证；扫码后如有需要，再完成手机号验证码认证。'
            }
            type={
              reactivateInitError ||
              quotaExhausted ||
              !!platformCapabilityErrorMessage
                ? 'error'
                : 'info'
            }
            showIcon
          />

          <ProForm<FormData>
            form={form}
            layout="vertical"
            submitter={false}
            className={styles.form}
          >
            <ProFormSelect
              name="platform"
              label="平台"
              rules={[{ required: true, message: '请选择平台' }]}
              options={ACCOUNT_LOGIN_PLATFORM_OPTIONS.map(
                (item: AccountLoginPlatformOption) => ({
                  label:
                    item.availability === 'disabled'
                      ? `${item.label}（${item.disabledReason}）`
                      : item.label,
                  value: item.value,
                  disabled: item.availability === 'disabled',
                }),
              )}
              placeholder="请选择平台"
              disabled={isReactivate}
            />
          </ProForm>

          <div className={styles.footer}>
            <div className={styles.divider} />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancel}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.nextBtn}
                onClick={handleStartScan}
                disabled={
                  initQrLoginMutation.isPending ||
                  quotaExhausted ||
                  selectedPlatformUnavailable
                }
              >
                下一步
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'LOGIN_AUTH' && (
        <div className={styles.formCard}>
          <h2 className={styles.title}>登录认证</h2>
          <p className={styles.description}>
            {pendingAuthConfirmation
              ? '扫码已完成，请确认后进入后续认证'
              : authContextReady
              ? '扫码已完成，如平台要求，请继续完成二次认证'
              : '请先使用手机扫码登录；扫码后如有需要，将继续进行二次认证'}
          </p>

          <Alert
            className={styles.alert}
            message={
              pendingAuthConfirmation
                ? authMessage ?? '已获取后续认证上下文，点击确认后继续。'
                : !authContextReady
                ? '请使用对应平台 App 扫码，完成登录确认后继续下一步。'
                : nextAuthStep === 'SMS'
                ? `验证码已发送至绑定手机号 ${maskedPhone ?? ''}`
                : authMessage ?? '请在手机端完成额外安全认证'
            }
            type="info"
            showIcon
          />

          {!authContextReady && (
            <>
              <div className={styles.qrCodeWrapper}>
                <div className={styles.qrCode}>{renderQrCodeContent()}</div>
              </div>

              {!!qrCodeUrl && !pendingAuthConfirmation && (
                <>
                  <button
                    type="button"
                    className={styles.refreshButton}
                    onClick={handleRefreshQrCode}
                  >
                    <span>刷新二维码</span>
                  </button>

                  <div className={styles.timerWrapper}>
                    <span className={styles.timerText}>二维码有效剩余 </span>
                    <span className={styles.timerValue}>
                      {formatDuration(expireSeconds)}
                    </span>
                  </div>

                  <p className={styles.scanHint}>使用手机 App 扫码</p>
                  <p className={styles.scanGuide}>
                    打开
                    {ACCOUNT_LOGIN_PLATFORM_OPTIONS.find(
                      (p) => p.value === currentPlatform,
                    )
                      ?.label ?? currentPlatform}{' '}
                    App → 首页右上角扫一扫 → 扫描上方二维码
                  </p>
                </>
              )}

              {!!sessionId &&
                !pendingAuthConfirmation &&
                loginStatusQuery.data?.status === 'WAITING_SCAN' && (
                  <div className={styles.loadingState}>
                    <span className={styles.loadingText}>等待扫码结果…</span>
                    <span className={styles.loadingHint}>
                      扫码成功后，如有需要将继续进入二次认证，请勿关闭本页面
                    </span>
                  </div>
                )}

              {pendingAuthConfirmation && (
                <div className={styles.loadingState}>
                  <span className={styles.loadingText}>扫码已成功</span>
                  <span className={styles.loadingHint}>
                    为避免评审过程自动跳转，请点击确认后再进入后续认证。
                  </span>
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={handleConfirmContinue}
                  >
                    确认进入后续认证
                  </button>
                </div>
              )}
            </>
          )}

          {authContextReady && nextAuthStep === 'SMS' ? (
            <ProForm<FormData>
              form={form}
              layout="vertical"
              submitter={false}
              onFinish={handleSubmitAuth}
              className={styles.form}
            >
              <ProFormText
                name="authCode"
                label="验证码"
                rules={[{ required: true, message: '请输入验证码' }]}
                fieldProps={{
                  maxLength: 6,
                  style: { width: '100%' },
                }}
                placeholder="请输入收到的验证码"
              />
              <div className={styles.hint}>原型验证码固定为 `123456`</div>
            </ProForm>
          ) : authContextReady ? (
            <div className={styles.processingState}>
              <span className={styles.processingText}>
                当前账号仍需额外安全认证
              </span>
            </div>
          ) : null}

          <div className={styles.footer}>
            <div className={styles.divider} />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  clearScanSession();
                  setCurrentStep('PLATFORM');
                  form.setFieldValue('authCode', '');
                }}
              >
                返回上一步
              </button>
              <button
                type="button"
                className={styles.nextBtn}
                onClick={handleCancel}
              >
                取消
              </button>
              {authContextReady && nextAuthStep === 'SMS' && (
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={() => form.submit()}
                  disabled={submitLoginAuthMutation.isPending}
                >
                  完成认证
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountAdd;
