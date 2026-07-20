/** 与后端 GenerationWorkSummaryResponse.status 对齐 */
export type WorkStatus = 'processing' | 'completed' | 'failed';

export type WorkItem = {
  id: string;
  type: '视频' | '图文';
  title: string;
  date: string;
  params: string;
  credits: number;
  remainingHours: number;
  thumbnail: 'video' | 'image';
  expiringSoon?: boolean;
  status?: WorkStatus;
  failureReason?: string;
  thumbnailUrl?: string;
  /** 视频 mp4 直链；用于下载按钮（24h 过期）。「去发布」入口不再使用此字段。 */
  videoUrl?: string;
  /** 图文产物图片直链；用于详情弹窗预览（24h 过期）。「去发布」入口不再使用此字段。 */
  imageUrl?: string;
  /** 图文生成完成后的整段文案；去发布时预填内容描述 */
  content?: string;
  /**
   * 提交时原始 SubmitVideoGenerationRequest / SubmitImageGenerationRequest JSON 字符串。
   * 「重新生成」回填表单使用；未持久化原始入参时为 undefined。
   */
  paramsRaw?: string;
  /**
   * 图文任务的「配图数量」（提交时 imageCount）：0=纯文案，1=含 1 张配图。
   * 视频任务恒为 undefined。「去发布」决策：0 时允许纯文案发布、不强制 mediaAssetIds；
   * >=1 时必须有 imageMediaAssetIds 才能跳转发布页。
   */
  imageCount?: number;
  /**
   * 已 ingest 的视频本地 mediaAssetId（视频任务通常只产一个）。
   * 由 OpenSpec change `content-generation-publish-bridge` 引入：
   * 「去发布」入口拿这个 id 走发布链路；undefined 时禁用按钮 + 提示「素材尚未就绪」。
   *
   * 类型为 string：后端 Jackson 全局把 Long 序列化成字符串（防 JS Number 失精度）。
   */
  videoMediaAssetId?: string;
  /** 已 ingest 的图文配图 mediaAssetId 列表（过滤 null 失败位）。undefined 同 videoMediaAssetId。 */
  imageMediaAssetIds?: string[];
  /** 与 mediaAssetIds 配套的本系统预览路径。 */
  previewUrls?: string[];
  /**
   * 作品归属用户 id（generation_log.user_id）。
   * 由 OpenSpec change `content-generation-my-works-data-isolation` 引入。
   * 仅 TENANT_ADMIN 视角下用于渲染「由 XX 创建」；NORMAL_ADMIN 视角恒等当前用户。
   */
  ownerUserId?: string;
  /** 作品归属用户的展示名；缺失时后端回退为 `—`。 */
  ownerName?: string;
};
