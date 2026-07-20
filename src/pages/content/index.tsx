import { useQueryClient } from '@tanstack/react-query';
import { Button, type InputRef, Modal, message, Space } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader, TabBar } from '@/components';
import type { UploadController } from '@/components/CustomMediaUpload';
import { useAccountList } from '@/services/account';
import { accountListQueryOptions } from '@/services/account/queryOptions';
import {
  useActivePublishJobs,
  useAISuggestions,
  usePromptTemplates,
  useSubmitPublish,
} from '@/services/content';
import type {
  ContentAiCaptionVariant,
  ContentAiPromptTemplate,
  PlatformCode,
  PublishJobProgressData,
  PublishSubmitRequest,
} from '@/services/content/types';
import type { MediaPurposeCode } from '@/services/media-upload';
import {
  cancelUploadSession,
  completeUploadSession,
  createUploadSession,
  getUploadSession,
  uploadPart,
} from '@/services/media-upload';
import AIContentPreviewModal from './components/AIContentPreviewModal';
import type { PlatformCount } from './components/AIContentPreviewModal/types';
import AIResults from './components/AIResults';
import type { CaptionResult, Hashtag } from './components/AIResults/types';
import BottomActionBar from './components/BottomActionBar';
import ContentEdit from './components/ContentEdit';
import type { FilterTag } from './components/ContentEdit/types';
import ImageUpload from './components/ImageUpload';
import PublishConfig from './components/PublishConfig';
import type { Account } from './components/PublishConfig/types';
import PublishExtension from './components/PublishExtension';
import type { PublishExtensionInfo } from './components/PublishExtension';
import { EXTENSION_TYPE_LABEL } from './components/PublishExtension/mockData';
import PublishProgressModal from './components/PublishProgressModal';
import type { PublishRecord } from './components/PublishProgressModal';
import PublishResultModal from './components/PublishResultModal';
import PublishStatusToast from './components/PublishStatusToast';
import VideoUpload from './components/VideoUpload';
import type { VideoUploadFile } from './components/VideoUpload/types';
import styles from './style.module.css';
import type { PublishPrefillState } from './types';

const INITIAL_DISPLAY_COUNT = 3;

const CONTENT_TABS = [
  { key: 'VIDEO', name: '视频发布' },
  { key: 'IMAGE', name: '图文发布' },
] as const;

const REVIEW_ACCOUNT_FALLBACK: Account[] = [
  {
    id: 'review-dy-001',
    name: '矩阵号-成都探店',
    phone: '138****0000',
    platform: 'douyin',
    status: 'online',
  },
  {
    id: 'review-xhs-001',
    name: '小红书-新品种草',
    phone: '133****0000',
    platform: 'xiaohongshu',
    status: 'online',
  },
  {
    id: 'review-dy-002',
    name: '抖音-门店活动',
    phone: '132****0000',
    platform: 'douyin',
    status: 'online',
  },
  {
    id: 'review-xhs-002',
    name: '成都生活方式',
    phone: '135****0000',
    platform: 'xiaohongshu',
    status: 'online',
  },
];

const mapAccountResponseToAccount = (
  account: import('@/services/account/types').AccountResponse,
): Account => ({
  id: account.id,
  name: account.nickname,
  phone:
    account.phoneNumber?.replace(
      /(?<first>\d{3})\d{4}(?<last>\d{4})/u,
      '$<first>****$<last>',
    ) ?? '',
  platform: account.platform as Account['platform'],
  status: account.status === 'ONLINE' ? 'online' : 'stopped',
});

// 同一物理社交账号可能被同租户下多位用户分别绑定，account 表落多行
// （不同 id / user_id，同 platform+accountNo）。TENANT_ADMIN 视角下 list 接口
// 会同时返回这些行，UI 上表现为同一账号重复出现。「发布配置」只关心物理账号，
// 因此在 mapping 前按 (platform, accountNo) 去重；accountNo 缺失时回退 phoneNumber，
// 再缺则按 id 兜底（不夸大去重范围）。
const dedupeAccountResponses = (
  list: import('@/services/account/types').AccountResponse[],
): import('@/services/account/types').AccountResponse[] => {
  const seen = new Set<string>();
  const out: import('@/services/account/types').AccountResponse[] = [];
  for (const a of list) {
    const business = a.accountNo || a.phoneNumber;
    const key = business ? `${a.platform}:${business}` : `id:${a.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
};

const Content = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // 「我的作品 / 作品详情 / 生成成功弹窗」点击「去发布」时通过 route state 透传过来的
  // 预填数据；仅在首次挂载时消费，后续表单交互不再受 state 影响。
  const prefillStateRef = useRef<PublishPrefillState | null>(
    (location.state as PublishPrefillState | null) ?? null,
  );

  const [selectedPlatform, setSelectedPlatform] = useState<
    'all' | 'douyin' | 'xiaohongshu'
  >('all');
  const initialMode = prefillStateRef.current?.contentMode ?? 'IMAGE';
  const [activeMode, setActiveMode] = useState<'VIDEO' | 'IMAGE'>(initialMode);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentValue, setContentValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef<InputRef>(null);

  const [page, setPage] = useState(1);
  const [accountHasMore, setAccountHasMore] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FilterTag | null>(
    null,
  );
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [captionResults, setCaptionResults] = useState<CaptionResult[]>([]);
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(
    null,
  );
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<
    import('./components/ImageUpload/types').ImageUploadFile[]
  >([]);
  const [videoFile, setVideoFile] = useState<VideoUploadFile | undefined>();

  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [demoProgressRecords, setDemoProgressRecords] = useState<
    PublishRecord[] | undefined
  >();
  const [publishExtensionInfo, setPublishExtensionInfo] =
    useState<PublishExtensionInfo | null>(null);
  const [resultModalData, setResultModalData] = useState<{
    successCount: number;
    failedAccounts: { id: string; accountName: string; reason: string }[];
  } | null>(null);

  const [aiPreviewModalOpen, setAiPreviewModalOpen] = useState(false);
  const [editingCaptionResult, setEditingCaptionResult] =
    useState<CaptionResult | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [editingTopics, setEditingTopics] = useState<string[]>([]);

  const { data: accountData } = useAccountList(
    useMemo(
      () => ({
        status: 'ONLINE' as const,
      }),
      [],
    ),
  );
  const { data: activeJobsData } = useActivePublishJobs();
  const { data: templatesData } = usePromptTemplates({
    contentMode: activeMode,
  });
  const submitPublish = useSubmitPublish();
  const aiSuggestions = useAISuggestions();

  const hasActiveJob = activeJobsData?.hasActive ?? false;

  const templates: FilterTag[] = useMemo(() => {
    if (!templatesData?.templates) return [];
    return templatesData.templates.map((t: ContentAiPromptTemplate) => ({
      id: t.code,
      label: t.name,
      description: t.description,
      defaultPromptByMode: t.defaultPromptByMode,
    }));
  }, [templatesData]);

  const accounts: Account[] = useMemo(() => {
    if (isExpanded) {
      return allAccounts.length > 0 ? allAccounts : REVIEW_ACCOUNT_FALLBACK;
    }
    if (!accountData?.list) return REVIEW_ACCOUNT_FALLBACK;
    const onlineAccounts = dedupeAccountResponses(
      accountData.list.filter((a) => a.status === 'ONLINE'),
    ).map(mapAccountResponseToAccount);
    return onlineAccounts.length > 0 ? onlineAccounts : REVIEW_ACCOUNT_FALLBACK;
  }, [accountData, isExpanded, allAccounts]);

  useEffect(() => {
    if (accountData?.list) {
      const onlineAccounts = dedupeAccountResponses(
        accountData.list.filter((a) => a.status === 'ONLINE'),
      ).map(mapAccountResponseToAccount);
      setAllAccounts(
        onlineAccounts.length > 0 ? onlineAccounts : REVIEW_ACCOUNT_FALLBACK,
      );
      setPage(1);
    }
  }, [accountData]);

  useEffect(() => {
    if (isExpanded) {
      queryClient
        .fetchQuery(accountListQueryOptions({ page: 1, pageSize: 10 }))
        .then((response) => {
          const newAccounts = dedupeAccountResponses(response.list || []).map(
            mapAccountResponseToAccount,
          );
          setAllAccounts(newAccounts);
          setPage(1);
          setAccountHasMore(response.hasNext ?? false);
        })
        .catch((err) => {
          console.error('加载全部账号失败:', err);
        });
    }
  }, [isExpanded, queryClient]);

  const imageMaxCount = useMemo(() => {
    const hasXiaohongshu = selectedAccountIds.some(
      (id) => accounts.find((a) => a.id === id)?.platform === 'xiaohongshu',
    );
    return hasXiaohongshu ? 18 : 100;
  }, [accounts, selectedAccountIds]);

  const hasMaterial = useMemo(() => {
    if (activeMode === 'VIDEO') return !!videoFile;
    return uploadFiles.length > 0;
  }, [activeMode, videoFile, uploadFiles]);

  const createMediaUploadController = useCallback(
    (purpose: MediaPurposeCode): UploadController => ({
      createSession: async (file: File) => {
        return createUploadSession({
          fileName: file.name,
          fileSizeBytes: String(file.size),
          mimeType: file.type,
          purpose,
        });
      },
      uploadPart: async (uploadSessionId, partNumber, blob, sha256) => {
        return uploadPart(uploadSessionId, partNumber, blob, sha256);
      },
      getSessionStatus: async (uploadSessionId) => {
        return getUploadSession(uploadSessionId);
      },
      cancelSession: async (uploadSessionId) => {
        await cancelUploadSession(uploadSessionId);
      },
      completeSession: async (uploadSessionId, parts) => {
        return completeUploadSession(uploadSessionId, { parts });
      },
    }),
    [],
  );

  const imageUploadController = useMemo(
    () => createMediaUploadController('DRAFT_IMAGE'),
    [createMediaUploadController],
  );

  const videoUploadController = useMemo(
    () => createMediaUploadController('DRAFT_VIDEO'),
    [createMediaUploadController],
  );

  // 「去发布」入口（我的作品 / 作品详情 / 生成成功弹窗）通过 route state 把生成
  // 结果的文本与媒体直链透传过来；mount 时一次性消费，文字字段直接写入，媒体直链
  // 走 fetch → 上传会话流程转成本系统素材，最终拿到 mediaAssetId 供发布提交使用。
  useEffect(() => {
    const prefill = prefillStateRef.current;
    if (!prefill) return;
    prefillStateRef.current = null;

    setActiveMode(prefill.contentMode);
    if (prefill.title) {
      setTitleValue(prefill.title);
    }
    if (prefill.content) {
      setContentValue(prefill.content);
    }
    if (prefill.tags && prefill.tags.length > 0) {
      const baseId = Date.now();
      setHashtags(
        prefill.tags.map((tag, index) => ({
          id: `prefill-tag-${baseId}-${index}`,
          name: tag.startsWith('#') ? tag : `#${tag}`,
        })),
      );
    }

    // 由 OpenSpec change `content-generation-publish-bridge` 改造：
    // 「内容发布」模块只接收已 ingest 的 mediaAssetId，不再吃外部 24h 直链。
    // 入口侧（VideoResultModal / GlobalGenerationCompletionHost / workActions.navigateToPublishWork）
    // 已经在 mediaAssetId 缺失时屏蔽跳转，所以这里见到 prefill 必然带 id。
    if (prefill.contentMode === 'VIDEO' && prefill.videoMediaAssetId) {
      const mediaAssetId = prefill.videoMediaAssetId;
      setVideoFile({
        uid: `prefill-video-asset-${mediaAssetId}`,
        name: `${prefill.title || '生成视频'}.mp4`,
        status: 'done',
        url: `/api/v1/media/${mediaAssetId}/preview`,
        mediaAssetId,
      });
    } else if (
      prefill.contentMode === 'IMAGE' &&
      prefill.imageMediaAssetIds &&
      prefill.imageMediaAssetIds.length > 0
    ) {
      const baseId = Date.now();
      const initialFiles: import('./components/ImageUpload/types').ImageUploadFile[] =
        prefill.imageMediaAssetIds.map((id, index) => ({
          uid: `prefill-image-asset-${baseId}-${index}`,
          name: `生成图片-${index + 1}.png`,
          status: 'done',
          url: `/api/v1/media/${id}/preview`,
          mediaAssetId: id,
        }));
      setUploadFiles(initialFiles);
    }
  }, []);

  const filteredAccounts = useMemo(() => {
    return selectedPlatform === 'all'
      ? allAccounts
      : allAccounts.filter((a) => a.platform === selectedPlatform);
  }, [selectedPlatform, allAccounts]);

  const displayedAccounts = useMemo(
    () =>
      isExpanded
        ? filteredAccounts
        : filteredAccounts.slice(0, INITIAL_DISPLAY_COUNT),
    [isExpanded, filteredAccounts],
  );

  const hasMore = isExpanded
    ? accountHasMore
    : filteredAccounts.length > INITIAL_DISPLAY_COUNT;

  const maxHashtags = useMemo(() => {
    if (selectedAccountIds.length === 0) return 5;
    const platforms = selectedAccountIds
      .map((id) => accounts.find((a) => a.id === id)?.platform)
      .filter(Boolean);
    if (platforms.includes('xiaohongshu')) return 10;
    if (platforms.includes('douyin')) return 5;
    return 5;
  }, [selectedAccountIds, accounts]);

  const computeTitleCount = useCallback(
    (titleLen: number): PlatformCount => {
      if (selectedAccountIds.length === 0) {
        return {
          xiaohongshu: { current: titleLen, limit: 20 },
          douyin: { current: titleLen, limit: 20 },
        };
      }
      const platforms = selectedAccountIds
        .map((id) => accounts.find((a) => a.id === id)?.platform)
        .filter(Boolean);
      if (platforms.includes('xiaohongshu') && platforms.includes('douyin')) {
        return {
          xiaohongshu: { current: titleLen, limit: 20 },
          douyin: { current: titleLen, limit: 20 },
        };
      }
      if (platforms.includes('xiaohongshu')) {
        return {
          xiaohongshu: { current: titleLen, limit: 20 },
          douyin: { available: false },
        };
      }
      return {
        xiaohongshu: { available: false },
        douyin: { current: titleLen, limit: 20 },
      };
    },
    [selectedAccountIds, accounts],
  );

  /** AI 预览弹窗内的标题字数提示，基于 editingTitle。 */
  const titleCount = useMemo(
    () => computeTitleCount(editingTitle.length),
    [editingTitle, computeTitleCount],
  );

  /** 主表单标题输入框的字数提示，基于 titleValue。 */
  const formTitleCount = useMemo(
    () => computeTitleCount(titleValue.length),
    [titleValue, computeTitleCount],
  );

  const bodyCount = useMemo((): PlatformCount => {
    const bodyLen = editingBody.length;
    if (activeMode === 'VIDEO') {
      return {
        xiaohongshu: { current: bodyLen, limit: 1000 },
        douyin: { available: false },
      };
    }
    if (selectedAccountIds.length === 0) {
      return {
        xiaohongshu: { current: bodyLen, limit: 1000 },
        douyin: { current: bodyLen, limit: 5000 },
      };
    }
    const platforms = selectedAccountIds
      .map((id) => accounts.find((a) => a.id === id)?.platform)
      .filter(Boolean);
    if (platforms.includes('xiaohongshu') && platforms.includes('douyin')) {
      return {
        xiaohongshu: { current: bodyLen, limit: 1000 },
        douyin: { current: bodyLen, limit: 5000 },
      };
    }
    if (platforms.includes('xiaohongshu')) {
      return {
        xiaohongshu: { current: bodyLen, limit: 1000 },
        douyin: { available: false },
      };
    }
    return {
      xiaohongshu: { available: false },
      douyin: { current: bodyLen, limit: 5000 },
    };
  }, [editingBody, activeMode, selectedAccountIds, accounts]);

  const topicCount = useMemo((): PlatformCount => {
    const topicLen = editingTopics.length;
    if (selectedAccountIds.length === 0) {
      return {
        xiaohongshu: { current: topicLen, limit: 10 },
        douyin: { current: topicLen, limit: 5 },
      };
    }
    const platforms = selectedAccountIds
      .map((id) => accounts.find((a) => a.id === id)?.platform)
      .filter(Boolean);
    if (platforms.includes('xiaohongshu') && platforms.includes('douyin')) {
      return {
        xiaohongshu: { current: topicLen, limit: 10 },
        douyin: { current: topicLen, limit: 5 },
      };
    }
    if (platforms.includes('xiaohongshu')) {
      return {
        xiaohongshu: { current: topicLen, limit: 10 },
        douyin: { current: topicLen, limit: 10 },
      };
    }
    return {
      xiaohongshu: { current: topicLen, limit: 5 },
      douyin: { current: topicLen, limit: 5 },
    };
  }, [editingTopics, selectedAccountIds, accounts]);

  const handlePlatformChange = useCallback(
    (platform: typeof selectedPlatform) => {
      setSelectedPlatform(platform);
    },
    [],
  );

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const queryParams = isExpanded
        ? { page: nextPage, pageSize: 10 }
        : { status: 'ONLINE' as const, page: nextPage, pageSize: 10 };

      const response = await queryClient.fetchQuery(
        accountListQueryOptions(queryParams),
      );

      const newAccounts = dedupeAccountResponses(response.list || []).map(
        mapAccountResponseToAccount,
      );

      setAllAccounts((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        // 同租户跨用户绑定时 id 不同但物理账号相同；用 platform+phone 兜底去重，
        // 避免分页加载下"重复账号"借助新 id 绕过 id 集合。
        const existingPhysical = new Set(
          prev.map((a) => `${a.platform}:${a.phone}`),
        );
        const uniqueNewAccounts = newAccounts.filter((a) => {
          if (existingIds.has(a.id)) return false;
          const physicalKey = `${a.platform}:${a.phone}`;
          if (existingPhysical.has(physicalKey)) return false;
          existingPhysical.add(physicalKey);
          return true;
        });
        return [...prev, ...uniqueNewAccounts];
      });

      setPage(nextPage);
      if (isExpanded) {
        setAccountHasMore(response.hasNext ?? false);
      }
    } catch (err) {
      console.error('加载更多账号失败:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [queryClient, page, isLoadingMore, isExpanded]);

  const handleAccountChange = useCallback(
    (ids: string[]) => {
      const previousDouyinId =
        selectedAccountIds
          .map((id) => accounts.find((a) => a.id === id))
          .find((account) => account?.platform === 'douyin')?.id ?? null;

      if (ids.length === 0) {
        setSelectedAccountIds([]);
        setPublishExtensionInfo(null);
        return;
      }

      const selectedAccounts = ids
        .map((id) => accounts.find((a) => a.id === id))
        .filter(Boolean) as Account[];

      const groupedByPlatform = selectedAccounts.reduce<
        Record<string, Account>
      >((acc, account) => {
        if (!acc[account.platform]) {
          acc[account.platform] = account;
        }
        return acc;
      }, {});

      const deduplicatedIds = Object.values(groupedByPlatform).map((a) => a.id);
      const nextDouyinId =
        deduplicatedIds
          .map((id) => accounts.find((a) => a.id === id))
          .find((account) => account?.platform === 'douyin')?.id ?? null;
      if (previousDouyinId !== nextDouyinId) {
        setPublishExtensionInfo(null);
      }
      setSelectedAccountIds(deduplicatedIds);
    },
    [accounts, selectedAccountIds],
  );

  const handleModeChange = useCallback((mode: string) => {
    setActiveMode(mode as 'VIDEO' | 'IMAGE');
    setVideoFile(undefined);
    setUploadFiles([]);
    setTitleValue('');
    setContentValue('');
    setHashtags([]);
    setCaptionResults([]);
    setSelectedCaptionId(null);
  }, []);

  const handleAIGenerate = useCallback(
    async (userPrompt: string, customSystemPrompt?: string) => {
      if (!userPrompt.trim()) {
        message.warning('请输入内容描述');
        return;
      }

      const targetPlatforms = new Set(
        selectedAccountIds
          .map((id) => accounts.find((a) => a.id === id)?.platform)
          .filter(Boolean) as string[],
      );

      const platform: PlatformCode =
        targetPlatforms.size === 1
          ? ([...targetPlatforms][0] as PlatformCode)
          : 'douyin';

      const finalSystemPrompt =
        customSystemPrompt ||
        selectedTemplate?.defaultPromptByMode?.[activeMode] ||
        null;

      setIsGenerating(true);
      try {
        const result = await aiSuggestions.mutateAsync({
          platform,
          contentMode: activeMode,
          userPrompt,
          systemPrompt: finalSystemPrompt,
          templateCode: selectedTemplate?.id ?? null,
          scope: 'ALL',
          maxVariants: 5,
        });

        if (result.contentSuggestions?.variants) {
          const newCaptionResults: CaptionResult[] =
            result.contentSuggestions.variants.map(
              (v: ContentAiCaptionVariant, index: number) => ({
                id: String(index + 1),
                title: v.title,
                caption: v.caption,
                topicTags: v.topicTags,
                rationale: v.rationale,
              }),
            );
          setCaptionResults(newCaptionResults);
          setSelectedCaptionId(null);
          setIsCaptionExpanded(true);
        }

        message.success('AI生成成功');
      } catch (err) {
        message.error(err instanceof Error ? err.message : '生成失败');
      } finally {
        setIsGenerating(false);
      }
    },
    [accounts, activeMode, aiSuggestions, selectedAccountIds, selectedTemplate],
  );

  const handleReset = useCallback(() => {
    setContentValue('');
    setSelectedTemplate(null);
    setSystemPrompt('');
    setCaptionResults([]);
    setSelectedCaptionId(null);
    setHashtags([]);
  }, []);

  const handleCaptionSelect = useCallback((result: CaptionResult) => {
    setSelectedCaptionId(result.id);
    setEditingCaptionResult(result);
    setEditingTitle(result.title);
    setEditingBody(result.caption);
    setEditingTopics(
      result.topicTags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)),
    );
    setAiPreviewModalOpen(true);
    setIsCaptionExpanded(false);
  }, []);

  const buildDemoProgressRecords = useCallback((): PublishRecord[] => {
    const selectedAccounts = selectedAccountIds
      .map((id) => accounts.find((a) => a.id === id))
      .filter(Boolean) as Account[];
    const extensionExpired =
      !!publishExtensionInfo &&
      Date.now() > new Date(publishExtensionInfo.expiresAt).getTime();

    return selectedAccounts.map((account, index) => {
      if (
        account.platform === 'douyin' &&
        publishExtensionInfo?.accountId === account.id
      ) {
        if (extensionExpired) {
          return {
            id: `prototype-record-${index + 1}`,
            accountName: account.name,
            status: 'failed',
            detail: '商品信息预挂载已过期，抖音提交已阻止',
            extensionStatus: `${EXTENSION_TYPE_LABEL[publishExtensionInfo.type]}｜挂载失败`,
            extensionDetail: publishExtensionInfo.targetName,
          };
        }
        return {
          id: `prototype-record-${index + 1}`,
          accountName: account.name,
          status: 'success',
          detail: '发布成功，商品信息已挂载',
          extensionStatus: `${EXTENSION_TYPE_LABEL[publishExtensionInfo.type]}｜已挂载`,
          extensionDetail: publishExtensionInfo.targetName,
        };
      }

      return {
        id: `prototype-record-${index + 1}`,
        accountName: account.name,
        status: 'success',
        detail:
          account.platform === 'xiaohongshu'
            ? '小红书普通发布成功'
            : '抖音普通发布成功',
        extensionStatus: '无商品信息',
      };
    });
  }, [accounts, publishExtensionInfo, selectedAccountIds]);

  const handlePublish = useCallback(async () => {
    if (!titleValue.trim()) {
      message.error('请输入标题');
      titleInputRef.current?.focus();
      return;
    }

    if (selectedAccountIds.length === 0) {
      message.warning('请选择至少一个账号');
      return;
    }

    const videoMediaAssetId =
      videoFile?.mediaAssetId ??
      (videoFile?.response as { mediaAssetId?: string } | undefined)
        ?.mediaAssetId;

    if (activeMode === 'VIDEO' && !videoMediaAssetId) {
      message.warning('请上传视频素材');
      return;
    }

    if (activeMode === 'IMAGE' && uploadFiles.length === 0) {
      message.warning('请上传图片素材');
      return;
    }

    const imageMediaAssetIdsFromFiles = uploadFiles
      .map(
        (f) =>
          f.mediaAssetId ??
          (f.response as { mediaAssetId?: string } | undefined)?.mediaAssetId,
      )
      .filter(Boolean) as string[];

    if (activeMode === 'IMAGE' && imageMediaAssetIdsFromFiles.length === 0) {
      message.warning('图片素材尚未上传完成，请稍候再试');
      return;
    }

    // 抖音 / 小红书统一 20 字限制；超限走「自动截断 + 二次确认」分支。
    const TITLE_PLATFORM_LIMIT = 20;
    let selectedTitle = titleValue;
    if (selectedTitle.length > TITLE_PLATFORM_LIMIT) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '标题超出平台字数限制',
          content: `标题将自动截断至${TITLE_PLATFORM_LIMIT}字，是否继续？`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirmed) {
        return;
      }
      selectedTitle = selectedTitle.slice(0, TITLE_PLATFORM_LIMIT);
      setTitleValue(selectedTitle);
    }

    const titleByPlatform: Record<string, string> = {};

    const targetPlatforms = new Set(
      selectedAccountIds
        .map((id) => accounts.find((a) => a.id === id)?.platform)
        .filter(Boolean) as string[],
    );

    targetPlatforms.forEach((platform) => {
      titleByPlatform[platform] = selectedTitle;
    });

    const primaryMediaAssetId =
      activeMode === 'VIDEO' ? videoMediaAssetId : undefined;

    const imageMediaAssetIds =
      activeMode === 'IMAGE' ? imageMediaAssetIdsFromFiles : undefined;

    const requestData: PublishSubmitRequest = {
      accountIds: selectedAccountIds,
      contentMode: activeMode,
      caption: contentValue,
      titleByPlatform,
      topicTags: hashtags.map((h) => h.name),
      primaryMediaAssetId,
      imageMediaAssetIds,
    };

    void requestData;
    const records = buildDemoProgressRecords();
    if (records.some((record) => record.status === 'failed')) {
      message.warning('抖音商品信息不可用，对应平台已阻止提交');
    }
    setDemoProgressRecords(records);
    setCurrentJobId(`prototype-job-${Date.now()}`);
    setProgressModalOpen(true);
  }, [
    selectedAccountIds,
    activeMode,
    videoFile,
    uploadFiles,
    contentValue,
    titleValue,
    accounts,
    hashtags,
    buildDemoProgressRecords,
  ]);

  const handleVerifyRequired = useCallback(() => {
    setProgressModalOpen(true);
    message.warning('发布需要二次验证，请完成扫码或输入验证码');
  }, []);

  const handleProgressModalClose = useCallback(() => {
    setProgressModalOpen(false);
    setDemoProgressRecords(undefined);
  }, []);

  const handleBackgroundRun = useCallback(() => {
    setProgressModalOpen(false);
    message.info('有发布任务正在进行中...');
  }, []);

  const handlePublishComplete = useCallback((data: PublishJobProgressData) => {
    setProgressModalOpen(false);
    setResultModalData({
      successCount: data.succeededCount,
      failedAccounts: data.records
        .filter((r) => r.stage === 'FAILED')
        .map((r) => ({
          id: r.recordId,
          accountName: r.accountNickname ?? '未知账号',
          reason: r.message ?? '发布失败',
        })),
    });
  }, []);

  const handleAIPreviewCancel = useCallback(() => {
    setAiPreviewModalOpen(false);
    setEditingCaptionResult(null);
    setEditingTitle('');
    setEditingBody('');
    setEditingTopics([]);
  }, []);

  const handleAIPreviewApply = useCallback(() => {
    const newHashtags: Hashtag[] = editingTopics.map((topic, index) => ({
      id: `ai-${Date.now()}-${index}`,
      name: topic,
    }));
    setHashtags(newHashtags);
    setTitleValue(editingTitle);
    setContentValue(editingBody);
    if (editingCaptionResult) {
      setCaptionResults((prev) =>
        prev.map((r) =>
          r.id === editingCaptionResult.id
            ? {
                ...r,
                title: editingTitle,
                caption: editingBody,
                topicTags: editingTopics,
              }
            : r,
        ),
      );
      setSelectedCaptionId(editingCaptionResult.id);
    }
    setAiPreviewModalOpen(false);
    setEditingCaptionResult(null);
    setEditingTitle('');
    setEditingBody('');
    setEditingTopics([]);
  }, [editingCaptionResult, editingTitle, editingBody, editingTopics]);

  return (
    <div className={styles.container} data-testid="content-page">
      <PageHeader
        title="内容发布"
        toolbar={
          <Button
            type="default"
            className={styles.btnHistory}
            onClick={() => navigate('/content/history')}
          >
            历史发布
          </Button>
        }
      >
        {hasActiveJob && (
          <PublishStatusToast
            message="有发布任务正在进行中..."
            onLinkClick={() => navigate('/content/history')}
          />
        )}
      </PageHeader>

      <div className={styles.main}>
        <div className={styles.mainLeft}>
          <TabBar
            tabs={CONTENT_TABS}
            activeTab={activeMode}
            onChange={handleModeChange}
          />
          {activeMode === 'VIDEO' && (
            <VideoUpload
              value={videoFile ? [videoFile] : []}
              onChange={(files) => setVideoFile(files[0])}
              maxFileSize={500}
              minDuration={4}
              maxDuration={
                selectedAccountIds.some(
                  (id) =>
                    accounts.find((a) => a.id === id)?.platform ===
                    'xiaohongshu',
                )
                  ? 300
                  : 900
              }
              onDurationError={(_file, duration, constraint) => {
                if (constraint.min && duration < constraint.min) {
                  message.error('视频时长不符合要求（4秒-15分钟）');
                } else if (constraint.max && duration > constraint.max) {
                  const minutes = Math.floor(constraint.max / 60);
                  message.error(`视频时长超过${minutes}分钟`);
                }
              }}
              acceptedRatios={
                selectedAccountIds.some(
                  (id) =>
                    accounts.find((a) => a.id === id)?.platform ===
                    'xiaohongshu',
                )
                  ? ['3:4', '9:16']
                  : ['9:16', '16:9']
              }
              onRatioError={(_file, actualRatio, acceptedRatios) => {
                message.error(
                  `视频比例 ${actualRatio} 不符合要求（${acceptedRatios.join('或')}）`,
                );
              }}
              uploadController={videoUploadController}
            />
          )}
          {activeMode === 'IMAGE' && (
            <ImageUpload
              value={uploadFiles}
              onChange={setUploadFiles}
              maxCount={imageMaxCount}
              maxFileSize={200}
              uploadController={imageUploadController}
            />
          )}
          <ContentEdit
            templates={templates}
            value={contentValue}
            onChange={setContentValue}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            onGenerate={handleAIGenerate}
            onReset={handleReset}
            isGenerating={isGenerating}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            titleValue={titleValue}
            onTitleChange={setTitleValue}
            titleCount={formTitleCount}
            titleInputRef={titleInputRef}
          />
          <AIResults
            captionResults={captionResults}
            selectedCaptionId={selectedCaptionId}
            onCaptionSelect={handleCaptionSelect}
            hashtags={hashtags}
            maxHashtags={maxHashtags}
            onHashtagAdd={() => {
              if (hashtags.length >= maxHashtags) return;
              const newTag = { id: String(Date.now()), name: '#话题' };
              setHashtags([...hashtags, newTag]);
            }}
            onHashtagRemove={(tag) => {
              setHashtags(hashtags.filter((t) => t.id !== tag.id));
            }}
            onHashtagChange={(tag, newName) => {
              setHashtags(
                hashtags.map((t) =>
                  t.id === tag.id ? { ...t, name: newName } : t,
                ),
              );
            }}
            isCaptionExpanded={isCaptionExpanded}
            onCaptionToggleExpand={() =>
              setIsCaptionExpanded(!isCaptionExpanded)
            }
          />
          <PublishExtension
            accounts={accounts}
            selectedAccountIds={selectedAccountIds}
            hasMaterial={hasMaterial}
            value={publishExtensionInfo}
            onChange={setPublishExtensionInfo}
            onReset={() => setPublishExtensionInfo(null)}
          />
        </div>
        <div className={styles.mainRight}>
          <PublishConfig
            selectedPlatform={selectedPlatform}
            onPlatformChange={handlePlatformChange}
            accounts={displayedAccounts}
            selectedAccountIds={selectedAccountIds}
            onAccountChange={handleAccountChange}
            hasMore={hasMore}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>

      <BottomActionBar
        disabled={hasActiveJob || submitPublish.isPending}
        loading={submitPublish.isPending}
        onConfirm={handlePublish}
        toolbar={
          <Space size={12}>
            <Button
              className={styles.btnCancel}
              onClick={() => {
                setActiveMode('IMAGE');
                setContentValue('');
                setSelectedTemplate(null);
                setCaptionResults([]);
                setSelectedCaptionId(null);
                setHashtags([]);
                setVideoFile(undefined);
                setUploadFiles([]);
                setSelectedAccountIds([]);
                setPublishExtensionInfo(null);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              className={styles.btnConfirm}
              disabled={hasActiveJob}
              loading={submitPublish.isPending}
              onClick={handlePublish}
            >
              {hasActiveJob ? '有发布任务进行中' : '确认发布'}
            </Button>
          </Space>
        }
      />

      <PublishProgressModal
        open={progressModalOpen}
        jobId={currentJobId}
        onClose={handleProgressModalClose}
        onBackgroundRun={handleBackgroundRun}
        onVerifyRequired={handleVerifyRequired}
        onComplete={handlePublishComplete}
        demoRecords={demoProgressRecords}
      />

      {resultModalData && (
        <PublishResultModal
          open={true}
          successCount={resultModalData.successCount}
          failedAccounts={resultModalData.failedAccounts}
          onClose={() => setResultModalData(null)}
          onViewHistory={() => navigate('/content/history')}
          onContinuePublish={() => setResultModalData(null)}
        />
      )}

      <AIContentPreviewModal
        open={aiPreviewModalOpen}
        contentType={activeMode}
        title={editingTitle}
        titleCount={titleCount}
        body={editingBody}
        bodyCount={bodyCount}
        topics={editingTopics}
        topicCount={topicCount}
        onTitleChange={setEditingTitle}
        onBodyChange={setEditingBody}
        onTopicsChange={setEditingTopics}
        onCancel={handleAIPreviewCancel}
        onApply={handleAIPreviewApply}
      />
    </div>
  );
};

export default Content;
