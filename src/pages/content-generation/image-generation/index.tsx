import { useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components';
import type { SubmitImageGenerationRequest } from '@/services/content-generation';
import {
  creditsBalanceQueryKey,
  creditsBalanceQueryOptions,
  fetchCopywritingQueueCount,
  submitImageGenerationTask,
} from '@/services/content-generation';
import { useContentGenerationStore } from '@/store/modules/contentGenerationStore';
import { AIDisclaimerAlert } from '../video-generation/components/AIDisclaimerAlert';
import { BackButton } from '../video-generation/components/BackButton';
import { InsufficientCreditsModal } from '../video-generation/components/InsufficientCreditsModal';
import { QueueFullModal } from '../video-generation/components/QueueFullModal';
import { createMediaUploadController } from '../video-generation/utils/media';
import {
  collectDoneCozeFileIds,
  hasUploadingMedia,
} from '../video-generation/utils/mediaFiles';
import { BaseInfoSection } from './components/BaseInfoSection';
import { ContentConfigSection } from './components/ContentConfigSection';
import { CopyTypeSection } from './components/CopyTypeSection';
import { GeneratingModal } from './components/GeneratingModal';
import { ImageConfigSection } from './components/ImageConfigSection';
import { ReferenceImagesSection } from './components/ReferenceImagesSection';
import { StyleConfigSection } from './components/StyleConfigSection';
import { buildImagePrefillForm } from './regeneratePrefill';
import styles from './style.module.css';
import {
  type AIGeneratedMarkPosition,
  type CopyType,
  CUSTOM_WORD_LIMIT_MAX,
  CUSTOM_WORD_LIMIT_MIN,
  type GenerationFormData,
  type ToneStyle,
  type UseCase,
  type WordLimit,
} from './types';

const IMAGE_GENERATION_CREDITS = 50;
const FIXED_CREDITS_LABEL = `立即生成图文内容 · ${IMAGE_GENERATION_CREDITS} 积分`;

const INITIAL_FORM_DATA: GenerationFormData = {
  referenceImages: [],
  referenceLink: '',
  productName: '',
  copyType: '宣传文案',
  customCopyType: '',
  useCase: '',
  customUseCase: '',
  coreSellingPoint: '',
  targetAudience: '',
  toneStyle: '种草',
  customToneStyle: '',
  wordLimit: 300,
  customWordLimit: '',
  prohibitedWords: '',
  imageCount: 1,
  aiGeneratedMarkPosition: 'bottom-left',
};

function mapGenerationError(err: unknown): 'queue' | 'credits' | 'other' {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('QUEUE_FULL')) return 'queue';
  if (msg.includes('INSUFFICIENT_CREDITS') || msg.includes('积分不足')) {
    return 'credits';
  }
  return 'other';
}

function parseCustomWordLimit(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || String(n) !== trimmed) return null;
  if (n < CUSTOM_WORD_LIMIT_MIN || n > CUSTOM_WORD_LIMIT_MAX) return null;
  return n;
}

function wordLimitToCount(
  limit: GenerationFormData['wordLimit'],
  customWordLimit: string,
): string | undefined {
  if (limit === 0) return undefined;
  if (limit === -1) {
    const n = parseCustomWordLimit(customWordLimit);
    return n == null ? undefined : String(n);
  }
  return String(limit);
}

function resolveCopyType(
  copyType: CopyType,
  custom: string,
): string | undefined {
  if (copyType === '自定义类型') {
    const trimmed = custom.trim();
    return trimmed ? trimmed : undefined;
  }
  return copyType;
}

function resolveToneStyle(
  toneStyle: ToneStyle,
  custom: string,
): string | undefined {
  if (toneStyle === '自定义风格') {
    const trimmed = custom.trim();
    return trimmed ? trimmed : undefined;
  }
  return toneStyle;
}

function resolveUseCase(
  useCase: GenerationFormData['useCase'],
  custom: string,
): string | undefined {
  if (!useCase) return undefined;
  if (useCase === '其他场景') {
    const trimmed = custom.trim();
    return trimmed ? trimmed : undefined;
  }
  return useCase;
}

type RegenerateLocationState = {
  paramsRaw?: string;
};

export const ImageGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const registerImageTask = useContentGenerationStore(
    (s) => s.registerImageTask,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: location.state intentionally read once on mount
  const initialFormData = useMemo<GenerationFormData>(() => {
    const state = location.state as RegenerateLocationState | null;
    return buildImagePrefillForm(state?.paramsRaw, INITIAL_FORM_DATA);
  }, []);

  const [formData, setFormData] = useState<GenerationFormData>(initialFormData);
  const [generatingVisible, setGeneratingVisible] = useState(false);
  const [queueFullVisible, setQueueFullVisible] = useState(false);
  const [insufficientCreditsVisible, setInsufficientCreditsVisible] =
    useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask = useContentGenerationStore((s) =>
    activeTaskId ? s.tasks[activeTaskId] : undefined,
  );
  const progress = activeTask?.progress ?? 0;

  const uploadController = useMemo(
    () => createMediaUploadController('CONTENT_GEN_IMAGE'),
    [],
  );

  const { data: creditsBalanceData } = useQuery(creditsBalanceQueryOptions());
  const currentCredits = creditsBalanceData?.totalPoints ?? 0;

  // 点击「立即生成图文内容」时再查 queue-count，避免进入页面预查把瞬时排队状态固化；
  // ref 拦下毫秒级双击，保证一次点击只发一对 queue-count + submit
  const queueCheckInFlightRef = useRef(false);
  const QUEUE_BUSY_HINT = '当前有任务正在生成中，请稍后再试';

  useEffect(() => {
    if (!activeTaskId) return;
    if (!activeTask) {
      setGeneratingVisible(false);
      setActiveTaskId(null);
    }
  }, [activeTask, activeTaskId]);

  const canGenerate =
    Boolean(formData.productName) &&
    Boolean(formData.useCase) &&
    Boolean(formData.coreSellingPoint) &&
    Boolean(formData.targetAudience);

  const handleCopyTypeChange = (value: CopyType) => {
    setFormData((prev) => ({
      ...prev,
      copyType: value,
      customCopyType: value === '自定义类型' ? prev.customCopyType : '',
    }));
  };

  const handleToneStyleChange = (value: ToneStyle) => {
    setFormData((prev) => ({
      ...prev,
      toneStyle: value,
      customToneStyle: value === '自定义风格' ? prev.customToneStyle : '',
    }));
  };

  const handleWordLimitChange = (value: WordLimit) => {
    setFormData((prev) => ({
      ...prev,
      wordLimit: value,
      customWordLimit: value === -1 ? prev.customWordLimit : '',
    }));
  };

  const handleImageCountChange = (value: GenerationFormData['imageCount']) => {
    setFormData((prev) => ({
      ...prev,
      imageCount: value,
      aiGeneratedMarkPosition:
        value === 0 ? 'bottom-left' : prev.aiGeneratedMarkPosition,
    }));
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (queueCheckInFlightRef.current) return;
    // 「点击立即生成 → 先调 queue-count → canCreate=false 拦下」：
    // 不在进入页面时预查，避免把瞬时排队状态固化到按钮上
    queueCheckInFlightRef.current = true;

    // 积分预检：外部内容生成平台的"积分不足"兜底在测试环境会被放行
    // （shixi-open 对部分租户/接口不实际扣分），导致 49 积分也能生成成功。
    // 这里点击瞬间强制 refetch 拿到最新余额，本地比对，不够直接弹窗，不发 submit。
    let latestCredits = currentCredits;
    try {
      const fresh = await queryClient.fetchQuery({
        ...creditsBalanceQueryOptions(),
        staleTime: 0,
      });
      latestCredits = fresh?.totalPoints ?? latestCredits;
    } catch (err) {
      // 余额接口抖动时退回 useQuery cache 里的上一次值；cache 也没有 → 0 → 拦下
      console.warn('[image-generation] 积分余额拉取失败，按 cache 兜底', err);
    }
    if (latestCredits < IMAGE_GENERATION_CREDITS) {
      queueCheckInFlightRef.current = false;
      setInsufficientCreditsVisible(true);
      return;
    }

    let canCreate = true;
    try {
      const queue = await fetchCopywritingQueueCount();
      canCreate = queue.canCreate !== false;
    } catch (err) {
      // queue-count 自身失败不阻断用户提交，让后端 submit 的 QUEUE_FULL 兜底
      console.warn(
        '[image-generation] copywriting queue-count 校验失败，按允许提交兜底',
        err,
      );
    } finally {
      queueCheckInFlightRef.current = false;
    }
    if (!canCreate) {
      message.warning(QUEUE_BUSY_HINT);
      return;
    }
    if (hasUploadingMedia(formData.referenceImages)) {
      message.warning('图片仍在上传中，请稍候再试');
      return;
    }
    if (
      formData.wordLimit === -1 &&
      parseCustomWordLimit(formData.customWordLimit) == null
    ) {
      message.warning(
        `自定义字数请输入 ${CUSTOM_WORD_LIMIT_MIN}–${CUSTOM_WORD_LIMIT_MAX} 之间的整数`,
      );
      return;
    }

    const fileIds = collectDoneCozeFileIds(formData.referenceImages);
    const body: SubmitImageGenerationRequest = {
      productServiceName: formData.productName,
      coreSellingPoints: formData.coreSellingPoint,
      targetAudience: formData.targetAudience,
      usageScenario: resolveUseCase(formData.useCase, formData.customUseCase),
      copyType: resolveCopyType(formData.copyType, formData.customCopyType),
      toneStyle: resolveToneStyle(formData.toneStyle, formData.customToneStyle),
      wordCountLimit: wordLimitToCount(
        formData.wordLimit,
        formData.customWordLimit,
      ),
      forbiddenWords: formData.prohibitedWords || undefined,
      referenceLink: formData.referenceLink || undefined,
      fileIds: fileIds.length > 0 ? fileIds : undefined,
      imageCount: formData.imageCount,
    };

    setGeneratingVisible(true);

    try {
      const task = await submitImageGenerationTask(body);
      void queryClient.invalidateQueries({ queryKey: creditsBalanceQueryKey });
      registerImageTask(task.taskId, {
        imageCount: formData.imageCount,
        productServiceName: formData.productName.trim() || undefined,
      });
      setActiveTaskId(task.taskId);
    } catch (err) {
      setGeneratingVisible(false);
      const kind = mapGenerationError(err);
      if (kind === 'queue') {
        setQueueFullVisible(true);
        return;
      }
      if (kind === 'credits') {
        setInsufficientCreditsVisible(true);
        return;
      }
      message.error(err instanceof Error ? err.message : '提交生成任务失败');
    }
  };

  const handleCloseGenerating = () => {
    setGeneratingVisible(false);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleBackground = () => {
    setGeneratingVisible(false);
    setFormData(INITIAL_FORM_DATA);
  };

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        title="图文生成"
        toolbar={<BackButton onClick={() => navigate(-1)} />}
      />
      <div className={styles.alertWrapper}>
        <AIDisclaimerAlert />
      </div>

      <ReferenceImagesSection
        uploadController={uploadController}
        referenceImages={formData.referenceImages}
        onReferenceImagesChange={(updater) =>
          setFormData((prev) => ({
            ...prev,
            referenceImages:
              typeof updater === 'function'
                ? updater(prev.referenceImages)
                : updater,
          }))
        }
      />

      <BaseInfoSection
        referenceLink={formData.referenceLink}
        onReferenceLinkChange={(value) =>
          setFormData((prev) => ({ ...prev, referenceLink: value }))
        }
        productName={formData.productName}
        onProductNameChange={(value) =>
          setFormData((prev) => ({ ...prev, productName: value }))
        }
      />

      <CopyTypeSection
        copyType={formData.copyType}
        useCase={formData.useCase}
        customCopyType={formData.customCopyType}
        customUseCase={formData.customUseCase}
        onCopyTypeChange={handleCopyTypeChange}
        onCustomCopyTypeChange={(value) =>
          setFormData((prev) => ({ ...prev, customCopyType: value }))
        }
        onUseCaseChange={(value: UseCase) =>
          setFormData((prev) => ({
            ...prev,
            useCase: value,
            customUseCase: value === '其他场景' ? prev.customUseCase : '',
          }))
        }
        onCustomUseCaseChange={(value) =>
          setFormData((prev) => ({ ...prev, customUseCase: value }))
        }
      />

      <ContentConfigSection
        coreSellingPoint={formData.coreSellingPoint}
        targetAudience={formData.targetAudience}
        onCoreSellingPointChange={(value) =>
          setFormData((prev) => ({ ...prev, coreSellingPoint: value }))
        }
        onTargetAudienceChange={(value) =>
          setFormData((prev) => ({ ...prev, targetAudience: value }))
        }
      />

      <StyleConfigSection
        toneStyle={formData.toneStyle}
        customToneStyle={formData.customToneStyle}
        wordLimit={formData.wordLimit}
        customWordLimit={formData.customWordLimit}
        prohibitedWords={formData.prohibitedWords}
        onToneStyleChange={handleToneStyleChange}
        onCustomToneStyleChange={(value) =>
          setFormData((prev) => ({ ...prev, customToneStyle: value }))
        }
        onWordLimitChange={handleWordLimitChange}
        onCustomWordLimitChange={(value) =>
          setFormData((prev) => ({ ...prev, customWordLimit: value }))
        }
        onProhibitedWordsChange={(value) =>
          setFormData((prev) => ({ ...prev, prohibitedWords: value }))
        }
      />

      <ImageConfigSection
        imageCount={formData.imageCount}
        aiGeneratedMarkPosition={formData.aiGeneratedMarkPosition}
        onImageCountChange={handleImageCountChange}
        onAIGeneratedMarkPositionChange={(
          aiGeneratedMarkPosition: AIGeneratedMarkPosition,
        ) => setFormData((prev) => ({ ...prev, aiGeneratedMarkPosition }))}
      />

      <div className={styles.generateActionCard}>
        <button
          type="button"
          className={styles.generateButton}
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {FIXED_CREDITS_LABEL}
        </button>
      </div>

      <GeneratingModal
        visible={generatingVisible}
        progress={progress}
        onClose={handleCloseGenerating}
        onBackground={handleBackground}
      />

      <QueueFullModal
        visible={queueFullVisible}
        queueCount={10}
        onClose={() => setQueueFullVisible(false)}
      />

      <InsufficientCreditsModal
        visible={insufficientCreditsVisible}
        creditInfo={{
          current: currentCredits,
          cost: IMAGE_GENERATION_CREDITS,
          shortage: Math.max(0, IMAGE_GENERATION_CREDITS - currentCredits),
        }}
        onClose={() => setInsufficientCreditsVisible(false)}
      />
    </div>
  );
};

export default ImageGenerationPage;
