import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, message } from 'antd';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components';
import {
  avatarAssetsQueryOptions,
  creditsBalanceQueryKey,
  creditsBalanceQueryOptions,
  fetchTrialQuota,
  fetchVideoQueueCount,
  refineVideoPrompt,
  submitVideoGenerationTask,
} from '@/services/content-generation';
import { useContentGenerationStore } from '@/store/modules/contentGenerationStore';
import { AIDisclaimerAlert } from './components/AIDisclaimerAlert';
import { type Avatar, AvatarPickerModal } from './components/AvatarPickerModal';
import { BackButton } from './components/BackButton';
import {
  type AIGeneratedMarkPosition,
  ContentConfigForm,
  type Resolution,
  type VideoLength,
} from './components/ContentConfigForm';
import { GenerateButton } from './components/GenerateButton';
import { GeneratingModal } from './components/GeneratingModal';
import { InsufficientCreditsModal } from './components/InsufficientCreditsModal';
import { QueueFullModal } from './components/QueueFullModal';
import type { VideoGenerationMode } from './components/TrialStatusCard';
import { UploadZoneImage } from './components/UploadZoneImage';
import { UploadZoneVideo } from './components/UploadZoneVideo';
import { buildVideoPrefillForm } from './regeneratePrefill';
import styles from './style.module.css';
import type { UploadedMediaFile } from './types/media';
import { calcVideoGenerationCredits } from './utils/credits';
import { createMediaUploadController } from './utils/media';
import {
  collectDoneCozeFileIds,
  collectDonePreviewUrls,
  getMaterialBlockReason,
  hasDoneMedia,
} from './utils/mediaFiles';
import { isRefusalMessage } from './utils/promptRefineResult';

export interface VideoGenerationFormData {
  images: UploadedMediaFile[];
  videos: UploadedMediaFile[];
  avatar?: Avatar;
  prompt: string;
  aiGeneratedMarkPosition: AIGeneratedMarkPosition;
  videoLength: VideoLength;
  resolution: Resolution;
}

const PROMPT_MAX_LENGTH = 1000;

function mapGenerationError(
  err: unknown,
): 'queue' | 'credits' | 'trial-exhausted' | 'other' {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('QUEUE_FULL')) {
    return 'queue';
  }
  if (msg.includes('INSUFFICIENT_CREDITS') || msg.includes('积分不足')) {
    return 'credits';
  }
  if (msg.includes('免费试用次数已用尽')) {
    return 'trial-exhausted';
  }
  return 'other';
}

const TRIAL_QUOTA_QUERY_KEY = ['content-generation', 'trial-quota'] as const;

type RegenerateLocationState = {
  paramsRaw?: string;
};

const DEFAULT_VIDEO_FORM: VideoGenerationFormData = {
  images: [],
  videos: [],
  prompt: '',
  aiGeneratedMarkPosition: 'bottom-left',
  videoLength: 10,
  resolution: '720P',
};

export const VideoGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const registerVideoTask = useContentGenerationStore(
    (s) => s.registerVideoTask,
  );
  const setVideoGenerationPageActive = useContentGenerationStore(
    (s) => s.setVideoGenerationPageActive,
  );

  useEffect(() => {
    setVideoGenerationPageActive(true);
    return () => setVideoGenerationPageActive(false);
  }, [setVideoGenerationPageActive]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: location.state intentionally read once on mount
  const initialPrefill = useMemo(() => {
    const state = location.state as RegenerateLocationState | null;
    return buildVideoPrefillForm(state?.paramsRaw, DEFAULT_VIDEO_FORM);
  }, []);

  const { data: trialQuota } = useQuery({
    queryKey: TRIAL_QUOTA_QUERY_KEY,
    queryFn: fetchTrialQuota,
  });

  const avatarsQuery = useQuery(avatarAssetsQueryOptions());
  const { data: creditsBalanceData } = useQuery(creditsBalanceQueryOptions());
  const currentCredits = creditsBalanceData?.totalPoints ?? 0;

  // 点击「立即生成」时先调 queue-count 校验，毫秒级双击 / 校验未返回前再次点击都
  // 由这个 ref 在同一 tick 内即时挡住，避免重复发送 queue-count + submit
  const queueCheckInFlightRef = useRef(false);
  const QUEUE_BUSY_HINT = '当前有任务正在生成中，请稍后再试';

  const trialTotal = trialQuota?.total ?? 3;
  const trialRemaining = trialQuota?.remaining ?? 0;

  const [generationMode, setGenerationMode] = useState<VideoGenerationMode>(
    initialPrefill.quality === 'premium' ? 'premium' : 'standard',
  );
  const [modeInitialized, setModeInitialized] = useState(
    initialPrefill.quality != null,
  );
  const [formData, setFormData] = useState<VideoGenerationFormData>(
    initialPrefill.formData,
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask = useContentGenerationStore((s) =>
    activeTaskId ? s.tasks[activeTaskId] : undefined,
  );
  const progress = activeTask?.progress ?? 0;

  useEffect(() => {
    if (trialQuota == null) return;
    if (!modeInitialized) {
      setGenerationMode(trialQuota.remaining > 0 ? 'trial' : 'standard');
      setModeInitialized(true);
      return;
    }
    if (trialQuota.remaining <= 0 && generationMode === 'trial') {
      setGenerationMode('standard');
    }
  }, [trialQuota, modeInitialized, generationMode]);

  const effectiveGenerationMode =
    generationMode === 'trial' && trialRemaining <= 0
      ? 'standard'
      : generationMode;

  const isTrialMode = effectiveGenerationMode === 'trial';
  const qualityForCredits =
    effectiveGenerationMode === 'premium' ? 'premium' : 'standard';
  const requiredCredits = calcVideoGenerationCredits(
    qualityForCredits,
    formData.videoLength,
    !!formData.avatar,
  );

  const [generatingVisible, setGeneratingVisible] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [queueFullVisible, setQueueFullVisible] = useState(false);
  const [insufficientCreditsVisible, setInsufficientCreditsVisible] =
    useState(false);
  const [polishing, setPolishing] = useState(false);

  const imageUploadController = useMemo(
    () => createMediaUploadController('CONTENT_GEN_IMAGE'),
    [],
  );
  const videoUploadController = useMemo(
    () => createMediaUploadController('CONTENT_GEN_VIDEO'),
    [],
  );

  useEffect(() => {
    if (!activeTaskId) return;
    if (!activeTask) {
      setGeneratingVisible(false);
      setActiveTaskId(null);
    }
  }, [activeTask, activeTaskId]);

  const handleModeChange = (mode: VideoGenerationMode) => {
    setGenerationMode(mode);
    setFormData((prev) => {
      let next = prev;
      if (mode === 'trial') {
        next = {
          ...next,
          videos: [],
          avatar: undefined,
          videoLength: next.videoLength === 15 ? 12 : next.videoLength,
        };
      }
      // 1080P 仅 premium 档位可选；切回 trial/standard 时若残留 1080P
      // 会被外部生成接口拒（pixel count），这里同步回落到 720P。
      if (mode !== 'premium' && next.resolution === '1080P') {
        next = { ...next, resolution: '720P' };
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (queueCheckInFlightRef.current) return;
    // 「点击立即生成 → 先调 queue-count → canCreate=false 拦下」是产品口径，
    // 不在进入页面时预查，避免把瞬时状态固化到按钮上；点击瞬间查询保证决策基于最新数据
    queueCheckInFlightRef.current = true;

    // 积分预检：试用模式消耗的是 freeVideoRemaining 不是积分，跳过；
    // 付费档位（standard/premium）按 requiredCredits 本地拦下，避免外部测试环境不挡导致越扣
    if (!isTrialMode) {
      let latestCredits = currentCredits;
      try {
        const fresh = await queryClient.fetchQuery({
          ...creditsBalanceQueryOptions(),
          staleTime: 0,
        });
        latestCredits = fresh?.totalPoints ?? latestCredits;
      } catch (err) {
        // 余额接口抖动时退回 useQuery cache 里的上一次值；cache 也没有 → 0 → 拦下
        console.warn('[video-generation] 积分余额拉取失败，按 cache 兜底', err);
      }
      if (latestCredits < requiredCredits) {
        queueCheckInFlightRef.current = false;
        setInsufficientCreditsVisible(true);
        return;
      }
    }

    let canCreate = true;
    try {
      const queue = await fetchVideoQueueCount();
      canCreate = queue.canCreate !== false;
    } catch (err) {
      // queue-count 接口本身失败时不阻断用户提交，让后端 submit 的 QUEUE_FULL 兜底；
      // 仅记录便于排查，避免把网络抖动转译成「正在生成中」误导用户
      console.warn(
        '[video-generation] queue-count 校验失败，按允许提交兜底',
        err,
      );
    } finally {
      queueCheckInFlightRef.current = false;
    }
    if (!canCreate) {
      message.warning(QUEUE_BUSY_HINT);
      return;
    }

    const blockReason = getMaterialBlockReason(
      formData.images,
      formData.videos,
      isTrialMode,
    );
    if (blockReason) {
      message.warning(blockReason);
      return;
    }

    const hasImages = hasDoneMedia(formData.images);
    const hasVideos = hasDoneMedia(formData.videos);

    setGeneratingVisible(true);

    try {
      const task = await submitVideoGenerationTask({
        trial: isTrialMode,
        ...(isTrialMode ? {} : { quality: qualityForCredits }),
        prompt: formData.prompt || undefined,
        imageUrls: hasImages
          ? collectDonePreviewUrls(formData.images)
          : undefined,
        videoUrls: hasVideos
          ? collectDonePreviewUrls(formData.videos)
          : undefined,
        avatarId: formData.avatar?.assetId,
        videoLength: formData.videoLength,
        videoAspectRatio: '9:16',
      });
      void queryClient.invalidateQueries({ queryKey: creditsBalanceQueryKey });
      if (isTrialMode) {
        void queryClient.invalidateQueries({ queryKey: TRIAL_QUOTA_QUERY_KEY });
      }
      const qualityLabel =
        effectiveGenerationMode === 'premium'
          ? '高级'
          : effectiveGenerationMode === 'trial'
            ? '试用'
            : '标准';
      registerVideoTask(task.taskId, {
        title: formData.prompt.slice(0, 30) || '视频生成完成',
        duration: formData.videoLength,
        resolution: formData.resolution,
        quality: qualityLabel,
        credits: isTrialMode ? 0 : requiredCredits,
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
      if (kind === 'trial-exhausted') {
        setGenerationMode('standard');
        void queryClient.invalidateQueries({ queryKey: TRIAL_QUOTA_QUERY_KEY });
        message.info(
          '免费试用次数已用尽，已为你切换到标准质量，请重新点击生成',
        );
        return;
      }
      message.error(err instanceof Error ? err.message : '提交生成任务失败');
    }
  };

  const handleCloseGenerating = () => {
    setGeneratingVisible(false);
    setFormData(DEFAULT_VIDEO_FORM);
  };

  const handleBackground = () => {
    setGeneratingVisible(false);
    setFormData(DEFAULT_VIDEO_FORM);
  };

  const handleAvatarChange = () => {
    setAvatarPickerVisible(true);
  };

  const handleAvatarRemove = () => {
    setFormData({ ...formData, avatar: undefined });
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setFormData({ ...formData, avatar });
  };

  const handleAvatarConfirm = () => {
    setAvatarPickerVisible(false);
  };

  const handleAIPolish = async () => {
    if (polishing) return;
    if (!formData.prompt.trim()) {
      message.warning('请先填写描述提示词');
      return;
    }
    setPolishing(true);
    try {
      const imageFileIds = collectDoneCozeFileIds(formData.images);
      const videoFileIds = collectDoneCozeFileIds(formData.videos);
      const quality =
        effectiveGenerationMode === 'premium' ? 'premium' : 'standard';
      const res = await refineVideoPrompt({
        prompt: formData.prompt,
        imageFileIds: imageFileIds.length > 0 ? imageFileIds : undefined,
        videoFileIds: videoFileIds.length > 0 ? videoFileIds : undefined,
        videoLength: formData.videoLength,
        quality,
      });
      const refined = res.refinedText?.trim();
      if (!refined) {
        message.warning('AI 未返回润色结果，请稍后再试');
        return;
      }
      if (isRefusalMessage(refined, { originalPrompt: formData.prompt })) {
        Modal.info({
          title: 'AI 需要更多信息',
          content: refined,
          okText: '我知道了',
          width: 480,
          maskClosable: true,
        });
        return;
      }
      const clipped = refined.length > PROMPT_MAX_LENGTH;
      const nextPrompt = clipped
        ? refined.slice(0, PROMPT_MAX_LENGTH)
        : refined;
      setFormData((prev) => ({ ...prev, prompt: nextPrompt }));
      if (clipped) {
        message.warning(`提示词已优化，超出 ${PROMPT_MAX_LENGTH} 字部分已截断`);
      } else {
        message.success('提示词已优化');
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'AI 润色失败');
    } finally {
      setPolishing(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        title="视频生成"
        toolbar={<BackButton onClick={() => navigate(-1)} />}
      />
      <AIDisclaimerAlert className={styles.alertWrapper} />

      <div className={styles.uploadCard}>
        <div className={styles.sectionTitle}>上传素材</div>
        <div className={styles.uploadZones}>
          <UploadZoneImage
            uploadController={imageUploadController}
            value={formData.images}
            onChange={(images) =>
              setFormData((prev) => ({
                ...prev,
                images:
                  typeof images === 'function' ? images(prev.images) : images,
              }))
            }
          />
          <UploadZoneVideo
            uploadController={videoUploadController}
            disabled={isTrialMode}
            maxResolutionShortEdge={
              effectiveGenerationMode === 'premium' ? 1080 : 720
            }
            maxResolutionLabel={
              effectiveGenerationMode === 'premium' ? '1080P' : '720P'
            }
            value={formData.videos}
            onChange={(videos) =>
              setFormData((prev) => ({
                ...prev,
                videos:
                  typeof videos === 'function' ? videos(prev.videos) : videos,
              }))
            }
          />
        </div>
        <div className={styles.warningRow}>
          <svg
            className={styles.warningIcon}
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <circle cx="7" cy="7" r="6" fill="#FAAD14" />
            <path
              d="M7 4V7.5M7 9.5H7.01"
              stroke="#fff"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span>
            图片中不得含有任何真人肖像，否则视频生成会自动失败。如需要真人人物可以选择在下方虚拟人物进行生成。
          </span>
        </div>
      </div>

      <ContentConfigForm
        trialRemaining={trialRemaining}
        trialTotal={trialTotal}
        generationMode={generationMode}
        onModeChange={handleModeChange}
        selectedAvatar={formData.avatar}
        prompt={formData.prompt}
        promptMaxLength={PROMPT_MAX_LENGTH}
        aiGeneratedMarkPosition={formData.aiGeneratedMarkPosition}
        videoLength={formData.videoLength}
        resolution={formData.resolution}
        isTrialMode={isTrialMode}
        isPolishing={polishing}
        onAvatarChange={handleAvatarChange}
        onAvatarRemove={handleAvatarRemove}
        onPromptChange={(prompt) => setFormData({ ...formData, prompt })}
        onAIGeneratedMarkPositionChange={(aiGeneratedMarkPosition) =>
          setFormData({ ...formData, aiGeneratedMarkPosition })
        }
        onAIPolish={handleAIPolish}
        onVideoLengthChange={(videoLength) =>
          setFormData({ ...formData, videoLength })
        }
        onResolutionChange={(resolution) =>
          setFormData({ ...formData, resolution })
        }
        className={styles.configCard}
      />

      <GenerateButton
        isTrialMode={isTrialMode}
        trialRemaining={trialRemaining}
        credits={requiredCredits}
        onClick={handleGenerate}
        className={styles.generateCard}
      />

      <GeneratingModal
        visible={generatingVisible}
        progress={progress}
        onClose={handleCloseGenerating}
        onBackground={handleBackground}
      />

      <AvatarPickerModal
        visible={avatarPickerVisible}
        avatars={avatarsQuery.data ?? []}
        selectedAvatarId={formData.avatar?.assetId}
        loading={avatarsQuery.isLoading}
        error={
          avatarsQuery.error instanceof Error
            ? avatarsQuery.error.message
            : null
        }
        onSelect={handleAvatarSelect}
        onCancel={() => setAvatarPickerVisible(false)}
        onConfirm={handleAvatarConfirm}
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
          cost: requiredCredits,
          shortage: Math.max(0, requiredCredits - currentCredits),
        }}
        onClose={() => setInsufficientCreditsVisible(false)}
      />
    </div>
  );
};

export default VideoGenerationPage;
